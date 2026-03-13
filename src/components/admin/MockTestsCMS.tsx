import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const MockTestsCMS = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadQuestions(selectedVersion);
    }
  }, [selectedVersion]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("mock_versions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
      
      if (data && data.length > 0) {
        setSelectedVersion(data[0].id);
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Failed to load versions");
    }
  };

  const loadQuestions = async (versionId: string) => {
    try {
      setLoading(true);
      const { data: questionsData, error: qError } = await supabase
        .from("mock_questions")
        .select("*")
        .eq("version_id", versionId)
        .order("question_number", { ascending: true });

      if (qError) throw qError;

      // Load options for all questions
      const questionIds = questionsData?.map(q => q.id) || [];
      const { data: optionsData, error: oError } = await supabase
        .from("mock_options")
        .select("*")
        .in("question_id", questionIds);

      if (oError) throw oError;

      setQuestions(questionsData || []);
      setOptions(optionsData || []);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const createNewDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: latestVersion } = await supabase
        .from("mock_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;
      const testName = `Mock Test ${nextVersion}`;

      const { data, error } = await supabase
        .from("mock_versions")
        .insert({
          version_number: nextVersion,
          test_name: testName,
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

  const publishVersion = async () => {
    if (!selectedVersion) return;

    try {
      await supabase
        .from("mock_versions")
        .update({ status: "archived" })
        .eq("status", "published");

      const { error } = await supabase
        .from("mock_versions")
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
  const getQuestionOptions = (questionId: string) => {
    return options.filter(o => o.question_id === questionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mock Tests CMS</h1>
          <p className="text-muted-foreground">Manage mock test questions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewDraft} variant="outline">
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
        </CardHeader>
        <CardContent>
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {version.test_name} - {version.status.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Questions Table */}
      {selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions ({questions.length})</CardTitle>
                <CardDescription>Mock test questions and options</CardDescription>
              </div>
              <Button onClick={() => toast.info("Question editor coming soon")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, idx) => {
                const questionOptions = getQuestionOptions(question.id);
                const correctOption = questionOptions.find(o => o.is_correct);
                
                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Q{question.question_number}. {question.question_text}
                          </CardTitle>
                          <CardDescription>
                            {question.subject && <span className="mr-2">Subject: {question.subject}</span>}
                            {question.difficulty && <span>Difficulty: {question.difficulty}</span>}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {questionOptions.map((option) => (
                          <div
                            key={option.id}
                            className={`p-3 rounded border ${
                              option.is_correct ? "bg-green-50 border-green-200" : "bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{option.option_letter}.</span>
                              <span>{option.option_text}</span>
                              {option.is_correct && (
                                <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {correctOption && (
                        <p className="text-sm text-muted-foreground mt-4">
                          Correct Answer: <span className="font-medium">{correctOption.option_letter}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MockTestsCMS;
