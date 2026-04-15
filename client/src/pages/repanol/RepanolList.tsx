import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Droplets,
  Plus,
  ArrowRight,
  ArrowLeft,
  Weight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
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
import { NovoRepanolDialog } from "./NovoRepanolDialog";
import { RepanolRetornoDialog } from "./RepanolRetornoDialog";

/* ─── Cores FIPS DS canônicas para os Cards Relatório ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

/* ─── Tipos ─── */
interface Repanol {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  empresaFornecedor: string;
  tipoMaterial: string;
  dataEnvio: string | null;
  dataRetorno: string | null;
  pesoManchadoEnvio: number;
  pesoMolhadoEnvio: number;
  pesoTingidoEnvio: number;
  pesoManchadoRetorno: number;
  pesoMolhadoRetorno: number;
  pesoTingidoRetorno: number;
  repanolResiduo: number;
  status: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: "warning" | "info" | "success" | "secondary" }
> = {
  pendente: { label: "Pendente Envio", variant: "warning" },
  enviado: { label: "Enviado", variant: "info" },
  retornado: { label: "Retornado", variant: "success" },
};

/* ─── Helpers ─── */
const totalEnvio = (r: Repanol) =>
  r.pesoManchadoEnvio + r.pesoMolhadoEnvio + r.pesoTingidoEnvio;

const totalRetorno = (r: Repanol) =>
  r.pesoManchadoRetorno + r.pesoMolhadoRetorno + r.pesoTingidoRetorno;

const formatDateBR = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

