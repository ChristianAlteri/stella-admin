'use client';

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";


import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useStoreModal } from "../../hooks/use-store-modal";
import { Modal } from "../ui/modal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const formSchema = z.object({
    name: z.string().min(3).max(20),
})

export const StoreModal = () => {
    const storeModal = useStoreModal();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
        // TODO: Create store
    }

    return ( 
        <Modal 
            title="Welcome to Stella"
            description="You are now logged in as an admin."
            isOpen={storeModal.isOpen}
            onClose={storeModal.onClose}
            >
                <div>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Store Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button variant="outline" onClick={storeModal.onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
        </Modal>
     );
}

export default StoreModal;
