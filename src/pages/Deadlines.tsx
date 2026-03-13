import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Bell, Clock, CheckCircle2 } from "lucide-react";
import { ToolLanding } from "@/components/ToolLanding";

const Deadlines = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStart = () => {
    // No authentication required - start directly
  };

  return (
    <ToolLanding
      icon={Calendar}
      title="Deadline Tracker"
      subtitle="Never miss an important date"
      description="Track all admission deadlines, counselling dates, and application forms in one place. Get reminders and stay organized throughout your college journey."
      gradient="from-blue-500 to-purple-500"
      benefits={[
        {
          icon: Bell,
          title: "Smart Reminders",
          description: "Get notified before important deadlines approach"
        },
        {
          icon: Clock,
          title: "All Exams Covered",
          description: "Track deadlines for JEE, NEET, CUET, and state exams"
        },
        {
          icon: CheckCircle2,
          title: "Progress Tracking",
          description: "Mark completed applications and track your progress"
        }
      ]}
      onStart={handleStart}
    />
  );
};

export default Deadlines;