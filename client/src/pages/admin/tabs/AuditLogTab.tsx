import { useEffect, useState } from "react";
import { ScrollText, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "secondary" }> = {
  login: { label: "Login", variant: "info" },
  logout: { label: "Logout", variant: "secondary" },
  password_change: { label: "Senha alterada", variant: "warning" },
  password_reset: { label: "Senha resetada", variant: "warning" },
  profile_update: { label: "Perfil atualizado", variant: "info" },
  permission_grant: { label: "Permissão concedida", variant: "success" },
  permission_revoke: { label: "Permissão revogada", variant: "danger" },
  permission_bulk_update: { label: "Permissões atualizadas", variant: "success" },
  access_request: { label: "Solicitação de acesso", variant: "warning" },
  access_approve: { label: "Acesso aprovado", variant: "success" },
  access_deny: { label: "Acesso negado", variant: "danger" },
  user_create: { label: "Usuário criado", variant: "success" },
  user_edit: { label: "Usuário editado", variant: "info" },
  user_deactivate: { label: "Usuário desativado", variant: "danger" },
  user_reactivate: { label: "Usuário reativado", variant: "success" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AuditLogTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 30;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(pageSize), offset: String(page * pageSize) });
      if (filterAction) params.set("action", filterAction);
      const res = await fetch(`/api/admin/audit-log?${params}`);
      const data = await res.json();
      setLogs(data.data);
      setTotal(data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [filterAction, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter size={14} style={{ color: "var(--fips-fg-muted)" }} />
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
          className="rounded-lg px-3 py-2 text-sm border"
          style={{ background: "var(--fips-surface)", borderColor: "var(--fips-border)", color: "var(--fips-fg)" }}
        >
          <option value="">Todas as ações</option>
          {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <span className="text-xs" style={{ color: "var(--fips-fg-muted)" }}>
          {total} registros
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--fips-border)", background: "var(--fips-surface)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--fips-surface-muted)" }}>
              <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Data/Hora</th>
              <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Usuário</th>
              <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Ação</th>
              <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Recurso</th>
              <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "var(--fips-fg-muted)" }}>Carregando...</td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12" style={{ color: "var(--fips-fg-muted)" }}>
                  <ScrollText size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Nenhum registro de auditoria</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, variant: "secondary" as const };
                return (
                  <tr key={log.id} className="border-t" style={{ borderColor: "var(--fips-border)" }}>
                    <td className="p-3 text-xs whitespace-nowrap" style={{ color: "var(--fips-fg-muted)" }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td className="p-3 text-xs" style={{ color: "var(--fips-fg)" }}>
                      {log.user_name || "Sistema"}
                    </td>
                    <td className="p-3">
                      <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>
                    </td>
                    <td className="p-3 text-xs" style={{ color: "var(--fips-fg-muted)" }}>
                      {log.resource || "—"}
                    </td>
                    <td className="p-3 text-xs max-w-[200px] truncate" style={{ color: "var(--fips-fg-muted)" }}>
                      {log.details || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg text-xs border"
            style={{ borderColor: "var(--fips-border)", color: "var(--fips-fg-muted)", background: "var(--fips-surface)", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1 }}
          >
            Anterior
          </button>
          <span className="text-xs" style={{ color: "var(--fips-fg-muted)" }}>
            {page + 1} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg text-xs border"
            style={{ borderColor: "var(--fips-border)", color: "var(--fips-fg-muted)", background: "var(--fips-surface)", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: page >= totalPages - 1 ? 0.5 : 1 }}
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}
