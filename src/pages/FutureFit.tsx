import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { quizResponseSchema } from "@/lib/validationSchemas";
import { requireLogin } from "@/lib/requireLogin";
import { Brain } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { ensureSupabaseSession } from "@/lib/session";

const questions = [
  {
    question: "How do you prefer to spend your free time?",
    options: [
      { text: "Reading books or learning new things", value: "academic" },
      { text: "Playing sports or outdoor activities", value: "active" },
      { text: "Creating art or music", value: "creative" },
      { text: "Socializing with friends", value: "social" }
    ]
  },
  {
    question: "What motivates you the most?",
    options: [
      { text: "Solving complex problems", value: "problem-solver" },
      { text: "Helping others", value: "helper" },
      { text: "Building or creating things", value: "builder" },
      { text: "Leading and organizing", value: "leader" }
    ]
  },
  {
    question: "In a group project, you usually:",
    options: [
      { text: "Take charge and delegate tasks", value: "leader" },
      { text: "Work independently on technical aspects", value: "technical" },
      { text: "Support team members", value: "supportive" },
      { text: "Come up with creative ideas", value: "creative" }
    ]
  },
  {
    question: "Your ideal work environment is:",
    options: [
      { text: "A quiet lab or office", value: "structured" },
      { text: "A dynamic startup", value: "dynamic" },
      { text: "Outdoors or on-site", value: "field" },
      { text: "Collaborative open space", value: "collaborative" }
    ]
  },
  {
    question: "You're naturally good at:",
    options: [
      { text: "Mathematics and logic", value: "analytical" },
      { text: "Communication and writing", value: "communication" },
      { text: "Visual design and aesthetics", value: "design" },
      { text: "Understanding people's emotions", value: "empathy" }
    ]
  },
  {
    question: "When facing a challenge, you:",
    options: [
      { text: "Analyze data and research solutions", value: "researcher" },
      { text: "Ask for advice from experts", value: "collaborative" },
      { text: "Try different approaches creatively", value: "innovator" },
      { text: "Plan systematically step by step", value: "planner" }
    ]
  },
  {
    question: "Your dream career involves:",
    options: [
      { text: "Cutting-edge technology", value: "tech" },
      { text: "Making a social impact", value: "social" },
      { text: "Financial success", value: "business" },
      { text: "Personal expression", value: "creative" }
    ]
  },
  {
    question: "You prefer learning through:",
    options: [
      { text: "Hands-on experiments", value: "practical" },
      { text: "Reading and research", value: "theoretical" },
      { text: "Discussion and debate", value: "interactive" },
      { text: "Visual aids and videos", value: "visual" }
    ]
  },
  {
    question: "Your ideal college would have:",
    options: [
      { text: "Strong placement records", value: "career-focused" },
      { text: "Research opportunities", value: "research" },
      { text: "Vibrant campus life", value: "social" },
      { text: "Industry connections", value: "industry" }
    ]
  },
  {
    question: "In 10 years, you see yourself:",
    options: [
      { text: "Leading a company or team", value: "entrepreneur" },
      { text: "Excelling in a specialized field", value: "specialist" },
      { text: "Making groundbreaking discoveries", value: "researcher" },
      { text: "Inspiring and teaching others", value: "educator" }
    ]
  }
];

