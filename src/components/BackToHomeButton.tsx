import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export const BackToHomeButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check on mount
    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      onClick={() => navigate("/")}
      className="fixed bottom-6 right-6 z-50 rounded-full w-16 h-16 shadow-elegant bg-gradient-primary hover:scale-110 hover:shadow-2xl transition-all duration-300 animate-scale-in"
      size="icon"
      title="Back to Home"
    >
      <Home className="h-7 w-7 text-white" />
    </Button>
  );
};
