import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { ProductColumn } from "./components/columns"
import { ProductClient } from "./components/client";

import { formatter } from "@/lib/utils";


const ProductsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      designer: true,
      seller: true,
      category: true,
      color: true,
      size: true,
      gender: true,
      subcategory: true,
      condition: true,
      images: true,
      material: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // console.log("ALL PRODUCTS", products);
  // console.log("Images", products[0].images[0].url);

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    isOnSale: item.isOnSale,
    isCharity: item.isCharity,
    isHidden: item.isHidden,
    ourPrice: formatter.format(item.ourPrice.toNumber()),
    retailPrice: formatter.format(item.retailPrice.toNumber()),
    likes: item.likes,
    clicks: item.clicks,
    category: item.category.name,
    designer: item.designer.name,
    sellerHandle: item.seller.instagramHandle,
    size: item.size.name,
    color: item.color.value,
    condition: item.condition.value,
    material: item.material.value,
    gender: item.gender.value,
    subcategory: item.subcategory.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    imageUrl: item.images[0].url,
    designerId: item.designerId,
    categoryId: item.categoryId,
    sellerId: item.seller.id,
    storeId: item.storeId,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
