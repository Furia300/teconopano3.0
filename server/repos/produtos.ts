import { supabase } from "../supabase";

const PRODUTO_SELECT = `
  id,
  codigo,
  nome,
  descricao,
  tipoMaterial:tipo_material,
  cor,
  medida,
  acabamento,
  pesoMedio:peso_medio,
  unidadeMedida:unidade_medida,
  precoCusto:preco_custo,
  precoVenda:preco_venda,
  foto,
  notaFiscal:nota_fiscal,
  observacao,
  ativo,
  createdAt:created_at,
  updatedAt:updated_at
`.trim();

export interface ProdutoInput {
  codigo?: string | null;
  nome?: string | null;
  descricao: string;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  pesoMedio?: number | null;
  unidadeMedida?: string | null;
  precoCusto?: number | null;
  precoVenda?: number | null;
  foto?: string | null;
  notaFiscal?: string | null;
  observacao?: string | null;
  ativo?: boolean;
}

const CAMEL_TO_SNAKE: Record<string, string> = {
  tipoMaterial: "tipo_material",
  pesoMedio: "peso_medio",
  unidadeMedida: "unidade_medida",
  precoCusto: "preco_custo",
  precoVenda: "preco_venda",
  notaFiscal: "nota_fiscal",
};

function toRow(input: Partial<ProdutoInput> & Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    row[CAMEL_TO_SNAKE[k] ?? k] = v ?? null;
  }
  return row;
}

export async function listProdutos(includeInativos = false) {
  let q = supabase.from("produtos").select(PRODUTO_SELECT).order("nome").order("medida");
  if (!includeInativos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getProduto(id: string) {
  const { data, error } = await supabase
    .from("produtos")
    .select(PRODUTO_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProduto(input: ProdutoInput) {
  const row = toRow({ ativo: true, ...input });
  const { data, error } = await supabase
    .from("produtos")
    .insert(row)
    .select(PRODUTO_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduto(id: string, patch: Partial<ProdutoInput>) {
  const row = toRow(patch);
  const { data, error } = await supabase
    .from("produtos")
    .update(row)
    .eq("id", id)
    .select(PRODUTO_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduto(id: string) {
  const { error } = await supabase.from("produtos").update({ ativo: false }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}
