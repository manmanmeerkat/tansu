-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "boxType" TEXT NOT NULL,
    "currentFraction" DOUBLE PRECISION NOT NULL,
    "previousFraction" DOUBLE PRECISION NOT NULL,
    "totalFraction" DOUBLE PRECISION NOT NULL,
    "lotNumber" TEXT,
    "workerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_workerId_idx" ON "Report"("workerId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
