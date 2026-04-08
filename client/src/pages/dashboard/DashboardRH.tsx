import { useMemo } from "react";
import { Building2, UserCheck, UserX, Users, BriefcaseBusiness, AlertTriangle } from "lucide-react";
import { KpiSparklineCard, sparklineFromSeed } from "@/components/domain/KpiSparklineCard";

interface Props {
  data: any;
}

export default function DashboardRH({ data }: Props) {
  const total = data.colaboradores.length || 0;
  const ativos = data.colaboradores.filter((c: any) => c.status === 1 || (c.situacao !== "Demitido" && c.situacao !== "Inativo")).length;
  const inativos = total - ativos;

  const departamentos = useMemo(() => {
    const porDepartamento: Record<string, number> = {};
    data.colaboradores.forEach((c: any) => {
      const dept = (c.departamento || c.cargo || "Sem departamento").trim();
      porDepartamento[dept] = (porDepartamento[dept] || 0) + 1;
    });
    return Object.entries(porDepartamento).sort((a, b) => b[1] - a[1]);
  }, [data.colaboradores]);

  const totalDepartamentos = departamentos.length;
  const mediaPorDepartamento = totalDepartamentos ? (total / totalDepartamentos) : 0;
  const topDept = departamentos[0];
  const atencao = departamentos.filter(([, count]) => count <= 1).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#0d4f6e]/40 bg-gradient-to-r from-[#005f86] via-[#00698f] to-[#004b9b] p-6 text-white shadow-[0_14px_30px_rgba(0,75,155,0.24)]">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Painel RH</h1>
        <p className="mt-1 text-sm text-white/80">
          Distribuição de equipes, cobertura operacional e leitura rápida de capacidade por departamento.
        </p>
        <div className="mt-3 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold">
          Atualizado em {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiSparklineCard
          label="Total de Colaboradores"
          value={total}
          icon={Users}
          accent="sky"
          trendLabel="quadro geral"
          trendDir="up"
          sparkPoints={sparklineFromSeed(total + 11, "up")}
        />
        <KpiSparklineCard
          label="Ativos"
          value={ativos}
          icon={UserCheck}
          accent="emerald"
          trendLabel={`${total ? Math.round((ativos / total) * 100) : 0}%`}
          trendDir="up"
          sparkPoints={sparklineFromSeed(ativos + 21, "up")}
        />
        <KpiSparklineCard
          label="Inativos"
          value={inativos}
          icon={UserX}
          accent="rose"
          trendLabel={`${total ? Math.round((inativos / total) * 100) : 0}%`}
          trendDir="down"
          sparkPoints={sparklineFromSeed(inativos + 31, "down")}
        />
        <KpiSparklineCard
          label="Departamentos"
          value={totalDepartamentos}
          icon={Building2}
          accent="amber"
          trendLabel={`${mediaPorDepartamento.toFixed(1)} média`}
          trendDir="up"
          sparkPoints={sparklineFromSeed(totalDepartamentos + 41, "up")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--fips-fg)]">
            <BriefcaseBusiness className="h-5 w-5 text-[var(--fips-primary)]" />
            Cobertura por Departamento
          </h3>
          <div className="space-y-3">
            {departamentos.map(([dept, count]) => (
              <div key={dept} className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-alt)] p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[var(--fips-fg)]">{dept}</span>
                  <span className="text-xs font-semibold text-[var(--fips-fg-muted)]">{count} colab.</span>
                </div>
                <div className="h-2 rounded-full bg-[#dbe7f3]">
                  <div
                    className="h-2 rounded-full bg-[var(--fips-primary)] transition-all"
                    style={{ width: `${Math.max(10, total ? (count / total) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--fips-fg)]">
            <AlertTriangle className="h-5 w-5 text-[#f6921e]" />
            Quadro de Atenção RH
          </h3>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-alt)] p-3">
              <p className="text-[var(--fips-fg-muted)]">Departamento com maior volume</p>
              <p className="font-semibold text-[var(--fips-fg)]">
                {topDept ? `${topDept[0]} (${topDept[1]})` : "Sem dados"}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-alt)] p-3">
              <p className="text-[var(--fips-fg-muted)]">Departamentos com 1 colaborador</p>
              <p className="font-semibold text-[var(--fips-fg)]">{atencao}</p>
            </div>
            <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-alt)] p-3">
              <p className="text-[var(--fips-fg-muted)]">Taxa de atividade</p>
              <p className="font-semibold text-[var(--fips-fg)]">
                {total ? `${Math.round((ativos / total) * 100)}% ativos` : "0% ativos"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
