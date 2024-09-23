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
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedPayouts: PayoutColumn[] = payouts.map((item) => {
    return {
      id: item.id,
      sellerId: item.sellerId,
      sellerHandle: item.seller.instagramHandle ?? '',
      sellerEmail: item.seller.email ?? '',
      sellerStripConnect: item.seller.stripe_connect_unique_id ?? 'No Stripe ID',
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
