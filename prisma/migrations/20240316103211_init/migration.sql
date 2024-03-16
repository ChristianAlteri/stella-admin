/*
  Warnings:

  - You are about to drop the column `location` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "location";
ALTER TABLE "Product" DROP COLUMN "sex";
