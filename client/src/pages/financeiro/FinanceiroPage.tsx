import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  DollarSign,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Scale,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { Avatar } from "@/components/domain/Avatar";
import {
  DataListingTable,
  type DataListingColumn,
  CellMonoStrong,
  CellMonoMuted,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";

/* ─── Cores FIPS DS canônicas para os Cards Relatório ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

/* ─── Tipos ─── */
interface Expedicao {
  id: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  descricaoProduto?: string | null;
  tipoMaterial?: string | null;
  kilo?: number | null;
  unidade?: number | null;
  statusFinanceiro?: string | null;
  statusEntrega?: string | null;
  rota?: string | null;
  prioridade?: string | null;
  createdAt?: string | null;
  observacaoEscritorio?: string | null;
}

const STATUS_FIN_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  pendente_aprovacao: { label: "Pendente", variant: "warning" },
  aprovado: { label: "Aprovado", variant: "success" },
  rejeitado: { label: "Rejeitado", variant: "danger" },
};

const PRIORIDADE_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  Urgente: { label: "Urgente", variant: "danger" },
  Normal: { label: "Normal", variant: "info" },
  Baixa: { label: "Baixa", variant: "secondary" },
};

/* ─── Componente principal ─── */
export default function FinanceiroPage() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");
  const [filterRota, setFilterRota] = useState<string>("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/expedicoes");
      const data = await res.json();
      setExpedicoes(data);
    } catch {
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    const pendentes = expedicoes.filter(
      (e) => e.statusFinanceiro === "pendente_aprovacao",
    ).length;
    const aprovados = expedicoes.filter(
      (e) => e.statusFinanceiro === "aprovado",
    ).length;
    const pesoTotalPendente = expedicoes
      .filter((e) => e.statusFinanceiro === "pendente_aprovacao")
      .reduce((acc, e) => acc + (e.kilo ?? 0), 0);
    const total = expedicoes.length;
    return { pendentes, aprovados, pesoTotalPendente, total };
  }, [expedicoes]);

  /* ─── Rotas únicas para o filtro ─── */
  const rotasUnicas = useMemo(() => {
    const rotas = new Set<string>();
    expedicoes.forEach((e) => {
      if (e.rota) rotas.add(e.rota);
    });
    return Array.from(rotas).sort();
  }, [expedicoes]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    return expedicoes.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (e.nomeFantasia ?? "").toLowerCase().includes(q) ||
        (e.descricaoProduto ?? "").toLowerCase().includes(q) ||
        (e.cnpj ?? "").toLowerCase().includes(q);
      const matchStatus = !filterStatus || e.statusFinanceiro === filterStatus;
      const matchPrioridade = !filterPrioridade || e.prioridade === filterPrioridade;
      const matchRota = !filterRota || e.rota === filterRota;
      return matchSearch && matchStatus && matchPrioridade && matchRota;
    });
  }, [expedicoes, search, filterStatus, filterPrioridade, filterRota]);

  const activeFilters = [filterStatus, filterPrioridade, filterRota].filter(Boolean).length;

  /* ─── Aprovar financeiro ─── */
  const handleAprovar = async (id: string) => {
    try {
      const res = await fetch(`/api/expedicoes/${id}/aprovar-financeiro`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success("Pagamento aprovado!");
      fetchData();
    } catch {
      toast.error("Erro ao aprovar pagamento.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Financeiro"
        description="Aprovação de pagamentos para liberação de notas fiscais"
        icon={DollarSign}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Aprovados", value: stats.aprovados, color: "#00C64C" },
          {
            label: "Peso Pendente",
            value: `${stats.pesoTotalPendente.toLocaleString("pt-BR")}kg`,
            color: "#ed1b24",
          },
        ]}
      />

      {/* ─── Cards Relatório — padrão FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Pendentes Aprovação"
          value={stats.pendentes}
          subtitle="Aguardando análise financeira"
          icon={Clock}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Aprovados"
          value={stats.aprovados}
          subtitle="Prontos para NF / entrega"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Peso Total Pendente"
          value={`${stats.pesoTotalPendente.toLocaleString("pt-BR")} kg`}
          subtitle="Volume aguardando aprovação"
          icon={Scale}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Total Pedidos"
          value={stats.total}
          subtitle="Cadastrados no sistema"
          icon={DollarSign}
          color={FIPS_COLORS.azulProfundo}
        />
      </div>

      {/* ─── Toolbar — padrão FIPS DS Data Listing ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente, produto ou CNPJ..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            {/* Status Financeiro */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Status Financeiro
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todos os status" },
                  { v: "pendente_aprovacao", l: "Pendente" },
                  { v: "aprovado", l: "Aprovado" },
                  { v: "rejeitado", l: "Rejeitado" },
                ].map((opt) => (
                  <button
                    key={opt.v || "todos-status"}
                    onClick={() => setFilterStatus(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterStatus === opt.v
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Prioridade
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todas" },
                  { v: "Urgente", l: "Urgente" },
                  { v: "Normal", l: "Normal" },
                  { v: "Baixa", l: "Baixa" },
                ].map((opt) => (
                  <button
                    key={opt.v || "todos-prio"}
                    onClick={() => setFilterPrioridade(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterPrioridade === opt.v
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Rota */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Rota
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFilterRota("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filterRota
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todas as rotas
                </button>
                {rotasUnicas.map((rota) => (
                  <button
                    key={rota}
                    onClick={() => setFilterRota(rota)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterRota === rota
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {rota}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel — placeholder")}
        onExportPdf={() => alert("Export PDF — placeholder")}
      />

      {/* ─── Tabela canônica DS-FIPS — Data Listing ─── */}
      <DataListingTable<Expedicao>
        icon={<DollarSign className="h-[22px] w-[22px]" />}
        title="Financeiro"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(e) => e.id}
        emptyState={
          loading
            ? "Carregando..."
            : "Nenhuma pendência financeira encontrada"
        }
        columns={financeiroColumns({ onAprovar: handleAprovar })}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

interface FinanceiroColumnActions {
  onAprovar: (id: string) => void;
}

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} kg` : "—";

function financeiroColumns({ onAprovar }: FinanceiroColumnActions): DataListingColumn<Expedicao>[] {
  return [
    {
      id: "cliente",
      label: "Cliente",
      fixed: true,
      sortable: true,
      render: (e, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={e.nomeFantasia || "—"}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">
              {e.nomeFantasia || "—"}
            </div>
            {e.cnpj && (
              <div className="text-[10px] text-[var(--fips-fg-muted)]">
                {e.cnpj}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "produto",
      label: "Produto",
      sortable: true,
      render: (e) => (
        <div>
          <div className="text-[var(--fips-fg)]">
            {e.descricaoProduto || "—"}
          </div>
        </div>
      ),
    },
    {
      id: "material",
      label: "Material",
      sortable: true,
      render: (e) => <CellMuted>{e.tipoMaterial || "—"}</CellMuted>,
    },
    {
      id: "qtdePeso",
      label: "Qtde/Peso",
      sortable: true,
      align: "right",
      render: (e) => (
        <div className="text-right">
          {(e.unidade ?? 0) > 0 && (
            <div className="text-[10px] text-[var(--fips-fg-muted)]">
              {e.unidade} un
            </div>
          )}
          <CellMonoStrong align="right">{formatKg(e.kilo)}</CellMonoStrong>
        </div>
      ),
    },
    {
      id: "prioridade",
      label: "Prioridade",
      sortable: true,
      render: (e) => {
        const pc = PRIORIDADE_VARIANTS[e.prioridade ?? "Normal"] || {
          label: e.prioridade || "—",
          variant: "secondary" as const,
        };
        return (
          <Badge variant={pc.variant} dot>
            {pc.label}
          </Badge>
        );
      },
    },
    {
      id: "rota",
      label: "Rota",
      sortable: true,
      width: "70px",
      render: (e) => <CellMonoMuted>{e.rota || "—"}</CellMonoMuted>,
    },
    {
      id: "data",
      label: "Data",
      sortable: true,
      render: (e) => <CellMonoMuted>{formatDateBR(e.createdAt)}</CellMonoMuted>,
    },
    {
      id: "statusFinanceiro",
      label: "Status",
      sortable: true,
      render: (e) => {
        const sc = STATUS_FIN_VARIANTS[e.statusFinanceiro ?? "pendente_aprovacao"] || {
          label: e.statusFinanceiro || "—",
          variant: "secondary" as const,
        };
        return (
          <Badge variant={sc.variant} dot>
            {sc.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      label: "Ação",
      fixed: true,
      align: "center",
      width: "80px",
      render: (e) => {
        if (e.statusFinanceiro === "aprovado") {
          return (
            <CellActions>
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--fips-success-strong)]" />
            </CellActions>
          );
        }
        return (
          <CellActions>
            <CellActionButton
              title="Aprovar pagamento"
              icon={<Check className="h-3.5 w-3.5" />}
              onClick={() => onAprovar(e.id)}
            />
          </CellActions>
        );
      },
    },
  ];
}
