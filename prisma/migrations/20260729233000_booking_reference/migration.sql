ALTER TABLE "Booking" ADD COLUMN "reference" TEXT;
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");
