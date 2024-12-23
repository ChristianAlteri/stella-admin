"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { TbFaceIdError, TbFaceId } from "react-icons/tb";
import { toast } from "react-hot-toast";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(3).max(20),
  currency: z.enum(["AUD", "GBP"]),
  consignmentRate: z.number().min(0).max(100),
  countryCode: z.enum(["AU", "GB"]),
  taxRate: z.number().min(0).max(100),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.enum(["Australia", "United Kingdom"]),
  }),
});
type FormValues = z.infer<typeof formSchema>;

export default function SimplifiedStoreModal() {
  const [loading, setLoading] = useState(false);
  const storeModal = useStoreModal();
  const router = useRouter();
  const params = useParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      currency: "GBP",
      consignmentRate: 50,
      countryCode: "GB",
      taxRate: 20,
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United Kingdom",
      },
    },
  });

  const countryCode = form.watch("countryCode");

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/stores", values);
      toast.success("Store created successfully!", {
        icon: <TbFaceId size={30} />,
      });
      setTimeout(() => {
        // window.location.assign(`/${response.data.id}`);
        router.push(`/${response.data.id}/on-boarding`);
        storeModal.onClose();
      }, 200);
      setLoading(false);
    } catch (error) {
      toast.error("Error creating store", {
        icon: <TbFaceIdError size={30} />,
      });
      console.error("Error server side post to api/stores", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create a New Store"
      description="Enter your store details to get started."
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
              disabled={loading}
              onValueChange={(value) =>
                form.setValue("currency", value as "AUD" | "GBP")
              }
              value={form.watch("currency")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Country Code</label>
            <p className="text-xs text-muted-foreground">
              Consignmate can currently only support stores in the UK and
              Australia
            </p>
            <Select
              disabled={loading}
              onValueChange={(value) =>
                form.setValue("countryCode", value as "AU" | "GB")
              }
              value={form.watch("countryCode")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GB">GB</SelectItem>
                <SelectItem value="AU">AU</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Consignor rate (%)</label>
            <p className="text-xs text-muted-foreground">
              Enter the percentage that consignors will earn from each sale.
            </p>
            <Input
              type="number"
              {...form.register("consignmentRate", {
                valueAsNumber: true,
                max: {
                  value: 100,
                  message: "The rate cannot exceed 100%",
                },
                
              })}
              disabled={loading}
              placeholder="Earnings Rate for Consignors"
            />
            {form.formState.errors.consignmentRate && (
              <p className="text-sm text-red-500">
                {form.formState.errors.consignmentRate.message}
              </p>
            )}
          </div>
          {/* <div className="space-y-2">
            <label className="text-sm font-medium">Tax Rate (%)</label>
            <Input
              type="number"
              {...form.register("taxRate", { valueAsNumber: true })}
              disabled={loading}
              placeholder="Tax Rate"
            />
            {form.formState.errors.taxRate && (
              <p className="text-sm text-red-500">
                {form.formState.errors.taxRate.message}
              </p>
            )}
          </div> */}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Address Line 1</label>
          <Input
            {...form.register("address.line1")}
            disabled={loading}
            placeholder="Address Line 1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Address Line 2 (optional)
          </label>
          <Input
            {...form.register("address.line2")}
            disabled={loading}
            placeholder="Address Line 2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Input
              {...form.register("address.city")}
              disabled={loading}
              placeholder="City"
            />
          </div>
          {countryCode === "AU" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Input
                {...form.register("address.state")}
                disabled={loading}
                placeholder="State"
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Postal Code</label>
            <Input
              {...form.register("address.postalCode")}
              disabled={loading}
              placeholder="Postal Code"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select
              disabled={loading}
              onValueChange={(value) =>
                form.setValue(
                  "address.country",
                  value as "Australia" | "United Kingdom"
                )
              }
              value={
                form.watch("address.country") as "Australia" | "United Kingdom"
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Input
              {...form.register("address.country")}
              disabled={loading}
              placeholder="Country"
            />
          </div> */}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            disabled={loading}
            variant="outline"
            onClick={storeModal.onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button disabled={loading} type="submit">
            Create Store
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// 'use client';

// import * as z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { useState } from "react";
// import { TbFaceIdError, TbFaceId } from "react-icons/tb";
// import toast from "react-hot-toast";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useStoreModal } from "@/hooks/use-store-modal";
// import { Modal } from "@/components/ui/modal";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const toastError = (message: string) => {
//   toast.error(message, {
//     style: { background: "white", color: "black" },
//     icon: <TbFaceIdError size={30} />,
//   });
// };

// const toastSuccess = (message: string) => {
//   toast.success(message, {
//     style: { background: "white", color: "green" },
//     icon: <TbFaceId size={30} />,
//   });
// };

// const formSchema = z.object({
//   name: z.string().min(3).max(20),
//   currency: z.string().min(1),
//   consignmentRate: z.number().min(0).max(100),
//   countryCode: z.string().min(1),
//   address: z.object({
//     street: z.string().min(1),
//     city: z.string().min(1),
//     state: z.string().optional(),
//     line1: z.string().optional(),
//     line2: z.string().optional(),
//     postalCode: z.string().min(1),
//     country: z.string().min(1),
//   }),
// });

// export default function StoreModal() {
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const storeModal = useStoreModal();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       currency: "GBP",
//       consignmentRate: 50,
//       countryCode: "GB",
//       address: {
//         street: "",
//         city: "",
//         state: "",
//         line1: "",
//         line2: "",
//         postalCode: "",
//         country: "",
//       },
//     },
//   });

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     if (step < 2) {
//       setStep(step + 1);
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await axios.post("/api/stores", values);
//       toastSuccess("Store created successfully!");
//       setTimeout(() => {
//         window.location.assign(`/${response.data.id}`);
//       }, 500);
//     } catch (error: any) {
//       toastError("Error creating store");
//       console.log("Error server side post to api/stores", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Create a New Store"
//       description="Enter your store details to get started."
//       isOpen={storeModal.isOpen}
//       onClose={storeModal.onClose}
//     >
//       <div>
//         <div className="space-y-4 py-2 pb-4">
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               {step === 1 && (
//                 <>
//                   <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Store Name</FormLabel>
//                         <FormControl>
//                           <Input disabled={loading} placeholder="Store Name" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="currency"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Currency</FormLabel>
//                         <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select a currency" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="GBP">GBP</SelectItem>
//                             <SelectItem value="AUD">AUD</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="countryCode"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Country Code</FormLabel>
//                         <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select a country code" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="GB">GB</SelectItem>
//                             <SelectItem value="AU">AU</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="consignmentRate"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Consignment Rate (%)</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             disabled={loading}
//                             placeholder="Consignment Rate"
//                             {...field}
//                             onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </>
//               )}
//               {step === 2 && (
//                 <>
//                 <FormField
//                     control={form.control}
//                     name="address.line1"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Line 1</FormLabel>
//                         <FormControl>
//                           <Input disabled={loading} placeholder="Line 1" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="address.city"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>City</FormLabel>
//                         <FormControl>
//                           <Input disabled={loading} placeholder="City" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="address.state"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>State/Province (optional)</FormLabel>
//                         <FormControl>
//                           <Input disabled={loading} placeholder="State/Province" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="address.line2"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Line 2 (optional)</FormLabel>
//                         <FormControl>
//                           <Input disabled={loading} placeholder="Line 2" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="address.postalCode"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Postal Code</FormLabel>
//                         <FormControl>
//                           <Input disabled={loading} placeholder="Postal Code" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="address.country"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Country</FormLabel>
//                         <FormControl>
//                           <Input disabled={loading} placeholder="Country" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </>
//               )}
//               <div className="pt-6 space-x-2 flex items-center justify-end w-full">
//                 {step > 1 && (
//                   <Button
//                     disabled={loading}
//                     variant="outline"
//                     onClick={() => setStep(step - 1)}
//                     type="button"
//                   >
//                     Back
//                   </Button>
//                 )}
//                 <Button
//                   disabled={loading}
//                   variant="outline"
//                   onClick={storeModal.onClose}
//                   type="button"
//                 >
//                   Cancel
//                 </Button>

//                   <Button
//                     disabled={loading}
//                     variant="outline"
//                     onClick={() => setStep(step - 1)}
//                     type="button"
//                   >
//                     Create Store
//                   </Button>

//                 <Button
//                   disabled={loading}
//                   type="button"
//                   onClick={() => setStep(step + 1)}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </div>
//       </div>
//     </Modal>
//   );
// }
