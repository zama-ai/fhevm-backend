use std::{cell::Cell, collections::HashMap, error::Error, sync::Arc};

use common::FheOperation;
use executor::{
    fhevm_executor_server::{FhevmExecutor, FhevmExecutorServer},
    sync_compute_response::Resp,
    sync_input::Input,
    Ciphertext, ResultCiphertexts, SyncComputation, SyncComputeError, SyncComputeRequest,
    SyncComputeResponse, SyncInput,
};
use fhevm_engine_common::{
    keys::{FhevmKeys, SerializedFhevmKeys},
    tfhe_ops::{current_ciphertext_version, perform_fhe_operation, try_expand_ciphertext_list},
    types::{FhevmError, Handle, SupportedFheCiphertexts, HANDLE_LEN, SCALAR_LEN},
};
use sha3::{Digest, Keccak256};
use tfhe::{integer::U256, set_server_key};
use tokio::task::spawn_blocking;
use tonic::{transport::Server, Code, Request, Response, Status};

pub mod common {
    tonic::include_proto!("fhevm.common");
}

pub mod executor {
    tonic::include_proto!("fhevm.executor");
}

pub fn start(args: &crate::cli::Args) -> Result<(), Box<dyn Error>> {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(args.tokio_threads)
        .max_blocking_threads(args.fhe_compute_threads)
        .enable_all()
        .build()?;

    let executor = FhevmExecutorService::new();
    let addr = args.server_addr.parse().expect("server address");

    runtime.block_on(async {
        Server::builder()
            .add_service(FhevmExecutorServer::new(executor))
            .serve(addr)
            .await?;
        Ok::<(), Box<dyn Error>>(())
    })?;
    Ok(())
}

struct InMemoryCiphertext {
    expanded: SupportedFheCiphertexts,
    compressed: Vec<u8>,
}

#[derive(Default)]
struct ComputationState {
    ciphertexts: HashMap<Handle, InMemoryCiphertext>,
}

struct FhevmExecutorService {
    keys: Arc<FhevmKeys>,
}

#[tonic::async_trait]
impl FhevmExecutor for FhevmExecutorService {
    async fn sync_compute(
        &self,
        req: Request<SyncComputeRequest>,
    ) -> Result<Response<SyncComputeResponse>, Status> {
        let keys = self.keys.clone();
        let resp = spawn_blocking(move || {
            // Make sure we only clone the server key if needed.
            thread_local! {
                static SERVER_KEY_IS_SET: Cell<bool> = Cell::new(false);
            }
            if !SERVER_KEY_IS_SET.get() {
                set_server_key(keys.server_key.clone());
                SERVER_KEY_IS_SET.set(true);
            }

            // Exapnd inputs that are global to the whole request.
            let req = req.get_ref();
            let mut state = ComputationState::default();
            if Self::expand_inputs(&req.input_lists, &keys, &mut state).is_err() {
                return SyncComputeResponse {
                    resp: Some(Resp::Error(SyncComputeError::BadInputList.into())),
                };
            }

            // Execute all computations.
            let mut result_cts = Vec::new();
            for computation in &req.computations {
                let outcome = Self::process_computation(computation, &mut state);
                // Either all succeed or we return on the first failure.
                match outcome {
                    Ok(cts) => result_cts.extend(cts),
                    Err(e) => {
                        return SyncComputeResponse {
                            resp: Some(Resp::Error(e.into())),
                        };
                    }
                }
            }
            SyncComputeResponse {
                resp: Some(Resp::ResultCiphertexts(ResultCiphertexts {
                    ciphertexts: result_cts,
                })),
            }
        })
        .await;
        match resp {
            Ok(resp) => Ok(Response::new(resp)),
            Err(_) => Err(Status::new(
                Code::Unknown,
                "failed to execute computation via spawn_blocking",
            )),
        }
    }
}

impl FhevmExecutorService {
    fn new() -> Self {
        FhevmExecutorService {
            keys: Arc::new(SerializedFhevmKeys::load_from_disk().into()),
        }
    }

