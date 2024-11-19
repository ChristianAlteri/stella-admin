import prismadb from "@/lib/prismadb";

import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params
}: {
  params: { productId: string, storeId: string }
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
    }
  });

  // Replace S3 URLs with CDN URLs
  const productWithCDN = product
    ? {
        ...product,
        images: product.images.map((img) => ({
          ...img,
          url: img.url.replace("stella-ecomm-media-bucket.s3.amazonaws.com", "d1t84xijak9ta1.cloudfront.net"),
        })),
      }
    : null;

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const designers = await prismadb.designer.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const sellers = await prismadb.seller.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const conditions = await prismadb.condition.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const materials = await prismadb.material.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const subcategories = await prismadb.subcategory.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const genders = await prismadb.gender.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    },
  })


  return ( 
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <ProductForm 
          countryCode={store?.countryCode || "GB"}
          categories={categories} 
          designers={designers}
          colors={colors}
          sizes={sizes}
          conditions={conditions}
          materials={materials}
          sellers={sellers}
          initialData={productWithCDN}
          subcategories={subcategories}
          genders={genders}
        />
      </div>
    </div>
  );
}

export default ProductPage;
