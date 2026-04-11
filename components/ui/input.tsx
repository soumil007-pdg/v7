import * as React from "react"
import { cn } from "@/lib/utils"

// CORRECT colors (restore after testing):
// Light context (Auth):  border-slate-200 focus:border-[#FF5B33] focus:ring-4 focus:ring-[#FF5B33]/10 text-slate-900 placeholder:text-slate-400
// Dark context (CaseAdvisor): bg-gray-800 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500
// Pass dark context classes via className — they override the light defaults via cn()

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base light defaults (Auth context)
        "flex w-full rounded-lg border border-slate-200 bg-background px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400",
        "transition-all outline-none",
        "focus:border-[#FF5B33] focus:ring-4 focus:ring-[#FF5B33]/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // className overrides everything above (used for dark context)
        className
      )}
      {...props}
    />
  )
}

export { Input }
