import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ensureSupabaseSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
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
  GraduationCap,
  Edit
} from "lucide-react";

type Dream5College = { id: string; name: string; location: string | null };

const Dashboard = () => {
  const navigate = useNavigate();
  const [dream5Ids, setDream5Ids] = useState<string[]>([]);
  const [dream5Colleges, setDream5Colleges] = useState<Dream5College[]>([]);
  const [dream5Loading, setDream5Loading] = useState(false);

  const resolveCollegesFromSupabase = useCallback(async (collegeIds: string[]) => {
    if (collegeIds.length === 0) {
      setDream5Colleges([]);
      return;
    }
    setDream5Loading(true);
    try {
      const { data, error } = await supabase
        .from("colleges")
        .select("id, name, location")
        .in("id", collegeIds);
      if (error) throw error;
      const byId = new Map((data || []).map((c) => [c.id, { id: c.id, name: c.name, location: c.location ?? null }]));
      const resolved: Dream5College[] = collegeIds.map((id) =>
        byId.get(id) ?? { id, name: "Unknown", location: null }
      );
      setDream5Colleges(resolved);
    } catch (e) {
      console.error("Error resolving Dream 5 colleges:", e);
      setDream5Colleges(collegeIds.map((id) => ({ id, name: "Unknown", location: null })));
    } finally {
      setDream5Loading(false);
    }
  }, []);

  const handleDream5Save = useCallback(async (collegeIds: string[]) => {
    localStorage.setItem("dream5Colleges", JSON.stringify(collegeIds));
    setDream5Ids(collegeIds);
    resolveCollegesFromSupabase(collegeIds);
    try {
      const user = await ensureSupabaseSession();
      if (user) {
        await supabase
          .from("user_profiles")
          .update({ dream_college_ids: collegeIds })
          .eq("id", user.id);
      }
    } catch (e) {
      console.error("Error syncing Dream 5 to profile:", e);
    }
  }, [resolveCollegesFromSupabase]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const user = await ensureSupabaseSession();
        if (cancelled) return;
        if (user) {
          const { data } = await supabase
            .from("user_profiles")
            .select("dream_college_ids")
            .eq("id", user.id)
            .maybeSingle();
          if (cancelled) return;
          const ids = (data?.dream_college_ids ?? []).filter(Boolean) as string[];
          if (ids.length > 0) {
            setDream5Ids(ids);
            resolveCollegesFromSupabase(ids);
            localStorage.setItem("dream5Colleges", JSON.stringify(ids));
            return;
          }
        }
        const saved = localStorage.getItem("dream5Colleges");
        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDream5Ids(parsed);
            resolveCollegesFromSupabase(parsed);
          }
        }
      } catch (error) {
        if (!cancelled) console.error("Error loading Dream 5 colleges:", error);
        const saved = localStorage.getItem("dream5Colleges");
        if (saved) {
          try {
            const ids = JSON.parse(saved) as string[];
            if (Array.isArray(ids) && ids.length > 0) {
              setDream5Ids(ids);
              resolveCollegesFromSupabase(ids);
            }
          } catch (e) {
            console.error("Error loading Dream 5 from localStorage:", e);
          }
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [resolveCollegesFromSupabase]);

  const tools = [
    {
      title: "Deadline Tracker",
      description: "Track admission & counselling deadlines",
      icon: Calendar,
      path: "/deadlines",
      gradient: "from-primary to-secondary"
    },
    {
      title: "Scholarships",
      description: "Find scholarships for your dream colleges",
      icon: Trophy,
      path: "/scholarships",
      gradient: "from-accent to-orange-500"
    },
    {
      title: "Cutoff Predictor",
      description: "Predict your chances based on cutoffs",
      icon: TrendingUp,
      path: "/cutoffs",
      gradient: "from-secondary to-purple-500"
    },
    {
      title: "Career DNA Test",
      description: "Psychometric career assessment",
      icon: Dna,
      path: "/career-dna",
      gradient: "from-pink-500 to-red-500"
    },
    {
      title: "College Battle",
      description: "Compare colleges side-by-side",
      icon: Swords,
      path: "/college-battle",
      gradient: "from-primary to-cyan-500"
    },
    {
      title: "Dream vs Reality",
      description: "Find realistic alternatives",
      icon: Target,
      path: "/dream-reality",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      title: "Course Fit Test",
      description: "Find your perfect course match",
      icon: BookOpen,
      path: "/course-fit",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Placement Stats",
      description: "Real placement data & insights",
      icon: Building2,
      path: "/placements",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Cutoff Alert",
      description: "Check probability of admission",
      icon: TrendingUp,
      path: "/cutoffs",
      gradient: "from-blue-500 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-muted-foreground mt-2">
              Explore all tools and track your college journey
            </p>
          </div>
        </div>

        {dream5Ids.length > 0 && (
          <Card className="mb-8 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-primary">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Your Dream 5 Colleges</CardTitle>
                    <CardDescription>Personalized results across all tools</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Edit Dream 5 colleges')}
                  className="self-start sm:self-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dream5Loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                  Loading colleges…
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {dream5Colleges.map((college, idx) => (
                    <div key={college.id} className="p-4 rounded-lg bg-background/80 border border-primary/20 hover:shadow-md transition-shadow">
                      <div className="text-xs text-muted-foreground mb-1">College {idx + 1}</div>
                      <div className="font-semibold text-sm">{college.name}</div>
                      {college.location && (
                        <div className="text-xs text-muted-foreground mt-1">{college.location}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {dream5Ids.length === 0 && (
          <Card className="mb-8 shadow-elegant border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Set Your Dream 5 Colleges</CardTitle>
                  <CardDescription>
                    Get personalized results across all tools
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select your Dream 5 colleges to see relevant deadlines, scholarships, cutoffs, and placements automatically.
              </p>
              <Button onClick={() => console.log('Set Dream 5 colleges')} className="bg-gradient-primary">
                Set My Dream 5 Now
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Your Tools</h2>
          <p className="text-muted-foreground">Choose a tool to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.path}
                className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg shadow-card border-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(tool.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;