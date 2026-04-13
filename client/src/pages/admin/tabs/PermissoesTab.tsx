import { useEffect, useState } from "react";
import { Save, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/domain/Avatar";
import { APP_MENU, getPrimaryNavHref, type AppMenuItem } from "@/lib/appMenu";

interface User {
  id: string;
  nome: string;
  perfil: string;
}

function getAllResources(): { label: string; href: string; section: string }[] {
  const resources: { label: string; href: string; section: string }[] = [];
  for (const item of APP_MENU) {
    if (item.action) continue;
    if (item.children?.length) {
      for (const child of item.children) {
        if (child.href) {
          resources.push({ label: child.label, href: child.href, section: item.label });
        }
      }
    } else if (item.href) {
      resources.push({ label: item.label, href: item.href, section: "Geral" });
    }
  }
  return resources;
}

export function PermissoesTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const resources = getAllResources();
  const sections = [...new Set(resources.map((r) => r.section))];

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    fetch(`/api/admin/permissions/${selectedUser}`)
      .then((r) => r.json())
      .then((perms: string[]) => setPermissions(perms))
      .catch(() => toast.error("Erro ao carregar permissões"))
      .finally(() => setLoading(false));
  }, [selectedUser]);

  const toggle = (href: string) => {
    setPermissions((prev) =>
      prev.includes(href) ? prev.filter((p) => p !== href) : [...prev, href],
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/permissions/${selectedUser}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resources: permissions, grantedBy: "admin" }),
      });
      toast.success("Permissões salvas");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const user = users.find((u) => u.id === selectedUser);

  return (
    <div>
      {/* User selector */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium" style={{ color: "var(--fips-fg-muted)" }}>
          Selecionar usuário:
        </label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm border min-w-[250px]"
          style={{
            background: "var(--fips-surface)",
            borderColor: "var(--fips-border)",
            color: "var(--fips-fg)",
          }}
        >
          <option value="">— Escolha um usuário —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} ({u.perfil})
            </option>
          ))}
        </select>

        {selectedUser && (
          <Button size="sm" onClick={handleSave} loading={saving}>
            <Save size={14} className="mr-1" /> Salvar Permissões
          </Button>
        )}
      </div>

      {!selectedUser ? (
        <div className="text-center py-16" style={{ color: "var(--fips-fg-muted)" }}>
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p>Selecione um usuário para gerenciar suas permissões</p>
        </div>
      ) : loading ? (
        <div className="text-center py-16" style={{ color: "var(--fips-fg-muted)" }}>Carregando...</div>
      ) : (
        <div className="space-y-6">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--fips-surface-muted)", border: "1px solid var(--fips-border)" }}>
              <Avatar name={user.nome} size={32} />
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--fips-fg)" }}>{user.nome}</div>
                <div className="text-xs" style={{ color: "var(--fips-fg-muted)" }}>
                  Perfil: {user.perfil} — {permissions.length} de {resources.length} recursos liberados
                </div>
              </div>
            </div>
          )}

          {/* Permission grid by section */}
          {sections.map((section) => {
            const sectionResources = resources.filter((r) => r.section === section);
            return (
              <div key={section}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--fips-fg-muted)" }}>
                  {section}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sectionResources.map((r) => {
                    const granted = permissions.includes(r.href);
                    return (
                      <button
                        key={r.href}
                        onClick={() => toggle(r.href)}
                        className="flex items-center gap-2 p-3 rounded-xl text-sm transition-all text-left"
                        style={{
                          background: granted ? "rgba(0,198,76,0.08)" : "var(--fips-surface)",
                          border: `1px solid ${granted ? "rgba(0,198,76,0.3)" : "var(--fips-border)"}`,
                          color: granted ? "var(--fips-success)" : "var(--fips-fg-muted)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={{
                            borderColor: granted ? "var(--fips-success)" : "var(--fips-border)",
                            background: granted ? "var(--fips-success)" : "transparent",
                          }}
                        >
                          {granted && (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span style={{ color: granted ? "var(--fips-fg)" : "var(--fips-fg-muted)" }}>
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
