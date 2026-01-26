-- Simple SQL to add the missing columns
-- Run this directly on your remote database

-- Add regularPurchase column if it doesn't exist
ALTER TABLE "supplier_initiations" 
ADD COLUMN IF NOT EXISTS "regularPurchase" BOOLEAN DEFAULT false;

-- Add onceOffPurchase column if it doesn't exist
ALTER TABLE "supplier_initiations" 
ADD COLUMN IF NOT EXISTS "onceOffPurchase" BOOLEAN DEFAULT false;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'supplier_initiations' 
AND column_name IN ('regularPurchase', 'onceOffPurchase', 'purchaseType');

