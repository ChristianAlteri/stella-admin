"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";

import { Plus, PlusCircle, PlusSquare } from "lucide-react";
import { columns, CategoryColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";


interface CategoryClientProps {
    data: CategoryColumn[];
    // data: Billboard[];
  }
  
  export const CategoryClient: React.FC<CategoryClientProps> = ({
    data
  }) => {
    const params = useParams();
    const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Categories (${data.length})`}
          description="Manage your collections"
        />
        <Button onClick={() => router.push(`/${params.storeId}/categories/new`)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data}  />
    </>
  );
};
