import {
  DollarSign, FileText, CheckCircle2, Clock, TrendingUp, AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";

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
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
            <p className="text-white/70 text-sm mt-1">Aprovações e controle — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          {pendAprovacao.length > 0 && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
              <AlertCircle className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold">{pendAprovacao.length} para aprovar</span>
            </div>
          )}
        </div>
      </div>

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
