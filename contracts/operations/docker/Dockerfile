FROM ghcr.io/zama-ai/httpz-node-golden-image:latest

WORKDIR /app

RUN chown -R httpz:httpz /home/httpz && \
    chown -R httpz:httpz /app

# Copy only necessary files
COPY --chown=httpz:httpz contracts/package.json ./
COPY --chown=httpz:httpz contracts/package-lock.json ./

# Install dependencies
RUN npm ci && \
    npm prune

# Copy the application files
COPY --chown=httpz:httpz contracts/*.ts contracts/tsconfig.json ./
COPY --chown=httpz:httpz contracts/contracts ./contracts/
COPY --chown=httpz:httpz contracts/addresses ./addresses/
COPY --chown=httpz:httpz contracts/tasks ./tasks/
COPY --chown=httpz:httpz contracts/lib ./lib/
COPY --chown=httpz:httpz contracts/decryptionOracle ./decryptionOracle/

# Pre-download Solidity compiler
RUN npx hardhat compile --force

USER httpz:httpz

ENTRYPOINT ["/bin/bash", "-c"]