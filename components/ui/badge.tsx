import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// CORRECT colors (restore after testing):
// card-pill:   bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/20 backdrop-blur-sm
// card-pill-dim: bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10 backdrop-blur-sm
// directory:   bg-gray-800 text-sm rounded (used for rating badge in DirectoryClient)

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-3 py-1 font-bold",
  {
    variants: {
      variant: {
        // Dashboard card pill (bright / featured)
        "card-pill": "bg-white/20 text-white text-xs uppercase tracking-wider rounded-full border border-white/20 backdrop-blur-sm",
        // Dashboard card pill (dimmed / secondary)
        "card-pill-dim": "bg-white/10 text-slate-300 text-xs uppercase tracking-wider rounded-full border border-white/10 backdrop-blur-sm",
        // Directory rating badge
        "directory": "bg-gray-800 text-sm rounded",
      },
    },
    defaultVariants: {
      variant: "card-pill",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
