import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, CheckCircle, Edit, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { parseCSV } from "@/lib/sheetUtils";

const COURSE_FIT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZMg06akthiIEf_BBWQGX48Gv9DdzcU1_nV9gFpRLRVq_n74oQ91IKAzgkOa-iSw/pub?output=csv";

const CourseFitCMS = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [uiCopy, setUiCopy] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadVersionData(selectedVersion);
    }
  }, [selectedVersion]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("fit_versions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
      
      // Select most recent version
      if (data && data.length > 0) {
        setSelectedVersion(data[0].id);
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Failed to load versions");
    }
  };

  const loadVersionData = async (versionId: string) => {
    try {
      setLoading(true);

      const [questionsRes, optionsRes, rulesRes, coursesRes, uiCopyRes] = await Promise.all([
        supabase.from("fit_questions").select("*").eq("version_id", versionId).order("question_order"),
        supabase.from("fit_options").select("*").eq("version_id", versionId),
        supabase.from("fit_rules").select("*").eq("version_id", versionId),
        supabase.from("fit_courses").select("*").eq("version_id", versionId),
        supabase.from("fit_ui_copy").select("*").eq("version_id", versionId),
      ]);

      setQuestions(questionsRes.data || []);
      setOptions(optionsRes.data || []);
      setRules(rulesRes.data || []);
      setCourses(coursesRes.data || []);
      setUiCopy(uiCopyRes.data || []);
    } catch (error) {
      console.error("Error loading version data:", error);
      toast.error("Failed to load version data");
    } finally {
      setLoading(false);
    }
  };

  const createNewDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get next version number
      const { data: latestVersion } = await supabase
        .from("fit_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from("fit_versions")
        .insert({
          version_number: nextVersion,
          status: "draft",
          created_by: user.id,
          notes: `Draft version ${nextVersion}`,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("New draft created");
      await loadVersions();
      setSelectedVersion(data.id);
    } catch (error) {
      console.error("Error creating draft:", error);
      toast.error("Failed to create draft");
    }
  };

  const importFromSheet = async () => {
    try {
      setLoading(true);
      toast.info("Importing from Google Sheets...");

      const response = await fetch(COURSE_FIT_SHEET_URL, { cache: "no-store" });
      const csvText = await response.text();
      const data = parseCSV(csvText);

      const questions = data.filter(row => row.type === "question");
      const options = data.filter(row => row.type === "option");
      const rules = data.filter(row => row.type === "rule");
      const courses = data.filter(row => row.type === "course");
      const uiTexts = data.filter(row => row.type === "ui_text");

      toast.success(`Loaded: ${questions.length} questions, ${options.length} options, ${rules.length} rules, ${courses.length} courses`);

      // Create new draft version
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: latestVersion } = await supabase
        .from("fit_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      const { data: newVersion, error: versionError } = await supabase
        .from("fit_versions")
        .insert({
          version_number: nextVersion,
          status: "draft",
          created_by: user.id,
          notes: `Imported from Google Sheets`,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Insert questions
      const questionInserts = questions.map((q, idx) => ({
        version_id: newVersion.id,
        question_id: q.id || q.question_id,
        question_text: q.text || q.question,
        question_order: idx + 1,
      }));

      const { error: qError } = await supabase.from("fit_questions").insert(questionInserts);
      if (qError) throw qError;

      // Insert options
      const optionInserts = options.map(o => ({
        version_id: newVersion.id,
        question_id: o.question_id,
        option_id: o.id || o.option_id,
        option_text: o.text || o.option,
        weights: typeof o.weights === 'string' ? JSON.parse(o.weights || '{}') : o.weights,
      }));

      const { error: oError } = await supabase.from("fit_options").insert(optionInserts);
      if (oError) throw oError;

      // Insert rules
      const ruleInserts = rules.map((r, idx) => ({
        version_id: newVersion.id,
        rule_id: r.id || r.rule_id || `rule_${idx}`,
        course_id: r.course_id,
        expression: r.condition || r.expression,
        priority: r.priority || 0,
      }));

      const { error: rError } = await supabase.from("fit_rules").insert(ruleInserts);
      if (rError) throw rError;

      // Insert courses
      const courseInserts = courses.map(c => ({
        version_id: newVersion.id,
        course_id: c.id || c.course_id,
        course_name: c.name || c.course_name,
        description: c.description,
        career_paths: c.career_paths,
        colleges: c.colleges,
      }));

      const { error: cError } = await supabase.from("fit_courses").insert(courseInserts);
      if (cError) throw cError;

      // Insert UI copy
      const uiInserts = uiTexts.map(u => ({
        version_id: newVersion.id,
        ui_key: u.key || u.ui_key,
        ui_value: u.value || u.ui_value,
      }));

      if (uiInserts.length > 0) {
        const { error: uError } = await supabase.from("fit_ui_copy").insert(uiInserts);
        if (uError) throw uError;
      }

      toast.success("Import completed successfully!");
      setImportDialogOpen(false);
      await loadVersions();
      setSelectedVersion(newVersion.id);
    } catch (error) {
      console.error("Error importing:", error);
      toast.error("Failed to import data");
    } finally {
      setLoading(false);
    }
  };

  const publishVersion = async () => {
    if (!selectedVersion) return;

    try {
      // Archive current published version
      await supabase
        .from("fit_versions")
        .update({ status: "archived" })
        .eq("status", "published");

      // Publish selected version
      const { error } = await supabase
        .from("fit_versions")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", selectedVersion);

      if (error) throw error;

      toast.success("Version published successfully!");
      await loadVersions();
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish version");
    }
  };

  const currentVersion = versions.find(v => v.id === selectedVersion);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Fit Test CMS</h1>
          <p className="text-muted-foreground">Manage questions, options, rules, and courses</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import from Sheet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import from Google Sheets</DialogTitle>
                <DialogDescription>
                  This will create a new draft version with data from the published Google Sheet.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Source: Course Fit Test Dataset (CSV)
                </p>
                <Button onClick={importFromSheet} disabled={loading} className="w-full">
                  {loading ? "Importing..." : "Import Data"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={createNewDraft}>
            <Plus className="mr-2 h-4 w-4" />
            New Draft
          </Button>
          {currentVersion?.status === "draft" && (
            <Button onClick={publishVersion}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Version Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Version Control</CardTitle>
          <CardDescription>Select a version to view or edit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    v{version.version_number} - {version.status.toUpperCase()} 
                    {version.published_at && ` (${new Date(version.published_at).toLocaleDateString()})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentVersion && (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentVersion.status === 'published' ? 'bg-green-100 text-green-800' :
                  currentVersion.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentVersion.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      {selectedVersion && (
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
            <TabsTrigger value="options">Options ({options.length})</TabsTrigger>
            <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
            <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
            <TabsTrigger value="ui">UI Text ({uiCopy.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Manage test questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Question Text</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell>{q.question_order}</TableCell>
                        <TableCell className="font-mono text-sm">{q.question_id}</TableCell>
                        <TableCell>{q.question_text}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options">
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>Manage answer options and weights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question ID</TableHead>
                      <TableHead>Option ID</TableHead>
                      <TableHead>Option Text</TableHead>
                      <TableHead>Weights</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-sm">{o.question_id}</TableCell>
                        <TableCell className="font-mono text-sm">{o.option_id}</TableCell>
                        <TableCell>{o.option_text}</TableCell>
                        <TableCell className="font-mono text-xs">{JSON.stringify(o.weights)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>Rules</CardTitle>
                <CardDescription>Course recommendation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Expression</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-sm">{r.course_id}</TableCell>
                        <TableCell className="font-mono text-xs">{r.expression}</TableCell>
                        <TableCell>{r.priority}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Courses</CardTitle>
                <CardDescription>Course catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.course_id}</TableCell>
                        <TableCell className="font-medium">{c.course_name}</TableCell>
                        <TableCell className="max-w-md truncate">{c.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ui">
            <Card>
              <CardHeader>
                <CardTitle>UI Text</CardTitle>
                <CardDescription>Interface copy and labels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uiCopy.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono text-sm">{u.ui_key}</TableCell>
                        <TableCell>{u.ui_value}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CourseFitCMS;
