import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white hover:bg-slate-900/80",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
        // Role specific variants
        student: "border-transparent bg-purple-100 text-purple-700 hover:bg-purple-200",
        instructor: "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200",
        advisor: "border-transparent bg-pink-100 text-pink-700 hover:bg-pink-200",
        admin: "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        // Status variants
        success: "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
        outline: "text-slate-950 border border-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };