import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-xl shadow-sm">
    <div className="w-full overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm text-left border-collapse", className)}
        {...props} 
      />
    </div>
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm [&_tr]:border-b border-slate-200 shadow-sm", 
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} 
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-100 transition-colors hover:bg-blue-50/50 data-[state=selected]:bg-blue-50",
      className
    )}
    {...props} 
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider align-middle [&:has([role=checkbox])]:pr-0 whitespace-nowrap",
      className
    )}
    {...props} 
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle text-slate-700 font-medium [&:has([role=checkbox])]:pr-0 tabular-nums", 
      className
    )}
    {...props} 
  />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }