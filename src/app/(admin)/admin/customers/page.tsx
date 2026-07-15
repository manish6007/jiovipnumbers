import { createAdminClient } from "@/lib/supabase/admin";
import { BlockToggle } from "@/components/dashboard/block-toggle";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database";

export const metadata = { title: "Manage Customers" };

export default async function AdminCustomersPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const profiles = (data ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers & Users</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                  <TableCell>{p.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={p.role === "admin" ? "premium" : p.role === "partner" ? "info" : "secondary"} className="capitalize">
                      {p.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_blocked ? "destructive" : "success"}>
                      {p.is_blocked ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {timeAgo(p.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.role !== "admin" && <BlockToggle userId={p.id} blocked={p.is_blocked} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
