import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// CORRECT colors (restore after testing):
// destructive: bg-red-900/20 border border-red-500 rounded-xl  — text: text-red-200, icon: text-red-500
// warning:     bg-yellow-900/10 border border-yellow-700/30 rounded-xl — text: text-gray-400, title: text-yellow-500
// info:        bg-yellow-500/10 border border-yellow-500/20 rounded — text: text-yellow-200

const alertVariants = cva(
  "relative w-full rounded-xl border p-6",
  {
    variants: {
      variant: {
        destructive: "bg-red-900/20 border-red-500 text-red-200",
        warning: "bg-yellow-900/10 border-yellow-700/30",
        info: "rounded p-3 text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-200",
      },
    },
    defaultVariants: {
      variant: "destructive",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("mb-1 text-sm font-bold leading-none", className)} {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs leading-relaxed", className)} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
