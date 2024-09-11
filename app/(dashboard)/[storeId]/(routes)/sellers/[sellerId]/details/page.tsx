import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Decimal } from "decimal.js";
import {
  getPopularDesigners,
  getSalesByCategory,
  getTotalLikesAndClicks,
  calculateAverageSalePrice,
  calculateTotalPayout,
  formatter,
  calculateMonthlyRevenue,
  calculateSellerOrderConversionRate,
} from "@/lib/utils";
import PopularDesignerChart from "./components/popular-designer-chart";
import PopularCategoryChart from "./components/popular-category-chart";
import { CellAction } from "../../components/cell-action";
import { SellerColumn } from "../../components/columns";
import RevenueByMonthChart from "./components/revenue-by-month-chart";

const SellerDetailsPage = async ({
  params,
}: {
  params: { storeId: string; sellerId: string };
}) => {
  const seller = await prismadb.seller.findUnique({
    where: {
      id: params.sellerId,
    },
    include: {
      billboard: true,
      payouts: {
        where: { sellerId: params.sellerId },
        orderBy: { createdAt: "desc" },
      },
      orderedItems: { include: { order: true } },
      products: {
        include: {
          images: true,
          designer: true,
          seller: true,
          category: true,
          size: true,
          color: true,
        },
      },
    },
  });

  // console.log("SELLER: ", seller);

  const orders = await prismadb.orderItem.findMany({
    where: {
      sellerId: params.sellerId,
    },
    distinct: ["orderId"], // Fetch distinct orders based on the orderId
    include: {
      order: true,
      product: true,
    },
  });



  const sellerColumnData: SellerColumn = {
    id: seller?.id ?? "",
    instagramHandle: seller?.instagramHandle ?? "",
    firstName: seller?.firstName ?? "",
    lastName: seller?.lastName ?? "",
    email: seller?.email ?? "",
    phoneNumber: seller?.phoneNumber ?? "",
    shippingAddress: seller?.shippingAddress ?? "",
    country: seller?.country ?? "",
    createdAt: seller?.createdAt.toISOString() ?? "",
    productsUrl: `/${params.storeId}/products?sellerId=${seller?.id}`,
    storeId: params.storeId,
    sellerId: seller?.id ?? "",
    imageUrl: seller?.billboard?.imageUrl ?? "",
    charityName: seller?.charityName ?? "",
    charityUrl: seller?.charityUrl ?? "",
    shoeSizeEU: seller?.shoeSizeEU ?? "",
    topSize: seller?.topSize ?? "",
    bottomSize: seller?.bottomSize ?? "",
    sellerType: seller?.sellerType ?? "",
    description: seller?.description ?? "",
    storeName: seller?.storeName ?? "",
  };

  const archivedProducts = seller?.products.filter(
    (product) => product.isArchived
  );
  const liveProducts = seller?.products.filter(
    (product) => !product.isArchived
  );

  const productsWithNumberPrices = (archivedProducts || []).map((product) => ({
    ...product,
    ourPrice: (product.ourPrice as Decimal).toNumber(),
    retailPrice: (product.retailPrice as Decimal).toNumber(),
    likes: product.likes || 0,
    clicks: product.clicks || 0,
  }));
  const monthlyRevenue = calculateMonthlyRevenue(seller?.payouts || []);
  const popularDesigners = getPopularDesigners(productsWithNumberPrices);
  const salesByCategory = getSalesByCategory(productsWithNumberPrices);
  const { totalLikes, totalClicks } = getTotalLikesAndClicks(
    productsWithNumberPrices
  );
  const averageSalePrice = calculateAverageSalePrice(productsWithNumberPrices);
  const totalPayout = calculateTotalPayout(seller?.payouts || []);
  const itemsSold = seller?.soldCount || 0;
  const orderConversionRate = calculateSellerOrderConversionRate(totalClicks, itemsSold);
  // const orderConversionRate = calculateSellerOrderConversionRate(seller, seller?.payouts || [], orders, seller?.products || []);
  // console.log("orderConversionRate: ", orderConversionRate);

  return (
    <div className="flex-col">
      <div className="p-4">
        <div className="flex flex-row gap-4 p-4 w-full justify-center items-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex flex-row items-center justify-between w-full">
                <div className="w-full">
                  <a
                    className="text-gray-500 hover:underline hover:text-black"
                    href={`https://instagram.com/${seller?.instagramHandle}`}
                  >
                    @{seller?.instagramHandle}
                  </a>
                </div>
                <div className="w-full items-end justify-end text-right">
                  {/* <CellAction data={seller as unknown as SellerColumn} /> */}
                  <CellAction data={sellerColumnData} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-between gap-4">
                <div className="">
                  <div>
                    <strong>Name:</strong> {seller?.firstName}{" "}
                    {seller?.lastName}
                  </div>
                  <div>
                    <strong>Email:</strong> {seller?.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {seller?.phoneNumber}
                  </div>
                </div>

                <div className="">
                  <>
                    {seller?.billboard?.imageUrl.match(
                      /https:\/\/.*\.(video|mp4|MP4|mov).*/
                    ) ? (
                      <video
                        key={seller?.id}
                        src={seller?.billboard?.imageUrl}
                        width={"100%"}
                        loop={true}
                        //   playing={true}
                        muted={true}
                        //   alt={`Image from ${seller?.billboard?.imageUrl}`}
                        className="rounded-md transition-opacity duration-200 ease-in-out"
                      />
                    ) : (
                      <img
                        key={seller?.id}
                        src={seller?.billboard?.imageUrl!}
                        alt={`Image from ${seller?.billboard?.imageUrl}`}
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
                  <a
                    href={`/${params.storeId}/products?sellerId=${params.sellerId}`}
                    className="text-gray-500 hover:underline hover:text-black"
                  >
                    Products Sold
                  </a>
                  <div>{seller?.soldCount}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Payouts</div>
                  <div>{formatter.format(parseFloat(totalPayout))}</div>
                </div>
                <div>
                  <div className="text-gray-500">Joined</div>
                  <div>{seller?.createdAt.toLocaleDateString()}</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <div className="text-gray-500">Avg. Sale Price</div>
                  <div>{formatter.format(parseFloat(averageSalePrice))}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Likes</div>
                  <div>{totalLikes}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Clicks</div>
                  <div>{totalClicks}</div>
                </div>
                <div>
                  <div className="text-gray-500">Conversion Rate</div>
                  <div>{orderConversionRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="w-1/2">
            <RevenueByMonthChart monthlyRevenue={monthlyRevenue} />
          </div>
        </div>

        <div className="flex flex-row gap-4 p-4 w-full justify-center items-center">
          <PopularDesignerChart popularDesigners={popularDesigners} />
          <PopularCategoryChart salesByCategory={salesByCategory} />
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsPage;
