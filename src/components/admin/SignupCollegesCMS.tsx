import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export const SignupCollegesCMS = () => {
  const [csvUrl, setCsvUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      
      rows.push(row);
    }

    return rows;
  };

  const handleImport = async () => {
    if (!csvUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a CSV URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Fetch CSV
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }

      const csvText = await response.text();
      const rows = parseCSV(csvText);

      if (rows.length === 0) {
        throw new Error("No data found in CSV");
      }

      const importResult: ImportResult = {
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [],
      };

      // Process each row
      for (const row of rows) {
        if (!row.college_name) {
          importResult.skipped++;
          continue;
        }

        try {
          const payload = {
            college_name: row.college_name,
            state: row.state || null,
            stream: row.stream || null,
          };

          // Upsert (insert or update on conflict)
          const { error } = await supabase
            .from("signup_colleges_dataset")
            .upsert(payload, {
              onConflict: "college_name,state",
              ignoreDuplicates: false,
            });

          if (error) {
            importResult.errors.push(
              `${row.college_name}: ${error.message}`
            );
            importResult.skipped++;
          } else {
            importResult.inserted++;
          }
        } catch (err: any) {
          importResult.errors.push(
            `${row.college_name}: ${err.message}`
          );
          importResult.skipped++;
        }
      }

      setResult(importResult);

      if (importResult.errors.length === 0) {
        toast({
          title: "Import Successful",
          description: `Imported ${importResult.inserted} colleges`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `${importResult.inserted} imported, ${importResult.skipped} skipped`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Signup Colleges from CSV</CardTitle>
          <CardDescription>
            Import college data from a published Google Sheet or CSV URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvUrl">CSV URL</Label>
            <Input
              id="csvUrl"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Expected columns: college_name, state, stream
            </p>
          </div>

          <Button
            onClick={handleImport}
            disabled={loading || !csvUrl.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Colleges
              </>
            )}
          </Button>

          {result && (
            <Alert
              variant={result.errors.length === 0 ? "default" : "destructive"}
            >
              {result.errors.length === 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Import Summary</div>
                  <div className="text-sm space-y-1">
                    <div>✓ Inserted: {result.inserted}</div>
                    <div>↻ Updated: {result.updated}</div>
                    <div>⊗ Skipped: {result.skipped}</div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium text-sm mb-1">Errors:</div>
                      <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                        {result.errors.slice(0, 10).map((error, i) => (
                          <div key={i} className="text-muted-foreground">
                            {error}
                          </div>
                        ))}
                        {result.errors.length > 10 && (
                          <div className="text-muted-foreground">
                            ... and {result.errors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
            {`college_name,state,stream
IIT Bombay,Maharashtra,Engineering
IIT Delhi,Delhi,Engineering
IIM Ahmedabad,Gujarat,Management`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
