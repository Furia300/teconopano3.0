import {
  Package, Truck, Clock, CheckCircle2, AlertCircle, MapPin, Send,
} from "lucide-react";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHero } from "@/composites/PageHero";

interface Props {
  data: any;
}

export default function DashboardExpedicao({ data }: Props) {
  const pendentes = data.expedicoes.filter((e: any) => ["pendente", "reservado", "separado"].includes(e.statusEntrega));
  const aguardando = data.expedicoes.filter((e: any) => ["aguardando_financeiro", "aguardando_nf"].includes(e.statusEntrega));
  const prontoEntrega = data.expedicoes.filter((e: any) => e.statusEntrega === "pronto_entrega");
  const emRota = data.expedicoes.filter((e: any) => e.statusEntrega === "em_rota");
  const entregues = data.expedicoes.filter((e: any) => e.statusEntrega === "entregue");
  const total = data.expedicoes.length;

  const statusMap: Record<string, { label: string; variant: string }> = {
    pendente: { label: "Pendente", variant: "secondary" },
    reservado: { label: "Reservado", variant: "info" },
    separado: { label: "Separado", variant: "info" },
    aguardando_financeiro: { label: "Agrd. Financeiro", variant: "warning" },
    aguardando_nf: { label: "Agrd. NF", variant: "warning" },
    pronto_entrega: { label: "Pronto Entrega", variant: "default" },
    em_rota: { label: "Em Rota", variant: "info" },
    entregue: { label: "Entregue", variant: "default" },
  };

  return (
    <div className="space-y-6">
      <PageHero>
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
              <Send className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Dashboard Expedição</h2>
              <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Pedidos e entregas — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
          {prontoEntrega.length > 0 && (
            <div className="flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(0,198,76,0.1)", border: "1px solid rgba(0,198,76,0.2)" }}>
              <Package className="h-4 w-4" style={{ color: "#00C64C" }} />
              <span className="text-xs font-semibold text-white">{prontoEntrega.length} pronto(s) para entrega</span>
            </div>
          )}
        </div>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard label="Pendentes" value={pendentes.length} icon={Clock} color="text-gray-500" bg="bg-gray-500/10" />
        <StatsCard label="Aguardando" value={aguardando.length} icon={AlertCircle} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Pronto Entrega" value={prontoEntrega.length} icon={Package} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Em Rota" value={emRota.length} icon={Truck} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Entregues" value={entregues.length} icon={CheckCircle2} color="text-teal-500" bg="bg-teal-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Progresso de Entregas</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Entregues</span>
            <span className="font-medium">{entregues.length}/{total}</span>
          </div>
          <Progress value={total > 0 ? (entregues.length / total) * 100 : 0} className="h-2" />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          Todos os Pedidos
        </h3>
        <div className="space-y-2">
          {data.expedicoes.filter((e: any) => e.statusEntrega !== "entregue" && e.statusEntrega !== "cancelado").map((exp: any) => {
            const st = statusMap[exp.statusEntrega] || { label: exp.statusEntrega, variant: "secondary" };
            return (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{exp.nomeFantasia}</p>
                  <p className="text-xs text-muted-foreground">{exp.descricaoProduto} — {exp.kilo}kg — {exp.rota || "Sem rota"}</p>
                </div>
                <Badge variant={st.variant as any}>{st.label}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
