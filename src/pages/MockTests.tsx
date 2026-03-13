import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, CheckCircle, Play, Award, Target, Clock } from "lucide-react";
import { ToolLanding } from "@/components/ToolLanding";

const MockTests = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStart = () => {
    // No authentication required - start directly
  };

  return (
    <ToolLanding
      icon={FileText}
      title="Mock Tests"
      subtitle="Practice with expert-designed tests"
      description="Take mock tests designed by top faculty across India. Get detailed analysis, performance insights, and improve your exam strategy."
      gradient="from-orange-500 to-red-500"
      benefits={[
        {
          icon: Target,
          title: "Expert Designed",
          description: "Tests created by top faculty from across India"
        },
        {
          icon: Award,
          title: "Detailed Analysis",
          description: "Get comprehensive performance insights and improvement tips"
        },
        {
          icon: Clock,
          title: "Real Exam Experience",
          description: "Practice with time limits and exam-like conditions"
        }
      ]}
      onStart={handleStart}
    />
  );
};

export default MockTests;