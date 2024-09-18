"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { columns, ColorColumn } from "./columns";
import { TopSellingColorsGraph } from "@/components/ui/top-selling-color-graph";

interface ColorClientProps {
  data: ColorColumn[];
  topSellingData: any;
}

export const ColorClient: React.FC<ColorClientProps> = ({
  data,
  topSellingData,
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Colors (${data.length})`}
          description="Manage colors for your products"
        />
        <Button onClick={() => router.push(`/${params.storeId}/colors/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable  columns={columns} data={data} />
      <Heading title="Analytics" description="Top selling color" />
      <Separator />
      <br />
      <br />
      {/* Graph */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Top Sellers</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <TopSellingColorsGraph data={topSellingData} />
        </CardContent>
      </Card>
      <ApiList entityName="colors" entityIdName="colorId" />
    </>
  );
};
