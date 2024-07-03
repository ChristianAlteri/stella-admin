import prismadb from "@/lib/prismadb";
import { SellerForm } from "./components/seller-form";



const SellerPage = async ({
  params
}: {
  params: { sellerId: string, storeId: string }
}) => {
  const seller = await prismadb.seller.findUnique({
    where: {
      id: params.sellerId
    }
  });

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId
    }
  })

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SellerForm billboards={billboards} initialData={seller} />
      </div>
    </div>
  );
}

export default SellerPage;
