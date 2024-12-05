"use client";
import React, { useCallback, useEffect, useState } from "react";
import * as z from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Car, Check, ChevronDown, ChevronUp, Trash } from "lucide-react";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/ui/alert-modal";
import { Input } from "@/components/ui/input";
import { AddFieldDialog } from "./dialog-to-directly-add-product-field";
import { currencyConvertor, getFieldTypeSingular } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
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
import S3Upload from "@/components/ui/s3-upload";
import { DescriptionInput } from "@/components/ui/descriptionInput";
import { cn } from "@/lib/utils";
import {
  Category,
  Color,
  Condition,
  Designer,
  Gender,
  Image,
  Material,
  Product,
  Seller,
  Size,
  Subcategory,
} from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  images: z.object({ url: z.string() }).array(),
  ourPrice: z.coerce.number().min(1),
  retailPrice: z.coerce.number().optional(),
  designerId: z.string().min(1),
  sellerId: z.string().min(1),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  colorId: z.string().optional(),
  sizeId: z.string().min(1),
  conditionId: z.string().optional(),
  materialId: z.string().optional(),
  genderId: z.string().optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  isOnSale: z.boolean().default(false).optional(),
  isCharity: z.boolean().default(false).optional(),
  isHidden: z.boolean().default(false).optional(),
  isOnline: z.boolean().default(false).optional(),
  measurements: z.string().nullable().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  countryCode: string;
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
  countryCode,
  initialData,
  categories: initialCategories,
  designers: initialDesigners,
  sellers,
  sizes: initialSizes,
  colors: initialColors,
  conditions: initialConditions,
  materials: initialMaterials,
  subcategories: initialSubcategories,
  genders: initialGenders,
}) => {
  const currencySymbol = currencyConvertor(countryCode);
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  const [isOptionalFieldsOpen, setOptionalFieldsOpen] = useState(true);

  const toggleOptionalFieldsOpen = () => {
    setOptionalFieldsOpen(!isOptionalFieldsOpen);
  };

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popoverStates, setPopoverStates] = useState<Record<string, boolean>>(
    {}
  );
  const [activeFieldType, setActiveFieldType] = useState<
    | "sizes"
    | "colors"
    | "conditions"
    | "materials"
    | "genders"
    | "sub-categories"
    | "categories"
    | "designers"
    | null
  >(null);
  const openAddFieldDialog = useCallback(
    (
      fieldType:
        | "sizes"
        | "colors"
        | "conditions"
        | "materials"
        | "genders"
        | "sub-categories"
        | "categories"
        | "designers"
    ) => {
      setActiveFieldType(fieldType);
    },
    []
  );

  const closeAddFieldDialog = useCallback(() => {
    setActiveFieldType(null);
  }, []);

  const fetchFieldData = useCallback(
    async (fieldType: string) => {
      try {
        const response = await axios.get(`/api/${params.storeId}/${fieldType}`);
        switch (fieldType) {
          case "sizes":
            setUpdatedSizes(response.data);
            break;
          case "colors":
            setUpdatedColors(response.data);
            break;
          case "conditions":
            setUpdatedConditions(response.data);
            break;
          case "materials":
            setUpdatedMaterials(response.data);
            break;
          case "genders":
            setUpdatedGenders(response.data);
            break;
          case "sub-categories":
            setUpdatedSubcategories(response.data);
            break;
          case "categories":
            setUpdatedCategories(response.data);
            break;
          case "designers":
            setUpdatedDesigners(response.data);
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${fieldType}:`, error);
      }
    },
    [params.storeId]
  );

  const [updatedSizes, setUpdatedSizes] = useState<Size[]>(initialSizes);
  const [updatedColors, setUpdatedColors] = useState<Color[]>(initialColors);
  const [updatedConditions, setUpdatedConditions] =
    useState<Condition[]>(initialConditions);
  const [updatedMaterials, setUpdatedMaterials] =
    useState<Material[]>(initialMaterials);
  const [updatedGenders, setUpdatedGenders] =
    useState<Gender[]>(initialGenders);
  const [updatedSubcategories, setUpdatedSubcategories] =
    useState<Subcategory[]>(initialSubcategories);
  const [updatedCategories, setUpdatedCategories] =
    useState<Category[]>(initialCategories);
  const [updatedDesigners, setUpdatedDesigners] =
    useState<Designer[]>(initialDesigners);

  const title = initialData ? "Edit Product" : "Create Product";
  const description = initialData ? "Edit a product." : "Create a new Product";
  const toastMessage = initialData ? "Product updated!" : "Product created!";
  const action = initialData ? "Save changes" : "Create";

  const fetchSizes = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/sizes`);
      setUpdatedSizes(response.data);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };
  const fetchColors = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/colors`);
      setUpdatedColors(response.data);
    } catch (error) {
      console.error("Error fetching Colors:", error);
    }
  };
  const fetchConditions = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/conditions`);
      setUpdatedConditions(response.data);
    } catch (error) {
      console.error("Error fetching Conditions:", error);
    }
  };
  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/materials`);
      setUpdatedMaterials(response.data);
    } catch (error) {
      console.error("Error fetching Materials:", error);
    }
  };
  const fetchGenders = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/genders`);
      setUpdatedGenders(response.data);
    } catch (error) {
      console.error("Error fetching Genders:", error);
    }
  };
  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/sub-categories`);
      setUpdatedSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching Subcategories:", error);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/categories`);
      setUpdatedCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchDesigners = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/designers`);
      setUpdatedDesigners(response.data);
    } catch (error) {
      console.error("Error fetching designers:", error);
    }
  };

  useEffect(() => {
    // Fetch all field data when component mounts
    const fetchAllFieldData = async () => {
      await Promise.all([
        fetchSizes(),
        fetchColors(),
        fetchConditions(),
        fetchMaterials(),
        fetchGenders(),
        fetchSubcategories(),
        fetchCategories(),
        fetchDesigners(),
      ]);
    };

    fetchAllFieldData();
  }, [params.storeId]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          // edit product
          ...initialData,
          images: initialData?.images.map((image) => ({
            ...image,
            url: image.url.replace(
              "stella-ecomm-media-bucket.s3.amazonaws.com",
              "d1t84xijak9ta1.cloudfront.net"
            ),
          })),
          ourPrice: parseFloat(String(initialData?.ourPrice)), // TODO: i think entering product amount bug and it being wrong is from here, the parseFloat
          retailPrice: parseFloat(String(initialData?.retailPrice)),
          description: initialData.description ?? undefined,
          sellerId: initialData.sellerId ?? undefined,
          colorId: initialData.colorId ?? undefined,
          conditionId: initialData.conditionId ?? undefined,
          materialId: initialData.materialId ?? undefined,
          genderId: initialData.genderId ?? undefined,
        }
      : {
          // create new product
          name: "",
          images: [],
          ourPrice: 0,
          retailPrice: 0,
          designerId: "",
          sellerId: "",
          categoryId: "",
          subcategoryId: "",
          sizeId: "",
          conditionId: "",
          isFeatured: false,
          isArchived: false,
          isOnSale: false,
          isCharity: false,
          isHidden: false,
          isOnline: false,
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

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
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

  const togglePopover = (name: string) => {
    setPopoverStates((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const renderSelector = (
    name: string,
    label: string,
    options: any[],
    optionKey: string,
    isDialogOpen: boolean,
    setIsDialogOpen: (open: boolean) => void
  ) => {
    const isPopoverOpen = popoverStates[name] || false;
    return (
      <FormField
        control={form.control}
        name={name as keyof ProductFormValues}
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2 w-[300px]">
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <div className="flex items-center space-x-2">
              <Popover
                open={isPopoverOpen}
                onOpenChange={() => togglePopover(name)}
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
                        ? options.find((option) => option.id === field.value)?.[
                            optionKey
                          ]
                        : label.toLowerCase() === "seller"
                        ? "Select Seller or your Store"
                        : `Select ${label.toLowerCase()}`}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput
                      placeholder={`Search ${label.toLowerCase()}...`}
                    />
                    <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          value={option[optionKey]}
                          key={option[optionKey]}
                          onSelect={() => {
                            form.setValue(
                              name as keyof ProductFormValues,
                              option.id
                            );
                            togglePopover(name);
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
                          {option[optionKey]}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {label.toLowerCase() !== "seller" &&
                label.toLowerCase() !== "gender" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsDialogOpen(true)}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">
                      Add new {label.toLowerCase()}
                    </span>
                  </Button>
                )}
            </div>
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
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-3">
            <FormControl>
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className=" leading-none">
              <FormLabel>{label}</FormLabel>
              <FormDescription className="text-xs">
                {description}
              </FormDescription>
            </div>
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
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <S3Upload
                          value={field.value.map((image) => image.url)}
                          disabled={loading}
                          onChange={(input) => {
                            const urlsToAdd = Array.isArray(input)
                              ? input
                              : [input];
                            urlsToAdd.forEach((url) => {
                              if (typeof url === "string") {
                                field.onChange([...field.value, { url }]);
                              }
                            });
                          }}
                          onRemove={(url) => {
                            if (typeof url === "string") {
                              field.onChange([
                                ...field.value.filter(
                                  (current) => current.url !== url
                                ),
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
                  name="ourPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Our Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder={`${currencySymbol}99.99`}
                          {...field}
                          min="0.01"
                          step="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the price to sell at.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderSelector(
                  "sellerId",
                  "Seller",
                  sellers,
                  "storeName",
                  activeFieldType === "colors",
                  () => openAddFieldDialog("colors")
                )}
                {renderSelector(
                  "designerId",
                  "Designer",
                  updatedDesigners,
                  "name",
                  activeFieldType === "designers",
                  () => openAddFieldDialog("designers")
                )}
                {renderSelector(
                  "categoryId",
                  "Category",
                  updatedCategories,
                  "name",
                  activeFieldType === "categories",
                  () => openAddFieldDialog("categories")
                )}
                {renderSelector(
                  "subcategoryId",
                  "Sub-category",
                  updatedSubcategories,
                  "name",
                  activeFieldType === "sub-categories",
                  () => openAddFieldDialog("sub-categories")
                )}
                {renderSelector(
                  "sizeId",
                  "Size",
                  updatedSizes,
                  "name",
                  activeFieldType === "sizes",
                  () => openAddFieldDialog("sizes")
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md p-4 shadow-md">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={toggleOptionalFieldsOpen}
            >
              <h2 className="text-lg font-semibold">Optional Fields</h2>
              {isOptionalFieldsOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {isOptionalFieldsOpen && (
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clothing Description</FormLabel>
                        <FormControl>
                          <DescriptionInput
                            disabled={loading}
                            placeholder="Enter detailed description"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use bullet points for details. Start with - . E.g., -
                          S/S 1999. - Sourced from Italy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="retailPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retail Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={loading}
                            placeholder={`${currencySymbol}99.99`}
                            {...field}
                            min="0.01"
                            step="0.01"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a price it has sold for or retails for.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  {renderSelector(
                    "colorId",
                    "Color",
                    updatedColors,
                    "name",
                    activeFieldType === "colors",
                    () => openAddFieldDialog("colors")
                  )}
                  {renderSelector(
                    "conditionId",
                    "Condition",
                    updatedConditions,
                    "name",
                    activeFieldType === "conditions",
                    () => openAddFieldDialog("conditions")
                  )}
                  {renderSelector(
                    "materialId",
                    "Material",
                    updatedMaterials,
                    "name",
                    activeFieldType === "materials",
                    () => openAddFieldDialog("materials")
                  )}
                  {renderSelector(
                    "genderId",
                    "Gender",
                    updatedGenders,
                    "name",
                    activeFieldType === "genders",
                    () => openAddFieldDialog("genders")
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <Card className="rounded-md p-4 shadow-md">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={toggleOpen}
            >
              <h2 className="text-lg font-semibold">Advanced options</h2>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {isOpen && (
              <div className="mt-4">
                {renderCheckbox(
                  "isOnline",
                  "Online",
                  "This product will appear on your website."
                )}
                {renderCheckbox(
                  "isArchived",
                  "Archived",
                  "This product will not appear anywhere in the store."
                )}
                {renderCheckbox(
                  "isFeatured",
                  "Featured",
                  "This product will appear on the 'our picks' page"
                )}
                {renderCheckbox(
                  "isOnSale",
                  "On Sale",
                  "This product will appear on the sale page"
                )}
                {/* {renderCheckbox(
                  "isCharity",
                  "Charity",
                  "Some of this product's proceeds will go to charity."
                )}
                {renderCheckbox(
                  "isHidden",
                  "Hidden",
                  "This product will appear blurred until changed to false, defaults to false."
                )} */}
              </div>
            )}
          </Card>
          <Button disabled={loading} className="w-full" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <AddFieldDialog
        isOpen={activeFieldType !== null}
        onClose={closeAddFieldDialog}
        onFieldAdded={() => {
          if (activeFieldType) {
            fetchFieldData(activeFieldType);
          }
        }}
        fieldType={activeFieldType || "sizes"}
        title={
          activeFieldType
            ? `Add New ${getFieldTypeSingular(activeFieldType)}`
            : ""
        }
        description={
          activeFieldType
            ? `Create a new ${getFieldTypeSingular(
                activeFieldType
              )} for your products.`
            : ""
        }
      />
    </Card>
  );
};

// "use client";
// import React, { useCallback, useEffect, useState } from "react";
// import * as z from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import { Check, ChevronDown, ChevronUp, Trash } from "lucide-react";
// import { TbFaceId, TbFaceIdError } from "react-icons/tb";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
// import { Heading } from "@/components/ui/heading";
// import { AlertModal } from "@/components/modals/alert-modal";
// import { Input } from "@/components/ui/input";
// import { AddFieldDialog } from "./dialog-to-directly-add-product-field";
// import { getFieldTypeSingular } from "@/lib/utils";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command";
// import S3Upload from "@/components/ui/s3-upload";
// import { DescriptionInput } from "@/components/ui/descriptionInput";
// import { cn } from "@/lib/utils";

// import {
//   Category,
//   Color,
//   Condition,
//   Designer,
//   Gender,
//   Image,
//   Material,
//   Product,
//   Seller,
//   Size,
//   Subcategory,
// } from "@prisma/client";
// import { Card } from "@/components/ui/card";

// const formSchema = z.object({
//   name: z.string().min(1),
//   description: z.string().min(1),
//   images: z.object({ url: z.string() }).array(),
//   ourPrice: z.coerce.number().min(1),
//   retailPrice: z.coerce.number().min(1),
//   designerId: z.string().min(1),
//   sellerId: z.string().min(1),
//   categoryId: z.string().min(1),
//   subcategoryId: z.string().min(1),
//   colorId: z.string().min(1),
//   sizeId: z.string().min(1),
//   conditionId: z.string().min(1),
//   materialId: z.string().min(1),
//   genderId: z.string().min(1),
//   isFeatured: z.boolean().default(false).optional(),
//   isArchived: z.boolean().default(false).optional(),
//   isOnSale: z.boolean().default(false).optional(),
//   isCharity: z.boolean().default(false).optional(),
//   isHidden: z.boolean().default(false).optional(),
//   measurements: z.string().nullable(),
// });

// type ProductFormValues = z.infer<typeof formSchema>;

// interface ProductFormProps {
//   initialData: (Product & { images: Image[] }) | null;
//   categories: Category[];
//   sellers: Seller[];
//   designers: Designer[];
//   colors: Color[];
//   sizes: Size[];
//   conditions: Condition[];
//   materials: Material[];
//   subcategories: Subcategory[];
//   genders: Gender[];
// }

// export const ProductForm: React.FC<ProductFormProps> = ({
//   initialData,
//   categories: initialCategories,
//   designers: initialDesigners,
//   sellers,
//   sizes: initialSizes,
//   colors: initialColors,
//   conditions: initialConditions,
//   materials: initialMaterials,
//   subcategories: initialSubcategories,
//   genders: initialGenders,
// }) => {
//   const params = useParams();
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleOpen = () => {
//     setIsOpen(!isOpen);
//   };

//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [activeFieldType, setActiveFieldType] = useState<
//     | "sizes"
//     | "colors"
//     | "conditions"
//     | "materials"
//     | "genders"
//     | "sub-categories"
//     | "categories"
//     | "designers"
//     | null
//   >(null);
//   const openAddFieldDialog = useCallback(
//     (
//       fieldType:
//         | "sizes"
//         | "colors"
//         | "conditions"
//         | "materials"
//         | "genders"
//         | "sub-categories"
//         | "categories"
//         | "designers"
//     ) => {
//       setActiveFieldType(fieldType);
//     },
//     []
//   );

//   const closeAddFieldDialog = useCallback(() => {
//     setActiveFieldType(null);
//   }, []);

//   const fetchFieldData = useCallback(
//     async (fieldType: string) => {
//       try {
//         const response = await axios.get(`/api/${params.storeId}/${fieldType}`);
//         switch (fieldType) {
//           case "sizes":
//             setUpdatedSizes(response.data);
//             break;
//           case "colors":
//             setUpdatedColors(response.data);
//             break;
//           case "conditions":
//             setUpdatedConditions(response.data);
//             break;
//           case "materials":
//             setUpdatedMaterials(response.data);
//             break;
//           case "genders":
//             setUpdatedGenders(response.data);
//             break;
//           case "sub-categories":
//             setUpdatedSubcategories(response.data);
//             break;
//           case "categories":
//             setUpdatedCategories(response.data);
//             break;
//           case "designers":
//             setUpdatedDesigners(response.data);
//             break;
//         }
//       } catch (error) {
//         console.error(`Error fetching ${fieldType}:`, error);
//       }
//     },
//     [params.storeId]
//   );

//   const [updatedSizes, setUpdatedSizes] = useState<Size[]>(initialSizes);
//   const [updatedColors, setUpdatedColors] = useState<Color[]>(initialColors);
//   const [updatedConditions, setUpdatedConditions] =
//     useState<Condition[]>(initialConditions);
//   const [updatedMaterials, setUpdatedMaterials] =
//     useState<Material[]>(initialMaterials);
//   const [updatedGenders, setUpdatedGenders] =
//     useState<Gender[]>(initialGenders);
//   const [updatedSubcategories, setUpdatedSubcategories] =
//     useState<Subcategory[]>(initialSubcategories);
//   const [updatedCategories, setUpdatedCategories] =
//     useState<Category[]>(initialCategories);
//   const [updatedDesigners, setUpdatedDesigners] =
//     useState<Designer[]>(initialDesigners);

//   const title = initialData ? "Edit product" : "Create product";
//   const description = initialData ? "Edit a product." : "Add a new product";
//   const toastMessage = initialData ? "Product updated." : "Product created.";
//   const action = initialData ? "Save changes" : "Create";

//   const fetchSizes = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/sizes`);
//       setUpdatedSizes(response.data);
//     } catch (error) {
//       console.error("Error fetching sizes:", error);
//     }
//   };
//   const fetchColors = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/colors`);
//       setUpdatedColors(response.data);
//     } catch (error) {
//       console.error("Error fetching Colors:", error);
//     }
//   };
//   const fetchConditions = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/conditions`);
//       setUpdatedConditions(response.data);
//     } catch (error) {
//       console.error("Error fetching Conditions:", error);
//     }
//   };
//   const fetchMaterials = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/materials`);
//       setUpdatedMaterials(response.data);
//     } catch (error) {
//       console.error("Error fetching Materials:", error);
//     }
//   };
//   const fetchGenders = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/genders`);
//       setUpdatedGenders(response.data);
//     } catch (error) {
//       console.error("Error fetching Genders:", error);
//     }
//   };
//   const fetchSubcategories = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/sub-categories`);
//       setUpdatedSubcategories(response.data);
//     } catch (error) {
//       console.error("Error fetching Subcategories:", error);
//     }
//   };
//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/categories`);
//       setUpdatedCategories(response.data);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };
//   const fetchDesigners = async () => {
//     try {
//       const response = await axios.get(`/api/${params.storeId}/designers`);
//       setUpdatedDesigners(response.data);
//     } catch (error) {
//       console.error("Error fetching designers:", error);
//     }
//   };