const FutureFit = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAnonymous, isLoading: authLoading } = useAuth();

  // Require login before showing test: redirect anonymous users as soon as they land on the page
  useEffect(() => {
    if (authLoading) return;
    if (isAnonymous && showIntro) {
      requireLogin(isAnonymous, navigate, toast, "/future-fit");
    }
  }, [authLoading, isAnonymous, showIntro, navigate, toast]);

  const handleStart = () => {
    if (!requireLogin(isAnonymous, navigate, toast, "/future-fit")) return;
    setShowIntro(false);
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      toast({ title: "Please select an answer", variant: "destructive" });
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    setLoading(true);
    const answerValues = Object.values(answers);
    const counts: Record<string, number> = {};
    answerValues.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    const topTraits = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([trait]) => trait);

    const recommendations = {
      traits: topTraits,
      courses: generateCourseRecommendations(topTraits),
      collegeVibe: generateCollegeVibe(topTraits)
    };

    try {
      const user = await ensureSupabaseSession();
      if (user) {
        // Validate quiz data before insertion
        const validation = quizResponseSchema.safeParse({
          user_id: user.id,
          quiz_type: "future_fit",
          responses: answers,
          result: recommendations
        });

        if (!validation.success) {
          toast({ 
            title: "Error", 
            description: "Invalid quiz data. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Insert validated data
        await supabase.from("quiz_results").insert({
          user_id: user.id,
          quiz_type: "future_fit" as const,
          responses: answers,
          result: recommendations
        });
      }
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save quiz results",
        variant: "destructive"
      });
    }

    setResult(recommendations);
    setLoading(false);
  };

  const generateCourseRecommendations = (traits: string[]) => {
    const courseMap: Record<string, string[]> = {
      analytical: ["Computer Science", "Data Science", "Mathematics"],
      creative: ["Design", "Architecture", "Media Studies"],
      social: ["Psychology", "Social Work", "Management"],
      technical: ["Engineering", "Information Technology", "Robotics"],
      business: ["MBA", "Commerce", "Economics"]
    };

    const courses = new Set<string>();
    traits.forEach(trait => {
      if (courseMap[trait]) {
        courseMap[trait].forEach(course => courses.add(course));
      }
    });

    return Array.from(courses).slice(0, 5);
  };

  const generateCollegeVibe = (traits: string[]) => {
    if (traits.includes("social") || traits.includes("collaborative")) {
      return "Campus with vibrant student life, clubs, and events";
    } else if (traits.includes("research") || traits.includes("theoretical")) {
      return "Research-focused institution with strong academic programs";
    } else if (traits.includes("tech") || traits.includes("innovator")) {
      return "Innovation hub with startup culture and industry ties";
    }
    return "Balanced campus with diverse opportunities";
  };

  if (showIntro) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
          <div className="container mx-auto max-w-3xl py-24 text-center space-y-6">
            <h1 className="text-4xl font-bold">Find Your College Vibe</h1>
            <p className="text-muted-foreground">
              Answer 10 quick questions to understand which environments and courses fit you best.
            </p>
            <Button size="lg" className="bg-gradient-primary" onClick={handleStart}>
              Start Quiz
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (result) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
        <div className="container mx-auto max-w-3xl py-8">
          <div className="mb-6">
            <BackButton />
          </div>

          <Card className="shadow-card animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl">Your Future Fit Results</CardTitle>
                  <CardDescription>Based on your personality traits</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Recommended Courses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.courses.map((course: string) => (
                    <div key={course} className="p-4 rounded-lg bg-gradient-card border">
                      <p className="font-medium">{course}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Your Ideal College Vibe</h3>
                <div className="p-4 rounded-lg bg-gradient-card border">
                  <p>{result.collegeVibe}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => {
                  setResult(null);
                  setCurrentQuestion(0);
                  setAnswers({});
                }} variant="outline" className="flex-1">
                  Retake Quiz
                </Button>
                <Button onClick={() => navigate("/dashboard")} className="flex-1 bg-gradient-primary">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle>Future Fit Test</CardTitle>
                <CardDescription>Question {currentQuestion + 1} of {questions.length}</CardDescription>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{questions[currentQuestion].question}</h3>
              <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer}>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted cursor-pointer">
                      <RadioGroupItem value={option.value} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              {currentQuestion > 0 && (
                <Button onClick={handlePrevious} variant="outline" className="flex-1">
                  Previous
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                className="flex-1 bg-gradient-primary"
                disabled={loading}
              >
                {loading ? "Calculating..." : currentQuestion === questions.length - 1 ? "See Results" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    </>
  );
};

export default FutureFit;
