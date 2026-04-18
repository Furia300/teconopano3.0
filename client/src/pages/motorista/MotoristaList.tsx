import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  IdCard,
  Car,
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
import { NovoMotoristaDialog } from "./NovoMotoristaDialog";

interface Motorista {
  id: string;
  nome: string;
  cpf?: string | null;
  cnh?: string | null;
  categoriaCnh?: string | null;
  validadeCnh?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  veiculo?: string | null;
  placa?: string | null;
  capacidadeKg?: number | null;
  ativo?: boolean;
}

const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

export default function MotoristaList() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterCategoria, setFilterCategoria] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState<Motorista | null>(null);

  const fetchMotoristas = async () => {
    try {
      const res = await fetch("/api/motoristas");
      const data = await res.json();
      setMotoristas(data);
    } catch {
      toast.error("Erro ao carregar motoristas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const isCnhVencida = (m: Motorista) => {
    if (!m.validadeCnh) return false;
    return new Date(m.validadeCnh) < new Date();
  };
  const isCnhExpirando = (m: Motorista) => {
    if (!m.validadeCnh) return false;
    const dias = Math.ceil(
      (new Date(m.validadeCnh).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return dias > 0 && dias <= 30;
  };

  const filtered = useMemo(() => {
    return motoristas.filter((m) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.nome.toLowerCase().includes(q) ||
        (m.cpf ?? "").toLowerCase().includes(q) ||
        (m.cnh ?? "").toLowerCase().includes(q) ||
        (m.placa ?? "").toLowerCase().includes(q) ||
        (m.veiculo ?? "").toLowerCase().includes(q);
      const matchCategoria = !filterCategoria || m.categoriaCnh === filterCategoria;
      return matchSearch && matchCategoria;
    });
  }, [motoristas, search, filterCategoria]);

  const stats = useMemo(() => {
    const total = motoristas.length;
    const ativos = motoristas.filter((m) => m.ativo !== false).length;
    const comCnh = motoristas.filter((m) => m.cnh && m.cnh.trim() !== "").length;
    const cnhVencida = motoristas.filter(isCnhVencida).length;
    return { total, ativos, comCnh, cnhVencida };
  }, [motoristas]);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    motoristas.forEach((m) => m.categoriaCnh && set.add(m.categoriaCnh));
    return Array.from(set).sort();
  }, [motoristas]);

  const openNew = () => {
    setEditingMotorista(null);
    setDialogOpen(true);
  };

  const openEdit = (m: Motorista) => {
    setEditingMotorista(m);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Inativar este motorista?")) return;
    try {
      const res = await fetch(`/api/motoristas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Motorista inativado.");
      fetchMotoristas();
    } catch {
      toast.error("Erro ao inativar motorista.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Motoristas"
        description="Cadastro dos colaboradores motoristas — busca de matéria-prima e entrega ao cliente"
        icon={Truck}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Ativos", value: stats.ativos, color: "#00C64C" },
          { label: "Com CNH", value: stats.comCnh, color: "#FDC24E" },
          { label: "CNH Vencida", value: stats.cnhVencida, color: "#ed1b24" },
        ]}
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo motorista
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Motoristas"
          value={stats.total}
          subtitle="Cadastrados no sistema"
          icon={Truck}
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
          label="Com CNH"
          value={stats.comCnh}
          subtitle="Habilitação cadastrada"
          icon={IdCard}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="CNH Vencida"
          value={stats.cnhVencida}
          subtitle="Atenção — renovar"
          icon={Car}
          color={FIPS_COLORS.amareloEscuro}
        />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, CPF, CNH ou placa..."
        activeFilters={filterCategoria ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Categoria CNH
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setFilterCategoria("")}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                  !filterCategoria
                    ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                    : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                }`}
              >
                Todas as categorias
              </button>
              {categorias.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCategoria(c)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterCategoria === c
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  {c}
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

      <DataListingTable<Motorista>
        icon={<Truck className="h-[22px] w-[22px]" />}
        title="Motoristas"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterCategoria ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterCategoria)}
        data={filtered}
        getRowId={(m) => m.id}
        emptyState={
          loading
            ? "Carregando motoristas..."
            : "Nenhum motorista cadastrado — clique em + Novo motorista"
        }
        columns={motoristaColumns({
          onEdit: openEdit,
          onDelete: handleDelete,
          isCnhVencida,
          isCnhExpirando,
        })}
      />

      <NovoMotoristaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchMotoristas}
        motorista={editingMotorista}
      />
    </div>
  );
}

interface MotoristaActions {
  onEdit: (m: Motorista) => void;
  onDelete: (id: string) => void;
  isCnhVencida: (m: Motorista) => boolean;
  isCnhExpirando: (m: Motorista) => boolean;
}

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

function motoristaColumns({
  onEdit,
  onDelete,
  isCnhVencida,
  isCnhExpirando,
}: MotoristaActions): DataListingColumn<Motorista>[] {
  return [
    {
      id: "nome",
      label: "Motorista",
      fixed: true,
      sortable: true,
      render: (m, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={m.nome}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">{m.nome}</div>
            {m.cpf && <div className="text-[10px] text-[var(--fips-fg-muted)]">{m.cpf}</div>}
          </div>
        </div>
      ),
    },
    {
      id: "cnh",
      label: "CNH",
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-1.5">
          <CellMonoMuted>{m.cnh || "—"}</CellMonoMuted>
          {m.categoriaCnh && <Badge variant="info">{m.categoriaCnh}</Badge>}
        </div>
      ),
    },
    {
      id: "validadeCnh",
      label: "Validade",
      sortable: true,
      render: (m) => {
        const vencida = isCnhVencida(m);
        const expirando = isCnhExpirando(m);
        return (
          <span
            className={
              vencida
                ? "font-mono text-[var(--fips-danger)]"
                : expirando
                  ? "font-mono text-[var(--fips-warning)]"
                  : "font-mono text-[var(--fips-fg-muted)]"
            }
          >
            {formatDateBR(m.validadeCnh)}
          </span>
        );
      },
    },
    {
      id: "telefone",
      label: "Telefone",
      render: (m) => <CellMonoMuted>{m.telefone || m.whatsapp || "—"}</CellMonoMuted>,
    },
    {
      id: "veiculo",
      label: "Veículo",
      render: (m) => (
        <div>
          <div className="text-[var(--fips-fg)]">{m.veiculo || "—"}</div>
          {m.placa && (
            <div className="font-mono text-[10px] text-[var(--fips-fg-muted)]">{m.placa}</div>
          )}
        </div>
      ),
    },
    {
      id: "capacidade",
      label: "Capacidade",
      align: "right",
      render: (m) => (
        <CellMuted>
          {m.capacidadeKg ? `${m.capacidadeKg.toLocaleString("pt-BR")} kg` : "—"}
        </CellMuted>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (m) =>
        m.ativo === false ? (
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
      width: "110px",
      render: (m) => (
        <CellActions>
          <CellActionButton
            title="Visualizar"
            variant="primary"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onEdit(m)}
          />
          <CellActionButton
            title="Editar"
            variant="default"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit(m)}
          />
          <CellActionButton
            title="Inativar"
            variant="danger"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => onDelete(m.id)}
          />
        </CellActions>
      ),
    },
  ];
}
