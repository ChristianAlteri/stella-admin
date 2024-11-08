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

import { Staff } from "@prisma/client";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  staffType: z.enum(["Store Manager", "Client Advisor", "Staff", "Store"]),
  targetTotalSales: z.number().int().positive(),
  targetTotalTransactionCount: z.number().int().positive(),
  targetTotalItemsSold: z.number().int().positive(),
  targetReturningCustomers: z.number().int().positive(),
});

type StaffFormValues = z.infer<typeof formSchema>;

interface StaffFormProps {
  initialData?: Staff;
  countryCode: string;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  initialData,
  countryCode,
}) => {
  const currencySymbol = currencyConvertor(countryCode);
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [updatedStaff, setUpdatedStaff] = useState<Staff | null>(null);
  const [popoverStates, setPopoverStates] = useState<{
    [key: string]: boolean;
  }>({});

  const title = initialData ? "Edit Staff" : "Create Staff";
  const description = initialData ? "Edit a staff." : "Create a new Staff";
  const toastMessage = initialData ? "Staff updated!" : "Staff created!";
  const action = initialData ? "Save changes" : "Create";

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/staff`);
      setUpdatedStaff(response.data);
    } catch (error) {
      console.error("Error fetching Staff:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [params.storeId]);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          name: initialData.name || "",
          email: initialData.email || "",
          staffType: initialData.staffType as
            | "Store Manager"
            | "Client Advisor"
            | "Staff"
            | "Store",
          targetTotalSales: initialData.targetTotalSales || 0,
          targetTotalTransactionCount:
            initialData.targetTotalTransactionCount || 0,
          targetTotalItemsSold: initialData.targetTotalItemsSold || 0,
          targetReturningCustomers: initialData.targetReturningCustomers || 0,
        }
      : {
          name: "",
          email: "",
          staffType: "Client Advisor",
          targetTotalSales: 0,
          targetTotalTransactionCount: 0,
          targetTotalItemsSold: 0,
          targetReturningCustomers: 0,
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

  const onSubmit: SubmitHandler<StaffFormValues> = async (data) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/staff/${params.staffId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/staff`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/staff`);
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
      await axios.delete(`/api/${params.storeId}/staff/${params.staffId}`);
      router.refresh();
      router.push(`/${params.storeId}/staff`);
      toastSuccess("Staff deleted.");
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

  const StaffTypeSelector = () => {
    const options = [
      { id: "Store Manager", label: "Store Manager" },
      { id: "Client Advisor", label: "Client Advisor" },
      { id: "Staff", label: "Staff" },
      { id: "Store", label: "Store" },
    ];

    return (
      <FormField
        control={form.control}
        name="staffType"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2 w-[300px]">
            <FormLabel htmlFor="staffType">Staff Type</FormLabel>
            <div className="flex items-center space-x-2">
              <Popover
                open={popoverStates["staffType"] || false}
                onOpenChange={() => togglePopover("staffType")}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? options.find((option) => option.id === field.value)
                            ?.label
                        : "Select staff type"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search staff type..." />
                    <CommandEmpty>No staff type found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          value={option.label}
                          key={option.id}
                          onSelect={() => {
                            form.setValue(
                              "staffType",
                              option.id as
                                | "Store Manager"
                                | "Client Advisor"
                                | "Staff"
                                | "Store"
                            );
                            togglePopover("staffType");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === option.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
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
                          placeholder="Staff name"
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
                          placeholder="Staff email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <StaffTypeSelector />

                <FormField
                  control={form.control}
                  name="targetTotalSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Monthly Total Sales</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="Target total sales"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min="0"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetTotalTransactionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Target Monthly Total Transaction Count
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="Target transaction count"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min="0"
                          step="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetTotalItemsSold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Monthly Total Items Sold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="Target items sold"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min="0"
                          step="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetReturningCustomers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Monthly Returning Customers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="Target returning customers"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min="0"
                          step="1"
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
