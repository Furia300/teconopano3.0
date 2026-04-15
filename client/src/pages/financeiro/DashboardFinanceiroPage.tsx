import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import { FinanceiroDashboard } from "./FinanceiroDashboard";

interface Expedicao {
  id: string;
  clienteId?: string;
  nomeFantasia?: string;
  descricaoProduto?: string;
  tipoMaterial?: string;
  kilo?: number;
  kiloSolicitada?: number;
  qtdePedido?: number;
  statusPedido?: string;
  statusEntrega?: string;
  statusFinanceiro?: string;
  statusNota?: string;
  notaFiscal?: string;
  dataEmissaoNota?: string;
  galpao?: string;
  rota?: string;
  prioridade?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function DashboardFinanceiroPage() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/expedicoes")
      .then((r) => r.json())
      .then(setExpedicoes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendentes = expedicoes.filter((e) => e.statusFinanceiro === "pendente_aprovacao").length;
  const aprovados = expedicoes.filter((e) => e.statusFinanceiro === "aprovado").length;
  const nfEmitidas = expedicoes.filter((e) => e.statusNota === "emitida").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Financeiro"
        description="Visão analítica de aprovações, notas fiscais e fluxo financeiro"
        icon={DollarSign}
        actions={<DashboardPrintButton title="Dashboard Financeiro" />}
        stats={[
          { label: "Total", value: expedicoes.length, color: "#93BDE4" },
          { label: "Pendentes", value: pendentes, color: "#FDC24E" },
          { label: "Aprovados", value: aprovados, color: "#00C64C" },
          { label: "NF Emitidas", value: nfEmitidas, color: "#ed1b24" },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-[var(--fips-fg-muted)]">
          Carregando dados...
        </div>
      ) : (
        <FinanceiroDashboard expedicoes={expedicoes} />
      )}
    </div>
  );
}
