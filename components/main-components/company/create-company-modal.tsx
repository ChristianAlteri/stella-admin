"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompanyModal } from "@/hooks/use-company-modal";
import { TbFaceId } from "react-icons/tb";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(40, "Name must not exceed 40 characters")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Name can only contain letters, numbers, spaces, and hyphens"
    ),
  adminEmail: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanyModal() {
  const [loading, setLoading] = useState(false);
  const companyModal = useCompanyModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      adminEmail: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    console.log("hello", values);
    try {
      setLoading(true);
      const response = await axios.post("/api/company", values);
      toast.success("Company created successfully!", {
        icon: <TbFaceId size={30} />,
      });
      setTimeout(() => {
        window.location.assign(`/company/${response.data.name}`);
        companyModal.onClose();
      }, 200);
    } catch (error) {
      toast.error("Error creating company");
      console.error("Error server side post to api/companies", error);
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
        {/* Company Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name</label>
          <Input
            {...form.register("name")}
            disabled={loading}
            placeholder="Company Name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Admin Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Admin Email</label>
          <Input
            {...form.register("adminEmail")}
            disabled={loading}
            placeholder="Admin Email"
          />
          {form.formState.errors.adminEmail && (
            <p className="text-sm text-red-500">
              {form.formState.errors.adminEmail.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
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
