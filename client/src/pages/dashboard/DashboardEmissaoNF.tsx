import {
  LuFileText, LuCircleCheck, LuClock, LuCircleAlert,
} from "react-icons/lu";
const FileText = LuFileText, CheckCircle2 = LuCircleCheck, Clock = LuClock, AlertCircle = LuCircleAlert;
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/composites/PageHero";

interface Props {
  data: any;
}

export default function DashboardEmissaoNF({ data }: Props) {
  const pendEmissao = data.expedicoes.filter((e: any) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao");
  const emitidas = data.expedicoes.filter((e: any) => e.statusNota === "emitida");
  const totalNotas = emitidas.length + pendEmissao.length;

  return (
    <div className="space-y-6">
      <PageHero>
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
              <FileText className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Dashboard Emissão NF</h2>
              <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Notas fiscais — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
          {pendEmissao.length > 0 && (
            <div className="flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(246,146,30,0.14)", border: "1px solid rgba(246,146,30,0.38)" }}>
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">{pendEmissao.length} NF para emitir</span>
            </div>
          )}
        </div>
      </PageHero>

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
