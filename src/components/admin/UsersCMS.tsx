import React, { useState, useEffect } from "react";
import { authApi } from "@/lib/authApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string;
  created_at: string;
};

const UsersCMS = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await authApi.listUsers();
      setUsers(
        list.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          created_at: typeof u.created_at === "string" ? u.created_at : new Date(u.created_at).toISOString(),
        }))
      );
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      (u.full_name?.toLowerCase().includes(s) ?? false) ||
      (u.email?.toLowerCase().includes(s) ?? false) ||
      u.phone.includes(search)
    );
  });

  const handleExport = () => {
    const rows = filteredUsers.map((u) => ({
      id: u.id,
      full_name: u.full_name ?? "",
      email: u.email ?? "",
      phone: u.phone,
      created_at: u.created_at ? new Date(u.created_at).toISOString() : "",
    }));
    exportToCSV(rows, "signed-up-users.csv");
  };

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Signed-up Users</h1>
        <p className="text-muted-foreground">View and export users who have created an account</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" size="icon" onClick={handleExport} title="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Profiles with email and phone from signup and usage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Signed up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                      <TableCell>{u.email ?? "—"}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersCMS;
