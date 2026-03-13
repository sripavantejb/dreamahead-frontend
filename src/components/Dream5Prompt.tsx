import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles } from "lucide-react";

interface Dream5PromptProps {
  onSetDream5: () => void;
}

export const Dream5Prompt = ({ onSetDream5 }: Dream5PromptProps) => {
  return (
    <Card className="shadow-elegant border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Add Your Dream 5 Colleges
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </CardTitle>
            <CardDescription>
              Get personalized results across all tools
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Select your Dream 5 colleges once, and we'll show you relevant deadlines, scholarships, 
          cutoffs, and placements automatically across every tool.
        </p>
        <Button onClick={onSetDream5} className="w-full bg-gradient-primary" size="lg">
          Set My Dream 5 Now
        </Button>
      </CardContent>
    </Card>
  );
};
