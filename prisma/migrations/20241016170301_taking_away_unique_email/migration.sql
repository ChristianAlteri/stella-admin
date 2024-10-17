-- DropIndex
DROP INDEX "Seller_email_key";

-- AlterTable
ALTER TABLE "Seller" ALTER COLUMN "email" SET DEFAULT '';
