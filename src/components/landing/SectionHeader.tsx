import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional small label above the title (e.g. "Tools", "Resources") */
  overline?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, overline, className }: SectionHeaderProps) {
  return (
    <div className={cn("text-center mb-8 sm:mb-12 md:mb-16 px-1", className)}>
      {overline && (
        <p className="text-xs font-medium uppercase tracking-widest text-primary/80 mb-2 sm:mb-3">
          {overline}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground break-words">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-3 sm:mt-4 leading-relaxed px-0 sm:px-2">
          {subtitle}
        </p>
      )}
      <div className="mt-4 sm:mt-6 mx-auto w-12 h-0.5 bg-primary/30 rounded-full" aria-hidden />
    </div>
  );
}
