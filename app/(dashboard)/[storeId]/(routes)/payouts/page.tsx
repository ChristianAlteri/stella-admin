import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { PayoutColumn } from "./components/columns";
import { PayoutClient } from "./components/client";

const PayoutsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const payouts = await prismadb.payout.findMany({
    where: {
      // storeId: params.storeId
      // TODO: Add storeId to the payout table
    },
    include: {
      seller: true,
      store: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedPayouts: PayoutColumn[] = payouts.map((item) => {
    return {
      id: item.id,
      sellerId: item.sellerId ?? 'No Seller ID',
      storeStripeId: item.store?.stripe_connect_unique_id ?? 'No Store Stripe ID',
      sellerHandle: item.seller?.instagramHandle ?? item.store?.name ?? 'No Name',
      sellerEmail: item.seller?.email ?? 'No Email',
      sellerStripConnect: item.seller?.stripe_connect_unique_id ?? item.store?.stripe_connect_unique_id ?? 'No Stripe ID',
      amount: Number(item.amount).toFixed(2),
      transferGroupId: item.transferGroupId ?? '',
      stripeTransferId: item.stripeTransferId ?? '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="w-full h-full">
          <PayoutClient data={formattedPayouts} />
        </div>
      </div>
    </div>
  );
};

export default PayoutsPage;