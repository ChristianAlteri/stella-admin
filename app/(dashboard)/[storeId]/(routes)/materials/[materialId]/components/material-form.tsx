"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash2 } from "lucide-react"
import { Material } from "@prisma/client"
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
import ImageUpload from "@/components/ui/image-upload"

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

type MaterialFormValues = z.infer<typeof formSchema>

interface MaterialFormProps {
  initialData: Material | null;
};

export const MaterialForm: React.FC<MaterialFormProps> = ({
  initialData
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

  const title = initialData ? 'Edit a Material' : 'Create a new Material';
  const description = initialData ? 'Edit Materials.' : 'Add a new Material';
  const toastMessage = initialData ? 'Material updated!' : 'Material created!';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      value: ''
    }
  });

  const onSubmit = async (data: MaterialFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/materials/${params.materialId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/materials`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/materials`);
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
      await axios.delete(`/api/${params.storeId}/materials/${params.materialId}`);
      router.refresh();
      router.push(`/${params.storeId}/materials`);
      toastSuccess('Billboard deleted.');
    } catch (error: any) {
        toastError('Make sure you removed all products using this material first.');
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
            <Trash2 className="h-4 w-4" />
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
                    <Input disabled={loading} placeholder="Material name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Value" {...field} />
                  </FormControl>
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