//   useEffect(() => {
//     fetchSizes();
//     fetchColors();
//     fetchConditions();
//     fetchMaterials();
//     fetchGenders();
//     fetchSubcategories();
//     fetchCategories();
//     fetchDesigners();
//   }, []);

//   const form = useForm<ProductFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: initialData
//       ? {
//           ...initialData,
//           ourPrice: parseFloat(String(initialData?.ourPrice)), // TODO: i think entering product amount bug and it being wrong is from here, the parseFloat
//           retailPrice: parseFloat(String(initialData?.retailPrice)),
//         }
//       : {
//           name: "",
//           description: "",
//           images: [],
//           ourPrice: 0,
//           retailPrice: 0,
//           designerId: "",
//           sellerId: "",
//           categoryId: "",
//           subcategoryId: "",
//           colorId: "",
//           sizeId: "",
//           conditionId: "",
//           materialId: "",
//           genderId: "",
//           isFeatured: false,
//           isArchived: false,
//           isOnSale: false,
//           isCharity: false,
//           isHidden: false,
//           measurements: "",
//         },
//   });

//   const toastError = (message: string) => {
//     toast.error(message, {
//       style: { background: "white", color: "black" },
//       icon: <TbFaceIdError size={30} />,
//     });
//   };

//   const toastSuccess = (message: string) => {
//     toast.success(message, {
//       style: { background: "white", color: "green" },
//       icon: <TbFaceId size={30} />,
//     });
//   };

