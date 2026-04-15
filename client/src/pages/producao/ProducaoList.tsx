import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Factory,
  Plus,
  QrCode,
  Weight,
  Package,
  Ruler,
  Eye,
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
import { Button } from "@/components/ui/button";
import { NovaProducaoDialog } from "./NovaProducaoDialog";

/* ─── Cores FIPS DS canônicas para os Cards Relatório ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

/* ─── Tipos ─── */
interface Producao {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  sala: string;
  tipoMaterial: string;
  cor: string;
  acabamento: string;
  medida: string;
  kilo: number;
  pesoMedio: number;
  qtdePacote: number;
  unidadeSaida: string;
  statusEstoque: string;
  operador: string;
  dataCriacao: string;
}

const SALAS = [
  "CORTE 01", "CORTE 02", "CORTE 03", "CORTE 04", "CORTE 05",
  "CORTE VLI", "FAIXA",
];

const salaSaidaMap: Record<string, string> = {
  "CORTE 01": "unidade",
  "CORTE 02": "unidade",
  "CORTE 03": "unidade",
  "CORTE 04": "unidade",
  "CORTE 05": "kilo",
  "CORTE VLI": "kilo",
  "FAIXA": "kilo",
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  pendente: { label: "Pendente", variant: "warning" },
  em_estoque: { label: "No Estoque", variant: "success" },
  em_andamento: { label: "Em Andamento", variant: "info" },
};

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} kg` : "—";

/* ─── Componente principal ─── */
export default function ProducaoList() {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterSala, setFilterSala] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSaida, setFilterSaida] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProducoes = useCallback(async () => {
    try {
      const res = await fetch("/api/producoes");
      const data = await res.json();
      setProducoes(data);
    } catch (err) {
      console.error("Erro ao buscar produções:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducoes();
  }, [fetchProducoes]);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    let pesoTotal = 0;
    let porUnidade = 0;
    let porKilo = 0;
    for (let i = 0; i < producoes.length; i++) {
      const p = producoes[i];
      pesoTotal += p.kilo;
      if (p.unidadeSaida === "unidade") porUnidade++;
      else if (p.unidadeSaida === "kilo") porKilo++;
    }
    return {
      total: producoes.length,
      pesoTotal,
      porUnidade,
      porKilo,
    };
  }, [producoes]);

  /* ─── Contagem por sala ─── */
  const countBySala = useMemo(() => {
    const m: Record<string, number> = {};
    for (let i = 0; i < producoes.length; i++) {
      const s = producoes[i].sala;
      m[s] = (m[s] || 0) + 1;
    }
    return m;
  }, [producoes]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return producoes.filter((p) => {
      const matchSearch =
        !q ||
        p.fornecedor.toLowerCase().includes(q) ||
        p.tipoMaterial.toLowerCase().includes(q) ||
        p.sala.toLowerCase().includes(q) ||
        String(p.coletaNumero).includes(q);
      const matchSala = !filterSala || p.sala === filterSala;
      const matchStatus = !filterStatus || p.statusEstoque === filterStatus;
      const matchSaida = !filterSaida || p.unidadeSaida === filterSaida;
      return matchSearch && matchSala && matchStatus && matchSaida;
    });
  }, [producoes, search, filterSala, filterStatus, filterSaida]);

  const activeFilters = [filterSala, filterStatus, filterSaida].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Produção"
        description="Salas de corte e processamento de material"
        icon={Factory}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Peso Total", value: `${stats.pesoTotal.toLocaleString("pt-BR")}kg`, color: "#00C64C" },
          { label: "Por Unidade", value: stats.porUnidade, color: "#FDC24E" },
          { label: "Por Kilo", value: stats.porKilo, color: "#ed1b24" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Registrar Produção
            </Button>
          </div>
        }
      />

      {/* ─── Cards Relatório — padrão FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Produções"
          value={stats.total}
          subtitle="Registradas no sistema"
          icon={Factory}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Peso Total"
          value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`}
          subtitle="Material processado"
          icon={Weight}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Saída Unidade"
          value={stats.porUnidade}
          subtitle="Produções por unidade"
          icon={Package}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Saída Kilo"
          value={stats.porKilo}
          subtitle="Produções por kilo"
          icon={Ruler}
          color={FIPS_COLORS.azulEscuro}
        />
      </div>

      {/* ─── Toolbar — padrão FIPS DS Data Listing ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por fornecedor, material, sala ou coleta..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            {/* Sala */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Sala
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFilterSala("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filterSala
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todas as salas
                </button>
                {SALAS.map((sala) => (
                  <button
                    key={sala}
                    onClick={() => setFilterSala(sala)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterSala === sala
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {sala}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Status
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todos os status" },
                  { v: "pendente", l: "Pendente" },
                  { v: "em_andamento", l: "Em Andamento" },
                  { v: "em_estoque", l: "No Estoque" },
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

            {/* Unidade de Saída */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Unidade de Saída
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todas" },
                  { v: "unidade", l: "Unidade" },
                  { v: "kilo", l: "Kilo" },
                ].map((opt) => (
                  <button
                    key={opt.v || "todos-saida"}
                    onClick={() => setFilterSaida(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterSaida === opt.v
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

      {/* ─── Tabela canônica DS-FIPS — Data Listing ─── */}
      <DataListingTable<Producao>
        icon={<Factory className="h-[22px] w-[22px]" />}
        title="Produção"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(p) => p.id}
        emptyState={
          loading
            ? "Carregando..."
            : "Nenhuma produção encontrada"
        }
        columns={producaoColumns()}
      />

      <NovaProducaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchProducoes}
        salas={SALAS}
        salaSaidaMap={salaSaidaMap}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

function producaoColumns(): DataListingColumn<Producao>[] {
  return [
    {
      id: "coleta",
      label: "Coleta",
      fixed: true,
      sortable: true,
      width: "80px",
      render: (p) => <CellMonoStrong>#{p.coletaNumero}</CellMonoStrong>,
    },
    {
      id: "sala",
      label: "Sala",
      sortable: true,
      width: "100px",
      render: (p) => <Badge variant="outline">{p.sala}</Badge>,
    },
    {
      id: "material",
      label: "Material",
      sortable: true,
      width: "130px",
      render: (p) => (
        <div className="truncate max-w-[120px]" title={p.tipoMaterial}>
          <span className="text-[11px] text-[var(--fips-fg)]">{p.tipoMaterial}</span>
        </div>
      ),
    },
    {
      id: "cor",
      label: "Cor",
      sortable: true,
      width: "90px",
      render: (p) => <CellMuted>{p.cor || "—"}</CellMuted>,
    },
    {
      id: "medida",
      label: "Medida",
      sortable: true,
      width: "80px",
      render: (p) => <CellMuted>{p.medida || "—"}</CellMuted>,
    },
    {
      id: "acabamento",
      label: "Acabamento",
      sortable: true,
      width: "100px",
      render: (p) => <CellMuted>{p.acabamento || "—"}</CellMuted>,
    },
    {
      id: "peso",
      label: "Peso",
      sortable: true,
      align: "right",
      width: "90px",
      render: (p) => <CellMonoStrong align="right">{formatKg(p.kilo)}</CellMonoStrong>,
    },
    {
      id: "saida",
      label: "Saída",
      sortable: true,
      width: "75px",
      render: (p) => (
        <Badge variant={p.unidadeSaida === "kilo" ? "info" : "success"} className="text-[10px]">
          {p.unidadeSaida === "kilo" ? "Kilo" : "Unidade"}
        </Badge>
      ),
    },
    {
      id: "pacotes",
      label: "Pacotes",
      sortable: true,
      align: "right",
      width: "70px",
      render: (p) => <CellMonoMuted>{p.qtdePacote || "—"}</CellMonoMuted>,
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "95px",
      render: (p) => {
        const sc = statusConfig[p.statusEstoque] || {
          label: p.statusEstoque,
          variant: "secondary" as const,
        };
        return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
      },
    },
    {
      id: "data",
      label: "Data",
      sortable: true,
      width: "80px",
      render: (p) => <CellMonoMuted>{formatDateBR(p.dataCriacao)}</CellMonoMuted>,
    },
    {
      id: "actions",
      label: "Ação",
      fixed: true,
      align: "center",
      width: "50px",
      render: (p) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => console.log("Ver produção:", p.id)}
          />
        </CellActions>
      ),
    },
  ];
}
