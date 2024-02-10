"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { Plus, PlusCircle, PlusSquare } from "lucide-react";
import { columns, BillboardColumn } from "./columns";
import { useParams, useRouter } from "next/navigation";

interface BillboardClientProps {
    data: BillboardColumn[];
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
          title="Billboards"
          description="Manage your featured products"
        />
        <Button onClick={() => router.push(`/${params.storeId}/billboards/new`)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
      <Separator />
    </>
  );
};