/* ─── Componente principal ─── */
export default function RepanolList() {
  const [repanois, setRepanois] = useState<Repanol[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [retornoItem, setRetornoItem] = useState<Repanol | null>(null);

  const fetchRepanois = async () => {
    try {
      const res = await fetch("/api/repanol");
      const data = await res.json();
      setRepanois(data);
    } catch (err) {
      console.error("Erro ao buscar repanol:", err);
      toast.error("Erro ao carregar dados de repanol");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepanois();
  }, []);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    const total = repanois.length;
    const enviados = repanois.filter((r) => r.status === "enviado").length;
    const pesoEnviado = repanois
      .filter((r) => r.status === "enviado")
      .reduce((acc, r) => acc + totalEnvio(r), 0);
    const residuoTotal = repanois.reduce(
      (acc, r) => acc + r.repanolResiduo,
      0,
    );
    return { total, enviados, pesoEnviado, residuoTotal };
  }, [repanois]);

  /* ─── Materiais únicos para o filtro ─── */
  const materiaisUnicos = useMemo(() => {
    const materiais = new Set<string>();
    repanois.forEach((r) => {
      if (r.tipoMaterial) materiais.add(r.tipoMaterial);
    });
    return Array.from(materiais).sort();
  }, [repanois]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    return repanois.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.fornecedor.toLowerCase().includes(q) ||
        r.tipoMaterial.toLowerCase().includes(q) ||
        r.empresaFornecedor.toLowerCase().includes(q) ||
        String(r.coletaNumero).includes(q);
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchMaterial = !filterMaterial || r.tipoMaterial === filterMaterial;
      return matchSearch && matchStatus && matchMaterial;
    });
  }, [repanois, search, filterStatus, filterMaterial]);

  const activeFilters = [filterStatus, filterMaterial].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Repanol"
        description="Envio e retorno de material para tratamento externo (tingimento/lavagem)"
        icon={Droplets}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Enviados", value: stats.enviados, color: "#FDC24E" },
          {
            label: "Peso Enviado",
            value: `${stats.pesoEnviado.toLocaleString("pt-BR")}kg`,
            color: "#00C64C",
          },
          {
            label: "Resíduo",
            value: `${stats.residuoTotal.toLocaleString("pt-BR")}kg`,
            color: "#ed1b24",
          },
        ]}
        actions={
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--fips-primary)] px-3 py-1.5 text-[11px] font-bold text-white shadow transition-colors hover:bg-[var(--fips-primary-hover)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Envio
          </button>
        }
      />

      {/* ─── Cards Relatório — padrão FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Registros"
          value={stats.total}
          subtitle="Cadastrados no sistema"
          icon={Droplets}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Aguardando Retorno"
          value={stats.enviados}
          subtitle="Enviados para tratamento"
          icon={Clock}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Peso em Trânsito"
          value={`${stats.pesoEnviado.toLocaleString("pt-BR")} kg`}
          subtitle="Volume aguardando retorno"
          icon={Scale}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Resíduo Total"
          value={`${stats.residuoTotal.toLocaleString("pt-BR")} kg`}
          subtitle="Perda acumulada no processo"
          icon={AlertTriangle}
          color={FIPS_COLORS.verdeFloresta}
        />
      </div>

      {/* ─── Toolbar — padrão FIPS DS Data Listing ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por fornecedor, material, empresa..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            {/* Status */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Status
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todos os status" },
                  { v: "pendente", l: "Pendente Envio" },
                  { v: "enviado", l: "Enviado" },
                  { v: "retornado", l: "Retornado" },
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

            {/* Material */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Tipo de Material
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFilterMaterial("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filterMaterial
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todos os materiais
                </button>
                {materiaisUnicos.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setFilterMaterial(mat)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterMaterial === mat
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {mat}
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
      <DataListingTable<Repanol>
        icon={<Droplets className="h-[22px] w-[22px]" />}
        title="Repanol"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(r) => r.id}
        emptyState={
          loading
            ? "Carregando..."
            : "Nenhum registro de repanol encontrado"
        }
        columns={repanolColumns({ onRetorno: (rep) => setRetornoItem(rep) })}
      />

      <NovoRepanolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchRepanois}
      />

      {retornoItem && (
        <RepanolRetornoDialog
          repanol={retornoItem}
          open={!!retornoItem}
          onOpenChange={(open) => {
            if (!open) setRetornoItem(null);
          }}
          onSuccess={fetchRepanois}
        />
      )}
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

interface RepanolColumnActions {
  onRetorno: (rep: Repanol) => void;
}

function repanolColumns({
  onRetorno,
}: RepanolColumnActions): DataListingColumn<Repanol>[] {
  return [
    {
      id: "coleta",
      label: "Coleta",
      fixed: true,
      sortable: true,
      width: "80px",
      render: (r) => <CellMonoStrong>#{r.coletaNumero}</CellMonoStrong>,
    },
    {
      id: "fornecedor",
      label: "Fornecedor Origem",
      sortable: true,
      width: "150px",
      render: (r) => (
        <div
          className="truncate max-w-[140px]"
          title={r.fornecedor}
        >
          <span className="text-[11px] font-semibold text-[var(--fips-fg)]">
            {r.fornecedor}
          </span>
        </div>
      ),
    },
    {
      id: "empresa",
      label: "Empresa Repanol",
      sortable: true,
      width: "140px",
      render: (r) => (
        <CellMuted>{r.empresaFornecedor || "—"}</CellMuted>
      ),
    },
    {
      id: "material",
      label: "Material",
      sortable: true,
      width: "100px",
      render: (r) => (
        <Badge variant="outline">{r.tipoMaterial}</Badge>
      ),
    },
    {
      id: "envio",
      label: "Envio",
      sortable: true,
      align: "right",
      width: "120px",
      render: (r) => {
        const envio = totalEnvio(r);
        return (
          <div className="text-right">
            <div className="text-[9px] text-[var(--fips-fg-muted)]">
              M: {r.pesoManchadoEnvio} · Mo: {r.pesoMolhadoEnvio} · T:{" "}
              {r.pesoTingidoEnvio}
            </div>
            <CellMonoStrong align="right">{envio} kg</CellMonoStrong>
          </div>
        );
      },
    },
    {
      id: "retorno",
      label: "Retorno",
      sortable: true,
      align: "right",
      width: "120px",
      render: (r) => {
        if (r.status !== "retornado") {
          return <CellMuted>—</CellMuted>;
        }
        const retorno = totalRetorno(r);
        return (
          <div className="text-right">
            <div className="text-[9px] text-[var(--fips-fg-muted)]">
              M: {r.pesoManchadoRetorno} · Mo: {r.pesoMolhadoRetorno} · T:{" "}
              {r.pesoTingidoRetorno}
            </div>
            <CellMonoStrong align="right">{retorno} kg</CellMonoStrong>
          </div>
        );
      },
    },
    {
      id: "residuo",
      label: "Resíduo",
      sortable: true,
      align: "right",
      width: "80px",
      render: (r) => {
        const envio = totalEnvio(r);
        const retorno = totalRetorno(r);
        const diff = envio - retorno;
        if (r.repanolResiduo > 0) {
          return (
            <CellMonoStrong align="right">
              <span className="text-[var(--fips-danger)]">
                {r.repanolResiduo} kg
              </span>
            </CellMonoStrong>
          );
        }
        if (r.status === "retornado" && diff > 0) {
          return (
            <CellMonoStrong align="right">
              <span className="text-[var(--fips-danger)]">{diff} kg</span>
            </CellMonoStrong>
          );
        }
        return <CellMuted>—</CellMuted>;
      },
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "110px",
      render: (r) => {
        const sc = statusConfig[r.status] || {
          label: r.status,
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
      width: "70px",
      render: (r) => {
        if (r.status === "enviado") {
          return (
            <CellActions>
              <CellActionButton
                title="Registrar retorno"
                icon={<ArrowLeft className="h-3.5 w-3.5 text-[var(--fips-primary)]" />}
                onClick={() => onRetorno(r)}
              />
            </CellActions>
          );
        }
        if (r.status === "retornado") {
          return (
            <CellActions>
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--fips-success-strong)]" />
            </CellActions>
          );
        }
        return <CellActions />;
      },
    },
  ];
}
