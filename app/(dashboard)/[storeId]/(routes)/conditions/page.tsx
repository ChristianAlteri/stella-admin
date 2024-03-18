import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { ConditionColumn } from "./components/columns"
import { ConditionsClient } from "./components/client";

const ConditionsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const conditions = await prismadb.condition.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedConditions: ConditionColumn[] = conditions.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ConditionsClient data={formattedConditions} />
      </div>
    </div>
  );
};

export default ConditionsPage;
