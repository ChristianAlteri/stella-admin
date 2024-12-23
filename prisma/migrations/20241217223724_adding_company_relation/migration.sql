-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "name" DROP DEFAULT;
ALTER TABLE "Company" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "companyId" STRING NOT NULL DEFAULT '04253f6f-0b81-4948-a9d3-4c357b9ca346';

-- CreateIndex
CREATE INDEX "Store_companyId_idx" ON "Store"("companyId");
