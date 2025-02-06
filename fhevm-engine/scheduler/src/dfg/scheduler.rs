use crate::dfg::{types::*, OpEdge, OpNode, THREAD_POOL};
use anyhow::Result;
use daggy::{
    petgraph::{
        csr::IndexType,
        graph::node_index,
        visit::{
            EdgeRef, IntoEdgeReferences, IntoEdgesDirected, IntoNeighbors, VisitMap, Visitable,
        },
        Direction,
        Direction::Incoming,
    },
    Dag, NodeIndex,
};
use fhevm_engine_common::{
    common::FheOperation, tfhe_ops::perform_fhe_operation, types::SupportedFheCiphertexts,
};
use rayon::prelude::*;
use std::{
    borrow::Borrow,
    collections::HashMap,
    sync::{atomic::AtomicUsize, mpsc::channel},
};
use tokio::task::JoinSet;

struct ExecNode {
    df_nodes: Vec<NodeIndex>,
    dependence_counter: AtomicUsize,
}

pub enum PartitionStrategy {
    MaxParallelism,
    MaxLocality,
}

impl std::fmt::Debug for ExecNode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.df_nodes.is_empty() {
            write!(f, "Vec [ ]")
        } else {
            let _ = write!(f, "Vec [ ");
            for i in self.df_nodes.iter() {
                let _ = write!(f, "{}, ", i.index());
            }
            write!(f, "] - dependences: {:?}", self.dependence_counter)
        }
    }
}

pub struct Scheduler<'a> {
    graph: &'a mut Dag<OpNode, OpEdge>,
    edges: Dag<(), OpEdge>,
    rayon_threads: usize,
}

impl<'a> Scheduler<'a> {
    fn is_ready(node: &OpNode) -> bool {
        let mut ready = true;
        for i in node.inputs.iter() {
            if let DFGTaskInput::Dependence(_) = i {
                ready = false;
            }
        }
        ready
    }
    fn is_ready_task(&self, node: &ExecNode) -> bool {
        node.dependence_counter
            .load(std::sync::atomic::Ordering::SeqCst)
            == 0
    }
    pub fn new(graph: &'a mut Dag<OpNode, OpEdge>, rayon_threads: usize) -> Self {
        let edges = graph.map(|_, _| (), |_, edge| *edge);
        Self {
            graph,
            edges,
            rayon_threads,
        }
    }

    pub async fn schedule(&mut self, server_key: tfhe::ServerKey) -> Result<()> {
        let schedule_type = std::env::var("FHEVM_DF_SCHEDULE");
        match schedule_type {
            Ok(val) => match val.as_str() {
                "MAX_PARALLELISM" => {
                    self.schedule_coarse_grain(PartitionStrategy::MaxParallelism, server_key)
                        .await
                }
                "MAX_LOCALITY" => {
                    self.schedule_coarse_grain(PartitionStrategy::MaxLocality, server_key)
                        .await
                }
                "LOOP" => self.schedule_component_loop(server_key).await,
                "FINE_GRAIN" => self.schedule_fine_grain(server_key).await,
                unhandled => panic!("Scheduling strategy {:?} does not exist", unhandled),
            },
            _ => self.schedule_component_loop(server_key).await,
        }
    }

    async fn schedule_fine_grain(&mut self, server_key: tfhe::ServerKey) -> Result<()> {
        let mut set: JoinSet<(usize, Result<(SupportedFheCiphertexts, i16, Vec<u8>)>)> =
            JoinSet::new();
        tfhe::set_server_key(server_key.clone());
        // Prime the scheduler with all nodes without dependences
        for idx in 0..self.graph.node_count() {
            let sks = server_key.clone();
            let index = NodeIndex::new(idx);
            let node = self.graph.node_weight_mut(index).unwrap();
            if Self::is_ready(node) {
                let opcode = node.opcode;
                let inputs: Result<Vec<SupportedFheCiphertexts>> = node
                    .inputs
                    .iter()
                    .map(|i| match i {
                        DFGTaskInput::Value(i) => Ok(i.clone()),
                        DFGTaskInput::Compressed((t, c)) => {
                            SupportedFheCiphertexts::decompress(*t, c)
                        }
                        _ => Err(SchedulerError::UnsatisfiedDependence.into()),
                    })
                    .collect();
                set.spawn_blocking(move || {
                    tfhe::set_server_key(sks.clone());
                    run_computation(opcode, inputs, idx)
                });
            }
        }
        // Get results from computations and update dependences of remaining computations
        while let Some(result) = set.join_next().await {
            let result = result?;
            let index = result.0;
            let node_index = NodeIndex::new(index);
            if let Ok(output) = &result.1 {
                // Satisfy deps from the executed task
                for edge in self.edges.edges_directed(node_index, Direction::Outgoing) {
                    let sks = server_key.clone();
                    let child_index = edge.target();
                    let child_node = self.graph.node_weight_mut(child_index).unwrap();
                    child_node.inputs[*edge.weight() as usize] =
                        DFGTaskInput::Value(output.0.clone());
                    if Self::is_ready(child_node) {
                        let opcode = child_node.opcode;
                        let inputs: Result<Vec<SupportedFheCiphertexts>> = child_node
                            .inputs
                            .iter()
                            .map(|i| match i {
                                DFGTaskInput::Value(i) => Ok(i.clone()),
                                DFGTaskInput::Compressed((t, c)) => {
                                    SupportedFheCiphertexts::decompress(*t, c)
                                }
                                _ => Err(SchedulerError::UnsatisfiedDependence.into()),
                            })
                            .collect();
                        set.spawn_blocking(move || {
                            tfhe::set_server_key(sks.clone());
                            run_computation(opcode, inputs, child_index.index())
                        });
                    }
                }
            }
            let node_index = NodeIndex::new(result.0);
            self.graph[node_index].result = Some(result.1);
        }
        Ok(())
    }

