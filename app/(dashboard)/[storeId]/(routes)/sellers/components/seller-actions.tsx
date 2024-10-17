"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Package, Trash2 } from "lucide-react";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { IoAnalyticsSharp, IoInformationOutline } from "react-icons/io5";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type SellerColumn = {
  id: string;
  instagramHandle: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  shippingAddress: string;
  country: string;
  storeId: string;
  sellerId: string;
  imageUrl: string | undefined;
  sellerType: string;
  storeName: string;
  consignmentRate: number | undefined;
};

export default function SellerActions({ data }: { data: SellerColumn }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const toastError = (message: string) => {
    toast.error(message, {
      style: {
        background: "white",
        color: "black",
      },
      icon: <TbFaceIdError size={30} />,
    });
  };

  const toastSuccess = (message: string) => {
    toast.success(message, {
      style: {
        background: "white",
        color: "green",
      },
      icon: <TbFaceId size={30} />,
    });
  };

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/sellers/${data.id}`); //TODO: add a delete flag
      toastSuccess("Seller deleted.");
      router.refresh();
    } catch (error) {
      toastError("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/${params.storeId}/sellers/${data.sellerId}/details`);
  };

  return (
    <>
      <div className="flex justify-end space-x-2 mb-4 text-muted-foreground">
        <div className="flex flex-data gap-2">
          <Button variant="outline" size="icon" onClick={handleCardClick}>
            <IoAnalyticsSharp className="w-4 h-4" />
          </Button>
          <Link
            href={`/${params.storeId}/products?sellerId=${data.sellerId}`}
            passHref
          >
            <Button variant="outline" size="icon">
              <Package className="w-4 h-4 " />
            </Button>
          </Link>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/${params.storeId}/sellers/${data.id}`)}
          aria-label="Edit"
        >
          <FaRegEdit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
    </>
  );
}
