-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "inStoreSale" BOOL NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "our_platform_fee" SET DEFAULT 1;
