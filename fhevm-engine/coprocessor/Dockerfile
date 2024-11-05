# Stage 1: Build
FROM rust:1.82.0-bullseye AS build

WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends protobuf-compiler && \
    rm -rf /var/lib/apt/lists/*

COPY ./fhevm-engine/ ./fhevm-engine/

WORKDIR /app/fhevm-engine/coprocessor

RUN cargo fetch
RUN SQLX_OFFLINE=true cargo build --release

# Stage 2: Final image
FROM debian:bullseye-slim

RUN useradd -m zama

COPY --from=build /app/fhevm-engine/coprocessor/target/release/coprocessor /usr/local/bin

RUN chown zama:zama /usr/local/bin/coprocessor && \
    chmod 500 /usr/local/bin/coprocessor

USER zama

ENTRYPOINT ["/usr/local/bin/coprocessor"]