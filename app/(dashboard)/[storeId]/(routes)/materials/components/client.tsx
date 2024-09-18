"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";

import { Plus, PlusCircle, PlusSquare } from "lucide-react";
import { columns, MaterialColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";


interface MaterialsClientProps {
    data: MaterialColumn[];
  }
  
  export const MaterialsClient: React.FC<MaterialsClientProps> = ({
    data
  }) => {
    const params = useParams();
    const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Materials (${data.length})`}
          description="Manage materials for your products"
        />
        <Button onClick={() => router.push(`/${params.storeId}/materials/new`)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data}  />
      <Heading title="API" description="API call for material" />
      <Separator />
      <div>IS THIS NECCESARY</div>
      <ApiList entityName="materials" entityIdName="materialId" />
    </>
  );
};
