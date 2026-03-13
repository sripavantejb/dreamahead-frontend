import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const LeadsCMS = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);

      // Load leads with user info
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;

      // Load user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*");

      if (profilesError) throw profilesError;

      setLeads(leadsData || []);
      setProfiles(profilesData || []);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const getProfile = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  const filteredLeads = leads.filter(lead => {
    const profile = getProfile(lead.user_id);
    if (!profile) return false;
    
    const searchLower = search.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(searchLower) ||
      profile.phone?.includes(search) ||
      profile.email?.toLowerCase().includes(searchLower) ||
      lead.topic?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      new: { variant: "default", label: "New" },
      contacted: { variant: "secondary", label: "Contacted" },
      converted: { variant: "default", label: "Converted" },
      closed: { variant: "outline", label: "Closed" },
    };
    
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-12">Loading leads...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <p className="text-muted-foreground">View and manage student leads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            <Input
              placeholder="Search by name, phone, email, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => {
                const profile = getProfile(lead.user_id);
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{profile?.name || "-"}</TableCell>
                    <TableCell>
                      {profile?.phone && (
                        <a href={`tel:${profile.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                          <Phone className="h-3 w-3" />
                          {profile.phone}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile?.email && (
                        <a href={`mailto:${profile.email}`} className="flex items-center gap-1 text-primary hover:underline">
                          <Mail className="h-3 w-3" />
                          {profile.email}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{lead.topic}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsCMS;
