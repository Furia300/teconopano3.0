/**
 * Seed standalone — importa os 963 clientes B2B reais do Tecnopano-2.0
 * (github.com/Furia300/Tecnopano-2.0/server/seed.ts).
 *
 * Idempotente: faz upsert por (nome_fantasia, cnpj) — constraint composta criada
 * via Mgmt API. CNPJ não é único na realidade Tecnopano (mesma empresa pode ter
 * múltiplas filiais com endereço próprio).
 *
 * Mapeamento de campos:
 *  - source `nome` → `nome_fantasia` (no schema 3.0 o campo principal é nomeFantasia)
 *  - source `tipo` → `tipo` (todas as 963 entradas são "juridica")
 *  - resto idêntico (snake_case)
 *
 * Uso: `npx tsx server/seed-clientes.ts`
 */
import "dotenv/config";
import { supabase } from "./supabase";
import { clientesSeed } from "./seed-data/clientes-2.0";

async function main() {
  console.log(`\n🌱 Tecnopano — importando ${clientesSeed.length} clientes B2B reais\n`);

  // Mapear para snake_case + nome_fantasia
  const rows = clientesSeed.map((c) => ({
    nome_fantasia: c.nome,
    tipo: c.tipo,
    razao_social: c.razaoSocial,
    cnpj: c.cnpj,
    endereco: c.endereco,
    cidade: c.cidade,
    estado: c.estado,
    cep: c.cep,
    telefone: c.telefone,
    email: c.email,
    contato: c.contato,
    ativo: c.ativo,
  }));

  // Dedup por par exato (nome_fantasia, cnpj) — Postgres rejeita upsert que afete
  // a mesma linha duas vezes na mesma operação
  const seen = new Set<string>();
  const dedup: typeof rows = [];
  const skipped: string[] = [];
  for (const r of rows) {
    const key = `${r.nome_fantasia}|${r.cnpj ?? ""}`;
    if (seen.has(key)) {
      skipped.push(`${r.nome_fantasia} (${r.cnpj ?? "sem CNPJ"})`);
      continue;
    }
    seen.add(key);
    dedup.push(r);
  }
  if (skipped.length > 0) {
    console.log(`  ⚠ ${skipped.length} pares (nome_fantasia,cnpj) idênticos pulados:`);
    skipped.slice(0, 10).forEach((s) => console.log(`     - ${s}`));
    if (skipped.length > 10) console.log(`     ... e mais ${skipped.length - 10}`);
  }

  // Upsert em chunks de 500 (limite seguro do PostgREST)
  const CHUNK = 500;
  let totalOk = 0;
  for (let i = 0; i < dedup.length; i += CHUNK) {
    const slice = dedup.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("clientes")
      .upsert(slice, { onConflict: "nome_fantasia,cnpj" })
      .select("id");
    if (error) {
      console.error(`✗ Chunk ${i / CHUNK + 1}:`, error.message);
      console.error("   primeiro item do chunk:", JSON.stringify(slice[0]).slice(0, 200));
      continue;
    }
    totalOk += data?.length ?? 0;
    console.log(`  ✓ Chunk ${i / CHUNK + 1}: ${data?.length ?? 0} clientes upsertados`);
  }

  // Total final
  const { count } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true });

  console.log(`\n📊 Total no banco agora: ${count} clientes`);
  console.log(`✅ Processados: ${totalOk} ok / ${dedup.length - totalOk} erro\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro fatal:", err);
  process.exit(1);
});
