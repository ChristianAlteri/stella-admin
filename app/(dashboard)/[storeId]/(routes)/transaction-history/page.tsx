import prismadb from "@/lib/prismadb";
import { TransactionHistoryClient } from "./components/client";
import { convertDecimalsToNumbers } from "@/lib/utils";

const TransactionHistoryPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      Payout: true,
      orderHistoryUsers: true,
      orderItems: {
        include: {
          product: {
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
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    },
  });
  const plainOrders = convertDecimalsToNumbers(orders);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <TransactionHistoryClient
          orders={plainOrders}
          //   sellers={[]}
          countryCode={store?.countryCode || "GB"}
        />
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