//   const onSubmit = async (data: ProductFormValues) => {
//     try {
//       setLoading(true);
//       if (initialData) {
//         await axios.patch(
//           `/api/${params.storeId}/products/${params.productId}`,
//           data
//         );
//       } else {
//         await axios.post(`/api/${params.storeId}/products`, data);
//       }
//       router.refresh();
//       router.push(`/${params.storeId}/products`);
//       toastSuccess(toastMessage);
//     } catch (error: any) {
//       toastError("Missing entries.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDelete = async () => {
//     try {
//       setLoading(true);
//       await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
//       router.refresh();
//       router.push(`/${params.storeId}/products`);
//       toastSuccess("Product deleted.");
//     } catch (error: any) {
//       toastError("Something went wrong.");
//     } finally {
//       setLoading(false);
//       setOpen(false);
//     }
//   };

//   const renderSelector = (
//     name: string,
//     label: string,
//     options: any[],
//     optionKey: string,
//     isDialogOpen: boolean,
//     setIsDialogOpen: (open: boolean) => void
//   ) => {
//     return (
//       <FormField
//         control={form.control}
//         name={name as keyof ProductFormValues}
//         render={({ field }) => (
//           <FormItem className="flex flex-col space-y-2">
//             <FormLabel htmlFor={name}>{label}</FormLabel>
//             <div className="flex items-center space-x-2">
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <FormControl>
//                     <Button
//                       variant="outline"
//                       role="combobox"
//                       className={cn(
//                         "w-full justify-between",
//                         !field.value && "text-muted-foreground"
//                       )}
//                     >
//                       {field.value
//                         ? options.find((option) => option.id === field.value)?.[
//                             optionKey
//                           ]
//                         : `Select ${label.toLowerCase()}`}
//                       <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                     </Button>
//                   </FormControl>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-[300px] p-0">
//                   <Command>
//                     <CommandInput
//                       placeholder={`Search ${label.toLowerCase()}...`}
//                     />
//                     <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
//                     <CommandGroup>
//                       {options.map((option) => (
//                         <CommandItem
//                           value={option[optionKey]}
//                           key={option[optionKey]}
//                           onSelect={() => {
//                             form.setValue(
//                               name as keyof ProductFormValues,
//                               option.id
//                             );
//                           }}
//                         >
//                           <Check
//                             className={cn(
//                               "mr-2 h-4 w-4",
//                               field.value === option.id
//                                 ? "opacity-100"
//                                 : "opacity-0"
//                             )}
//                           />
//                           {option[optionKey]}
//                         </CommandItem>
//                       ))}
//                     </CommandGroup>
//                   </Command>
//                 </PopoverContent>
//               </Popover>
//               {label.toLowerCase() !== "seller" && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="icon"
//                   onClick={() => setIsDialogOpen(true)}
//                   className="flex-shrink-0"
//                 >
//                   <Plus className="h-4 w-4" />
//                   <span className="sr-only">Add new {label.toLowerCase()}</span>
//                 </Button>
//               )}
//             </div>
//             <FormDescription>
//               Select from the {label.toLowerCase()}
//             </FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     );
//   };

