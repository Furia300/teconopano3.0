import {
  Package, Truck, Clock, CheckCircle2, AlertCircle, MapPin,
} from "lucide-react";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
      <div className="bg-gradient-to-r from-[#ed1b24] to-[#8b0000] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Expedição</h1>
            <p className="text-white/70 text-sm mt-1">Pedidos e entregas — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          {prontoEntrega.length > 0 && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
              <Package className="h-5 w-5 text-green-300" />
              <span className="text-sm font-semibold">{prontoEntrega.length} pronto(s) para entrega</span>
            </div>
          )}
        </div>
      </div>

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
