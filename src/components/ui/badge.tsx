import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "success" | "warning"
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<string, string> = {
  default: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
  secondary: "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
  destructive: "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-white",
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
