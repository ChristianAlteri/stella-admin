"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Store } from "@prisma/client"; 
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useOrigin } from "@/hooks/use-origin";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsFormProps {
  initialData: Store;
}

const formSchema = z.object({
  name: z.string().min(2),
  address: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
      line1: z.string().optional(),
      line2: z.string().optional(),
      postalCode: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
  consignmentRate: z
    .number()
    .min(0)
    .max(100)
    .int("Consignment rate must be a whole number."),
  currency: z.enum(["AUD", "GBP"]),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      currency: initialData.currency as "AUD" | "GBP",
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success("Store updated.");
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Store successfully deleted.");
    } catch (error: any) {
      toast.error("Make sure you removed all products and categories first.");
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
                        <Input disabled={loading} placeholder="Store name" {...field} defaultValue={initialData.name} />
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
                          defaultValue={initialData.consignmentRate}
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
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Address Information</h3>
                <p className="text-sm text-muted-foreground">Enter your store&apos;s address details</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {["line1", "line2", "city", "state", "postalCode", "country"].map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    defaultValue={field.toUpperCase()}
                    name={`address.${field}` as any}
                    render={({ field: fieldProps }) => (
                      <FormItem>
                        <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            {...fieldProps}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
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
  );
}

// "use client";

// import * as z from "zod";
// import axios from "axios";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { toast } from "react-hot-toast";
// import { Trash } from "lucide-react";
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
// import { Heading } from "@/components/ui/heading";
// import { ApiAlert } from "@/components/ui/api-alert";
// import { Store } from "@prisma/client";
// import { Trash2 } from "lucide-react";
// import { TbFaceId, TbFaceIdError } from "react-icons/tb";
// import { AlertModal } from "@/components/modals/alert-modal";

// interface SettingsFormProps {
//   initialData: Store;
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
// });

// type SettingsFormValues = z.infer<typeof formSchema>;

// const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
//   const params = useParams();
//   const router = useRouter();
//   const origin = useOrigin();

//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const form = useForm<SettingsFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       ...initialData,
//       currency: initialData.currency as "AUD" | "GBP",
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
//       <div className="flex items-center justify-between">
//         <Heading title="Settings" description="Manage your store's settings" />
//         <Button
//           disabled={loading}
//           variant="destructive"
//           size="sm"
//           onClick={() => setOpen(true)}
//         >
//           <Trash2 className="w-5 h-5 hover:text-stone-900" />
//         </Button>
//       </div>
//       <Separator />
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-8 w-full"
//         >
//           <div className="grid grid-cols-3 gap-8">
//             {/* Store Name */}
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Store Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder="Store name"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Consignment Rate */}
//             <FormField
//               control={form.control}
//               name="consignmentRate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Consignment Rate</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       min={0}
//                       max={100}
//                       disabled={loading}
//                       placeholder="Consignment rate"
//                       {...field}
//                       value={field.value as number} // Ensures the value is treated as a number
//                       onChange={(e) => field.onChange(e.target.valueAsNumber)} // Uses valueAsNumber to handle number input
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Currency */}
//             <FormField
//               control={form.control}
//               name="currency"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Currency</FormLabel>
//                   <FormControl>
//                     <select disabled={loading} {...field}>
//                       <option value="AUD">AUD</option>
//                       <option value="GBP">GBP</option>
//                     </select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Address Fields */}
//             <FormField
//               control={form.control}
//               name="address.city"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>City</FormLabel>
//                   <FormControl>
//                     <Input disabled={loading} placeholder="City" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="address.country"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Country</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder="Country"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="address.line1"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Address Line 1</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder="Address line 1"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="address.line2"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Address Line 2</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder="Address line 2"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="address.postalCode"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Postal Code</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder="Postal code"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="address.state"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>State</FormLabel>
//                   <FormControl>
//                     <Input disabled={loading} placeholder="State" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <Button disabled={loading} className="ml-auto" type="submit">
//             Save changes
//           </Button>
//         </form>
//       </Form>
//       <Separator />
//     </>
//   );
// };

// export default SettingsForm;

