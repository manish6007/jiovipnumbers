import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Create in-app notifications for one or more users (service role). */
export async function notify(
  entries: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    link?: string;
    metadata?: Record<string, unknown>;
  }[],
) {
  if (!entries.length) return;
  const admin = createAdminClient();
  await admin.from("notifications").insert(
    entries.map((e) => ({
      user_id: e.userId,
      type: e.type,
      title: e.title,
      body: e.body ?? null,
      link: e.link ?? null,
      metadata: e.metadata ?? null,
    })),
  );
}

/** Record an audit-log entry (service role). */
export async function audit(entry: {
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    actor_id: entry.actorId ?? null,
    action: entry.action,
    entity_type: entry.entityType ?? null,
    entity_id: entry.entityId ?? null,
    metadata: entry.metadata ?? null,
  });
}

/** All admin user ids (for fan-out notifications). */
export async function getAdminIds(): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("role", "admin");
  return (data ?? []).map((r) => r.id as string);
}