    fn process_computation(
        comp: &SyncComputation,
        state: &mut ComputationState,
    ) -> Result<Vec<Ciphertext>, SyncComputeError> {
        // For now, assume only one result handle.
        let result_handle = comp
            .result_handles
            .first()
            .filter(|h| h.len() == HANDLE_LEN)
            .ok_or_else(|| SyncComputeError::BadResultHandles)?
            .clone();
        let op = FheOperation::try_from(comp.operation);
        match op {
            Ok(FheOperation::FheGetCiphertext) => {
                Self::get_ciphertext(comp, &result_handle, &state)
            }
            Ok(_) => Self::compute(comp, result_handle, state),
            _ => Err(SyncComputeError::InvalidOperation),
        }
    }

    fn expand_inputs(
        lists: &Vec<Vec<u8>>,
        keys: &FhevmKeys,
        state: &mut ComputationState,
    ) -> Result<(), FhevmError> {
        for list in lists {
            let cts = try_expand_ciphertext_list(&list, &keys.server_key)?;
            let list_hash: Handle = Keccak256::digest(list).to_vec();
            for (i, ct) in cts.iter().enumerate() {
                let mut handle = list_hash.clone();
                handle[29] = i as u8;
                handle[30] = ct.type_num() as u8;
                handle[31] = current_ciphertext_version() as u8;
                state.ciphertexts.insert(
                    handle,
                    InMemoryCiphertext {
                        expanded: ct.clone(),
                        compressed: ct.clone().compress(),
                    },
                );
            }
        }
        Ok(())
    }

    fn get_ciphertext(
        comp: &SyncComputation,
        result_handle: &Handle,
        state: &ComputationState,
    ) -> Result<Vec<Ciphertext>, SyncComputeError> {
        match (comp.inputs.first(), comp.inputs.len()) {
            (
                Some(SyncInput {
                    input: Some(Input::InputHandle(handle)),
                }),
                1,
            ) => {
                if let Some(in_mem_ciphertext) = state.ciphertexts.get(handle) {
                    if *handle != *result_handle {
                        Err(SyncComputeError::BadInputs)
                    } else {
                        Ok(vec![Ciphertext {
                            handle: result_handle.to_vec(),
                            ciphertext: in_mem_ciphertext.compressed.clone(),
                        }])
                    }
                } else {
                    Err(SyncComputeError::UnknownHandle)
                }
            }
            _ => Err(SyncComputeError::BadInputs),
        }
    }

    fn compute(
        comp: &SyncComputation,
        result_handle: Handle,
        state: &mut ComputationState,
    ) -> Result<Vec<Ciphertext>, SyncComputeError> {
        // Collect computation inputs.
        let inputs: Result<Vec<SupportedFheCiphertexts>, Box<dyn Error>> = comp
            .inputs
            .iter()
            .map(|sync_input| match &sync_input.input {
                Some(input) => match input {
                    Input::Ciphertext(c) if c.handle.len() == HANDLE_LEN => {
                        let ct_type = c.handle[30] as i16;
                        Ok(SupportedFheCiphertexts::decompress(ct_type, &c.ciphertext)?)
                    }
                    Input::InputHandle(h) => {
                        let ct = state.ciphertexts.get(h).ok_or(FhevmError::BadInputs)?;
                        Ok(ct.expanded.clone())
                    }
                    Input::Scalar(s) if s.len() == SCALAR_LEN => {
                        let mut scalar = U256::default();
                        scalar.copy_from_be_byte_slice(&s);
                        Ok(SupportedFheCiphertexts::Scalar(scalar))
                    }
                    _ => Err(FhevmError::BadInputs.into()),
                },
                None => Err(FhevmError::BadInputs.into()),
            })
            .collect();

        // Do the computation on the inputs.
        match inputs {
            Ok(inputs) => match perform_fhe_operation(comp.operation as i16, &inputs) {
                Ok(result) => {
                    let compressed = result.clone().compress();
                    state.ciphertexts.insert(
                        result_handle.clone(),
                        InMemoryCiphertext {
                            expanded: result,
                            compressed: compressed.clone(),
                        },
                    );
                    Ok(vec![Ciphertext {
                        handle: result_handle,
                        ciphertext: compressed,
                    }])
                }
                Err(_) => Err(SyncComputeError::ComputationFailed),
            },
            Err(_) => Err(SyncComputeError::BadInputs),
        }
    }
}
