import { supabase } from "../supabase";

const USER_SELECT = `
  id,
  username,
  nome,
  email,
  cargo,
  departamento,
  matricula,
  whatsapp,
  foto,
  perfil,
  acesso,
  podeGerenciarUsuarios:pode_gerenciar_usuarios,
  createdAt:created_at,
  updatedAt:updated_at
`.trim();

export async function listUsers(includeInactive = false) {
  let q = supabase.from("users").select(USER_SELECT).order("nome");
  if (!includeInactive) q = q.eq("acesso", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getUser(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createUser(input: {
  username: string;
  password: string;
  nome: string;
  email?: string;
  cargo?: string;
  departamento?: string;
  matricula?: string;
  whatsapp?: string;
  perfil?: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .insert({
      username: input.username,
      password: input.password, // em produção, hash com bcrypt
      nome: input.nome,
      email: input.email || null,
      cargo: input.cargo || null,
      departamento: input.departamento || null,
      matricula: input.matricula || null,
      whatsapp: input.whatsapp || null,
      perfil: input.perfil || "galpao",
      acesso: true,
    })
    .select(USER_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUser(id: string, patch: Record<string, unknown>) {
  const allowed: Record<string, string> = {
    nome: "nome",
    email: "email",
    cargo: "cargo",
    departamento: "departamento",
    matricula: "matricula",
    whatsapp: "whatsapp",
    foto: "foto",
    perfil: "perfil",
    acesso: "acesso",
    podeGerenciarUsuarios: "pode_gerenciar_usuarios",
  };

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(patch)) {
    if (allowed[k]) row[allowed[k]] = v;
  }

  const { data, error } = await supabase
    .from("users")
    .update(row)
    .eq("id", id)
    .select(USER_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateUser(id: string) {
  return updateUser(id, { acesso: false });
}

export async function reactivateUser(id: string) {
  return updateUser(id, { acesso: true });
}

export async function changePassword(id: string, newPassword: string) {
  const { error } = await supabase
    .from("users")
    .update({ password: newPassword, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function verifyPassword(id: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("password")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data?.password === password;
}

export async function getAdminWhatsappNumbers(): Promise<string[]> {
  const { data } = await supabase
    .from("users")
    .select("whatsapp")
    .eq("perfil", "administrador")
    .eq("acesso", true)
    .not("whatsapp", "is", null);
  return (data ?? []).map((u) => u.whatsapp).filter(Boolean) as string[];
}
