import { supabase } from "../supabase";

/**
 * Repositório de Coletas — usa supabase-js para CRUD via PostgREST.
 * Mapeia snake_case (Postgres) ↔ camelCase (API JSON) através do alias `<alias>:<column>` do PostgREST.
 */

const COLETA_SELECT = `
  id,
  numero,
  fornecedorId:fornecedor_id,
  nomeFantasia:nome_fantasia,
  razaoSocial:razao_social,
  cnpjFornecedor:cnpj_fornecedor,
  notaFiscal:nota_fiscal,
  pesoTotalNF:peso_total_nf,
  pesoTotalAtual:peso_total_atual,
  dataPedido:data_pedido,
  dataChegada:data_chegada,
  galpao,
  status,
  statusServico:status_servico,
  observacao,
  recorrencia,
  createdAt:created_at
`.trim();

export interface ColetaInput {
  fornecedorId: string;
  nomeFantasia?: string;
  razaoSocial?: string;
  cnpjFornecedor?: string;
  notaFiscal?: string;
  pesoTotalNF?: number;
  dataChegada?: string | null;
  galpao?: string;
  observacao?: string;
  recorrencia?: string | null;
}

export async function listColetas() {
  const { data, error } = await supabase
    .from("coletas")
    .select(COLETA_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getColeta(id: string) {
  const { data, error } = await supabase
    .from("coletas")
    .select(COLETA_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function nextNumero(): Promise<number> {
  // Pega o maior `numero` atual e soma 1
  const { data, error } = await supabase
    .from("coletas")
    .select("numero")
    .order("numero", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return (data?.numero ?? 240) + 1;
}

export async function createColeta(input: ColetaInput) {
  const dataChegada =
    typeof input.dataChegada === "string" && input.dataChegada.trim() !== ""
      ? input.dataChegada.trim()
      : null;

  const status = dataChegada ? "agendado" : "pendente";
  const statusServico = dataChegada
    ? "Agendado — aguardando busca/chegada"
    : "Pedido registrado — sem data agendada";

  const numero = await nextNumero();

  const row = {
    numero,
    fornecedor_id: input.fornecedorId,
    nome_fantasia: input.nomeFantasia ?? null,
    razao_social: input.razaoSocial ?? null,
    cnpj_fornecedor: input.cnpjFornecedor ?? null,
    nota_fiscal: input.notaFiscal ?? null,
    peso_total_nf: input.pesoTotalNF ?? 0,
    peso_total_atual: input.pesoTotalNF ?? 0,
    data_chegada: dataChegada,
    galpao: input.galpao ?? "Vicente",
    status,
    status_servico: statusServico,
    observacao: input.observacao ?? "",
    recorrencia: input.recorrencia ?? null,
  };

  const { data, error } = await supabase
    .from("coletas")
    .insert(row)
    .select(COLETA_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateColeta(id: string, patch: Partial<ColetaInput> & Record<string, unknown>) {
  // Conversão minimal de camelCase para snake_case nos campos comuns
  const map: Record<string, string> = {
    fornecedorId: "fornecedor_id",
    nomeFantasia: "nome_fantasia",
    razaoSocial: "razao_social",
    cnpjFornecedor: "cnpj_fornecedor",
    notaFiscal: "nota_fiscal",
    pesoTotalNF: "peso_total_nf",
    pesoTotalAtual: "peso_total_atual",
    dataChegada: "data_chegada",
    statusServico: "status_servico",
    recorrencia: "recorrencia",
  };
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    row[map[k] ?? k] = v;
  }

  const { data, error } = await supabase
    .from("coletas")
    .update(row)
    .eq("id", id)
    .select(COLETA_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteColeta(id: string) {
  const { error } = await supabase.from("coletas").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}
