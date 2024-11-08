"use client";
import React, { useEffect, useState } from "react";
import * as z from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Check, ChevronDown, Trash, Plus } from "lucide-react";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/ui/alert-modal";
import { Input } from "@/components/ui/input";
import { cn, currencyConvertor } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Card, CardContent } from "@/components/ui/card";

import { User } from "@prisma/client";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  initialData?: User;
  countryCode: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  countryCode,
}) => {
  const currencySymbol = currencyConvertor(countryCode);
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [popoverStates, setPopoverStates] = useState<{
    [key: string]: boolean;
  }>({});

  const title = initialData ? "Edit User" : "Create User";
  const description = initialData ? "Edit a user." : "Create a new User";
  const toastMessage = initialData ? "User updated!" : "User created!";
  const action = initialData ? "Save changes" : "Create";

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/users`);
      setUpdatedUser(response.data);
    } catch (error) {
      console.error("Error fetching User:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [params.storeId]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          name: initialData.name || "",
          email: initialData.email || "",
          postalCode: initialData.postalCode || "",
          phoneNumber: initialData.phoneNumber || "",
        }
      : {
          name: "",
          email: "",
          postalCode: "",
          phoneNumber: "",
        },
  });

  const toastError = (message: string) => {
    toast.error(message, {
      style: { background: "white", color: "black" },
      icon: <TbFaceIdError size={30} />,
    });
  };

  const toastSuccess = (message: string) => {
    toast.success(message, {
      style: { background: "white", color: "green" },
      icon: <TbFaceId size={30} />,
    });
  };

  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/users/${params.userId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/users`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/users`);
      toastSuccess(toastMessage);
    } catch (error: any) {
      toastError("Missing entries.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/users/${params.userId}`);
      router.refresh();
      router.push(`/${params.storeId}/users`);
      toastSuccess("User deleted.");
    } catch (error: any) {
      toastError("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const togglePopover = (name: string) => {
    setPopoverStates((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <Card className="w-full p-6">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between mb-8">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator className="mb-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 underline">
                Required Fields
              </h2>
              <div className="grid grid-cols-2 gap-6 w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="User name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          disabled={loading}
                          placeholder="User email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Code</FormLabel>
                      <FormControl>
                        <Input
                          type="postalCode"
                          disabled={loading}
                          placeholder="Postal Code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="phoneNumber"
                          disabled={loading}
                          placeholder="Phone Number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>
            </CardContent>
          </Card>
          <Button disabled={loading} className="w-full" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
