import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import { ColetaDashboard } from "./ColetaDashboard";

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  cnpjFornecedor: string;
  pesoTotalNF: number;
  pesoTotalAtual: number;
  dataPedido: string;
  dataChegada: string | null;
  status: string;
  fornecedorId: string;
  recorrencia?: string | null;
}

export default function DashboardColetaPage() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coletas")
      .then((r) => r.json())
      .then(setColetas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: coletas.length,
    pendentes: coletas.filter((c) => c.status === "pendente" || c.status === "agendado").length,
    emAndamento: coletas.filter((c) => ["em_rota", "recebido", "em_separacao", "em_producao"].includes(c.status)).length,
    finalizados: coletas.filter((c) => c.status === "finalizado").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Coleta"
        description="Visão analítica de coletas, fornecedores e movimentação de matéria-prima"
        icon={Truck}
        actions={<DashboardPrintButton title="Dashboard Coleta" />}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Em andamento", value: stats.emAndamento, color: "#00C64C" },
          { label: "Finalizados", value: stats.finalizados, color: "#ed1b24" },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-[var(--fips-fg-muted)]">
          Carregando dados...
        </div>
      ) : (
        <ColetaDashboard coletas={coletas} />
      )}
    </div>
  );
}
