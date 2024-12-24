-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "adminEmail" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "sizeId" DROP NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "subcategoryId" DROP NOT NULL;
