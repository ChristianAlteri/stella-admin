"use client";

import { useState, useEffect, useCallback } from "react";
import { TbTag } from "react-icons/tb";
import { Company } from "@prisma/client";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface WarehouseProps {
  company: Company;
}

export const WarehouseClient: React.FC<WarehouseProps> = ({ company }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    if (!company) return;

    try {
      setIsLoading(true);
      const fetchedData = await axios.get(
        `/api/company/${company.name}/warehouse`,
        {
          params: {
            companyId: company.id,
          },
        }
      );

      setData(fetchedData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalStock = data.reduce(
    (acc, store) => acc + (store.products?.length || 0),
    0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <TbTag className="mr-2 h-6 w-6" />
            Warehouse Management
          </CardTitle>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <h2>Stores ({data.length})</h2>
              <h2>Total Stock ({totalStock})</h2>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-6" />
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <Tabs defaultValue={data[0]?.id || "default"} className="w-full">
            <TabsList className="w-full">
              {data.map((store) => (
                <TabsTrigger key={store.id} value={store.id} className="w-full">
                  {store.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {data.map((store) => (
              <TabsContent key={store.id} value={store.id}>
                <div className="flex mt-4">
                  <div className="flex flex-col gap-2">
                    <h1>Store: {store.name}</h1>
                    <h1>Total Stock: {store?.products?.length}</h1>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

