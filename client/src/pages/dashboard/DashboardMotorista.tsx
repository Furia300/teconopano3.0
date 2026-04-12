import { Truck, Factory, Scissors, Package } from "lucide-react";
import type { DashboardData } from "@/types/dashboard";
import { StatsCard } from "@/components/domain/StatsCard";
import { PageHero } from "@/composites/PageHero";

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
      <PageHero>
        <div className="relative flex items-start gap-4 px-6 py-5 sm:px-7 sm:py-6">
          <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
            <Truck className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Painel do Motorista</h2>
            <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Olá, {userName}. Você recebe ordens da Expedição e do Galpão.</p>
          </div>
        </div>
      </PageHero>

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
