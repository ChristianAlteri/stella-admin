"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { IoInformationOutline } from "react-icons/io5";


import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  data: {
    id: string;
    name: string;
    description: string;
  };
}

export default function ProductActions({ data }: ProductActionsProps) {
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
      await axios.delete(`/api/${params.storeId}/products/${data.id}`);
      toastSuccess("Product deleted.");
      router.refresh();
    } catch (error) {
      toastError("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Product ID copied to clipboard.");
  };

  return (
    <>
      <div className="flex justify-end space-x-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            router.push(`/${params.storeId}/products/${data.id}/details`);
          }}
          aria-label="Details"
        >
          <IoInformationOutline className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}
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
