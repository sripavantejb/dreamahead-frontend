import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { requireLogin } from "@/lib/requireLogin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Brain, CheckCircle2, Download, Hand, Target, Lightbulb, Sprout, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { CourseFitSkeleton } from "@/components/CourseFitSkeleton";
import { trackEvent, trackError } from "@/lib/analytics";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { Database } from "@/integrations/supabase/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  ai_ml: "AI / ML",
};

const TRAIT_KEYS = Object.keys(TRAIT_LABELS) as (keyof typeof TRAIT_LABELS)[];

type QuestionSet = any;
type Question = any;
type OptionRow = any;
type UICopyRow = any;

type CourseResult = {
  course_key: string,
  name: string,
  score: number,
  boost?: number,
  final: number,
  neighbors?: { course_key: string; label?: string }[],
};

type ReportPayload = {
  user_id: string;
  set_no: number;
  question_count: number;
  traits: Record<string, number>;
  specialization_hints: Record<string, number>;
  courses: CourseResult[];
  confidence: number;
  flags: string[];
  notes: string[];
  generated_at: string;
};

const OptionCard = ({
  option,
  isSelected,
  onSelect,
  disabled,
}: {
  option: OptionRow;
  isSelected: boolean;
  onSelect: (option: OptionRow) => void;
  disabled: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border p-4 transition-all ${
        isSelected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/60 hover:bg-muted"
      } ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-lg text-foreground">
            {option.option_text}
          </p>
          {option.helper_note && (
            <p className="text-sm text-muted-foreground mt-1">
              {option.helper_note}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

const CourseFitNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAnonymous, isLoading: authLoading } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [optionsMap, setOptionsMap] = useState<Record<number, OptionRow[]>>({});
  const [uiCopy, setUiCopy] = useState<Record<string, string>>({});

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isEnsuringUser, setIsEnsuringUser] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const [showIntro, setShowIntro] = useState(true);
  const [result, setResult] = useState<ReportPayload | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [hasSubmittedDetails, setHasSubmittedDetails] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [pendingFinalize, setPendingFinalize] = useState(false);

  const ensureUserSession = async () => {
    if (user) return user;
    setIsEnsuringUser(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setUser(data.user);
      return data.user;
    } finally {
      setIsEnsuringUser(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const loadData = async () => {
      try {
        const { data: setCandidates, error: setError } = await supabase
          .from("cft_question_sets")
          .select("*")
          .order("is_active", { ascending: false })
          .order("set_no", { ascending: true });

        if (setError) throw setError;
        const sets = setCandidates || [];
        if (sets.length === 0) {
          toast({
            title: "Content unavailable",
            description: "No Course Fit question sets found. Please add one in Supabase.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const activePool = sets.filter((set) => set.is_active);
        const candidatePool = activePool.length > 0 ? activePool : sets;
        const activeSet = candidatePool[Math.floor(Math.random() * candidatePool.length)];

        if (isAnonymous) {
          // Anonymous: load only public data; do not create Supabase session
          const [questionsRes, optionsRes, uiCopyRes] = await Promise.all([
            supabase
              .from("cft_questions")
              .select("*")
              .eq("set_no", activeSet.set_no)
              .order("question_no", { ascending: true }),
            supabase
              .from("cft_options")
              .select("*")
              .eq("set_no", activeSet.set_no)
              .order("question_no", { ascending: true })
              .order("option_no", { ascending: true }),
            supabase.from("cft_ui_copy").select("*"),
          ]);

          if (questionsRes.error) throw questionsRes.error;
          if (optionsRes.error) throw optionsRes.error;
          if (uiCopyRes.error) throw uiCopyRes.error;

          const optionMap = (optionsRes.data || []).reduce<Record<number, OptionRow[]>>(
            (acc, option) => {
              const bucket = acc[option.question_no] || [];
              bucket.push(option);
              acc[option.question_no] = bucket;
              return acc;
            },
            {}
          );

          const uiCopyMap = (uiCopyRes.data || []).reduce<Record<string, string>>(
            (acc, item: UICopyRow) => {
              acc[item.key] = item.value;
              return acc;
            },
            {}
          );

          setUser(null);
          setHasSubmittedDetails(false);
          setQuestionSet(activeSet);
          setQuestions(questionsRes.data || []);
          setOptionsMap(optionMap);
          setUiCopy(uiCopyMap);
          setIsLoading(false);
          return;
        }

        // Logged in: get or create Supabase user, then load full data including user details
        const { data: authData } = await supabase.auth.getUser();
        let sessionUser = authData.user;
        if (!sessionUser) {
          sessionUser = await ensureUserSession();
        }

        if (!sessionUser) {
          toast({
            title: "Unable to start",
            description: "We couldn't create a Course Fit session. Please refresh and try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        setUser(sessionUser);

        const [questionsRes, optionsRes, uiCopyRes, detailsRes] = await Promise.all([
          supabase
            .from("cft_questions")
            .select("*")
            .eq("set_no", activeSet.set_no)
            .order("question_no", { ascending: true }),
          supabase
            .from("cft_options")
            .select("*")
            .eq("set_no", activeSet.set_no)
            .order("question_no", { ascending: true })
            .order("option_no", { ascending: true }),
          supabase.from("cft_ui_copy").select("*"),
          supabase
            .from("cft_user_details")
            .select("*")
            .eq("user_id", sessionUser.id)
            .eq("set_no", activeSet.set_no)
            .maybeSingle(),
        ]);

        if (questionsRes.error) throw questionsRes.error;
        if (optionsRes.error) throw optionsRes.error;
        if (uiCopyRes.error) throw uiCopyRes.error;

        const optionMap = (optionsRes.data || []).reduce<Record<number, OptionRow[]>>(
          (acc, option) => {
            const bucket = acc[option.question_no] || [];
            bucket.push(option);
            acc[option.question_no] = bucket;
            return acc;
          },
          {}
        );

        const uiCopyMap = (uiCopyRes.data || []).reduce<Record<string, string>>(
          (acc, item: UICopyRow) => {
            acc[item.key] = item.value;
            return acc;
          },
          {}
        );

        if (detailsRes.data) {
          setStudentName(detailsRes.data.full_name);
          setStudentPhone(detailsRes.data.phone);
        }
        setHasSubmittedDetails(false);

        setQuestionSet(activeSet);
        setQuestions(questionsRes.data || []);
        setOptionsMap(optionMap);
        setUiCopy(uiCopyMap);
      } catch (error) {
        console.error("Failed to load Course Fit data", error);
        trackError(error as Error, { context: "load_course_fit" });
        toast({
          title: "Unable to load Course Fit",
          description: "Please refresh or try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast, authLoading, isAnonymous]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = currentQuestion
    ? optionsMap[currentQuestion.question_no] || []
    : [];
  const questionCount = questions.length || questionSet?.question_count || 1;
  const progressPercent = ((currentQuestionIndex) / questionCount) * 100;

  // Require login before showing test: redirect anonymous users as soon as they land on the page
  useEffect(() => {
    if (authLoading) return;
    if (isAnonymous && showIntro) {
      requireLogin(isAnonymous, navigate, toast, "/course-fit");
    }
  }, [authLoading, isAnonymous, showIntro, navigate, toast]);

  const handleStart = () => {
    if (!requireLogin(isAnonymous, navigate, toast, "/course-fit")) return;
    setShowIntro(false);
    trackEvent("test_started", { test_type: "course_fit" });
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    } else {
      setShowIntro(true);
    }
  };

  const handleOptionSelect = async (option: OptionRow) => {
    if (!questionSet) return;
    setIsSavingAnswer(true);
    try {
      const activeUser = await ensureUserSession();
      if (!activeUser) throw new Error("No session available");
      const updatedAnswers = {
        ...answers,
        [option.question_no]: option.option_no,
      };
      setAnswers(updatedAnswers);

      const { error } = await supabase
        .from("cft_responses")
        .upsert(
          {
            user_id: activeUser.id,
            set_no: questionSet.set_no,
            question_id: option.question_no,
            option_id: option.option_no,
            w_analytical: option.w_analytical,
            w_logical: option.w_logical,
            w_creative: option.w_creative,
            w_communication: option.w_communication,
            w_math: option.w_math,
            w_biology: option.w_biology,
            w_data: option.w_data,
            w_coding: option.w_coding,
            w_design: option.w_design,
            w_cyber: option.w_cyber,
            w_ai_ml: option.w_ai_ml,
            specialization_hint: option.specialization_hint,
          },
          { onConflict: "user_id,set_no,question_id" }
        );

      if (error) throw error;

      if (currentQuestionIndex < questionCount - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        await handleFinalStep();
      }
    } catch (error) {
      console.error("Failed to save response", error);
      trackError(error as Error, { context: "save_cft_response" });
      toast({
        title: "Unable to save response",
        description: "Please try selecting the option again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const finalizeReport = async () => {
    if (!questionSet) return;
    setIsGeneratingReport(true);
    try {
      await ensureUserSession();
      const { data, error } = await supabase.rpc("cft_generate_report", {
        p_set_no: questionSet.set_no,
      });

      if (error) throw error;
      setResult(data as ReportPayload);
      trackEvent("fit_completed", {
        top_course: data?.courses?.[0]?.course_key,
        confidence: data?.confidence,
      });
      toast({
        title: "Report ready!",
        description: "Scroll down to explore your personalized matches.",
      });
    } catch (error) {
      console.error("Failed to generate report", error);
      trackError(error as Error, { context: "generate_cft_report" });
      toast({
        title: "Could not generate report",
        description: "Please retry in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRetake = async () => {
    const activeUser = await ensureUserSession();
    if (activeUser && questionSet) {
      await supabase
        .from("cft_responses")
        .delete()
        .eq("user_id", activeUser.id)
        .eq("set_no", questionSet.set_no);
    }
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setShowIntro(true);
    setHasSubmittedDetails(false);
    setPendingFinalize(false);
    setDetailsDialogOpen(false);
  };

  const handleFinalStep = async () => {
    if (!questionSet) return;
    if (hasSubmittedDetails) {
      await finalizeReport();
      return;
    }
    setPendingFinalize(true);
    setDetailsDialogOpen(true);
  };

  const handleDetailsSubmit = async () => {
    if (!studentName.trim() || !studentPhone.trim()) {
      toast({
        title: "Missing info",
        description: "Please enter both name and phone number.",
        variant: "destructive",
      });
      return;
    }
    if (!questionSet) return;
    const activeUser = await ensureUserSession();
    if (!activeUser) return;

    try {
      setIsSavingDetails(true);
      const { error } = await supabase
        .from("cft_user_details")
        .upsert(
          {
            user_id: activeUser.id,
            set_no: questionSet.set_no,
            full_name: studentName.trim(),
            phone: studentPhone.trim(),
          },
          { onConflict: "user_id,set_no" }
        );
      if (error) throw error;
      setHasSubmittedDetails(true);
      setDetailsDialogOpen(false);
      toast({
        title: "Details saved",
        description: "We'll use this to personalize your report.",
      });
      if (pendingFinalize) {
        setPendingFinalize(false);
        await finalizeReport();
      }
    } catch (error) {
      console.error("Failed to save student details", error);
      trackError(error as Error, { context: "save_student_details" });
      toast({
        title: "Unable to save details",
        description: "Please check your entries and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDetails(false);
    }
  };

  const hintEntries = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.specialization_hints || {}).sort(
      (a, b) => b[1] - a[1]
    );
  }, [result]);

  const detailsDialog = (
    <StudentDetailsDialog
      open={detailsDialogOpen}
      onOpenChange={setDetailsDialogOpen}
      studentName={studentName}
      studentPhone={studentPhone}
      setStudentName={setStudentName}
      setStudentPhone={setStudentPhone}
      onSubmit={handleDetailsSubmit}
      isSubmitting={isSavingDetails}
    />
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-12">
          <CourseFitSkeleton />
        </div>
        {detailsDialog}
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>No active Course Fit set</CardTitle>
              <CardDescription>
                The content team hasn’t published a Course Fit set yet. Please check back soon.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        {detailsDialog}
      </div>
    );
  }

  if (result) {
    const traitEntries = Object.entries(result.traits || {});
    const topTraits = traitEntries
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, 3)
      .map(([trait]) => TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]);
    const specializationSuggestions = hintEntries.slice(0, 3).map(([hint]) => hint);
    const topCourses = (result.courses || []).slice(0, 3);

    const traitChartData = TRAIT_KEYS.map((key) => ({
      trait: TRAIT_LABELS[key],
      score: Number(result.traits?.[key] ?? 0),
    }));

    const entranceExamMap: Record<string, string> = {
      "CSE-AI": "JEE Main / CUET",
      "CSE-ML": "JEE Main / CUET",
      "CSE-Data": "JEE Main / CUET",
      "CSE-Core": "JEE Main / State CET",
      "ECE": "JEE Main / State CET",
      "B.Des": "NID / UCEED",
      "BBA": "CUET / IPMAT",
      "B.Com": "CUET",
    };

    const getCourseExplanation = (courseName: string) => {
      const dominantTraits = topTraits.length ? topTraits.join(", ") : "your core strengths";
      return `You showed strong alignment with ${dominantTraits} — ${courseName} lets you build on those strengths through projects, teamwork, and future-ready skills.`;
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
        pdf.save("course-fit-report.pdf");
      } catch (error) {
        console.error("Failed to download report", error);
        toast({
          title: "Download failed",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-12 space-y-8" ref={reportRef}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">College Companion Hub</p>
                  <p className="font-semibold text-lg">Course Fit Test</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
                <h1 className="text-3xl font-bold">Your Course Fit Report</h1>
                <p className="text-muted-foreground text-sm">
                  {studentName || "Student"}
                  {studentPhone ? ` · ${studentPhone}` : ""}
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
                  Hey {studentName || "there"}!
                </p>
                <p>
                  Based on how you think, solve problems, and express yourself, here’s a personalized map of courses
                  that align with your style. Each suggestion balances your strongest traits with what the course demands.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Target className="h-6 w-6 shrink-0" />
                  Top 3 Recommendations
                </h2>
                <div className="grid gap-4">
                  {topCourses.map((course, idx) => (
                    <div key={course.course_key} className="rounded-2xl border p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Rank {idx + 1}</p>
                          <h3 className="text-xl font-semibold">{course.name}</h3>
                        </div>
                        <Badge variant="secondary">Score {course.final}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getCourseExplanation(course.name)}
                      </p>
                      <p className="text-sm font-medium">Key traits: {topTraits.join(", ")}</p>
                      <p className="text-xs text-muted-foreground">
                        Entrance exams: {entranceExamMap[course.course_key] || "Check college-specific criteria"}
                      </p>
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
                  <Badge variant="outline">Confidence {Math.round(result.confidence)}%</Badge>
                </div>
                <div className="w-full h-64">
                  <ResponsiveContainer>
                    <RadarChart data={traitChartData} outerRadius="80%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                      <Radar name="You" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {specializationSuggestions.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 shrink-0" />
                  You May Also Like…
                </h2>
                  <div className="flex flex-wrap gap-3">
                    {specializationSuggestions.map((hint) => (
                      <div key={hint} className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm">
                        {hint}-oriented roles and electives
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {result.notes && result.notes.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-2xl font-semibold">Next Steps</h2>
                  <ul className="space-y-2">
                    {result.notes.map((note) => (
                      <li key={note} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

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
        {detailsDialog}
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#f3f4ff]">
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#0ea5e9] text-white py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mx-auto">
              <Brain className="h-10 w-10" />
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="tracking-[0.3em] uppercase text-sm text-white/70">Future ready assessment</p>
                <h1 className="text-4xl sm:text-5xl font-bold">Course Fit Test</h1>
                <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
                  Not just what everyone else is doing. Get personalized recommendations based on your interests,
                  strengths, and aspirations.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={handleStart}
                  size="lg"
                  disabled={isEnsuringUser}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/15 px-10 rounded-full text-lg font-semibold"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isEnsuringUser ? "Preparing..." : "Start Assessment Now"}
                </Button>
                <p className="text-sm text-white/70 flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  120+ students took this in the last 24 hours
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-white/80">
              {["Only 5 minutes", "Instant report", "Trusted by 5,000+ students"].map((pill) => (
                <span key={pill} className="px-4 py-1 rounded-full border border-white/40 bg-white/10 backdrop-blur">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" />
        </div>

          <div className="container mx-auto px-4 py-16 space-y-12">
            <div className="text-center space-y-3">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">Why take this assessment?</p>
            <h2 className="text-3xl font-bold text-foreground">Clarity before you commit</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every recommendation is backed by data and aligned with in-demand skills.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Data-Driven", copy: "Backed by real student success patterns" },
              { title: "Personalized", copy: "Matches your unique profile and goals" },
              { title: "Career-Focused", copy: "Aligned with job market trends" },
              { title: "Instant Results", copy: "Get recommendations in 5 minutes" },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border bg-white shadow-sm p-6 space-y-2">
                <p className="font-semibold text-lg">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-xl rounded-[28px]">
              <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary uppercase">What to expect</p>
                  <h3 className="text-2xl font-semibold">Answer 12 real-world scenarios</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    Trait profile + top 5 course matches
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    Specialization boosts & advisory flags
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    Confidence score to guide decisions
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl rounded-[28px]">
              <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary uppercase">How it works</p>
                  <h3 className="text-2xl font-semibold">11-trait scoring + smart course weights</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Weighted options mapped to 11 strengths</li>
                  <li>• Course importance matrix + specialization boosts</li>
                  <li>• Updated 12-question sets with live data</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-2xl rounded-[32px] bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] text-white">
            <CardContent className="py-8 px-4 sm:py-10 sm:px-6 text-center space-y-4">
              <p className="text-sm font-semibold tracking-wide text-white/70">Spots filling fast</p>
              <h3 className="text-3xl font-bold">Students who apply early get priority counseling slots</h3>
              <p className="text-white/70">Secure your recommendation before the next admission cycle.</p>
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={handleStart}
                  size="lg"
                  disabled={isEnsuringUser}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10 px-10"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isEnsuringUser ? "Preparing..." : "Start Assessment Now"}
                </Button>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  100% free · 5 minutes · Instant results
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        {detailsDialog}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <BackButton onClick={handleBack} />
          <Badge variant="outline">Set {questionSet.set_no}</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-[3fr,1fr]">
          <Card className="p-4 sm:p-6 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Question {currentQuestionIndex + 1} of {questionCount}
              </p>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {currentQuestion ? (
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {currentQuestion.question_text}
                  </p>
                  {currentQuestion.helper_note && (
                    <p className="text-muted-foreground mt-2">
                      {currentQuestion.helper_note}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {currentOptions.map((option) => (
                    <OptionCard
                      key={`${option.question_no}-${option.option_no}`}
                      option={option}
                      isSelected={
                        answers[option.question_no] === option.option_no
                      }
                      onSelect={handleOptionSelect}
                      disabled={isSavingAnswer}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p>No questions available.</p>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
              >
                Back
              </Button>
              <Button
                onClick={handleFinalStep}
                disabled={Object.keys(answers).length < questionCount || isGeneratingReport}
              >
                {isGeneratingReport ? "Generating..." : "View My Report"}
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
              {uiCopy.note_ui || "Pick the option that feels most like you. Answers auto-save."}
            </div>
          </div>
        </div>
        {detailsDialog}
      </div>
    </div>
  );
};

export default CourseFitNew;

const StudentDetailsDialog = ({
  open,
  onOpenChange,
  studentName,
  studentPhone,
  setStudentName,
  setStudentPhone,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentPhone: string;
  setStudentName: (value: string) => void;
  setStudentPhone: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Last step: who should we send this to?</DialogTitle>
        <DialogDescription>
          We’ll use your details to share the Course Fit report and follow up with personalized help.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="student-name">Full name</Label>
          <Input
            id="student-name"
            placeholder="Enter your name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-phone">Phone number</Label>
          <Input
            id="student-phone"
            placeholder="10-digit phone"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save & view report"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
