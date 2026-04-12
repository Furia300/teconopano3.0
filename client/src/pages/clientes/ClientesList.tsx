import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  FileBadge,
  Mail as MailIcon,
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
import { NovoClienteDialog } from "./NovoClienteDialog";

interface Cliente {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string | null;
  tipo?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  contato?: string | null;
  email?: string | null;
  ativo?: boolean;
  createdAt?: string | null;
}

const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

export default function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterUf, setFilterUf] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filtered = useMemo(() => {
    return clientes.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.nomeFantasia.toLowerCase().includes(q) ||
        (c.razaoSocial ?? "").toLowerCase().includes(q) ||
        (c.cnpj ?? "").toLowerCase().includes(q) ||
        (c.cidade ?? "").toLowerCase().includes(q);
      const matchUf = !filterUf || c.estado === filterUf;
      return matchSearch && matchUf;
    });
  }, [clientes, search, filterUf]);

  const stats = useMemo(() => {
    const total = clientes.length;
    const ativos = clientes.filter((c) => c.ativo !== false).length;
    const comCnpj = clientes.filter((c) => c.cnpj && c.cnpj.trim() !== "").length;
    const comEmail = clientes.filter((c) => c.email && c.email.trim() !== "").length;
    return { total, ativos, comCnpj, comEmail };
  }, [clientes]);

  const ufs = useMemo(() => {
    const set = new Set<string>();
    clientes.forEach((c) => c.estado && set.add(c.estado));
    return Array.from(set).sort();
  }, [clientes]);

  const openNew = () => {
    setEditingCliente(null);
    setDialogOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditingCliente(c);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Inativar este cliente? (registro permanece para histórico de pedidos)")) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Cliente inativado.");
      fetchClientes();
    } catch {
      toast.error("Erro ao inativar cliente.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Empresas B2B que recebem produtos prontos — uma filial = um cadastro próprio"
        icon={ShoppingCart}
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      {/* Cards Relatório FIPS DS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Clientes"
          value={stats.total}
          subtitle="Cadastrados no sistema"
          icon={ShoppingCart}
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
          label="Com CNPJ"
          value={stats.comCnpj}
          subtitle="Pessoa jurídica formal"
          icon={FileBadge}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Com E-mail"
          value={stats.comEmail}
          subtitle="Comunicação digital ativa"
          icon={MailIcon}
          color={FIPS_COLORS.amareloEscuro}
        />
      </div>

      {/* Toolbar canônica */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, razão social, CNPJ ou cidade..."
        activeFilters={filterUf ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Estado (UF)
            </p>
            <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto">
              <button
                onClick={() => setFilterUf("")}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                  !filterUf
                    ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                    : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                }`}
              >
                Todos os estados
              </button>
              {ufs.map((uf) => (
                <button
                  key={uf}
                  onClick={() => setFilterUf(uf)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterUf === uf
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  {uf}
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

      {/* Tabela canônica DS-FIPS Data Listing */}
      <DataListingTable<Cliente>
        icon={<ShoppingCart className="h-[22px] w-[22px]" />}
        title="Clientes"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterUf ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterUf)}
        data={filtered}
        getRowId={(c) => c.id}
        emptyState={loading ? "Carregando clientes..." : "Nenhum cliente encontrado"}
        columns={clienteColumns({ onEdit: openEdit, onDelete: handleDelete })}
      />

      {/* Modal canônico FIPS DS Modal Form */}
      <NovoClienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchClientes}
        cliente={editingCliente}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS ──────────────────────────── */

interface ClienteActions {
  onEdit: (c: Cliente) => void;
  onDelete: (id: string) => void;
}

function clienteColumns({ onEdit, onDelete }: ClienteActions): DataListingColumn<Cliente>[] {
  return [
    {
      id: "nome",
      label: "Cliente",
      fixed: true,
      sortable: true,
      render: (c, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={c.nomeFantasia}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">{c.nomeFantasia}</div>
            {c.razaoSocial && c.razaoSocial !== c.nomeFantasia && (
              <div className="text-[10px] text-[var(--fips-fg-muted)]">{c.razaoSocial}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "cnpj",
      label: "CNPJ",
      sortable: true,
      render: (c) => <CellMonoMuted>{c.cnpj || "—"}</CellMonoMuted>,
    },
    {
      id: "cidade",
      label: "Cidade / UF",
      sortable: true,
      render: (c) => (
        <CellMuted>
          {c.cidade ? `${c.cidade}${c.estado ? ` / ${c.estado}` : ""}` : c.estado || "—"}
        </CellMuted>
      ),
    },
    {
      id: "telefone",
      label: "Telefone",
      render: (c) => <CellMonoMuted>{c.telefone || "—"}</CellMonoMuted>,
    },
    {
      id: "email",
      label: "E-mail",
      render: (c) => (
        <CellMuted>
          <span className="truncate" title={c.email ?? undefined}>
            {c.email || "—"}
          </span>
        </CellMuted>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (c) =>
        c.ativo === false ? (
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
      render: (c) => (
        <CellActions>
          <CellActionButton
            title="Editar"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit(c)}
          />
          <CellActionButton
            title="Inativar"
            icon={<Trash2 className="h-3.5 w-3.5 text-[var(--fips-danger)]" />}
            onClick={() => onDelete(c.id)}
          />
        </CellActions>
      ),
    },
  ];
}
