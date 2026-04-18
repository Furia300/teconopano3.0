/**
 * Seed standalone — popula o Supabase com:
 *  - Fornecedores reais (Atmosfera, Sul Americana, Hotel Majestic, VLI, Rede Accor)
 *  - Clientes B2B reais identificados nas notas Bubble (BTM, CET, Atlas Schindler, Titanium, Marenostrum)
 *  - 5 coletas iniciais (#245-249) com os mesmos dados que apareciam no mock in-memory
 *
 * Uso: `npx tsx server/seed.ts`
 *
 * Idempotente: faz UPSERT por chave única (cnpj para empresas, numero para coletas).
 */

import "dotenv/config";
import { supabase } from "./supabase";

const FORNECEDORES = [
  {
    nome: "ATMOSFERA GESTÃO",
    razao_social: "Atmosfera Gestão e Higienização de Têxteis S.A.",
    cnpj: "12.345.678/0001-90",
    cidade: "Belo Horizonte",
    estado: "MG",
  },
  {
    nome: "SUL AMERICANA",
    razao_social: "Sul Americana Têxtil Ltda",
    cnpj: "98.765.432/0001-10",
  },
  {
    nome: "HOTEL MAJESTIC",
    razao_social: "Hotel Majestic S.A.",
    cnpj: "11.222.333/0001-44",
  },
  {
    nome: "VLI LOGÍSTICA",
    razao_social: "VLI Logística S.A.",
    cnpj: "55.666.777/0001-88",
  },
  {
    nome: "REDE ACCOR",
    razao_social: "Accor Brasil Hotelaria Ltda",
    cnpj: "33.444.555/0001-22",
  },
];

const CLIENTES_B2B = [
  {
    nome_fantasia: "BTM ELETROMECANICA LTDA",
    razao_social: "BTM Eletromecânica Ltda",
    cnpj: "00008220000161",
    observacao: "Cliente-âncora — Avental Verde G Corte-Reto recorrente",
  },
  {
    nome_fantasia: "COMPANHIA DE ENGENHARIA DE TRAFEGO",
    razao_social: "Companhia de Engenharia de Trafego (CET)",
    cnpj: "00034616000183",
  },
  {
    nome_fantasia: "ELEVADORES ATLAS SCHINDLER LTDA",
    razao_social: "Elevadores Atlas Schindler Ltda",
    cnpj: "00028986006220",
  },
  {
    nome_fantasia: "TITANIUM LUBRIFICANTES IND LTDA",
    razao_social: "Titanium Lubrificantes Industriais Ltda",
    cnpj: "00003519000123",
  },
  {
    nome_fantasia: "MARENOSTRUM CONSULTORIA E ASSISTÊNCIA",
    razao_social: "Marenostrum Consultoria e Assistência",
    cnpj: "00122107000102",
  },
];

