import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

const ExamCalendarCMS = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadEvents(selectedVersion);
    }
  }, [selectedVersion]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("cal_versions")
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

  const loadEvents = async (versionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cal_events")
        .select("*")
        .eq("version_id", versionId)
        .order("exam_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const createNewDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: latestVersion } = await supabase
        .from("cal_versions")
        .select("version_number")
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from("cal_versions")
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

  const saveEvent = async (event: any) => {
    try {
      if (editingEvent?.id) {
        const { error } = await supabase
          .from("cal_events")
          .update(event)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Event updated");
      } else {
        const { error } = await supabase
          .from("cal_events")
          .insert({ ...event, version_id: selectedVersion });

        if (error) throw error;
        toast.success("Event added");
      }

      setDialogOpen(false);
      setEditingEvent(null);
      loadEvents(selectedVersion);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase
        .from("cal_events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Event deleted");
      loadEvents(selectedVersion);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const publishVersion = async () => {
    if (!selectedVersion) return;

    try {
      await supabase
        .from("cal_versions")
        .update({ status: "archived" })
        .eq("status", "published");

      const { error } = await supabase
        .from("cal_versions")
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
          <h1 className="text-3xl font-bold">Exam Calendar CMS</h1>
          <p className="text-muted-foreground">Manage exam dates and deadlines</p>
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

      {/* Events Table */}
      {selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Exam Events ({events.length})</CardTitle>
                <CardDescription>Upcoming exam dates</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingEvent(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? "Edit" : "Add"} Exam Event</DialogTitle>
                  </DialogHeader>
                  <EventForm
                    event={editingEvent}
                    onSave={saveEvent}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingEvent(null);
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
                    <TableHead>Exam Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.exam_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(event.exam_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{event.exam_type || "-"}</TableCell>
                    <TableCell>{event.region || "All India"}</TableCell>
                    <TableCell>
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEvent(event);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEvent(event.id)}
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

const EventForm = ({ event, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    exam_name: event?.exam_name || "",
    exam_date: event?.exam_date || "",
    exam_type: event?.exam_type || "",
    region: event?.region || "",
    link: event?.link || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="exam_name">Exam Name *</Label>
          <Input
            id="exam_name"
            value={formData.exam_name}
            onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exam_date">Date *</Label>
          <Input
            id="exam_date"
            type="date"
            value={formData.exam_date}
            onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exam_type">Type</Label>
          <Input
            id="exam_type"
            value={formData.exam_type}
            onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
            placeholder="e.g., Entrance, Board"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="e.g., All India, State"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://..."
          />
        </div>
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

export default ExamCalendarCMS;
