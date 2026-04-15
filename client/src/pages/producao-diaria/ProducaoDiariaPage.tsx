import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ClipboardList, Plus, Calendar, Clock, User, Factory,
  CheckCircle2, AlertTriangle, Trash2, Eye,
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
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";
import NovaProducaoDiariaDialog from "./NovaProducaoDiariaDialog";

const FIPS = { azulProfundo: "#004B9B", verdeFloresta: "#00C64C", amareloEscuro: "#F6921E", azulEscuro: "#002A68" };

interface ProducaoDiariaItem {
  id: string; data: string; nomeDupla: string; sala: string; material: string;
  horarioInicio: string; horarioFim: string | null; status: "completa" | "incompleta";
  assinatura: string; encarregado: string; observacao: string;
}

const formatDate = (s: string) => {
  if (!s) return "—";
  try { return new Date(s + "T12:00:00").toLocaleDateString("pt-BR"); } catch { return s; }
};

function producaoDiariaColumns({ onDelete }: { onDelete: (id: string) => void }): DataListingColumn<ProducaoDiariaItem>[] {
  return [
    {
      id: "data", label: "Data", fixed: true, sortable: true, width: "90px",
      render: (r) => <CellMonoStrong>{formatDate(r.data)}</CellMonoStrong>,
    },
    {
      id: "dupla", label: "Dupla / Operador", fixed: true, sortable: true, width: "160px",
      render: (r) => (
        <div className="min-w-0 leading-tight">
          <div className="font-semibold text-[11px] text-[var(--fips-fg)] truncate max-w-[150px]">{r.nomeDupla}</div>
          {r.encarregado && <div className="text-[9px] text-[var(--fips-fg-muted)]">Enc: {r.encarregado}</div>}
        </div>
      ),
    },
    {
      id: "sala", label: "Sala", sortable: true, width: "90px",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Factory className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <CellMonoStrong>{r.sala}</CellMonoStrong>
        </div>
      ),
    },
    {
      id: "material", label: "Material", sortable: true, width: "120px",
      render: (r) => <Badge variant="outline">{r.material}</Badge>,
    },
    {
      id: "horario", label: "Horário", sortable: true, width: "120px",
      render: (r) => (
        <div className="flex items-center gap-1 text-[11px]">
          <Clock className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="font-mono">{r.horarioInicio}</span>
          <span className="text-[var(--fips-fg-muted)]">—</span>
          <span className="font-mono">{r.horarioFim || "..."}</span>
        </div>
      ),
    },
    {
      id: "status", label: "Status", sortable: true, width: "100px",
      render: (r) => r.status === "completa"
        ? <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Completa</Badge>
        : <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />Incompleta</Badge>,
    },
    {
      id: "assinatura", label: "Assinatura", width: "90px",
      render: (r) => <CellMuted>{r.assinatura || "—"}</CellMuted>,
    },
    {
      id: "actions", label: "", fixed: true, align: "center", width: "50px",
      render: (r) => (
        <CellActions>
          <CellActionButton title="Excluir" icon={<Trash2 className="h-3.5 w-3.5 text-[var(--fips-danger)]" />} onClick={() => onDelete(r.id)} />
        </CellActions>
      ),
    },
  ];
}

export default function ProducaoDiariaPage() {
  const me = useAppAuthMe();
  const [registros, setRegistros] = useState<ProducaoDiariaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSala, setFilterSala] = useState("");

  useEffect(() => {
    fetch("/api/producao-diaria")
      .then(r => r.json())
      .then(data => { setRegistros(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (item: Omit<ProducaoDiariaItem, "id">) => {
    const res = await fetch("/api/producao-diaria", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    if (res.ok) { const novo = await res.json(); setRegistros(prev => [novo, ...prev]); setDialogOpen(false); toast.success("Registro adicionado!"); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/producao-diaria/${id}`, { method: "DELETE" });
    if (res.ok) { setRegistros(prev => prev.filter(r => r.id !== id)); toast.success("Registro removido"); }
  };

  const salasUnicas = useMemo(() => [...new Set(registros.map(r => r.sala).filter(Boolean))].sort(), [registros]);

  const filtered = useMemo(() => registros.filter(r => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || r.nomeDupla.toLowerCase().includes(q) || r.sala.toLowerCase().includes(q) || r.material.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchSala = !filterSala || r.sala === filterSala;
    return matchSearch && matchStatus && matchSala;
  }), [registros, search, filterStatus, filterSala]);

  const activeFilters = [filterStatus, filterSala].filter(Boolean).length;

  const resumo = useMemo(() => ({
    total: registros.length,
    duplas: new Set(registros.map(r => r.nomeDupla)).size,
    completas: registros.filter(r => r.status === "completa").length,
    incompletas: registros.filter(r => r.status !== "completa").length,
  }), [registros]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produção Diária"
        description={`Registro de produção por mesa — ${me.nome}`}
        icon={ClipboardList}
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Registro</Button>}
        stats={[
          { label: "Total", value: resumo.total, color: "#93BDE4" },
          { label: "Duplas", value: resumo.duplas, color: "#00C64C" },
          { label: "Completas", value: resumo.completas, color: "#FDC24E" },
          { label: "Incompletas", value: resumo.incompletas, color: "#ed1b24" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Registros" value={resumo.total} subtitle="Todas as datas" icon={ClipboardList} color={FIPS.azulProfundo} />
        <StatsCard label="Duplas/Operadores" value={resumo.duplas} subtitle="Registrados" icon={User} color={FIPS.verdeFloresta} />
        <StatsCard label="Completas" value={resumo.completas} subtitle="Finalizadas" icon={CheckCircle2} color={FIPS.amareloEscuro} />
        <StatsCard label="Incompletas" value={resumo.incompletas} subtitle={resumo.incompletas > 0 ? "Em andamento" : "Tudo completo"} icon={AlertTriangle} color={FIPS.azulEscuro} />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por dupla, sala ou material..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Status</p>
              <div className="flex flex-col gap-1">
                {[{ v: "", l: "Todos" }, { v: "completa", l: "Completa" }, { v: "incompleta", l: "Incompleta" }].map(opt => (
                  <button key={opt.v || "all"} onClick={() => setFilterStatus(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${filterStatus === opt.v ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]" : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Sala</p>
              <div className="flex flex-col gap-1">
                <button onClick={() => setFilterSala("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${!filterSala ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]" : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"}`}>
                  Todas
                </button>
                {salasUnicas.map(sala => (
                  <button key={sala} onClick={() => setFilterSala(sala)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${filterSala === sala ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]" : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"}`}>
                    {sala}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
      />

      <DataListingTable<ProducaoDiariaItem>
        icon={<ClipboardList className="h-[22px] w-[22px]" />}
        title="Produção Diária"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${activeFilters || search ? "filtrados" : "no total"} · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(r) => r.id}
        emptyState={loading ? "Carregando..." : "Nenhum registro de produção diária"}
        columns={producaoDiariaColumns({ onDelete: handleDelete })}
      />

      <NovaProducaoDiariaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} defaultData={new Date().toISOString().split("T")[0]} />
    </div>
  );
}
