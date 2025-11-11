# Database Connection Fix

## Problem
The database connection string contained an invalid parameter `?schema=public` which is not supported by PostgreSQL.

## Error Message
```
sqlalchemy.exc.ProgrammingError: (psycopg2.ProgrammingError) invalid dsn: invalid connection option "schema"
```

## Solution Applied
Removed the invalid `?schema=public` parameter from the DATABASE_URL.

### Before (Invalid):
```
DATABASE_URL="postgresql://postgres:admin123@localhost:5434/procurement_db?schema=public"
```

### After (Fixed):
```
DATABASE_URL="postgresql://postgres:admin123@localhost:5434/procurement_db"
```

## Valid PostgreSQL Connection String Format
```
postgresql://username:password@host:port/database
```

### Common Parameters (if needed):
- `?sslmode=require` - for SSL connections
- `?connect_timeout=10` - connection timeout
- `?application_name=myapp` - application name

### Invalid Parameters:
- `?schema=public` ❌ (not supported)
- `?database=schema` ❌ (not supported)

## Next Steps

### 1. Restart Worker Service
```bash
cd worker
docker-compose restart worker
```

### 2. Check Logs
```bash
docker-compose logs worker --tail=20
```

### 3. Test Database Connection
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

## Alternative Database URLs

### For Local PostgreSQL:
```
DATABASE_URL="postgresql://postgres:admin123@localhost:5434/procurement_db"
```

### For Docker PostgreSQL:
```
DATABASE_URL="postgresql://postgres:admin123@host.docker.internal:5434/procurement_db"
```

### For Production:
```
DATABASE_URL="postgresql://username:password@your-db-host:5432/production_db"
```

## Troubleshooting

### If still getting connection errors:
1. **Check if PostgreSQL is running**: `netstat -ano | findstr :5434`
2. **Verify credentials**: Make sure username/password are correct
3. **Check host accessibility**: Ensure the database is accessible from Docker
4. **Test connection locally**: Try connecting with a PostgreSQL client

### If using Docker for PostgreSQL:
```bash
# Add PostgreSQL service to docker-compose.yml
postgres:
  image: postgres:15
  environment:
    POSTGRES_DB: procurement_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: admin123
  ports:
    - "5434:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```






