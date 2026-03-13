import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitizeCSVCell } from "@/lib/csvExport";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AnalyticsDashboard = () => {
  const [submissionsData, setSubmissionsData] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [topColleges, setTopColleges] = useState<any[]>([]);
  const [traitDistribution, setTraitDistribution] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get submissions over time
      const { data: submissions } = await supabase
        .from("fit_submissions")
        .select("completed_at, recommended_courses, trait_scores")
        .order("completed_at", { ascending: false })
        .limit(100);

      // Group by date
      const submissionsByDate: Record<string, number> = {};
      submissions?.forEach((sub) => {
        const date = new Date(sub.completed_at).toLocaleDateString();
        submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
      });

      const chartData = Object.entries(submissionsByDate)
        .map(([date, count]) => ({ date, submissions: count }))
        .slice(0, 14)
        .reverse();

      setSubmissionsData(chartData);

      // Analyze recommended courses
      const courseCounts: Record<string, number> = {};
      submissions?.forEach((sub) => {
        const courses = sub.recommended_courses as any[];
        courses?.forEach((course: any) => {
          const courseName = course.course_name || course.name;
          courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
        });
      });

      const topCoursesData = Object.entries(courseCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopCourses(topCoursesData);

      // Analyze trait scores
      const traitTotals: Record<string, number> = {};
      const traitCounts: Record<string, number> = {};
      
      submissions?.forEach((sub) => {
        const traits = sub.trait_scores as Record<string, number>;
        Object.entries(traits || {}).forEach(([trait, score]) => {
          traitTotals[trait] = (traitTotals[trait] || 0) + score;
          traitCounts[trait] = (traitCounts[trait] || 0) + 1;
        });
      });

      const traitData = Object.entries(traitTotals)
        .map(([trait, total]) => ({
          trait,
          avgScore: Math.round(total / (traitCounts[trait] || 1))
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 8);

      setTraitDistribution(traitData);

      // Get top dream colleges from profiles
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("dream_college_ids");

      const collegeCounts: Record<string, number> = {};
      profiles?.forEach((profile) => {
        const colleges = profile.dream_college_ids || [];
        colleges.forEach((collegeId: string) => {
          collegeCounts[collegeId] = (collegeCounts[collegeId] || 0) + 1;
        });
      });

      const topCollegesData = Object.entries(collegeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      setTopColleges(topCollegesData);

      // Funnel data
      const { count: totalProfiles } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalSubmissions } = await supabase
        .from("fit_submissions")
        .select("*", { count: "exact", head: true });

      setFunnelData({
        registered: totalProfiles || 0,
        started: totalSubmissions || 0,
        completed: totalSubmissions || 0,
      });

    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.map(sanitizeCSVCell).join(','),
      ...data.map(row => 
        headers.map(h => sanitizeCSVCell(String(row[h] || ''))).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights and metrics</p>
        </div>
      </div>

      {/* Funnel Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registered Users</CardDescription>
            <CardTitle className="text-3xl">{funnelData.registered}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Started Test</CardDescription>
            <CardTitle className="text-3xl">{funnelData.started}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {funnelData.registered > 0 ? Math.round((funnelData.started / funnelData.registered) * 100) : 0}% conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Test</CardDescription>
            <CardTitle className="text-3xl">{funnelData.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {funnelData.started > 0 ? Math.round((funnelData.completed / funnelData.started) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="courses">Top Courses</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="colleges">Dream Colleges</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submissions Over Time</CardTitle>
                  <CardDescription>Last 14 days</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportCSV(submissionsData, 'submissions')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={submissionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="submissions" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Recommended Courses</CardTitle>
                  <CardDescription>Most frequently recommended</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportCSV(topCourses, 'top-courses')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topCourses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traits">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trait Score Distribution</CardTitle>
                  <CardDescription>Average scores across all users</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportCSV(traitDistribution, 'trait-distribution')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={traitDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="trait" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colleges">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Dream Colleges</CardTitle>
                  <CardDescription>Most selected during signup</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportCSV(topColleges, 'dream-colleges')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topColleges} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
