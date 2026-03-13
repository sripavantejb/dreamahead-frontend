import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, CheckCircle, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalLeads: 0,
    activeScholarships: 0,
    upcomingExams: 0,
    publishedVersions: 0,
  });

  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get submissions count
      const { count: submissionsCount } = await supabase
        .from("fit_submissions")
        .select("*", { count: "exact", head: true });

      // Get leads count
      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      // Get active scholarships count
      const { data: schVersions } = await supabase
        .from("sch_versions")
        .select("id")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      let scholarshipsCount = 0;
      if (schVersions) {
        const { count } = await supabase
          .from("sch_schemes")
          .select("*", { count: "exact", head: true })
          .eq("version_id", schVersions.id);
        scholarshipsCount = count || 0;
      }

      // Get upcoming exams count
      const { data: calVersions } = await supabase
        .from("cal_versions")
        .select("id")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      let examsCount = 0;
      if (calVersions) {
        const today = new Date().toISOString().split("T")[0];
        const { count } = await supabase
          .from("cal_events")
          .select("*", { count: "exact", head: true })
          .eq("version_id", calVersions.id)
          .gte("exam_date", today);
        examsCount = count || 0;
      }

      // Get published versions count
      const { count: versionsCount } = await supabase
        .from("fit_versions")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      setStats({
        totalSubmissions: submissionsCount || 0,
        totalLeads: leadsCount || 0,
        activeScholarships: scholarshipsCount,
        upcomingExams: examsCount,
        publishedVersions: versionsCount || 0,
      });

      // Get activity data for chart
      const { data: recentSubmissions } = await supabase
        .from("fit_submissions")
        .select("completed_at")
        .order("completed_at", { ascending: false })
        .limit(30);

      // Group by date
      const activityMap: Record<string, number> = {};
      recentSubmissions?.forEach((sub) => {
        const date = new Date(sub.completed_at).toLocaleDateString();
        activityMap[date] = (activityMap[date] || 0) + 1;
      });

      const chartData = Object.entries(activityMap)
        .map(([date, count]) => ({ date, count }))
        .slice(0, 7)
        .reverse();

      setActivityData(chartData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Admin control center</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import from Sheet
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Draft
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-3xl">{stats.totalSubmissions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Course Fit Tests completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-3xl">{stats.totalLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Scholarships</CardDescription>
            <CardTitle className="text-3xl">{stats.activeScholarships}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Currently published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Exams</CardDescription>
            <CardTitle className="text-3xl">{stats.upcomingExams}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">In the calendar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published Versions</CardDescription>
            <CardTitle className="text-3xl">{stats.publishedVersions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Live content</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Student Activity (Last 7 Days)</CardTitle>
          <CardDescription>Course Fit Test submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Fit Test</CardTitle>
            <CardDescription>Manage questions and rules</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Manage Content
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scholarships</CardTitle>
            <CardDescription>Update scholarship schemes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Manage Schemes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads</CardTitle>
            <CardDescription>View and contact leads</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" />
              View Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
