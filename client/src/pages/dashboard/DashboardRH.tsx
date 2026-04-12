import { useMemo } from "react";
import { Building2, UserCheck, UserX, Users, BriefcaseBusiness, AlertTriangle } from "lucide-react";
import { KpiSparklineCard, sparklineFromSeed } from "@/components/domain/KpiSparklineCard";
import { PageHero } from "@/composites/PageHero";

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
      <PageHero>
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
              <Users className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Painel RH</h2>
              <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Distribuição de equipes, cobertura operacional e leitura rápida de capacidade por departamento.</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] font-semibold text-white/70">
            Atualizado em {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </PageHero>

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
