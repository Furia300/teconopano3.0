import { useEffect, useState } from "react";
import { LuTrophy } from "react-icons/lu";
const Trophy = LuTrophy;
import { PageHeader } from "@/components/domain/PageHeader";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import { DashboardGamificacao } from "./DashboardGamificacao";

export default function DashboardGamificacaoPage() {
  const [producoes, setProducoes] = useState<any[]>([]);
  const [producaoDiaria, setProducaoDiaria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/producoes").then(r => r.json()).catch(() => []),
      fetch("/api/producao-diaria").then(r => r.json()).catch(() => []),
    ])
      .then(([prod, diaria]) => { setProducoes(prod); setProducaoDiaria(diaria); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalKg = producoes.reduce((a: number, p: any) => a + (p.pesoTotal || 0), 0);
  const totalPacotes = producoes.reduce((a: number, p: any) => a + (p.quantidadePacotes || 0), 0);
  const colaboradores = new Set([...producoes.map((p: any) => p.operador), ...producaoDiaria.map((d: any) => d.nomeDupla)].filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gamificação & Produtividade"
        description="Ranking de colaboradores, produtividade por sala e metas de produção"
        icon={Trophy}
        actions={<DashboardPrintButton title="Gamificação" />}
        stats={[
          { label: "Produção Total", value: `${Math.round(totalKg).toLocaleString("pt-BR")}kg`, color: "#93BDE4" },
          { label: "Pacotes", value: totalPacotes, color: "#FDC24E" },
          { label: "Colaboradores", value: colaboradores, color: "#00C64C" },
          { label: "Registros", value: producoes.length + producaoDiaria.length, color: "#ed1b24" },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-[var(--fips-fg-muted)]">
          Carregando dados de produtividade...
        </div>
      ) : (
        <DashboardGamificacao producoes={producoes} producaoDiaria={producaoDiaria} />
      )}
    </div>
  );
}
