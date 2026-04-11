import * as React from "react"
import { cn } from "@/lib/utils"

// CORRECT colors (restore after testing):
// Dark context (CaseAdvisor): bg-gray-800 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500
// Chat input (GeneralQueries): bg-transparent border-none focus:ring-0 (keep as-is, not replaced)

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base defaults
        "flex w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-3 text-sm text-white placeholder:text-gray-400",
        "transition-all outline-none resize-none",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
