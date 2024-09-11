import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { SellerColumn } from "./components/columns"
import { SellerClient } from "./components/client";

const SellerPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const sellers = await prismadb.seller.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      designers: true,
      categories: true,
      products: true,
      billboard: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // console.log("Sellers FRONT END", sellers);

  const formattedSellers: SellerColumn[] = sellers.map((item) => ({
    id: item.id,
    instagramHandle: item.instagramHandle,
    firstName: item.firstName ?? '', // Provide a default value of an empty string when firstName is null
    lastName: item.lastName ?? '',
    email: item.email ?? '',
    phoneNumber: item.phoneNumber ?? '',
    shippingAddress: item.shippingAddress ?? '',
    country: item.country ?? '',
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    storeId: item.storeId,
    billboardLabel: item.billboard?.label || '',
    imageUrl: item.billboard?.imageUrl || '',
    productsUrl: `/api/${params.storeId}/sellers/products`,
    designerId: item.designers[0]?.id,
    sellerId: item.id,
    charityName: item.charityName || '',
    charityUrl: item.charityUrl || '',
    shoeSizeEU: item.shoeSizeEU || '',
    topSize: item.topSize || '',
    bottomSize: item.bottomSize || '',
    sellerType: item.sellerType || '',
    description: item.description || '',
    storeName: item.storeName || '',
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SellerClient data={formattedSellers} />
      </div>
    </div>
  );
};

export default SellerPage;
