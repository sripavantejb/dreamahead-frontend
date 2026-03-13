import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  name: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({
  quote,
  name,
  avatar,
  rating = 5,
  className,
}: TestimonialCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-card min-w-0",
        "transition-all duration-300 ease-out hover:shadow-card-hover hover:border-primary/10",
        className
      )}
    >
      {rating > 0 && (
        <div className="flex gap-0.5 mb-3 sm:mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
      <blockquote className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed mb-4 sm:mb-6">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-border shrink-0">
          <AvatarImage src={avatar} alt={name} loading="lazy" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-foreground">{name}</span>
      </div>
    </div>
  );
}
