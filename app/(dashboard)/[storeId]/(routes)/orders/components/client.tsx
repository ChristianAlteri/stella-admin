"use client";


import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";



import { columns, OrderColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";



interface OrderClientProps {
    data: OrderColumn[];
    // data: Billboard[];
  }
  
  export const OrderClient: React.FC<OrderClientProps> = ({
    data
  }) => {
    const params = useParams();
    const router = useRouter();
  return (
    <>
        <Heading
          title={`Orders (${data.length})`}
          description="Manage your orders"
        />
      <Separator />
      <DataTable columns={columns} data={data} searchKey="products" />
      <Separator />
    </>
  );
};
