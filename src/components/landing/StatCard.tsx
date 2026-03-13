import { type LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number;
  label: string;
  icon: LucideIcon;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function StatCard({
  value,
  label,
  icon: Icon,
  suffix = "",
  duration = 2500,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-6 md:p-7",
        "shadow-[0_1px_2px_rgba(0,0,0/0.04)]",
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0/0.06)] hover:border-primary/20",
        "flex flex-col items-center text-center min-w-0",
        className
      )}
    >
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary mb-3 sm:mb-4">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
      </div>
      <AnimatedCounter end={value} suffix={suffix} duration={duration} />
      <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 tracking-tight">{label}</div>
    </div>
  );
}
