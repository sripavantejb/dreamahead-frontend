import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, FileText, BarChart3, CheckCircle2, Building2 } from "lucide-react";
import { ToolLanding } from "@/components/ToolLanding";

const Cutoffs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStart = () => {
    // No authentication required - start directly
  };

  return (
    <ToolLanding
      icon={TrendingUp}
      title="Cutoff Predictor"
      subtitle="Know what it takes to get in"
      description="Get previous year cutoff ranks and scores for your target colleges. Don't guess your chances—know exactly where you stand before counselling begins."
      gradient="from-purple-500 to-pink-500"
      benefits={[
        {
          icon: FileText,
          title: "Historical Trends",
          description: "View last 3 years cutoff data to spot patterns and trends"
        },
        {
          icon: BarChart3,
          title: "Multiple Streams",
          description: "Compare cutoffs across engineering, medical, and other streams"
        },
        {
          icon: CheckCircle2,
          title: "Realistic Goals",
          description: "Set achievable targets based on actual admission data"
        },
        {
          icon: Building2,
          title: "All Top Colleges",
          description: "Cutoff data for IITs, NITs, IIITs, and state colleges"
        }
      ]}
      onStart={handleStart}
    />
  );
};

export default Cutoffs;