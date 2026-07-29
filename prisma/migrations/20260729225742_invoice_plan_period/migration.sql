-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "periodIndex" INTEGER,
ADD COLUMN     "periodLabel" TEXT,
ADD COLUMN     "periodTotal" INTEGER,
ADD COLUMN     "planName" TEXT;
