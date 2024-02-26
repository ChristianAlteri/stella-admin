import prismadb from "@/lib/prismadb";

export const getoutStandingOrders = async (storeId: string) => {
  const outstandingOrders = await prismadb.order.findMany({
    where: {
      storeId,
      hasBeenDispatched: false,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  const modifiedOrders = outstandingOrders.map(order => ({
    ...order,
    orderItems: order.orderItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        retailPrice: item.product.retailPrice.toString(), // Convert Decimal to String
        ourPrice: item.product.ourPrice.toString(), // Convert Decimal to String
      },
    })),
  }));

  return modifiedOrders;
};