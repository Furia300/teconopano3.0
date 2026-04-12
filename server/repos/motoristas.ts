import { supabase } from "../supabase";

const MOTORISTA_SELECT = `
  id,
  nome,
  cpf,
  cnh,
  categoriaCnh:categoria_cnh,
  validadeCnh:validade_cnh,
  telefone,
  whatsapp,
  email,
  veiculo,
  placa,
  capacidadeKg:capacidade_kg,
  observacao,
  foto,
  ativo,
  createdAt:created_at,
  updatedAt:updated_at
`.trim();

export interface MotoristaInput {
  nome: string;
  cpf?: string | null;
  cnh?: string | null;
  categoriaCnh?: string | null;
  validadeCnh?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  veiculo?: string | null;
  placa?: string | null;
  capacidadeKg?: number | null;
  observacao?: string | null;
  foto?: string | null;
  ativo?: boolean;
}

const CAMEL_TO_SNAKE: Record<string, string> = {
  categoriaCnh: "categoria_cnh",
  validadeCnh: "validade_cnh",
  capacidadeKg: "capacidade_kg",
};

function toRow(input: Partial<MotoristaInput> & Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    row[CAMEL_TO_SNAKE[k] ?? k] = v ?? null;
  }
  return row;
}

export async function listMotoristas(includeInativos = false) {
  let q = supabase.from("motoristas").select(MOTORISTA_SELECT).order("nome");
  if (!includeInativos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getMotorista(id: string) {
  const { data, error } = await supabase
    .from("motoristas")
    .select(MOTORISTA_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createMotorista(input: MotoristaInput) {
  const row = toRow({ ativo: true, ...input });
  const { data, error } = await supabase
    .from("motoristas")
    .insert(row)
    .select(MOTORISTA_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateMotorista(id: string, patch: Partial<MotoristaInput>) {
  const row = toRow(patch);
  const { data, error } = await supabase
    .from("motoristas")
    .update(row)
    .eq("id", id)
    .select(MOTORISTA_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMotorista(id: string) {
  const { error } = await supabase.from("motoristas").update({ ativo: false }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}
