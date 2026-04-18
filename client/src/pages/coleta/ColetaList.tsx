import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Truck, Plus, Eye, Trash2, Package, Activity, CheckCircle2, Inbox, MoreHorizontal, Scissors, Pencil, CalendarDays, Shield, FileText, Scale, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { Avatar } from "@/components/domain/Avatar";
import {
  DataListingTable,
  type DataListingColumn,
  CellCodigo,
  CellMonoStrong,
  CellMonoMuted,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { NovaColetaDialog } from "./NovaColetaDialog";
import { ColetaDetalhes } from "./ColetaDetalhes";
import { useConfirmDelete } from "@/components/domain/ConfirmDeleteDialog";

// Cores FIPS DS canônicas para os Cards Relatório
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  cnpjFornecedor: string;
  notaFiscal: string;
  pesoTotalNF: number;
  pesoTotalAtual: number;
  dataPedido: string;
  dataChegada: string | null;
  galpao: string;
  status: string;
  statusServico: string;
  observacao: string;
  fornecedorId: string;
  recorrencia?: string | null;
}

// Sem tabs — lista única. Coletas que já tiveram NF registrada vão para triagem automaticamente.

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  agendado: { label: "Agendado", variant: "info" },
  em_rota: { label: "Em Rota", variant: "info" },
  recebido: { label: "Recebido", variant: "secondary" },
  em_separacao: { label: "Em Separação", variant: "default" },
  separado: { label: "Separado", variant: "secondary" },
  em_producao: { label: "Em Produção", variant: "info" },
  finalizado: { label: "Finalizado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

/* ═══ Prioridade (derivada do status) — padrão DS FIPS ═══ */
const PRIO_LIGHT: Record<string, { label: string; color: string }> = {
  pendente: { label: "Crítica", color: "#DC2626" },
  cancelado: { label: "Crítica", color: "#DC2626" },
  agendado: { label: "Alta", color: "#EA580C" },
  em_rota: { label: "Alta", color: "#EA580C" },
  em_separacao: { label: "Média", color: "#2563EB" },
  em_producao: { label: "Média", color: "#2563EB" },
  recebido: { label: "Baixa", color: "#4B5563" },
  separado: { label: "Baixa", color: "#4B5563" },
  finalizado: { label: "Baixa", color: "#4B5563" },
};
const PRIO_DARK: Record<string, { label: string; color: string }> = {
  pendente: { label: "Crítica", color: "#ef4444" },
  cancelado: { label: "Crítica", color: "#ef4444" },
  agendado: { label: "Alta", color: "#F6921E" },
  em_rota: { label: "Alta", color: "#F6921E" },
  em_separacao: { label: "Média", color: "#93BDE4" },
  em_producao: { label: "Média", color: "#93BDE4" },
  recebido: { label: "Baixa", color: "#6B7280" },
  separado: { label: "Baixa", color: "#6B7280" },
  finalizado: { label: "Baixa", color: "#6B7280" },
};

export default function ColetaList() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesColeta, setDetalhesColeta] = useState<Coleta | null>(null);
  const [nfEditColeta, setNfEditColeta] = useState<Coleta | null>(null);
  const [editingColeta, setEditingColeta] = useState<Coleta | null>(null);
  const [nfForm, setNfForm] = useState({ pesoTotalNF: "", pesoTotalAtual: "", notaFiscal: "" });
  const [confirmDialog, openConfirm] = useConfirmDelete();

  const fetchColetas = async () => {
    try {
      const res = await fetch("/api/coletas");
      const data = await res.json();
      setColetas(data);
    } catch (err) {
      console.error("Erro ao buscar coletas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColetas();
  }, []);

  // Mostrar todas as coletas em ordem decrescente (mais recente primeiro)
  const sorted = useMemo(() =>
    [...coletas].sort((a, b) => (b.dataPedido || "").localeCompare(a.dataPedido || "")),
    [coletas],
  );

  const filtered = sorted.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (c.nomeFantasia || "").toLowerCase().includes(q) ||
      (c.notaFiscal || "").toLowerCase().includes(q) ||
      (c.cnpjFornecedor || "").includes(q) ||
      String(c.numero).includes(q);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: coletas.length,
    pendentes: coletas.filter((c) => c.status === "pendente" || c.status === "agendado").length,
    emAndamento: coletas.filter((c) => ["em_rota", "recebido", "em_separacao", "em_producao"].includes(c.status)).length,
    finalizados: coletas.filter((c) => c.status === "finalizado").length,
  };

  const openNFEdit = (c: Coleta) => {
    setNfEditColeta(c);
    setNfForm({
      pesoTotalNF: c.pesoTotalNF ? String(c.pesoTotalNF) : "",
      pesoTotalAtual: c.pesoTotalAtual ? String(c.pesoTotalAtual) : "",
      notaFiscal: c.notaFiscal || "",
    });
  };

  const saveNF = async () => {
    if (!nfEditColeta) return;
    try {
      await fetch(`/api/coletas/${nfEditColeta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoTotalNF: parseFloat(nfForm.pesoTotalNF) || 0,
          pesoTotalAtual: parseFloat(nfForm.pesoTotalAtual) || 0,
          notaFiscal: nfForm.notaFiscal,
          status: "recebido",
        }),
      });
      toast.success("NF salva — coleta marcada como recebida!");
      setNfEditColeta(null);
      fetchColetas();
    } catch { toast.error("Erro ao salvar NF"); }
  };

  const handleDelete = (id: string) => {
    openConfirm({
      title: "Excluir coleta",
      description: "Tem certeza que deseja excluir esta coleta? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        await fetch(`/api/coletas/${id}`, { method: "DELETE" });
        toast.success("Coleta excluída!");
        fetchColetas();
      },
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatWeight = (weight: number) => {
    if (!weight) return "—";
    return `${weight.toLocaleString("pt-BR")} kg`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coleta"
        tutorialPage="coleta"
        description="Início do fluxo: pedidos e agendamento de matéria-prima (retirada no fornecedor / chegada ao galpão)"
        icon={Truck}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Em andamento", value: stats.emAndamento, color: "#00C64C" },
          { label: "Finalizados", value: stats.finalizados, color: "#ed1b24" },
        ]}
        actions={
          <Button onClick={() => { setEditingColeta(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            Pedido de coleta
          </Button>
        }
      />

      {/* Cards Relatório — padrão FIPS DS (`/docs/components/card` § 03 Card Relatório) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Coletas"
          value={stats.total}
          subtitle="Cadastradas no sistema"
          icon={Truck}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Pendentes"
          value={stats.pendentes}
          subtitle="Aguardando agendamento"
          icon={Package}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Em Andamento"
          value={stats.emAndamento}
          subtitle="Em rota / produção"
          icon={Activity}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Finalizados"
          value={stats.finalizados}
          subtitle="Concluídos no período"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
      </div>

      {/* Lista única — coletas aguardando NF */}
      <>
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por fornecedor, NF ou número..."
        activeFilters={filterStatus ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Status</p>
            <div className="flex flex-col gap-1">
              {[
                { v: "", l: "Todos os status" },
                { v: "pendente", l: "Pendente" },
                { v: "agendado", l: "Agendado" },
                { v: "em_rota", l: "Em rota" },
                { v: "recebido", l: "Recebido" },
                { v: "em_separacao", l: "Em Separação" },
                { v: "em_producao", l: "Em Produção" },
                { v: "finalizado", l: "Finalizado" },
                { v: "cancelado", l: "Cancelado" },
              ].map((opt) => (
                <button
                  key={opt.v || "todos"}
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
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel — placeholder")}
        onExportPdf={() => alert("Export PDF — placeholder")}
      />

      {/* Tabela canônica DS-FIPS — Data Listing */}
      <DataListingTable<Coleta>
        icon={<Inbox className="h-[22px] w-[22px]" />}
        title="Coletas"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterStatus ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterStatus)}
        data={filtered}
        getRowId={(c) => c.id}
        emptyState={loading ? "Carregando..." : "Nenhuma coleta encontrada"}
        columns={coletaColumns({
          onView: setDetalhesColeta,
          onDelete: handleDelete,
          onEditNF: openNFEdit,
          onEditColeta: (c) => { setEditingColeta(c); setDialogOpen(true); },
        })}
      />

      {/* Modal Nova Coleta */}
      <NovaColetaDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingColeta(null); }}
        onSuccess={fetchColetas}
        editingColeta={editingColeta}
      />

      {/* Modal Detalhes */}
      {detalhesColeta && (
        <ColetaDetalhes
          coleta={detalhesColeta}
          open={!!detalhesColeta}
          onOpenChange={(open) => { if (!open) setDetalhesColeta(null); }}
        />
      )}

      {/* Dialog NF — inserir/editar nota fiscal */}
      {nfEditColeta && (
        <Dialog open={!!nfEditColeta} onOpenChange={(open) => { if (!open) setNfEditColeta(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {nfEditColeta.notaFiscal ? "Editar Nota Fiscal" : "Inserir Nota Fiscal"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "var(--fips-surface-muted)", border: "1px solid var(--fips-border)" }}>
                <div className="flex justify-between"><span style={{ color: "var(--fips-fg-muted)" }}>Coleta</span><span className="font-bold" style={{ color: "var(--fips-fg)" }}>#{nfEditColeta.numero}</span></div>
                <div className="flex justify-between mt-1"><span style={{ color: "var(--fips-fg-muted)" }}>Fornecedor</span><span className="font-bold" style={{ color: "var(--fips-fg)" }}>{nfEditColeta.nomeFantasia}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[var(--fips-fg-muted)] block mb-1">Peso NF (kg)</label>
                  <input type="number" step="0.1" placeholder="0.0"
                    className="w-full rounded-lg border px-3 py-2 text-sm font-bold"
                    style={{ background: "var(--fips-surface)", borderColor: "var(--fips-border)", color: "var(--fips-fg)" }}
                    value={nfForm.pesoTotalNF} onChange={(e) => setNfForm(f => ({ ...f, pesoTotalNF: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[var(--fips-fg-muted)] block mb-1">Peso Atual (kg)</label>
                  <input type="number" step="0.1" placeholder="0.0"
                    className="w-full rounded-lg border px-3 py-2 text-sm font-bold"
                    style={{ background: "var(--fips-surface)", borderColor: "var(--fips-border)", color: "var(--fips-fg)" }}
                    value={nfForm.pesoTotalAtual} onChange={(e) => setNfForm(f => ({ ...f, pesoTotalAtual: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--fips-fg-muted)] block mb-1">Nº Nota Fiscal</label>
                <input type="text" placeholder="NF-XXXXX"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ background: "var(--fips-surface)", borderColor: "var(--fips-border)", color: "var(--fips-fg)" }}
                  value={nfForm.notaFiscal} onChange={(e) => setNfForm(f => ({ ...f, notaFiscal: e.target.value }))} />
              </div>
              {nfForm.pesoTotalNF && nfForm.pesoTotalAtual && (() => {
                const dif = parseFloat(nfForm.pesoTotalAtual) - parseFloat(nfForm.pesoTotalNF);
                return (
                  <div className="flex items-center gap-2 rounded-lg p-3" style={{
                    background: dif >= 0 ? "rgba(0,198,76,0.06)" : "rgba(220,38,38,0.06)",
                    border: `1px solid ${dif >= 0 ? "rgba(0,198,76,0.2)" : "rgba(220,38,38,0.2)"}`,
                  }}>
                    <Scale size={14} style={{ color: dif >= 0 ? "#00C64C" : "#DC2626" }} />
                    <span className="text-xs font-bold" style={{ color: dif >= 0 ? "#00C64C" : "#DC2626" }}>
                      Diferença: {dif >= 0 ? "+" : ""}{dif.toFixed(1)} kg
                    </span>
                  </div>
                );
              })()}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setNfEditColeta(null)}>Cancelar</Button>
              <Button variant="success" onClick={saveNF} className="gap-2">
                <FileText className="h-4 w-4" /> Salvar NF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </>
      {confirmDialog}
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION (below) ──────────────────────────── */

// SupervisorTab removed — NF action is directly in the table.
// When supervisor saves NF, status changes to em_separacao automatically.

function _SupervisorTabRemoved() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [separacoes, setSeparacoes] = useState<any[]>([]);

  const coletasEmSeparacao = useMemo(() =>
    coletas.filter(c => ["recebido", "em_separacao", "em_producao"].includes(c.status)),
    [coletas],
  );

  const openSeparacoes = useCallback((c: Coleta) => {
    setSelectedId(c.id);
    fetch(`/api/separacoes/coleta/${c.id}`).then(r => r.json()).then(setSeparacoes).catch(() => setSeparacoes([]));
  }, []);

  const selectedColeta = coletas.find(c => c.id === selectedId);

  return (
    <div className="space-y-4">
      <DataListingTable<Coleta>
        icon={<Shield className="h-[22px] w-[22px]" style={{ color: "var(--fips-primary)" }} />}
        title="Supervisor — Triagem"
        subtitle={`${coletasEmSeparacao.length} coletas em separação`}
        data={coletasEmSeparacao}
        getRowId={(c) => c.id}
        emptyState="Nenhuma coleta em triagem"
        columns={[
          {
            id: "numero", label: "#", fixed: true, width: "60px", sortable: true,
            render: (c) => <CellCodigo>#{c.numero}</CellCodigo>,
          },
          {
            id: "fornecedor", label: "Fornecedor", fixed: true, sortable: true,
            render: (c) => <span className="text-[11px] font-semibold text-[var(--fips-fg)]">{c.nomeFantasia}</span>,
          },
          {
            id: "notaFiscal", label: "Nota Fiscal", width: "100px",
            render: (c) => c.notaFiscal
              ? <Badge variant="success" dot>{c.notaFiscal}</Badge>
              : <Badge variant="warning">Sem NF</Badge>,
          },
          {
            id: "pesoNF", label: "Peso NF", align: "right" as const, width: "80px",
            render: (c) => <CellMonoStrong align="right">{c.pesoTotalNF ? `${c.pesoTotalNF}kg` : "—"}</CellMonoStrong>,
          },
          {
            id: "pesoAtual", label: "Peso Atual", align: "right" as const, width: "80px",
            render: (c) => <CellMonoStrong align="right">{c.pesoTotalAtual ? `${c.pesoTotalAtual}kg` : "—"}</CellMonoStrong>,
          },
          {
            id: "status", label: "Status", width: "100px", sortable: true,
            render: (c) => {
              const sc = statusConfig[c.status] || { label: c.status, variant: "secondary" as const };
              return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
            },
          },
          {
            id: "acoes", label: "Ações", fixed: true, width: "80px", align: "center" as const,
            render: (c) => (
              <CellActions>
                <CellActionButton title="Ver separações" variant="primary"
                  icon={<Eye className="h-3.5 w-3.5" />} onClick={() => openSeparacoes(c)} />
              </CellActions>
            ),
          },
        ]}
      />

      {/* Detalhe das separações */}
      {selectedId && selectedColeta && (
        <div className="rounded-xl p-4" style={{ border: "1px solid var(--fips-border)", background: "var(--fips-surface)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} style={{ color: "var(--fips-primary)" }} />
              <span className="text-sm font-bold" style={{ color: "var(--fips-fg)" }}>
                Coleta #{selectedColeta.numero} — {selectedColeta.nomeFantasia}
              </span>
              <Badge variant="info">{separacoes.length} lotes separados</Badge>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-xs px-2 py-1 rounded-lg"
              style={{ background: "var(--fips-surface-muted)", color: "var(--fips-fg-muted)", cursor: "pointer", border: "1px solid var(--fips-border)" }}>
              Fechar
            </button>
          </div>
          {separacoes.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: "var(--fips-fg-muted)" }}>Triagem ainda não separou lotes</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {separacoes.map((sep: any) => (
                <div key={sep.id} className="rounded-lg p-3" style={{ background: "var(--fips-surface-muted)", border: "1px solid var(--fips-border)" }}>
                  <div className="text-[11px] font-semibold" style={{ color: "var(--fips-fg)" }}>{sep.tipoMaterial}</div>
                  <div className="text-[10px]" style={{ color: "var(--fips-fg-muted)" }}>{sep.cor || "—"} · {sep.peso}kg</div>
                  <Badge variant={sep.destino === "producao" ? "info" : sep.destino === "descarte" ? "danger" : "warning"} className="mt-1 text-[9px]">
                    {sep.destino}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

interface ColetaColumnActions {
  onView: (c: Coleta) => void;
  onDelete: (id: string) => void;
  onEditNF: (c: Coleta) => void;
  onEditColeta: (c: Coleta) => void;
}

const formatDateBR = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";
const formatKg = (n: number) => (n ? `${n.toLocaleString("pt-BR")} kg` : "—");

function coletaColumns({ onView, onDelete, onEditNF, onEditColeta }: ColetaColumnActions): DataListingColumn<Coleta>[] {
  return [
    {
      id: "numero",
      label: "Nº",
      fixed: true,
      sortable: true,
      width: "64px",
      render: (c) => <CellCodigo>#{c.numero}</CellCodigo>,
    },
    {
      id: "fornecedor",
      label: "Fornecedor",
      sortable: true,
      width: "200px",
      render: (c, { density }) => (
        <div className="flex items-center gap-1.5 py-0.5">
          <Avatar
            name={c.nomeFantasia}
            size={density === "compact" ? 20 : density === "normal" ? 26 : 34}
          />
          <div className="min-w-0 leading-tight">
            <div className="font-semibold text-[var(--fips-fg)]">{c.nomeFantasia}</div>
            <div data-sub="" className="leading-none text-[var(--fips-fg-muted)]">{c.cnpjFornecedor}</div>
          </div>
        </div>
      ),
    },
    {
      id: "notaFiscal",
      label: "NF",
      sortable: true,
      width: "90px",
      render: (c) => c.notaFiscal
        ? <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--fips-fg)" }}>{c.notaFiscal}</span>
        : <span className="text-[11px]" style={{ color: "var(--fips-fg-muted)" }}>S/NF</span>,
    },
    {
      id: "pesoNF",
      label: "Peso NF",
      default: false,
      sortable: true,
      align: "right",
      width: "80px",
      render: (c) => <CellMonoMuted>{formatKg(c.pesoTotalNF)}</CellMonoMuted>,
    },
    {
      id: "pesoAtual",
      label: "Peso Atual",
      sortable: true,
      align: "right",
      width: "90px",
      render: (c) => <CellMonoStrong align="right">{formatKg(c.pesoTotalAtual)}</CellMonoStrong>,
    },
    {
      id: "dataPedido",
      label: "Pedido",
      sortable: true,
      width: "90px",
      render: (c) => <CellMonoMuted>{formatDateBR(c.dataPedido)}</CellMonoMuted>,
    },
    {
      id: "chegada",
      label: "Chegada",
      default: false,
      sortable: true,
      width: "90px",
      render: (c) => <CellMonoMuted>{formatDateBR(c.dataChegada)}</CellMonoMuted>,
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "110px",
      render: (c) => {
        const sc = statusConfig[c.status] || { label: c.status, variant: "secondary" as const };
        return (
          <Badge variant={sc.variant} dot>
            {sc.label}
          </Badge>
        );
      },
    },
    {
      id: "prioridade",
      label: "Prioridade",
      default: true,
      sortable: true,
      width: "90px",
      render: (c) => {
        const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
        const pMap = isDark ? PRIO_DARK : PRIO_LIGHT;
        const p = pMap[c.status] || { label: "Baixa", color: isDark ? "#6B7280" : "#4B5563" };
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: p.color }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            {p.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "130px",
      render: (c) => (
        <CellActions>
          <CellActionButton
            title={c.notaFiscal ? "Editar NF" : "Inserir NF"}
            icon={<FileText className="h-3.5 w-3.5" />}
            variant={c.notaFiscal ? "default" : "success"}
            onClick={() => onEditNF(c)}
          />
          <CellActionButton
            title="Editar coleta"
            icon={<Pencil className="h-3.5 w-3.5" />}
            variant="default"
            onClick={() => onEditColeta(c)}
          />
          <CellActionButton
            title="Ver detalhes"
            icon={<Eye className="h-3.5 w-3.5" />}
            variant="primary"
            onClick={() => onView(c)}
          />
          <CellActionButton
            title="Excluir coleta"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            variant="danger"
            onClick={() => onDelete(c.id)}
          />
        </CellActions>
      ),
    },
  ];
}
