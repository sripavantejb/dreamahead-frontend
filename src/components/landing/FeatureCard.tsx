import { type LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  curiosityText?: string;
  icon: LucideIcon;
  path: string;
  onClick: (path: string) => void;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  curiosityText,
  icon: Icon,
  path,
  onClick,
  className,
}: FeatureCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onClick(path)}
      onKeyDown={(e) => e.key === "Enter" && onClick(path)}
      className={cn(
        "rounded-xl shadow-card border border-border overflow-hidden cursor-pointer bg-card min-w-0",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/30",
        "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "active:scale-[0.99] sm:active:scale-100",
        className
      )}
    >
      <CardHeader className="p-4 sm:p-6 md:p-7 pb-2 sm:pb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/15 transition-colors duration-300 shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={1.75} />
        </div>
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground break-words">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">{description}</p>
      </CardHeader>
      {(curiosityText || true) && (
        <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6 md:px-7 md:pb-7">
          {curiosityText ? (
            <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">{curiosityText}</p>
          ) : null}
          <span className={cn("inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary group-hover:gap-2 transition-all", curiosityText && "mt-2 sm:mt-3")}>
            Explore
            <ArrowRight className="w-4 h-4" />
          </span>
        </CardContent>
      )}
    </Card>
  );
}
