import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, CheckCircle, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

const PapersCMS = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [papers, setPapers] = useState<any[]>([]);
  const [editingPaper, setEditingPaper] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadPapers(selectedVersion);
    }
  }, [selectedVersion]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("papers_versions")
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

  const loadPapers = async (versionId: string) => {
    try {
      const { data, error } = await supabase
        .from("papers_index")
        .select("*")
        .eq("version_id", versionId)
        .order("exam_year", { ascending: false });

      if (error) throw error;
      setPapers(data || []);
    } catch (error) {
      console.error("Error loading papers:", error);
      toast.error("Failed to load papers");
    }
  };

  const createNewDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: latestVersion } = await supabase
        .from("papers_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from("papers_versions")
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

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('papers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('papers')
        .getPublicUrl(filePath);

      return { url: publicUrl, fileName: file.name };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const savePaper = async (paper: any, file?: File) => {
    try {
      let fileUrl = paper.file_url;
      let fileName = paper.file_name;

      if (file) {
        const uploaded = await uploadFile(file);
        fileUrl = uploaded.url;
        fileName = uploaded.fileName;
      }

      if (editingPaper?.id) {
        const { error } = await supabase
          .from("papers_index")
          .update({ ...paper, file_url: fileUrl, file_name: fileName })
          .eq("id", editingPaper.id);

        if (error) throw error;
        toast.success("Paper updated");
      } else {
        const { error } = await supabase
          .from("papers_index")
          .insert({ 
            ...paper, 
            version_id: selectedVersion,
            file_url: fileUrl,
            file_name: fileName 
          });

        if (error) throw error;
        toast.success("Paper added");
      }

      setDialogOpen(false);
      setEditingPaper(null);
      loadPapers(selectedVersion);
    } catch (error) {
      console.error("Error saving paper:", error);
      toast.error("Failed to save paper");
    }
  };

  const deletePaper = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;

    try {
      // Delete from storage
      const filePath = fileUrl.split('/').pop();
      if (filePath) {
        await supabase.storage.from('papers').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from("papers_index")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Paper deleted");
      loadPapers(selectedVersion);
    } catch (error) {
      console.error("Error deleting paper:", error);
      toast.error("Failed to delete paper");
    }
  };

  const publishVersion = async () => {
    if (!selectedVersion) return;

    try {
      await supabase
        .from("papers_versions")
        .update({ status: "archived" })
        .eq("status", "published");

      const { error } = await supabase
        .from("papers_versions")
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
          <h1 className="text-3xl font-bold">Previous Papers CMS</h1>
          <p className="text-muted-foreground">Manage previous year question papers</p>
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
                  v{version.version_number} - {version.status.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Papers Table */}
      {selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Papers ({papers.length})</CardTitle>
                <CardDescription>Previous year question papers</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingPaper(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Paper
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingPaper ? "Edit" : "Add"} Paper</DialogTitle>
                  </DialogHeader>
                  <PaperForm
                    paper={editingPaper}
                    onSave={savePaper}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingPaper(null);
                    }}
                    uploading={uploading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell className="font-medium">{paper.exam_name}</TableCell>
                    <TableCell>{paper.exam_year}</TableCell>
                    <TableCell>{paper.subject || "-"}</TableCell>
                    <TableCell>
                      <a 
                        href={paper.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        {paper.file_name}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPaper(paper);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePaper(paper.id, paper.file_url)}
                        >
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
      )}
    </div>
  );
};

const PaperForm = ({ paper, onSave, onCancel, uploading }: any) => {
  const [formData, setFormData] = useState({
    exam_name: paper?.exam_name || "",
    exam_year: paper?.exam_year || new Date().getFullYear(),
    subject: paper?.subject || "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paper && !file) {
      toast.error("Please select a file");
      return;
    }
    onSave(formData, file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exam_name">Exam Name *</Label>
          <Input
            id="exam_name"
            value={formData.exam_name}
            onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exam_year">Year *</Label>
          <Input
            id="exam_year"
            type="number"
            value={formData.exam_year}
            onChange={(e) => setFormData({ ...formData, exam_year: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="file">Upload PDF {!paper && "*"}</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required={!paper}
          />
          {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default PapersCMS;
