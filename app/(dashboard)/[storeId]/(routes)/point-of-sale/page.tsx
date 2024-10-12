"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import StripeTerminal from "./components/stripe-terminal"

const PointOfSalePage = () => {
  return (
    <Card className="w-full h-full justify-center items-center text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center w-full text-center">
          <CreditCard className="mr-2 h-6 w-6" />
          Point of Sale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center items-center w-full">
          <StripeTerminal />
        </div>
      </CardContent>
    </Card>
  )
}

export default PointOfSalePage
