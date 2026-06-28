import { cn } from "@/lib/utils"

export function Card({ className, ...props }: any) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all",
        className
      )}
      {...props}
    />
  )
}
