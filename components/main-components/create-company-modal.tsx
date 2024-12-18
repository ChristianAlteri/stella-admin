"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { TbFaceIdError, TbFaceId } from "react-icons/tb";
import { toast } from "react-hot-toast";
import { useCompanyModal } from "@/hooks/use-company-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(3).max(20),
});
type FormValues = z.infer<typeof formSchema>;

export default function SimplifiedCompanyModal() {
  const [loading, setLoading] = useState(false);
  const companyModal = useCompanyModal();
  const router = useRouter();
  const params = useParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/company", values);
      toast.success("Company created successfully!", {
        icon: <TbFaceId size={30} />,
      });
      setTimeout(() => {
        router.push(`company/${response.data.name}/home`);
        companyModal.onClose();
      }, 200);
      setLoading(false);
    } catch (error) {
      toast.error("Error creating company", {
        icon: <TbFaceIdError size={30} />,
      });
      console.error("Error server side post to api/company", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create a New Company"
      description="Enter your company details to get started."
      isOpen={companyModal.isOpen}
      onClose={companyModal.onClose}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input
              {...form.register("name")}
              disabled={loading}
              placeholder="Store Name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            disabled={loading}
            variant="outline"
            onClick={companyModal.onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button disabled={loading} type="submit">
            Create Company
          </Button>
        </div>
      </form>
    </Modal>
  );
}
