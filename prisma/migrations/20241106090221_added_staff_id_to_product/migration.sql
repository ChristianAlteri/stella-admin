-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "staffId" STRING;

-- CreateIndex
CREATE INDEX "Product_staffId_idx" ON "Product"("staffId");
