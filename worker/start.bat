@echo off
REM Startup script for Windows

echo Starting Procurement Worker Service...

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo Please edit .env file with your configuration before running again.
    pause
    exit /b 1
)

REM Check if Redis is running
echo Checking Redis connection...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo Redis is not running. Please start Redis server first.
    echo Run: redis-server
    pause
    exit /b 1
)

REM Check if PostgreSQL is accessible
echo Checking database connection...
python -c "import os; from sqlalchemy import create_engine; engine = create_engine(os.getenv('DATABASE_URL', 'postgresql://username:password@localhost:5432/procurement_tool')); engine.connect(); print('Database connection successful')"
if %errorlevel% neq 0 (
    echo Database connection failed. Please check your DATABASE_URL in .env file.
    pause
    exit /b 1
)

REM Create database tables
echo Creating database tables...
python -c "from database import create_tables; create_tables(); print('Database tables created')"

REM Start Celery worker in background
echo Starting Celery worker...
start /b celery -A celery_worker worker --loglevel=info

REM Start FastAPI server
echo Starting FastAPI server...
python main.py