//   const renderCheckbox = (name: string, label: string, description: string) => {
//     return (
//       <div className="flex flex-col justify-center items-start">
//         <FormField
//           control={form.control}
//           name={name as keyof ProductFormValues}
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md justify-start p-3">
//               <FormControl>
//                 <Checkbox
//                   checked={Boolean(field.value)}
//                   onCheckedChange={field.onChange}
//                 />
//               </FormControl>
//               <div className="leading-none">
//                 <FormLabel>{label}</FormLabel>
//                 <FormDescription className="text-xs">
//                   {description}
//                 </FormDescription>
//               </div>
//             </FormItem>
//           )}
//         />
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-5xl mx-auto">
//       <AlertModal
//         isOpen={open}
//         onClose={() => setOpen(false)}
//         onConfirm={onDelete}
//         loading={loading}
//       />
//       <div className="flex items-center justify-between mb-8">
//         <Heading title={title} description={description} />
//         {initialData && (
//           <Button
//             disabled={loading}
//             variant="destructive"
//             size="icon"
//             onClick={() => setOpen(true)}
//           >
//             <Trash className="h-4 w-4" />
//           </Button>
//         )}
//       </div>
//       <Separator className="mb-8" />
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//           <div className="grid grid-cols-1">
//             <div className="">
//               Main fields that are required
//               <FormField
//                 control={form.control}
//                 name="images"
//                 render={({ field }) => (
//                   <FormItem className="col-span-full">
//                     <FormLabel>Images</FormLabel>
//                     <FormControl>
//                       <S3Upload
//                         value={field.value.map((image) => image.url)}
//                         disabled={loading}
//                         onChange={(input) => {
//                           const urlsToAdd = Array.isArray(input)
//                             ? input
//                             : [input];
//                           urlsToAdd.forEach((url) => {
//                             if (typeof url === "string") {
//                               field.onChange([...field.value, { url }]);
//                             }
//                           });
//                         }}
//                         onRemove={(url) => {
//                           if (typeof url === "string") {
//                             field.onChange([
//                               ...field.value.filter(
//                                 (current) => current.url !== url
//                               ),
//                             ]);
//                           }
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Name</FormLabel>
//                     <FormControl>
//                       <Input
//                         disabled={loading}
//                         placeholder="Product name"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="col-span-full">
//                     <FormLabel>Clothing Description</FormLabel>
//                     <FormControl>
//                       <DescriptionInput
//                         disabled={loading}
//                         placeholder="Enter detailed description"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage>
//                       Use bullet points for details. Start with - . E.g., - S/S
//                       1999. - Sourced from Italy
//                     </FormMessage>
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="ourPrice"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Our Price</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         disabled={loading}
//                         placeholder="£99.99"
//                         {...field}
//                         min="0.01"
//                         step="0.01"
//                       />
//                     </FormControl>
//                     <FormMessage>
//                       Enter the price to sell at.
//                     </FormMessage>
//                   </FormItem>
//                 )}
//               />
//               {renderSelector(
//                 "sellerId",
//                 "Seller",
//                 sellers,
//                 "instagramHandle",
//                 activeFieldType === "colors",
//                 () => openAddFieldDialog("colors")
//               )}
//             </div>
//             <Separator />
//             {/* TODO: somehow show this as optional */}
//             <div className="mt-4">
//               Sub fields
//               <FormField
//                 control={form.control}
//                 name="retailPrice"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Retail Price</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         disabled={loading}
//                         placeholder="£99.99"
//                         {...field}
//                         min="0.01"
//                         step="0.01"
//                       />
//                     </FormControl>
//                     <FormMessage>
//                       Enter a price it has sold for or retails for. Minimum
//                       value is $0.01.
//                     </FormMessage>
//                   </FormItem>
//                 )}
//               />
//               {/* TODO: somehow show all below of these as optional */}
//               {renderSelector(
//                 "designerId",
//                 "Designer",
//                 updatedDesigners,
//                 "name",
//                 activeFieldType === "designers",
//                 () => openAddFieldDialog("designers")
//               )}
//               {renderSelector(
//                 "categoryId",
//                 "Category",
//                 updatedCategories,
//                 "name",
//                 activeFieldType === "categories",
//                 () => openAddFieldDialog("categories")
//               )}
//               {renderSelector(
//                 "subcategoryId",
//                 "Sub-category",
//                 updatedSubcategories,
//                 "name",
//                 activeFieldType === "sub-categories",
//                 () => openAddFieldDialog("sub-categories")
//               )}
//               {renderSelector(
//                 "colorId",
//                 "Color",
//                 updatedColors,
//                 "name",
//                 activeFieldType === "colors",
//                 () => openAddFieldDialog("colors")
//               )}
//               {renderSelector(
//                 "sizeId",
//                 "Size",
//                 updatedSizes,
//                 "name",
//                 activeFieldType === "sizes",
//                 () => openAddFieldDialog("sizes")
//               )}
//               {renderSelector(
//                 "conditionId",
//                 "Condition",
//                 updatedConditions,
//                 "name",
//                 activeFieldType === "conditions",
//                 () => openAddFieldDialog("conditions")
//               )}
//               {renderSelector(
//                 "materialId",
//                 "Material",
//                 updatedMaterials,
//                 "name",
//                 activeFieldType === "materials",
//                 () => openAddFieldDialog("materials")
//               )}
//               {renderSelector(
//                 "genderId",
//                 "Gender",
//                 updatedGenders,
//                 "name",
//                 activeFieldType === "genders",
//                 () => openAddFieldDialog("genders")
//               )}
//             </div>
//           </div>

