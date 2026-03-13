import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, CheckCircle, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { parseCSV } from "@/lib/sheetUtils";

const SIGNUP_COLLEGES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7Ww7dz2wsKrJ_hjxBiHeat3Et711C-p30QmtErUtUa_We4BGs0IAbHN3v3qP1DQ/pub?output=csv";

const CollegesCMS = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [colleges, setColleges] = useState<any[]>([]);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadColleges(selectedVersion);
    }
  }, [selectedVersion]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("cat_versions")
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

  const loadColleges = async (versionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cat_colleges")
        .select("*")
        .eq("version_id", versionId)
        .order("college_name", { ascending: true });

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error("Error loading colleges:", error);
      toast.error("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  const createNewDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: latestVersion } = await supabase
        .from("cat_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from("cat_versions")
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

      const response = await fetch(SIGNUP_COLLEGES_SHEET_URL, { cache: "no-store" });
      const csvText = await response.text();
      const data = parseCSV(csvText);

      const colleges = data.filter(row => row.type === "college" || !row.type);

      toast.success(`Loaded ${colleges.length} colleges`);

      // Create new draft version
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: latestVersion } = await supabase
        .from("cat_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      const { data: newVersion, error: versionError } = await supabase
        .from("cat_versions")
        .insert({
          version_number: nextVersion,
          status: "draft",
          created_by: user.id,
          notes: `Imported from Google Sheets`,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Insert colleges
      const collegeInserts = colleges.map(c => ({
        version_id: newVersion.id,
        college_name: c.name || c.college_name || c.college,
        state: c.state,
        branch: c.branch || c.stream,
        cutoff: c.cutoff ? parseFloat(c.cutoff) : null,
        rank_range: c.rank || c.rank_range,
        placement_rate: c.placement ? parseFloat(c.placement) : null,
      }));

      const { error: cError } = await supabase.from("cat_colleges").insert(collegeInserts);
      if (cError) throw cError;

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
      await supabase
        .from("cat_versions")
        .update({ status: "archived" })
        .eq("status", "published");

      const { error } = await supabase
        .from("cat_versions")
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
  const filteredColleges = colleges.filter(c => 
    c.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colleges Catalog CMS</h1>
          <p className="text-muted-foreground">Manage college master list</p>
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
                  Source: Signup Colleges Dataset (CSV)
                </p>
                <Button onClick={importFromSheet} disabled={loading} className="w-full">
                  {loading ? "Importing..." : "Import Data"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Colleges Table */}
      {selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle>Colleges ({filteredColleges.length} / {colleges.length})</CardTitle>
                <CardDescription>
                  <Input
                    placeholder="Search by name, state, or branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md mt-2"
                  />
                </CardDescription>
              </div>
              <Button onClick={() => toast.info("Add college form coming soon")}>
                <Plus className="mr-2 h-4 w-4" />
                Add College
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Cutoff</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Placement %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColleges.slice(0, 100).map((college) => (
                  <TableRow key={college.id}>
                    <TableCell className="font-medium">{college.college_name}</TableCell>
                    <TableCell>{college.state || "-"}</TableCell>
                    <TableCell>{college.branch || "-"}</TableCell>
                    <TableCell>{college.cutoff || "-"}</TableCell>
                    <TableCell>{college.rank_range || "-"}</TableCell>
                    <TableCell>{college.placement_rate ? `${college.placement_rate}%` : "-"}</TableCell>
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
            {filteredColleges.length > 100 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Showing first 100 results. Use search to filter.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollegesCMS;
