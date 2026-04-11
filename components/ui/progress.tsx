"use client"

import * as React from "react"
import { Progress } from "radix-ui"
import { cn } from "@/lib/utils"

// CORRECT colors (restore after testing):
// Root (track): bg-gray-800 rounded-full h-1.5 overflow-hidden
// Indicator:    bg-[#FF5B33] h-full rounded-full transition-all duration-500 ease-out

const ProgressBar = React.forwardRef<
  React.ElementRef<typeof Progress.Root>,
  React.ComponentPropsWithoutRef<typeof Progress.Root>
>(({ className, value, ...props }, ref) => (
  <Progress.Root
    ref={ref}
    className={cn("relative w-full rounded-full h-1.5 overflow-hidden bg-gray-800", className)}
    value={value}
    {...props}
  >
    <Progress.Indicator
      className="h-full rounded-full bg-[#FF5B33] transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </Progress.Root>
))
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
