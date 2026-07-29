-- Add human-friendly reference to SessionRequest (nullable for existing rows).
ALTER TABLE "SessionRequest" ADD COLUMN "reference" TEXT;

-- Unique reference lookups.
CREATE UNIQUE INDEX "SessionRequest_reference_key" ON "SessionRequest"("reference");