    async fn schedule_coarse_grain(
        &mut self,
        strategy: PartitionStrategy,
        server_key: tfhe::ServerKey,
    ) -> Result<()> {
        tfhe::set_server_key(server_key.clone());
        let mut set: JoinSet<(
            Vec<(usize, Result<(SupportedFheCiphertexts, i16, Vec<u8>)>)>,
            NodeIndex,
        )> = JoinSet::new();
        let mut execution_graph: Dag<ExecNode, ()> = Dag::default();
        let _ = match strategy {
            PartitionStrategy::MaxLocality => {
                partition_components(self.graph, &mut execution_graph)
            }
            PartitionStrategy::MaxParallelism => {
                partition_preserving_parallelism(self.graph, &mut execution_graph)
            }
        };
        let task_dependences = execution_graph.map(|_, _| (), |_, edge| *edge);

        // Prime the scheduler with all nodes without dependences
        for idx in 0..execution_graph.node_count() {
            let sks = server_key.clone();
            let index = NodeIndex::new(idx);
            let node = execution_graph.node_weight_mut(index).unwrap();
            if self.is_ready_task(node) {
                let mut args = Vec::with_capacity(node.df_nodes.len());
                for nidx in node.df_nodes.iter() {
                    let n = self.graph.node_weight_mut(*nidx).unwrap();
                    let opcode = n.opcode;
                    args.push((opcode, std::mem::take(&mut n.inputs), *nidx));
                }
                let rayon_threads = self.rayon_threads;
                set.spawn_blocking(move || {
                    tfhe::set_server_key(sks.clone());
                    execute_partition(args, index, false, rayon_threads, sks)
                });
            }
        }
        // Get results from computations and update dependences of remaining computations
        while let Some(result) = set.join_next().await {
            let mut result = result?;
            let task_index = result.1;
            while let Some(o) = result.0.pop() {
                let index = o.0;
                let node_index = NodeIndex::new(index);
                // If this node result is an error, we can't satisfy
                // any dependences with it, so skip - all dependences
                // on this will remain unsatisfied and result in
                // further errors.
                if o.1.is_ok() {
                    // Satisfy deps from the executed computation in the DFG
                    for edge in self.edges.edges_directed(node_index, Direction::Outgoing) {
                        let child_index = edge.target();
                        let child_node = self.graph.node_weight_mut(child_index).unwrap();
                        if !child_node.inputs.is_empty() {
                            // Here cannot be an error
                            child_node.inputs[*edge.weight() as usize] =
                                DFGTaskInput::Value(o.1.as_ref().unwrap().0.clone());
                        }
                    }
                }
                self.graph[node_index].result = Some(o.1);
            }
            for edge in task_dependences.edges_directed(task_index, Direction::Outgoing) {
                let sks = server_key.clone();
                let dependent_task_index = edge.target();
                let dependent_task = execution_graph
                    .node_weight_mut(dependent_task_index)
                    .unwrap();
                dependent_task
                    .dependence_counter
                    .fetch_sub(1, std::sync::atomic::Ordering::SeqCst);
                if self.is_ready_task(dependent_task) {
                    let mut args = Vec::with_capacity(dependent_task.df_nodes.len());
                    for nidx in dependent_task.df_nodes.iter() {
                        let n = self.graph.node_weight_mut(*nidx).unwrap();
                        let opcode = n.opcode;
                        args.push((opcode, std::mem::take(&mut n.inputs), *nidx));
                    }
                    let rayon_threads = self.rayon_threads;
                    set.spawn_blocking(move || {
                        tfhe::set_server_key(sks.clone());
                        execute_partition(args, dependent_task_index, false, rayon_threads, sks)
                    });
                }
            }
        }
        Ok(())
    }

