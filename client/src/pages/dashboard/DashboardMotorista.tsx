import { Truck, Factory, Scissors, Package } from "lucide-react";
import type { DashboardData } from "@/types/dashboard";
import { StatsCard } from "@/components/domain/StatsCard";

interface Props {
  data: DashboardData;
  userName: string;
}

export default function DashboardMotorista({ data, userName }: Props) {
  const coletas = data.coletas.filter((c: any) => ["pendente", "agendado", "em_rota"].includes((c.status || "").toLowerCase()));
  const costureiras = data.costureira.filter((c: any) => ["enviado", "retorno_pendente", "aguardando_retorno"].includes((c.status || "").toLowerCase()));
  const entregas = data.expedicoes.filter((e: any) => {
    const stEntrega = (e.statusEntrega || "").toLowerCase();
    const stNota = (e.statusNota || "").toLowerCase();
    return stNota === "emitida" && ["pronto_entrega", "em_rota", "pendente"].includes(stEntrega);
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Painel do Motorista</h1>
        <p className="text-white/70 text-sm mt-1">
          Olá, {userName}. Você recebe ordens da Expedição e do Galpão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Coletas de Matéria-Prima" value={coletas.length} icon={Factory} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Rotas Costureira" value={costureiras.length} icon={Scissors} color="text-fuchsia-500" bg="bg-fuchsia-500/10" />
        <StatsCard label="Entregas ao Cliente" value={entregas.length} icon={Package} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          Rotas do Dia
        </h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe as ordens detalhadas no menu <strong>Expedição &gt; Motorista</strong>.
        </p>
      </div>
    </div>
  );
}
