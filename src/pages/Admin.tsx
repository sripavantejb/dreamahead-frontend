import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/lib/csvExport";
import { ensureSupabaseSession } from "@/lib/session";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await ensureSupabaseSession();

      // Use server-side validation via RPC function
      const { data: isAdminUser, error } = await supabase
        .rpc("check_admin_status");

      if (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Error",
          description: "Failed to verify admin access",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      loadAdminData();
    } catch (error: any) {
      console.error("Error in admin check:", error);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Call secure server-side function that validates admin role
      const { data, error } = await supabase.rpc('get_admin_data');

      if (error) throw error;

      // Parse the JSONB aggregated data
      if (data && data.length > 0) {
        const row = data[0];
        setProfiles(Array.isArray(row.profiles) ? row.profiles : []);
        setQuizResults(Array.isArray(row.quiz_results) ? row.quiz_results : []);
      }
    } catch (error: any) {
      throw error; // Propagate to checkAdminAccess
    }
  };

  const handleExportProfiles = () => {
    exportToCSV(profiles, 'user-profiles.csv');
  };

  const handleExportQuizResults = () => {
    exportToCSV(quizResults, 'quiz-results.csv');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You do not have administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            View and export student data
          </p>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Profiles</CardTitle>
                  <CardDescription>Student information and dream colleges</CardDescription>
                </div>
                <Button onClick={handleExportProfiles} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Dream Colleges</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.full_name}</TableCell>
                        <TableCell>{profile.phone}</TableCell>
                        <TableCell>{profile.exam_type}</TableCell>
                        <TableCell>{profile.exam_marks}</TableCell>
                        <TableCell className="text-sm">
                          {Array.isArray(profile.dream_college_ids) && profile.dream_college_ids.length > 0
                            ? profile.dream_college_ids.join(", ")
                            : "No dream colleges set"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quiz Results</CardTitle>
                  <CardDescription>Student quiz responses and outcomes</CardDescription>
                </div>
                <Button onClick={handleExportQuizResults} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quiz Type</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizResults.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="capitalize">{quiz.quiz_type.replace("_", " ")}</TableCell>
                        <TableCell className="text-sm">
                          {typeof quiz.result === 'object' 
                            ? JSON.stringify(quiz.result).substring(0, 100) + "..."
                            : quiz.result}
                        </TableCell>
                        <TableCell>
                          {new Date(quiz.created_at).toLocaleDateString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
