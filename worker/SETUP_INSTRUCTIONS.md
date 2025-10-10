# Worker Service Setup Instructions

## Issues Fixed

1. ✅ **Docker Compose version warning**: Removed obsolete `version` attribute
2. ✅ **Missing SMTP environment variables**: Added `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` to `.env` file

## Current Issues

### Docker Desktop Not Running
The error `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified` indicates that Docker Desktop is not running.

## Setup Steps

### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (you'll see the Docker icon in the system tray)
- Ensure Docker Desktop is running before proceeding

### 2. Configure Environment Variables
The `.env` file has been updated with the missing SMTP variables. You need to fill in the actual values:

```bash
# Edit the .env file and add your actual SMTP credentials
SMTP_USER=your_actual_email@domain.com
SMTP_PASS=your_actual_password
SMTP_FROM=your_actual_email@domain.com
```

### 3. Build and Start Services
Once Docker Desktop is running, execute these commands:

```bash
# Navigate to worker directory
cd worker

# Build the Docker images
docker-compose build

# Start the services
docker-compose up -d
```

### 4. Verify Services
Check if services are running:

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs
```

## Services Included

- **Redis**: Message broker for Celery
- **Worker**: FastAPI application server
- **Celery Worker**: Background task processor

## Troubleshooting

### If Docker Desktop won't start:
1. Restart Docker Desktop
2. Check Windows features (WSL2, Hyper-V)
3. Run as administrator if needed

### If build fails:
1. Check internet connection
2. Ensure Docker has enough resources allocated
3. Try building individual services: `docker-compose build worker`

### If services won't start:
1. Check the `.env` file has correct values
2. Ensure database is accessible
3. Check logs: `docker-compose logs [service-name]`


