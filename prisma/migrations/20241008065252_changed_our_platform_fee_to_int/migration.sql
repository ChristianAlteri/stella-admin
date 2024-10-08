/*
  Warnings:

  - You are about to alter the column `our_platform_fee` on the `Store` table. The data in that column could be lost. The data in that column will be cast from `Int8` to `Int4`.

*/
-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "our_platform_fee" SET DATA TYPE INT4;
