import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Box,
  Plus,
  Pencil,
  Trash2,
  Layers,
  Palette,
  DollarSign,
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
import { NovoProdutoDialog } from "./NovoProdutoDialog";

interface Produto {
  id: string;
  codigo?: string | null;
  nome?: string | null;
  descricao: string;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  pesoMedio?: number | null;
  unidadeMedida?: string | null;
  precoCusto?: number | null;
  precoVenda?: number | null;
  ativo?: boolean;
}

const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

export default function ProdutosList() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  const fetchProdutos = async () => {
    try {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProdutos(data);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const filtered = useMemo(() => {
    return produtos.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (p.nome ?? "").toLowerCase().includes(q) ||
        p.descricao.toLowerCase().includes(q) ||
        (p.codigo ?? "").toLowerCase().includes(q) ||
        (p.tipoMaterial ?? "").toLowerCase().includes(q);
      const matchTipo = !filterTipo || p.tipoMaterial === filterTipo || p.nome === filterTipo;
      return matchSearch && matchTipo;
    });
  }, [produtos, search, filterTipo]);

  const stats = useMemo(() => {
    const total = produtos.length;
    const ativos = produtos.filter((p) => p.ativo !== false).length;
    const codigosUnicos = new Set(produtos.map((p) => p.codigo).filter(Boolean)).size;
    const comPreco = produtos.filter((p) => (p.precoVenda ?? 0) > 0).length;
    return { total, ativos, codigosUnicos, comPreco };
  }, [produtos]);

  // Tipos únicos (agrupados pelo nome do produto base)
  const tipos = useMemo(() => {
    const set = new Set<string>();
    produtos.forEach((p) => {
      const t = p.nome || p.tipoMaterial;
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [produtos]);

  const openNew = () => {
    setEditingProduto(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Produto) => {
    setEditingProduto(p);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Inativar este produto?")) return;
    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Produto inativado.");
      fetchProdutos();
    } catch {
      toast.error("Erro ao inativar produto.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Catálogo de produtos finais — variantes (cor/medida/acabamento) do mesmo modelo base"
        icon={Box}
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Produtos"
          value={stats.total}
          subtitle="Variantes cadastradas"
          icon={Box}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Modelos Base"
          value={stats.codigosUnicos}
          subtitle="Códigos únicos"
          icon={Layers}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Ativos"
          value={stats.ativos}
          subtitle={`${stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}% do total`}
          icon={Palette}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Com Preço"
          value={stats.comPreco}
          subtitle="Disponíveis para venda"
          icon={DollarSign}
          color={FIPS_COLORS.amareloEscuro}
        />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por código, nome, descrição..."
        activeFilters={filterTipo ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Linha de produto
            </p>
            <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto">
              <button
                onClick={() => setFilterTipo("")}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                  !filterTipo
                    ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                    : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                }`}
              >
                Todas as linhas
              </button>
              {tipos.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTipo(t)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterTipo === t
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  {t}
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

      <DataListingTable<Produto>
        icon={<Box className="h-[22px] w-[22px]" />}
        title="Produtos"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterTipo ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterTipo)}
        data={filtered}
        getRowId={(p) => p.id}
        emptyState={loading ? "Carregando produtos..." : "Nenhum produto encontrado"}
        columns={produtoColumns({ onEdit: openEdit, onDelete: handleDelete })}
      />

      <NovoProdutoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchProdutos}
        produto={editingProduto}
      />
    </div>
  );
}

interface ProdutoActions {
  onEdit: (p: Produto) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (n: number | null | undefined) =>
  n ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";

function produtoColumns({ onEdit, onDelete }: ProdutoActions): DataListingColumn<Produto>[] {
  return [
    {
      id: "codigo",
      label: "Código",
      sortable: true,
      width: "90px",
      render: (p) => <CellMonoMuted>{p.codigo || "—"}</CellMonoMuted>,
    },
    {
      id: "nome",
      label: "Produto",
      fixed: true,
      sortable: true,
      render: (p, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={p.nome || p.descricao}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">{p.nome || p.descricao}</div>
            {p.descricao && p.descricao !== p.nome && (
              <div className="truncate text-[10px] text-[var(--fips-fg-muted)]">{p.descricao}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "cor",
      label: "Cor",
      sortable: true,
      render: (p) => <CellMuted>{p.cor || "—"}</CellMuted>,
    },
    {
      id: "medida",
      label: "Medida",
      sortable: true,
      render: (p) => <CellMonoMuted>{p.medida || "—"}</CellMonoMuted>,
    },
    {
      id: "acabamento",
      label: "Acabamento",
      sortable: true,
      render: (p) => <CellMuted>{p.acabamento || "—"}</CellMuted>,
    },
    {
      id: "unidadeMedida",
      label: "Unidade",
      render: (p) => <CellMuted>{p.unidadeMedida || "—"}</CellMuted>,
    },
    {
      id: "precoVenda",
      label: "Preço",
      sortable: true,
      align: "right",
      render: (p) => (
        <CellMonoStrong align="right">{formatCurrency(p.precoVenda)}</CellMonoStrong>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (p) =>
        p.ativo === false ? (
          <Badge variant="secondary" dot>
            Inativo
          </Badge>
        ) : (
          <Badge variant="success" dot>
            Ativo
          </Badge>
        ),
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "80px",
      render: (p) => (
        <CellActions>
          <CellActionButton
            title="Editar"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit(p)}
          />
          <CellActionButton
            title="Inativar"
            icon={<Trash2 className="h-3.5 w-3.5 text-[var(--fips-danger)]" />}
            onClick={() => onDelete(p.id)}
          />
        </CellActions>
      ),
    },
  ];
}
