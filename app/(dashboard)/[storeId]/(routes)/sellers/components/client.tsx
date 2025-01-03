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
import { columns, SellerColumn } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import axios from "axios";

interface SellerClientProps {
  data: SellerColumn[];
}

export const SellerClient: React.FC<SellerClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  const filteredData = data.filter((seller) =>
    Object.values(seller).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const liveSellers = filteredData.filter((seller) => !seller.isArchived && seller.isConnectedToStripe && seller.stripe_connect_unique_id);
  const archivedSellers = filteredData.filter((seller) => seller.isArchived);
  const disconnectedSellers = filteredData.filter((seller) => !seller.isConnectedToStripe);

  // Handler to check all Stripe connections
  const handleCheckAllStripeStatus = async () => {
    setIsCheckingAll(true);
    for (const seller of filteredData) {
      if (seller.stripe_connect_unique_id) {
        try {
          // Check Stripe status
          const checkResponse = await axios.post(
            `/api/${params.storeId}/stripe/account/account_status`,
            {
              stripe_connect_unique_id: seller.stripe_connect_unique_id,
            }
          );

          const { connected, disabled_reason } = checkResponse.data;

          // Update the seller's Stripe status
          await axios.patch(
            `/api/${params.storeId}/sellers/${seller.sellerId}`,
            {
              isConnectedToStripe: connected,
            }
          );

        } catch (error: any) {
          console.error(
            `Error checking/updating Stripe status for seller ID ${seller.sellerId}:`,
            error
          );
        }
      }
    }
    setIsCheckingAll(false);
    router.refresh();
    toast.success(
      `Stripe status checked.`
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Sellers ({filteredData.length})
          </CardTitle>
          <Button
            onClick={() => router.push(`/${params.storeId}/sellers/new`)}
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
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>

            <Button
              onClick={handleCheckAllStripeStatus}
              size="sm"
              variant="default"
              disabled={isCheckingAll}
              className="hover:underline hover:cursor-pointer"
            >
              {isCheckingAll ? "Checking..." : "Check Stripe Status"}
            </Button>
          </div>
        </div>
        <Separator className="my-6 mb-4" />
        <Tabs defaultValue="live" className="w-full ">
          <TabsList>
            <TabsTrigger value="live">Live Sellers</TabsTrigger>
            <TabsTrigger value="archived">Archived Sellers</TabsTrigger>
            <TabsTrigger value="disconnected">Disconnected Sellers</TabsTrigger>
          </TabsList>
          <TabsContent value="live">
            <div className="flex mt-4">
              <Heading
                title={`Live Sellers (${liveSellers.length})`}
                description="Manage live sellers"
              />
            </div>
            <DataTable columns={columns} data={liveSellers} />
          </TabsContent>
          <TabsContent value="archived">
            <div className="flex mt-4">
              <Heading
                title={`Archived Sellers (${archivedSellers.length})`}
                description="See archived sellers"
              />
            </div>
            <DataTable columns={columns} data={archivedSellers} />
          </TabsContent>
          <TabsContent value="disconnected">
            <div className="flex mt-4">
              <Heading
                title={`Disconnected from Stripe (${disconnectedSellers.length})`}
                description="See disconnected sellers"
              />
            </div>
            <DataTable columns={columns} data={disconnectedSellers} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
