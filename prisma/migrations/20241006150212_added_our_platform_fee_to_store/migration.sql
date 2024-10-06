-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "email" STRING;
ALTER TABLE "Store" ADD COLUMN     "our_platform_fee" DECIMAL(65,30) NOT NULL DEFAULT 0.05;
