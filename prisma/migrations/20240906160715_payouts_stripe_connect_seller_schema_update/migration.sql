/*
  Warnings:

  - You are about to drop the column `name` on the `Seller` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Seller` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Seller` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Seller_instagramHandle_key";

-- DropIndex
DROP INDEX "Seller_name_key";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productAmount" DECIMAL(65,30) DEFAULT 0.0;
ALTER TABLE "OrderItem" ADD COLUMN     "sellerId" STRING NOT NULL DEFAULT '';
ALTER TABLE "OrderItem" ADD COLUMN     "stripe_connect_unique_id" STRING DEFAULT '';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "retailPrice" SET DEFAULT 0.0;
ALTER TABLE "Product" ALTER COLUMN "ourPrice" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "Seller" DROP COLUMN "name";
ALTER TABLE "Seller" ADD COLUMN     "country" STRING DEFAULT '';
ALTER TABLE "Seller" ADD COLUMN     "email" STRING;
ALTER TABLE "Seller" ADD COLUMN     "firstName" STRING DEFAULT '';
ALTER TABLE "Seller" ADD COLUMN     "lastName" STRING DEFAULT '';
ALTER TABLE "Seller" ADD COLUMN     "phoneNumber" STRING;
ALTER TABLE "Seller" ADD COLUMN     "shippingAddress" STRING DEFAULT '';
ALTER TABLE "Seller" ADD COLUMN     "stripe_connect_unique_id" STRING DEFAULT '';
ALTER TABLE "Seller" ALTER COLUMN "instagramHandle" SET DEFAULT 'https://www.instagram.com/anon.drobe';
ALTER TABLE "Seller" ALTER COLUMN "soldCount" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Payout" (
    "id" STRING NOT NULL,
    "sellerId" STRING NOT NULL,
    "amount" DECIMAL(65,30) DEFAULT 0.0,
    "transferGroupId" STRING DEFAULT '',
    "stripeTransferId" STRING DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payout_sellerId_idx" ON "Payout"("sellerId");

-- CreateIndex
CREATE INDEX "OrderItem_sellerId_idx" ON "OrderItem"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_phoneNumber_key" ON "Seller"("phoneNumber");
