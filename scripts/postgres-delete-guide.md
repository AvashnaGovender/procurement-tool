# PostgreSQL Direct Deletion Guide

## How to Connect to PostgreSQL

### Option 1: Using pgAdmin
1. Open pgAdmin
2. Connect to your database server
3. Navigate to your database
4. Open the Query Tool (Tools > Query Tool)
5. Copy and paste SQL commands from `cleanup-suppliers.sql`

### Option 2: Using psql Command Line
```bash
# Connect to your database
psql -h localhost -U your_username -d your_database_name

# Or if using the DATABASE_URL from your .env
psql "postgresql://username:password@host:port/database"
```

### Option 3: Using DBeaver, DataGrip, or other SQL Client
1. Open your SQL client
2. Connect to your PostgreSQL database
3. Open a new SQL editor
4. Copy and paste SQL commands

## Step-by-Step Instructions

### 1. First, Check What's in the Database

```sql
SELECT 
    id,
    "supplierCode",
    "companyName",
    "contactEmail",
    status,
    "createdAt"
FROM suppliers
ORDER BY "contactEmail", "createdAt" DESC;
```

### 2. Find Duplicate Emails

```sql
SELECT 
    "contactEmail",
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as supplier_ids
FROM suppliers
GROUP BY "contactEmail"
HAVING COUNT(*) > 1;
```

### 3. Delete a Specific Supplier

**IMPORTANT:** Replace `'SUPPLIER_ID_HERE'` with the actual supplier ID!

```sql
BEGIN;

-- Delete onboarding timeline entries
DELETE FROM onboarding_timeline
WHERE "onboardingId" IN (
    SELECT id FROM supplier_onboardings WHERE "supplierId" = 'SUPPLIER_ID_HERE'
);

-- Delete supplier onboarding record
DELETE FROM supplier_onboardings
WHERE "supplierId" = 'SUPPLIER_ID_HERE';

-- Delete the supplier
DELETE FROM suppliers
WHERE id = 'SUPPLIER_ID_HERE';

COMMIT;
```

### 4. Delete All Suppliers with a Specific Email

**IMPORTANT:** Replace `'email@example.com'` with the actual email!

```sql
BEGIN;

-- Delete onboarding timeline entries
DELETE FROM onboarding_timeline
WHERE "onboardingId" IN (
    SELECT so.id 
    FROM supplier_onboardings so
    JOIN suppliers s ON so."supplierId" = s.id
    WHERE s."contactEmail" = 'email@example.com'
);

-- Delete supplier onboarding records
DELETE FROM supplier_onboardings
WHERE "supplierId" IN (
    SELECT id FROM suppliers WHERE "contactEmail" = 'email@example.com'
);

-- Delete suppliers
DELETE FROM suppliers
WHERE "contactEmail" = 'email@example.com';

COMMIT;
```

### 5. Verify Deletion

```sql
SELECT 
    'Suppliers' as table_name,
    COUNT(*) as count
FROM suppliers

UNION ALL

SELECT 
    'Supplier Onboardings' as table_name,
    COUNT(*) as count
FROM supplier_onboardings

UNION ALL

SELECT 
    'Onboarding Timeline' as table_name,
    COUNT(*) as count
FROM onboarding_timeline;
```

## Quick Command for Duplicate Check

```sql
-- Quick check for duplicate emails in your database
SELECT 
    "contactEmail",
    COUNT(*) as total_suppliers,
    MIN("createdAt") as first_created,
    MAX("createdAt") as last_created
FROM suppliers
GROUP BY "contactEmail"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;
```

## Safety Tips

1. **Always use `BEGIN;` and `COMMIT;`** - This allows you to review changes before committing
2. **Test with SELECT first** - Before DELETE, run SELECT to see what will be deleted
3. **Keep backups** - Make sure you have a database backup before mass deletions
4. **Use ROLLBACK** - If something goes wrong before COMMIT, run `ROLLBACK;` to undo

## Example: Safe Deletion Workflow

```sql
-- Step 1: Start transaction
BEGIN;

-- Step 2: Check what will be deleted
SELECT * FROM suppliers WHERE "contactEmail" = 'test@example.com';

-- Step 3: Delete (commands here)
-- ... your DELETE statements ...

-- Step 4: Verify the deletion
SELECT COUNT(*) FROM suppliers WHERE "contactEmail" = 'test@example.com';
-- Should return 0

-- Step 5: If everything looks good
COMMIT;
-- OR if something is wrong
-- ROLLBACK;
```

## Getting Your DATABASE_URL

Your PostgreSQL connection string should be in your `.env` file:
```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

Parse it like this:
- **Host**: The part after `@` and before `:`
- **Port**: Usually `5432`
- **Database**: The part after the port and before `?`
- **Username**: The part after `postgresql://` and before `:`
- **Password**: The part between `:` and `@`

