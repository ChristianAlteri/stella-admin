import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { OrderColumn } from "./components/columns"
import { OrderClient } from "./components/client";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
      orderItems: {
        some: {
          sellerId: { not: "" },
          // stripe_connect_unique_id: { not: "" }
        }
      }
    },
    include:{
      orderItems: {
        include: {
          product: {
            include: {
              images: true 
            }
          },
          seller: true,
          soldByStaff: true,
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  console.log("ORDERSSSS", orders[0]);



  const formattedOrders: OrderColumn[] = orders.map((item) => {
    const uniqueSellers = Array.from(
      new Set(item.orderItems.map((orderItem) => orderItem.seller?.storeName || 'No Seller'))
    );
    const uniqueSellerIds = Array.from(
      new Set(item.orderItems.map((orderItem) => orderItem.seller?.id))
    );
    const uniqueStripeConnectIds = Array.from(
      new Set(item.orderItems.map((orderItem) => orderItem.seller.stripe_connect_unique_id || 'No Stripe ID'))
    );
    return {
      id: item.id,
      phone: item.phone,
      email: item.email,
      address: item.address,
      isPaid: item.isPaid,
      hasBeenDispatched: item.hasBeenDispatched,
      products: item.orderItems.map((orderItem) => orderItem.product.name), 
      productIds: item.orderItems.map((orderItem) => orderItem.product.id), 
      productImageUrls: item.orderItems.map((orderItem) =>
        orderItem.product.images.length > 0
          ? orderItem.product.images[0].url.replace(
              "stella-ecomm-media-bucket.s3.amazonaws.com",
              "d1t84xijak9ta1.cloudfront.net"
            )
          : 'No Image'
      ),
      sellers: uniqueSellers,
      sellerIds: uniqueSellerIds,
      stripe_connect_unique_id: uniqueStripeConnectIds,
      totalPrice: formatter.format(item.orderItems.reduce((total, item) => {
        return total + Number(item.product.ourPrice);
      }, 0)),
      totalRrpPrice: formatter.format(item.orderItems.reduce((total, item) => {
        return total + Number(item.product.retailPrice);
      }, 0)),
      // createdAt: format(item.createdAt, 'MMMM do, yyyy'),
      createdAt: item.createdAt,
    };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