//           <Separator />
//           <Card className="rounded-md p-4 shadow-md">
//             <div
//               className="flex justify-between items-center cursor-pointer"
//               onClick={toggleOpen}
//             >
//               <h2 className="text-lg font-semibold">Advanced options</h2>
//               {isOpen ? <ChevronUp /> : <ChevronDown />}
//             </div>
//             {isOpen && (
//               <div className="mt-4">
//                 {renderCheckbox(
//                   "isArchived",
//                   "Archived",
//                   "This product will not appear anywhere in the store."
//                 )}
//                 {renderCheckbox(
//                   "isFeatured",
//                   "Featured",
//                   "This product will appear on the 'our picks' page"
//                 )}
//                 {renderCheckbox(
//                   "isOnSale",
//                   "On Sale",
//                   "This product will appear on the sale page"
//                 )}
//                 {renderCheckbox(
//                   "isCharity",
//                   "Charity",
//                   "Some of this product's proceeds will go to charity."
//                 )}
//                 {renderCheckbox(
//                   "isHidden",
//                   "Hidden",
//                   "This product will appear blurred until changed to false, defaults to false."
//                 )}
//               </div>
//             )}
//           </Card>
//           <Button disabled={loading} className="ml-auto" type="submit">
//             {action}
//           </Button>
//         </form>
//       </Form>
//       <AddFieldDialog
//         isOpen={activeFieldType !== null}
//         onClose={closeAddFieldDialog}
//         onFieldAdded={() => {
//           if (activeFieldType) {
//             fetchFieldData(activeFieldType);
//           }
//         }}
//         fieldType={activeFieldType || "sizes"}
//         title={
//           activeFieldType
//             ? `Add New ${getFieldTypeSingular(activeFieldType)}`
//             : ""
//         }
//         description={
//           activeFieldType
//             ? `Create a new ${getFieldTypeSingular(
//                 activeFieldType
//               )} for your products.`
//             : ""
//         }
//       />
//     </div>
//   );
// };

