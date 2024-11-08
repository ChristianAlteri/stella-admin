-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" STRING;
ALTER TABLE "User" ADD COLUMN     "postalCode" STRING;
ALTER TABLE "User" ADD COLUMN     "totalItemsPurchased" INT4;
ALTER TABLE "User" ADD COLUMN     "totalPurchases" INT4;
ALTER TABLE "User" ADD COLUMN     "totalTransactionCount" INT4;
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "name" SET DEFAULT '';
