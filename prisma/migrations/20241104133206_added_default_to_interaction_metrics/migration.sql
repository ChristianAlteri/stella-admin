-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "totalSales" SET DEFAULT 0;
ALTER TABLE "Staff" ALTER COLUMN "targetTotalSales" SET DEFAULT 0;
ALTER TABLE "Staff" ALTER COLUMN "totalTransactionCount" SET DEFAULT 0;
ALTER TABLE "Staff" ALTER COLUMN "targetTotalTransactionCount" SET DEFAULT 0;
ALTER TABLE "Staff" ALTER COLUMN "totalItemsSold" SET DEFAULT 0;
ALTER TABLE "Staff" ALTER COLUMN "targetTotalItemsSold" SET DEFAULT 0;
ALTER TABLE "Staff" ALTER COLUMN "returningCustomers" SET DEFAULT 0;
ALTER TABLE "Staff" ALTER COLUMN "targetReturningCustomers" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "totalItemsPurchased" SET DEFAULT 0;
ALTER TABLE "User" ALTER COLUMN "totalPurchases" SET DEFAULT 0;
ALTER TABLE "User" ALTER COLUMN "totalTransactionCount" SET DEFAULT 0;
