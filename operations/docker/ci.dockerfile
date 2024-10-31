FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy only necessary files for npm install
COPY contracts/package.json contracts/package-lock.json ./

# Install dependencies
RUN npm install && \
    npm cache clean --force

# Copy the application files
COPY contracts/.env.example.deployment contracts/*.sh contracts/*.ts contracts/tsconfig.json ./
COPY contracts/lib ./lib/
COPY contracts/tasks ./tasks/
COPY contracts/gateway ./gateway/

RUN chmod +x *.sh
