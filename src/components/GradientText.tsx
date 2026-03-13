import { cn } from "@/lib/utils";

interface GradientTextProps {
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function GradientText({
  colors = ["#5227FF", "#FF9FFC", "#B19EEF"],
  animationSpeed = 8,
  showBorder = false,
  className,
  children,
}: GradientTextProps) {
  const gradientColors = colors.length > 0 ? [...colors, colors[0]] : colors;
  const gradient = `linear-gradient(90deg, ${gradientColors.join(", ")})`;

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift",
        showBorder && "rounded-md border-2 border-transparent bg-clip-padding p-1",
        className
      )}
      style={{
        backgroundImage: gradient,
        animationDuration: `${animationSpeed}s`,
      }}
    >
      {children}
    </span>
  );
}
