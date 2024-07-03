-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "billboardId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Designer" ALTER COLUMN "billboardId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "bottomSize" STRING DEFAULT '';
ALTER TABLE "Seller" ADD COLUMN     "charityName" STRING DEFAULT '';
ALTER TABLE "Seller" ADD COLUMN     "charityUrl" STRING DEFAULT '';
ALTER TABLE "Seller" ADD COLUMN     "shoeSize" INT4 DEFAULT 0;
ALTER TABLE "Seller" ADD COLUMN     "topSize" STRING DEFAULT '';
ALTER TABLE "Seller" ALTER COLUMN "billboardId" DROP NOT NULL;
