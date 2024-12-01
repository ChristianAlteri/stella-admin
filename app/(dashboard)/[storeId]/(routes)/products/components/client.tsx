"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Package, Archive, RefreshCw } from "lucide-react";
import { columns, ProductColumn } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TbTag } from "react-icons/tb";

interface Seller {
  id: string;
  instagramHandle: string;
  storeName: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductClientProps {
  data: ProductColumn[];
  sellers: Seller[];
  categories: Category[];
}

export const ProductClient: React.FC<ProductClientProps> = ({
  data,
  sellers,
  categories,
}) => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const sellerId = searchParams.get("sellerId");
  const staffId = searchParams.get("staffId");
  const categoryId = searchParams.get("categoryId");
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (sellerId) {
      setValue(sellerId);
    } else if (staffId) {
      setValue(staffId);
    } else if (userId) {
      setValue(userId);
    } else if (categoryId) {
      setValue(categoryId);
    } else {
      setValue("");
    }
  }, [sellerId, categoryId, staffId, userId]);

  const filteredData = data.filter((product) => {
    const sellerMatch = sellerId ? product.sellerId === sellerId : true;
    const staffMatch = staffId ? product.staffId === staffId : true;
    const userMatch = userId ? product.userId === userId : true;
    const categoryMatch = categoryId ? product.categoryId === categoryId : true;
    const searchMatch = Object.values(product).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const onlineMatch = showOnlineOnly ? product.isOnline === true : true;
    return (
      sellerMatch &&
      categoryMatch &&
      staffMatch &&
      userMatch &&
      searchMatch &&
      onlineMatch
    );
  });

  const archivedProducts = filteredData.filter((product) => product.isArchived);
  const liveProducts = filteredData.filter((product) => !product.isArchived);

  const handleFilterSelect = (
    type: "sellerId" | "categoryId" | "staffId" | "userId",
    newValue: string
  ) => {
    setValue(newValue);
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (newValue) {
      newSearchParams.set(type, newValue);
    } else {
      newSearchParams.delete(type);
    }

    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
  };

  const handleClearFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("sellerId");
    newSearchParams.delete("categoryId");
    newSearchParams.delete("staffId");
    newSearchParams.delete("userId");
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
    setValue("");
    setSearchTerm("");
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <TbTag className="mr-2 h-6 w-6" />
            Products ({filteredData.length})
          </CardTitle>
          <Button
            onClick={() => router.push(`/${params.storeId}/products/new`)}
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search anything products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select
                onValueChange={(newSellerId) =>
                  handleFilterSelect("sellerId", newSellerId)
                }
                value={sellerId || ""}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.storeName || seller.instagramHandle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(newCategoryId) =>
                  handleFilterSelect("categoryId", newCategoryId)
                }
                value={categoryId || ""}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={showOnlineOnly ? "default" : "outline"}
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              >
                {showOnlineOnly ? "Show All Products" : "On Website Only"}
              </Button>
              {(sellerId || categoryId || searchTerm) && (
                <Button
                  onClick={handleClearFilters}
                  size="icon"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <Tabs defaultValue="live" className="w-full">
          <TabsList>
            <TabsTrigger value="live">Live Products</TabsTrigger>
            <TabsTrigger value="archived">Archived Products</TabsTrigger>
          </TabsList>
          <TabsContent value="live">
            <div className="flex mt-4">
              <Heading
                title={`Live Products (${liveProducts.length})`}
                description="Manage live stock"
              />
            </div>
            {/* TABLE */}
            <DataTable columns={columns} data={liveProducts} />
          </TabsContent>
          <TabsContent value="archived">
            <div className="flex mt-4">
              <Heading
                title={`Archived Products (${archivedProducts.length})`}
                description="See archived stock"
              />
            </div>
            <DataTable columns={columns} data={archivedProducts} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
