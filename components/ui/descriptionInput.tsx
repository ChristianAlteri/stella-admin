
import React, { forwardRef, InputHTMLAttributes } from "react";


import { cn } from "@/lib/utils"

export interface DescriptionInput
extends React.InputHTMLAttributes<HTMLInputElement> {}

const DescriptionInput = React.forwardRef<HTMLInputElement, DescriptionInput>(
    ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
DescriptionInput.displayName = "Input"

export { DescriptionInput }
