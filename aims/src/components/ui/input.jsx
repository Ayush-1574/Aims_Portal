import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Layout & Base Styles
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-2 text-sm shadow-sm transition-all duration-200",
        
        // Text & Placeholder
        "text-slate-900 placeholder:text-slate-400",
        
        // File Input Styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900",
        
        // Focus States (Softer Glow)
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500",
        
        // Hover State
        "hover:border-blue-300",

        // Disabled State
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-500",
        
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }