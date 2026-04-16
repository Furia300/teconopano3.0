import { supabase } from "../supabase";

const ESTOQUE_SELECT = `
  id,
  coletaId:coleta_id,
  producaoId:producao_id,
  produtoId:produto_id,
  qrCodeId:qr_code_id,
  descricaoProduto:descricao_produto,
  novaDescricao:nova_descricao,
  tipoMaterial:tipo_material,
  cor,
  medida,
  acabamento,
  kilo,
  unidade,
  pesoMedioPct:peso_medio_pct,
  unidadeMedida:unidade_medida,
  qtdeReservadaPacote:qtde_reservada_pacote,
  galpao,
  notaFiscal:nota_fiscal,
  nomeFantasia:nome_fantasia,
  razaoSocial:razao_social,
  cnpj,
  idCliente:id_cliente,
  status,
  statusMaterial:status_material,
  statusServico:status_servico,
  observacao,
  data,
  dataRetirada:data_retirada,
  createdAt:created_at
`.trim();

export interface EstoqueInput {
  coletaId?: string | null;
  producaoId?: string | null;
  produtoId?: string | null;
  descricaoProduto: string;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  kilo?: number | null;
  unidade?: number | null;
  pesoMedioPct?: number | null;
  unidadeMedida?: string | null;
  galpao?: string | null;
  status?: string | null;
  observacao?: string | null;
}

const CAMEL_TO_SNAKE: Record<string, string> = {
  coletaId: "coleta_id",
  producaoId: "producao_id",
  produtoId: "produto_id",
  qrCodeId: "qr_code_id",
  descricaoProduto: "descricao_produto",
  novaDescricao: "nova_descricao",
  tipoMaterial: "tipo_material",
  pesoMedioPct: "peso_medio_pct",
  unidadeMedida: "unidade_medida",
  qtdeReservadaPacote: "qtde_reservada_pacote",
  nomeFantasia: "nome_fantasia",
  razaoSocial: "razao_social",
  notaFiscal: "nota_fiscal",
  idCliente: "id_cliente",
  statusMaterial: "status_material",
  statusServico: "status_servico",
  dataRetirada: "data_retirada",
};

function toRow(input: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    row[CAMEL_TO_SNAKE[k] ?? k] = v ?? null;
  }
  return row;
}

export async function listEstoque() {
  const { data, error } = await supabase
    .from("estoque")
    .select(ESTOQUE_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getEstoque(id: string) {
  const { data, error } = await supabase
    .from("estoque")
    .select(ESTOQUE_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createEstoque(input: EstoqueInput) {
  const row = toRow({ status: "Pendente", ...input });
  const { data, error } = await supabase
    .from("estoque")
    .insert(row)
    .select(ESTOQUE_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateEstoque(id: string, patch: Record<string, unknown>) {
  const row = toRow(patch);
  const { data, error } = await supabase
    .from("estoque")
    .update(row)
    .eq("id", id)
    .select(ESTOQUE_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEstoque(id: string) {
  const { error } = await supabase.from("estoque").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}
