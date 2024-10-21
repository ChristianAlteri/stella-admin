'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Grid } from "lucide-react"

export default function StoreConfig() {
  const params = useParams()
  const pathname = usePathname()

  const configRoutes = [
    {
      href: `/${params.storeId}/billboards`,
      label: 'Profile Pictures',
      description: 'Manage your store Profile Pictures',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/designers`,
      label: 'Designers',
      description: 'Manage your store designers',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/categories`,
      label: 'Categories',
      description: 'Manage your store categories',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/sub-categories`,
      label: 'Sub-categories',
      description: 'Organize your product categories',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: 'Sizes',
      description: 'Set up product sizes',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/conditions`,
      label: 'Conditions',
      description: 'Define product conditions',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/materials`,
      label: 'Materials',
      description: 'Manage product materials',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/colors`,
      label: 'Colors',
      description: 'Set up product colors',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/genders`,
      label: 'Genders',
      description: 'Manage gender categories',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/settings`,
      label: 'Store Settings',
      description: 'Configure your store settings',
      icon: <Grid className="h-6 w-6" />,
    },
    {
      href: `/${params.storeId}/manage-readers`,
      label: 'Manage Readers',
      description: 'Control access to your store',
      icon: <Grid className="h-6 w-6" />,
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Store Configuration</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configRoutes.map((route) => (
          <Link key={route.href} href={route.href} className="no-underline">
            <Card className={`hover:bg-accent transition-colors ${pathname === route.href ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {route.icon}
                  <div>
                    <CardTitle>{route.label}</CardTitle>
                    <CardDescription>{route.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}