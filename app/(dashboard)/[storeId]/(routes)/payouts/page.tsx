import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

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
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="w-full h-full">
          <div>transferGroupId</div>
          {payouts.map((payout) => (
            <div key={payout.id}>
              <p>Amount: {formatter.format(Number(payout.amount) || 0)}</p>
              <p>Created At: {format(new Date(payout.createdAt), 'MM/dd/yyyy')}</p>
              <p>Transfer Group ID: {payout.transferGroupId}</p>
              <a className="hover:underline" href={`sellers/${payout.sellerId}/details`}>Seller ID: {payout.sellerId}</a>
              <br />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PayoutsPage;
