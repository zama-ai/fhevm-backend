use foundry_compilers::{Project, ProjectPathsConfig};
use foundry_compilers_artifacts::Remapping;
use std::path::Path;
fn main() {
    println!("cargo::warning=build.rs run ...");
    // Use a specific version due to an issue with libc and libstdc++ in the rust Docker image we use to run it.
    let solc = Solc::find_or_install(&Version::new(0, 8, 28)).unwrap();

    // Get the manifest directory (where Cargo.toml is)
    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));

    // Path to the specific file you want to compile
    let source_dir = Path::new(&manifest_dir).join("contracts");

    // Configure the project paths
    let paths = ProjectPathsConfig::builder()
        .root(manifest_dir) // Root of the project
        .sources(source_dir.clone()) // Only compile this specific file
        // .remapping(
        //     // Add a remapping so the import can resolve FheType.sol
        //     Remapping {
        //         context: None,
        //         name: "FheType.sol".to_string(),
        //         path: normalized_path,
        //     },
        // )
        .build()
        .unwrap();

    // Build the project
    let project = Project::builder()
        .paths(paths)
        .build(
            MultiCompiler::new(Some(SolcCompiler::Specific(solc)), None)
                .unwrap(),
        )
        .unwrap();

    let output = project.compile().unwrap();
    if output.has_compiler_errors() {
        eprintln!("{output}");
    }
    assert!(!output.has_compiler_errors());

    // Rerun if the specific source file changes
    println!("cargo:rerun-if-changed={}", source_dir.display());
}
