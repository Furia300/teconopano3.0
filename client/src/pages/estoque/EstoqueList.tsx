import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Warehouse,
  Package,
  Scale,
  Lock,
  CheckCircle2,
  Trash2,
  Eye,
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

interface EstoqueItem {
  id: string;
  descricaoProduto: string;
  novaDescricao?: string | null;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  kilo?: number | null;
  unidade?: number | null;
  qtdeReservadaPacote?: number | null;
  pesoMedioPct?: number | null;
  unidadeMedida?: string | null;
  galpao?: string | null;
  nomeFantasia?: string | null;
  notaFiscal?: string | null;
  status?: string | null;
  data?: string | null;
}

const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

export default function EstoqueList() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterGalpao, setFilterGalpao] = useState<string>("");

  const fetchEstoque = async () => {
    try {
      const res = await fetch("/api/estoque");
      const data = await res.json();
      setEstoque(data);
    } catch {
      toast.error("Erro ao carregar estoque");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstoque();
  }, []);

  const filtered = useMemo(() => {
    return estoque.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        e.descricaoProduto.toLowerCase().includes(q) ||
        (e.tipoMaterial ?? "").toLowerCase().includes(q) ||
        (e.cor ?? "").toLowerCase().includes(q);
      const matchGalpao = !filterGalpao || e.galpao === filterGalpao;
      return matchSearch && matchGalpao;
    });
  }, [estoque, search, filterGalpao]);

  // ⚠️ Regra R2 do user (nota 69): stock total ≠ stock reservado ≠ disponível
  const stats = useMemo(() => {
    const total = estoque.length;
    const totalKg = estoque.reduce((sum, e) => sum + (e.kilo ?? 0), 0);
    const totalReservado = estoque.reduce((sum, e) => sum + (e.qtdeReservadaPacote ?? 0), 0);
    const totalUnidade = estoque.reduce((sum, e) => sum + (e.unidade ?? 0), 0);
    const totalDisponivel = totalUnidade - totalReservado;
    return { total, totalKg, totalReservado, totalDisponivel };
  }, [estoque]);

  const galpoes = useMemo(() => {
    const set = new Set<string>();
    estoque.forEach((e) => e.galpao && set.add(e.galpao));
    return Array.from(set).sort();
  }, [estoque]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Produtos prontos no galpão — distinção total / reservado / disponível (regra R2)"
        icon={Warehouse}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Peso", value: `${stats.totalKg.toLocaleString("pt-BR")}kg`, color: "#00C64C" },
          { label: "Reservado", value: stats.totalReservado, color: "#FDC24E" },
          { label: "Disponível", value: stats.totalDisponivel, color: "#ed1b24" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Itens"
          value={stats.total}
          subtitle="Linhas de estoque ativas"
          icon={Package}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Total em Kg"
          value={stats.totalKg.toLocaleString("pt-BR")}
          subtitle="Soma de todas as variantes"
          icon={Scale}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Reservado"
          value={stats.totalReservado.toLocaleString("pt-BR")}
          subtitle="Aguardando expedição"
          icon={Lock}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Disponível"
          value={Math.max(0, stats.totalDisponivel).toLocaleString("pt-BR")}
          subtitle="Pronto para novo pedido"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por produto, tipo material ou cor..."
        activeFilters={filterGalpao ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Galpão
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setFilterGalpao("")}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                  !filterGalpao
                    ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                    : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                }`}
              >
                Todos os galpões
              </button>
              {galpoes.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGalpao(g)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterGalpao === g
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  {g}
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

      <DataListingTable<EstoqueItem>
        icon={<Warehouse className="h-[22px] w-[22px]" />}
        title="Estoque"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterGalpao ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterGalpao)}
        data={filtered}
        getRowId={(e) => e.id}
        emptyState={
          loading
            ? "Carregando estoque..."
            : "Estoque vazio — ainda não há produção concluída encaminhada"
        }
        columns={estoqueColumns({ onView: () => {}, onDelete: () => {} })}
      />
    </div>
  );
}

interface EstoqueActions {
  onView: (e: EstoqueItem) => void;
  onDelete: (id: string) => void;
}

function estoqueColumns({ onView, onDelete }: EstoqueActions): DataListingColumn<EstoqueItem>[] {
  return [
    {
      id: "produto",
      label: "Produto",
      fixed: true,
      sortable: true,
      render: (e, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={e.descricaoProduto || e.tipoMaterial || "—"}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">
              {e.tipoMaterial || e.descricaoProduto}
            </div>
            <div className="text-[10px] text-[var(--fips-fg-muted)]">
              {[e.cor, e.medida, e.acabamento].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "kilo",
      label: "Kilo",
      sortable: true,
      align: "right",
      render: (e) => (
        <CellMonoStrong align="right">
          {e.kilo ? `${e.kilo.toLocaleString("pt-BR")} kg` : "—"}
        </CellMonoStrong>
      ),
    },
    {
      id: "unidade",
      label: "Total un.",
      sortable: true,
      align: "right",
      render: (e) => <CellMonoMuted>{e.unidade ?? "—"}</CellMonoMuted>,
    },
    {
      id: "reservado",
      label: "Reservado",
      align: "right",
      render: (e) => (
        <span className="font-mono font-bold text-[var(--fips-warning)]">
          {e.qtdeReservadaPacote ?? 0}
        </span>
      ),
    },
    {
      id: "disponivel",
      label: "Disponível",
      align: "right",
      render: (e) => {
        const disp = (e.unidade ?? 0) - (e.qtdeReservadaPacote ?? 0);
        return (
          <span
            className={`font-mono font-bold ${
              disp > 0 ? "text-[var(--fips-success-strong)]" : "text-[var(--fips-fg-muted)]"
            }`}
          >
            {disp}
          </span>
        );
      },
    },
    {
      id: "galpao",
      label: "Galpão",
      sortable: true,
      render: (e) => <CellMuted>{e.galpao || "—"}</CellMuted>,
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (e) => {
        const status = (e.status || "Pendente").toLowerCase();
        const variant =
          status === "disponivel" || status === "disponível"
            ? "success"
            : status === "reservado"
              ? "warning"
              : status === "pendente"
                ? "info"
                : "secondary";
        return (
          <Badge variant={variant} dot>
            {e.status || "—"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "80px",
      render: (e) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onView(e)}
          />
          <CellActionButton
            title="Remover"
            icon={<Trash2 className="h-3.5 w-3.5 text-[var(--fips-danger)]" />}
            onClick={() => onDelete(e.id)}
          />
        </CellActions>
      ),
    },
  ];
}
