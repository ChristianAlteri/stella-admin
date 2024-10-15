/*
  Warnings:

  - Made the column `sellerId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "sellerId" SET NOT NULL;
