# How to Reset and Recreate Database from Scratch

## ⚠️ WARNING: This will DELETE ALL DATA in your database!

## Step 1: Reset the Database

```bash
# This will drop the database, recreate it, and apply all migrations
npx prisma migrate reset
```

**OR** if you want to keep the database but reset migrations:

```bash
# Reset migrations (keeps data but resets migration history)
npx prisma migrate reset --skip-seed
```

## Step 2: Create Initial Migration

If you don't have migrations yet, create one:

```bash
# This creates a migration from your current schema
npx prisma migrate dev --name init
```

## Step 3: Apply to Remote Database

After creating migrations locally, apply to remote:

```bash
# Make sure your .env DATABASE_URL points to remote database
npx prisma migrate deploy
```

## Alternative: Full Reset with Schema Push

If migrations are too complex, you can use schema push:

```bash
# This will recreate the database structure from schema
npx prisma db push --force-reset
```

## Step-by-Step Process:

1. **Backup your data first** (if you need to keep any):
   ```bash
   pg_dump -h your-host -U your-username -d procurement_db > backup.sql
   ```

2. **Update your .env** to point to the database you want to reset

3. **Reset the database**:
   ```bash
   npx prisma migrate reset
   ```

4. **Or create fresh migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Verify the schema**:
   ```bash
   npx prisma db pull  # This will show you what's in the database
   ```

## If You Want to Keep Some Data:

1. Export important data first
2. Reset the database
3. Re-import the data after