// const renderDropdown = (
//   name: string,
//   label: string,
//   options: any[],
//   isDialogOpen: boolean,
//   setIsDialogOpen: (open: boolean) => void
// ) => {
//   return (
//     <FormField
//       control={form.control}
//       name={name as keyof ProductFormValues}
//       render={({ field }) => (
//         <FormItem className="flex flex-col space-y-2">
//           <FormLabel htmlFor={name}>{label}</FormLabel>
//           <div className="flex items-center space-x-2">
//             <Select
//               disabled={false} // Replace with your actual loading state
//               onValueChange={field.onChange}
//               value={typeof field.value === "string" ? field.value : undefined}
//               defaultValue={
//                 typeof field.value === "string" ? field.value : undefined
//               }
//             >
//               <FormControl>
//                 <SelectTrigger className="w-full">
//                   <SelectValue
//                     placeholder={`Select a ${label.toLowerCase()}`}
//                   />
//                 </SelectTrigger>
//               </FormControl>
//               <SelectContent>
//                 {options.map((option) => (
//                   <SelectItem key={option.id} value={option.id}>
//                     {option.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Button
//               type="button"
//               variant="outline"
//               size="icon"
//               onClick={() => setIsDialogOpen(true)}
//               className="flex-shrink-0"
//             >
//               <Plus className="h-4 w-4" />
//               <span className="sr-only">Add new {label.toLowerCase()}</span>
//             </Button>
//           </div>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   )
// }

