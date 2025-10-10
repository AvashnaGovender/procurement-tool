#!/bin/bash

# Startup script for the procurement worker service

echo "Starting Procurement Worker Service..."

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

# Check if PostgreSQL is accessible (optional in Docker)
echo "Checking database connection..."
python -c "
import os
from sqlalchemy import create_engine
try:
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        engine = create_engine(database_url)
        engine.connect()
        print('Database connection successful')
    else:
        print('No DATABASE_URL configured, skipping database check')
except Exception as e:
    print(f'Database connection failed: {e}')
    print('Continuing without database connection...')
"

# Create database tables (optional)
echo "Creating database tables..."
python -c "
try:
    from database import create_tables
    create_tables()
    print('Database tables created')
except Exception as e:
    print(f'Database table creation failed: {e}')
    print('Continuing without database tables...')
"

# Start Celery worker in background
echo "Starting Celery worker..."
celery -A celery_worker worker --loglevel=info --detach --pidfile=celery.pid

# Start FastAPI server
echo "Starting FastAPI server..."
python main.py

