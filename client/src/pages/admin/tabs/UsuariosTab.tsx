import { useEffect, useState, useMemo } from "react";
import { Users, Plus, Pencil, KeyRound, Power, PowerOff, Link2 } from "lucide-react";
import { toast } from "sonner";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { Avatar } from "@/components/domain/Avatar";
import {
  DataListingTable,
  type DataListingColumn,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserEditDialog } from "../UserEditDialog";

interface User {
  id: string;
  username: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  matricula: string;
  whatsapp: string;
  foto: string;
  perfil: string;
  acesso: boolean;
  createdAt: string;
}

const PERFIL_COLORS: Record<string, "default" | "success" | "warning" | "danger" | "info" | "secondary"> = {
  administrador: "danger",
  galpao: "default",
  expedicao: "info",
  financeiro: "warning",
  rh: "success",
  producao: "secondary",
  separacao: "secondary",
  motorista: "info",
  costureira: "secondary",
  emissao_nf: "warning",
};

export function UsuariosTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPerfil, setFilterPerfil] = useState("");
  const [periodo, setPeriodo] = useState("Todos");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      setUsers(await res.json());
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Resetar senha para 'Tecnopano@2026'?")) return;
    try {
      await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      toast.success("Senha resetada");
    } catch {
      toast.error("Erro ao resetar senha");
    }
  };

  const handleInviteLink = async (userId: string, nome: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/invite-link`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await navigator.clipboard.writeText(data.link);
      toast.success(`Link copiado! Envie para ${nome}: ${data.email}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar link");
    }
  };

  const handleToggleAccess = async (user: User) => {
    try {
      const endpoint = user.acesso
        ? `/api/admin/users/${user.id}`
        : `/api/admin/users/${user.id}/reactivate`;
      const method = user.acesso ? "DELETE" : "POST";
      await fetch(endpoint, { method });
      toast.success(user.acesso ? "Usuário desativado" : "Usuário reativado");
      fetchUsers();
    } catch {
      toast.error("Erro ao alterar acesso");
    }
  };

  /* ─── Filtros ─── */
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (u.nome ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q);
      const matchPerfil = !filterPerfil || u.perfil === filterPerfil;
      return matchSearch && matchPerfil;
    });
  }, [users, search, filterPerfil]);

  const activeFilters = [filterPerfil].filter(Boolean).length;

  /* ─── Perfis únicos ─── */
  const perfisUnicos = useMemo(() => {
    return [...new Set(users.map((u) => u.perfil).filter(Boolean))].sort();
  }, [users]);

  /* ─── Colunas FIPS DS ─── */
  const columns: DataListingColumn<User>[] = [
    {
      id: "nome",
      label: "Usuário",
      sortable: true,
      render: (u, { density }) => (
        <div className="flex items-center gap-1.5">
          <Avatar name={u.nome || u.username} size={density === "compact" ? 20 : 24} />
          <div className="min-w-0 leading-tight">
            <div className="font-semibold text-[12px] text-[var(--fips-fg)]">{u.nome || u.username}</div>
            <div className="text-[9px] leading-none text-[var(--fips-fg-muted)]">{u.email || u.username}</div>
          </div>
        </div>
      ),
    },
    {
      id: "perfil",
      label: "Perfil",
      sortable: true,
      width: "120px",
      render: (u) => <Badge variant={PERFIL_COLORS[u.perfil] || "secondary"}>{u.perfil}</Badge>,
    },
    {
      id: "departamento",
      label: "Departamento",
      sortable: true,
      width: "140px",
      render: (u) => <CellMuted>{u.departamento || "—"}</CellMuted>,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      width: "130px",
      render: (u) => <CellMuted>{u.whatsapp || "—"}</CellMuted>,
    },
    {
      id: "acesso",
      label: "Acesso",
      width: "90px",
      align: "center",
      render: (u) => <Badge variant={u.acesso ? "success" : "danger"} dot>{u.acesso ? "Ativo" : "Inativo"}</Badge>,
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "100px",
      render: (u) => (
        <CellActions>
          <CellActionButton title="Editar" variant="default" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => { setEditUser(u); setDialogOpen(true); }} />
          <CellActionButton title="Enviar link de senha" variant="primary" icon={<Link2 className="h-3.5 w-3.5" />} onClick={() => handleInviteLink(u.id, u.nome)} />
          <CellActionButton title="Resetar senha" variant="default" icon={<KeyRound className="h-3.5 w-3.5" />} onClick={() => handleResetPassword(u.id)} />
          <CellActionButton
            title={u.acesso ? "Desativar" : "Reativar"}
            variant={u.acesso ? "danger" : "success"}
            icon={u.acesso ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
            onClick={() => handleToggleAccess(u)}
          />
        </CellActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Toolbar FIPS DS ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, email ou login..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Perfil
              </p>
              <div className="flex flex-col gap-1">
                {[{ v: "", l: "Todos" }, ...perfisUnicos.map((p) => ({ v: p, l: p }))].map((opt) => (
                  <button
                    key={opt.v || "todos"}
                    onClick={() => setFilterPerfil(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterPerfil === opt.v
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
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
      />

      {/* ─── Botão Novo Usuário ─── */}
      <div className="flex justify-end -mt-3">
        <Button size="sm" onClick={() => { setEditUser(null); setDialogOpen(true); }}>
          <Plus size={14} className="mr-1" /> Novo Usuário
        </Button>
      </div>

      {/* ─── DataListingTable FIPS DS ─── */}
      <DataListingTable
        icon={<Users className="h-[22px] w-[22px]" style={{ color: "var(--fips-primary)" }} />}
        title="Usuários"
        subtitle={`${filtered.length} registros no total · Atualizado agora`}
        filtered={!!search || !!filterPerfil}
        data={filtered}
        getRowId={(u) => u.id}
        columns={columns}
        emptyState="Nenhum usuário encontrado"
      />

      <UserEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
