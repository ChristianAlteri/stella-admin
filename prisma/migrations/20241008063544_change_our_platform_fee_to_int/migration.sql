/*
  Warnings:

  - The `our_platform_fee` column on the `Store` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Store" 
ALTER COLUMN "our_platform_fee" TYPE INTEGER USING (ROUND("our_platform_fee" * 100)::INTEGER);

ALTER TABLE "Store" 
ALTER COLUMN "our_platform_fee" SET DEFAULT 5;
