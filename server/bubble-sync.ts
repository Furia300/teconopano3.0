/**
 * Bubble.io → Tecnopano 3.0 — Sincronização bidirecional (Bubble → Supabase)
 *
 * - Importação inicial: últimos 3 meses
 * - Polling automático: a cada 5 minutos busca registros modificados desde o último sync
 * - Upsert via bubble_id para evitar duplicatas
 */

import { supabase } from "./supabase";

const BUBBLE_API = process.env.BUBBLE_API_URL || "https://operation.app.br/api/1.1/obj";
const PAGE_SIZE = 100; // Bubble max per request
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

// Estado do sync
let lastSyncAt: Date | null = null;
let syncRunning = false;
let pollTimer: ReturnType<typeof setInterval> | null = null;

// ==================== BUBBLE API CLIENT ====================

interface BubbleResponse {
  response: {
    cursor: number;
    results: Record<string, any>[];
    count: number;
    remaining: number;
  };
}

async function fetchBubbleTable(
  tableName: string,
  constraints?: any[],
  cursor = 0,
): Promise<Record<string, any>[]> {
  const allResults: Record<string, any>[] = [];
  let remaining = 1;

  while (remaining > 0) {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      cursor: String(cursor + allResults.length),
    });

    if (constraints && constraints.length > 0) {
      params.set("constraints", JSON.stringify(constraints));
    }

    const url = `${BUBBLE_API}/${encodeURIComponent(tableName)}?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error(`[bubble-sync] Erro ao buscar ${tableName}: ${res.status} ${text}`);
      break;
    }

    const data: BubbleResponse = await res.json();
    allResults.push(...data.response.results);
    remaining = data.response.remaining;
  }

  return allResults;
}

// ==================== FIELD MAPPINGS ====================
// Cada mapeamento: { bubbleField: supabaseColumn }

type FieldMap = Record<string, string>;

const SYNC_TABLES: {
  bubble: string;
  supabase: string;
  fields: FieldMap;
  /** Campos que são referências a outras tabelas Bubble (resolve bubbleId → id local) */
  refs?: Record<string, { table: string; bubbleField: string }>;
}[] = [
  // ---- Tabelas sem dependências (sync primeiro) ----
  {
    bubble: "Clientes_Tecnopano",
    supabase: "clientes",
    fields: {
      "_id": "bubble_id",
      "ID": "codigo_legado",
      "NOME FANTASIA": "nome_fantasia",
      "RAZAO SOCIAL": "razao_social",
      "CNPJ": "cnpj",
      "ENDEREÇO": "endereco",
      "BAIRRO": "bairro",
      "CIDADE": "cidade",
      "ESTADO": "estado",
      "CEP": "cep",
    },
  },
  {
    bubble: "Fornecedores_Tecnopano",
    supabase: "fornecedores",
    fields: {
      "_id": "bubble_id",
      "Nome Fantasia": "nome",
      "Razão Social": "razao_social",
      "CNPJ": "cnpj",
      "Endereço": "endereco",
      "Contato": "contato",
      "E-mail": "email",
    },
  },
  {
    bubble: "Produtos_tecnopano",
    supabase: "produtos",
    fields: {
      "_id": "bubble_id",
      "DESCRIÇÃO DO PRODUTO": "descricao",
      "TIPO DE MATERIAL": "tipo_material",
      "COR": "cor",
      "MEDIDA": "medida",
      "ACABAMENTO": "acabamento",
      "PESO MEDIO": "peso_medio",
      "UNIDADE DE MEDIDA": "unidade_medida",
    },
  },
  {
    bubble: "Funcionários_Tecnopano",
    supabase: "funcionarios",
    fields: {
      "_id": "bubble_id",
      "Nome": "nome",
      "Cargo": "cargo",
      "Matricula": "matricula",
      "Galpão": "galpao",
      "Foto": "foto",
      "Data Admissão": "data_admissao",
    },
  },
  {
    bubble: "QR CODE",
    supabase: "qr_codes",
    fields: {
      "_id": "bubble_id",
      "QR CODE": "codigo",
      "ID CÓDIGO": "tipo",
      "ID NOME": "tipo_material",
      "Empresa": "cor",
    },
  },
  // ---- Tabelas com dependência de fornecedores (Pedido → coletas) ----
  {
    bubble: "Pedido_Tecnopano",
    supabase: "coletas",
    fields: {
      "_id": "bubble_id",
      "ID": "numero",
      "Nome fantasia": "nome_fantasia",
      "Razão social": "razao_social",
      "CNPJ fornecedor": "cnpj_fornecedor",
      "Nota Fiscal": "nota_fiscal",
      "Peso Total NF": "peso_total_nf",
      "Peso Total Atual": "peso_total_atual",
      "Data do Pedido": "data_pedido",
      "Data Chegada": "data_chegada",
      "Endereço": "endereco",
      "Galpão": "galpao",
      "Status Serviço": "status_servico",
      "Valor": "valor",
      "Observacao_coleta_pedido": "observacao",
      "Peso Renova Separação": "peso_renova_separacao",
    },
  },
  // ---- Tabelas com dependência de coletas ----
  {
    bubble: "separacao_tecnopano",
    supabase: "separacoes",
    fields: {
      "_id": "bubble_id",
      "tipo_material": "tipo_material",
      "peso": "peso",
      "colaborador": "colaborador",
      "galpão": "galpao",
      "data": "data",
    },
  },
  {
    bubble: "Repanol_Tecnopano",
    supabase: "repanol",
    fields: {
      "_id": "bubble_id",
      "Empresa fornecedor": "empresa_fornecedor",
      "Tipo material": "tipo_material",
      "data_envio": "data_envio",
      "peso_manchado_envio": "peso_manchado_envio",
      "peso_molhado_envio": "peso_molhado_envio",
      "peso_tingido_envio": "peso_tingido_envio",
      "data_retorno": "data_retorno",
      "peso manchado retorno": "peso_manchado_retorno",
      "peso_molhado_retorno": "peso_molhado_retorno",
      "peso_tingido_retorno": "peso_tingido_retorno",
      " Repanol residuo": "repanol_residuo",
      "Status": "status",
      "Status Serviço": "status_servico",
    },
  },
  {
    bubble: "producao_tecnopano",
    supabase: "producoes",
    fields: {
      "_id": "bubble_id",
      "tipo material": "tipo_material",
      "Cor": "cor",
      "acabamento": "acabamento",
      "medida": "medida",
      "kilo": "kilo",
      "unidade medida": "unidade_medida",
      "Galpao": "sala",
      "status_estoque": "status_estoque",
      "Deletado": "deletado",
      "data_criacao": "data_criacao",
    },
  },
  {
    bubble: "Costureira_Tecnopano",
    supabase: "costureira_envios",
    fields: {
      "_id": "bubble_id",
      "Enviar costureira": "costureira",
      "Tipo Material": "tipo_material",
      "Status": "status",
      "Galpão Envio": "galpao_envio",
      "Qtds Saida KG": "qtds_saida_kg",
      "Data Produção": "data_producao",
    },
  },
  {
    bubble: "Estoque_Tecnopano",
    supabase: "estoque",
    fields: {
      "_id": "bubble_id",
      "Status": "status",
      "Status Material": "status_material",
      "Qtde Reservada Pacote": "qtde_reservada_pacote",
    },
  },
  {
    bubble: "Expedicao_tecnopano",
    supabase: "expedicoes",
    fields: {
      "_id": "bubble_id",
      "Nome fantasia": "nome_fantasia",
      "CNPJ": "cnpj",
      "Descrição Produto": "descricao_produto",
      "Tipo_material": "tipo_material",
      "Cor": "cor",
      "Medida": "medida",
      "Acabamento": "acabamento",
      "Unidade medida": "unidade_medida",
      "Qtde pedido": "qtde_pedido",
      "Qtde Estoque": "qtde_estoque",
      "Status Pedido": "status_pedido",
      "Status material": "status_material",
      "data_entrega": "data_entrega",
    },
  },
];

// ==================== TRANSFORM ====================

/** Mapa de normalização de valores de enum do Bubble → Supabase */
const ENUM_NORMALIZE: Record<string, Record<string, string>> = {
  status_entrega: {
    "Pendente": "pendente",
    "Liberado": "pronto_entrega",
    "Reservado": "reservado",
    "Separado": "separado",
    "Em Rota": "em_rota",
    "Entregue": "entregue",
    "Cancelado": "cancelado",
    "Aguardando Financeiro": "aguardando_financeiro",
    "Aguardando NF": "aguardando_nf",
    "Pronto Entrega": "pronto_entrega",
  },
};

function normalizeEnum(column: string, value: string): string {
  const map = ENUM_NORMALIZE[column];
  if (map && map[value]) return map[value];
  // Tentar lowercase como fallback
  return value.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Extrai cidade e estado de um endereço no formato brasileiro.
 * Ex: "R. Sitha, 628 - Inamar, Diadema - SP, 09981, Brasil"
 *   → { cidade: "Diadema", estado: "SP" }
 */
function parseCidadeEstado(address: string): { cidade?: string; estado?: string } {
  // Padrão: "..., Cidade - UF, CEP, Brasil" ou "Cidade - UF, ..."
  const match = address.match(/([^,]+?)\s*-\s*([A-Z]{2})\s*,/);
  if (match) {
    return { cidade: match[1].trim(), estado: match[2].trim() };
  }
  return {};
}

function mapBubbleRecord(record: Record<string, any>, fields: FieldMap): Record<string, any> {
  const mapped: Record<string, any> = {};
  for (const [bubbleKey, supabaseCol] of Object.entries(fields)) {
    let val = record[bubbleKey];
    if (val !== undefined && val !== null && val !== "") {
      // Endereço do Bubble vem como objeto { address, lat, lng }
      if (supabaseCol === "endereco" && typeof val === "object" && val.address) {
        const { cidade, estado } = parseCidadeEstado(val.address);
        mapped.endereco = val.address;
        if (cidade) mapped.cidade = cidade;
        if (estado) mapped.estado = estado;
        continue;
      }
      // Normalizar enums
      if (supabaseCol === "status_entrega" && typeof val === "string") {
        val = normalizeEnum("status_entrega", val);
      }
      mapped[supabaseCol] = val;
    }
  }
  return mapped;
}

// ==================== RESOLVE FOREIGN KEYS ====================

/** Cache de bubble_id → id local para lookup de FKs */
const idCache: Record<string, Record<string, string>> = {};

async function buildIdCache(tableName: string): Promise<Record<string, string>> {
  if (idCache[tableName]) return idCache[tableName];

  const { data } = await supabase
    .from(tableName)
    .select("id, bubble_id")
    .not("bubble_id", "is", null);

  const cache: Record<string, string> = {};
  if (data) {
    for (const row of data) {
      if (row.bubble_id) cache[row.bubble_id] = row.id;
    }
  }
  idCache[tableName] = cache;
  return cache;
}

async function resolveFornecedorId(cnpj: string | undefined): Promise<string | null> {
  if (!cnpj) return null;
  const { data } = await supabase
    .from("fornecedores")
    .select("id")
    .eq("cnpj", cnpj)
    .limit(1)
    .single();
  return data?.id || null;
}

async function resolveColetaId(bubblePedidoId: string | undefined): Promise<string | null> {
  if (!bubblePedidoId) return null;
  const cache = await buildIdCache("coletas");
  return cache[bubblePedidoId] || null;
}

// ==================== UPSERT ====================

async function upsertBatch(
  tableName: string,
  records: Record<string, any>[],
): Promise<{ inserted: number; updated: number; errors: number }> {
  let inserted = 0, updated = 0, errors = 0;

  // Filtrar registros sem bubble_id
  const valid = records.filter((r) => r.bubble_id);
  errors += records.length - valid.length;

  if (valid.length === 0) return { inserted, updated, errors };

  // Batch upsert em chunks de 50 (limite seguro para Supabase)
  const CHUNK_SIZE = 50;
  for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
    const chunk = valid.slice(i, i + CHUNK_SIZE);

    try {
      const { data, error } = await supabase
        .from(tableName)
        .upsert(chunk, {
          onConflict: "bubble_id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (error) {
        // Fallback: tentar um por um se o batch falhar
        console.error(`[bubble-sync] Batch upsert falhou em ${tableName} (chunk ${i}): ${error.message}`);
        for (const record of chunk) {
          try {
            const { error: singleErr } = await supabase
              .from(tableName)
              .upsert(record, { onConflict: "bubble_id" });
            if (singleErr) {
              console.error(`[bubble-sync] Erro upsert ${tableName}: ${singleErr.message}`);
              errors++;
            } else {
              inserted++;
            }
          } catch {
            errors++;
          }
        }
      } else {
        inserted += data?.length || chunk.length;
      }
    } catch (err) {
      console.error(`[bubble-sync] Exception batch ${tableName}:`, err);
      errors += chunk.length;
    }
  }

  return { inserted, updated, errors };
}

// ==================== SYNC TABLE ====================

interface SyncResult {
  table: string;
  fetched: number;
  inserted: number;
  updated: number;
  errors: number;
  ms: number;
}

async function syncTable(
  config: (typeof SYNC_TABLES)[number],
  sinceDate?: Date,
): Promise<SyncResult> {
  const start = Date.now();

  // Build date constraint for incremental sync
  const constraints: any[] = [];
  if (sinceDate) {
    constraints.push({
      key: "Modified Date",
      constraint_type: "greater than",
      value: sinceDate.toISOString(),
    });
  }

  // Fetch from Bubble
  const bubbleRecords = await fetchBubbleTable(config.bubble, constraints);

  // Map fields
  const mapped = bubbleRecords.map((rec) => {
    const row = mapBubbleRecord(rec, config.fields);

    // Resolver FKs especiais por tabela
    // Para coletas: resolver fornecedor_id pelo CNPJ
    // Para tabelas com ID_Pedido: resolver coleta_id
    row._bubbleRaw = rec; // temporário para resolver refs
    return row;
  });

  // Resolver referências
  const resolved: Record<string, any>[] = [];
  for (const row of mapped) {
    const raw = row._bubbleRaw;
    delete row._bubbleRaw;

    // Tabelas que precisam de fornecedor_id
    if (config.supabase === "coletas") {
      const fornecedorId = await resolveFornecedorId(raw["CNPJ fornecedor"]);
      row.fornecedor_id = fornecedorId || null; // nullable agora
    }

    // Tabelas que precisam de coleta_id (via ID_Pedido ou id_pedido)
    // NOTA: expedicoes NÃO tem coluna coleta_id — usa estoque_origem_id e cliente_id
    const pedidoRef = raw["ID_Pedido"] || raw["id_pedido"] || raw["ID_pedido"];
    const tabelasComColetaId = ["separacoes", "repanol", "producoes", "costureira_envios", "estoque"];
    if (pedidoRef && tabelasComColetaId.includes(config.supabase)) {
      const coletaId = await resolveColetaId(pedidoRef);
      row.coleta_id = coletaId || null;
    }

    // Converter campos integer que vêm como float do Bubble
    for (const intCol of ["qtde_pedido", "qtde_estoque", "unidade", "qtde_reservada_pacote", "numero"]) {
      if (row[intCol] !== undefined && row[intCol] !== null) {
        const parsed = parseInt(String(row[intCol]), 10);
        row[intCol] = isNaN(parsed) ? null : parsed;
      }
    }

    // Limpar campos com valor undefined
    for (const key of Object.keys(row)) {
      if (row[key] === undefined) delete row[key];
    }

    resolved.push(row);
  }

  // Upsert
  const result = await upsertBatch(config.supabase, resolved);

  // Limpar cache após sync da tabela
  delete idCache[config.supabase];

  return {
    table: config.supabase,
    fetched: bubbleRecords.length,
    ...result,
    ms: Date.now() - start,
  };
}

// ==================== SYNC ALL ====================

export async function syncAll(sinceDate?: Date): Promise<{
  results: SyncResult[];
  totalMs: number;
  syncedAt: string;
}> {
  if (syncRunning) {
    throw new Error("Sync já em andamento");
  }

  syncRunning = true;
  const start = Date.now();
  const results: SyncResult[] = [];

  try {
    // Sync em ordem de dependência
    for (const config of SYNC_TABLES) {
      try {
        const result = await syncTable(config, sinceDate);
        results.push(result);
        console.log(
          `[bubble-sync] ${result.table}: ${result.fetched} buscados, ` +
          `${result.inserted} inseridos, ${result.updated} atualizados, ` +
          `${result.errors} erros (${result.ms}ms)`,
        );
      } catch (err) {
        console.error(`[bubble-sync] Falha ao sincronizar ${config.supabase}:`, err);
        results.push({
          table: config.supabase,
          fetched: 0,
          inserted: 0,
          updated: 0,
          errors: 1,
          ms: 0,
        });
      }
    }

    lastSyncAt = new Date();
  } finally {
    syncRunning = false;
    // Limpar caches
    Object.keys(idCache).forEach((k) => delete idCache[k]);
  }

  return {
    results,
    totalMs: Date.now() - start,
    syncedAt: lastSyncAt!.toISOString(),
  };
}

/** Sync de uma tabela específica */
export async function syncOne(tableName: string, sinceDate?: Date): Promise<SyncResult> {
  const config = SYNC_TABLES.find(
    (t) => t.supabase === tableName || t.bubble === tableName,
  );
  if (!config) {
    throw new Error(`Tabela não encontrada: ${tableName}`);
  }
  return syncTable(config, sinceDate);
}

// ==================== POLLING ====================

export function startPolling(): void {
  if (pollTimer) return;

  console.log(`[bubble-sync] Polling ativado — a cada ${POLL_INTERVAL_MS / 1000}s`);

  pollTimer = setInterval(async () => {
    try {
      // Buscar somente modificados desde último sync
      const since = lastSyncAt || new Date(Date.now() - 10 * 60 * 1000);
      console.log(`[bubble-sync] Polling incremental desde ${since.toISOString()}`);
      await syncAll(since);
    } catch (err) {
      console.error("[bubble-sync] Erro no polling:", err);
    }
  }, POLL_INTERVAL_MS);
}

export function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    console.log("[bubble-sync] Polling parado");
  }
}

// ==================== STATUS ====================

export function getSyncStatus() {
  return {
    lastSyncAt: lastSyncAt?.toISOString() || null,
    syncRunning,
    pollingActive: pollTimer !== null,
    pollIntervalMs: POLL_INTERVAL_MS,
    bubbleApi: BUBBLE_API,
    tables: SYNC_TABLES.map((t) => ({
      bubble: t.bubble,
      supabase: t.supabase,
      fieldCount: Object.keys(t.fields).length,
    })),
  };
}
