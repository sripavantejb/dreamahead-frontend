import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, Search, DollarSign, CheckCircle } from "lucide-react";
import { ToolLanding } from "@/components/ToolLanding";

const Scholarships = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStart = () => {
    // No authentication required - start directly
  };

  return (
    <ToolLanding
      icon={Award}
      title="Scholarship Finder"
      subtitle="Discover scholarships you didn't know existed"
      description="Find scholarships that match your profile, academic performance, and financial needs. Get detailed information about eligibility and application processes."
      gradient="from-green-500 to-yellow-500"
      benefits={[
        {
          icon: Search,
          title: "Smart Matching",
          description: "Find scholarships that match your profile and needs"
        },
        {
          icon: DollarSign,
          title: "Financial Aid",
          description: "Discover various types of financial assistance available"
        },
        {
          icon: CheckCircle,
          title: "Easy Applications",
          description: "Get step-by-step guidance for scholarship applications"
        }
      ]}
      onStart={handleStart}
    />
  );
};

export default Scholarships;