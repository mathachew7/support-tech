-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('requested', 'matched', 'cancelled', 'closed');

-- CreateTable
CREATE TABLE "SessionRequest" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "skillId" TEXT,
    "skillName" TEXT NOT NULL,
    "commitmentMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "note" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'requested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionRequestTime" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionRequestTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionRequest_seekerId_idx" ON "SessionRequest"("seekerId");

-- CreateIndex
CREATE INDEX "SessionRequest_status_idx" ON "SessionRequest"("status");

-- CreateIndex
CREATE INDEX "SessionRequestTime_requestId_idx" ON "SessionRequestTime"("requestId");

-- AddForeignKey
ALTER TABLE "SessionRequest" ADD CONSTRAINT "SessionRequest_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRequest" ADD CONSTRAINT "SessionRequest_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRequestTime" ADD CONSTRAINT "SessionRequestTime_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SessionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
