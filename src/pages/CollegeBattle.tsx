import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swords, Scale, Target, BarChart3 } from "lucide-react";
import { ToolLanding } from "@/components/ToolLanding";

const CollegeBattle = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStart = () => {
    // No authentication required - start directly
  };

  return (
    <ToolLanding
      icon={Swords}
      title="College Battle"
      subtitle="Compare colleges like a pro"
      description="Compare two colleges side-by-side across all important factors: placements, academics, campus life, fees, and more. Make data-driven decisions."
      gradient="from-blue-500 to-purple-500"
      benefits={[
        {
          icon: Scale,
          title: "Side-by-Side Comparison",
          description: "Compare colleges across multiple parameters"
        },
        {
          icon: BarChart3,
          title: "Data-Driven Insights",
          description: "Make decisions based on real statistics and data"
        },
        {
          icon: Target,
          title: "Personalized Results",
          description: "Get recommendations based on your preferences"
        }
      ]}
      onStart={handleStart}
    />
  );
};

export default CollegeBattle;