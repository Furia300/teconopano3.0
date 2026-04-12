import { supabase } from "../supabase";

const EXPEDICAO_SELECT = `
  id,
  clienteId:cliente_id,
  estoqueOrigemId:estoque_origem_id,
  produtoId:produto_id,
  nomeFantasia:nome_fantasia,
  razaoSocial:razao_social,
  cnpj,
  contato,
  email,
  endereco,
  descricaoProduto:descricao_produto,
  tipoMaterial:tipo_material,
  cor,
  medida,
  acabamento,
  estilo,
  unidadeMedida:unidade_medida,
  kilo,
  kiloSolicitada:kilo_solicitada,
  unidade,
  qtdePedido:qtde_pedido,
  qtdeEstoque:qtde_estoque,
  qtdePctSolicitada:qtde_pct_solicitada,
  pesoMedioTara:peso_medio_tara,
  statusPedido:status_pedido,
  statusEntrega:status_entrega,
  statusFinanceiro:status_financeiro,
  statusNota:status_nota,
  statusMaterial:status_material,
  galpao,
  rota,
  prioridade,
  periodicidade,
  notaFiscal:nota_fiscal,
  dataEmissaoNota:data_emissao_nota,
  dataEntrega:data_entrega,
  observacaoEscritorio:observacao_escritorio,
  observacaoGalpao:observacao_galpao,
  createdAt:created_at,
  updatedAt:updated_at
`.trim();

export interface ExpedicaoInput {
  clienteId?: string | null;
  produtoId?: string | null;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  descricaoProduto?: string | null;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  unidadeMedida?: string | null;
  kilo?: number | null;
  qtdePedido?: number | null;
  qtdeEstoque?: number | null;
  galpao?: string | null;
  rota?: string | null;
  prioridade?: string | null;
  periodicidade?: string | null;
  dataEntrega?: string | null;
  observacaoEscritorio?: string | null;
  observacaoGalpao?: string | null;
}

const CAMEL_TO_SNAKE: Record<string, string> = {
  clienteId: "cliente_id",
  produtoId: "produto_id",
  nomeFantasia: "nome_fantasia",
  razaoSocial: "razao_social",
  descricaoProduto: "descricao_produto",
  tipoMaterial: "tipo_material",
  unidadeMedida: "unidade_medida",
  qtdePedido: "qtde_pedido",
  qtdeEstoque: "qtde_estoque",
  pesoMedioTara: "peso_medio_tara",
  statusEntrega: "status_entrega",
  statusFinanceiro: "status_financeiro",
  statusNota: "status_nota",
  dataEmissaoNota: "data_emissao_nota",
  dataEntrega: "data_entrega",
  observacaoEscritorio: "observacao_escritorio",
  observacaoGalpao: "observacao_galpao",
};

function toRow(input: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    row[CAMEL_TO_SNAKE[k] ?? k] = v ?? null;
  }
  return row;
}

export async function listExpedicoes() {
  const { data, error } = await supabase
    .from("expedicoes")
    .select(EXPEDICAO_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getExpedicao(id: string) {
  const { data, error } = await supabase
    .from("expedicoes")
    .select(EXPEDICAO_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createExpedicao(input: ExpedicaoInput) {
  const row = toRow({
    statusEntrega: "pendente",
    statusFinanceiro: "pendente_aprovacao",
    statusNota: "pendente_emissao",
    ...input,
  });
  const { data, error } = await supabase
    .from("expedicoes")
    .insert(row)
    .select(EXPEDICAO_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateExpedicao(id: string, patch: Record<string, unknown>) {
  const row = toRow(patch);
  const { data, error } = await supabase
    .from("expedicoes")
    .update(row)
    .eq("id", id)
    .select(EXPEDICAO_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpedicao(id: string) {
  const { error } = await supabase.from("expedicoes").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

/**
 * REGRA R2 (nota 69 do learning folder Bubble):
 * Calcula stock disponível para um produto = total - reservado.
 * O cliente da Michele usa isto para mostrar quanto pode pedir sem mandar produzir.
 */
export async function getDisponibilidade(produtoId: string, galpao?: string) {
  let q = supabase
    .from("estoque")
    .select("kilo, unidade, qtde_reservada_pacote, galpao")
    .eq("produto_id", produtoId);
  if (galpao) q = q.eq("galpao", galpao);
  const { data, error } = await q;
  if (error) throw error;

  const totals = (data ?? []).reduce(
    (acc, e) => ({
      kiloTotal: acc.kiloTotal + (e.kilo ?? 0),
      unidadeTotal: acc.unidadeTotal + (e.unidade ?? 0),
      reservado: acc.reservado + (e.qtde_reservada_pacote ?? 0),
    }),
    { kiloTotal: 0, unidadeTotal: 0, reservado: 0 },
  );
  return {
    produtoId,
    galpao: galpao ?? null,
    kiloTotal: totals.kiloTotal,
    unidadeTotal: totals.unidadeTotal,
    reservado: totals.reservado,
    unidadeDisponivel: Math.max(0, totals.unidadeTotal - totals.reservado),
  };
}
