-- Migration: Add purchaseType column and remove regularPurchase/onceOffPurchase
-- Run this migration manually if prisma migrate fails

-- Step 1: Add the PurchaseType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "PurchaseType" AS ENUM ('REGULAR', 'ONCE_OFF', 'SHARED_IP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add purchaseType column with a default value
ALTER TABLE "supplier_initiations" 
ADD COLUMN IF NOT EXISTS "purchaseType" "PurchaseType" DEFAULT 'REGULAR';

-- Step 3: Migrate existing data from regularPurchase/onceOffPurchase to purchaseType
UPDATE "supplier_initiations"
SET "purchaseType" = CASE
    WHEN "regularPurchase" = true AND "onceOffPurchase" = true THEN 'REGULAR'::"PurchaseType"
    WHEN "regularPurchase" = true THEN 'REGULAR'::"PurchaseType"
    WHEN "onceOffPurchase" = true THEN 'ONCE_OFF'::"PurchaseType"
    ELSE 'REGULAR'::"PurchaseType"  -- Default fallback
END
WHERE "purchaseType" IS NULL OR "purchaseType" = 'REGULAR'::"PurchaseType";

-- Step 4: Make purchaseType NOT NULL (after data migration)
ALTER TABLE "supplier_initiations" 
ALTER COLUMN "purchaseType" SET NOT NULL,
ALTER COLUMN "purchaseType" DROP DEFAULT;

-- Step 5: Remove old columns (uncomment when ready)
-- ALTER TABLE "supplier_initiations" 
-- DROP COLUMN IF EXISTS "regularPurchase",
-- DROP COLUMN IF EXISTS "onceOffPurchase";

