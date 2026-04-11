"use client"

import * as React from "react"
import { Tabs } from "radix-ui"
import { cn } from "@/lib/utils"

// CORRECT colors (restore after testing):
// TabsList:    bg-slate-100 p-1 rounded-lg
// TabsTrigger active:   bg-white shadow-sm  +  text-[#FF5B33] (quick) or text-blue-600 (deep)
// TabsTrigger inactive: text-slate-500 hover:text-slate-700

const TabsRoot = Tabs.Root
const TabsList = React.forwardRef<
  React.ElementRef<typeof Tabs.List>,
  React.ComponentPropsWithoutRef<typeof Tabs.List>
>(({ className, ...props }, ref) => (
  <Tabs.List
    ref={ref}
    className={cn("flex p-1 rounded-lg bg-slate-100", className)}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof Tabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof Tabs.Trigger>
>(({ className, ...props }, ref) => (
  <Tabs.Trigger
    ref={ref}
    // TESTING: active = hot-pink bg, inactive = gray — restore to shadcn active: bg-white shadow-sm
    className={cn(
      "px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all",
      "text-slate-500 hover:text-slate-700",
      "data-[state=active]:bg-white data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof Tabs.Content>,
  React.ComponentPropsWithoutRef<typeof Tabs.Content>
>(({ className, ...props }, ref) => (
  <Tabs.Content ref={ref} className={cn("mt-2", className)} {...props} />
))
TabsContent.displayName = "TabsContent"

export { TabsRoot, TabsList, TabsTrigger, TabsContent }
