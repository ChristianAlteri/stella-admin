"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { columns, ProductColumn } from "./columns";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // Use for params and search params
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";
import { TbReload } from "react-icons/tb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ProductClientProps {
  data: ProductColumn[];
}

export const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");

  const sellerId = searchParams.get("sellerId");

  // Filter products by sellerId if it's present in the query parameters
  const filteredData = sellerId
    ? data.filter((product) => product.sellerId === sellerId)
    : data;

  // Filter for archived and live products
  const archivedProducts = filteredData.filter((product) => product.isArchived);
  const liveProducts = filteredData.filter((product) => !product.isArchived);

  const handleClearFilter = () => {
    router.replace(window.location.pathname);
  };

  return (
    <>
      <div className="flex w-full justify-between">
        <div className="flex items-center justify-left w-full gap-6 items-left">
          <Button
            onClick={() => router.push(`/${params.storeId}/products/new`)}
            size="sm"
          >
            <PlusCircle className="mr-2 w-4" />
            Add New
          </Button>
        </div>

        <div>
          <div className="w-[200px]">
            <Select onValueChange={setValue} value={value}>
              <SelectTrigger id="toggle">
                <SelectValue placeholder="Select Seller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="make these sellers">make these sellers</SelectItem>
                <SelectItem value="put the id in the params">put the id in the params</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-sm text-gray-500">TODO: seller id in params</p>
          </div>
        </div>

        {sellerId && (
          <Button onClick={handleClearFilter} className="mt-4" size="sm">
            <TbReload size={18} />
          </Button>
        )}
      </div>

      <Separator />

      {/* Live Products DataTable */}
      <Heading
        title={`Live Products (${liveProducts.length})`}
        description="Manage live stock"
      />
      <DataTable columns={columns} data={liveProducts} searchKey="name" />

      <Separator />

      {/* Archived Products DataTable */}
      <Heading
        title={`Archived Products (${archivedProducts.length})`}
        description="See archived stock"
      />
      <DataTable columns={columns} data={archivedProducts} searchKey="name" />

      <Separator />

      <Heading title="API" description="API call for Products" />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};
