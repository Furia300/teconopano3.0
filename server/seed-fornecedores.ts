/**
 * Seed standalone — importa os 57 fornecedores reais do Tecnopano-2.0
 * (github.com/Furia300/Tecnopano-2.0/server/fornecedores-data.ts).
 *
 * Idempotente: faz upsert por CNPJ.
 *
 * Uso: `npx tsx server/seed-fornecedores.ts`
 */
import "dotenv/config";
import { supabase } from "./supabase";
import { fornecedoresSeed } from "./seed-data/fornecedores-2.0";

async function main() {
  console.log(`\n🌱 Tecnopano — importando ${fornecedoresSeed.length} fornecedores reais\n`);

  const rows = fornecedoresSeed.map((f) => ({
    nome: f.nome,
    razao_social: f.razaoSocial,
    cnpj: f.cnpj,
    endereco: f.endereco,
    cidade: f.cidade,
    estado: f.estado,
    cep: f.cep,
    telefone: f.telefone,
    email: f.email,
    contato: f.contato,
    ativo: f.ativo,
  }));

  // CNPJ NÃO é único na realidade Tecnopano: filiais distintas podem partilhar
  // o mesmo raiz/CNPJ no source. A constraint composta `(nome, cnpj)` no banco
  // permite manter todas as variações como registos diferentes (cada uma com
  // endereço/razão social/contato próprios).
  //
  // Dedup só por par exato `(nome, cnpj)` — apenas para evitar erro do Postgres
  // se o mesmo par aparecer duas vezes na mesma operação de upsert.
  const seen = new Set<string>();
  const dedup: typeof rows = [];
  const skipped: string[] = [];
  for (const r of rows) {
    const key = `${r.nome}|${r.cnpj ?? ""}`;
    if (seen.has(key)) {
      skipped.push(`${r.nome} (${r.cnpj ?? "sem CNPJ"})`);
      continue;
    }
    seen.add(key);
    dedup.push(r);
  }
  if (skipped.length > 0) {
    console.log(`  ⚠ ${skipped.length} pares (nome,cnpj) idênticos pulados:`);
    skipped.forEach((s) => console.log(`     - ${s}`));
  }
  const comCnpj = dedup.filter((r) => r.cnpj);
  const semCnpj = dedup.filter((r) => !r.cnpj);

  let okCount = 0;
  let errCount = 0;

  // Upsert único pela constraint composta `(nome, cnpj)` — funciona tanto para
  // entradas com CNPJ quanto sem (cnpj NULL é tratado como valor pelo modificador
  // NULLS NOT DISTINCT).
  if (dedup.length > 0) {
    const { data, error } = await supabase
      .from("fornecedores")
      .upsert(dedup, { onConflict: "nome,cnpj" })
      .select("id, nome, cnpj");
    if (error) {
      console.error("✗ Upsert:", error.message);
      errCount += dedup.length;
    } else {
      okCount += data?.length ?? 0;
      console.log(`  ✓ ${data?.length ?? 0} fornecedores upsertados (${comCnpj.length} com CNPJ + ${semCnpj.length} sem CNPJ)`);
    }
  }

  // Conferir total final
  const { count, error: countErr } = await supabase
    .from("fornecedores")
    .select("*", { count: "exact", head: true });
  if (countErr) console.error("✗ count:", countErr.message);

  console.log(`\n📊 Total no banco agora: ${count} fornecedores`);
  console.log(`✅ Processados: ${okCount} ok / ${errCount} erro\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro fatal:", err);
  process.exit(1);
});
