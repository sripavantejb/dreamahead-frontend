import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /**
   * Custom navigation handler. If not provided, uses navigate(-1)
   */
  onClick?: () => void;
  /**
   * Custom label text. Defaults to "Back"
   */
  label?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Universal back navigation button component
 * - Default behavior: navigate(-1) to go to previous page
 * - For multi-step flows: provide custom onClick handler
 * - Always visible in top-left with proper z-index
 */
export const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  label = "Back",
  className = "" 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:bg-muted/80 transition-colors z-20 pointer-events-auto ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};
