import React, { useState, useEffect, useCallback } from "react";
import { authApi, type HeroLead, type TestingUser } from "@/lib/authApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";

type UnifiedRow = {
  id: string;
  source: "Hero form" | "Signed up";
  name: string;
  email: string;
  phone: string;
  date: string;
};

function toUnifiedRows(heroLeads: HeroLead[], users: TestingUser[]): UnifiedRow[] {
  const heroRows: UnifiedRow[] = heroLeads.map((h) => ({
    id: h.id,
    source: "Hero form" as const,
    name: h.name ?? "",
    email: h.email ?? "",
    phone: h.mobile ?? "",
    date: h.createdAt ? new Date(h.createdAt).toISOString() : "",
  }));
  const userRows: UnifiedRow[] = users.map((u) => ({
    id: u.id,
    source: "Signed up" as const,
    name: u.full_name ?? "",
    email: u.email ?? "",
    phone: u.phone ?? "",
    date: typeof u.created_at === "string" ? u.created_at : new Date(u.created_at).toISOString(),
  }));
  const combined = [...heroRows, ...userRows];
  combined.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return combined;
}

const Testing = () => {
  const [rows, setRows] = useState<UnifiedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.getTestingData();
      setRows(toUnifiedRows(data.heroLeads, data.users));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load data";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRows = rows.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.phone.includes(search)
    );
  });

  const handleExport = () => {
    const exportRows = filteredRows.map((r) => ({
      source: r.source,
      name: r.name,
      email: r.email,
      phone: r.phone,
      date: r.date ? new Date(r.date).toISOString() : "",
    }));
    exportToCSV(exportRows, "testing-hero-and-users.csv");
    toast.success("Exported to CSV");
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Testing data</h1>
            <p className="text-muted-foreground">
              Hero form submissions and signed-up users in one table
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>All entries ({filteredRows.length})</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button variant="outline" size="icon" onClick={loadData} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleExport} title="Export CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Combined view of hero/website form leads and registered users. Sorted by date (newest first).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-destructive">{error}</p>
                  <Button onClick={loadData}>Retry</Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-auto max-h-[70vh]">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80 hover:bg-muted/95">
                          <TableHead className="font-medium">Source</TableHead>
                          <TableHead className="font-medium">Name</TableHead>
                          <TableHead className="font-medium">Email</TableHead>
                          <TableHead className="font-medium">Phone</TableHead>
                          <TableHead className="font-medium">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No entries found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRows.map((r) => (
                            <TableRow key={`${r.source}-${r.id}`}>
                              <TableCell className="text-sm">{r.source}</TableCell>
                              <TableCell className="font-medium text-sm">{r.name || "—"}</TableCell>
                              <TableCell className="text-sm">{r.email || "—"}</TableCell>
                              <TableCell className="text-sm">{r.phone || "—"}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(r.date)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Testing;
