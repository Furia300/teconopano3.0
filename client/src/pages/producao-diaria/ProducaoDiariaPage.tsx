import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  User,
  Factory,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Package,
  Scale,
  Trash2,
  Scissors,
} from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";
import NovaProducaoDiariaDialog from "./NovaProducaoDiariaDialog";
import { useConfirmDelete } from "@/components/domain/ConfirmDeleteDialog";

/* ─── Cores FIPS DS canonicas ─── */
const FIPS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

/* ─── Tipos ─── */
interface ProducaoDiaria {
  id: string;
  data: string;
  nomeDupla: string;
  sala: string;
  material: string;
  pacotes: number;
  quilos: number;
  descarte: number;
  costura: number;
  destino?: string;
  costureiraInterna?: string | null;
  horarioInicio: string;
  horarioFim: string | null;
  status: "completa" | "incompleta";
  assinatura: string;
  encarregado: string;
  observacao: string;
  createdAt: string;
}

const STATUS_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  completa: { label: "Completa", variant: "success" },
  incompleta: { label: "Incompleta", variant: "warning" },
};

const todayStr = () => new Date().toISOString().slice(0, 10);

/* ─── Componente principal ─── */
export default function ProducaoDiariaPage() {
  const me = useAppAuthMe();
  const [registros, setRegistros] = useState<ProducaoDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, openConfirm] = useConfirmDelete();

  const fetchData = () => {
    fetch("/api/producao-diaria")
      .then((r) => r.json())
      .then((data) => { setRegistros(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  /* ─── Filtrar por data selecionada ─── */
  const doDia = useMemo(() => {
    return registros.filter((p) => p.data === selectedDate);
  }, [registros, selectedDate]);

  /* ─── Stats do dia ─── */
  const stats = useMemo(() => {
    const total = doDia.length;
    const colaboradores = new Set(doDia.map((p) => p.nomeDupla)).size;
    const completas = doDia.filter((p) => p.status === "completa").length;
    const incompletas = doDia.filter((p) => p.status === "incompleta").length;
    const totalPacotes = doDia.reduce((a, p) => a + (p.pacotes || 0), 0);
    const totalQuilos = doDia.reduce((a, p) => a + (p.quilos || 0), 0);
    const totalDescarte = doDia.reduce((a, p) => a + (p.descarte || 0), 0);
    const totalCostura = doDia.reduce((a, p) => a + (p.costura || 0), 0);
    return { total, colaboradores, completas, incompletas, totalPacotes, totalQuilos, totalDescarte, totalCostura };
  }, [doDia]);

  /* ─── Filtro busca + status ─── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doDia.filter((p) => {
      const matchSearch =
        !q ||
        p.nomeDupla.toLowerCase().includes(q) ||
        p.sala.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q);
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

  const handleSave = async (item: any) => {
    try {
      const res = await fetch("/api/producao-diaria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error();
      toast.success("Registro salvo");
      fetchData();
    } catch {
      toast.error("Erro ao salvar registro");
    }
  };

  const handleDelete = (id: string) => {
    openConfirm({
      title: "Excluir registro",
      description: "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          await fetch(`/api/producao-diaria/${id}`, { method: "DELETE" });
          toast.success("Registro excluído");
          fetchData();
        } catch {
          toast.error("Erro ao excluir");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── PageHeader ─── */}
      <PageHeader
        title="Producao Diaria"
        tutorialPage="producao-diaria"
        description={`Visualizacao por dia -- ${dataPretty}`}
        icon={CalendarDays}
        stats={[
          { label: "Registros", value: stats.total, color: "#93BDE4" },
          { label: "Pacotes", value: stats.totalPacotes, color: "#00C64C" },
          { label: "Quilos", value: `${stats.totalQuilos.toFixed(1)} kg`, color: "#FDC24E" },
          { label: "Descarte", value: `${stats.totalDescarte.toFixed(1)} kg`, color: "#ed1b24" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[160px] text-[12px]"
              density="compact"
            />
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Novo
            </Button>
          </div>
        }
      />

      {/* ─── Cards Relatorio ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Pacotes"
          value={stats.totalPacotes.toLocaleString("pt-BR")}
          subtitle={`${stats.total} registros`}
          icon={Package}
          color={FIPS.azulProfundo}
        />
        <StatsCard
          label="Total Quilos"
          value={`${stats.totalQuilos.toFixed(1)} kg`}
          subtitle="Peso produzido"
          icon={Scale}
          color={FIPS.verdeFloresta}
        />
        <StatsCard
          label="Descarte"
          value={`${stats.totalDescarte.toFixed(1)} kg`}
          subtitle={stats.totalQuilos > 0 ? `${Math.round((stats.totalDescarte / (stats.totalQuilos + stats.totalDescarte)) * 100)}% do total` : "—"}
          icon={Trash2}
          color={FIPS.amareloEscuro}
        />
        <StatsCard
          label="Costura"
          value={`${stats.totalCostura.toFixed(1)} kg`}
          subtitle="Destinado a costura"
          icon={Scissors}
          color={FIPS.azulEscuro}
        />
      </div>

      {/* ─── Toolbar ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por dupla, sala ou material..."
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
                  { v: "completa", l: "Completa" },
                  { v: "incompleta", l: "Incompleta" },
                ].map((opt) => (
                  <button
                    key={opt.v || "all"}
                    onClick={() => setFilterStatus(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterStatus === opt.v
                        ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
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
      <DataListingTable<ProducaoDiaria>
        icon={<CalendarDays className="h-[22px] w-[22px]" />}
        title="Producao Diaria"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no dia"
        } \u00b7 ${dataPretty}`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(r) => r.id}
        emptyState={loading ? "Carregando..." : "Nenhuma producao registrada neste dia"}
        columns={producaoDiariaColumns(handleDelete)}
      />

      <NovaProducaoDiariaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(item) => { handleSave(item); setDialogOpen(false); }}
        defaultData={selectedDate}
      />
      {confirmDialog}
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

function producaoDiariaColumns(onDelete: (id: string) => void): DataListingColumn<ProducaoDiaria>[] {
  return [
    {
      id: "nomeDupla",
      label: "Dupla",
      fixed: true,
      sortable: true,
      width: "130px",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="text-[11px] font-semibold text-[var(--fips-fg)] truncate max-w-[110px]">
            {p.nomeDupla}
          </span>
        </div>
      ),
    },
    {
      id: "sala",
      label: "Sala",
      sortable: true,
      width: "90px",
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
      width: "110px",
      render: (p) => <Badge variant="outline">{p.material}</Badge>,
    },
    {
      id: "pacotes",
      label: "Pacotes",
      sortable: true,
      align: "right",
      width: "75px",
      render: (p) => (
        <CellMonoStrong align="right" style={{ color: p.pacotes > 0 ? "var(--fips-primary)" : undefined }}>
          {p.pacotes || "—"}
        </CellMonoStrong>
      ),
    },
    {
      id: "quilos",
      label: "Quilos",
      sortable: true,
      align: "right",
      width: "80px",
      render: (p) => (
        <CellMonoStrong align="right" style={{ color: p.quilos > 0 ? "var(--fips-success-strong)" : undefined }}>
          {p.quilos > 0 ? `${p.quilos} kg` : "—"}
        </CellMonoStrong>
      ),
    },
    {
      id: "descarte",
      label: "Descarte",
      sortable: true,
      align: "right",
      width: "80px",
      render: (p) => (
        <span className="text-[11px] font-mono font-semibold" style={{ color: p.descarte > 0 ? "var(--fips-danger)" : "var(--fips-fg-muted)" }}>
          {p.descarte > 0 ? `${p.descarte} kg` : "—"}
        </span>
      ),
    },
    {
      id: "costura",
      label: "Costura",
      sortable: true,
      align: "right",
      width: "80px",
      render: (p) => (
        <span className="text-[11px] font-mono font-semibold" style={{ color: p.costura > 0 ? "var(--fips-primary)" : "var(--fips-fg-muted)" }}>
          {p.costura > 0 ? `${p.costura} kg` : "—"}
        </span>
      ),
    },
    {
      id: "inicio",
      label: "Inicio",
      sortable: true,
      width: "65px",
      render: (p) => (
        <div className="flex items-center gap-1 text-[11px]">
          <Clock className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="font-mono">{p.horarioInicio}</span>
        </div>
      ),
    },
    {
      id: "fim",
      label: "Fim",
      sortable: true,
      width: "65px",
      render: (p) => (
        <div className="flex items-center gap-1 text-[11px]">
          <Clock className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="font-mono">{p.horarioFim || "..."}</span>
        </div>
      ),
    },
    {
      id: "destino",
      label: "Destino",
      sortable: true,
      width: "110px",
      render: (p) => {
        if (p.destino === "costura_interna") {
          return (
            <div>
              <Badge variant="warning">Costura Int.</Badge>
              {p.costureiraInterna && <div className="text-[9px] mt-0.5" style={{ color: "var(--fips-fg-muted)" }}>{p.costureiraInterna}</div>}
            </div>
          );
        }
        return <Badge variant="info">Acabamento</Badge>;
      },
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "95px",
      render: (p) => {
        const sc = STATUS_VARIANTS[p.status] || { label: p.status, variant: "secondary" as const };
        return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
      },
    },
    {
      id: "actions",
      label: "",
      fixed: true,
      align: "center",
      width: "40px",
      render: (p) => (
        <CellActions>
          <CellActionButton
            title="Excluir"
            variant="danger"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => onDelete(p.id)}
          />
        </CellActions>
      ),
    },
  ];
}
