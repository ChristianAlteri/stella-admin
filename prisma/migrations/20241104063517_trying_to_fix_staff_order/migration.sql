/*
  Warnings:

  - You are about to drop the `_StaffToOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StaffToOrderItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "soldByStaffId" STRING;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "soldByStaffId" STRING;

-- DropTable
DROP TABLE "_StaffToOrder";

-- DropTable
DROP TABLE "_StaffToOrderItems";

-- CreateIndex
CREATE INDEX "Order_soldByStaffId_idx" ON "Order"("soldByStaffId");

-- CreateIndex
CREATE INDEX "OrderItem_soldByStaffId_idx" ON "OrderItem"("soldByStaffId");
