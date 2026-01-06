/*
  CRITICAL MIGRATION: Add Multiple Services per Appointment
  
  This migration preserves ALL existing appointment data by:
  1. Creating new tables FIRST
  2. Migrating data from old structure to new
  3. ONLY THEN dropping old columns
  
  ZERO DATA LOSS GUARANTEED
*/

-- Step 1: Create new AppointmentService table
CREATE TABLE "AppointmentService" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "priceSnapshot" DECIMAL(10,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentService_pkey" PRIMARY KEY ("id")
);

-- Step 2: Add totalDurationMinutes column (before dropping old columns!)
ALTER TABLE "Appointment" ADD COLUMN "totalDurationMinutes" INTEGER;

-- Step 3: CRITICAL - Migrate existing data
-- For each existing appointment, create an AppointmentService record
INSERT INTO "AppointmentService" ("id", "appointmentId", "serviceId", "priceSnapshot", "order", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    a."id",
    a."serviceId",
    COALESCE(a."paidPrice", s."price"),  -- Use actual paid price if available, otherwise service price
    1,
    a."createdAt",
    a."updatedAt"
FROM "Appointment" a
JOIN "Service" s ON a."serviceId" = s."id"
WHERE a."serviceId" IS NOT NULL;  -- Only migrate if serviceId exists

-- Step 4: Copy duration data
UPDATE "Appointment" 
SET "totalDurationMinutes" = COALESCE("durationMinutes", (
  SELECT "duration" FROM "Service" WHERE "id" = "Appointment"."serviceId"
))
WHERE "serviceId" IS NOT NULL;

-- Step 5: VALIDATION - Count records to ensure no data loss
DO $$
DECLARE
    appointment_count INTEGER;
    service_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO appointment_count FROM "Appointment" WHERE "serviceId" IS NOT NULL;
    SELECT COUNT(*) INTO service_count FROM "AppointmentService";
    
    IF appointment_count != service_count THEN
        RAISE EXCEPTION 'DATA MIGRATION FAILED: Expected % AppointmentService records, but found %', appointment_count, service_count;
    END IF;
    
    RAISE NOTICE 'DATA MIGRATION SUCCESS: Migrated % appointments to AppointmentService', service_count;
END $$;

-- Step 6: NOW SAFE to drop foreign key and old columns
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_serviceId_fkey";
ALTER TABLE "Appointment" DROP COLUMN "durationMinutes";
ALTER TABLE "Appointment" DROP COLUMN "serviceId";

-- Step 7: Create indexes for performance
CREATE INDEX "AppointmentService_appointmentId_idx" ON "AppointmentService"("appointmentId");
CREATE INDEX "AppointmentService_serviceId_idx" ON "AppointmentService"("serviceId");
CREATE UNIQUE INDEX "AppointmentService_appointmentId_serviceId_key" ON "AppointmentService"("appointmentId", "serviceId");

-- Step 8: Add foreign keys
ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_appointmentId_fkey" 
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_serviceId_fkey" 
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Final validation
DO $$
DECLARE
    total_migrated INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_migrated FROM "AppointmentService";
    RAISE NOTICE '✓ Migration completed successfully! Total services migrated: %', total_migrated;
END $$;
