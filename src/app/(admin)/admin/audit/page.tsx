import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { timeAgo } from "@/lib/utils";
import type { AuditLog, Profile } from "@/types/database";

export const metadata = { title: "Audit Logs" };

export default async function AdminAuditPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("*, actor:profiles(full_name, phone, role)")
    .order("created_at", { ascending: false })
    .limit(200);

  const logs = (data ?? []) as unknown as (AuditLog & {
    actor: Pick<Profile, "full_name" | "phone" | "role"> | null;
  })[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No activity logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Badge variant="info">{l.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {l.entity_type ? `${l.entity_type}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {l.actor?.full_name || l.actor?.phone || "System"}
                      {l.actor?.role ? (
                        <span className="ml-1 text-xs capitalize text-muted-foreground">
                          ({l.actor.role})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {timeAgo(l.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
