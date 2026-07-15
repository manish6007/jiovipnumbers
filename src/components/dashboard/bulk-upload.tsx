"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { bulkCreateNumbers } from "@/app/actions/numbers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ParsedRow {
  mobileNumber: string;
  operator?: string;
  state?: string;
  circle?: string;
  sellingPrice: number;
  description?: string;
  categorySlug?: string;
}

const TEMPLATE_HEADERS = [
  "mobile_number",
  "operator",
  "state",
  "circle",
  "category_slug",
  "selling_price",
  "description",
];

export function BulkUpload() {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [pending, startTransition] = useTransition();

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ["9876543210", "Jio", "Maharashtra", "Mumbai", "fancy", "25000", "Premium number"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Numbers");
    XLSX.writeFile(wb, "jiovip-bulk-template.xlsx");
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    const parsed: ParsedRow[] = json
      .map((r) => {
        const get = (k: string) =>
          String(r[k] ?? r[k.toLowerCase()] ?? r[k.toUpperCase()] ?? "").trim();
        return {
          mobileNumber: get("mobile_number") || get("number") || get("mobile"),
          operator: get("operator") || "Jio",
          state: get("state"),
          circle: get("circle"),
          categorySlug: get("category_slug") || get("category"),
          sellingPrice: Number(get("selling_price") || get("price")) || 0,
          description: get("description"),
        };
      })
      .filter((r) => r.mobileNumber);

    setRows(parsed);
    if (!parsed.length) {
      toast({ variant: "destructive", title: "No valid rows found in file" });
    }
  }

  function upload() {
    startTransition(async () => {
      const res = await bulkCreateNumbers(rows);
      if (res.errors.length) {
        toast({ variant: "destructive", title: res.errors[0] });
      }
      setResult({ inserted: res.inserted, skipped: res.skipped });
      toast({
        variant: "success",
        title: `${res.inserted} listings submitted`,
        description: res.skipped ? `${res.skipped} rows skipped (invalid/duplicate).` : undefined,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-blue-500">
            <FileSpreadsheet className="h-7 w-7" />
          </span>
          <div>
            <h3 className="font-semibold">Upload CSV or Excel</h3>
            <p className="text-sm text-muted-foreground">
              Columns: mobile_number, operator, state, circle, category_slug,
              selling_price, description
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4" /> Download template
            </Button>
            <label>
              <Button asChild variant="gradient">
                <span className="cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" /> Choose file
                </span>
              </Button>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          </div>
          {fileName && <p className="text-xs text-muted-foreground">Selected: {fileName}</p>}
        </CardContent>
      </Card>

      {rows.length > 0 && !result && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">{rows.length} rows detected</p>
              <Button variant="gradient" onClick={upload} disabled={pending}>
                {pending ? "Uploading…" : `Submit ${rows.length} numbers`}
              </Button>
            </div>
            <div className="max-h-64 overflow-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60">
                  <tr>
                    <th className="p-2 text-left">Number</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Operator</th>
                    <th className="p-2 text-left">Circle</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-mono">{r.mobileNumber}</td>
                      <td className="p-2">₹{r.sellingPrice}</td>
                      <td className="p-2">{r.operator}</td>
                      <td className="p-2">{r.circle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="font-semibold">{result.inserted} listings submitted for approval</p>
            {result.skipped > 0 && (
              <p className="text-sm text-muted-foreground">
                {result.skipped} rows skipped (invalid or duplicate numbers)
              </p>
            )}
            <Button variant="outline" onClick={() => router.push("/partner/listings")}>
              View listings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
