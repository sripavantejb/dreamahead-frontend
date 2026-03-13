import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Brain, 
  Dna, 
  Swords, 
  Target, 
  BookOpen, 
  Building2,
  FileText,
  Sparkles
} from "lucide-react";

interface Tool {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  gradient: string;
}

interface ToolCategory {
  title: string;
  tools: Tool[];
}

export const ExploreMoreTools = () => {
  const navigate = useNavigate();

  const toolCategories: ToolCategory[] = [
    {
      title: "College Tools",
      tools: [
        {
          title: "Deadline Tracker",
          description: "Never miss a college deadline",
          icon: Calendar,
          path: "/deadlines",
          gradient: "from-primary to-secondary"
        },
        {
          title: "Cutoff Alerts",
          description: "Check if your marks make the cut",
          icon: TrendingUp,
          path: "/cutoffs",
          gradient: "from-secondary to-purple-500"
        },
        {
          title: "College Comparison",
          description: "Compare colleges side-by-side",
          icon: Swords,
          path: "/college-battle",
          gradient: "from-primary to-cyan-500"
        },
        {
          title: "Dream vs Reality",
          description: "Find backup plans that work",
          icon: Target,
          path: "/dream-reality",
          gradient: "from-cyan-500 to-blue-500"
        }
      ]
    },
    {
      title: "Scholarships & Career",
      tools: [
        {
          title: "Scholarship Finder",
          description: "Discover scholarships worth ₹50L+",
          icon: Trophy,
          path: "/scholarships",
          gradient: "from-accent to-orange-500"
        },
        {
          title: "Placement Reality Checker",
          description: "Get real placement stats",
          icon: Building2,
          path: "/placements",
          gradient: "from-amber-500 to-orange-500"
        }
      ]
    },
    {
      title: "Tests & Personality",
      tools: [
        {
          title: "Career DNA Test",
          description: "Choose based on your strengths",
          icon: Dna,
          path: "/career-dna",
          gradient: "from-pink-500 to-red-500"
        },
        {
          title: "Course Fit Test",
          description: "Find courses that match you",
          icon: BookOpen,
          path: "/course-fit",
          gradient: "from-green-500 to-emerald-500"
        },
        {
          title: "Mock Tests",
          description: "Practice for the big day",
          icon: FileText,
          path: "/mock-tests",
          gradient: "from-red-500 to-pink-500"
        }
      ]
    }
  ];

  return (
    <div className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-t">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Explore More Tools
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Continue your college journey with our other powerful tools
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {toolCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {category.title}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {category.tools.map((tool) => (
                  <Card
                    key={tool.title}
                    className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
                    onClick={() => navigate(tool.path)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-lg`} />
                    <CardHeader className="pb-3 relative">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient} w-fit mb-2`}>
                        <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <CardTitle className="text-sm sm:text-base group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative">
                      <CardDescription className="text-xs sm:text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
