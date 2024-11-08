-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;
