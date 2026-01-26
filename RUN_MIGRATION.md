# How to Run the Migration on Remote Server

## Option 1: Using psql (Command Line)

If you have SSH access to your remote server:

```bash
# Connect to your remote server via SSH
ssh your-username@your-server-ip

# Then connect to PostgreSQL and run the migration
psql -U your-database-user -d your-database-name -f /path/to/add_regular_purchase_fields.sql

# Or if you're already in the project directory:
psql -U your-database-user -d your-database-name -f prisma/migrations/add_regular_purchase_fields.sql
```

## Option 2: Using psql with Connection String

If you have the connection string:

```bash
psql "postgresql://username:password@host:port/database" -f prisma/migrations/add_regular_purchase_fields.sql
```

## Option 3: Copy SQL and Run Manually

1. Copy the contents of `prisma/migrations/add_regular_purchase_fields.sql`
2. Connect to your database using any PostgreSQL client (pgAdmin, DBeaver, etc.)
3. Paste and execute the SQL

## Option 4: Using Prisma Migrate (Recommended)

If your remote database is accessible and Prisma is configured:

```bash
# Make sure your DATABASE_URL in .env points to the remote database
npx prisma migrate deploy
```

Or create a proper Prisma migration:

```bash
# This will create a migration file
npx prisma migrate dev --name add_regular_purchase_fields

# Then deploy to remote
npx prisma migrate deploy
```

## Quick SQL Commands (Copy & Paste)

If you just want to run the essential commands directly:

```sql
-- Add regularPurchase column
ALTER TABLE "supplier_initiations" 
ADD COLUMN IF NOT EXISTS "regularPurchase" BOOLEAN DEFAULT false;

-- Add onceOffPurchase column
ALTER TABLE "supplier_initiations" 
ADD COLUMN IF NOT EXISTS "onceOffPurchase" BOOLEAN DEFAULT false;
```

## Verify the Migration

After running, verify the columns were added:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'supplier_initiations' 
AND column_name IN ('regularPurchase', 'onceOffPurchase');
```

