-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "staffId" STRING;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "storeId" STRING;

-- CreateTable
CREATE TABLE "Staff" (
    "id" STRING NOT NULL,
    "email" STRING,
    "name" STRING,
    "staffType" STRING DEFAULT 'Client Advisor',
    "storeId" STRING,
    "orderId" STRING,
    "totalSales" INT4,
    "targetTotalSales" INT4,
    "totalTransactionCount" INT4,
    "targetTotalTransactionCount" INT4,
    "totalItemsSold" INT4,
    "targetTotalItemsSold" INT4,
    "returningCustomers" INT4,
    "targetReturningCustomers" INT4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FollowingSeller" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_OrderHistory" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToUserClicks" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToUserLikes" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_PurchaseHistory" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_UserToStaff" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_storeId_idx" ON "Staff"("storeId");

-- CreateIndex
CREATE INDEX "Staff_orderId_idx" ON "Staff"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "_FollowingSeller_AB_unique" ON "_FollowingSeller"("A", "B");

-- CreateIndex
CREATE INDEX "_FollowingSeller_B_index" ON "_FollowingSeller"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderHistory_AB_unique" ON "_OrderHistory"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderHistory_B_index" ON "_OrderHistory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToUserClicks_AB_unique" ON "_ProductToUserClicks"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToUserClicks_B_index" ON "_ProductToUserClicks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToUserLikes_AB_unique" ON "_ProductToUserLikes"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToUserLikes_B_index" ON "_ProductToUserLikes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PurchaseHistory_AB_unique" ON "_PurchaseHistory"("A", "B");

-- CreateIndex
CREATE INDEX "_PurchaseHistory_B_index" ON "_PurchaseHistory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToStaff_AB_unique" ON "_UserToStaff"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToStaff_B_index" ON "_UserToStaff"("B");

-- CreateIndex
CREATE INDEX "OrderItem_staffId_idx" ON "OrderItem"("staffId");

-- CreateIndex
CREATE INDEX "User_storeId_idx" ON "User"("storeId");
