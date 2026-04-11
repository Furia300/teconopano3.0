import { Zap, Cpu, Workflow, Bell } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";

export default function AutomaticoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Zap}
        title="Automático"
        description="Regras, gatilhos e integrações que rodam sem intervenção manual — alinhado ao padrão de módulos FIPS (hero institucional, KPIs e blocos de conteúdo)."
        badge={
          <Badge className="border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">
            Operações · Automação
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard label="Fluxos ativos" value={0} icon={Workflow} color="text-[var(--fips-primary)]" bg="bg-[var(--fips-primary)]/10" />
        <StatsCard label="Jobs agendados" value={0} icon={Cpu} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Alertas hoje" value={0} icon={Bell} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      <div className="fips-surface-panel p-8 text-center">
        <Zap className="mx-auto mb-4 h-12 w-12 text-[var(--fips-primary)] opacity-80" />
        <p className="text-lg font-semibold text-[var(--fips-fg)]">Módulo em construção</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--fips-fg-muted)]">
          Quando as rotinas automáticas estiverem disponíveis, este painel exibirá filas, últimas execuções e falhas — no
          mesmo fluxo visual das demais áreas (filtros em cartão FIPS e tabelas administrativas).
        </p>
      </div>
    </div>
  );
}
