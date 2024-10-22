import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { PayoutColumn } from "./components/columns";
import { PayoutClient } from "./components/client";

const PayoutsPage = async ({ params }: { params: { storeId: string } }) => {
  const payouts = await prismadb.payout.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      seller: true,
      store: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    },
  })

  const formattedPayouts: PayoutColumn[] = payouts.map((item) => {
    return {
      id: item.id,
      sellerId: item.sellerId ?? "No Seller ID",
      storeName: item.seller?.storeName ?? item.seller?.instagramHandle ?? "No Store Name",
      storeStripeId:
        item.store?.stripe_connect_unique_id ?? "No Store Stripe ID",
      sellerHandle:
        item.seller?.instagramHandle ?? item.store?.name ?? "No Name",
      sellerEmail: item.seller?.email ?? "No Email",
      sellerStripConnect:
        item.seller?.stripe_connect_unique_id ??
        item.store?.stripe_connect_unique_id ??
        "No Stripe ID",
      amount: Number(item.amount).toFixed(2),
      transferGroupId: item.transferGroupId ?? "",
      stripeTransferId: item.stripeTransferId ?? "",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      countryCode: store?.countryCode || "GB"
    };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <PayoutClient data={formattedPayouts} />
      </div>
    </div>
  );
};

export default PayoutsPage;
