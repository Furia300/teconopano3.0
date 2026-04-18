import { useState } from "react";
import { toast } from "sonner";
import { LuTruck, LuFactory, LuScissors, LuPackage, LuCircleCheck, LuNavigation, LuMapPin } from "react-icons/lu";
const Truck = LuTruck, Factory = LuFactory, Scissors = LuScissors, Package = LuPackage, CheckCircle2 = LuCircleCheck, Navigation = LuNavigation, MapPin = LuMapPin;
import type { DashboardData } from "@/types/dashboard";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/composites/PageHero";

interface Props {
  data: DashboardData;
  userName: string;
  onRefresh?: () => void;
}

export default function DashboardMotorista({ data, userName, onRefresh }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const coletas = data.coletas.filter((c: any) => ["pendente", "agendado", "em_rota"].includes((c.status || "").toLowerCase()));
  const costureiras = data.costureira.filter((c: any) => ["enviado", "retorno_pendente", "aguardando_retorno"].includes((c.status || "").toLowerCase()));
  const entregas = data.expedicoes.filter((e: any) => {
    const stEntrega = (e.statusEntrega || "").toLowerCase();
    const stNota = (e.statusNota || "").toLowerCase();
    return stNota === "emitida" && ["pronto_entrega", "em_rota"].includes(stEntrega);
  });

  const handleEmRota = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/expedicoes/${id}/em-rota`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success("Pedido em rota!");
      onRefresh?.();
    } catch {
      toast.error("Erro ao marcar em rota.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleEntregue = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/expedicoes/${id}/entregar`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success("Entrega confirmada!");
      onRefresh?.();
    } catch {
      toast.error("Erro ao confirmar entrega.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHero>
        <div className="relative flex items-start gap-4 px-6 py-5 sm:px-7 sm:py-6">
          <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
            <Truck className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Dashboard do Motorista</h2>
            <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Olá, {userName}. Você recebe ordens da Expedição e do Galpão.</p>
          </div>
        </div>
      </PageHero>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Coletas de Matéria-Prima" value={coletas.length} icon={Factory} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Rotas Costureira" value={costureiras.length} icon={Scissors} color="text-fuchsia-500" bg="bg-fuchsia-500/10" />
        <StatsCard label="Entregas ao Cliente" value={entregas.length} icon={Package} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      {/* Entregas ao Cliente */}
      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-500" />
          Entregas ao Cliente
        </h3>
        {entregas.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
            <p className="text-sm font-medium">Nenhuma entrega pendente!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entregas.map((exp: any) => {
              const stEntrega = (exp.statusEntrega || "").toLowerCase();
              const isEmRota = stEntrega === "em_rota";
              const isPronto = stEntrega === "pronto_entrega";
              return (
                <div key={exp.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border"
                  style={{
                    background: isEmRota ? "rgba(59,130,246,0.05)" : "rgba(22,163,74,0.05)",
                    borderColor: isEmRota ? "rgba(59,130,246,0.15)" : "rgba(22,163,74,0.15)",
                  }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{exp.nomeFantasia}</p>
                    <p className="text-xs text-muted-foreground">
                      {exp.descricaoProduto} — {exp.kilo}kg — NF: {exp.notaFiscal || "—"}
                    </p>
                    {exp.rota && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {exp.rota}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPronto && (
                      <>
                        <Badge variant="warning">Pronto</Badge>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleEmRota(exp.id)}
                          loading={loadingId === exp.id}
                          className="gap-1 text-xs"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          Saiu p/ Entrega
                        </Button>
                      </>
                    )}
                    {isEmRota && (
                      <>
                        <Badge variant="info">Em Rota</Badge>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleEntregue(exp.id)}
                          loading={loadingId === exp.id}
                          className="gap-1 text-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Entregue
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coletas */}
      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Factory className="h-5 w-5 text-blue-500" />
          Coletas Pendentes
        </h3>
        {coletas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma coleta pendente</p>
        ) : (
          <div className="space-y-2">
            {coletas.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <div>
                  <p className="font-medium text-sm">Coleta #{c.numero} — {c.nomeFantasia || c.fornecedor || "—"}</p>
                  <p className="text-xs text-muted-foreground">{c.pesoTotal || c.pesoTotalNF || 0}kg</p>
                </div>
                <Badge variant={c.status === "em_rota" ? "info" : "warning"}>{c.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Costureiras */}
      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-fuchsia-500" />
          Rotas Costureira
        </h3>
        {costureiras.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma rota de costureira pendente</p>
        ) : (
          <div className="space-y-2">
            {costureiras.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-fuchsia-500/5 rounded-lg border border-fuchsia-500/10">
                <div>
                  <p className="font-medium text-sm">{c.costureira || "Costureira"} — {c.tipoMaterial || "—"}</p>
                  <p className="text-xs text-muted-foreground">{c.qtdsSaidaKg || 0}kg</p>
                </div>
                <Badge variant="warning">{c.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
