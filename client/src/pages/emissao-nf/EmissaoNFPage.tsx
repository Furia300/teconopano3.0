import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle2,
  Printer,
  Package,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { Avatar } from "@/components/domain/Avatar";
import {
  DataListingTable,
  type DataListingColumn,
  CellMonoMuted,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";

interface Expedicao {
  id: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  descricaoProduto?: string | null;
  tipoMaterial?: string | null;
  kilo?: number | null;
  unidade?: number | null;
  statusFinanceiro?: string | null;
  statusNota?: string | null;
  statusEntrega?: string | null;
  rota?: string | null;
  prioridade?: string | null;
  notaFiscal?: string | null;
  createdAt?: string | null;
}

const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

const STATUS_NF_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  pendente_emissao: { label: "Pendente Emissao", variant: "warning" },
  emitida: { label: "Emitida", variant: "success" },
};

export default function EmissaoNFPage() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Ultimos 30 dias");
  const [filterStatusNF, setFilterStatusNF] = useState<string>("");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/expedicoes");
      const data = await res.json();
      setExpedicoes(data);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return expedicoes.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (e.nomeFantasia ?? "").toLowerCase().includes(q) ||
        (e.descricaoProduto ?? "").toLowerCase().includes(q) ||
        (e.notaFiscal ?? "").toLowerCase().includes(q);
      const matchStatusNF = !filterStatusNF || e.statusNota === filterStatusNF;
      const matchPrioridade = !filterPrioridade || e.prioridade === filterPrioridade;
      return matchSearch && matchStatusNF && matchPrioridade;
    });
  }, [expedicoes, search, filterStatusNF, filterPrioridade]);

  const stats = useMemo(() => {
    const pendentes = expedicoes.filter(
      (e) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao",
    ).length;
    const emitidas = expedicoes.filter((e) => e.statusNota === "emitida").length;
    const pesoPendente = expedicoes
      .filter((e) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao")
      .reduce((acc, e) => acc + (e.kilo ?? 0), 0);
    const total = expedicoes.length;
    return { pendentes, emitidas, pesoPendente, total };
  }, [expedicoes]);

  const handleEmitir = async (id: string) => {
    try {
      const res = await fetch(`/api/expedicoes/${id}/emitir-nf`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success("Nota fiscal emitida!");
      fetchData();
    } catch {
      toast.error("Erro ao emitir nota fiscal.");
    }
  };

  const activeFilters = (filterStatusNF ? 1 : 0) + (filterPrioridade ? 1 : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emissao de Notas Fiscais"
        description="Notas pendentes de emissao — aprovadas pelo financeiro"
        icon={FileText}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Emitidas", value: stats.emitidas, color: "#00C64C" },
          {
            label: "Peso Pendente",
            value: `${stats.pesoPendente.toLocaleString("pt-BR")}kg`,
            color: "#ed1b24",
          },
        ]}
      />

      {/* Cards Relatorio — padrao FIPS DS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Pendentes Emissao"
          value={stats.pendentes}
          subtitle="Aprovadas aguardando NF"
          icon={Clock}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="NFs Emitidas"
          value={stats.emitidas}
          subtitle="Notas fiscais geradas"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Peso Total Pendente"
          value={`${stats.pesoPendente.toLocaleString("pt-BR")} kg`}
          subtitle="Kg aguardando emissao"
          icon={Package}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Total Pedidos"
          value={stats.total}
          subtitle="Cadastrados no sistema"
          icon={FileText}
          color={FIPS_COLORS.azulProfundo}
        />
      </div>

      {/* Toolbar — padrao FIPS DS Data Listing */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente, produto ou NF..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Status NF
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFilterStatusNF("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filterStatusNF
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todos os status
                </button>
                {Object.entries(STATUS_NF_VARIANTS).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setFilterStatusNF(key)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterStatusNF === key
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Prioridade
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todas" },
                  { v: "Normal", l: "Normal" },
                  { v: "Urgente", l: "Urgente" },
                ].map((opt) => (
                  <button
                    key={opt.v || "todas"}
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
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel — placeholder")}
        onExportPdf={() => alert("Export PDF — placeholder")}
      />

      {/* Tabela canonica DS-FIPS — Data Listing */}
      <DataListingTable<Expedicao>
        icon={<FileText className="h-[22px] w-[22px]" />}
        title="Emissao NF"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || activeFilters ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(e) => e.id}
        emptyState={
          loading
            ? "Carregando..."
            : "Nenhuma nota fiscal pendente — todas as NFs foram emitidas"
        }
        columns={emissaoColumns({ onEmitir: handleEmitir })}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

interface EmissaoColumnActions {
  onEmitir: (id: string) => void;
}

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} kg` : "—";

function emissaoColumns({ onEmitir }: EmissaoColumnActions): DataListingColumn<Expedicao>[] {
  return [
    {
      id: "notaFiscal",
      label: "NF",
      sortable: true,
      width: "90px",
      render: (e) => <CellMuted>{e.notaFiscal || "—"}</CellMuted>,
    },
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
            <div className="font-semibold text-[var(--fips-fg)]">{e.nomeFantasia || "—"}</div>
            {e.cnpj && <div className="text-[10px] text-[var(--fips-fg-muted)]">{e.cnpj}</div>}
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
          <div className="text-[var(--fips-fg)]">{e.descricaoProduto || "—"}</div>
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
            <div className="text-[10px] text-[var(--fips-fg-muted)]">{e.unidade} un</div>
          )}
          <CellMonoMuted>{formatKg(e.kilo)}</CellMonoMuted>
        </div>
      ),
    },
    {
      id: "financeiro",
      label: "Financeiro",
      sortable: true,
      render: (e) => {
        const sf = e.statusFinanceiro;
        if (sf === "aprovado")
          return (
            <Badge variant="success" dot>
              Aprovado
            </Badge>
          );
        if (sf === "rejeitado")
          return (
            <Badge variant="danger" dot>
              Rejeitado
            </Badge>
          );
        return (
          <Badge variant="warning" dot>
            Pendente
          </Badge>
        );
      },
    },
    {
      id: "prioridade",
      label: "Prioridade",
      sortable: true,
      render: (e) => (
        <Badge variant={e.prioridade === "Urgente" ? "danger" : "secondary"}>
          {e.prioridade || "Normal"}
        </Badge>
      ),
    },
    {
      id: "dataPedido",
      label: "Data Pedido",
      sortable: true,
      render: (e) => <CellMonoMuted>{formatDateBR(e.createdAt)}</CellMonoMuted>,
    },
    {
      id: "statusNota",
      label: "Status NF",
      sortable: true,
      render: (e) => {
        const sc = STATUS_NF_VARIANTS[e.statusNota ?? "pendente_emissao"] || {
          label: e.statusNota || "—",
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
      label: "Acao",
      fixed: true,
      align: "center",
      width: "80px",
      render: (e) => (
        <CellActions>
          <CellActionButton
            title="Emitir NF"
            icon={<Printer className="h-3.5 w-3.5" />}
            onClick={() => onEmitir(e.id)}
          />
        </CellActions>
      ),
    },
  ];
}
