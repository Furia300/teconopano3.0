import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Warehouse, Lock, Unlock, CheckCircle2, Clock, Truck, FileText,
  Package, AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { Avatar } from "@/components/domain/Avatar";
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

interface Expedicao {
  id: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  empresa?: string | null;
  descricaoProduto?: string | null;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  kilo?: number | null;
  qtdePedido?: number | null;
  qtdeEstoque?: number | null;
  unidadeMedida?: string | null;
  rota?: string | null;
  prioridade?: string | null;
  statusEntrega?: string | null;
  statusFinanceiro?: string | null;
  statusNota?: string | null;
  notaFiscal?: string | null;
  observacaoEscritorio?: string | null;
  observacaoGalpao?: string | null;
  dataEntrega?: string | null;
  createdAt?: string | null;
}

const FIPS = { azulProfundo: "#004B9B", verdeFloresta: "#00C64C", amareloEscuro: "#F6921E", azulEscuro: "#002A68" };

const STATUS_ENTREGA: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" | "secondary" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  aguardando_financeiro: { label: "Aguard. Financeiro", variant: "info" },
  aguardando_nf: { label: "Aguard. NF", variant: "info" },
  pronto_entrega: { label: "Liberado", variant: "success" },
  em_rota: { label: "Em Rota", variant: "info" },
  entregue: { label: "Entregue", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

export default function GalpaoExpedicaoPage() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/expedicoes");
      setExpedicoes(await res.json());
    } catch { toast.error("Erro ao carregar pedidos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return expedicoes.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (e.nomeFantasia ?? "").toLowerCase().includes(q) ||
        (e.descricaoProduto ?? "").toLowerCase().includes(q) ||
        (e.cnpj ?? "").includes(q) ||
        (e.notaFiscal ?? "").toLowerCase().includes(q);
      const matchStatus = !filterStatus || e.statusEntrega === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [expedicoes, search, filterStatus]);

  const stats = useMemo(() => {
    const pendentes = expedicoes.filter((e) => e.statusEntrega === "pendente").length;
    const aguardando = expedicoes.filter((e) => ["aguardando_financeiro", "aguardando_nf"].includes(e.statusEntrega || "")).length;
    const liberados = expedicoes.filter((e) => e.statusEntrega === "pronto_entrega").length;
    const emRota = expedicoes.filter((e) => e.statusEntrega === "em_rota").length;
    return { pendentes, aguardando, liberados, emRota, total: expedicoes.length };
  }, [expedicoes]);

  // ── AÇÕES DO GALPÃO ──
  const handleConfirmarMaterial = async (id: string) => {
    try {
      await fetch(`/api/expedicoes/${id}/confirmar-material`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      toast.success("Material confirmado — enviado para aprovação financeira");
      fetchData();
    } catch { toast.error("Erro ao confirmar material"); }
  };

  const handleLiberar = async (id: string) => {
    try {
      await fetch(`/api/expedicoes/${id}/liberar`, { method: "PUT" });
      toast.success("Caminhão liberado!");
      fetchData();
    } catch { toast.error("Erro ao liberar"); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galpão — Expedição"
        tutorialPage="estoque"
        description="Confirme material pronto e libere caminhões após NF emitida"
        icon={Warehouse}
        stats={[
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Aguardando", value: stats.aguardando, color: "#93BDE4" },
          { label: "Liberados", value: stats.liberados, color: "#00C64C" },
          { label: "Em Rota", value: stats.emRota, color: "#ed1b24" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Pendentes" value={stats.pendentes} subtitle="Aguardando confirmação material" icon={Clock} color={FIPS.amareloEscuro} />
        <StatsCard label="Aguardando" value={stats.aguardando} subtitle="Financeiro ou NF" icon={FileText} color={FIPS.azulProfundo} />
        <StatsCard label="Liberados" value={stats.liberados} subtitle="Prontos para entrega" icon={Truck} color={FIPS.verdeFloresta} />
        <StatsCard label="Em Rota" value={stats.emRota} subtitle="Motorista em trânsito" icon={Truck} color={FIPS.azulEscuro} />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente, produto, NF ou CNPJ..."
        activeFilters={filterStatus ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Status</p>
            <div className="flex flex-col gap-1">
              {[
                { v: "", l: "Todos" },
                { v: "pendente", l: "Pendente" },
                { v: "aguardando_financeiro", l: "Aguard. Financeiro" },
                { v: "aguardando_nf", l: "Aguard. NF" },
                { v: "pronto_entrega", l: "Liberado" },
                { v: "em_rota", l: "Em Rota" },
                { v: "entregue", l: "Entregue" },
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

      <DataListingTable<Expedicao>
        icon={<Warehouse className="h-[22px] w-[22px]" />}
        title="Pedidos — Visão Galpão"
        subtitle={`${filtered.length} pedidos ${search || filterStatus ? "filtrados" : "no total"}`}
        filtered={!!(search || filterStatus)}
        data={filtered}
        getRowId={(e) => e.id}
        emptyState={loading ? "Carregando..." : "Nenhum pedido"}
        columns={galpaoColumns({ onConfirmar: handleConfirmarMaterial, onLiberar: handleLiberar })}
      />
    </div>
  );
}

/* ── COLUNAS ── */

interface GalpaoActions {
  onConfirmar: (id: string) => void;
  onLiberar: (id: string) => void;
}

function EmpresaDot({ empresa }: { empresa?: string | null }) {
  const isBrazil = empresa === "brazil";
  return (
    <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11 }}>
      <span style={{
        width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
        background: isBrazil ? "linear-gradient(135deg, #16A34A, #EAB308)" : "linear-gradient(135deg, #FF073A, #1A1A1A)",
      }} />
      <span style={{
        fontWeight: 700, fontSize: 10,
        background: isBrazil ? "linear-gradient(135deg, #16A34A, #EAB308)" : "linear-gradient(135deg, #FF073A, #B20028)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>{isBrazil ? "Brazil" : "Tecnopano"}</span>
    </span>
  );
}

function galpaoColumns({ onConfirmar, onLiberar }: GalpaoActions): DataListingColumn<Expedicao>[] {
  return [
    {
      id: "acoes",
      label: "Ações",
      fixed: true,
      width: "120px",
      render: (e) => {
        const status = e.statusEntrega || "pendente";
        const nfEmitida = e.statusNota === "emitida";
        const finAprovado = e.statusFinanceiro === "aprovado";

        // Já liberado ou entregue
        if (status === "pronto_entrega" || status === "em_rota" || status === "entregue") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold"
              style={{ background: "rgba(0,198,76,0.1)", color: "#00C64C", border: "1px solid rgba(0,198,76,0.3)" }}>
              <Unlock size={12} />
              {status === "entregue" ? "ENTREGUE" : status === "em_rota" ? "EM ROTA" : "LIBERADO"}
            </span>
          );
        }

        // NF emitida + financeiro aprovado → pode LIBERAR
        if (nfEmitida && finAprovado) {
          return (
            <button onClick={() => onLiberar(e.id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #FF073A, #B20028)",
                color: "#fff", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(255,7,58,0.3)",
                border: "none",
              }}>
              <Lock size={12} /> LIBERAR
            </button>
          );
        }

        // Pendente → pode confirmar material
        if (status === "pendente") {
          return (
            <button onClick={() => onConfirmar(e.id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all"
              style={{
                background: "var(--fips-primary)", color: "#fff", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,75,155,0.25)", border: "none",
              }}>
              <Package size={12} /> CONFIRMAR
            </button>
          );
        }

        // Aguardando financeiro ou NF
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold"
            style={{ background: "rgba(246,146,30,0.1)", color: "#F6921E", border: "1px solid rgba(246,146,30,0.3)" }}>
            <Clock size={12} /> AGUARDANDO
          </span>
        );
      },
    },
    {
      id: "empresa",
      label: "Empresa",
      sortable: true,
      width: "95px",
      render: (e) => <EmpresaDot empresa={e.empresa} />,
    },
    {
      id: "cliente",
      label: "Cliente",
      fixed: true,
      sortable: true,
      render: (e, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar name={e.nomeFantasia || "—"} size={density === "compact" ? 22 : 28} />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)] text-[11px] truncate max-w-[160px]">{e.nomeFantasia || "—"}</div>
            {e.cnpj && <div className="text-[9px] text-[var(--fips-fg-muted)]">{e.cnpj}</div>}
          </div>
        </div>
      ),
    },
    {
      id: "produto",
      label: "Produto",
      sortable: true,
      width: "140px",
      render: (e) => (
        <div>
          <div className="text-[11px] text-[var(--fips-fg)]">{e.tipoMaterial || e.descricaoProduto || "—"}</div>
          {(e.cor || e.medida) && <div className="text-[9px] text-[var(--fips-fg-muted)]">{[e.cor, e.medida].filter(Boolean).join(" · ")}</div>}
        </div>
      ),
    },
    {
      id: "rota",
      label: "Rota",
      sortable: true,
      width: "70px",
      render: (e) => <CellMonoMuted>{e.rota || "—"}</CellMonoMuted>,
    },
    {
      id: "qtde",
      label: "Pedido",
      align: "right",
      width: "65px",
      render: (e) => <CellMonoStrong align="right">{e.qtdePedido ?? "—"}</CellMonoStrong>,
    },
    {
      id: "estoque",
      label: "Estoque",
      align: "right",
      width: "65px",
      render: (e) => (
        <span className="text-[11px] font-mono font-bold" style={{
          color: (e.qtdeEstoque ?? 0) > 0 ? "var(--fips-success-strong)" : "var(--fips-fg-muted)",
        }}>
          {e.qtdeEstoque ?? 0}
        </span>
      ),
    },
    {
      id: "produzir",
      label: "Produzir",
      align: "right",
      width: "70px",
      render: (e) => {
        const pedido = e.qtdePedido ?? 0;
        const estoque = e.qtdeEstoque ?? 0;
        const produzir = Math.max(0, pedido - estoque);
        return (
          <span className="text-[11px] font-mono font-bold" style={{
            color: produzir > 0 ? "var(--fips-warning)" : "var(--fips-success-strong)",
          }}>
            {produzir > 0 ? produzir : "OK"}
          </span>
        );
      },
    },
    {
      id: "peso",
      label: "Peso",
      align: "right",
      width: "70px",
      render: (e) => <CellMonoStrong align="right">{e.kilo ? `${e.kilo}kg` : "—"}</CellMonoStrong>,
    },
    {
      id: "statusEntrega",
      label: "Entrega",
      sortable: true,
      width: "110px",
      render: (e) => {
        const sc = STATUS_ENTREGA[e.statusEntrega || "pendente"] || { label: e.statusEntrega || "—", variant: "secondary" as const };
        return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
      },
    },
    {
      id: "statusFinanceiro",
      label: "Financeiro",
      sortable: true,
      width: "90px",
      render: (e) => {
        const sf = e.statusFinanceiro;
        if (sf === "aprovado") return <Badge variant="success" dot>Aprovado</Badge>;
        if (sf === "rejeitado") return <Badge variant="danger" dot>Rejeitado</Badge>;
        return <Badge variant="warning" dot>Pendente</Badge>;
      },
    },
    {
      id: "statusNota",
      label: "NF",
      sortable: true,
      width: "85px",
      render: (e) => {
        if (e.statusNota === "emitida") return <Badge variant="success" dot>Emitida</Badge>;
        return <Badge variant="warning" dot>Pendente</Badge>;
      },
    },
    {
      id: "notaFiscal",
      label: "Nº NF",
      width: "90px",
      render: (e) => <CellMonoMuted>{e.notaFiscal || "—"}</CellMonoMuted>,
    },
    {
      id: "obsEscritorio",
      label: "Obs Escritório",
      width: "120px",
      render: (e) => <CellMuted>{e.observacaoEscritorio || "—"}</CellMuted>,
    },
    {
      id: "obsGalpao",
      label: "Obs Galpão",
      width: "120px",
      render: (e) => <CellMuted>{e.observacaoGalpao || "—"}</CellMuted>,
    },
    {
      id: "dataCriacao",
      label: "Criação",
      sortable: true,
      width: "80px",
      render: (e) => <CellMonoMuted>{formatDateBR(e.createdAt)}</CellMonoMuted>,
    },
    {
      id: "dataEntrega",
      label: "Entrega",
      sortable: true,
      width: "80px",
      render: (e) => <CellMonoMuted>{formatDateBR(e.dataEntrega)}</CellMonoMuted>,
    },
  ];
}
