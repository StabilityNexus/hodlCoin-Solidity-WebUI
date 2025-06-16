import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        "bg-gradient-to-r from-muted/50 via-muted to-muted/50",
        "dark:from-purple-500/10 dark:via-purple-500/20 dark:to-purple-500/10",
        "light:from-blue-100/50 light:via-blue-200/50 light:to-blue-100/50",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton } 