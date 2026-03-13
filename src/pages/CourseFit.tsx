import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, ArrowLeft, Sparkles, Target, Award, Lightbulb, Brain, Code, TrendingUp, Hand, PartyPopper, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TileDescription } from "@/components/TileDescription";
import { BackToHomeButton } from "@/components/BackToHomeButton";

type QuestionPhase = "foundational" | "domain_awareness" | "depth";

interface Question {
  id: string;
  phase: QuestionPhase;
  question: string;
  profileField: string;
  options: { value: string; label: string }[];
  condition?: (profile: any) => boolean;
  isTextInput?: boolean;
}

// All possible questions - adaptive logic will select which to ask
const ALL_QUESTIONS: Question[] = [
  // Phase 1: Foundational (asked if missing)
  {
    id: "motivation",
    phase: "foundational",
    question: "What drives you to learn and grow?",
    profileField: "motivation_tag",
    options: [
      { value: "problem_solving", label: "Solving complex problems" },
      { value: "creativity", label: "Creating something new" },
      { value: "impact", label: "Making a difference" },
      { value: "earning", label: "Financial success" },
      { value: "innovation", label: "Being at the cutting edge" }
    ]
  },
  {
    id: "fav_subject",
    phase: "foundational",
    question: "Which subjects do you genuinely enjoy?",
    profileField: "fav_subject",
    options: [
      { value: "math_logic", label: "Mathematics and logic" },
      { value: "business_econ", label: "Business and economics" },
      { value: "creative_arts", label: "Arts and design" },
      { value: "science", label: "Physics, chemistry, biology" },
      { value: "languages_social", label: "Languages and social studies" }
    ]
  },
  {
    id: "work_preference",
    phase: "foundational",
    question: "How do you prefer to work?",
    profileField: "work_preference",
    options: [
      { value: "solo_focus", label: "Alone, deep focus" },
      { value: "team_collab", label: "Team collaboration" },
      { value: "mix", label: "Mix of both" },
      { value: "leading", label: "Leading and managing" }
    ]
  },
  {
    id: "core_strength",
    phase: "foundational",
    question: "What's your superpower?",
    profileField: "core_strength",
    options: [
      { value: "analytical", label: "Analytical thinking" },
      { value: "creative", label: "Creative expression" },
      { value: "communication", label: "Communication" },
      { value: "technical", label: "Technical skills" },
      { value: "empathy", label: "Understanding people" }
    ]
  },
  {
    id: "interaction_type",
    phase: "foundational",
    question: "In your ideal career, you'd mostly work with:",
    profileField: "interaction_type",
    options: [
      { value: "systems_code", label: "Systems, code, machines" },
      { value: "data_analysis", label: "Data and analysis" },
      { value: "people_clients", label: "People and clients" },
      { value: "creative_media", label: "Creative media" },
      { value: "research", label: "Research and experiments" }
    ]
  },
  {
    id: "impact_area",
    phase: "foundational",
    question: "Where do you want to create impact?",
    profileField: "impact_area",
    options: [
      { value: "tech_innovation", label: "Tech innovation" },
      { value: "business_growth", label: "Business growth" },
      { value: "social_change", label: "Social change" },
      { value: "artistic_expression", label: "Artistic expression" },
      { value: "scientific_discovery", label: "Scientific discovery" }
    ]
  },

  // Phase 2: Domain Awareness (CSE and tech-focused)
  {
    id: "tech_interest_detail",
    phase: "domain_awareness",
    question: "What excites you most about technology?",
    profileField: "tech_interest_detail",
    condition: (profile) => 
      profile.motivation_tag === "innovation" || 
      profile.fav_subject === "math_logic" ||
      profile.impact_area === "tech_innovation" ||
      profile.interaction_type === "systems_code",
    options: [
      { value: "building_apps", label: "Building apps and websites" },
      { value: "ai_ml", label: "AI and machine learning" },
      { value: "money_jobs", label: "High salaries and job security" },
      { value: "solving_problems", label: "Solving logical puzzles" },
      { value: "status", label: "Reputation and status" },
      { value: "not_sure", label: "Honestly, not sure yet" }
    ]
  },
  {
    id: "project_experience",
    phase: "domain_awareness",
    question: "Have you ever built something — a project, website, automation, or even a small coding experiment?",
    profileField: "project_experience",
    condition: (profile) => profile.tech_interest_detail && profile.tech_interest_detail !== "not_sure",
    isTextInput: true,
    options: [] // Text input
  },
  {
    id: "tech_dislike",
    phase: "domain_awareness",
    question: "What part of CSE sounds confusing or boring to you?",
    profileField: "tech_dislike",
    condition: (profile) => profile.tech_interest_detail,
    options: [
      { value: "coding_complex", label: "Coding feels too complex" },
      { value: "too_theoretical", label: "Too much theory, less practical" },
      { value: "not_creative", label: "Doesn't feel creative enough" },
      { value: "prefer_people", label: "I prefer working with people" },
      { value: "nothing", label: "Nothing — I'm all in!" }
    ]
  },
  {
    id: "tech_specialization",
    phase: "domain_awareness",
    question: "If you pursued tech, what sounds most interesting?",
    profileField: "tech_specialization_interest",
    condition: (profile) => profile.tech_interest_detail && profile.tech_dislike !== "coding_complex",
    options: [
      { value: "web_dev", label: "Web & app development" },
      { value: "ai_data", label: "AI and data science" },
      { value: "cybersecurity", label: "Cybersecurity" },
      { value: "game_dev", label: "Game development" },
      { value: "cloud_devops", label: "Cloud & DevOps" },
      { value: "ui_ux", label: "UI/UX design with tech" }
    ]
  },
  {
    id: "alt_interest",
    phase: "domain_awareness",
    question: "If not CSE, what else sounds interesting?",
    profileField: "alt_interest",
    condition: (profile) => 
      profile.tech_dislike === "coding_complex" || 
      profile.tech_dislike === "not_creative" ||
      profile.tech_dislike === "prefer_people",
    options: [
      { value: "business_analytics", label: "Business and analytics" },
      { value: "design_ux", label: "Design and UX" },
      { value: "psychology", label: "Psychology" },
      { value: "commerce", label: "Commerce and finance" },
      { value: "media", label: "Media and communication" }
    ]
  },

  // Phase 3: Depth (for returning users)
  {
    id: "depth_followup",
    phase: "depth",
    question: "You mentioned you like design last time. Did you ever try creating something?",
    profileField: "depth_followup",
    condition: (profile) => profile.reattempt_count > 0 && profile.core_strength === "creative",
    isTextInput: true,
    options: []
  }
];

