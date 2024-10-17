-- DropIndex
DROP INDEX "Seller_phoneNumber_key";

-- AlterTable
ALTER TABLE "Seller" ALTER COLUMN "phoneNumber" SET DEFAULT '';
