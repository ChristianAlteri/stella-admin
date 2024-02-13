import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { ProductColumn } from "./components/columns"
import { ProductClient } from "./components/client";

import { formatter } from "@/lib/utils";
// import a geolocation formatter function

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
      category: true,
      color: true,
      size: true,
      images: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // console.log("ALL PRODUCTS", products);

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    isOnSale: item.isOnSale,
    ourPrice: formatter.format(item.ourPrice.toNumber()),
    retailPrice: formatter.format(item.retailPrice.toNumber()),
    location: item.location || null,
    condition: item.condition,
    sex: item.sex,
    material: item.material,
    measurements: item.measurements,
    likes: item.likes,
    clicks: item.clicks,
    reference: item.reference,
    category: item.category.name,
    designer: item.designer.name,
    size: item.size.name,
    color: item.color.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    // imageUrl: item.images.
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
