import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import { ExpedicaoDashboard } from "./ExpedicaoDashboard";

interface Expedicao {
  id: string;
  clienteId?: string;
  nomeFantasia?: string;
  descricaoProduto?: string;
  tipoMaterial?: string;
  kilo?: number;
  kiloSolicitada?: number;
  statusPedido?: string;
  statusEntrega?: string;
  statusFinanceiro?: string;
  galpao?: string;
  rota?: string;
  periodicidade?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function DashboardExpedicaoPage() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/expedicoes")
      .then((r) => r.json())
      .then(setExpedicoes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendentes = expedicoes.filter((e) => e.statusEntrega === "pendente" || !e.statusEntrega).length;
  const emRota = expedicoes.filter((e) => e.statusEntrega === "em_rota").length;
  const entregues = expedicoes.filter((e) => e.statusEntrega === "entregue").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Expedição"
        description="Visão analítica de pedidos, clientes e movimentação de expedição"
        icon={Send}
        actions={<DashboardPrintButton title="Dashboard Expedição" />}
        stats={[
          { label: "Total", value: expedicoes.length, color: "#93BDE4" },
          { label: "Pendentes", value: pendentes, color: "#FDC24E" },
          { label: "Em rota", value: emRota, color: "#00C64C" },
          { label: "Entregues", value: entregues, color: "#ed1b24" },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-[var(--fips-fg-muted)]">
          Carregando dados...
        </div>
      ) : (
        <ExpedicaoDashboard expedicoes={expedicoes} />
      )}
    </div>
  );
}
