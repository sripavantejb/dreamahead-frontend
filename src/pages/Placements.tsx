import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, TrendingUp, Users, BarChart3 } from "lucide-react";
import { ToolLanding } from "@/components/ToolLanding";

const Placements = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStart = () => {
    // No authentication required - start directly
  };

  return (
    <ToolLanding
      icon={Building2}
      title="Placement Reality Checker"
      subtitle="See the real placement story"
      description="Get authentic placement data, salary insights, and company information. Make informed decisions based on real statistics, not marketing claims."
      gradient="from-orange-600 to-red-500"
      benefits={[
        {
          icon: BarChart3,
          title: "Real Data",
          description: "Authentic placement statistics from verified sources"
        },
        {
          icon: TrendingUp,
          title: "Salary Insights",
          description: "Detailed salary breakdowns and growth trends"
        },
        {
          icon: Users,
          title: "Company Profiles",
          description: "Information about recruiting companies and job roles"
        }
      ]}
      onStart={handleStart}
    />
  );
};

export default Placements;