    async fn schedule_component_loop(&mut self, server_key: tfhe::ServerKey) -> Result<()> {
        let mut execution_graph: Dag<ExecNode, ()> = Dag::default();
        let _ = partition_components(self.graph, &mut execution_graph);
        let mut comps = vec![];

        // Prime the scheduler with all nodes without dependences
        for idx in 0..execution_graph.node_count() {
            let index = NodeIndex::new(idx);
            let node = execution_graph.node_weight_mut(index).unwrap();
            if self.is_ready_task(node) {
                let mut args = Vec::with_capacity(node.df_nodes.len());
                for nidx in node.df_nodes.iter() {
                    let n = self.graph.node_weight_mut(*nidx).unwrap();
                    let opcode = n.opcode;
                    args.push((opcode, std::mem::take(&mut n.inputs), *nidx));
                }
                comps.push((std::mem::take(&mut args), index));
            }
        }

        let (src, dest) = channel();
        let rayon_threads = self.rayon_threads;

        tokio::task::spawn_blocking(move || {
            rayon::broadcast(|_| {
                tfhe::set_server_key(server_key.clone());
            });

            tfhe::set_server_key(server_key.clone());
            comps.par_iter().for_each_with(src, |src, (args, index)| {
                src.send(execute_partition(
                    args.to_vec(),
                    *index,
                    true,
                    rayon_threads,
                    server_key.clone(),
                ))
                .unwrap();
            });
        })
        .await?;

        let results: Vec<_> = dest.iter().collect();
        for mut result in results {
            while let Some(o) = result.0.pop() {
                let index = o.0;
                let node_index = NodeIndex::new(index);
                self.graph[node_index].result = Some(o.1);
            }
        }
        Ok(())
    }
}

fn add_execution_depedences(
    graph: &Dag<OpNode, OpEdge>,
    execution_graph: &mut Dag<ExecNode, ()>,
    node_map: HashMap<NodeIndex, NodeIndex>,
) -> Result<()> {
    // Once the DFG is partitioned, we need to add dependences as
    // edges in the execution graph
    for edge in graph.edge_references() {
        let (xsrc, xdst) = (
            node_map
                .get(&edge.source())
                .ok_or(SchedulerError::DataflowGraphError)?,
            node_map
                .get(&edge.target())
                .ok_or(SchedulerError::DataflowGraphError)?,
        );
        if xsrc != xdst && execution_graph.find_edge(*xsrc, *xdst).is_none() {
            let _ = execution_graph.add_edge(*xsrc, *xdst, ());
        }
    }
    for node in 0..execution_graph.node_count() {
        let deps = execution_graph
            .edges_directed(node_index(node), Incoming)
            .count();
        execution_graph[node_index(node)]
            .dependence_counter
            .store(deps, std::sync::atomic::Ordering::SeqCst);
    }
    Ok(())
}

fn partition_preserving_parallelism(
    graph: &Dag<OpNode, OpEdge>,
    execution_graph: &mut Dag<ExecNode, ()>,
) -> Result<()> {
    // First sort the DAG in a schedulable order
    let ts = daggy::petgraph::algo::toposort(graph, None)
        .map_err(|_| SchedulerError::CyclicDependence)?;
    let mut vis = graph.visit_map();
    let mut node_map = HashMap::new();
    // Traverse the DAG and build a graph of connected components
    // without siblings (i.e. without parallelism)
    for nidx in ts.iter() {
        if !vis.is_visited(nidx) {
            vis.visit(*nidx);
            let mut df_nodes = vec![*nidx];
            let mut stack = vec![*nidx];
            while let Some(n) = stack.pop() {
                if graph.edges_directed(n, Direction::Outgoing).count() == 1 {
                    for child in graph.neighbors(n) {
                        if !vis.is_visited(&child.index())
                            && graph.edges_directed(child, Direction::Incoming).count() == 1
                        {
                            df_nodes.push(child);
                            stack.push(child);
                            vis.visit(child.index());
                        }
                    }
                }
            }
            let ex_node = execution_graph.add_node(ExecNode {
                df_nodes: vec![],
                dependence_counter: AtomicUsize::new(usize::MAX),
            });
            for n in df_nodes.iter() {
                node_map.insert(*n, ex_node);
            }
            execution_graph[ex_node].df_nodes = df_nodes;
        }
    }
    add_execution_depedences(graph, execution_graph, node_map)
}

