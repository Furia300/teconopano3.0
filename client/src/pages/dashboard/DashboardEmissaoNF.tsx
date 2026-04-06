import {
  FileText, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: any;
}

export default function DashboardEmissaoNF({ data }: Props) {
  const pendEmissao = data.expedicoes.filter((e: any) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao");
  const emitidas = data.expedicoes.filter((e: any) => e.statusNota === "emitida");
  const totalNotas = emitidas.length + pendEmissao.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Emissão NF</h1>
            <p className="text-white/70 text-sm mt-1">Notas fiscais — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          {pendEmissao.length > 0 && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
              <AlertCircle className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold">{pendEmissao.length} NF para emitir</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatsCard label="Pend. Emissão" value={pendEmissao.length} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="NF Emitidas" value={emitidas.length} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Total Notas" value={totalNotas} icon={FileText} color="text-purple-500" bg="bg-purple-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Notas Pendentes de Emissão
        </h3>
        {pendEmissao.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
            <p className="text-sm font-medium">Todas as notas emitidas!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendEmissao.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <div>
                  <p className="font-medium text-sm">{exp.nomeFantasia}</p>
                  <p className="text-xs text-muted-foreground">{exp.descricaoProduto} — {exp.kilo}kg</p>
                  <p className="text-xs text-muted-foreground">{exp.endereco}</p>
                </div>
                <Badge variant="warning">Emitir NF</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {emitidas.length > 0 && (
        <div className="bg-card rounded-xl border shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Notas Emitidas Recentes
          </h3>
          <div className="space-y-2">
            {emitidas.slice(0, 5).map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <div>
                  <p className="font-medium text-sm">{exp.nomeFantasia}</p>
                  <p className="text-xs text-muted-foreground">{exp.notaFiscal} — {exp.descricaoProduto}</p>
                </div>
                <Badge variant="default">Emitida</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
