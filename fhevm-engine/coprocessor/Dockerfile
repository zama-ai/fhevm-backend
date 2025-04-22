# Stage 1: Build
FROM cgr.dev/chainguard/glibc-dynamic:latest-dev AS base

ARG RUST_IMAGE_VERSION=1.85.0
# Install essential tools and dependencies
USER root

RUN apk add --no-cache \
    curl \
    wget \
    bash \
    git \
    make \
    perl \
    binutils \
    ca-certificates \
    gcc \
    libstdc++ \
    linux-headers \
    build-base \
    openssl-dev \
    protoc \
    protobuf \
    openssh

# Install Rust using rustup
ENV PATH="/root/.cargo/bin:${PATH}"
ENV RUSTUP_HOME=/root/.rustup
ENV CARGO_HOME=/root/.cargo

# Install Rust toolchain
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain=$RUST_IMAGE_VERSION && \
    . $CARGO_HOME/env

RUN cargo install sccache --version ^0.7

# Set environment variables for building
ENV RUSTC_WRAPPER=sccache SCCACHE_DIR=/sccache
ENV CC=gcc
ENV CXX=g++
ENV RUSTFLAGS="-C target-feature=-crt-static"
ENV OPENSSL_DIR=/usr

FROM base AS build

WORKDIR /app

COPY ./contracts/artifacts/contracts/ ./contracts/artifacts/contracts/
COPY ./fhevm-engine/ ./fhevm-engine/
COPY ./proto/ ./proto/

WORKDIR /app/fhevm-engine

# Start the database service
RUN --mount=type=cache,target=$SCCACHE_DIR,sharing=locked \
    cargo fetch && \
    SQLX_OFFLINE=true cargo build --release

# Stage 2: Final image
FROM cgr.dev/chainguard/glibc-dynamic:latest-dev AS prod

USER root

# Install dependencies
RUN apk update && apk add --no-cache \
    ca-certificates

COPY --from=build /app/fhevm-engine/target/release/coprocessor /usr/local/bin/coprocessor
COPY --from=build /app/fhevm-engine/target/release/cli /usr/local/bin/cli
COPY --from=build /app/fhevm-engine/target/release/fhevm_listener /usr/local/bin/fhevm_listener
COPY --from=build /app/fhevm-engine/target/release/gw_listener /usr/local/bin/gw_listener
COPY --from=build /app/fhevm-engine/target/release/zkproof_worker /usr/local/bin/zkproof_worker
COPY --from=build /app/fhevm-engine/target/release/sns_worker /usr/local/bin/sns_worker
COPY --from=build /app/fhevm-engine/target/release/transaction_sender /usr/local/bin/transaction_sender

RUN addgroup -g 10001 zama && \
    adduser -D -s /bin/sh --uid 10000 -G zama zama && \
    chown -R zama:zama /usr/local/bin && \
    chmod 500 /usr/local/bin/coprocessor && \
    chmod 500 /usr/local/bin/cli && \
    chmod 500 /usr/local/bin/fhevm_listener && \
    chmod 500 /usr/local/bin/gw_listener && \
    chmod 500 /usr/local/bin/zkproof_worker && \
    chmod 500 /usr/local/bin/sns_worker && \
    chmod 500 /usr/local/bin/transaction_sender

USER zama:zama

CMD ["/usr/local/bin/coprocessor"]

FROM prod AS dev

USER root

