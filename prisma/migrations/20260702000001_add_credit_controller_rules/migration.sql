-- CreateEnum
CREATE TYPE "CreditRuleType" AS ENUM ('FIXED', 'ALPHA_RANGE');

-- CreateTable
CREATE TABLE "credit_controller_rules" (
    "id" TEXT NOT NULL,
    "businessUnit" TEXT NOT NULL,
    "ruleType" "CreditRuleType" NOT NULL,
    "fromLetter" TEXT,
    "toLetter" TEXT,
    "controllerName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_controller_rules_pkey" PRIMARY KEY ("id")
);

-- Seed default assignment rules (mirrors the existing hardcoded logic)
-- SCHAUENBURG_SYSTEMS_200: alphabetical ranges
INSERT INTO "credit_controller_rules" ("id", "businessUnit", "ruleType", "fromLetter", "toLetter", "controllerName", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
    (gen_random_uuid()::text, 'SCHAUENBURG_SYSTEMS_200', 'ALPHA_RANGE', 'A', 'D', 'Jordan',    1, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'SCHAUENBURG_SYSTEMS_200', 'ALPHA_RANGE', 'E', 'H', 'Elizabeth', 2, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'SCHAUENBURG_SYSTEMS_200', 'ALPHA_RANGE', 'I', 'P', 'Ntombi',    3, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'SCHAUENBURG_SYSTEMS_200', 'ALPHA_RANGE', 'Q', 'Z', 'Nosi',      4, true, NOW(), NOW());

-- SCHAUENBURG_PTY_LTD_300: alphabetical ranges
INSERT INTO "credit_controller_rules" ("id", "businessUnit", "ruleType", "fromLetter", "toLetter", "controllerName", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
    (gen_random_uuid()::text, 'SCHAUENBURG_PTY_LTD_300', 'ALPHA_RANGE', 'A', 'D', 'Jordan',    1, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'SCHAUENBURG_PTY_LTD_300', 'ALPHA_RANGE', 'E', 'H', 'Elizabeth', 2, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'SCHAUENBURG_PTY_LTD_300', 'ALPHA_RANGE', 'I', 'P', 'Ntombi',    3, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'SCHAUENBURG_PTY_LTD_300', 'ALPHA_RANGE', 'Q', 'Z', 'Nosi',      4, true, NOW(), NOW());
