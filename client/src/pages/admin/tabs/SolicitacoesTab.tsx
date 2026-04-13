import { useEffect, useState } from "react";
import { Check, X, Clock, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/domain/Avatar";

interface AccessRequest {
  id: string;
  userId: string;
  resource: string;
  motivo: string;
  status: string;
  respondedBy: string | null;
  respondedAt: string | null;
  motivoResposta: string | null;
  createdAt: string;
  userName?: string;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function SolicitacoesTab() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/access-requests");
      setRequests(await res.json());
    } catch {
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/admin/access-requests/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respondedBy: "admin" }),
      });
      toast.success("Acesso aprovado e permissão concedida");
      fetchRequests();
    } catch {
      toast.error("Erro ao aprovar");
    }
  };

  const handleDeny = async (id: string) => {
    const motivo = prompt("Motivo da negação (opcional):");
    try {
      await fetch(`/api/admin/access-requests/${id}/deny`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respondedBy: "admin", motivo }),
      });
      toast.success("Solicitação negada");
      fetchRequests();
    } catch {
      toast.error("Erro ao negar");
    }
  };

  const pending = requests.filter((r) => r.status === "pendente");
  const resolved = requests.filter((r) => r.status !== "pendente");

  const statusVariant: Record<string, "warning" | "success" | "danger"> = {
    pendente: "warning",
    aprovado: "success",
    negado: "danger",
  };

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--fips-fg-muted)" }}>
          <Clock size={14} /> Pendentes ({pending.length})
        </h3>

        {loading ? (
          <div className="text-center py-8" style={{ color: "var(--fips-fg-muted)" }}>Carregando...</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ background: "var(--fips-surface)", border: "1px solid var(--fips-border)", color: "var(--fips-fg-muted)" }}>
            <Inbox size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma solicitação pendente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  background: "var(--fips-surface)",
                  border: "1px solid var(--fips-border)",
                }}
              >
                <Avatar name={r.userName || "Usuário"} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--fips-fg)" }}>
                      {r.userName || "Usuário"}
                    </span>
                    <Badge variant="secondary">{r.resource}</Badge>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--fips-fg-muted)" }}>
                    Recurso: <strong style={{ color: "var(--fips-fg)" }}>{r.resource}</strong>
                  </div>
                  <div className="text-xs mt-1 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", color: "var(--fips-fg-muted)" }}>
                    "{r.motivo}"
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: "var(--fips-fg-muted)" }}>
                    {formatDate(r.createdAt)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: "rgba(0,198,76,0.1)", color: "var(--fips-success)" }}
                    title="Aprovar"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleDeny(r.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: "rgba(237,27,36,0.1)", color: "var(--fips-danger)" }}
                    title="Negar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {resolved.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--fips-fg-muted)" }}>
            Histórico ({resolved.length})
          </h3>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--fips-border)", background: "var(--fips-surface)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--fips-surface-muted)" }}>
                  <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Solicitante</th>
                  <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Recurso</th>
                  <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Status</th>
                  <th className="text-left p-3 text-xs font-bold uppercase" style={{ color: "var(--fips-fg-muted)" }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "var(--fips-border)" }}>
                    <td className="p-3" style={{ color: "var(--fips-fg)" }}>{r.userName || "—"}</td>
                    <td className="p-3" style={{ color: "var(--fips-fg-muted)" }}>{r.resource}</td>
                    <td className="p-3">
                      <Badge variant={statusVariant[r.status] || "secondary"}>{r.status}</Badge>
                    </td>
                    <td className="p-3 text-xs" style={{ color: "var(--fips-fg-muted)" }}>{formatDate(r.respondedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
