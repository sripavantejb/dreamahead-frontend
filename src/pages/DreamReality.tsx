import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { ensureSupabaseSession } from "@/lib/session";

const DreamReality = () => {
  const navigate = useNavigate();
  const [dreamColleges, setDreamColleges] = useState<string[]>([]);
  const [realityColleges, setRealityColleges] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sessionUser = await ensureSupabaseSession();
        setUser(sessionUser);
        if (sessionUser) {
          await loadDreamColleges(sessionUser);
        }
      } catch (error) {
        console.error("Failed to load DreamReality", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const loadDreamColleges = async (currentUser: any) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();
    
    if (data && data.dream_college_ids?.length > 0) {
      // Fetch college names for Dream 5
      const { data: dreamColleges } = await supabase
        .from("colleges")
        .select("name")
        .in("id", data.dream_college_ids);

      if (dreamColleges) {
        const colleges = dreamColleges.map(c => c.name);
        setDreamColleges(colleges);
        findAlternatives(colleges);
      }
    }
  };

  const findAlternatives = async (dreams: string[]) => {
    const { data } = await supabase
      .from("colleges")
      .select("*")
      .not("name", "in", `(${dreams.join(",")})`)
      .limit(5);
    
    setRealityColleges(data || []);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <Target className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dream 5 vs Reality 5
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover realistic alternatives to your dream colleges
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Your Dream 5</CardTitle>
              <CardDescription>Colleges you're aiming for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dreamColleges.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Add your Dream 5 colleges inside your profile to see personalized recommendations.
                  </p>
                )}
                {dreamColleges.map((college, index) => (
                  <div key={index} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{college}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Reality 5 Alternatives</CardTitle>
              <CardDescription>Similar colleges with better admission chances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realityColleges.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    We'll suggest alternatives once you set your dream colleges.
                  </p>
                )}
                {realityColleges.map((college, index) => (
                  <div key={college.id} className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{college.name}</p>
                        {college.location && (
                          <p className="text-sm text-muted-foreground">{college.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default DreamReality;
