import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna, Brain, Compass, Award, Users, Sparkles, Hand, Target, Lightbulb, CheckCircle2, Download, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "@/components/BackButton";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { requireLogin } from "@/lib/requireLogin";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const questions = [
  {
    id: 1,
    question: "When solving a complex problem, I prefer to:",
    options: [
      { value: "A", label: "Break it down logically step-by-step" },
      { value: "B", label: "Think creatively about innovative solutions" },
      { value: "C", label: "Collaborate with others to find answers" },
      { value: "D", label: "Research existing solutions thoroughly" },
    ],
  },
  {
    id: 2,
    question: "In group projects, I naturally tend to:",
    options: [
      { value: "A", label: "Take charge and organize the team" },
      { value: "B", label: "Generate creative ideas" },
      { value: "C", label: "Support and help team members" },
      { value: "D", label: "Focus on research and analysis" },
    ],
  },
  {
    id: 3,
    question: "I feel most energized when:",
    options: [
      { value: "A", label: "Achieving measurable goals" },
      { value: "B", label: "Creating something new" },
      { value: "C", label: "Helping others succeed" },
      { value: "D", label: "Learning new concepts" },
    ],
  },
  {
    id: 4,
    question: "My ideal work environment involves:",
    options: [
      { value: "A", label: "Clear structure and goals" },
      { value: "B", label: "Freedom to innovate" },
      { value: "C", label: "Collaborative teamwork" },
      { value: "D", label: "Independent research" },
    ],
  },
  {
    id: 5,
    question: "When learning something new, I prefer:",
    options: [
      { value: "A", label: "Practical, hands-on experience" },
      { value: "B", label: "Experimenting with different approaches" },
      { value: "C", label: "Learning from others' experiences" },
      { value: "D", label: "Deep theoretical understanding" },
    ],
  },
  {
    id: 6,
    question: "I'm most interested in:",
    options: [
      { value: "A", label: "Building and managing systems" },
      { value: "B", label: "Designing and creating" },
      { value: "C", label: "Understanding people and society" },
      { value: "D", label: "Discovering how things work" },
    ],
  },
  {
    id: 7,
    question: "My decision-making style is:",
    options: [
      { value: "A", label: "Data-driven and objective" },
      { value: "B", label: "Intuitive and innovative" },
      { value: "C", label: "Collaborative and consensus-based" },
      { value: "D", label: "Research-based and thorough" },
    ],
  },
  {
    id: 8,
    question: "I'm drawn to careers that involve:",
    options: [
      { value: "A", label: "Management and leadership" },
      { value: "B", label: "Innovation and creativity" },
      { value: "C", label: "Social impact and helping others" },
      { value: "D", label: "Analysis and problem-solving" },
    ],
  },
  {
    id: 9,
    question: "My strongest skill is:",
    options: [
      { value: "A", label: "Organization and planning" },
      { value: "B", label: "Creative thinking" },
      { value: "C", label: "Communication and empathy" },
      { value: "D", label: "Critical analysis" },
    ],
  },
  {
    id: 10,
    question: "I find fulfillment in:",
    options: [
      { value: "A", label: "Achieving tangible results" },
      { value: "B", label: "Creating original work" },
      { value: "C", label: "Making a positive impact on others" },
      { value: "D", label: "Expanding knowledge and understanding" },
    ],
  },
];

type OptionRow = { value: string; label: string };

// Report types (aligned with Course Fit report style)
const TRAIT_LABELS: Record<string, string> = {
  analytical: "Analytical",
  logical: "Logical",
  creative: "Creative",
  communication: "Communication",
  math: "Math",
  biology: "Biology",
  data: "Data",
  coding: "Coding",
  design: "Design",
  cyber: "Cyber",
  ai_ml: "AI/ML",
};
const TRAIT_KEYS = Object.keys(TRAIT_LABELS) as (keyof typeof TRAIT_LABELS)[];

type CourseRecommendation = {
  name: string;
  score: number;
  keyTraits: string[];
  entranceExams: string;
  description: string;
};