// const renderSelector = (
//   name: string,
//   label: string,
//   options: any[],
//   optionKey: string,
//   isDialogOpen: boolean,
//   setIsDialogOpen: (open: boolean) => void
// ) => {
//   const isPopoverOpen = popoverStates[name] || false;
//   return (
//     <FormField
//       control={form.control}
//       name={name as keyof ProductFormValues}
//       render={({ field }) => (
//         <FormItem className="flex flex-col space-y-2 w-[300px]">
//           <FormLabel htmlFor={name}>{label}</FormLabel>
//           <div className="flex items-center space-x-2">
//           <Popover
//             open={isPopoverOpen}
//             onOpenChange={() => togglePopover(name)}
//           >
//               <PopoverTrigger asChild>
//                 <FormControl>
//                   <Button
//                     variant="outline"
//                     role="combobox"
//                     className={cn(
//                       "w-full justify-between",
//                       !field.value && "text-muted-foreground"
//                     )}
//                   >
//                     {field.value
//                       ? options.find((option) => option.id === field.value)?.[
//                           optionKey
//                         ]
//                       : `Select ${label.toLowerCase()}`}
//                     <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                   </Button>
//                 </FormControl>
//               </PopoverTrigger>
//               <PopoverContent className="w-[300px] p-0">
//                 <Command>
//                   <CommandInput
//                     placeholder={`Search ${label.toLowerCase()}...`}
//                   />
//                   <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
//                   <CommandGroup>
//                     {options.map((option) => (
//                       <CommandItem
//                         value={option[optionKey]}
//                         key={option[optionKey]}
//                         onSelect={() => {
//                           form.setValue(
//                             name as keyof ProductFormValues,
//                             option.id
//                           );
//                           togglePopover(name);
//                         }}
//                       >
//                         <Check
//                           className={cn(
//                             "mr-2 h-4 w-4",
//                             field.value === option.id
//                               ? "opacity-100"
//                               : "opacity-0"
//                           )}
//                         />
//                         {option[optionKey]}
//                       </CommandItem>
//                     ))}
//                   </CommandGroup>
//                 </Command>
//               </PopoverContent>
//             </Popover>
//             {label.toLowerCase() !== "seller" && (
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="icon"
//                 onClick={() => setIsDialogOpen(true)}
//                 className="flex-shrink-0"
//               >
//                 <Plus className="h-4 w-4" />
//                 <span className="sr-only">Add new {label.toLowerCase()}</span>
//               </Button>
//             )}
//           </div>
//           {/* <FormDescription>
//             Select from the {label.toLowerCase()}
//           </FormDescription> */}
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// };
