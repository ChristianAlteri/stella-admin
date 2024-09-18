"use client";

import { useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns, OrderColumn } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  const [showDispatched, setShowDispatched] = useState<boolean>(true);

  // Filter the data based on dispatched/not dispatched
  const filteredData = data.filter(order =>
    showDispatched ? order.hasBeenDispatched : !order.hasBeenDispatched
  );

  return (
    <>
      <Heading
        title={`Orders (${filteredData.length})`}
        description="Manage your orders"
      />
      <Separator />
      
      {/* Toggle between dispatched/not dispatched orders */}
      <div className="flex justify-end items-center">
        <Button onClick={() => setShowDispatched(prev => !prev)}>
          {showDispatched ? "Not Dispatched Orders" : "Dispatched Orders"}
        </Button>
      </div>
      
      <Separator />
      
      <DataTable columns={columns} data={filteredData}  />
      <Separator />
    </>
  );
};
