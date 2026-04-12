import { supabase } from "../supabase";

const FORN_SELECT = `
  id,
  nome,
  razaoSocial:razao_social,
  cnpj,
  endereco,
  cidade,
  estado,
  cep,
  telefone,
  contato,
  email,
  statusServico:status_servico,
  ativo,
  createdAt:created_at,
  updatedAt:updated_at
`.trim();

export interface FornecedorInput {
  nome: string;
  razaoSocial?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  contato?: string | null;
  email?: string | null;
  ativo?: boolean;
}

const CAMEL_TO_SNAKE: Record<string, string> = {
  razaoSocial: "razao_social",
  statusServico: "status_servico",
};

function toRow(input: Partial<FornecedorInput> & Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    row[CAMEL_TO_SNAKE[k] ?? k] = v ?? null;
  }
  return row;
}

export async function listFornecedores(includeInativos = false) {
  let q = supabase.from("fornecedores").select(FORN_SELECT).order("nome");
  if (!includeInativos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getFornecedor(id: string) {
  const { data, error } = await supabase
    .from("fornecedores")
    .select(FORN_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createFornecedor(input: FornecedorInput) {
  const row = toRow({ ativo: true, ...input });
  const { data, error } = await supabase
    .from("fornecedores")
    .insert(row)
    .select(FORN_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateFornecedor(id: string, patch: Partial<FornecedorInput>) {
  const row = toRow(patch);
  const { data, error } = await supabase
    .from("fornecedores")
    .update(row)
    .eq("id", id)
    .select(FORN_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteFornecedor(id: string) {
  // soft delete (mantém histórico para coletas que referenciam este fornecedor)
  const { error } = await supabase.from("fornecedores").update({ ativo: false }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}
