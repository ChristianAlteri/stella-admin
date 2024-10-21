"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";

import { Plus, PlusCircle, PlusSquare } from "lucide-react";
import { columns, ConditionColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";


interface ConditionsClientProps {
    data: ConditionColumn[];
  }
  
  export const ConditionsClient: React.FC<ConditionsClientProps> = ({
    data
  }) => {
    const params = useParams();
    const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Conditions (${data.length})`}
          description="Manage conditions for your products"
        />
        <Button onClick={() => router.push(`/${params.storeId}/conditions/new`)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data}  />
    </>
  );
};
