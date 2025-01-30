# Use the Rust image as the base
FROM rust:1.83.0-slim

# Install dependencies and tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev postgresql-client xxd && \
    cargo install sqlx-cli --version 0.7.2 --no-default-features --features postgres --locked && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy migrations and initialization script
COPY fhevm-engine/fhevm-db/initialize_db.sh /initialize_db.sh
COPY fhevm-engine/fhevm-db/migrations /migrations

# Make the script executable
RUN chmod +x /initialize_db.sh

# Run the initialization script as the entrypoint
ENTRYPOINT ["/bin/bash", "/initialize_db.sh"]
