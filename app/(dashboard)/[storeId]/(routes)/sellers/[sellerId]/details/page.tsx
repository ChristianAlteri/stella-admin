import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Decimal } from "decimal.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  Heart,
  MousePointer,
  PercentSquare,
} from "lucide-react";
import Link from "next/link";
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
    stripe_connect_unique_id: seller?.stripe_connect_unique_id ?? "No Stripe ID",
    consignmentRate: seller?.consignmentRate ?? undefined,
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
  const orderConversionRate = calculateSellerOrderConversionRate(
    totalClicks,
    itemsSold
  );

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={seller?.billboard?.imageUrl}
                alt={`${seller?.firstName} ${seller?.lastName}`}
              />
              <AvatarFallback>
                {seller?.firstName?.[0]}
                {seller?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">
                {seller?.firstName} {seller?.lastName}
              </CardTitle>
              <Link
                href={`https://instagram.com/${seller?.instagramHandle}`}
                className="text-muted-foreground hover:underline flex items-center"
              >
                <Instagram className="mr-1 h-4 w-4" />@{seller?.instagramHandle}
              </Link>
            </div>
          </div>
          <CellAction data={sellerColumnData} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>{seller?.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <span>{seller?.phoneNumber}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>
                  {seller?.shippingAddress}, {seller?.country}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Badge variant="outline">{seller?.sellerType}</Badge>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  Joined:{" "}
                  {new Date(seller?.createdAt ?? "").toLocaleDateString()}
                </span>
              </div>
                <span>
                  Stripe Id:{" "}
                  {seller?.stripe_connect_unique_id}
                </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsSold}</div>
            <p className="text-xs text-muted-foreground">
              <Link
                href={`/${params.storeId}/products?sellerId=${params.sellerId}`}
                className="hover:underline"
              >
                View all products
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <PercentSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderConversionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatter.format(parseFloat(totalPayout))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Sale Price
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatter.format(parseFloat(averageSalePrice))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Products</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {liveProducts?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="mt-8">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="popularity">Popularity</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <RevenueByMonthChart monthlyRevenue={monthlyRevenue} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="popularity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Designers</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <PopularDesignerChart popularDesigners={popularDesigners} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <PopularCategoryChart salesByCategory={salesByCategory} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

//   return (
//     <div className="flex-col">
//       <div className="p-4">
//         <div className="flex flex-row gap-4 p-4 w-full justify-center items-center">
//           <Card className="w-full max-w-md mx-auto">
//             <CardHeader>
//               <div className="flex flex-row items-center justify-between w-full">
//                 <div className="w-full">
//                   <a
//                     className="text-gray-500 hover:underline hover:text-black"
//                     href={`https://instagram.com/${seller?.instagramHandle}`}
//                   >
//                     @{seller?.instagramHandle}
//                   </a>
//                 </div>
//                 <div className="w-full items-end justify-end text-right">
//                   {/* <CellAction data={seller as unknown as SellerColumn} /> */}
//                   <CellAction data={sellerColumnData} />
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-row justify-between gap-4">
//                 <div className="">
//                   <div>
//                     <strong>Name:</strong> {seller?.firstName}{" "}
//                     {seller?.lastName}
//                   </div>
//                   <div>
//                     <strong>Email:</strong> {seller?.email}
//                   </div>
//                   <div>
//                     <strong>Phone:</strong> {seller?.phoneNumber}
//                   </div>
//                 </div>

//                 <div className="">
//                   <>
//                     {seller?.billboard?.imageUrl.match(
//                       /https:\/\/.*\.(video|mp4|MP4|mov).*/
//                     ) ? (
//                       <video
//                         key={seller?.id}
//                         src={seller?.billboard?.imageUrl}
//                         width={"100%"}
//                         loop={true}
//                         //   playing={true}
//                         muted={true}
//                         //   alt={`Image from ${seller?.billboard?.imageUrl}`}
//                         className="rounded-md transition-opacity duration-200 ease-in-out"
//                       />
//                     ) : (
//                       <img
//                         key={seller?.id}
//                         src={seller?.billboard?.imageUrl!}
//                         alt={`Image from ${seller?.billboard?.imageUrl}`}
//                         width={100}
//                         height={0}
//                         loading="lazy"
//                         className="rounded-md transition-opacity duration-200 ease-in-out"
//                       />
//                     )}
//                   </>
//                 </div>
//               </div>

//               {/* Key Stats */}
//               <div className="grid grid-cols-3 gap-4 mt-6">
//                 <div>
//                   <a
//                     href={`/${params.storeId}/products?sellerId=${params.sellerId}`}
//                     className="text-gray-500 hover:underline hover:text-black"
//                   >
//                     Products Sold
//                   </a>
//                   <div>{seller?.soldCount}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Total Payouts</div>
//                   <div>{formatter.format(parseFloat(totalPayout))}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Joined</div>
//                   <div>{seller?.createdAt.toLocaleDateString()}</div>
//                 </div>
//               </div>

//               {/* Additional Stats */}
//               <div className="grid grid-cols-3 gap-4 mt-6">
//                 <div>
//                   <div className="text-gray-500">Avg. Sale Price</div>
//                   <div>{formatter.format(parseFloat(averageSalePrice))}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Total Likes</div>
//                   <div>{totalLikes}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Total Clicks</div>
//                   <div>{totalClicks}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500">Conversion Rate</div>
//                   <div>{orderConversionRate}%</div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <div className="w-1/2">
//             <RevenueByMonthChart monthlyRevenue={monthlyRevenue} />
//           </div>
//         </div>

//         <div className="flex flex-row gap-4 p-4 w-full justify-center items-center">
//           <PopularDesignerChart popularDesigners={popularDesigners} />
//           <PopularCategoryChart salesByCategory={salesByCategory} />
//         </div>
//       </div>
//     </div>
//   );
// };

export default SellerDetailsPage;