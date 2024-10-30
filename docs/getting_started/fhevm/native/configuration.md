# Configuration

At the time of writing, fhEVM-native is still not fully implemented, namely the geth integration is not done. Configuration settings will be listed here when they are implemented.

## Executor

The Executor is configured via command line switches, e.g.:

```
executor --help
Usage: executor [OPTIONS]

Options:
      --tokio-threads <TOKIO_THREADS>                  [default: 4]
      --fhe-compute-threads <FHE_COMPUTE_THREADS>      [default: 8]
      --fhe-operation-threads <FHE_OPERATION_THREADS>  [default: 8]
      --server-addr <SERVER_ADDR>                      [default: 127.0.0.1:50051]
  -h, --help                                           Print help
  -V, --version
```

### Threads

Note that there are three thread pools in the Executor:
 * tokio
 * FHE compute
 * FHE operation

The tokio one (set via `--tokio-threads`) determines how many tokio threads are spawned. These threads are used for async tasks and should not be blocked.

The FHE compute threads are the ones that actually run the FHE computation (set via `--fhe-compute-threads`).