const COLETAS_MOCK = [
  {
    numero: 248,
    fornecedorCnpj: "12.345.678/0001-90",
    nome_fantasia: "ATMOSFERA GESTÃO",
    nota_fiscal: "NF-001234",
    peso_total_nf: 555,
    peso_total_atual: 550,
    data_pedido: "2026-04-01T10:00:00Z",
    data_chegada: "2026-04-03T08:30:00Z",
    galpao: "Vicente",
    status: "recebido" as const,
    status_servico: "Em andamento",
  },
  {
    numero: 247,
    fornecedorCnpj: "98.765.432/0001-10",
    nome_fantasia: "SUL AMERICANA",
    nota_fiscal: "NF-005678",
    peso_total_nf: 300,
    peso_total_atual: 295,
    data_pedido: "2026-03-28T14:00:00Z",
    data_chegada: "2026-03-30T09:00:00Z",
    galpao: "Vicente",
    status: "em_separacao" as const,
    status_servico: "Em andamento",
    observacao: "Material misto",
  },
  {
    numero: 246,
    fornecedorCnpj: "11.222.333/0001-44",
    nome_fantasia: "HOTEL MAJESTIC",
    nota_fiscal: "NF-009012",
    peso_total_nf: 420,
    peso_total_atual: 418,
    data_pedido: "2026-03-25T11:00:00Z",
    data_chegada: "2026-03-27T07:45:00Z",
    galpao: "Vicente",
    status: "em_producao" as const,
    status_servico: "Em andamento",
  },
  {
    numero: 245,
    fornecedorCnpj: "55.666.777/0001-88",
    nome_fantasia: "VLI LOGÍSTICA",
    nota_fiscal: "NF-003456",
    peso_total_nf: 800,
    peso_total_atual: 790,
    data_pedido: "2026-03-20T16:00:00Z",
    data_chegada: "2026-03-22T10:00:00Z",
    galpao: "Vicente",
    status: "finalizado" as const,
    status_servico: "Finalizado",
  },
  {
    numero: 249,
    fornecedorCnpj: "33.444.555/0001-22",
    nome_fantasia: "REDE ACCOR",
    nota_fiscal: null,
    peso_total_nf: 0,
    peso_total_atual: 0,
    data_pedido: "2026-04-05T09:00:00Z",
    data_chegada: null,
    galpao: "Vicente",
    status: "pendente" as const,
    status_servico: "Aguardando agendamento",
  },
];

async function seedFornecedores(): Promise<Map<string, string>> {
  console.log("→ Seedando fornecedores...");
  const cnpjToId = new Map<string, string>();

  for (const f of FORNECEDORES) {
    // Check if exists
    const { data: existing } = await supabase
      .from("fornecedores")
      .select("id, cnpj")
      .eq("cnpj", f.cnpj)
      .limit(1)
      .maybeSingle();

    if (existing) {
      cnpjToId.set(existing.cnpj, existing.id);
      console.log(`  ⊘ ${f.nome} (já existe: ${existing.id})`);
      continue;
    }

    const { data, error } = await supabase
      .from("fornecedores")
      .insert(f)
      .select("id, cnpj")
      .single();
    if (error) {
      console.error(`  ✗ ${f.nome}:`, error.message);
      continue;
    }
    cnpjToId.set(data.cnpj, data.id);
    console.log(`  ✓ ${f.nome} (${data.id})`);
  }
  return cnpjToId;
}

async function seedClientes(): Promise<void> {
  console.log("→ Seedando clientes B2B...");
  for (const c of CLIENTES_B2B) {
    const { data: existing } = await supabase
      .from("clientes")
      .select("id")
      .eq("nome_fantasia", c.nome_fantasia)
      .limit(1)
      .maybeSingle();
    if (existing) { console.log(`  ⊘ ${c.nome_fantasia} (já existe)`); continue; }

    const { error } = await supabase.from("clientes").insert(c);
    if (error) console.error(`  ✗ ${c.nome_fantasia}:`, error.message);
    else console.log(`  ✓ ${c.nome_fantasia}`);
  }
}

async function seedColetas(fornecedorMap: Map<string, string>): Promise<void> {
  console.log("→ Seedando coletas...");
  for (const c of COLETAS_MOCK) {
    const fornecedor_id = fornecedorMap.get(c.fornecedorCnpj);
    if (!fornecedor_id) {
      console.error(`  ✗ #${c.numero}: fornecedor ${c.fornecedorCnpj} não encontrado`);
      continue;
    }
    const { data: existingCol } = await supabase
      .from("coletas")
      .select("id")
      .eq("numero", c.numero)
      .limit(1)
      .maybeSingle();
    if (existingCol) { console.log(`  ⊘ #${c.numero} (já existe)`); continue; }

    const { fornecedorCnpj, ...rest } = c;
    const row = {
      ...rest,
      fornecedor_id,
      cnpj_fornecedor: fornecedorCnpj,
    };
    const { error } = await supabase.from("coletas").insert(row);
    if (error) console.error(`  ✗ #${c.numero}:`, error.message);
    else console.log(`  ✓ #${c.numero} ${c.nome_fantasia} (${c.status})`);
  }
}

