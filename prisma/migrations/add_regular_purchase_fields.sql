-- Migration: Add regularPurchase and onceOffPurchase columns to supplier_initiations table
-- These fields are needed for backward compatibility and data migration

-- Add regularPurchase column if it doesn't exist
ALTER TABLE "supplier_initiations" 
ADD COLUMN IF NOT EXISTS "regularPurchase" BOOLEAN DEFAULT false;

-- Add onceOffPurchase column if it doesn't exist
ALTER TABLE "supplier_initiations" 
ADD COLUMN IF NOT EXISTS "onceOffPurchase" BOOLEAN DEFAULT false;

-- Update existing rows based on purchaseType if purchaseType exists
-- This ensures data consistency
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'supplier_initiations' 
        AND column_name = 'purchaseType'
    ) THEN
        UPDATE "supplier_initiations"
        SET 
            "regularPurchase" = CASE 
                WHEN "purchaseType" = 'REGULAR' THEN true 
                ELSE false 
            END,
            "onceOffPurchase" = CASE 
                WHEN "purchaseType" = 'ONCE_OFF' THEN true 
                ELSE false 
            END
        WHERE "regularPurchase" IS NULL OR "onceOffPurchase" IS NULL;
    END IF;
END $$;

