"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash } from "lucide-react"
import { Billboard, Category, Designer, Seller } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

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
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"
import { TbFaceId, TbFaceIdError } from "react-icons/tb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(1),
  instagramHandle: z.string().min(1),
  billboardId: z.string().min(1),
  charityName: z.string().optional(),
  charityUrl: z.string().optional(),
  shoeSizeEU: z.string().min(1),
  topSize: z.string().min(1),
  bottomSize: z.string().min(1),
});

type SellerFormValues = z.infer<typeof formSchema>

interface SellerFormProps {
  initialData: Seller | null;
  billboards: Billboard[] | null;  
};

export const SellerForm: React.FC<SellerFormProps> = ({
  initialData,
  billboards
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const title = initialData ? 'Edit a Seller' : 'Create a new Seller';
  const description = initialData ? 'Edit a Seller.' : 'Create a new Seller';
  const toastMessage = initialData ? 'Seller updated!' : 'Seller created!';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      billboardId: initialData.billboardId || '',
    } : {
      name: '',
      billboardId: '',
    }
  });

  const onSubmit = async (data: SellerFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        console.log("DATA", data);
        await axios.patch(`/api/${params.storeId}/sellers/${params.sellerId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/sellers`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/sellers`);
      console.log("Seller", data);
      toastSuccess(toastMessage);
    } catch (error: any) {
        toastError('Something went wrong.');
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
      toastSuccess('Seller deleted.');
    } catch (error: any) {
        toastError('Make sure you removed all products using this seller first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }


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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Seller Name" {...field} />
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
                    <Input disabled={loading} placeholder="just name" {...field} />
                  </FormControl>
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
                    <Input disabled={loading} placeholder="Oxfam" {...field} />
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
                  <FormLabel>Charity URL</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="www.oxfam.com" {...field} />
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
                    <Input disabled={loading} placeholder="39" {...field} />
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
                    <Input disabled={loading} placeholder="small" {...field} />
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
                    <Input disabled={loading} placeholder="medium" {...field} />
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
                  <FormLabel>Billboard</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl> 
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a billboard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent> 
                      {billboards?.map((billboard) => (
                        <SelectItem 
                        key={billboard.id} 
                        value={billboard.id} >
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
