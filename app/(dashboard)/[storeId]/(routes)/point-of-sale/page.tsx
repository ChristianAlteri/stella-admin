"use client"

import StripeTerminal from "./components/stripe-terminal"

const PointOfSalePage = () => {
  return (
    
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
          <StripeTerminal />
        </div>
    </div>
  )
}

export default PointOfSalePage
