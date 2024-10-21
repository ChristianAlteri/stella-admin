"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";

import { Plus, PlusCircle, PlusSquare } from "lucide-react";
import { columns, BillboardColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";


interface BillboardClientProps {
    data: BillboardColumn[];
    // data: Billboard[];
  }
  
  export const BillboardClient: React.FC<BillboardClientProps> = ({
    data
  }) => {
    const params = useParams();
    const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${data.length})`}
          description="Manage your featured products"
        />
        <Button onClick={() => router.push(`/${params.storeId}/billboards/new`)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data}  />
    </>
  );
};
