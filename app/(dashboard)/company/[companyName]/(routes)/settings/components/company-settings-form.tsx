'use client'

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash2 } from "lucide-react"
import { Company, Store, StoreAddress } from "@prisma/client"
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
import { AlertModal } from "@/components/ui/alert-modal"
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

interface CompanySettingsFormProps {
  company: Company
}

const formSchema = z.object({
  name: z.string().min(2),
  adminEmail: z.string().email(),
})

type CompanySettingsFormValues = z.infer<typeof formSchema>

export default function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...company,
    },
  })

  const onSubmit = async (data: CompanySettingsFormValues) => {
    try {
      setLoading(true)
      await axios.patch(`/api/company/${company.id}`, data)
      router.refresh()
      toast.success("Company updated.")
    } catch (error: any) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      // setLoading(true)
      // await axios.delete(`/api/company/${company.id}`)
      // router.refresh()
      // router.push("/")
      toast.success("Please contact support to delete a company.")
    } catch (error: any) {
      toast.error("Make sure you removed all products and categories first.")
    } finally {
      setLoading(false)
      setOpen(false)
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
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Company Settings</CardTitle>
              <CardDescription>Manage your Company details</CardDescription>
            </div>
            <Button
              disabled={loading}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Company
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
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Admin Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
