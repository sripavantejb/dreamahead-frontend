import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            We're Working on Something Exciting
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
            This page is under construction. We're building something amazing for you. Stay tuned!
          </p>
          <Button onClick={() => navigate("/")} size="lg" className="bg-gradient-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComingSoon;
