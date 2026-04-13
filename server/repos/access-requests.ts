import { supabase } from "../supabase";

const SELECT = `
  id,
  userId:user_id,
  resource,
  motivo,
  status,
  respondedBy:responded_by,
  respondedAt:responded_at,
  motivoResposta:motivo_resposta,
  createdAt:created_at
`.trim();

const SELECT_WITH_USER = `
  id,
  userId:user_id,
  resource,
  motivo,
  status,
  respondedBy:responded_by,
  respondedAt:responded_at,
  motivoResposta:motivo_resposta,
  createdAt:created_at
`.trim();

export async function createAccessRequest(userId: string, resource: string, motivo: string) {
  const { data, error } = await supabase
    .from("access_requests")
    .insert({ user_id: userId, resource, motivo })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function listPendingRequests() {
  const { data, error } = await supabase
    .from("access_requests")
    .select(SELECT_WITH_USER)
    .eq("status", "pendente")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllRequests(limit = 50) {
  const { data, error } = await supabase
    .from("access_requests")
    .select(SELECT_WITH_USER)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function approveRequest(requestId: string, respondedBy: string) {
  const { data, error } = await supabase
    .from("access_requests")
    .update({
      status: "aprovado",
      responded_by: respondedBy,
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function denyRequest(requestId: string, respondedBy: string, motivoResposta?: string) {
  const { data, error } = await supabase
    .from("access_requests")
    .update({
      status: "negado",
      responded_by: respondedBy,
      responded_at: new Date().toISOString(),
      motivo_resposta: motivoResposta || null,
    })
    .eq("id", requestId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}