// ─── SEED DADOS REAIS DAS PLANILHAS ───
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename2 = typeof __filename !== "undefined" ? __filename : fileURLToPath(import.meta.url);
const __dirname2 = dirname(__filename2);

async function seedProdutosReais(): Promise<void> {
  console.log("→ Seedando produtos reais (planilha)...");
  let seedData: any;
  try {
    const raw = readFileSync(resolve(__dirname2, "seed-data.json"), "utf8");
    seedData = JSON.parse(raw);
  } catch {
    console.log("  ⚠ seed-data.json não encontrado, pulando produtos/clientes reais");
    return;
  }

  const produtos = seedData.produtos || [];
  let inserted = 0, skipped = 0;

  for (let i = 0; i < produtos.length; i += 50) {
    const batch = produtos.slice(i, i + 50);
    const rows = batch.map((p: any) => ({
      descricao: p.descricao || p.nome,
      tipo_material: p.tipoMaterial || "Geral",
      cor: p.cor,
      medida: p.medida,
      acabamento: p.acabamento,
      peso_medio: p.pesoMedio,
      unidade_medida: p.unidadeMedida || "Pacote/Kilo",
      observacao: `ID Planilha: ${p.codigo}`,
      ativo: p.ativo ?? true,
    }));
    const { error } = await supabase.from("produtos").insert(rows);
    if (error) {
      if (error.message.includes("duplicate")) { skipped += batch.length; }
      else { console.error(`  ✗ batch ${i}: ${error.message}`); skipped += batch.length; }
    }
    else inserted += batch.length;
  }
  console.log(`  ✓ ${inserted} produtos inseridos, ${skipped} erros`);
}

async function seedClientesReais(): Promise<void> {
  console.log("→ Seedando clientes reais (planilha NF Brazil + Tecnopano)...");
  let seedData: any;
  try {
    const raw = readFileSync(resolve(__dirname2, "seed-data.json"), "utf8");
    seedData = JSON.parse(raw);
  } catch {
    return;
  }

  const clientes = seedData.clientes || [];
  let inserted = 0, skipped = 0;

  for (let i = 0; i < clientes.length; i += 50) {
    const batch = clientes.slice(i, i + 50);
    const rows = batch.map((c: any) => ({
      nome_fantasia: c.nomeFantasia,
      razao_social: c.razaoSocial,
      codigo_legado: c.idCliente ? String(c.idCliente) : null,
      estado: c.estado,
      observacao: c.empresa === "brazil" ? "Empresa: Brazil" : "Empresa: Tecnopano",
      ativo: c.ativo ?? true,
    }));
    const { error } = await supabase.from("clientes").insert(rows);
    if (error) {
      if (error.message.includes("duplicate")) { skipped += batch.length; }
      else { console.error(`  ✗ batch ${i}: ${error.message}`); skipped += batch.length; }
    }
    else inserted += batch.length;
  }
  const tecno = clientes.filter((c: any) => c.empresa === "tecnopano").length;
  const brazil = clientes.filter((c: any) => c.empresa === "brazil").length;
  console.log(`  ✓ ${inserted} clientes inseridos (${tecno} Tecnopano + ${brazil} Brazil), ${skipped} erros`);
}

async function main() {
  console.log("\n🌱 Tecnopano — Supabase seed\n");
  try {
    const map = await seedFornecedores();
    await seedClientes();
    await seedColetas(map);
    await seedProdutosReais();
    await seedClientesReais();
    console.log("\n✅ Seed concluído.\n");
  } catch (err) {
    console.error("\n❌ Erro fatal:", err);
    process.exit(1);
  }
}

main();
