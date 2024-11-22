#!/bin/bash

# 1: Create Database
echo "Creating database..."
sqlx database create

# 2: Run sqlx migrations
echo "Running migrations..."
sqlx migrate run --source /migrations || { echo "Failed to run migrations."; exit 1; }

echo "Database initialization complete."
