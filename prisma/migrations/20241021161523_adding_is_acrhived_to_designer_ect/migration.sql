-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Designer" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Gender" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Size" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "isArchived" BOOL NOT NULL DEFAULT false;
