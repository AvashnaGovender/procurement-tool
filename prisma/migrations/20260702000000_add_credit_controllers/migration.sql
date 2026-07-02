-- CreateTable
CREATE TABLE "credit_controllers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_controllers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_controllers_name_key" ON "credit_controllers"("name");

-- Seed default credit controllers
INSERT INTO "credit_controllers" ("id", "name", "isActive", "createdAt", "updatedAt") VALUES
    (gen_random_uuid()::text, 'Connie',    true, NOW(), NOW()),
    (gen_random_uuid()::text, 'Jordan',    true, NOW(), NOW()),
    (gen_random_uuid()::text, 'Elizabeth', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'Ntombi',    true, NOW(), NOW()),
    (gen_random_uuid()::text, 'Nosi',      true, NOW(), NOW());
