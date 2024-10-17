"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import StripeTerminal from "./components/stripe-terminal"

const PointOfSalePage = () => {
  return (
    <div className="bg-secondary w-full h-full justify-center items-center text-center">
      <CardHeader>
        <div className="text-2xl text-black font-bold flex items-center w-full text-center">
          <CreditCard className="mr-2 h-6 w-6" />
          Point of Sale
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center items-center w-full">
          <StripeTerminal />
        </div>
      </CardContent>
    </div>
  )
}

export default PointOfSalePage
