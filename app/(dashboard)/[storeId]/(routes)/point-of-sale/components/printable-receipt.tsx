'use client'
import { useEffect, useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"

interface Product {
  id: string
  name: string
  ourPrice: number
}

interface PrintableReceiptProps {
  storeName: string
  selectedProducts: Product[]
  total: number
  currencySymbol: string
}

export default function PrintableReceipt({ 
  storeName = "My Store", 
  selectedProducts = [], 
  total = 0, 
  currencySymbol = "$" 
}: PrintableReceiptProps) {
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const date = new Date()
    setCurrentDate(date.toLocaleDateString() + " " + date.toLocaleTimeString())
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto my-8 print:shadow-none">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold">{storeName}</CardTitle>
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          {selectedProducts.map((product) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span>{product.name}</span>
              <span>{currencySymbol}{product.ourPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between font-bold">
          <span>Total</span>
          <span>{currencySymbol}{total.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-center text-center text-sm text-muted-foreground">
        <p>Thank you for your purchase!</p>
        <p>Please retain this receipt for your records.</p>
      </CardFooter>
    </Card>
  )
}

// import { useEffect, useState } from 'react'
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// interface Product {
//   id: string
//   name: string
//   ourPrice: number
// }

// interface PrintableReceiptProps {
//   storeName: string
//   selectedProducts: Product[]
//   total: number
//   currencySymbol: string
// }

// export default function PrintableReceipt({ storeName = "My Store", selectedProducts = [], total = 0, currencySymbol = "$" }: PrintableReceiptProps) {
//   const [currentDate, setCurrentDate] = useState("")

//   useEffect(() => {
//     const date = new Date()
//     setCurrentDate(date.toLocaleDateString() + " " + date.toLocaleTimeString())
//   }, [])

//   return (
//     <Card className="w-full max-w-md mx-auto my-8 print:shadow-none">
//       <CardHeader className="text-center border-b">
//         <CardTitle className="text-2xl font-bold">{storeName}</CardTitle>
//         <p className="text-sm text-muted-foreground">{currentDate}</p>
//       </CardHeader>
//       <CardContent className="pt-6">
//         <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
//         <div className="space-y-2">
//           {selectedProducts.map((product) => (
//             <div key={product.id} className="flex justify-between text-sm">
//               <span>{product.name}</span>
//               <span>{currencySymbol}{product.ourPrice.toFixed(2)}</span>
//             </div>
//           ))}
//         </div>
//         <div className="mt-4 pt-4 border-t flex justify-between font-bold">
//           <span>Total</span>
//           <span>{currencySymbol}{total.toFixed(2)}</span>
//         </div>
//       </CardContent>
//       <CardFooter className="flex-col items-center text-center text-sm text-muted-foreground">
//         <p>Thank you for your purchase!</p>
//         <p>Please retain this receipt for your records.</p>
//       </CardFooter>
//     </Card>
//   )
// }