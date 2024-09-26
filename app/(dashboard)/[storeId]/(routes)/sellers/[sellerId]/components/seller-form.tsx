"use client";

import * as z from "zod";
import axios from "axios";
import { FormEventHandler, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Billboard, Category, Designer, Seller } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";
import { cn } from "@/lib/utils";

interface SellerFormProps {
  initialData: Seller | null;
  billboards: Billboard[] | null;
}

export const SellerForm: React.FC<SellerFormProps> = ({
  initialData,
  billboards,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sellerType, setSellerType] = useState<string>("influencer");

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    instagramHandle: z.string().min(1, "Instagram handle is required"),
    billboardId: z.string().min(1, "Billboard ID is required"),
    charityName: z.string().optional(),
    charityUrl: z.string().optional(),
    shoeSizeEU: z.string().min(1, "Shoe size is required"),
    topSize: z.string().min(1, "Top size is required"),
    bottomSize: z.string().min(1, "Bottom size is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    country: z.string().min(1, "Country is required"),
    shippingAddress: z.string().min(1, "Shipping Address is required"),
    storeName: z.string().optional(),
    description: z.string().optional(),
  });

  type SellerFormValues = z.infer<typeof formSchema>;
  const form = useForm<SellerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          instagramHandle: initialData.instagramHandle || "",
          billboardId: initialData.billboardId || "",
          charityName: initialData.charityName || "",
          charityUrl: initialData.charityUrl || "",
          shoeSizeEU: initialData.shoeSizeEU || "",
          topSize: initialData.topSize || "",
          bottomSize: initialData.bottomSize || "",
          firstName: initialData.firstName || "",
          lastName: initialData.lastName || "",
          email: initialData.email || "",
          phoneNumber: initialData.phoneNumber || "",
          country: initialData.country || "",
          shippingAddress: initialData.shippingAddress || "",
          storeName: initialData.storeName || "",
          description: initialData.description || "",
        }
      : {
          instagramHandle: "",
          billboardId: "",
          charityName: "",
          charityUrl: "",
          shoeSizeEU: "",
          topSize: "",
          bottomSize: "",
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          country: "",
          shippingAddress: "",
          storeName: "",
          description: "",
        },
  });

  // Custom Toast Error
  const toastError = (message: string) => {
    toast.error(message, {
      style: {
        background: "white",
        color: "black",
      },
      icon: <TbFaceIdError size={30} />,
    });
  };
  // Custom Toast Success
  const toastSuccess = (message: string) => {
    toast.error(message, {
      style: {
        background: "white",
        color: "green",
      },
      icon: <TbFaceId size={30} />,
    });
  };

  const title = initialData ? "Edit a Seller" : "Create a new Seller";
  const description = initialData ? "Edit a Seller." : "Create a new Seller";
  const toastMessage = initialData ? "Seller updated!" : "Seller created!";
  const action = initialData ? "Save changes" : "Create new Seller";

  const countries = [
    // "Australia",
    // "Austria",
    // "Belgium",
    // "Brazil",
    // "Bulgaria",
    // "Canada",
    // "Croatia",
    // "Cyprus",
    // "Czech Republic",
    // "Denmark",
    // "Estonia",
    // "Finland",
    // "France",
    // "Germany",
    // "Ghana",
    // "Gibraltar",
    // "Greece",
    // "Hong Kong",
    // "Hungary",
    // "India",
    // "Indonesia",
    // "Ireland",
    // "Italy",
    // "Japan",
    // "Kenya",
    // "Latvia",
    // "Liechtenstein",
    // "Lithuania",
    // "Luxembourg",
    // "Malaysia",
    // "Malta",
    // "Mexico",
    // "Netherlands",
    // "New Zealand",
    // "Nigeria",
    // "Norway",
    // "Poland",
    // "Portugal",
    // "Romania",
    // "Singapore",
    // "Slovakia",
    // "Slovenia",
    // "South Africa",
    // "Spain",
    // "Sweden",
    // "Switzerland",
    // "Thailand",
    "United Kingdom",
    // "United Arab Emirates",
  ];

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event: any) => {
    const data = form.getValues();
    event.preventDefault();
    try {
      const payload = {
        ...data,
        sellerType,
      };
      setLoading(true);
      if (initialData) {
        console.log("INITIAL DATA = ", payload);
        await axios.patch(
          `/api/${params.storeId}/sellers/${params.sellerId}`,
          payload
        );
      } else {
        console.log("DATA = ", payload);
        const seller = await axios.post(
          `/api/${params.storeId}/sellers`,
          payload
        );
        router.push(
          `/${params.storeId}/stripe-connect?sellerId=${seller.data.id}`
        );
      }
      // router.refresh();
      // router.push(`/${params.storeId}/sellers`);
      // toastSuccess(toastMessage);
    } catch (error: any) {
      toastError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/sellers/${params.sellerId}`);
      router.refresh();
      router.push(`/${params.storeId}/sellers`);
      toastSuccess("Seller archived.");
    } catch (error: any) {
      console.log("[FRONT_END_ARCHIVE_SELLER_ERROR]", error.response);
      toastError("There was an error archiving the seller.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      {/* Select component for seller type */}
      <div className="flex items-center space-x-2 my-4">
        <Select onValueChange={setSellerType} defaultValue="influencer">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Seller Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Seller Type</SelectLabel>
              <SelectItem value="influencer">Influencer</SelectItem>
              <SelectItem value="reseller">Re-seller</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col w-full justify-center items-center"
        >
          <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-4">
            <div className="gap-2 w-2/3 flex flex-row">
              <div className="flex flex-col w-full h-full">
                {/* Common fields */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="First Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Last Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagramHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Handle</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Instagram Handle"
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
                          disabled={loading}
                          type="email"
                          placeholder="Email Address"
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
                          disabled={loading}
                          placeholder="Phone Number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Shipping Address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel htmlFor="country">Country</FormLabel>
                      <Popover>
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
                                ? countries.find(
                                    (country) => country === field.value
                                  )
                                : "Select Country"}
                              <div className="ml-2 h-4 w-4 shrink-0 opacity-50">
                                ^
                              </div>
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 overflow-auto justify-center items-center">
                          <Command>
                            <CommandInput placeholder="Search Country..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {countries.map((country) => (
                                <CommandItem
                                  value={country}
                                  key={country}
                                  onSelect={() => {
                                    form.setValue("country", country);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === country
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Select your country</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col w-full h-full">
                <FormField
                  control={form.control}
                  name="billboardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              defaultValue={field.value}
                              placeholder="Select a billboard"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {billboards?.map((billboard) => (
                            <SelectItem key={billboard.id} value={billboard.id}>
                              {billboard.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="charityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charity Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Oxfam"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="charityUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charity Url</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="www.oxfam.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* TODO: Add Charity selector */}

                {/* Conditional form fields based on seller type */}
                {sellerType === "reseller" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Store Name"
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
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    {/* Influencer-specific fields */}
                    <FormField
                      control={form.control}
                      name="shoeSizeEU"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EU Shoe Size</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="39"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="topSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Top Size</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="small"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bottomSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bottom Size</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="medium"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
