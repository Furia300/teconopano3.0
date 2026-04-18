import {
  LuDollarSign, LuFileText, LuCircleCheck, LuClock, LuTrendingUp, LuCircleAlert,
} from "react-icons/lu";
const DollarSign = LuDollarSign, FileText = LuFileText, CheckCircle2 = LuCircleCheck, Clock = LuClock, TrendingUp = LuTrendingUp, AlertCircle = LuCircleAlert;
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/composites/PageHero";

interface Props {
  data: any;
}

export default function DashboardFinanceiro({ data }: Props) {
  const pendAprovacao = data.expedicoes.filter((e: any) => e.statusFinanceiro === "pendente_aprovacao");
  const aprovados = data.expedicoes.filter((e: any) => e.statusFinanceiro === "aprovado");
  const rejeitados = data.expedicoes.filter((e: any) => e.statusFinanceiro === "rejeitado");
  const totalKgAprovado = aprovados.reduce((a: number, e: any) => a + (Number(e.kilo) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHero>
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
              <DollarSign className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Dashboard Financeiro</h2>
              <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Aprovações e controle — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
          {pendAprovacao.length > 0 && (
            <div className="flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(246,146,30,0.14)", border: "1px solid rgba(246,146,30,0.38)" }}>
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">{pendAprovacao.length} para aprovar</span>
            </div>
          )}
        </div>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Pend. Aprovação" value={pendAprovacao.length} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Aprovados" value={aprovados.length} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Rejeitados" value={rejeitados.length} icon={DollarSign} color="text-red-500" bg="bg-red-500/10" />
        <StatsCard label="Total Kg Aprovado" value={`${totalKgAprovado.toLocaleString("pt-BR")}kg`} icon={TrendingUp} color="text-blue-500" bg="bg-blue-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Pedidos Aguardando Aprovação
        </h3>
        {pendAprovacao.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
            <p className="text-sm font-medium">Nenhum pedido pendente!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendAprovacao.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <div>
                  <p className="font-medium text-sm">{exp.nomeFantasia}</p>
                  <p className="text-xs text-muted-foreground">{exp.descricaoProduto} — {exp.kilo}kg</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Pendente</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Últimos Aprovados
        </h3>
        {aprovados.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma aprovação recente</p>
        ) : (
          <div className="space-y-2">
            {aprovados.slice(0, 5).map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <div>
                  <p className="font-medium text-sm">{exp.nomeFantasia}</p>
                  <p className="text-xs text-muted-foreground">{exp.descricaoProduto} — {exp.kilo}kg — NF: {exp.statusNota === "emitida" ? exp.notaFiscal : "Pendente"}</p>
                </div>
                <Badge variant="default">{exp.statusNota === "emitida" ? "NF Emitida" : "Aguardando NF"}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
