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
import { Staff } from "@prisma/client";
import { TbLego } from "react-icons/tb";

interface StaffClientProps {
  data: Staff[];
  countryCode: string;
}

export const StaffClient: React.FC<StaffClientProps> = ({ data, countryCode }) => {
  const params = useParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((staff) =>
    Object.values(staff).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const archivedStaff = filteredData.filter((staff) => staff.isArchived);
  const liveStaff = filteredData.filter((staff) => !staff.isArchived);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <TbLego className="mr-2 h-6 w-6" />
            Staff ({filteredData.length})
          </CardTitle>
          <Button
            onClick={() => router.push(`/${params.storeId}/staff/new`)}
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
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
        </div>
        <Separator className="my-6 mb-4" />
        <Tabs defaultValue="live" className="w-full ">
          <TabsList>
            <TabsTrigger value="live">Live Staff</TabsTrigger>
            <TabsTrigger value="archived">Archived Staff</TabsTrigger>
          </TabsList>
          <TabsContent value="live">
            <div className="flex mt-4">
              <Heading
                title={`Live Staff (${liveStaff.length})`}
                description="Manage live Staff"
              />
            </div>
            <DataTable columns={columns(countryCode)}  data={liveStaff} />
          </TabsContent>
          <TabsContent value="archived">
            <div className="flex mt-4">
              <Heading
                title={`Archived Staff (${archivedStaff.length})`}
                description="See archived Staff"
              />
            </div>
            <DataTable columns={columns(countryCode)}  data={archivedStaff} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
