import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Decimal } from "decimal.js";
import { CellAction } from "../../components/cell-action";
import { ProductColumn } from "../../components/columns";
import { formatter } from "@/lib/utils";

const ProductDetailsPage = async ({
  params,
}: {
  params: { storeId: string; productId: string };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      designer: true,
      store: true,
      category: true,
      condition: true,
      color: true,
      material: true,
      size: true,
      subcategory: true,
      gender: true,
      images: true,
    },
  });




//   const formattedProducts: ProductColumn[] = products.map((item) => ({
//     id: item.id,
//     name: item.name,
//     description: item.description,
//     isFeatured: item.isFeatured,
//     isArchived: item.isArchived,
//     isOnSale: item.isOnSale,
//     isCharity: item.isCharity,
//     isHidden: item.isHidden,
//     ourPrice: formatter.format(item.ourPrice.toNumber()),
//     retailPrice: formatter.format(item.retailPrice.toNumber()),
//     likes: item.likes,
//     clicks: item.clicks,
//     category: item.category.name,
//     designer: item.designer.name,
//     productHandle: item.product.instagramHandle,
//     size: item.size.name,
//     color: item.color.value,
//     condition: item.condition.value,
//     material: item.material.value,
//     gender: item.gender.value,
//     subcategory: item.subcategory.value,
//     createdAt: format(item.createdAt, "MMMM do, yyyy"),
//     imageUrl: item.images[0].url,
//     designerId: item.designerId,
//     categoryId: item.categoryId,
//     productId: item.product.id,
//     storeId: item.storeId,
//   }));

  


  return (
    <div className="flex-col">
      <div className="p-4">
        <div className="flex flex-row gap-4 p-4 w-full justify-center items-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex flex-row items-center justify-between w-full">
                <div className="w-full">
                  <a
                    className="text-gray-500 hover:underline hover:text-black">
                    {product?.designer.toString()}
                  </a>
                </div>
                <div className="w-full items-end justify-end text-right">
                  {/* <CellAction data={product} /> */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-between gap-4">
                <div className="">
                  <div>
                    <strong>Name:</strong> {product?.name}{" "}
                    {product?.category.toString()}
                  </div>
                  <div>
                    <strong>Email:</strong> {product?.ourPrice.toString()}
                  </div>
                  <div>
                    <strong>Phone:</strong> {product?.retailPrice.toString()}
                  </div>
                </div>

                <div className="">
                  <>
                    {product?.images[0]?.url.match(
                      /https:\/\/.*\.(video|mp4|MP4|mov).*/
                    ) ? (
                      <video
                        key={product?.id}
                        src={product?.images[0]?.url}
                        width={"100%"}
                        loop={true}
                        //   playing={true}
                        muted={true}
                        //   alt={`Image from ${product?.billboard?.imageUrl}`}
                        className="rounded-md transition-opacity duration-200 ease-in-out"
                      />
                    ) : (
                      <img
                        key={product?.id}
                        src={product?.images[0]?.url!}
                        alt={`Image from ${product?.images[0]?.url}`}
                        width={100}
                        height={0}
                        loading="lazy"
                        className="rounded-md transition-opacity duration-200 ease-in-out"
                      />
                    )}
                  </>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <div>Clicks: {product?.clicks}</div>
                  <div>Likes: {product?.likes}</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <div className="text-gray-500">Color</div>
                  <div>{product?.color.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Color</div>
                  <div>{product?.material.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Color</div>
                  <div>{product?.size.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Color</div>
                  <div>{product?.gender.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Color</div>
                  <div>{product?.subcategory.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Color</div>
                  <div>{product?.isCharity}</div>
                  <div>{product?.isFeatured}</div>
                  <div>{product?.isOnSale}</div>
                  <div>{product?.isHidden}</div>
                  <div>{product?.isArchived}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
