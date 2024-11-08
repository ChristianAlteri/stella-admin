-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "userId" STRING;

-- CreateIndex
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
