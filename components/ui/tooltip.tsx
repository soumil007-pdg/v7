"use client"

import * as React from "react"
import { Tooltip } from "radix-ui"
import { cn } from "@/lib/utils"

// CORRECT colors (restore after testing):
// Content: bg-white border border-slate-200 shadow-2xl rounded-xl p-4
// Title:   text-slate-900 font-bold text-sm
// Body:    text-slate-600 text-[11px] leading-relaxed

const TooltipProvider = Tooltip.Provider
const TooltipRoot = Tooltip.Root
const TooltipTrigger = Tooltip.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Tooltip.Content>,
  React.ComponentPropsWithoutRef<typeof Tooltip.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <Tooltip.Portal>
    <Tooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-2xl",
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </Tooltip.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent }
