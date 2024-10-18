"use client";

import { useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type AddFieldFormValues = z.infer<typeof formSchema>;

interface AddFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldAdded: () => void;
  fieldType:
    | "sizes"
    | "colors"
    | "conditions"
    | "materials"
    | "genders"
    | "sub-categories"
    | "categories"
    | "designers";
  title: string;
  description: string;
}

export function AddFieldDialog({
  isOpen,
  onClose,
  onFieldAdded,
  fieldType,
  title,
  description,
}: AddFieldDialogProps) {
  const [loading, setLoading] = useState(false);
  const params = useParams();

  const form = useForm<AddFieldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: AddFieldFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/${params.storeId}/${fieldType}`, data);
      toast.success(`${title} created successfully`);
      form.reset();
      onFieldAdded();
      onClose();
    } catch (error) {
      console.log("error", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder={`${title} name`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
// 'use client'

// import { useState } from 'react'
// import axios from 'axios'
// import { useParams } from 'next/navigation'
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import * as z from "zod"
// import { toast } from "react-hot-toast"

// const formSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   value: z.string().min(1, "Value is required"),
// })

// type AddFieldFormValues = z.infer<typeof formSchema>

// interface AddFieldDialogProps {
//   isOpen: boolean
//   onClose: () => void
//   onFieldAdded: () => void
// }

// export function AddFieldDialog({ isOpen, onClose, onFieldAdded }: AddFieldDialogProps) {
//   const [loading, setLoading] = useState(false)
//   const params = useParams()

//   const form = useForm<AddFieldFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       value: "",
//     },
//   })

//   const onSubmit = async (data: AddFieldFormValues) => {
//     try {
//       setLoading(true)
//       await axios.post(`/api/${params.storeId}/sizes`, data)
//       toast.success("Size created successfully")
//       form.reset()
//       onFieldAdded()
//       onClose()
//     } catch (error) {
//       toast.error("Something went wrong")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add New Size</DialogTitle>
//           <DialogDescription>
//             Create a new size for your products.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input disabled={loading} placeholder="Size name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="value"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Value</FormLabel>
//                   <FormControl>
//                     <Input disabled={loading} placeholder="Size value" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <DialogFooter>
//               <Button type="submit" disabled={loading}>
//                 Create
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }
