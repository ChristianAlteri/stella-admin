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

  return outstandingOrders;
};