const CourseFit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showLanding, setShowLanding] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [questionsToAsk, setQuestionsToAsk] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReturnGreeting, setShowReturnGreeting] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // If user is logged in, load their profile and skip landing
    if (user) {
      setShowLanding(false);
      await loadUserProfile(user);
    }
  };

  const loadUserProfile = async (currentUser: any) => {
    setIsLoading(true);
    
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();
    
    if (profile) {
      setUserProfile(profile);
      
      // Show returning user greeting if they've attempted before
      if (profile.reattempt_count && profile.reattempt_count > 0) {
        setShowReturnGreeting(true);
      }
      
      // Build adaptive question list
      const adaptiveQuestions = buildAdaptiveQuestions(profile);
      setQuestionsToAsk(adaptiveQuestions);
    } else {
      // First-time user: ask all foundational questions
      setQuestionsToAsk(ALL_QUESTIONS.filter(q => q.phase === "foundational"));
    }
    
    setIsLoading(false);
  };

  const buildAdaptiveQuestions = (profile: any): Question[] => {
    const questions: Question[] = [];
    
    // Phase 1: Only ask foundational questions if data is missing
    ALL_QUESTIONS.filter(q => q.phase === "foundational").forEach(q => {
      if (!profile[q.profileField]) {
        questions.push(q);
      }
    });
    
    // Phase 2: Domain awareness (conditional on previous answers + profile)
    ALL_QUESTIONS.filter(q => q.phase === "domain_awareness").forEach(q => {
      if (!profile[q.profileField] && (!q.condition || q.condition(profile))) {
        questions.push(q);
      }
    });
    
    // Phase 3: Depth questions for returning users
    if (profile.reattempt_count > 0) {
      ALL_QUESTIONS.filter(q => q.phase === "depth").forEach(q => {
        if (!profile[q.profileField] && (!q.condition || q.condition(profile))) {
          questions.push(q);
        }
      });
    }
    
    return questions;
  };

  const handleStart = async (startFresh: boolean = false) => {
    if (!user) {
      // No authentication required - start directly
      return;
    }
    
    // User is logged in, proceed with assessment
    setShowLanding(false);
    
    if (startFresh) {
      // Reset profile and start fresh
      setQuestionsToAsk(ALL_QUESTIONS.filter(q => q.phase === "foundational"));
      setAnswers({});
      setShowReturnGreeting(false);
    } else {
      setShowReturnGreeting(false);
    }
    
    // Load user profile if not already loaded
    if (!userProfile) {
      await loadUserProfile(user);
    }
  };

  const handleAuthSuccess = async () => {
    // No authentication required
  };

  const handleAnswer = (value: string) => {
    const currentQ = questionsToAsk[currentQuestionIndex];
    setAnswers({ ...answers, [currentQ.id]: value });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questionsToAsk.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = async () => {
    // Save all answers to profile
    const profileUpdates: any = {
      last_attempt_at: new Date().toISOString(),
      reattempt_count: (userProfile?.reattempt_count || 0) + 1
    };
    
    questionsToAsk.forEach(q => {
      if (answers[q.id]) {
        if (q.isTextInput) {
          profileUpdates[q.profileField] = { text: answers[q.id], timestamp: new Date().toISOString() };
        } else {
          profileUpdates[q.profileField] = answers[q.id];
        }
      }
    });

    if (user) {
      await supabase
        .from("user_profiles")
        .update(profileUpdates)
        .eq("id", user.id);
    }

    // Intelligent recommendation logic
    const combinedProfile = { ...userProfile, ...profileUpdates };
    const recommendation = generateRecommendation(combinedProfile);
    
    setResult(recommendation);

    // Save to quiz_results for analytics
    if (user) {
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        quiz_type: "course_fit",
        responses: answers,
        result: recommendation
      });
    }

    toast({ 
      title: (
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Analysis Complete!
        </span>
      ), 
      description: "We've discovered your course fit!" 
    });
  };

  const generateRecommendation = (profile: any) => {
    const isTechInclined = 
      profile.tech_interest_detail ||
      profile.fav_subject === "math_logic" ||
      profile.interaction_type === "systems_code" ||
      profile.impact_area === "tech_innovation";

    const hasProjectExperience = profile.project_experience?.text;
    const techDislike = profile.tech_dislike;
    
    // CSE-focused recommendations
    if (isTechInclined && (!techDislike || techDislike === "nothing")) {
      const specialization = profile.tech_specialization_interest;
      
      if (specialization === "ai_data") {
        return {
          field: "Data Science & AI",
          confidence: 90,
          courses: ["B.Sc Data Science", "B.Tech AI & ML", "B.Tech CSE (AI specialization)"],
          description: "You enjoy problem-solving and logic — Data Science and AI are perfect fits.",
          reasoning: hasProjectExperience 
            ? "Your hands-on project experience shows real interest beyond hype. AI/ML will match your analytical mindset." 
            : "You have the logical foundation. Start with online projects to build confidence, then dive into AI coursework.",
          nextSteps: [
            { label: "Start Mock Test", action: "mock-test" },
            { label: "Find AI/ML Colleges", action: "college-finder" }
          ]
        };
      }
      
      if (specialization === "web_dev") {
        return {
          field: "Software Development",
          confidence: 85,
          courses: ["B.Tech CSE", "BCA", "B.Sc Computer Science"],
          description: "Building apps and websites aligns with your tech interest perfectly.",
          reasoning: "Web dev is creative + technical — you'll love seeing your code come to life.",
          nextSteps: [
            { label: "Start Mock Test", action: "mock-test" },
            { label: "Find Dev-focused Colleges", action: "college-finder" }
          ]
        };
      }

      if (specialization === "cybersecurity") {
        return {
          field: "Cybersecurity",
          confidence: 85,
          courses: ["B.Tech Cyber Security", "B.Sc Cyber Forensics", "B.Tech CSE (Security)"],
          description: "Protecting systems and solving security puzzles — a perfect match.",
          reasoning: "Cybersecurity combines logic, ethics, and real-world impact. High demand field.",
          nextSteps: [
            { label: "Explore Scholarships", action: "scholarships" },
            { label: "Find Security Programs", action: "college-finder" }
          ]
        };
      }
      
      // Default CSE recommendation
      return {
        field: "Computer Science (Core)",
        confidence: 80,
        courses: ["B.Tech CSE", "B.Sc Computer Science", "BCA + MCA Integrated"],
        description: "Solid tech foundation — CSE opens doors to all specializations.",
        reasoning: hasProjectExperience 
          ? "Your project work shows commitment. CSE core gives you flexibility to specialize later." 
          : "CSE is broad enough to explore. Try small coding projects to find your niche.",
        nextSteps: [
          { label: "Start Mock Test", action: "mock-test" },
          { label: "Find CSE Colleges", action: "college-finder" }
        ]
      };
    }

    // Tech-adjacent (burnout or mismatch detected)
    if (isTechInclined && (techDislike === "coding_complex" || techDislike === "not_creative")) {
      const altInterest = profile.alt_interest;
      
      if (altInterest === "design_ux" || techDislike === "not_creative") {
        return {
          field: "Design + Tech",
          confidence: 75,
          courses: ["B.Des UX/UI", "B.Tech CSE + Design Minor", "B.Sc Multimedia"],
          description: "You like tech but crave creativity. Design blends both beautifully.",
          reasoning: "UX/UI lets you shape user experiences without heavy coding. Best of both worlds.",
          nextSteps: [
            { label: "Explore Design Programs", action: "college-finder" },
            { label: "Talk to Advisor", action: "advisor" }
          ]
        };
      }
      
      if (altInterest === "business_analytics") {
        return {
          field: "Business Analytics",
          confidence: 80,
          courses: ["BBA Business Analytics", "B.Com + Data Analytics", "BBA (Tech Management)"],
          description: "You enjoy logic but not pure coding. Analytics fits your analytical side perfectly.",
          reasoning: "Business analytics uses data without deep programming. High-impact, less technical stress.",
          nextSteps: [
            { label: "Find Analytics Programs", action: "college-finder" },
            { label: "See Scholarships", action: "scholarships" }
          ]
        };
      }
    }

    // Non-tech paths
    if (profile.core_strength === "creative" || profile.fav_subject === "creative_arts") {
      return {
        field: "Creative Arts & Design",
        confidence: 85,
        courses: ["B.Des", "BFA", "B.Sc Animation", "Media Studies"],
        description: "Your creative flair will shine in design and arts programs.",
        reasoning: "You think visually and value expression. Design fields reward originality.",
        nextSteps: [
          { label: "Find Design Colleges", action: "college-finder" },
          { label: "Explore Scholarships", action: "scholarships" }
        ]
      };
    }

    if (profile.core_strength === "empathy" || profile.interaction_type === "people_clients") {
      return {
        field: "Psychology & Social Sciences",
        confidence: 80,
        courses: ["BA Psychology", "BA Sociology", "B.Sc Cognitive Science"],
        description: "Your people-oriented nature fits perfectly with social sciences.",
        reasoning: "Understanding behavior and helping others is your strength. Psychology aligns beautifully.",
        nextSteps: [
          { label: "Find Programs", action: "college-finder" },
          { label: "Talk to Advisor", action: "advisor" }
        ]
      };
    }

    if (profile.fav_subject === "business_econ" || profile.impact_area === "business_growth") {
      return {
        field: "Business & Commerce",
        confidence: 85,
        courses: ["BBA", "B.Com", "BMS", "Economics"],
        description: "Your strategic thinking suits business and management courses.",
        reasoning: "Business rewards logical thinking + people skills. Great career versatility.",
        nextSteps: [
          { label: "Find Business Schools", action: "college-finder" },
          { label: "See Scholarships", action: "scholarships" }
        ]
      };
    }

    // Fallback: balanced recommendation
    return {
      field: "Explore Multiple Paths",
      confidence: 60,
      courses: ["BBA", "B.Tech CSE", "B.Des", "B.Sc"],
      description: "Your interests span multiple areas. Let's narrow it down together.",
      reasoning: "You're multi-talented. Consider trying mock tests or talking to an advisor to find clarity.",
      nextSteps: [
        { label: "Start Mock Test", action: "mock-test" },
        { label: "Talk to Advisor", action: "advisor" }
      ]
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <>
        <TileDescription
          icon={Target}
          title="Course Fit Test"
          subtitle="Find the College & Course That Fits Your Personality"
          description="Not sure which stream is right for you? This test maps your natural strengths, interests, and career goals to the most suitable courses — CSE, MBA, Design, Medicine, and more."
          gradient="from-green-500 to-teal-500"
          benefits={[
            {
              icon: Brain,
              title: "Scientifically Designed",
              description: "Based on psychometric research and career counseling frameworks"
            },
            {
              icon: Sparkles,
              title: "Personalized Results",
              description: "Get specific course recommendations tailored to your profile"
            },
            {
              icon: TrendingUp,
              title: "Smart Adaptation",
              description: "Questions adapt based on your previous answers for precision"
            },
            {
              icon: Target,
              title: "Career Clarity",
              description: "Understand which courses align with your long-term goals"
            }
          ]}
          fomoStats={{
            users: "10K+",
            successRate: "87%",
            avgTime: "5 min"
          }}
          fomoText="87% of students who took this test found a better-fit college within 3 days!"
          onStart={() => handleStart(false)}
          ctaText="Start Free Test"
        />
      </>
    );
  }

  // Returning user greeting
  if (showReturnGreeting) {
    return (
      <>
        <BackToHomeButton />
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
          <div className="container mx-auto max-w-2xl py-8">
            <Card className="shadow-card">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl flex items-center justify-center gap-2">
                  <Hand className="h-8 w-8" />
                  Welcome back
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Want to refine your course fit or try something new?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile?.reattempt_count > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      You've taken this test {userProfile.reattempt_count} {userProfile.reattempt_count === 1 ? 'time' : 'times'}. 
                      This time, we'll ask deeper questions based on what you've shared.
                    </p>
                  </div>
                )}
                <div className="grid gap-3">
                  <Button 
                    onClick={() => handleStart(false)} 
                    className="w-full bg-gradient-primary"
                    size="lg"
                  >
                    Continue from last answers →
                  </Button>
                  <Button 
                    onClick={() => handleStart(true)} 
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Start Fresh Again →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (result) {
    const isLoggedIn = !!user;

    return (
      <>
        <BackToHomeButton />
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
          <div className="container mx-auto max-w-3xl py-8">
            <Card className="shadow-card animate-scale-in">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                  {result.confidence}% match confidence
                </div>
                <CardTitle className="text-3xl mb-2">{result.field}</CardTitle>
                <CardDescription className="text-lg">{result.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Always show preview content */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Why this fits you:
                  </h3>
                  <p className="text-muted-foreground">{result.reasoning}</p>
                </div>

                {/* Gated Content */}
                {!isLoggedIn ? (
                  <div className="relative">
                    {/* Blurred Preview */}
                    <div className="blur-sm pointer-events-none">
                      <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-3">Top course options:</h3>
                        <div className="grid gap-2">
                          <div className="p-3 rounded-lg bg-card border">
                            <p>Course recommendations...</p>
                          </div>
                          <div className="p-3 rounded-lg bg-card border">
                            <p>Detailed analysis...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Login CTA Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                      <Card className="max-w-md mx-4 shadow-xl border-primary/20">
                        <CardContent className="p-6 text-center">
                          <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h3 className="text-xl font-bold mb-2">Sign Up to View Full Report</h3>
                          <p className="text-muted-foreground mb-6 text-sm">
                            Create a free account to access your complete course analysis, personalized recommendations, and career roadmap
                          </p>
                          <Button 
                            onClick={() => handleStart(false)}
                            className="w-full bg-gradient-primary"
                            size="lg"
                          >
                            Start Free Test
                          </Button>
                          <p className="text-xs text-muted-foreground mt-3">
                            Get instant results and personalized recommendations
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Full Content for Logged In Users */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Top course options:</h3>
                      <div className="grid gap-2">
                        {result.courses.map((course: string) => (
                          <div key={course} className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                            <p className="font-medium">{course}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Steps */}
                    {result.nextSteps && result.nextSteps.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">What's next?</h3>
                        <div className="grid gap-2">
                          {result.nextSteps.map((step: any, idx: number) => (
                            <Button
                              key={idx}
                              variant="outline"
                              className="w-full justify-between"
                              onClick={() => {
                                const action = step.action;
                                if (action === "mock-test") navigate("/mock-tests");
                                else if (action === "college-finder") navigate("/college-predictor");
                                else if (action === "scholarships") navigate("/scholarships");
                                else navigate("/");
                              }}
                            >
                              <span>{step.label}</span>
                              <span>→</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comparison Insight */}
                    {userProfile?.reattempt_count > 1 && (
                      <div className="p-4 rounded-lg bg-accent/50 border border-accent">
                        <p className="text-sm">
                          <strong>Insight:</strong> Your answers are {result.confidence >= 80 ? 'more consistent' : 'evolving'} compared to last time. 
                          {result.confidence >= 80 
                            ? ' This confidence is great - you are on the right track!' 
                            : ' Keep exploring to find what truly excites you.'}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border flex gap-3">
                      <Button 
                        onClick={() => { 
                          setCurrentQuestionIndex(0); 
                          setAnswers({}); 
                          setResult(null); 
                          if (user) loadUserProfile(user);
                        }} 
                        variant="outline"
                        className="flex-1"
                      >
                        Retake Test
                      </Button>
                      <Button 
                        onClick={() => navigate("/")} 
                        className="flex-1 bg-gradient-primary"
                      >
                        Back to Home
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (questionsToAsk.length === 0) {
    return (
      <>
        <BackToHomeButton />
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <PartyPopper className="h-5 w-5" />
                You're all caught up!
              </CardTitle>
              <CardDescription>
                You've answered all available questions. Check your results or retake to refine further.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const currentQuestion = questionsToAsk[currentQuestionIndex];

  return (
    <>
      <BackToHomeButton />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Course Fit Test
            </h1>
            <p className="text-muted-foreground mt-2">
              {userProfile?.reattempt_count > 0 ? (
              <span className="flex items-center justify-center gap-2">
                <Rocket className="h-5 w-5" />
                Let's go deeper this time
              </span>
            ) : (
              "Discover your perfect course match"
            )}
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {questionsToAsk.length}
                </CardTitle>
                <span className="text-sm font-medium text-primary">
                  {Math.round(((currentQuestionIndex + 1) / questionsToAsk.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questionsToAsk.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xl font-semibold mb-1">{currentQuestion.question}</p>
                {currentQuestion.phase === "depth" && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0" />
                    This helps us understand you better
                  </p>
                )}
              </div>

              {currentQuestion.isTextInput ? (
                <Textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  placeholder="Share your thoughts..."
                  className="min-h-[100px]"
                />
              ) : (
                <RadioGroup 
                  value={answers[currentQuestion.id]} 
                  onValueChange={handleAnswer}
                >
                  {currentQuestion.options.map((option) => (
                    <div 
                      key={option.value} 
                      className="flex items-center space-x-3 p-4 rounded-xl hover:bg-accent/50 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="cursor-pointer flex-1 font-medium"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              <div className="flex gap-3 pt-4">
                {currentQuestionIndex > 0 && (
                  <Button 
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} 
                    variant="outline"
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                )}
                <Button 
                  onClick={nextQuestion} 
                  disabled={!answers[currentQuestion.id]}
                  className="flex-1 bg-gradient-primary"
                >
                  {currentQuestionIndex < questionsToAsk.length - 1 ? (
                    "Next →"
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      See Results
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CourseFit;
