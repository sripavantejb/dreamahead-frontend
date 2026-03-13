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
import { Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ScholarshipsCMS = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [schemes, setSchemes] = useState<any[]>([]);
  const [editingScheme, setEditingScheme] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadSchemes(selectedVersion);
    }
  }, [selectedVersion]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("sch_versions")
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

  const loadSchemes = async (versionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sch_schemes")
        .select("*")
        .eq("version_id", versionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error("Error loading schemes:", error);
      toast.error("Failed to load schemes");
    } finally {
      setLoading(false);
    }
  };

  const createNewDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: latestVersion } = await supabase
        .from("sch_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from("sch_versions")
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

  const saveScheme = async (scheme: any) => {
    try {
      if (editingScheme?.id) {
        // Update existing
        const { error } = await supabase
          .from("sch_schemes")
          .update(scheme)
          .eq("id", editingScheme.id);

        if (error) throw error;
        toast.success("Scholarship updated");
      } else {
        // Insert new
        const { error } = await supabase
          .from("sch_schemes")
          .insert({ ...scheme, version_id: selectedVersion });

        if (error) throw error;
        toast.success("Scholarship added");
      }

      setDialogOpen(false);
      setEditingScheme(null);
      loadSchemes(selectedVersion);
    } catch (error) {
      console.error("Error saving scheme:", error);
      toast.error("Failed to save scholarship");
    }
  };

  const deleteScheme = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scholarship?")) return;

    try {
      const { error } = await supabase
        .from("sch_schemes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Scholarship deleted");
      loadSchemes(selectedVersion);
    } catch (error) {
      console.error("Error deleting scheme:", error);
      toast.error("Failed to delete scholarship");
    }
  };

  const publishVersion = async () => {
    if (!selectedVersion) return;

    try {
      await supabase
        .from("sch_versions")
        .update({ status: "archived" })
        .eq("status", "published");

      const { error } = await supabase
        .from("sch_versions")
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
          <h1 className="text-3xl font-bold">Scholarships CMS</h1>
          <p className="text-muted-foreground">Manage scholarship schemes</p>
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

      {/* Schemes Table */}
      {selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scholarship Schemes ({schemes.length})</CardTitle>
                <CardDescription>Manage active scholarships</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingScheme(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Scholarship
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingScheme ? "Edit" : "Add"} Scholarship</DialogTitle>
                  </DialogHeader>
                  <SchemeForm
                    scheme={editingScheme}
                    onSave={saveScheme}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingScheme(null);
                    }}
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
                    <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell className="font-medium">{scheme.scheme_name}</TableCell>
                    <TableCell>{scheme.category}</TableCell>
                    <TableCell>{scheme.state || "All India"}</TableCell>
                    <TableCell>{scheme.amount}</TableCell>
                    <TableCell>{scheme.deadline ? new Date(scheme.deadline).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingScheme(scheme);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScheme(scheme.id)}
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

const SchemeForm = ({ scheme, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    scheme_name: scheme?.scheme_name || "",
    category: scheme?.category || "",
    state: scheme?.state || "",
    deadline: scheme?.deadline || "",
    link: scheme?.link || "",
    amount: scheme?.amount || "",
    gender_focus: scheme?.gender_focus || "",
    eligibility_text: scheme?.eligibility_text || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheme_name">Scheme Name *</Label>
          <Input
            id="scheme_name"
            value={formData.scheme_name}
            onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender_focus">Gender Focus</Label>
          <Input
            id="gender_focus"
            value={formData.gender_focus}
            onChange={(e) => setFormData({ ...formData, gender_focus: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <Input
          id="link"
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="eligibility_text">Eligibility Criteria</Label>
        <Textarea
          id="eligibility_text"
          value={formData.eligibility_text}
          onChange={(e) => setFormData({ ...formData, eligibility_text: e.target.value })}
          rows={3}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

export default ScholarshipsCMS;