fn partition_components(
    graph: &Dag<OpNode, OpEdge>,
    execution_graph: &mut Dag<ExecNode, ()>,
) -> Result<()> {
    // First sort the DAG in a schedulable order
    let ts = daggy::petgraph::algo::toposort(graph, None)
        .map_err(|_| SchedulerError::CyclicDependence)?;
    let tsmap: HashMap<&NodeIndex, usize> = ts.iter().enumerate().map(|(c, x)| (x, c)).collect();
    let mut vis = graph.visit_map();
    // Traverse the DAG and build a graph of the connected components
    for nidx in ts.iter() {
        if !vis.is_visited(nidx) {
            vis.visit(*nidx);
            let mut df_nodes = vec![*nidx];
            let mut stack = vec![*nidx];
            // DFS from the entry point undirected to gather all nodes
            // in the component
            while let Some(n) = stack.pop() {
                for neighbor in graph.graph().neighbors_undirected(n) {
                    if !vis.is_visited(&neighbor) {
                        df_nodes.push(neighbor);
                        stack.push(neighbor);
                        vis.visit(neighbor);
                    }
                }
            }
            // Apply topsort to component nodes
            df_nodes.sort_by_key(|x| tsmap.get(x).unwrap());
            execution_graph
                .add_node(ExecNode {
                    df_nodes,
                    dependence_counter: AtomicUsize::new(0),
                })
                .index();
        }
    }
    // As this partition is made by coalescing all connected
    // components within the DFG, there are no dependences (edges) to
    // add to the execution graph.
    Ok(())
}

fn execute_partition(
    computations: Vec<(i32, Vec<DFGTaskInput>, NodeIndex)>,
    task_id: NodeIndex,
    use_global_threadpool: bool,
    rayon_threads: usize,
    server_key: tfhe::ServerKey,
) -> (
    Vec<(usize, Result<(SupportedFheCiphertexts, i16, Vec<u8>)>)>,
    NodeIndex,
) {
    let mut res: HashMap<usize, Result<(SupportedFheCiphertexts, i16, Vec<u8>)>> =
        HashMap::with_capacity(computations.len());
    'comps: for (opcode, inputs, nidx) in computations {
        let mut cts = Vec::with_capacity(inputs.len());
        for i in inputs.iter() {
            match i {
                DFGTaskInput::Dependence(d) => {
                    if let Some(d) = d {
                        if let Some(Ok(ct)) = res.get(d) {
                            cts.push(ct.0.clone());
                        } else {
                            res.insert(
                                nidx.index(),
                                Err(SchedulerError::UnsatisfiedDependence.into()),
                            );
                            continue 'comps;
                        }
                    }
                }
                DFGTaskInput::Value(v) => {
                    cts.push(v.clone());
                }
                DFGTaskInput::Compressed((t, c)) => {
                    let decomp = SupportedFheCiphertexts::decompress(*t, c);
                    if let Ok(decomp) = decomp {
                        cts.push(decomp);
                    } else {
                        res.insert(nidx.index(), Err(decomp.err().unwrap()));
                        continue 'comps;
                    }
                }
            }
        }
        if use_global_threadpool {
            let (node_index, result) = run_computation(opcode, Ok(cts), nidx.index());
            res.insert(node_index, result);
        } else {
            let thread_pool = THREAD_POOL
                .borrow()
                .take()
                .or_else(|| {
                    Some(
                        rayon::ThreadPoolBuilder::new()
                            .num_threads(rayon_threads)
                            .build()
                            .unwrap(),
                    )
                })
                .unwrap();
            thread_pool.broadcast(|_| {
                tfhe::set_server_key(server_key.clone());
            });
            let _ = thread_pool.install(|| -> Result<()> {
                let (node_index, result) = run_computation(opcode, Ok(cts), nidx.index());
                res.insert(node_index, result);
                Ok(())
            });
            THREAD_POOL.set(Some(thread_pool));
        }
    }
    (Vec::from_iter(res), task_id)
}

fn run_computation(
    operation: i32,
    inputs: Result<Vec<SupportedFheCiphertexts>>,
    graph_node_index: usize,
) -> (usize, Result<(SupportedFheCiphertexts, i16, Vec<u8>)>) {
    let op = FheOperation::try_from(operation);
    match inputs {
        Ok(inputs) => match op {
            Ok(FheOperation::FheGetCiphertext) => {
                let (ct_type, ct_bytes) = inputs[0].compress();
                (graph_node_index, Ok((inputs[0].clone(), ct_type, ct_bytes)))
            }
            Ok(_) => match perform_fhe_operation(operation as i16, &inputs) {
                Ok(result) => {
                    let (ct_type, ct_bytes) = result.compress();
                    (graph_node_index, Ok((result.clone(), ct_type, ct_bytes)))
                }
                Err(e) => (graph_node_index, Err(e.into())),
            },
            _ => (
                graph_node_index,
                Err(SchedulerError::UnknownOperation(operation).into()),
            ),
        },
        Err(_) => (graph_node_index, Err(SchedulerError::InvalidInputs.into())),
    }
}
