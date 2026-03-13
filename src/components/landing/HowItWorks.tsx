import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Take Career Test",
    description: "Discover your strengths and the courses that fit you best.",
    href: "/career-dna",
    cta: "Start now",
  },
  {
    step: 2,
    title: "Predict Admissions",
    description: "See which colleges match your rank and marks.",
    href: "/college-predictor",
    cta: "Predict",
  },
  {
    step: 3,
    title: "Track Scholarships",
    description: "Find scholarships and never miss a deadline.",
    href: "/scholarships",
    cta: "Explore",
  },
];

export function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-1">
      <div className="flex flex-col md:flex-row md:items-start gap-8 sm:gap-10 md:gap-0">
        {steps.map((item, index) => (
          <div key={item.step} className="flex flex-1 flex-col md:flex-row md:items-start">
            <div className="flex flex-col items-center text-center flex-1 min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 text-primary items-center justify-center mb-3 sm:mb-4 font-bold text-base sm:text-lg shrink-0">
                {item.step}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 break-words">{item.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 px-2 sm:px-0">{item.description}</p>
              <Link
                to={item.href}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline transition-colors"
              >
                {item.cta}
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:flex flex-1 min-w-[40px] max-w-[60px] pt-7 justify-center" aria-hidden>
                <div className="h-0.5 w-full bg-border mt-7" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
