# Stage 1: Build
FROM rust:1.80.1-bullseye AS build

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends protobuf-compiler && \
    rm -rf /var/lib/apt/lists/*

# Copy necessary files
WORKDIR /app
COPY fhevm-engine/coprocessor /app/fhevm-engine/coprocessor
COPY fhevm-engine/Cargo.toml /app/fhevm-engine/
COPY fhevm-engine/Cargo.lock /app/fhevm-engine/

# Build with SQLX offline flag
RUN SQLX_OFFLINE=true cargo build --release

# Stage 2: Final image
FROM debian:bullseye-slim

# Copy the built binary
COPY --from=build /app/fhevm-engine/target/release/coprocessor /usr/local/bin

# Entrypoint
ENTRYPOINT ["/usr/local/bin/coprocessor"]