import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { DesignerColumn } from "./components/columns"
import { DesignerClient } from "./components/client";

const DesignerPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const designers = await prismadb.designer.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      billboard: true,
      products: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // console.log("DESIGNERS", designers);

  const formattedDesigners: DesignerColumn[] = designers.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard?.label,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    imageUrl: item.billboard?.imageUrl,
    productsUrl: `/api/${params.storeId}/designers/products`
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DesignerClient data={formattedDesigners} />
      </div>
    </div>
  );
};

export default DesignerPage;
