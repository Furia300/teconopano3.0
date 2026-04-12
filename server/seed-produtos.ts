/**
 * Seed standalone — importa os 164 produtos reais do Tecnopano-2.0
 * (github.com/Furia300/Tecnopano-2.0/server/seed.ts).
 *
 * Idempotente: faz upsert por `codigo`.
 *
 * Mapeamento:
 *  - source `nome` → coluna `nome` (aliased de codigo no source)
 *  - resto idêntico (snake_case)
 *
 * Uso: `npx tsx server/seed-produtos.ts`
 */
import "dotenv/config";
import { supabase } from "./supabase";
import { produtosSeed } from "./seed-data/produtos-2.0";

async function main() {
  console.log(`\n🌱 Tecnopano — importando ${produtosSeed.length} produtos reais\n`);

  const rows = produtosSeed.map((p) => ({
    codigo: p.codigo,
    nome: p.nome,
    descricao: p.descricao || p.nome || "Sem descrição",
    tipo_material: p.nome, // No source o "nome" funciona como tipo (Tecnopano Fur, etc.)
    cor: p.cor,
    medida: p.medida,
    acabamento: p.acabamento,
    unidade_medida: p.unidadeMedida,
    preco_custo: p.precoCusto,
    preco_venda: p.precoVenda,
    foto: p.foto,
    nota_fiscal: p.notaFiscal,
    ativo: p.ativo,
  }));

  // Dedup por variante exata (codigo, cor, medida, acabamento) — variantes do mesmo
  // código com características diferentes são produtos distintos.
  const seen = new Set<string>();
  const dedup: typeof rows = [];
  const skipped: string[] = [];
  for (const r of rows) {
    const key = `${r.codigo ?? ""}|${r.cor ?? ""}|${r.medida ?? ""}|${r.acabamento ?? ""}`;
    if (seen.has(key)) {
      skipped.push(`${r.codigo} ${r.cor || ""} ${r.medida || ""}`);
      continue;
    }
    seen.add(key);
    dedup.push(r);
  }
  if (skipped.length > 0) {
    console.log(`  ⚠ ${skipped.length} variantes idênticas puladas:`);
    skipped.slice(0, 5).forEach((s) => console.log(`     - ${s}`));
  }

  const { data, error } = await supabase
    .from("produtos")
    .upsert(dedup, { onConflict: "codigo,cor,medida,acabamento" })
    .select("id, codigo, nome");
  if (error) {
    console.error("✗ Upsert:", error.message);
    process.exit(1);
  }

  const { count } = await supabase
    .from("produtos")
    .select("*", { count: "exact", head: true });

  console.log(`\n  ✓ ${data?.length ?? 0} produtos upsertados`);
  console.log(`📊 Total no banco agora: ${count} produtos\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro fatal:", err);
  process.exit(1);
});
