"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { PlusCircle } from "lucide-react";
import { columns, SellerColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";



interface SellerClientProps {
    data: SellerColumn[];
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
      <DataTable columns={columns} data={data} searchKey="instagramHandle" />
      <Separator />
    </>
  );
};
