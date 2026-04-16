import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  User,
  Factory,
  CheckCircle2,
  AlertTriangle,
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
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";

/* ─── Cores FIPS DS canonicas ─── */
const FIPS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

/* ─── Tipos ─── */
interface Producao {
  id: string;
  coletaId: string;
  qrCodeId: string;
  fornecedor: string;
  sala: string;
  tipoMaterial: string;
  cor: string;
  pesoEntrada: number;
  pesoProduzido: number | null;
  qtdePacotes: number | null;
  operador: string;
  status: "em_andamento" | "finalizado";
  horarioInicio: string;
  horarioFim: string | null;
  createdAt: string;
}

const STATUS_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  em_andamento: { label: "Em Andamento", variant: "info" },
  finalizado: { label: "Finalizado", variant: "success" },
};

const formatTimeBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "\u2014";

const formatKg = (n: number | null | undefined) =>
  n != null && n > 0 ? `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg` : "\u2014";

const todayStr = () => new Date().toISOString().slice(0, 10);

/* ─── Componente principal ─── */
export default function ProducaoDiariaPage() {
  const me = useAppAuthMe();
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetch("/api/producoes")
      .then((r) => r.json())
      .then((data) => { setProducoes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ─── Filtrar por data selecionada ─── */
  const doDia = useMemo(() => {
    return producoes.filter((p) => {
      const dt = (p.horarioInicio || p.createdAt || "").slice(0, 10);
      return dt === selectedDate;
    });
  }, [producoes, selectedDate]);

  /* ─── Stats do dia ─── */
  const stats = useMemo(() => {
    const registros = doDia.length;
    const colaboradores = new Set(doDia.map((p) => p.operador)).size;
    const finalizados = doDia.filter((p) => p.status === "finalizado").length;
    const emAndamento = doDia.filter((p) => p.status === "em_andamento").length;
    return { registros, colaboradores, finalizados, emAndamento };
  }, [doDia]);

  /* ─── Filtro busca + status ─── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doDia.filter((p) => {
      const matchSearch =
        !q ||
        p.operador.toLowerCase().includes(q) ||
        p.sala.toLowerCase().includes(q) ||
        p.tipoMaterial.toLowerCase().includes(q) ||
        (p.cor || "").toLowerCase().includes(q);
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [doDia, search, filterStatus]);

  const activeFilters = [filterStatus].filter(Boolean).length;

  const dataPretty = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ─── PageHeader ─── */}
      <PageHeader
        title="Producao Diaria"
        description={`Visualizacao por dia -- ${dataPretty}`}
        icon={CalendarDays}
        stats={[
          { label: "Registros", value: stats.registros, color: "#93BDE4" },
          { label: "Colaboradores", value: stats.colaboradores, color: "#00C64C" },
          { label: "Finalizados", value: stats.finalizados, color: "#FDC24E" },
          { label: "Em Andamento", value: stats.emAndamento, color: "#ed1b24" },
        ]}
        actions={
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[160px] text-[12px]"
            density="compact"
          />
        }
      />

      {/* ─── Cards Relatorio ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Registros do Dia"
          value={stats.registros}
          subtitle={dataPretty}
          icon={CalendarDays}
          color={FIPS.azulProfundo}
        />
        <StatsCard
          label="Colaboradores"
          value={stats.colaboradores}
          subtitle="Operadores no dia"
          icon={User}
          color={FIPS.verdeFloresta}
        />
        <StatsCard
          label="Finalizados"
          value={stats.finalizados}
          subtitle="Producoes concluidas"
          icon={CheckCircle2}
          color={FIPS.amareloEscuro}
        />
        <StatsCard
          label="Em Andamento"
          value={stats.emAndamento}
          subtitle={stats.emAndamento > 0 ? "Ainda em producao" : "Nenhuma pendente"}
          icon={AlertTriangle}
          color={FIPS.azulEscuro}
        />
      </div>

      {/* ─── Toolbar ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por operador, sala ou material..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Status
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todos" },
                  { v: "em_andamento", l: "Em Andamento" },
                  { v: "finalizado", l: "Finalizado" },
                ].map((opt) => (
                  <button
                    key={opt.v || "all"}
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
          </div>
        }
      />

      {/* ─── Tabela ─── */}
      <DataListingTable<Producao>
        icon={<CalendarDays className="h-[22px] w-[22px]" />}
        title="Producao Diaria"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no dia"
        } \u00b7 ${dataPretty}`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(r) => r.id}
        emptyState={loading ? "Carregando..." : "Nenhuma producao registrada neste dia"}
        columns={producaoDiariaColumns()}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

function producaoDiariaColumns(): DataListingColumn<Producao>[] {
  return [
    {
      id: "operador",
      label: "Operador",
      fixed: true,
      sortable: true,
      width: "130px",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="text-[11px] font-semibold text-[var(--fips-fg)] truncate max-w-[110px]">
            {p.operador}
          </span>
        </div>
      ),
    },
    {
      id: "sala",
      label: "Sala",
      sortable: true,
      width: "100px",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Factory className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <CellMonoStrong>{p.sala}</CellMonoStrong>
        </div>
      ),
    },
    {
      id: "material",
      label: "Material",
      sortable: true,
      width: "120px",
      render: (p) => <Badge variant="outline">{p.tipoMaterial}</Badge>,
    },
    {
      id: "cor",
      label: "Cor",
      sortable: true,
      width: "80px",
      render: (p) => <CellMuted>{p.cor || "\u2014"}</CellMuted>,
    },
    {
      id: "pesoEntrada",
      label: "Peso Entrada",
      sortable: true,
      align: "right",
      width: "95px",
      render: (p) => <CellMonoStrong align="right">{formatKg(p.pesoEntrada)}</CellMonoStrong>,
    },
    {
      id: "pesoProduzido",
      label: "Peso Produzido",
      sortable: true,
      align: "right",
      width: "105px",
      render: (p) => (
        <CellMonoStrong align="right" style={{ color: p.pesoProduzido ? "#00C64C" : undefined }}>
          {formatKg(p.pesoProduzido)}
        </CellMonoStrong>
      ),
    },
    {
      id: "pacotes",
      label: "Pacotes",
      sortable: true,
      align: "right",
      width: "70px",
      render: (p) => <CellMonoMuted>{p.qtdePacotes ?? "\u2014"}</CellMonoMuted>,
    },
    {
      id: "inicio",
      label: "Inicio",
      sortable: true,
      width: "70px",
      render: (p) => (
        <div className="flex items-center gap-1 text-[11px]">
          <Clock className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="font-mono">{formatTimeBR(p.horarioInicio)}</span>
        </div>
      ),
    },
    {
      id: "fim",
      label: "Fim",
      sortable: true,
      width: "70px",
      render: (p) => (
        <div className="flex items-center gap-1 text-[11px]">
          <Clock className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="font-mono">{p.horarioFim ? formatTimeBR(p.horarioFim) : "..."}</span>
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "105px",
      render: (p) => {
        const sc = STATUS_VARIANTS[p.status] || { label: p.status, variant: "secondary" as const };
        return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
      },
    },
  ];
}
