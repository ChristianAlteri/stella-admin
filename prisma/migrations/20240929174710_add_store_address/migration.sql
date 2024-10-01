-- AlterTable
ALTER TABLE "Seller" ALTER COLUMN "sellerType" SET DEFAULT 're-seller';

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "addressId" STRING;

-- CreateTable
CREATE TABLE "StoreAddress" (
    "id" STRING NOT NULL,
    "city" STRING,
    "country" STRING,
    "line1" STRING,
    "line2" STRING,
    "postalCode" STRING,
    "state" STRING,

    CONSTRAINT "StoreAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Store_addressId_idx" ON "Store"("addressId");
