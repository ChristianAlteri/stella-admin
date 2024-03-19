import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { MaterialColumn } from "./components/columns"
import { MaterialsClient } from "./components/client";

const MaterialsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const materials = await prismadb.material.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedMaterials: MaterialColumn[] = materials.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <MaterialsClient data={formattedMaterials} />
      </div>
    </div>
  );
};

export default MaterialsPage;
