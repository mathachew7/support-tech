-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_skillId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "requestId" TEXT,
ALTER COLUMN "skillId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SessionRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
