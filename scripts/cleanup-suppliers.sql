-- ============================================================================
-- SUPPLIER CLEANUP SCRIPT - PostgreSQL
-- ============================================================================
-- This script helps you find and delete duplicate/unwanted suppliers

-- ============================================================================
-- STEP 1: VIEW ALL SUPPLIERS
-- ============================================================================
-- Check all suppliers in the database
SELECT 
    id,
    "supplierCode",
    "companyName",
    "contactEmail",
    status,
    "createdAt"
FROM suppliers
ORDER BY "contactEmail", "createdAt" DESC;

-- ============================================================================
-- STEP 2: FIND DUPLICATE EMAILS
-- ============================================================================
-- Find suppliers with duplicate email addresses
SELECT 
    "contactEmail",
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as supplier_ids,
    STRING_AGG("companyName", ', ') as company_names
FROM suppliers
GROUP BY "contactEmail"
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- ============================================================================
-- STEP 3: VIEW RELATED RECORDS FOR A SPECIFIC SUPPLIER
-- ============================================================================
-- Replace 'SUPPLIER_ID_HERE' with the actual supplier ID you want to check
SELECT 
    'Supplier' as table_name,
    COUNT(*) as count
FROM suppliers
WHERE id = 'SUPPLIER_ID_HERE'

UNION ALL

SELECT 
    'SupplierOnboarding' as table_name,
    COUNT(*) as count
FROM supplier_onboardings
WHERE "supplierId" = 'SUPPLIER_ID_HERE'

UNION ALL

SELECT 
    'OnboardingTimeline' as table_name,
    COUNT(*) as count
FROM onboarding_timeline ot
WHERE ot."onboardingId" IN (
    SELECT id FROM supplier_onboardings WHERE "supplierId" = 'SUPPLIER_ID_HERE'
);

-- ============================================================================
-- STEP 4: DELETE A SPECIFIC SUPPLIER AND ALL RELATED RECORDS
-- ============================================================================
-- Replace 'SUPPLIER_ID_HERE' with the actual supplier ID you want to delete
-- IMPORTANT: This will permanently delete all related records!

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

-- If everything looks good, commit the transaction
COMMIT;
-- If you want to undo, run: ROLLBACK;

-- ============================================================================
-- STEP 5: DELETE ALL SUPPLIERS WITH A SPECIFIC EMAIL
-- ============================================================================
-- Replace 'email@example.com' with the actual email you want to remove
-- IMPORTANT: This deletes ALL suppliers with this email!

BEGIN;

-- Store supplier IDs to delete
WITH suppliers_to_delete AS (
    SELECT id FROM suppliers WHERE "contactEmail" = 'email@example.com'
)
-- Delete onboarding timeline entries
DELETE FROM onboarding_timeline
WHERE "onboardingId" IN (
    SELECT so.id 
    FROM supplier_onboardings so
    WHERE so."supplierId" IN (SELECT id FROM suppliers_to_delete)
);

-- Delete supplier onboarding records
DELETE FROM supplier_onboardings
WHERE "supplierId" IN (
    SELECT id FROM suppliers WHERE "contactEmail" = 'email@example.com'
);

-- Delete suppliers
DELETE FROM suppliers
WHERE "contactEmail" = 'email@example.com';

-- Review changes and commit
COMMIT;
-- If you want to undo, run: ROLLBACK;

-- ============================================================================
-- STEP 6: DELETE ALL SUPPLIERS (USE WITH EXTREME CAUTION!)
-- ============================================================================
-- This will delete ALL suppliers from the database
-- ONLY USE THIS IF YOU WANT TO START FRESH!

BEGIN;

-- Delete all onboarding timeline entries
DELETE FROM onboarding_timeline;

-- Delete all supplier onboarding records
DELETE FROM supplier_onboardings;

-- Delete all supplier-related records
DELETE FROM supplier_evaluations;
DELETE FROM supplier_reviews;
DELETE FROM supplier_documents WHERE "onboardingId" IS NOT NULL;

-- Delete all suppliers
DELETE FROM suppliers;

-- Reset sequences if needed
-- ALTER SEQUENCE suppliers_id_seq RESTART WITH 1;

COMMIT;
-- If you want to undo, run: ROLLBACK;

-- ============================================================================
-- STEP 7: VERIFY DELETION
-- ============================================================================
-- Count remaining records
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

