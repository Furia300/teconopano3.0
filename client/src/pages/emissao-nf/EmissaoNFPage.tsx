import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle2,
  Printer,
  Package,
  Inbox,
  Pencil,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  clienteId?: string | null;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  empresa?: string | null;
  agendamento?: string | null;
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

  // Modal de emissão
  const [emitirItem, setEmitirItem] = useState<Expedicao | null>(null);
  const [emitirEmpresa, setEmitirEmpresa] = useState<string>("tecnopano");
  const [emitindo, setEmitindo] = useState(false);

  const openEmitir = (e: Expedicao) => {
    setEmitirItem(e);
    setEmitirEmpresa(e.empresa && e.empresa !== "indefinido" ? e.empresa : "tecnopano");
  };

  const handleEmitir = async () => {
    if (!emitirItem) return;
    setEmitindo(true);
    try {
      const res = await fetch(`/api/expedicoes/${emitirItem.id}/emitir-nf`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa: emitirEmpresa, clienteId: emitirItem.clienteId }),
      });
      if (!res.ok) throw new Error();
      const isIndefinido = !emitirItem.empresa || emitirItem.empresa === "indefinido";
      toast.success(
        `NF emitida via ${emitirEmpresa === "brazil" ? "Brazil" : "Tecnopano"}!` +
        (isIndefinido ? ` Cliente classificado como ${emitirEmpresa === "brazil" ? "Brazil" : "Tecnopano"}.` : ""),
      );
      setEmitirItem(null);
      fetchData();
    } catch {
      toast.error("Erro ao emitir nota fiscal.");
    } finally {
      setEmitindo(false);
    }
  };

  // Alterar empresa de um pedido
  const handleAlterarEmpresa = async (id: string, novaEmpresa: string) => {
    try {
      const res = await fetch(`/api/expedicoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa: novaEmpresa }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Empresa alterada para ${novaEmpresa === "brazil" ? "Brazil" : "Tecnopano"}`);
      fetchData();
    } catch {
      toast.error("Erro ao alterar empresa.");
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
                      ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
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
                        ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
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
        columns={emissaoColumns({ onEmitir: openEmitir, onAlterarEmpresa: handleAlterarEmpresa })}
      />

      {/* ═══ MODAL EMISSÃO DE NF ═══ */}
      {emitirItem && (
        <Dialog open={!!emitirItem} onOpenChange={(open) => !open && setEmitirItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                Emitir Nota Fiscal
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Info do pedido */}
              <div className="rounded-xl px-4 py-3 text-xs space-y-1.5" style={{
                background: "var(--fips-surface-muted)", border: "1px solid var(--fips-border)",
              }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--fips-fg-muted)" }}>Cliente</span>
                  <span className="font-semibold" style={{ color: "var(--fips-fg)" }}>{emitirItem.nomeFantasia || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--fips-fg-muted)" }}>Produto</span>
                  <span className="font-semibold" style={{ color: "var(--fips-fg)" }}>{emitirItem.descricaoProduto || "—"}</span>
                </div>
                {emitirItem.cnpj && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--fips-fg-muted)" }}>CNPJ</span>
                    <span className="font-mono" style={{ color: "var(--fips-fg)" }}>{emitirItem.cnpj}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: "var(--fips-fg-muted)" }}>Peso/Qtde</span>
                  <span className="font-semibold" style={{ color: "var(--fips-fg)" }}>
                    {emitirItem.kilo ? `${emitirItem.kilo} kg` : ""} {emitirItem.unidade ? `/ ${emitirItem.unidade} un` : ""}
                  </span>
                </div>
              </div>

              {/* Seletor de empresa emissora */}
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: "var(--fips-fg)" }}>
                  Emitir nota por qual empresa?
                </p>
                {(!emitirItem.empresa || emitirItem.empresa === "indefinido") && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                    style={{ background: "rgba(253,194,78,0.1)", border: "1px solid rgba(253,194,78,0.3)", color: "#FDC24E" }}>
                    <AlertCircle size={14} />
                    <span>Cliente ainda não classificado — selecione a empresa e ela será salva automaticamente.</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {/* Brazil */}
                  <button type="button" onClick={() => setEmitirEmpresa("brazil")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: emitirEmpresa === "brazil" ? "rgba(22,163,74,0.08)" : "var(--fips-surface)",
                      border: `2px solid ${emitirEmpresa === "brazil" ? "#16A34A" : "var(--fips-border)"}`,
                      cursor: "pointer",
                      boxShadow: emitirEmpresa === "brazil" ? "0 0 12px rgba(22,163,74,0.2)" : "none",
                    }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "linear-gradient(135deg, #16A34A, #EAB308)",
                      boxShadow: "0 0 8px rgba(22,163,74,0.3)",
                    }} />
                    <span className="text-xs font-bold" style={{
                      background: "linear-gradient(135deg, #16A34A, #EAB308)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>Brazil</span>
                    {emitirEmpresa === "brazil" && <CheckCircle2 size={14} style={{ color: "#16A34A" }} />}
                  </button>

                  {/* Tecnopano */}
                  <button type="button" onClick={() => setEmitirEmpresa("tecnopano")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: emitirEmpresa === "tecnopano" ? "rgba(255,7,58,0.06)" : "var(--fips-surface)",
                      border: `2px solid ${emitirEmpresa === "tecnopano" ? "#FF073A" : "var(--fips-border)"}`,
                      cursor: "pointer",
                      boxShadow: emitirEmpresa === "tecnopano" ? "0 0 12px rgba(255,7,58,0.15)" : "none",
                    }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "linear-gradient(135deg, #FF073A, #1A1A1A)",
                      boxShadow: "0 0 8px rgba(255,7,58,0.3)",
                    }} />
                    <span className="text-xs font-bold" style={{
                      background: "linear-gradient(135deg, #FF073A, #B20028)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>Tecnopano</span>
                    {emitirEmpresa === "tecnopano" && <CheckCircle2 size={14} style={{ color: "#FF073A" }} />}
                  </button>
                </div>
                <p className="mt-2 text-[10px]" style={{ color: "var(--fips-fg-muted)" }}>
                  A NF será gerada com prefixo {emitirEmpresa === "brazil" ? "NF-BRZ-" : "NF-TNP-"}XXXX
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setEmitirItem(null)}>Cancelar</Button>
              <Button variant="success" onClick={handleEmitir} loading={emitindo} className="gap-2">
                <FileText className="h-4 w-4" />
                Emitir NF ({emitirEmpresa === "brazil" ? "Brazil" : "Tecnopano"})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

interface EmissaoColumnActions {
  onEmitir: (e: Expedicao) => void;
  onAlterarEmpresa: (id: string, empresa: string) => void;
}

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} kg` : "—";

function emissaoColumns({ onEmitir, onAlterarEmpresa }: EmissaoColumnActions): DataListingColumn<Expedicao>[] {
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
      id: "empresa",
      label: "Empresa",
      sortable: true,
      width: "120px",
      render: (e) => {
        const isBrazil = e.empresa === "brazil";
        const isTecno = e.empresa === "tecnopano";
        const isAmbas = e.empresa === "ambas";
        const isIndef = !e.empresa || e.empresa === "indefinido";

        if (isIndef) {
          return (
            <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11 }}>
              <span style={{
                width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #FDC24E, #F59E0B)",
                boxShadow: "0 0 6px rgba(253,194,78,0.4)",
              }} />
              <span style={{ fontWeight: 700, fontSize: 11, color: "#FDC24E" }}>Indefinido</span>
            </span>
          );
        }
        if (isAmbas) {
          return (
            <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11 }}>
              <span style={{
                width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #16A34A, #FF073A)",
                boxShadow: "0 0 6px rgba(139,92,246,0.4)",
              }} />
              <span style={{ fontWeight: 700, fontSize: 11, color: "#A78BFA" }}>Ambas</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11 }}>
            <span style={{
              width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
              background: isBrazil ? "linear-gradient(135deg, #16A34A, #EAB308)" : "linear-gradient(135deg, #FF073A, #1A1A1A)",
              boxShadow: isBrazil ? "0 0 6px rgba(22,163,74,0.4)" : "0 0 6px rgba(255,7,58,0.4)",
            }} />
            <span style={{
              fontWeight: 700, fontSize: 11,
              background: isBrazil ? "linear-gradient(135deg, #16A34A, #EAB308)" : "linear-gradient(135deg, #FF073A, #B20028)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{isBrazil ? "Brazil" : "Tecnopano"}</span>
          </span>
        );
      },
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
      label: "Ações",
      fixed: true,
      align: "center",
      width: "110px",
      render: (e) => (
        <CellActions>
          {e.statusNota !== "emitida" && (
            <CellActionButton
              title="Emitir NF"
              variant="primary"
              icon={<FileText className="h-3.5 w-3.5" />}
              onClick={() => onEmitir(e)}
            />
          )}
          <CellActionButton
            title={`Alterar para ${e.empresa === "brazil" ? "Tecnopano" : "Brazil"}`}
            variant="default"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onAlterarEmpresa(e.id, e.empresa === "brazil" ? "tecnopano" : "brazil")}
          />
        </CellActions>
      ),
    },
  ];
}
