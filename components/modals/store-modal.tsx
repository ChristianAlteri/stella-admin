'use client';

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { TbFaceIdError, TbFaceId } from "react-icons/tb";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const formSchema = z.object({
  name: z.string().min(3).max(20),
  currency: z.string().min(1),
  consignmentRate: z.number().min(0).max(100),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
});

export default function StoreModal() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const storeModal = useStoreModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      currency: "GBP",
      consignmentRate: 50,
      address: {
        street: "",
        city: "",
        state: "",
        line1: "",
        line2: "",
        postalCode: "",
        country: "",
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/stores", values);
      toastSuccess("Store created successfully!");
      setTimeout(() => {
        window.location.assign(`/${response.data.id}`);
      }, 500);
    } catch (error: any) {
      toastError("Error creating store");
      console.log("Error server side post to api/stores", error);
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
      <div>
        <div className="space-y-4 py-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="Store Name" {...field} />
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
                        <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
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
                            disabled={loading} 
                            placeholder="Consignment Rate" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {step === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="Street Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province (optional)</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="State/Province" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Line 1 (optional)</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="Line 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Line 2 (optional)</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="Line 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="Postal Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                {step > 1 && (
                  <Button
                    disabled={loading}
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    type="button"
                  >
                    Back
                  </Button>
                )}
                <Button
                  disabled={loading}
                  variant="outline"
                  onClick={storeModal.onClose}
                  type="button"
                >
                  Cancel
                </Button>

                  <Button
                    disabled={loading}
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    type="button"
                  >
                    Create Store
                  </Button>

                
                <Button
                  disabled={loading}
                  type="button"
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  );
}

// "use client";

// import * as z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import axios from "axios";

// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "../ui/form";
// import { useStoreModal } from "../../hooks/use-store-modal";
// import { Modal } from "../ui/modal";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import { useState } from "react";

// import { TbFaceIdError, TbFaceId } from "react-icons/tb";
// import toast from "react-hot-toast";

// // Custom Toast Error
// const toastError = (message: string) => {
//   toast.error(message, {
//     style: {
//       background: "white",
//       color: "black",
//     },
//     icon: <TbFaceIdError size={30} />,
//   });
// };
// // Custom Toast Success
// const toastSuccess = (message: string) => {
//   toast.error(message, {
//     style: {
//       background: "white",
//       color: "green",
//     },
//     icon: <TbFaceId size={30} />,
//   });
// };

// const formSchema = z.object({
//   name: z.string().min(3).max(20),
// });

// export const StoreModal = () => {
//   const [loading, setLoading] = useState(false);
//   const storeModal = useStoreModal();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//     },
//   });

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       const response = await axios.post("/api/stores", values);
//       toastSuccess("Store created successfully!");
//       setTimeout(() => {
//         window.location.assign(`/${response.data.id}`)
//       }, 500)
//     } catch (error: any) {
//       toastError("Error creating store");
//       console.log("Error server side post to api/stores", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Welcome to Stella"
//       description="You are now logged in as an admin."
//       isOpen={storeModal.isOpen}
//       onClose={storeModal.onClose}
//     >
//       <div>
//         <div className="space-y-4 py-2 pb-4">
//           <div className="space-y-2">
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)}>
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Name</FormLabel>
//                       <FormControl>
//                         <Input
//                           disabled={loading}
//                           placeholder="Store Name"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <div className="pt-6 space-x-2 flex items-center justify-end w-full">
//                   <Button
//                     disabled={loading}
//                     variant="outline"
//                     onClick={storeModal.onClose}
//                   >
//                     Cancel
//                   </Button>
//                   <Button disabled={loading} type="submit">
//                     Continue
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default StoreModal;
