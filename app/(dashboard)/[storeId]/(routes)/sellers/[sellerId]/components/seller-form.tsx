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
import { AlertModal } from "@/components/ui/alert-modal";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp, Trash } from "lucide-react";

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
  const [sellerType, setSellerType] = useState<string>("re-seller");
  const [isOptionalFieldsOpen, setOptionalFieldsOpen] = useState(false);

  const toggleOptionalFieldsOpen = () => {
    setOptionalFieldsOpen(!isOptionalFieldsOpen);
  };

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
    shippingAddress: z.string().min(1, "Shipping Address is required"),
    storeName: z.string().optional(),
    description: z.string().optional(),
    consignmentRate: z.number().optional(),
    country: z.enum(["AU", "GB"]),
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
          country: initialData.country as "AU" | "GB",
          shippingAddress: initialData.shippingAddress || "",
          storeName: initialData.storeName || "",
          description: initialData.description || "",
          consignmentRate: initialData.consignmentRate || undefined,
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
          country: "GB",
          shippingAddress: "",
          storeName: "",
          description: "",
          consignmentRate: undefined,
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

  const title = initialData ? "Edit Seller" : "Create Seller";
  const description = initialData ? "Edit a Seller." : "Create a new Seller";
  const toastMessage = initialData ? "Seller updated!" : "Seller created!";
  const action = initialData ? "Save changes" : "Create";

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event: any) => {
    const data = form.getValues();
    event.preventDefault();
    try {
      const payload = {
        ...data,
      };
      setLoading(true);
      if (initialData) {
        console.log("INITIAL DATA = ", payload);
        await axios.patch(
          `/api/${params.storeId}/sellers/${params.sellerId}`,
          payload
        );
        router.push(`/${params.storeId}/sellers`);
        toastSuccess(toastMessage);
      } else {
        const seller = await axios.post(
          `/api/${params.storeId}/sellers`,
          payload
        );
        router.push(
          `/${params.storeId}/stripe-connect?sellerId=${seller.data.id}`
        );
      }
      toastSuccess(toastMessage);
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

      {/* Select component for seller type */}
      {/* <div className="flex items-center space-x-2 my-4">
        <Select onValueChange={setSellerType} defaultValue="influencer">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Seller Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Seller Type</SelectLabel>
              <SelectItem value="influencer">Influencer</SelectItem>
              <SelectItem value="re-seller">Re-seller</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div> */}
      <Separator className="mb-8" />
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 underline">
                Required Fields
              </h2>
              <div className="grid grid-cols-2 gap-6 w-full p-2 mb-2">
                {/* Common fields */}
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
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AU">AU</SelectItem>
                          <SelectItem value="GB">GB</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
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
                /> */}
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
                    name="consignmentRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consignment Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            disabled={loading}
                            placeholder="Consignment rate"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
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
                              <SelectItem
                                key={billboard.id}
                                value={billboard.id}
                              >
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
                  {/* Conditional form fields based on seller type */}
                  {sellerType === "re-seller" ? (
                    <></>
                  ) : (
                    <>
                      {/* Influencer-specific fields */}
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
              </CardContent>
            )}
          </Card>
          <Button disabled={loading} className="w-full " type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <div className="mt-4">

          {initialData && (
            <Button
              disabled={loading}
              className="w-full"
              onClick={() =>
                router.push(
                  `/${params.storeId}/stripe-connect?sellerId=${initialData.id}`
                )
              }
            >
              Edit Stripe Connect
            </Button>
          )}
      </div>
    </Card>
  );
};
