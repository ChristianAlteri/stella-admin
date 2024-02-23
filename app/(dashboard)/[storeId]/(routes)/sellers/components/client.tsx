"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";

import { Image, Plus, PlusCircle, PlusSquare } from "lucide-react";
import { columns, SellerColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";


interface SellerClientProps {
    data: SellerColumn[];
    // data: Billboard[];
  }
  
  export const SellerClient: React.FC<SellerClientProps> = ({
    data
  }) => {
    const params = useParams();
    const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Sellers (${data.length})`}
          description="Manage your Sellers"
        />

        <Button onClick={() => router.push(`/${params.storeId}/sellers/new`)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="instagram" />
      <Heading title="API" description="API call for Sellers" />
      <Separator />
      <div>IS THIS NECCESARY</div>
      <ApiList entityName="sellers" entityIdName="sellerId" />
    </>
  );
};
