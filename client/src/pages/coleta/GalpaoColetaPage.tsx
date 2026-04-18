import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Truck, FileText, Scale, CheckCircle2, Clock, Pencil, Eye,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import {
  DataListingTable,
  type DataListingColumn,
  CellCodigo,
  CellMonoStrong,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

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
  status: string;
  observacao: string;
}

const FIPS = { azulProfundo: "#004B9B", verdeFloresta: "#00C64C", amareloEscuro: "#F6921E", azulEscuro: "#002A68" };

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  agendado: { label: "Agendado", variant: "info" },
  em_rota: { label: "Em Rota", variant: "info" },
  recebido: { label: "Recebido", variant: "success" },
  em_separacao: { label: "Em Separação", variant: "info" },
  em_producao: { label: "Em Produção", variant: "info" },
  finalizado: { label: "Finalizado", variant: "success" },
};

const formatDateBR = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

export default function GalpaoColetaPage() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [nfColeta, setNfColeta] = useState<Coleta | null>(null);
  const [nfForm, setNfForm] = useState({ pesoTotalNF: "", pesoTotalAtual: "", notaFiscal: "" });

  const fetchColetas = async () => {
    try {
      const res = await fetch("/api/coletas");
      setColetas(await res.json());
    } catch { toast.error("Erro ao carregar coletas"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchColetas(); }, []);

  const sorted = useMemo(() =>
    [...coletas].sort((a, b) => (b.dataPedido || "").localeCompare(a.dataPedido || "")),
    [coletas],
  );

  const filtered = useMemo(() => {
    return sorted.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        c.nomeFantasia.toLowerCase().includes(q) ||
        (c.notaFiscal || "").toLowerCase().includes(q) ||
        String(c.numero).includes(q);
      const matchStatus = !filterStatus || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [sorted, search, filterStatus]);

  const stats = useMemo(() => ({
    total: coletas.length,
    pendentes: coletas.filter(c => c.status === "pendente" || c.status === "agendado").length,
    recebidas: coletas.filter(c => c.status === "recebido").length,
    emSeparacao: coletas.filter(c => c.status === "em_separacao").length,
  }), [coletas]);

  const openNF = (c: Coleta) => {
    setNfColeta(c);
    setNfForm({
      pesoTotalNF: c.pesoTotalNF ? String(c.pesoTotalNF) : "",
      pesoTotalAtual: c.pesoTotalAtual ? String(c.pesoTotalAtual) : "",
      notaFiscal: c.notaFiscal || "",
    });
  };

  const saveNF = async () => {
    if (!nfColeta) return;
    try {
      await fetch(`/api/coletas/${nfColeta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoTotalNF: parseFloat(nfForm.pesoTotalNF) || 0,
          pesoTotalAtual: parseFloat(nfForm.pesoTotalAtual) || 0,
          notaFiscal: nfForm.notaFiscal,
          status: "recebido",
        }),
      });
      toast.success("NF salva — coleta recebida!");
      setNfColeta(null);
      fetchColetas();
    } catch { toast.error("Erro ao salvar"); }
  };

  const difPeso = nfForm.pesoTotalNF && nfForm.pesoTotalAtual
    ? (parseFloat(nfForm.pesoTotalAtual) - parseFloat(nfForm.pesoTotalNF))
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coleta — Galpão"
        description="Recebimento de material e registro de nota fiscal"
        icon={Truck}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Recebidas", value: stats.recebidas, color: "#00C64C" },
          { label: "Em Separação", value: stats.emSeparacao, color: "#ed1b24" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Coletas" value={stats.total} subtitle="Todas as coletas" icon={Truck} color={FIPS.azulProfundo} />
        <StatsCard label="Pendentes" value={stats.pendentes} subtitle="Aguardando chegada" icon={Clock} color={FIPS.amareloEscuro} />
        <StatsCard label="Recebidas" value={stats.recebidas} subtitle="NF registrada" icon={CheckCircle2} color={FIPS.verdeFloresta} />
        <StatsCard label="Em Separação" value={stats.emSeparacao} subtitle="Na triagem" icon={Scale} color={FIPS.azulEscuro} />
      </div>

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
                { v: "", l: "Todos" },
                { v: "pendente", l: "Pendente" },
                { v: "recebido", l: "Recebido" },
                { v: "em_separacao", l: "Em Separação" },
                { v: "em_producao", l: "Em Produção" },
                { v: "finalizado", l: "Finalizado" },
              ].map((opt) => (
                <button key={opt.v || "all"} onClick={() => setFilterStatus(opt.v)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterStatus === opt.v
                      ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <DataListingTable<Coleta>
        icon={<Truck className="h-[22px] w-[22px]" />}
        title="Coletas"
        subtitle={`${filtered.length} registros · Ordem decrescente`}
        filtered={!!(search || filterStatus)}
        data={filtered}
        getRowId={(c) => c.id}
        emptyState={loading ? "Carregando..." : "Nenhuma coleta encontrada"}
        columns={[
          {
            id: "numero", label: "Nº", fixed: true, sortable: true, width: "60px",
            render: (c) => <CellCodigo>#{c.numero}</CellCodigo>,
          },
          {
            id: "fornecedor", label: "Fornecedor", fixed: true, sortable: true,
            render: (c) => (
              <div className="min-w-0">
                <div className="font-semibold text-[11px] text-[var(--fips-fg)]">{c.nomeFantasia}</div>
                {c.cnpjFornecedor && <div className="text-[9px] text-[var(--fips-fg-muted)]">{c.cnpjFornecedor}</div>}
              </div>
            ),
          },
          {
            id: "nf", label: "NF", sortable: true, width: "100px",
            render: (c) => c.notaFiscal
              ? <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--fips-fg)" }}>{c.notaFiscal}</span>
              : <span className="text-[11px]" style={{ color: "var(--fips-fg-muted)" }}>S/NF</span>,
          },
          {
            id: "pesoAtual", label: "Peso Atual", sortable: true, align: "right", width: "90px",
            render: (c) => <CellMonoStrong align="right">{c.pesoTotalAtual ? `${c.pesoTotalAtual.toLocaleString("pt-BR")} kg` : "—"}</CellMonoStrong>,
          },
          {
            id: "pedido", label: "Pedido", sortable: true, width: "85px",
            render: (c) => <CellMuted>{formatDateBR(c.dataPedido)}</CellMuted>,
          },
          {
            id: "status", label: "Status", sortable: true, width: "100px",
            render: (c) => {
              const sc = statusConfig[c.status] || { label: c.status, variant: "secondary" as const };
              return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
            },
          },
          {
            id: "acoes", label: "Ações", fixed: true, align: "center", width: "90px",
            render: (c) => (
              <CellActions>
                <CellActionButton
                  title={c.notaFiscal ? "Editar NF" : "Inserir NF"}
                  variant={c.notaFiscal ? "default" : "success"}
                  icon={c.notaFiscal ? <Pencil className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                  onClick={() => openNF(c)}
                />
              </CellActions>
            ),
          },
        ]}
      />

      {/* Modal NF */}
      {nfColeta && (
        <Dialog open={!!nfColeta} onOpenChange={(v) => { if (!v) setNfColeta(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {nfColeta.notaFiscal ? "Editar Nota Fiscal" : "Inserir Nota Fiscal"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "var(--fips-surface-muted)", border: "1px solid var(--fips-border)" }}>
                <div className="flex justify-between"><span style={{ color: "var(--fips-fg-muted)" }}>Coleta</span><span className="font-bold" style={{ color: "var(--fips-fg)" }}>#{nfColeta.numero}</span></div>
                <div className="flex justify-between mt-1"><span style={{ color: "var(--fips-fg-muted)" }}>Fornecedor</span><span className="font-bold" style={{ color: "var(--fips-fg)" }}>{nfColeta.nomeFantasia}</span></div>
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
              {difPeso !== null && (
                <div className="flex items-center gap-2 rounded-lg p-3" style={{
                  background: difPeso >= 0 ? "rgba(0,198,76,0.06)" : "rgba(220,38,38,0.06)",
                  border: `1px solid ${difPeso >= 0 ? "rgba(0,198,76,0.2)" : "rgba(220,38,38,0.2)"}`,
                }}>
                  <Scale size={14} style={{ color: difPeso >= 0 ? "#00C64C" : "#DC2626" }} />
                  <span className="text-xs font-bold" style={{ color: difPeso >= 0 ? "#00C64C" : "#DC2626" }}>
                    Diferença: {difPeso >= 0 ? "+" : ""}{difPeso.toFixed(1)} kg
                  </span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setNfColeta(null)}>Cancelar</Button>
              <Button variant="success" onClick={saveNF} className="gap-2">
                <FileText className="h-4 w-4" /> Salvar NF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
