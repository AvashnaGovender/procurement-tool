#!/bin/bash

# Simplified startup script for the procurement worker service

echo "Starting Procurement Worker Service (Simplified)..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please edit .env file with your configuration before running again."
    exit 1
fi

# Check if Redis is running
echo "Checking Redis connection..."
python -c "
import redis
import os
try:
    redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/0')
    r = redis.from_url(redis_url)
    r.ping()
    print('Redis connection successful')
except Exception as e:
    print(f'Redis connection failed: {e}')
    exit(1)
"

# Start FastAPI server (simplified version)
echo "Starting FastAPI server (simplified)..."
python main_simple.py


