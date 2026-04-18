import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Lock,
  CheckCircle2,
  FileText,
  Send,
  CalendarDays,
  Repeat,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NovoPedidoDialog } from "./NovoPedidoDialog";
import { ExpedicaoDetalhes } from "./ExpedicaoDetalhes";
import { useConfirmDelete } from "@/components/domain/ConfirmDeleteDialog";

interface Expedicao {
  id: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  empresa?: string | null;
  agendamento?: string | null;
  descricaoProduto?: string | null;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  qtdePedido?: number | null;
  qtdeEstoque?: number | null;
  unidadeMedida?: string | null;
  galpao?: string | null;
  rota?: string | null;
  prioridade?: string | null;
  statusEntrega?: string | null;
  statusFinanceiro?: string | null;
  statusNota?: string | null;
  notaFiscal?: string | null;
  dataEntrega?: string | null;
  createdAt?: string | null;
}

const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

const STATUS_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  pendente: { label: "Pendente", variant: "warning" },
  reservado: { label: "Reservado", variant: "info" },
  aguardando_financeiro: { label: "Aguardando Financeiro", variant: "warning" },
  aguardando_nf: { label: "Aguardando NF", variant: "info" },
  pronto_entrega: { label: "Pronto p/ Entrega", variant: "success" },
  em_rota: { label: "Em Rota", variant: "info" },
  entregue: { label: "Entregue", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

export default function ExpedicaoList() {
  const [pedidos, setPedidos] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Expedicao | null>(null);
  const [detailItem, setDetailItem] = useState<Expedicao | null>(null);
  const [confirmDialog, openConfirm] = useConfirmDelete();

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/expedicoes");
      const data = await res.json();
      setPedidos(data);
    } catch {
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (p.nomeFantasia ?? "").toLowerCase().includes(q) ||
        (p.descricaoProduto ?? "").toLowerCase().includes(q) ||
        (p.tipoMaterial ?? "").toLowerCase().includes(q) ||
        (p.notaFiscal ?? "").toLowerCase().includes(q);
      const matchStatus = !filterStatus || p.statusEntrega === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [pedidos, search, filterStatus]);

  const stats = useMemo(() => {
    const total = pedidos.length;
    const aguardando = pedidos.filter(
      (p) => p.statusFinanceiro === "pendente_aprovacao",
    ).length;
    const aprovados = pedidos.filter((p) => p.statusFinanceiro === "aprovado").length;
    const entregues = pedidos.filter((p) => p.statusEntrega === "entregue").length;
    return { total, aguardando, aprovados, entregues };
  }, [pedidos]);

  const handleDelete = (id: string) => {
    openConfirm({
      title: "Excluir pedido",
      description: "Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/expedicoes/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          toast.success("Pedido excluído.");
          fetchPedidos();
        } catch {
          toast.error("Erro ao excluir pedido.");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        tutorialPage="expedicao"
        description="Pedidos de cliente B2B — fluxo Michele → Lane (libera) → Financeiro (aprova) → NF → Motorista"
        icon={Send}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Aguardando", value: stats.aguardando, color: "#FDC24E" },
          { label: "Aprovados", value: stats.aprovados, color: "#00C64C" },
          { label: "Entregues", value: stats.entregues, color: "#ed1b24" },
        ]}
        actions={
          <Button onClick={() => { setEditingPedido(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            Novo pedido
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Pedidos"
          value={stats.total}
          subtitle="Cadastrados no sistema"
          icon={Package}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Aguardando Aprovação"
          value={stats.aguardando}
          subtitle="Financeiro pendente"
          icon={Lock}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Aprovados"
          value={stats.aprovados}
          subtitle="Prontos para NF / entrega"
          icon={FileText}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Entregues"
          value={stats.entregues}
          subtitle="Concluídos no período"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente, produto, NF..."
        activeFilters={filterStatus ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Status entrega
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setFilterStatus("")}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                  !filterStatus
                    ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
                    : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                }`}
              >
                Todos os status
              </button>
              {Object.entries(STATUS_VARIANTS).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterStatus === key
                      ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  {label}
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

      <DataListingTable<Expedicao>
        icon={<Send className="h-[22px] w-[22px]" />}
        title="Pedidos"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterStatus ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterStatus)}
        data={filtered}
        getRowId={(p) => p.id}
        emptyState={
          loading
            ? "Carregando pedidos..."
            : "Nenhum pedido cadastrado — clique em + Novo pedido"
        }
        columns={pedidoColumns({
          onView: (p) => setDetailItem(p),
          onEdit: (p) => { setEditingPedido(p); setDialogOpen(true); },
          onDelete: handleDelete,
        })}
      />

      <NovoPedidoDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingPedido(null); }}
        onSuccess={fetchPedidos}
        editingPedido={editingPedido}
      />

      {detailItem && (
        <ExpedicaoDetalhes
          expedicao={detailItem as any}
          open={!!detailItem}
          onOpenChange={(open) => !open && setDetailItem(null)}
        />
      )}
      {confirmDialog}
    </div>
  );
}

interface PedidoActions {
  onView: (p: Expedicao) => void;
  onEdit: (p: Expedicao) => void;
  onDelete: (id: string) => void;
}

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

function EmpresaDot({ empresa }: { empresa?: string | null }) {
  const isBrazil = empresa === "brazil";
  const isTecno = empresa === "tecnopano";
  const isAmbas = empresa === "ambas";
  const isIndef = !empresa || empresa === "indefinido";

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
}

function pedidoColumns({ onView, onEdit, onDelete }: PedidoActions): DataListingColumn<Expedicao>[] {
  return [
    {
      id: "cliente",
      label: "Cliente",
      fixed: true,
      sortable: true,
      render: (p, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={p.nomeFantasia || "—"}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">{p.nomeFantasia || "—"}</div>
            {p.cnpj && <div className="text-[10px] text-[var(--fips-fg-muted)]">{p.cnpj}</div>}
          </div>
        </div>
      ),
    },
    {
      id: "empresa",
      label: "Empresa",
      sortable: true,
      width: "110px",
      render: (p) => <EmpresaDot empresa={p.empresa} />,
    },
    {
      id: "produto",
      label: "Produto",
      sortable: true,
      render: (p) => (
        <div>
          <div className="text-[var(--fips-fg)]">{p.tipoMaterial || p.descricaoProduto || "—"}</div>
          {(p.cor || p.medida) && (
            <div className="text-[10px] text-[var(--fips-fg-muted)]">
              {[p.cor, p.medida].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "qtde",
      label: "Qtde",
      sortable: true,
      align: "right",
      render: (p) => (
        <div className="text-right">
          <CellMonoStrong align="right">{p.qtdePedido ?? "—"}</CellMonoStrong>
          {(p.qtdeEstoque ?? 0) > 0 && (
            <div className="text-[10px] text-[var(--fips-success-strong)]">
              {p.qtdeEstoque} reservado
            </div>
          )}
        </div>
      ),
    },
    {
      id: "rota",
      label: "Rota",
      sortable: true,
      width: "70px",
      render: (p) => <CellMonoMuted>{p.rota || "—"}</CellMonoMuted>,
    },
    {
      id: "criacao",
      label: "Criação",
      sortable: true,
      width: "85px",
      render: (p) => <CellMonoMuted>{formatDateBR(p.createdAt)}</CellMonoMuted>,
    },
    {
      id: "dataEntrega",
      label: "Entrega",
      sortable: true,
      width: "85px",
      render: (p) => <CellMonoMuted>{formatDateBR(p.dataEntrega)}</CellMonoMuted>,
    },
    {
      id: "statusEntrega",
      label: "Status",
      sortable: true,
      render: (p) => {
        const sc = STATUS_VARIANTS[p.statusEntrega ?? "pendente"] || {
          label: p.statusEntrega || "—",
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
      id: "statusFinanceiro",
      label: "Financeiro",
      sortable: true,
      render: (p) => {
        const sf = p.statusFinanceiro;
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
      id: "notaFiscal",
      label: "NF",
      render: (p) => <CellMuted>{p.notaFiscal || "—"}</CellMuted>,
    },
    {
      id: "agendamento",
      label: "Agend.",
      width: "55px",
      align: "center",
      render: (p) => {
        if (!p.agendamento) return <CellMuted>—</CellMuted>;
        try {
          const ag = JSON.parse(p.agendamento);
          const count = ag.datas?.length || 0;
          return (
            <span className="inline-flex items-center gap-1" title={`${count} entregas recorrentes`}>
              <Repeat size={12} style={{ color: "var(--fips-primary)" }} />
              <span className="text-[10px] font-bold" style={{ color: "var(--fips-primary)" }}>{count}</span>
            </span>
          );
        } catch { return <CellMuted>—</CellMuted>; }
      },
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "110px",
      render: (p) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            variant="primary"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onView(p)}
          />
          <CellActionButton
            title="Editar"
            variant="default"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit(p)}
          />
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
