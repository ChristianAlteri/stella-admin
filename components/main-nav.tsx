"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const params = useParams()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: `/${params.storeId}/orders`,
      label: 'Orders',
      active: pathname === `/${params.storeId}/orders`,
    },
    {
      href: `/${params.storeId}/payouts`,
      label: 'Payouts',
      active: pathname === `/${params.storeId}/payouts`,
    },
  ]

  const configRoutes = [
    {
      href: `/${params.storeId}/billboards`,
      label: 'Billboards',
      active: pathname === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/sub-categories`,
      label: 'Sub-categories',
      active: pathname === `/${params.storeId}/sub-categories`,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: 'Sizes',
      active: pathname === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/conditions`,
      label: 'Conditions',
      active: pathname === `/${params.storeId}/conditions`,
    },
    {
      href: `/${params.storeId}/materials`,
      label: 'Materials',
      active: pathname === `/${params.storeId}/materials`,
    },
    {
      href: `/${params.storeId}/colors`,
      label: 'Colors',
      active: pathname === `/${params.storeId}/colors`,
    },
    {
      href: `/${params.storeId}/genders`,
      label: 'Genders',
      active: pathname === `/${params.storeId}/genders`,
    },
    {
      href: `/${params.storeId}/settings`,
      label: 'Store Settings',
      active: pathname === `/${params.storeId}/settings`,
    },
    {
      href: `/${params.storeId}/manage-readers`,
      label: 'Manage Readers',
      active: pathname === `/${params.storeId}/manage-readers`,
    },
  ]

  return (
    <nav
      className={cn("flex flex-row items-center justify-center  w-full", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary px-3 py-1 hover:underline hover:cursor-pointer hover:bg-background rounded-md',
            route.active ? 'text-black dark:text-white' : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
      {/* <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 px-4 flex items-center">
            Store Config
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px] space-y-2">
          {configRoutes.map((route) => (
            <DropdownMenuItem key={route.href} asChild>
              <Link
                href={route.href}
                className={cn(
                  'w-full text-sm font-medium transition-colors hover:text-primary px-3 py-2',
                  route.active ? 'text-black dark:text-white' : 'text-muted-foreground'
                )}
              >
                {route.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}
    </nav>
  )
}
