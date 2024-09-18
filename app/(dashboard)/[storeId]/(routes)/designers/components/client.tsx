"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";

import { Image, Plus, PlusCircle, PlusSquare } from "lucide-react";
import { columns, DesignerColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";


interface DesignerClientProps {
    data: DesignerColumn[];
    // data: Billboard[];
  }
  
  export const DesignerClient: React.FC<DesignerClientProps> = ({
    data
  }) => {
    const params = useParams();
    const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Designers (${data.length})`}
          description="Manage your designers"
        />

        <Button onClick={() => router.push(`/${params.storeId}/designers/new`)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} />
      <Heading title="API" description="API call for Designers" />
      <Separator />
      <div>IS THIS NECCESARY</div>
      <ApiList entityName="designer" entityIdName="designerId" />
    </>
  );
};
