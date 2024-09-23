'use client'
import React, { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Check, Trash } from "lucide-react";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import S3Upload from "@/components/ui/s3-upload";
import { DescriptionInput } from "@/components/ui/descriptionInput";
import { cn } from "@/lib/utils";

import { Category, Color, Condition, Designer, Gender, Image, Material, Product, Seller, Size, Subcategory } from "@prisma/client";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  ourPrice: z.coerce.number().min(1),
  retailPrice: z.coerce.number().min(1),
  designerId: z.string().min(1),
  sellerId: z.string().min(1),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  conditionId: z.string().min(1),
  materialId: z.string().min(1),
  genderId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  isOnSale: z.boolean().default(false).optional(),
  isCharity: z.boolean().default(false).optional(),
  isHidden: z.boolean().default(false).optional(),
  measurements: z.string().nullable(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: (Product & { images: Image[] }) | null;
  categories: Category[];
  sellers: Seller[];
  designers: Designer[];
  colors: Color[];
  sizes: Size[];
  conditions: Condition[];
  materials: Material[];
  subcategories: Subcategory[];
  genders: Gender[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  designers,
  sellers,
  sizes,
  colors,
  conditions,
  materials,
  subcategories,
  genders,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product." : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          ourPrice: parseFloat(String(initialData?.ourPrice)),
          retailPrice: parseFloat(String(initialData?.retailPrice)),
        }
      : {
          name: "",
          description: "",
          images: [],
          ourPrice: 0,
          retailPrice: 0,
          designerId: "",
          sellerId: "",
          categoryId: "",
          subcategoryId: "",
          colorId: "",
          sizeId: "",
          conditionId: "",
          materialId: "",
          genderId: "",
          isFeatured: false,
          isArchived: false,
          isOnSale: false,
          isCharity: false,
          isHidden: false,
          measurements: "",
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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
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
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toastSuccess("Product deleted.");
    } catch (error: any) {
      toastError("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const renderSelector = (name: string, label: string, options: any[], optionKey: string) => {
    return (
      <FormField
        control={form.control}
        name={name as keyof ProductFormValues}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-[200px] justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? options.find((option) => option.id === field.value)?.[optionKey]
                      : `Select ${label.toLowerCase()}`}
                    <div className="ml-2 h-4 w-4 shrink-0 opacity-50">^</div>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                  <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        value={option[optionKey]}
                        key={option[optionKey]}
                        onSelect={() => {
                          form.setValue(name as keyof ProductFormValues, option.id);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === option.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option[optionKey]}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormDescription>Select from the {label.toLowerCase()}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderDropdown = (name: string, label: string, options: any[]) => {
    return (
      <FormField
        control={form.control}
        name={name as keyof ProductFormValues}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <Select
              disabled={loading}
              onValueChange={field.onChange}
              value={typeof field.value === 'string' ? field.value : undefined}
              defaultValue={typeof field.value === 'string' ? field.value : undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${label.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderCheckbox = (name: string, label: string, description: string) => {
    return (
      <FormField
        control={form.control}
        name={name as keyof ProductFormValues}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
            </div>
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <S3Upload
                      value={field.value.map((image) => image.url)}
                      disabled={loading}
                      onChange={(input) => {
                        const urlsToAdd = Array.isArray(input) ? input : [input];
                        urlsToAdd.forEach((url) => {
                          if (typeof url === "string") {
                            field.onChange([...field.value, { url }]);
                          }
                        });
                      }}
                      onRemove={(url) => {
                        if (typeof url === "string") {
                          field.onChange([
                            ...field.value.filter((current) => current.url !== url),
                          ]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Clothing Description</FormLabel>
                  <FormControl>
                    <DescriptionInput
                      disabled={loading}
                      placeholder="Enter detailed description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    Use bullet points for details. Start with - . E.g., - S/S 1999. - Sourced from Italy
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ourPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Our Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="£99.99"
                      {...field}
                      min="0.01"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage>
                    Enter the price to sell at. Minimum value is $0.01.
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="retailPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retail Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="£99.99"
                      {...field}
                      min="0.01"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage>
                    Enter a price it has sold for or retails for. Minimum value is $0.01.
                  </FormMessage>
                </FormItem>
              )}
            />
            {renderSelector("designerId", "Designer", designers, "name")}
            {renderSelector("sellerId", "Seller", sellers, "instagramHandle")}
            {renderSelector("categoryId", "Category", categories, "name")}
            {renderSelector("subcategoryId", "Sub-category", subcategories, "name")}
            {renderDropdown("colorId", "Color", colors)}
            {renderDropdown("sizeId", "Size", sizes)}
            {renderDropdown("conditionId", "Condition", conditions)}
            {renderDropdown("materialId", "Material", materials)}
            {renderDropdown("genderId", "Gender", genders)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderCheckbox("isArchived", "Archived", "This product will not appear anywhere in the store.")}
            {renderCheckbox("isFeatured", "Featured", "This product will appear on the 'our picks' page")}
            {renderCheckbox("isOnSale", "On Sale", "This product will appear on the sale page")}
            {renderCheckbox("isCharity", "Charity", "Some of this products proceeds will go to charity.")}
            {renderCheckbox("isHidden", "Hidden", "This product will appear blurred until changed to false, defaults to false.")}
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </div>
  );
};