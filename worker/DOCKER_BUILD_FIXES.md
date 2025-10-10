# Docker Build Fixes

## Issues Fixed

### 1. Package Dependencies
**Problem**: `libgl1-mesa-glx` package not available in newer Debian
**Solution**: Updated to `libgl1-mesa-dri` and `libxrender1`

### 2. Python Dependencies Conflict
**Problem**: `langchain==0.1.0` conflicts with `crewai==0.28.8`
**Solution**: Updated to compatible versions:
- `langchain>=0.1.10,<0.2.0`
- Added `pydantic-settings>=2.0.0`

## Updated Files

### Dockerfile Changes
```dockerfile
# Fixed package names for newer Debian
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1-mesa-dri \        # Changed from libgl1-mesa-glx
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \            # Changed from libxrender-dev
    libgomp1 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgraded pip and fixed requirements
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
```

### Requirements Changes
- Updated `langchain` version constraint
- Added `pydantic-settings` for config compatibility
- Made version constraints more flexible where appropriate

## Build Commands

```bash
# Clean build (recommended)
docker-compose build --no-cache

# Or build specific service
docker-compose build worker

# Start services
docker-compose up -d
```

## Troubleshooting

### If build still fails:
1. **Clear Docker cache**: `docker system prune -a`
2. **Check Docker Desktop**: Ensure it's running and has enough resources
3. **Check internet**: Ensure stable connection for package downloads

### If dependencies conflict:
1. Check the `requirements-fixed.txt` file
2. Consider using `pip-tools` for better dependency resolution
3. Test locally first: `pip install -r requirements-fixed.txt`

## Verification

After successful build, verify services:
```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs worker
docker-compose logs celery-worker

# Test SMTP (if configured)
docker-compose exec worker python simple_smtp_test.py
```


