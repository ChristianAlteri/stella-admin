import { format } from "date-fns";
import prismadb from "@/lib/prismadb";

import { ProductColumn } from "./components/columns";
import { ProductClient } from "./components/client";

import { formatter } from "@/lib/utils";

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  const products = await prismadb.product.findMany({
    where: { storeId: params.storeId },
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
      material: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const sellers = await prismadb.seller.findMany({
    where: { storeId: params.storeId },
    select: {
      id: true,
      instagramHandle: true,
      storeName: true,
    },
  });
  const categories = await prismadb.category.findMany({
    where: { storeId: params.storeId },
    select: {
      id: true,
      name: true,
    },
  });
  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    isOnSale: item.isOnSale,
    isCharity: item.isCharity,
    isHidden: item.isHidden,
    isOnline: item.isOnline,
    ourPrice: item.ourPrice.toString(),
    originalPrice: item.originalPrice ? item.originalPrice.toString() : "",
    retailPrice: item.retailPrice ? item.retailPrice.toString() : "",
    likes: item.likes,
    clicks: item.clicks,
    category: item.category.name,
    designer: item.designer.name,
    sellerHandle: item.seller?.instagramHandle || "",
    sellerStoreName: item.seller?.storeName || "",
    size: item.size.name,
    color: item.color?.name || "",
    condition: item.condition?.name || "",
    material: item.material?.name || "",
    gender: item.gender?.name || "",
    subcategory: item.subcategory.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
    // CDN url
    imageUrl: item.images?.[0]?.url
      ? item.images[0].url.replace(
          "stella-ecomm-media-bucket.s3.amazonaws.com",
          "d1t84xijak9ta1.cloudfront.net"
        )
      : "https://stella-ecomm-media-bucket.s3.amazonaws.com/uploads/mobilehome.jpg",
    designerId: item.designerId,
    categoryId: item.categoryId,
    sellerId: item.seller?.id || "",
    storeId: item.storeId,
    consignmentRate: item.seller.consignmentRate || store?.consignmentRate || 0,
    countryCode: store?.countryCode || "GB",
    staffId: item.staffId || "",
    userId: item.userId || "",
  }));

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <ProductClient
          data={formattedProducts}
          sellers={sellers}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
