import { useEffect, useState } from "react";
import { LuLayoutDashboard, LuTrendingUp } from "react-icons/lu";
import { Truck } from "lucide-react";
const DashboardIcon = LuLayoutDashboard;
const TrendingUp = LuTrendingUp;
import { PageHeader } from "@/components/domain/PageHeader";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import { ColetaDashboard } from "./ColetaDashboard";
import { RendimentoFornecedorTab } from "./RendimentoFornecedorTab";

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

const TABS = [
  { id: "visao-geral", label: "Visão Geral", icon: Truck },
  { id: "rendimento", label: "Rendimento Fornecedor", icon: TrendingUp },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DashboardColetaPage() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("visao-geral");

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
        icon={DashboardIcon}
        actions={<DashboardPrintButton title="Dashboard Coleta" />}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Em andamento", value: stats.emAndamento, color: "#00C64C" },
          { label: "Finalizados", value: stats.finalizados, color: "#ed1b24" },
        ]}
      />

      {/* Tabs no padrão FIPS DS */}
      <div
        className="flex items-center gap-0.5 p-1"
        style={{
          background: "var(--fips-surface)",
          border: "1px solid var(--fips-border)",
          borderRadius: "10px 10px 10px 18px",
          boxShadow: "var(--shadow-card)",
          width: "fit-content",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold transition-all"
              style={{
                borderRadius: "8px 8px 8px 14px",
                background: active
                  ? "rgba(0,75,155,0.15)"
                  : "transparent",
                color: active
                  ? "var(--fips-primary)"
                  : "var(--fips-fg-muted)",
                border: active
                  ? "1px solid var(--fips-primary)"
                  : "1px solid transparent",
                cursor: "pointer",
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "visao-geral" && (
        loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-[var(--fips-fg-muted)]">
            Carregando dados...
          </div>
        ) : (
          <ColetaDashboard coletas={coletas} />
        )
      )}

      {activeTab === "rendimento" && <RendimentoFornecedorTab />}
    </div>
  );
}
