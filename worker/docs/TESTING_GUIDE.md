# Worker Service Testing Guide

## 1. Check Service Status

### View Running Containers
```bash
cd worker
docker-compose ps
```

**Expected Output:**
```
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
worker-redis-1      redis:7-alpine      "docker-entrypoint.s…"   redis              2 minutes ago       Up 2 minutes        0.0.0.0:6380->6379/tcp
worker-worker-1     worker-celery-worker "sh start.sh"           worker             2 minutes ago       Up 2 minutes        0.0.0.0:8001->8001/tcp
worker-celery-worker-1 worker-celery-worker "celery -A celery_worker worker --loglevel=info" celery-worker   2 minutes ago       Up 2 minutes
```

### Check Service Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs worker
docker-compose logs redis
docker-compose logs celery-worker
```

## 2. Test SMTP Connection

### Test SMTP in Container
```bash
docker-compose exec worker python simple_smtp_test.py
```

**Expected Output:**
```
Procurement Worker - Simple SMTP Test
==================================================
Loading environment from .env file...
Testing SMTP Connection...
Host: mail.theinnoverse.co.za
Port: 465
User: agovender@theinnoverse.co.za
From: agovender@theinnoverse.co.za
--------------------------------------------------
Using SSL/TLS connection...
SUCCESS: Connected to SMTP server
SUCCESS: Authentication successful

SUCCESS: SMTP configuration is working correctly!

Test completed!
```

## 3. Test API Endpoints

### Health Check
```bash
curl http://localhost:8001/health
```

**Expected Output:**
```json
{"status": "healthy", "timestamp": "2025-01-06T11:30:00Z"}
```

### Test File Upload (if available)
```bash
curl -X POST http://localhost:8001/upload \
  -F "file=@test.pdf" \
  -H "Content-Type: multipart/form-data"
```

## 4. Test Redis Connection

### Test Redis from Container
```bash
docker-compose exec worker python -c "
import redis
try:
    r = redis.Redis(host='redis', port=6379, decode_responses=True)
    print('Redis connection:', r.ping())
    print('Redis info:', r.info()['redis_version'])
except Exception as e:
    print('Redis error:', e)
"
```

**Expected Output:**
```
Redis connection: True
Redis info: 7.0.15
```

## 5. Test Celery Worker

### Check Celery Status
```bash
docker-compose exec worker celery -A celery_worker inspect active
```

### Test Celery Task
```bash
docker-compose exec worker python -c "
from celery_worker import test_task
result = test_task.delay('Hello from test!')
print('Task ID:', result.id)
print('Task result:', result.get(timeout=10))
"
```

## 6. Test Database Connection

### Test Database (if configured)
```bash
docker-compose exec worker python -c "
import os
from sqlalchemy import create_engine
try:
    engine = create_engine(os.getenv('DATABASE_URL'))
    conn = engine.connect()
    print('Database connection: SUCCESS')
    conn.close()
except Exception as e:
    print('Database error:', e)
"
```

## 7. Full Integration Test

### Test Complete Workflow
```bash
# 1. Check all services are running
docker-compose ps

# 2. Test SMTP
docker-compose exec worker python simple_smtp_test.py

# 3. Test API health
curl http://localhost:8001/health

# 4. Test Redis
docker-compose exec worker python -c "import redis; r=redis.Redis(host='redis', port=6379); print('Redis:', r.ping())"

# 5. Check logs for errors
docker-compose logs --tail=50
```

## Troubleshooting

### If Services Won't Start
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose build --no-cache
docker-compose up -d
```

### If SMTP Test Fails
1. Check your `.env` file has correct credentials
2. Verify SMTP server is accessible
3. Check firewall settings

### If Redis Connection Fails
1. Check Redis container is running: `docker-compose ps`
2. Check Redis logs: `docker-compose logs redis`
3. Test Redis directly: `docker-compose exec redis redis-cli ping`

### If API Endpoints Fail
1. Check worker container is running
2. Check worker logs: `docker-compose logs worker`
3. Verify port 8001 is accessible: `netstat -ano | findstr :8001`






