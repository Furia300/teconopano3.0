import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Eye,
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
import { NovoFornecedorDialog } from "./NovoFornecedorDialog";

interface Fornecedor {
  id: string;
  nome: string;
  razaoSocial?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
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

export default function FornecedoresList() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterUf, setFilterUf] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);

  const fetchFornecedores = async () => {
    try {
      const res = await fetch("/api/fornecedores");
      const data = await res.json();
      setFornecedores(data);
    } catch {
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  // Filtragem reativa
  const filtered = useMemo(() => {
    return fornecedores.filter((f) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        f.nome.toLowerCase().includes(q) ||
        (f.razaoSocial ?? "").toLowerCase().includes(q) ||
        (f.cnpj ?? "").toLowerCase().includes(q) ||
        (f.cidade ?? "").toLowerCase().includes(q);
      const matchUf = !filterUf || f.estado === filterUf;
      return matchSearch && matchUf;
    });
  }, [fornecedores, search, filterUf]);

  // KPIs (Cards Relatório)
  const stats = useMemo(() => {
    const total = fornecedores.length;
    const ativos = fornecedores.filter((f) => f.ativo !== false).length;
    const comCnpj = fornecedores.filter((f) => f.cnpj && f.cnpj.trim() !== "").length;
    const comEmail = fornecedores.filter((f) => f.email && f.email.trim() !== "").length;
    return { total, ativos, comCnpj, comEmail };
  }, [fornecedores]);

  // UFs únicas para filtro
  const ufs = useMemo(() => {
    const set = new Set<string>();
    fornecedores.forEach((f) => f.estado && set.add(f.estado));
    return Array.from(set).sort();
  }, [fornecedores]);

  const openNew = () => {
    setEditingFornecedor(null);
    setDialogOpen(true);
  };

  const openEdit = (f: Fornecedor) => {
    setEditingFornecedor(f);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Inativar este fornecedor? (registro permanece para histórico de coletas)")) return;
    try {
      const res = await fetch(`/api/fornecedores/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Fornecedor inativado.");
      fetchFornecedores();
    } catch {
      toast.error("Erro ao inativar fornecedor.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Empresas que vendem matéria-prima — uma filial = um cadastro próprio"
        icon={Building2}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Ativos", value: stats.ativos, color: "#00C64C" },
          { label: "Com CNPJ", value: stats.comCnpj, color: "#FDC24E" },
          { label: "Com Email", value: stats.comEmail, color: "#ed1b24" },
        ]}
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo fornecedor
          </Button>
        }
      />

      {/* Cards Relatório — padrão FIPS DS § 03 Card Relatório */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Fornecedores"
          value={stats.total}
          subtitle="Cadastrados no sistema"
          icon={Building2}
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
            <div className="flex flex-col gap-1">
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
      <DataListingTable<Fornecedor>
        icon={<Building2 className="h-[22px] w-[22px]" />}
        title="Fornecedores"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterUf ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterUf)}
        data={filtered}
        getRowId={(f) => f.id}
        emptyState={loading ? "Carregando fornecedores..." : "Nenhum fornecedor encontrado"}
        columns={fornecedorColumns({ onEdit: openEdit, onDelete: handleDelete })}
      />

      {/* Modal canônico FIPS DS Modal Form */}
      <NovoFornecedorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchFornecedores}
        fornecedor={editingFornecedor}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS ──────────────────────────── */

interface FornecedorActions {
  onEdit: (f: Fornecedor) => void;
  onDelete: (id: string) => void;
}

function fornecedorColumns({ onEdit, onDelete }: FornecedorActions): DataListingColumn<Fornecedor>[] {
  return [
    {
      id: "nome",
      label: "Fornecedor",
      fixed: true,
      sortable: true,
      render: (f, { density }) => (
        <div className="flex items-center gap-2">
          <Avatar
            name={f.nome}
            size={density === "compact" ? 22 : density === "normal" ? 28 : 34}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[var(--fips-fg)]">{f.nome}</div>
            {f.razaoSocial && f.razaoSocial !== f.nome && (
              <div className="text-[10px] text-[var(--fips-fg-muted)]">{f.razaoSocial}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "cnpj",
      label: "CNPJ",
      sortable: true,
      render: (f) => <CellMonoMuted>{f.cnpj || "—"}</CellMonoMuted>,
    },
    {
      id: "cidade",
      label: "Cidade / UF",
      sortable: true,
      render: (f) => (
        <CellMuted>
          {f.cidade ? `${f.cidade}${f.estado ? ` / ${f.estado}` : ""}` : f.estado || "—"}
        </CellMuted>
      ),
    },
    {
      id: "telefone",
      label: "Telefone",
      render: (f) => <CellMonoMuted>{f.telefone || "—"}</CellMonoMuted>,
    },
    {
      id: "email",
      label: "E-mail",
      render: (f) => (
        <CellMuted>
          <span className="truncate" title={f.email ?? undefined}>
            {f.email || "—"}
          </span>
        </CellMuted>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (f) =>
        f.ativo === false ? (
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
      render: (f) => (
        <CellActions>
          <CellActionButton
            title="Visualizar"
            variant="primary"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onEdit(f)}
          />
          <CellActionButton
            title="Editar"
            variant="default"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit(f)}
          />
          <CellActionButton
            title="Inativar"
            variant="danger"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => onDelete(f.id)}
          />
        </CellActions>
      ),
    },
  ];
}
