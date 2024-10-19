"use client";

import { useState } from "react";
import { Store } from "@prisma/client";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import StoreStripeConnect from "../../on-boarding/components/store-stripe-connect";
import { ChevronDown, ChevronUp } from "lucide-react"; // Assuming you're using Lucide icons

interface ManageStoreConnectProps {
  initialData: Store;
}

export default function ManageStoreConnect({ initialData }: ManageStoreConnectProps) {
  const [isStoreConnectOpen, setIsStoreConnectOpen] = useState(false);

  const toggleStoreConnectOpen = () => {
    setIsStoreConnectOpen(!isStoreConnectOpen);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto rounded-md p-4 shadow-md">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleStoreConnectOpen}>
        <CardTitle className="text-2xl">Manage your store&apos;s Stripe Connect</CardTitle>
        {isStoreConnectOpen ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isStoreConnectOpen && (
        <CardContent className="p-6">
          <StoreStripeConnect />
        </CardContent>
      )}
    </Card>
  );
}
