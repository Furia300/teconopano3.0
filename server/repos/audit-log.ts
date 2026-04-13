import { supabase } from "../supabase";

export type AuditAction =
  | "login" | "logout"
  | "password_change" | "profile_update"
  | "permission_grant" | "permission_revoke" | "permission_bulk_update"
  | "access_request" | "access_approve" | "access_deny"
  | "user_create" | "user_edit" | "user_deactivate" | "user_reactivate"
  | "password_reset";

interface LogEntry {
  userId?: string | null;
  userName?: string | null;
  action: AuditAction;
  resource?: string | null;
  details?: Record<string, unknown> | null;
  ip?: string | null;
}

export async function logAudit(entry: LogEntry) {
  const { error } = await supabase.from("audit_log").insert({
    user_id: entry.userId || null,
    user_name: entry.userName || null,
    action: entry.action,
    resource: entry.resource || null,
    details: entry.details ? JSON.stringify(entry.details) : null,
    ip: entry.ip || null,
  });
  if (error) console.error("[audit] Erro ao registrar:", error.message);
}

export async function listAuditLogs(filters?: {
  userId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  let q = supabase
    .from("audit_log")
    .select("id, user_id, user_name, action, resource, details, ip, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.userId) q = q.eq("user_id", filters.userId);
  if (filters?.action) q = q.eq("action", filters.action);
  q = q.range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data: data ?? [], total: count || 0 };
}
