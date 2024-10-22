import StripeTerminal from "./components/stripe-terminal"
import prismadb from "@/lib/prismadb";

interface PointOfSalePageProps {
  params: {
    storeId: string;
  };
}

const PointOfSalePage: React.FC<PointOfSalePageProps> = async ({ params }) => {
  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    }
  })
  return (
    
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
          <StripeTerminal countryCode={store?.countryCode || "GB"} />
        </div>
    </div>
  )
}

export default PointOfSalePage