type CareerDNAReport = {
  type: string;
  typeDescription: string;
  traits: Record<string, number>;
  topCourses: CourseRecommendation[];
  confidence: number;
  alsoLike: string[];
  notes: string[];
};

const OptionCard = ({
  option,
  isSelected,
  onSelect,
}: {
  option: OptionRow;
  isSelected: boolean;
  onSelect: (value: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(option.value)}
    className={`w-full text-left rounded-2xl border p-4 transition-all ${
      isSelected
        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
        : "border-border hover:border-primary/60 hover:bg-muted"
    }`}
  >
    <p className="font-semibold text-lg text-foreground">{option.label}</p>
  </button>
);

const CareerDNA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAnonymous, user, isLoading: authLoading } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<CareerDNAReport | null>(null);

  const handleStart = () => {
    if (authLoading) return;
    if (!requireLogin(isAnonymous, navigate, toast, "/career-dna")) return;
    setShowIntro(false);
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setShowIntro(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach((answer) => {
      counts[answer as keyof typeof counts]++;
    });
    const total = 10;
    const [a, b, c, d] = [counts.A / total, counts.B / total, counts.C / total, counts.D / total];

    // Derive trait scores (0–100) from A/B/C/D distribution
    // A=Leader, B=Innovator, C=Helper, D=Analyst
    const rawTraits: Record<string, number> = {
      analytical: (d * 35 + a * 15) * 100,
      logical: (d * 30 + a * 25) * 100,
      creative: b * 40 * 100,
      communication: (a * 25 + c * 35) * 100,
      math: d * 35 * 100,
      biology: c * 25 * 100,
      data: d * 30 * 100,
      coding: (d * 20 + b * 15) * 100,
      design: b * 35 * 100,
      cyber: d * 20 * 100,
      ai_ml: d * 25 * 100,
    };
    const maxTrait = Math.max(...Object.values(rawTraits), 1);
    const traits: Record<string, number> = {};
    TRAIT_KEYS.forEach((key) => {
      traits[key] = Math.round((rawTraits[key] / maxTrait) * 100);
    });

    const typeConfig = {
      A: {
        type: "The Leader",
        description: "You excel at organizing, planning, and achieving goals.",
        courses: [
          { name: "Business Administration", entrance: "CAT / MAT / IPMAT" },
          { name: "Management", entrance: "CAT / MAT / XAT" },
          { name: "Engineering", entrance: "JEE Main / State CET" },
        ],
        keyTraits: ["Logical", "Communication", "Analytical"],
        alsoLike: ["Management", "Leadership", "Entrepreneurship"],
      },
      B: {
        type: "The Innovator",
        description: "Your creative mindset thrives on innovation.",
        courses: [
          { name: "Design", entrance: "NID / UCEED / NIFT" },
          { name: "Architecture", entrance: "JEE Main (B.Arch) / NATA" },
          { name: "Media & Communication", entrance: "CUET / College-specific" },
        ],
        keyTraits: ["Creative", "Design", "Logical"],
        alsoLike: ["Design-oriented", "Media", "Creative tech"],
      },
      C: {
        type: "The Helper",
        description: "You're driven by making a positive impact.",
        courses: [
          { name: "Psychology", entrance: "CUET / State boards" },
          { name: "Social Work", entrance: "CUET / TISS" },
          { name: "Education", entrance: "CUET / B.Ed entrance" },
        ],
        keyTraits: ["Communication", "Creative", "Analytical"],
        alsoLike: ["Healthcare", "Education", "Social impact"],
      },
      D: {
        type: "The Analyst",
        description: "Your analytical mind loves solving complex problems.",
        courses: [
          { name: "Data Science", entrance: "JEE Main / CUET" },
          { name: "Mathematics", entrance: "JEE Main / CUET / NEST" },
          { name: "Research (Sciences)", entrance: "JEE / NEET / CUET" },
        ],
        keyTraits: ["Analytical", "Logical", "Math"],
        alsoLike: ["Data-oriented", "Research", "AI/ML"],
      },
    };

    const ordered = (["D", "A", "B", "C"] as const).sort(
      (x, y) => counts[y] - counts[x]
    );
    const topCourses: CourseRecommendation[] = [];
    const baseScores = [24.4, 23.62, 23.12]; // report-style percentages
    let rank = 0;
    for (const key of ordered) {
      if (rank >= 3) break;
      const config = typeConfig[key];
      const course = config.courses[0];
      const keyTraits = config.keyTraits;
      topCourses.push({
        name: course.name,
        score: baseScores[rank],
        keyTraits,
        entranceExams: course.entrance,
        description: `You showed strong alignment with ${keyTraits.join(", ")} — ${course.name} lets you build on those strengths through projects, teamwork, and future-ready skills.`,
      });
      rank++;
    }
    // If we have fewer than 3 types with answers, fill from dominant type's other courses
    const dominant = ordered[0];
    const domConfig = typeConfig[dominant];
    while (topCourses.length < 3 && topCourses.length < domConfig.courses.length) {
      const course = domConfig.courses[topCourses.length];
      topCourses.push({
        name: course.name,
        score: Math.round((22 - topCourses.length * 0.5) * 100) / 100,
        keyTraits: domConfig.keyTraits,
        entranceExams: course.entrance,
        description: `You showed strong alignment with ${domConfig.keyTraits.join(", ")} — ${course.name} lets you build on those strengths through projects, teamwork, and future-ready skills.`,
      });
    }

    const conf = counts[dominant as keyof typeof counts];
    const confidence = Math.round((conf / total) * 100);
    const alsoLike = typeConfig[dominant].alsoLike.map(
      (x) => `${x}-oriented roles and electives`
    );
    const notes = [
      `Strong alignment with ${typeConfig[dominant].type}`,
      "Review adjacent tracks for optional variety",
    ];

    const report: CareerDNAReport = {
      type: typeConfig[dominant].type,
      typeDescription: typeConfig[dominant].description,
      traits,
      topCourses: topCourses.slice(0, 3),
      confidence,
      alsoLike,
      notes,
    };
    setResult(report);
    toast({
      title: "Quiz Complete!",
      description: "Your Career DNA report is ready.",
    });
  };

  const questionCount = questions.length;
  const progressPercent = (currentQuestion / questionCount) * 100;

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowIntro(true);
  };

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("career-dna-report.pdf");
    } catch (error) {
      console.error("Failed to download report", error);
      toast({
        title: "Download failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  // Result screen – full report (Course Fit style)
  if (result) {
    const displayName = (user?.full_name?.trim() || "").split(/\s+/)[0] || "there";
    const traitChartData = TRAIT_KEYS.map((key) => ({
      trait: TRAIT_LABELS[key],
      score: Number(result.traits?.[key] ?? 0),
    }));

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-12 space-y-8" ref={reportRef}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Dna className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dream Ahead</p>
                  <p className="font-semibold text-lg">Career DNA Report</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
                <h1 className="text-3xl font-bold">Your Career DNA Report</h1>
                <p className="text-muted-foreground text-sm">
                  {user?.full_name || "Student"}
                  {user?.phone ? ` · ${user.phone}` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button variant="outline" onClick={handleRetake}>Retake test</Button>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardContent className="space-y-8 pt-8">
              <section className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hand className="h-4 w-4 shrink-0" />
                  Hey {displayName}!
                </p>
                <p>
                  Based on how you think, solve problems, and express yourself, here&apos;s a personalized map of courses
                  that align with your style. Each suggestion balances your strongest traits with what the course demands.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Target className="h-6 w-6 shrink-0" />
                  Top 3 Recommendations
                </h2>
                <div className="grid gap-4">
                  {result.topCourses.map((course, idx) => (
                    <div key={course.name} className="rounded-2xl border p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Rank {idx + 1}</p>
                          <h3 className="text-xl font-semibold">{course.name}</h3>
                        </div>
                        <Badge variant="secondary">Score {course.score}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <p className="text-sm font-medium">Key traits: {course.keyTraits.join(", ")}</p>
                      <p className="text-xs text-muted-foreground">Entrance exams: {course.entranceExams}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Brain className="h-6 w-6 shrink-0" />
                    Trait Snapshot
                  </h2>
                  <Badge variant="outline">Confidence {result.confidence}%</Badge>
                </div>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={traitChartData} outerRadius="80%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                      <Radar name="You" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {result.alsoLike.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 shrink-0" />
                    You May Also Like…
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {result.alsoLike.map((hint) => (
                      <div key={hint} className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm">
                        {hint}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-2">
                <h2 className="text-2xl font-semibold">Next Steps</h2>
                <ul className="space-y-2">
                  {result.notes.map((note) => (
                    <li key={note} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="text-sm text-muted-foreground flex items-start gap-2">
                <Sprout className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Remember: this report is a guide. Talk to counselors, explore projects, and keep choosing what feels
                  meaningful to you.
                </span>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Intro – match Course Fit intro (gradient hero + benefits + CTA)
  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#f3f4ff]">
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#ec4899] via-[#d946ef] to-[#7c3aed] text-white py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mx-auto">
              <Dna className="h-10 w-10" />
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="tracking-[0.3em] uppercase text-sm text-white/70">
                  Psychometric assessment
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold">
                  Career DNA Test
                </h1>
                <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
                  Discover your ideal career path through psychometric analysis.
                  Get personalized recommendations in minutes.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/15 px-10 rounded-full text-lg font-semibold"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Assessment Now
                </Button>
                <p className="text-sm text-white/70 flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  10 questions · About 5 minutes
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-white/80">
              {["Only 5 minutes", "Instant results", "100% Free"].map(
                (pill) => (
                  <span
                    key={pill}
                    className="px-4 py-1 rounded-full border border-white/40 bg-white/10 backdrop-blur"
                  >
                    {pill}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" />
        </div>

        <div className="container mx-auto px-4 py-16 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Why take this assessment?
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              Clarity before you commit
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understand your strengths and get course recommendations aligned
              with your personality.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Personality-Based",
                copy: "Backed by psychometric principles",
                icon: Brain,
              },
              {
                title: "Personalized",
                copy: "Matches your unique strengths",
                icon: Compass,
              },
              {
                title: "Career-Focused",
                copy: "Aligned with real career paths",
                icon: Award,
              },
              {
                title: "Instant Results",
                copy: "Get recommendations in 5 minutes",
                icon: Users,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border bg-white shadow-sm p-6 space-y-2"
              >
                <item.icon className="h-8 w-8 text-primary mb-2" />
                <p className="font-semibold text-lg">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>

          <Card className="border-none shadow-2xl rounded-[32px] bg-gradient-to-r from-[#ec4899] to-[#7c3aed] text-white">
            <CardContent className="py-10 px-6 text-center space-y-4">
              <p className="text-sm font-semibold tracking-wide text-white/70">
                Ready to discover your type?
              </p>
              <h3 className="text-3xl font-bold">
                Leader, Innovator, Helper, or Analyst — find out in 10 questions.
              </h3>
              <p className="text-white/70">
                Takes only 5 minutes. Get instant, personalized results.
              </p>
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10 px-10"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Assessment Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz view – match Course Fit (BackButton, Progress, Card, option cards, Back/Next footer)
  const q = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <BackButton onClick={handleBack} label="Back" />
        </div>

        <div className="grid gap-6 md:grid-cols-[3fr,1fr]">
          <Card className="p-6 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Question {currentQuestion + 1} of {questionCount}
              </p>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="space-y-4">
              <p className="text-2xl font-semibold text-foreground">
                {q.question}
              </p>
              <div className="space-y-3">
                {q.options.map((option) => (
                  <OptionCard
                    key={option.value}
                    option={option}
                    isSelected={answers[currentQuestion] === option.value}
                    onSelect={handleAnswer}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                Back
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion]}
              >
                {currentQuestion < questionCount - 1
                  ? "Next Question"
                  : "See Results"}
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
              Pick the option that feels most like you. You can go back and
              change answers anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDNA;
