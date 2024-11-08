"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Users } from "lucide-react";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@prisma/client";
import { TbStar } from "react-icons/tb";

interface UserClientProps {
  data: User[];
  countryCode: string;
}

export const UserClient: React.FC<UserClientProps> = ({ data, countryCode }) => {
  const params = useParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByPurchases, setFilterByPurchases] = useState(false);

  // Filter by search term
  const filteredData = data.filter((user) =>
    Object.values(user).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Apply totalPurchases filter if enabled
  const dataWithPurchaseFilter = filterByPurchases
    ? filteredData.filter((user) => (user.totalPurchases ?? 0) > 0) // Adjust this threshold as needed
    : filteredData;

  const archivedUser = dataWithPurchaseFilter.filter((user) => user.isArchived);
  const liveUser = dataWithPurchaseFilter.filter((user) => !user.isArchived);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <TbStar className="mr-2 h-6 w-6" />
            Users ({dataWithPurchaseFilter.length})
          </CardTitle>
          <Button
            onClick={() => router.push(`/${params.storeId}/users/new`)}
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
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterByPurchases(!filterByPurchases)}
            >
              {filterByPurchases ? "Show All" : "Top Customers"}
            </Button>
          </div>
        </div>
        <Separator className="my-6 mb-4" />
        <Tabs defaultValue="live" className="w-full ">
          <TabsList>
            <TabsTrigger value="live">Live Users</TabsTrigger>
            <TabsTrigger value="archived">Archived Users</TabsTrigger>
          </TabsList>
          <TabsContent value="live">
            <div className="flex mt-4">
              <Heading
                title={`Live User (${liveUser.length})`}
                description="Manage live Users"
              />
            </div>
            <DataTable columns={columns(countryCode)} data={liveUser} />
          </TabsContent>
          <TabsContent value="archived">
            <div className="flex mt-4">
              <Heading
                title={`Archived User (${archivedUser.length})`}
                description="See archived Users"
              />
            </div>
            <DataTable columns={columns(countryCode)} data={archivedUser} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
