-- CreateTable
CREATE TABLE "Store" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "name" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geoLocation" STRING,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billboard" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "label" STRING NOT NULL,
    "imageUrl" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" STRING NOT NULL,
    "instagramHandle" STRING NOT NULL,
    "name" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storeId" STRING NOT NULL,
    "billboardId" STRING NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "billboardId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "clicks" INT4 DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designer" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "billboardId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "retailPrice" DECIMAL(65,30) NOT NULL,
    "ourPrice" DECIMAL(65,30) NOT NULL,
    "measurements" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likes" INT4 DEFAULT 0,
    "clicks" INT4 DEFAULT 0,
    "isOnSale" BOOL NOT NULL DEFAULT false,
    "isFeatured" BOOL NOT NULL DEFAULT false,
    "isArchived" BOOL NOT NULL DEFAULT false,
    "isCharity" BOOL NOT NULL DEFAULT false,
    "storeId" STRING NOT NULL,
    "categoryId" STRING NOT NULL,
    "designerId" STRING NOT NULL,
    "sellerId" STRING NOT NULL,
    "sizeId" STRING NOT NULL,
    "colorId" STRING NOT NULL,
    "conditionId" STRING NOT NULL,
    "materialId" STRING NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "isPaid" BOOL NOT NULL DEFAULT false,
    "hasBeenDispatched" BOOL NOT NULL DEFAULT false,
    "phone" STRING NOT NULL DEFAULT '',
    "address" STRING NOT NULL DEFAULT '',
    "email" STRING NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" STRING NOT NULL,
    "orderId" STRING NOT NULL,
    "productId" STRING NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "url" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SellerToCategory" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_SellerToDesigner" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE INDEX "Billboard_storeId_idx" ON "Billboard"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_instagramHandle_key" ON "Seller"("instagramHandle");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_name_key" ON "Seller"("name");

-- CreateIndex
CREATE INDEX "Seller_billboardId_idx" ON "Seller"("billboardId");

-- CreateIndex
CREATE INDEX "Seller_storeId_idx" ON "Seller"("storeId");

-- CreateIndex
CREATE INDEX "Category_storeId_idx" ON "Category"("storeId");

-- CreateIndex
CREATE INDEX "Category_billboardId_idx" ON "Category"("billboardId");

-- CreateIndex
CREATE INDEX "Designer_storeId_idx" ON "Designer"("storeId");

-- CreateIndex
CREATE INDEX "Designer_billboardId_idx" ON "Designer"("billboardId");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_sizeId_idx" ON "Product"("sizeId");

-- CreateIndex
CREATE INDEX "Product_colorId_idx" ON "Product"("colorId");

-- CreateIndex
CREATE INDEX "Product_conditionId_idx" ON "Product"("conditionId");

-- CreateIndex
CREATE INDEX "Product_materialId_idx" ON "Product"("materialId");

-- CreateIndex
CREATE INDEX "Product_designerId_idx" ON "Product"("designerId");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Size_storeId_idx" ON "Size"("storeId");

-- CreateIndex
CREATE INDEX "Color_storeId_idx" ON "Color"("storeId");

-- CreateIndex
CREATE INDEX "Material_storeId_idx" ON "Material"("storeId");

-- CreateIndex
CREATE INDEX "Condition_storeId_idx" ON "Condition"("storeId");

-- CreateIndex
CREATE INDEX "Image_productId_idx" ON "Image"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "_SellerToCategory_AB_unique" ON "_SellerToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_SellerToCategory_B_index" ON "_SellerToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SellerToDesigner_AB_unique" ON "_SellerToDesigner"("A", "B");

-- CreateIndex
CREATE INDEX "_SellerToDesigner_B_index" ON "_SellerToDesigner"("B");
