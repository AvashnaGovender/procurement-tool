# Port Conflict Solution

## Problem
Port 6379 (Redis) is already in use by another service, causing Docker Compose to fail.

## Solution Applied
Changed Redis external port from 6379 to 6380 in docker-compose.yml:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6380:6379"  # External port 6380 maps to internal port 6379
```

## Why This Works
- **Internal communication**: Services still use `redis://redis:6379/0` (internal Docker network)
- **External access**: Redis is accessible on `localhost:6380` from your host machine
- **No conflicts**: Port 6380 is typically free

## Alternative Solutions

### Option 1: Use Different Port (Current)
```yaml
ports:
  - "6380:6379"  # or any other free port
```

### Option 2: Stop Conflicting Service
If you have Redis running locally:
```bash
# Windows
net stop redis
# or
taskkill /F /PID <redis_pid>

# Then use original port 6379
```

### Option 3: Use Host Network
```yaml
redis:
  image: redis:7-alpine
  network_mode: "host"
  # No ports mapping needed
```

### Option 4: Remove Port Mapping
If you don't need external access to Redis:
```yaml
redis:
  image: redis:7-alpine
  # No ports section - only internal access
```

## Verification

### Check if port 6380 is free:
```bash
netstat -ano | findstr :6380
```

### Test Redis connection:
```bash
# From host machine
redis-cli -p 6380 ping

# From within Docker container
docker-compose exec redis redis-cli ping
```

## Updated Configuration

The internal Redis URL remains the same for your services:
- `REDIS_URL=redis://redis:6379/0` (internal Docker network)

Only the external port changed:
- External access: `localhost:6380`
- Internal access: `redis:6379` (within Docker network)

## Next Steps

1. **Start services**:
   ```bash
   docker-compose up -d
   ```

2. **Verify Redis is working**:
   ```bash
   docker-compose logs redis
   ```

3. **Test connection**:
   ```bash
   docker-compose exec worker python -c "import redis; r=redis.Redis(host='redis', port=6379); print(r.ping())"
   ```


