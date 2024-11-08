/*
  Warnings:

  - You are about to drop the column `staffId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Staff` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "OrderItem_staffId_idx";

-- DropIndex
DROP INDEX "Staff_orderId_idx";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "staffId";

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "orderId";

-- CreateTable
CREATE TABLE "_StaffToOrder" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_StaffToOrderItems" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StaffToOrder_AB_unique" ON "_StaffToOrder"("A", "B");

-- CreateIndex
CREATE INDEX "_StaffToOrder_B_index" ON "_StaffToOrder"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StaffToOrderItems_AB_unique" ON "_StaffToOrderItems"("A", "B");

-- CreateIndex
CREATE INDEX "_StaffToOrderItems_B_index" ON "_StaffToOrderItems"("B");
