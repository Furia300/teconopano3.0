import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Truck,
  Scissors,
  Warehouse,
  Factory,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  IdCard,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColaboradorDialog } from "./ColaboradorDialog";
import { ColaboradorDetalhes } from "./ColaboradorDetalhes";
import { useConfirmDelete } from "@/components/domain/ConfirmDeleteDialog";
import { cn } from "@/lib/utils";

interface Colaborador {
  id: number;
  cpf: string;
  name: string;
  registration: string;
  departamento: string;
  idDepartment: number;
  status: number;
  fonte: "rhid" | "local" | "rhid+local";
}

const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

const formatCPF = (cpf: string) => {
  const d = cpf.replace(/\D/g, "").padStart(11, "0");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

export default function FuncionariosList() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [fonte, setFonte] = useState<"rhid" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterDepto, setFilterDepto] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Colaborador | null>(null);
  const [viewingColab, setViewingColab] = useState<Colaborador | null>(null);
  const [confirmDialog, openConfirm] = useConfirmDelete();

  const fetchColaboradores = async () => {
    try {
      const res = await fetch("/api/colaboradores");
      const data = await res.json();
      setColaboradores(data.colaboradores ?? []);
      setFonte(data.fonte ?? "local");
    } catch {
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const departamentos = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach((c) => {
      if (c.departamento && !["*", ".", ".."].includes(c.departamento)) {
        set.add(c.departamento);
      }
    });
    return Array.from(set).sort();
  }, [colaboradores]);

  const filtered = useMemo(() => {
    return colaboradores.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.cpf.includes(q.replace(/\D/g, "")) ||
        (c.registration ?? "").toLowerCase().includes(q) ||
        (c.departamento ?? "").toLowerCase().includes(q);
      const matchDepto = !filterDepto || c.departamento === filterDepto;
      return matchSearch && matchDepto;
    });
  }, [colaboradores, search, filterDepto]);

  const stats = useMemo(() => {
    const total = colaboradores.length;
    const ativos = colaboradores.filter((c) => c.status === 1).length;
    const inativos = total - ativos;
    const producao = colaboradores.filter((c) =>
      (c.departamento ?? "").toLowerCase().includes("produ"),
    ).length;
    return { total, ativos, inativos, producao };
  }, [colaboradores]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchColaboradores();
    setSyncing(false);
    toast.success(fonte === "rhid" ? "Sincronizado com RHiD!" : "Dados locais atualizados");
  };

  const openNew = () => {
    setEditItem(null);
    setDialogOpen(true);
  };
  const openEdit = (c: Colaborador) => {
    setEditItem(c);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    openConfirm({
      title: "Excluir colaborador",
      description: "Tem certeza que deseja excluir este colaborador? Isso também removerá do RHiD se estiver conectado.",
      onConfirm: async () => {
        try {
          await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
          toast.success("Colaborador excluído");
          fetchColaboradores();
        } catch {
          toast.error("Erro ao excluir");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <RhHero
        total={stats.total}
        ativos={stats.ativos}
        inativos={stats.inativos}
        producao={stats.producao}
        fonte={fonte}
        syncing={syncing}
        onSync={handleSync}
        onNew={openNew}
      />

      {/* Cards Relatório */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Colaboradores"
          value={stats.total}
          subtitle="Registrados no sistema"
          icon={Users}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Ativos"
          value={stats.ativos}
          subtitle={`${stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}% do total`}
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Inativos"
          value={stats.inativos}
          subtitle="Desligados ou afastados"
          icon={IdCard}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Produção"
          value={stats.producao}
          subtitle="Colaboradores na produção"
          icon={Factory}
          color={FIPS_COLORS.azulEscuro}
        />
      </div>

      {/* Toolbar */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, CPF, matrícula ou departamento..."
        activeFilters={filterDepto ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Departamento
            </p>
            <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto">
              <button
                onClick={() => setFilterDepto("")}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                  !filterDepto
                    ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
                    : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                }`}
              >
                Todos
              </button>
              {departamentos.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDepto(d)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterDepto === d
                      ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel — placeholder")}
        onExportPdf={() => alert("Export PDF — placeholder")}
      />

      {/* Tabela */}
      <DataListingTable<Colaborador>
        icon={<Users className="h-[22px] w-[22px]" />}
        title="Colaboradores"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterDepto ? "filtrados" : "no total"
        } · Fonte: ${fonte === "rhid" ? "RHiD em tempo real" : "local"}`}
        filtered={!!(search || filterDepto)}
        data={filtered}
        getRowId={(c) => `${c.fonte}-${c.id}`}
        emptyState={loading ? "Carregando colaboradores..." : "Nenhum colaborador encontrado"}
        columns={colaboradorColumns({ onView: (c) => setViewingColab(c), onEdit: openEdit, onDelete: handleDelete })}
      />

      <ColaboradorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
        fonte={fonte}
        onSuccess={fetchColaboradores}
      />

      {viewingColab && (
        <ColaboradorDetalhes
          colaborador={viewingColab}
          open={!!viewingColab}
          onOpenChange={(open) => !open && setViewingColab(null)}
        />
      )}
      {confirmDialog}
    </div>
  );
}

/* ──────────────────────────── RH HERO — "Trama Têxtil" ────────────────────────────
   Leve (CSS puro, zero Framer Motion, zero SVG particles).
   Pattern de trama de tecido via CSS gradients — identidade de pano da Tecnopano.
   Funciona em mobile/tablet com wifi fraco.
   ──────────────────────────────────────────────────────────────────────────────────── */

const heroStyle = `
.rh-hero {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 16px 28px;
  background: linear-gradient(135deg, #001443 0%, #002A68 50%, #001443 100%);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 4px 20px rgba(0,20,67,0.3);
}
/* Dark mode — glassmorphism igual card de login */
:is(.dark) .rh-hero {
  background: rgba(26,26,26,0.85);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.05);
}
.rh-frost {
  display: none;
}
:is(.dark) .rh-fade-rect {
  display: none;
}
:is(.dark) .rh-frost {
  display: block;
  position: absolute; inset: 0;
  pointer-events: none;
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  background: rgba(26,26,26,0.7);
  border-radius: inherit;
}
.rh-hero-bottom {
  position: absolute; bottom: 0; left: 8%; right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ed1b24 25%, #B20028 50%, #ed1b24 75%, transparent);
  opacity: 0.35; border-radius: 1px;
}
:is(.dark) .rh-hero-bottom { opacity: 0.5; }
.rh-stat {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
}
:is(.dark) .rh-stat {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.06);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
`;

/** SVG inline de tecido — linhas onduladas que remetem a fios de pano/trama têxtil.
 *  Zero JS, zero animação, ~2KB. GPU-friendly em mobile. */
function FabricSVG() {
  return (
    <svg
      viewBox="0 0 900 220"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden
    >
      {/* ── Urdidura (warp) — fios horizontais ondulados brancos ── */}
      <path d="M0,35 C150,20 300,55 450,30 C600,5 750,50 900,25"
        stroke="white" strokeWidth="0.6" fill="none" opacity="0.05" />
      <path d="M0,60 C200,45 350,80 500,55 C650,30 800,70 900,50"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
      <path d="M0,90 C180,75 320,110 480,85 C640,60 780,100 900,80"
        stroke="white" strokeWidth="0.6" fill="none" opacity="0.05" />
      <path d="M0,120 C220,105 400,140 550,115 C700,90 820,130 900,110"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
      <path d="M0,150 C170,135 330,170 490,145 C650,120 790,160 900,140"
        stroke="white" strokeWidth="0.6" fill="none" opacity="0.05" />
      <path d="M0,178 C200,165 380,195 530,172 C680,150 810,185 900,168"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
      <path d="M0,200 C250,190 400,215 560,195 C720,175 830,205 900,195"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.035" />

      {/* ── Trama (weft) — fios verticais ondulados brancos ── */}
      <path d="M120,0 C110,55 140,110 115,165 C100,200 130,220 120,220"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M240,0 C255,50 230,100 250,150 C265,190 240,220 245,220"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M380,0 C370,60 395,120 375,170 C360,210 390,220 380,220"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M520,0 C530,45 510,105 535,155 C550,195 515,220 525,220"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M660,0 C650,55 675,115 655,170 C640,205 670,220 660,220"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M790,0 C800,50 780,110 805,160 C820,200 785,220 795,220"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />

      {/* ── Fio vermelho principal — como o fio de costura Tecnopano ── */}
      <path
        d="M0,100 C120,70 240,130 360,85 C480,40 600,120 720,75 C810,45 870,90 900,80"
        stroke="#ed1b24" strokeWidth="1.2" fill="none" opacity="0.18"
        strokeLinecap="round"
      />
      {/* Segundo fio vermelho mais fino — eco */}
      <path
        d="M0,115 C140,90 280,145 400,105 C520,65 640,135 760,95 C840,70 880,105 900,98"
        stroke="#ed1b24" strokeWidth="0.6" fill="none" opacity="0.09"
        strokeLinecap="round"
      />

      {/* ── Nós / cruzamentos sutis — onde urdidura e trama se encontram ── */}
      <circle cx="120" cy="90" r="1.5" fill="#ed1b24" opacity="0.12" />
      <circle cx="240" cy="115" r="1.5" fill="#ed1b24" opacity="0.10" />
      <circle cx="380" cy="85" r="1.5" fill="#ed1b24" opacity="0.12" />
      <circle cx="520" cy="105" r="1.5" fill="#ed1b24" opacity="0.10" />
      <circle cx="660" cy="78" r="1.5" fill="#ed1b24" opacity="0.12" />
      <circle cx="790" cy="95" r="1.5" fill="#ed1b24" opacity="0.10" />

      {/* ── Área de respiro — gradiente de fade nas bordas ── */}
      <defs>
        <linearGradient id="rh-fade-l" x1="0" x2="0.15" y1="0" y2="0">
          <stop offset="0" stopColor="#001443" stopOpacity="1" />
          <stop offset="1" stopColor="#001443" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rh-fade-r" x1="0.85" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#001443" stopOpacity="0" />
          <stop offset="1" stopColor="#001443" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect className="rh-fade-rect" x="0" y="0" width="900" height="220" fill="url(#rh-fade-l)" />
      <rect className="rh-fade-rect" x="0" y="0" width="900" height="220" fill="url(#rh-fade-r)" />
    </svg>
  );
}

interface RhHeroProps {
  total: number;
  ativos: number;
  inativos: number;
  producao: number;
  fonte: "rhid" | "local";
  syncing: boolean;
  onSync: () => void;
  onNew: () => void;
}

function RhHero({ total, ativos, inativos, producao, fonte, syncing, onSync, onNew }: RhHeroProps) {
  return (
    <>
      <style>{heroStyle}</style>
      <div className="rh-hero">
        <FabricSVG />
        {/* Vidro fosco — só dark mode */}
        <div className="rh-frost" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          {/* Left — icon + text + stats */}
          <div className="flex items-start gap-4">
            {/* Icon tile (neumorphic like sidebar) */}
            <div
              className="hidden flex-shrink-0 items-center justify-center sm:flex"
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))",
                border: "1px solid rgba(237,27,36,0.18)",
              }}
            >
              <Users className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h2
                className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]"
                style={{ lineHeight: 1.2 }}
              >
                RH <span className="text-white/30">·</span> Colaboradores
              </h2>
              <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">
                Quadro de colaboradores — sincronização bidirecional RHiD ControlID
              </p>

              {/* Stats pills inline */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {([
                  { label: "Total", value: total, color: "#93BDE4" },
                  { label: "Ativos", value: ativos, color: "#00C64C" },
                  { label: "Produção", value: producao, color: "#FDC24E" },
                  { label: "Inativos", value: inativos, color: "#ed1b24" },
                ] as const).map((s) => (
                  <div key={s.label} className="rh-stat">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-white/45">
                      {s.label}
                    </span>
                    <span
                      className="font-heading text-xs font-extrabold"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            {/* Source badge */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: fonte === "rhid" ? "rgba(0,198,76,0.1)" : "rgba(237,27,36,0.1)",
                border: `1px solid ${fonte === "rhid" ? "rgba(0,198,76,0.2)" : "rgba(237,27,36,0.2)"}`,
                color: fonte === "rhid" ? "#00C64C" : "#ed1b24",
              }}
            >
              {fonte === "rhid" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {fonte === "rhid" ? "RHiD" : "Local"}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={onSync}
              disabled={syncing}
              className="border-white/15 bg-white/8 text-white hover:bg-white/15"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
              Sincronizar
            </Button>

            <Button size="sm" onClick={onNew}>
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>
        </div>

        {/* Bottom thread line */}
        <div className="rh-hero-bottom" />
      </div>
    </>
  );
}

/* ──────────────────────────── COLUMNS ──────────────────────────── */

interface ColabActions {
  onView: (c: Colaborador) => void;
  onEdit: (c: Colaborador) => void;
  onDelete: (id: number) => void;
}

const deptoColor = (depto: string) => {
  const d = depto.toLowerCase();
  if (d.includes("motorista") || d.includes("logis")) return "#93BDE4";
  if (d.includes("costur")) return "#FDC24E";
  if (d.includes("produ") || d.includes("galp")) return "#00C64C";
  if (d.includes("exped")) return "#ed1b24";
  if (d.includes("financ") || d.includes("escrit")) return "#FDC24E";
  if (d.includes("admin")) return "#ed1b24";
  return "#93BDE4";
};

function colaboradorColumns({ onView, onEdit, onDelete }: ColabActions): DataListingColumn<Colaborador>[] {
  return [
    {
      id: "nome",
      label: "Colaborador",
      fixed: true,
      sortable: true,
      render: (c, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={c.name}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">{c.name}</div>
          </div>
        </div>
      ),
    },
    {
      id: "cpf",
      label: "CPF",
      sortable: true,
      render: (c) => <CellMonoMuted>{formatCPF(c.cpf)}</CellMonoMuted>,
    },
    {
      id: "registration",
      label: "Matrícula",
      sortable: true,
      render: (c) => <CellMonoMuted>{c.registration || "—"}</CellMonoMuted>,
    },
    {
      id: "departamento",
      label: "Departamento",
      sortable: true,
      render: (c) =>
        c.departamento ? (
          <Badge variant="outline" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: deptoColor(c.departamento) }} />
            {c.departamento}
          </Badge>
        ) : (
          <CellMuted>—</CellMuted>
        ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (c) => (
        <Badge variant={c.status === 1 ? "success" : "danger"} dot>
          {c.status === 1 ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "fonte",
      label: "Fonte",
      sortable: true,
      render: (c) => (
        <Badge
          variant={
            c.fonte === "rhid" ? "info" : c.fonte === "rhid+local" ? "success" : "secondary"
          }
          className="text-[10px]"
        >
          {c.fonte === "rhid" ? "RHiD" : c.fonte === "rhid+local" ? "Sync" : "Local"}
        </Badge>
      ),
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "110px",
      render: (c) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            variant="primary"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onView(c)}
          />
          <CellActionButton
            title="Editar"
            variant="default"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit(c)}
          />
          <CellActionButton
            title="Excluir"
            variant="danger"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => onDelete(c.id)}
          />
        </CellActions>
      ),
    },
  ];
}
