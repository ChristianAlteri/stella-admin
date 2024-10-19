'use client'

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash2 } from "lucide-react"
import { Store, StoreAddress } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useOrigin } from "@/hooks/use-origin"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/modals/alert-modal"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sanitiseAddress } from "@/lib/utils"

interface SettingsFormProps {
  initialData: Store
  storeAddress: StoreAddress | null
}

const formSchema = z.object({
  name: z.string().min(2),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
  consignmentRate: z
    .number()
    .min(0)
    .max(100)
    .int("Consignment rate must be a whole number."),
  currency: z.enum(["AUD", "GBP"]),
  countryCode: z.enum(["AU", "GB"]),
})

type SettingsFormValues = z.infer<typeof formSchema>

export default function SettingsForm({ initialData, storeAddress }: SettingsFormProps) {
  const params = useParams()
  const router = useRouter()
  const origin = useOrigin()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const sanitisedAddress = sanitiseAddress(storeAddress)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      address: sanitisedAddress || {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: initialData.countryCode === "AU" ? "Australia" : "United Kingdom",
      },
      currency: initialData.currency as "AUD" | "GBP",
      countryCode: initialData.countryCode as "AU" | "GB",
    },
  })

  const countryCode = form.watch("countryCode")

  useEffect(() => {
    // Update address fields when country changes, preserving existing values
    const currentAddress = form.getValues("address")
    form.setValue("address", {
      ...currentAddress,
      country: countryCode === "AU" ? "Australia" : "United Kingdom",
      state: countryCode === "AU" ? currentAddress.state : undefined,
    })
  }, [countryCode, form])

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true)
      await axios.patch(`/api/stores/${params.storeId}`, data)
      router.refresh()
      toast.success("Store updated.")
    } catch (error: any) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh()
      router.push("/")
      toast.success("Store successfully deleted.")
    } catch (error: any) {
      toast.error("Make sure you removed all products and categories first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const renderAddressFields = () => {
    const commonFields = ["line1", "city", "postalCode"]
    const australiaFields = [...commonFields, "state"]
    const ukFields = commonFields

    const fields = countryCode === "AU" ? australiaFields : ukFields

    return fields.map((field) => (
      <FormField
        key={field}
        control={form.control}
        name={`address.${field}` as any}
        render={({ field: fieldProps }) => (
          <FormItem>
            <FormLabel>{field === "postalCode" ? "Postal Code" : field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
            <FormControl>
              <Input
                disabled={loading}
                placeholder={field === "postalCode" ? "Postal Code" : field.charAt(0).toUpperCase() + field.slice(1)}
                {...fieldProps}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ))
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Store Settings</CardTitle>
              <CardDescription>Manage your store&apos;s details and preferences</CardDescription>
            </div>
            <Button
              disabled={loading}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Store
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Store name" {...field} />
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
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
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
                          <SelectItem value="AUD">AUD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Code</FormLabel>
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
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Address Information</h3>
                <p className="text-sm text-muted-foreground">Enter your store&apos;s address details</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {renderAddressFields()}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={form.handleSubmit(onSubmit)}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
// "use client";

// import * as z from "zod";
// import axios from "axios";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { toast } from "react-hot-toast";
// import { Trash2 } from "lucide-react";
// import { Store, StoreAddress } from "@prisma/client"; 
// import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import { useOrigin } from "@/hooks/use-origin";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Separator } from "@/components/ui/separator";
// import { AlertModal } from "@/components/modals/alert-modal";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { sanitiseAddress } from "@/lib/utils";

// interface SettingsFormProps {
//   initialData: Store;
//   storeAddress: StoreAddress | null;
// }


// const formSchema = z.object({
//   name: z.string().min(2),
//   address: z
//     .object({
//       city: z.string().optional(),
//       country: z.string().optional(),
//       line1: z.string().optional(),
//       line2: z.string().optional(),
//       postalCode: z.string().optional(),
//       state: z.string().optional(),
//     })
//     .optional(),
//   consignmentRate: z
//     .number()
//     .min(0)
//     .max(100)
//     .int("Consignment rate must be a whole number."),
//   currency: z.enum(["AUD", "GBP"]),
//   countryCode: z.enum(["AU", "GB"]),
// });

// type SettingsFormValues = z.infer<typeof formSchema>;

// export default function SettingsForm({ initialData, storeAddress }: SettingsFormProps) {
//   const params = useParams();
//   const router = useRouter();
//   const origin = useOrigin();

//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const sanitisedAddress = sanitiseAddress(storeAddress);

//   const form = useForm<SettingsFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       ...initialData,
//       address: sanitisedAddress,
//       currency: initialData.currency as "AUD" | "GBP",
//       countryCode: initialData.countryCode as "AU" | "GB",
//     },
//   });

//   const onSubmit = async (data: SettingsFormValues) => {
//     try {
//       setLoading(true);
//       await axios.patch(`/api/stores/${params.storeId}`, data);
//       router.refresh();
//       toast.success("Store updated.");
//     } catch (error: any) {
//       toast.error("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDelete = async () => {
//     try {
//       setLoading(true);
//       await axios.delete(`/api/stores/${params.storeId}`);
//       router.refresh();
//       router.push("/");
//       toast.success("Store successfully deleted.");
//     } catch (error: any) {
//       toast.error("Make sure you removed all products and categories first.");
//     } finally {
//       setLoading(false);
//       setOpen(false);
//     }
//   };

//   return (
//     <>
//       <AlertModal
//         isOpen={open}
//         onClose={() => setOpen(false)}
//         onConfirm={onDelete}
//         loading={loading}
//       />
//       <Card className="w-full max-w-3xl mx-auto">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div className="space-y-1">
//               <CardTitle className="text-2xl">Store Settings</CardTitle>
//               <CardDescription>Manage your store&apos;s details and preferences</CardDescription>
//             </div>
//             <Button
//               disabled={loading}
//               variant="destructive"
//               size="sm"
//               onClick={() => setOpen(true)}
//             >
//               <Trash2 className="w-4 h-4 mr-2" />
//               Delete Store
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Store Name</FormLabel>
//                       <FormControl>
//                         <Input disabled={loading} placeholder="Store name" {...field} defaultValue={initialData.name} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="consignmentRate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Consignment Rate (%)</FormLabel>
//                       <FormControl>
//                         <Input
//                           defaultValue={initialData.consignmentRate}
//                           type="number"
//                           min={0}
//                           max={100}
//                           disabled={loading}
//                           placeholder="Consignment rate"
//                           {...field}
//                           onChange={(e) => field.onChange(e.target.valueAsNumber)}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="currency"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Currency</FormLabel>
//                       <Select
//                         disabled={loading}
//                         onValueChange={field.onChange}
//                         value={field.value}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue defaultValue={field.value} />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="AUD">AUD</SelectItem>
//                           <SelectItem value="GBP">GBP</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="countryCode"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Country Code</FormLabel>
//                       <Select
//                         disabled={loading}
//                         onValueChange={field.onChange}
//                         value={field.value}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue defaultValue={field.value} />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="AU">AU</SelectItem>
//                           <SelectItem value="GB">GB</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <Separator />
//               <div className="space-y-2">
//                 <h3 className="text-lg font-medium">Address Information</h3>
//                 <p className="text-sm text-muted-foreground">Enter your store&apos;s address details</p>
//               </div>
//               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                 {["line1", "line2", "city", "state", "postalCode", "country"].map((field) => (
//                   <FormField
//                     key={field}
//                     control={form.control}
//                     defaultValue={field.toUpperCase()}
//                     name={`address.${field}` as any}
//                     render={({ field: fieldProps }) => (
//                       <FormItem>
//                         <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
//                         <FormControl>
//                           <Input
//                             disabled={loading}
//                             placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//                             {...fieldProps}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 ))}
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//         <CardFooter className="flex justify-between">
//           <Button variant="outline" onClick={() => router.back()}>
//             Cancel
//           </Button>
//           <Button disabled={loading} onClick={form.handleSubmit(onSubmit)}>
//             Save Changes
//           </Button>
//         </CardFooter>
//       </Card>
//     </>
//   );
// }
