-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "storeId" STRING NOT NULL DEFAULT '0de0bb80-a113-4ace-aa76-6094fbbbb0bb';
ALTER TABLE "OrderItem" ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "orderId" STRING;
ALTER TABLE "Payout" ADD COLUMN     "orderItemId" STRING;

-- AlterTable
ALTER TABLE "Seller" ALTER COLUMN "instagramHandle" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "OrderItem_storeId_idx" ON "OrderItem"("storeId");

-- CreateIndex
CREATE INDEX "Payout_orderItemId_idx" ON "Payout"("orderItemId");

-- CreateIndex
CREATE INDEX "Payout_orderId_idx" ON "Payout"("orderId");
