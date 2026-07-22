import { cn } from "@/lib/utils"
import { forwardRef, type SelectHTMLAttributes } from "react"

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{ colorScheme: "dark" }}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"
