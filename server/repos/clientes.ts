import { supabase } from "../supabase";

const CLIENTE_SELECT = `
  id,
  codigoLegado:codigo_legado,
  nomeFantasia:nome_fantasia,
  razaoSocial:razao_social,
  cnpj,
  endereco,
  bairro,
  cidade,
  estado,
  cep,
  contato,
  email,
  observacao,
  dataRetirada:data_retirada,
  ativo,
  createdAt:created_at,
  updatedAt:updated_at
`.trim();

export interface ClienteInput {
  nomeFantasia: string;
  razaoSocial?: string | null;
  tipo?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  contato?: string | null;
  email?: string | null;
  observacao?: string | null;
  dataRetirada?: string | null;
  ativo?: boolean;
}

const CAMEL_TO_SNAKE: Record<string, string> = {
  nomeFantasia: "nome_fantasia",
  razaoSocial: "razao_social",
  dataRetirada: "data_retirada",
};

function toRow(input: Partial<ClienteInput> & Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    row[CAMEL_TO_SNAKE[k] ?? k] = v ?? null;
  }
  return row;
}

export async function listClientes(includeInativos = false) {
  let q = supabase.from("clientes").select(CLIENTE_SELECT).order("nome_fantasia");
  if (!includeInativos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getCliente(id: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select(CLIENTE_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCliente(input: ClienteInput) {
  const row = toRow({ ativo: true, ...input });
  const { data, error } = await supabase
    .from("clientes")
    .insert(row)
    .select(CLIENTE_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateCliente(id: string, patch: Partial<ClienteInput>) {
  const row = toRow(patch);
  const { data, error } = await supabase
    .from("clientes")
    .update(row)
    .eq("id", id)
    .select(CLIENTE_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCliente(id: string) {
  // soft delete (mantém histórico)
  const { error } = await supabase.from("clientes").update({ ativo: false }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}
