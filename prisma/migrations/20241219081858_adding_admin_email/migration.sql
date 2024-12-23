-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "adminEmail" STRING NOT NULL DEFAULT 'alteri.christian@gmail.com';

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "companyId" DROP DEFAULT;
