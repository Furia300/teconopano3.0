import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColaboradorDialog } from "./ColaboradorDialog";
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

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este colaborador? Isso também removerá do RHiD se estiver conectado."))
      return;
    try {
      await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
      toast.success("Colaborador excluído");
      fetchColaboradores();
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="RH · Colaboradores"
        description="Quadro de colaboradores com sincronização bidirecional RHiD ControlID"
        icon={Users}
        badge={
          <Badge
            variant={fonte === "rhid" ? "success" : "warning"}
            className="border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm"
          >
            {fonte === "rhid" ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {fonte === "rhid" ? "RHiD" : "Local"}
          </Badge>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
              Sincronizar
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </>
        }
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
                    ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
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
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
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
        columns={colaboradorColumns({ onEdit: openEdit, onDelete: handleDelete })}
      />

      <ColaboradorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
        fonte={fonte}
        onSuccess={fetchColaboradores}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS ──────────────────────────── */

interface ColabActions {
  onEdit: (c: Colaborador) => void;
  onDelete: (id: number) => void;
}

const deptoIcon = (depto: string) => {
  const d = depto.toLowerCase();
  if (d.includes("motorista") || d.includes("logis")) return <Truck className="h-3 w-3" />;
  if (d.includes("costur")) return <Scissors className="h-3 w-3" />;
  if (d.includes("produ")) return <Factory className="h-3 w-3" />;
  return <Warehouse className="h-3 w-3" />;
};

function colaboradorColumns({ onEdit, onDelete }: ColabActions): DataListingColumn<Colaborador>[] {
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
          <Badge variant="outline" className="gap-1">
            {deptoIcon(c.departamento)}
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
      width: "80px",
      render: (c) => (
        <CellActions>
          <CellActionButton
            title="Editar"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit(c)}
          />
          <CellActionButton
            title="Excluir"
            icon={<Trash2 className="h-3.5 w-3.5 text-[var(--fips-danger)]" />}
            onClick={() => onDelete(c.id)}
          />
        </CellActions>
      ),
    },
  ];
}
