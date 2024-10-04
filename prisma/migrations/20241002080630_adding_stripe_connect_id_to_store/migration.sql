-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "storeId" STRING NOT NULL DEFAULT '0de0bb80-a113-4ace-aa76-6094fbbbb0bb';

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "countryCode" STRING NOT NULL DEFAULT 'GB';
ALTER TABLE "Store" ADD COLUMN     "stripe_connect_unique_id" STRING DEFAULT '';

-- CreateIndex
CREATE INDEX "Payout_storeId_idx" ON "Payout"("storeId");
