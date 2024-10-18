import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { GenderColumn } from "./components/columns"
import { GenderClient } from "./components/client";

const GendersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const genders = await prismadb.gender.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedGenders: GenderColumn[] = genders.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value || "",
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <GenderClient data={formattedGenders} />
      </div>
    </div>
  );
};

export default GendersPage;
