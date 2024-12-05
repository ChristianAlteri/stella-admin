"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PackageIcon } from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface DispatchOrderDialogProps {
  orderId: string;
  address: string;
  email: string;
  storeId: string;
  onClose: () => void;
  onDispatched: () => void;
}

const DispatchOrderDialog = ({
  orderId,
  address,
  email,
  storeId,
  onClose,
  onDispatched,
}: DispatchOrderDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDispatch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Call shipping API
    //   await axios.post(`/api/shipping/dispatch`, {
    //     orderId,
    //     address,
    //   });

      // TODO: Mark order as dispatched and send klaivyo email confirmation
      const dispatchedOrder = await axios.patch(`/api/${storeId}/orders`, {
        orderId,
        hasBeenDispatched: true,
      });
      onDispatched();
      onClose();
    } catch (err) {
      console.error("Error dispatching order:", err);
      setError("Failed to dispatch the order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Dispatch Order"
      description="Dispatch your orders"
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to dispatch this order? The following email and
          address will be used:
        </p>
        <a
          href={`mailto:${email}`}
          className="text-super-small  text-blue-500 hover:underline"
        >
          {email}
        </a>
        <p className="text-sm font-medium">{formatAddress(address)}</p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDispatch}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Dispatch Order"}
            <PackageIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DispatchOrderDialog;
