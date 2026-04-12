import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso server-side.
 *
 * Usa a `service_role` key (bypass RLS) — NUNCA expor no front-end.
 * O cliente do browser deve usar `SUPABASE_ANON_KEY` + RLS habilitado.
 *
 * Projeto: ikobqxcdluuelyndufxv
 */

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is required (set in .env)");
}
if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required (set in .env)");
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/** Helper para executar SQL arbitrário via RPC `exec_sql` (definida no DDL inicial). */
export async function execSql(sql: string): Promise<{ data: unknown; error: unknown }> {
  return supabase.rpc("exec_sql", { sql_text: sql });
}
