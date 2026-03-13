import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Brain,
  FileText,
  Scale,
  Clock,
  Award,
  Building2,
  GraduationCap,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { SectionHeader, StatCard, FeatureCard, TestimonialCard, HowItWorks, HeroLeadForm } from "@/components/landing";
import { AIBot } from "@/components/AIBot";
import Iridescence from "@/components/Iridescence";
import GradientText from "@/components/GradientText";

const HERO_BG_COLOR: [number, number, number] = [0.145, 0.388, 0.922];

// Alternating section themes: light blue ↔ white for clear visual separation
const SECTION_THEME_ALT = "bg-sky-50 dark:bg-sky-950/20";
const SECTION_THEME_MAIN = "bg-white dark:bg-background";

const Index = () => {
  const navigate = useNavigate();

  // Open navigation - allows browsing tile descriptions without login
  const handleTileClick = (path: string) => {
    // Navigate directly to the page
    navigate(path);
  };

  const discoverTools = [
    {
      title: "Career DNA Test",
      description: "What if your dream course is different from what you thought?",
      icon: Brain,
      path: "/career-dna",
      curiosityText: "Students are often surprised by their results — find out what your profile reveals."
    },
    {
      title: "Course Fit Test",
      description: "Find out which stream feels made for you.",
      icon: Target,
      path: "/course-fit",
      curiosityText: "See how closely your goals align with your personality."
    },
    {
      title: "Mock Tests",
      description: "How ready are you? Try one and see for yourself.",
      icon: FileText,
      path: "/mock-tests",
      curiosityText: "Measure your readiness — start your free attempt now."
    }
  ];

  const planningTools = [
    {
      title: "College Predictor",
      description: "Enter your marks — see which colleges align with your score.",
      icon: GraduationCap,
      path: "/college-predictor",
      curiosityText: "Ever wondered what your marks really mean in this year's competition?"
    },
    {
      title: "Rank Predictor",
      description: "Curious how your percentile translates to a real rank?",
      icon: TrendingUp,
      path: "/rank-predictor",
      curiosityText: "You might be closer to your dream college than you think."
    },
    {
      title: "College Comparison",
      description: "Two colleges in mind? Let's see which one fits you better.",
      icon: Scale,
      path: "/college-battle",
      curiosityText: "Compare like a pro — placements, culture, city life, all in one glance."
    },
    {
      title: "Dream 5 vs Reality 5",
      description: "Your dream colleges have twins — discover them.",
      icon: Target,
      path: "/dream-reality",
      curiosityText: "Find realistic alternatives that might surprise you."
    },
    {
      title: "Cutoff Alerts",
      description: "Explore how cutoffs shifted last year — and what that means for you.",
      icon: TrendingUp,
      path: "/cutoffs",
      curiosityText: "See which deadlines are just around the corner."
    }
  ];

  const trackingTools = [
    {
      title: "Deadline Tracker",
      description: "Every form, every date — all in one dashboard.",
      icon: Clock,
      path: "/deadlines",
      curiosityText: "See which deadlines are just around the corner."
    },
    {
      title: "Scholarship Finder",
      description: "Scholarships you didn't know existed — now easy to find.",
      icon: Award,
      path: "/scholarships",
      curiosityText: "You'll be surprised how many scholarships match your profile."
    },
    {
      title: "Placement Reality Checker",
      description: "Curious what real placement stats look like?",
      icon: Building2,
      path: "/placements",
      curiosityText: "What's the real story behind that college's placement rate?"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section — extends behind navbar so no white strip */}
      <section className="relative min-h-screen flex flex-col justify-center py-14 sm:py-20 md:py-24 lg:py-32 overflow-hidden -mt-nav pt-nav">
        <Iridescence
          className="absolute inset-0 w-full h-full pointer-events-none"
          color={HERO_BG_COLOR}
          mouseReact
          amplitude={0.1}
          speed={1}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/80 pointer-events-none" aria-hidden />
        <div className="container relative z-10 mx-auto px-3 sm:px-4 flex-1 flex flex-col justify-center min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-8 lg:gap-12 xl:gap-16 items-center max-w-6xl mx-auto w-full">
            {/* Left: headline, subtext, stats, CTAs — stays in its column */}
            <div className="text-center lg:text-left min-w-0 max-w-2xl lg:max-w-none mx-auto lg:mx-0 order-1">
              <div className="space-y-3 sm:space-y-4 animate-fade-in">
                <h1 className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground break-words">
                  <span className="block md:whitespace-nowrap">Your Career. Your Path.</span>
                  <GradientText
                    colors={["#7C3AED", "#BE185D", "#7C3AED"]}
                    animationSpeed={8}
                    showBorder={false}
                    className="inline-block pr-1 md:whitespace-nowrap"
                  >
                    Guided by Experts!
                  </GradientText>
                </h1>
                <p className="text-sm min-[380px]:text-base md:text-lg text-muted-foreground max-w-2xl lg:max-w-none leading-relaxed break-words" style={{ animationDelay: "0.1s" }}>
                  Join 50,000+ students using Dream Ahead to explore the right courses,
                  understand admission possibilities, track scholarships, and stay organized — all in one place.
                </p>
              </div>

              {/* Compact stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:flex sm:flex-wrap mt-4 sm:mt-6 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground text-center sm:text-left">50K+ Students</span>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground text-center sm:text-left">2000+ Colleges</span>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground text-center sm:text-left">100+ Scholarships</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Button
                  size="lg"
                  onClick={() => window.open("https://1pcclub.in/", "_blank")}
                  className="group text-base sm:text-lg px-6 sm:px-8 rounded-xl min-h-12 sm:min-h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-button transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] w-full sm:w-auto"
                >
                  <FileText className="mr-2 h-5 w-5 shrink-0" />
                  <span className="truncate">Start Free Mock Test</span>
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open("https://wa.me/919999999999", "_blank")}
                  className="group text-base sm:text-lg px-6 sm:px-8 rounded-xl min-h-12 sm:min-h-11 border-2 border-border hover:border-primary/30 hover:bg-primary/5 text-foreground transition-all duration-300 w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 h-5 w-5 shrink-0 text-primary" />
                  <span className="truncate">Join WhatsApp Updates</span>
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

            </div>

            {/* Right: lead form card — dedicated column, no overlap */}
            <div className="flex justify-center lg:justify-end w-full min-w-0 order-2 animate-fade-in mt-6 lg:mt-0" style={{ animationDelay: "0.2s" }}>
              <div className="w-full max-w-md shrink-0">
                <HeroLeadForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Message Banner — theme: light blue */}
      <section className={`py-12 sm:py-16 md:py-20 ${SECTION_THEME_ALT}`}>
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <StatCard value={50000} label="Students" icon={GraduationCap} suffix="+" />
            <StatCard value={2000} label="Colleges" icon={Building2} suffix="+" />
            <StatCard value={100} label="Scholarships" icon={Award} suffix="+" />
          </div>
          <Card className="max-w-3xl mx-auto mt-8 sm:mt-12 rounded-2xl shadow-card border border-border border-l-4 border-l-primary bg-card/90 backdrop-blur-md">
            <CardContent className="p-4 sm:p-6 md:p-7 text-center">
              <p className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Mock tests designed by top faculty across India</span>
                {" — "}
                <span className="font-semibold text-primary">free to try</span>
                , built to match real exams.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Discover Yourself — theme: white */}
      <section className={`py-16 sm:py-20 md:py-24 ${SECTION_THEME_MAIN}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader
            overline="Self-assessment"
            title="Discover Yourself"
            subtitle="Understand your strengths, personality, and perfect course fit."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {discoverTools.map((tool) => (
              <FeatureCard
                key={tool.path}
                title={tool.title}
                description={tool.description}
                curiosityText={tool.curiosityText}
                icon={tool.icon}
                path={tool.path}
                onClick={handleTileClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Predict Your Admission — theme: light blue */}
      <section className={`py-16 sm:py-20 md:py-24 ${SECTION_THEME_ALT}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader
            title="Predict Your Admission"
            subtitle="See where your marks and effort can actually take you."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {planningTools.map((tool) => (
              <FeatureCard
                key={tool.path}
                title={tool.title}
                description={tool.description}
                curiosityText={tool.curiosityText}
                icon={tool.icon}
                path={tool.path}
                onClick={handleTileClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Track & Apply — theme: white */}
      <section className={`py-16 sm:py-20 md:py-24 ${SECTION_THEME_MAIN}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader
            title="Track & Apply"
            subtitle="Stay on top of every opportunity, effortlessly."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trackingTools.map((tool) => (
              <FeatureCard
                key={tool.path}
                title={tool.title}
                description={tool.description}
                curiosityText={tool.curiosityText}
                icon={tool.icon}
                path={tool.path}
                onClick={handleTileClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — theme: light blue */}
      <section className={`py-16 sm:py-20 md:py-24 ${SECTION_THEME_ALT}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader
            title="How It Works"
            subtitle="Three simple steps to find your perfect college match."
          />
          <HowItWorks />
        </div>
      </section>

      {/* Testimonials — theme: white */}
      <section className={`py-16 sm:py-20 md:py-24 ${SECTION_THEME_MAIN}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader
            title="What Students Say"
            subtitle="Join thousands who found their path with Dream Ahead."
          />
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              quote="Dream Ahead helped me shortlist the best colleges for my rank."
              name="Priya S."
              rating={5}
            />
            <TestimonialCard
              quote="The Course Fit Test showed me a stream I hadn't considered. Now I'm confident about my choice."
              name="Rahul M."
              rating={5}
            />
            <TestimonialCard
              quote="Deadline tracker and scholarship finder in one place — saved me so much time."
              name="Ananya K."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 md:py-24 px-3 sm:px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-xl min-[380px]:text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground tracking-tight break-words">Ready to choose the right college?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who've found their perfect college match.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold min-h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-button transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] w-full sm:w-auto"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
          </Button>
        </div>
      </section>

      <Footer />
      <AIBot />
    </div>
  );
};

export default Index;
