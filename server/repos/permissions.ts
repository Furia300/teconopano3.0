import { supabase } from "../supabase";

export async function listPermissions(userId: string) {
  const { data, error } = await supabase
    .from("permissions")
    .select("id, resource, granted, granted_at, revoked_at")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .eq("granted", true);
  if (error) throw error;
  return data ?? [];
}

export async function getGrantedResources(userId: string): Promise<string[]> {
  const perms = await listPermissions(userId);
  return perms.map((p) => p.resource);
}

export async function grantPermission(userId: string, resource: string, grantedBy: string) {
  // Revoke existing if any
  await supabase
    .from("permissions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("resource", resource)
    .is("revoked_at", null);

  const { data, error } = await supabase
    .from("permissions")
    .insert({
      user_id: userId,
      resource,
      granted: true,
      granted_by: grantedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function revokePermission(userId: string, resource: string) {
  const { error } = await supabase
    .from("permissions")
    .update({ revoked_at: new Date().toISOString(), granted: false })
    .eq("user_id", userId)
    .eq("resource", resource)
    .is("revoked_at", null);
  if (error) throw error;
  return { ok: true };
}

export async function setPermissions(userId: string, resources: string[], grantedBy: string) {
  // Revoke all current
  await supabase
    .from("permissions")
    .update({ revoked_at: new Date().toISOString(), granted: false })
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (resources.length === 0) return [];

  const rows = resources.map((resource) => ({
    user_id: userId,
    resource,
    granted: true,
    granted_by: grantedBy,
  }));

  const { data, error } = await supabase
    .from("permissions")
    .insert(rows)
    .select();
  if (error) throw error;
  return data ?? [];
}
