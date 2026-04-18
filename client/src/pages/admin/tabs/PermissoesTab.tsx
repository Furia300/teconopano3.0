import { useEffect, useState, useMemo } from "react";
import { Save, Shield, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/domain/Avatar";
import { APP_MENU, type AppMenuItem } from "@/lib/appMenu";

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

/** Retorna hrefs que o perfil já tem acesso via APP_MENU.perfis */
function getPerfilResources(perfil: string): Set<string> {
  const set = new Set<string>();
  const p = perfil.toLowerCase();
  function check(item: AppMenuItem) {
    if (item.href) {
      if (!item.perfis || item.perfis.map((x) => x.toLowerCase()).includes(p)) {
        set.add(item.href);
      }
    }
    item.children?.forEach(check);
  }
  APP_MENU.forEach(check);
  return set;
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

  const user = users.find((u) => u.id === selectedUser);

  const perfilResources = useMemo(() => {
    if (!user) return new Set<string>();
    return getPerfilResources(user.perfil);
  }, [user]);

  const explicitCount = useMemo(() => {
    return permissions.filter((p) => !perfilResources.has(p)).length;
  }, [permissions, perfilResources]);

  const totalGranted = useMemo(() => {
    const all = new Set([...perfilResources, ...permissions]);
    return all.size;
  }, [perfilResources, permissions]);

  const toggle = (href: string) => {
    if (perfilResources.has(href)) {
      toast.info(`"${href}" já é herdada do perfil "${user?.perfil}". Altere o perfil para remover.`);
      return;
    }
    setPermissions((prev) =>
      prev.includes(href) ? prev.filter((p) => p !== href) : [...prev, href],
    );
  };

  const toggleSection = (section: string) => {
    const sectionResources = resources.filter((r) => r.section === section);
    const toggleable = sectionResources.filter((r) => !perfilResources.has(r.href));
    const allGranted = toggleable.every((r) => permissions.includes(r.href));
    if (allGranted) {
      const hrefsToRemove = new Set(toggleable.map((r) => r.href));
      setPermissions((prev) => prev.filter((p) => !hrefsToRemove.has(p)));
    } else {
      const hrefsToAdd = toggleable.filter((r) => !permissions.includes(r.href)).map((r) => r.href);
      setPermissions((prev) => [...prev, ...hrefsToAdd]);
    }
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
          <Button size="sm" onClick={handleSave} disabled={saving}>
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
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: "var(--fips-fg)" }}>{user.nome}</div>
                <div className="text-xs" style={{ color: "var(--fips-fg-muted)" }}>
                  Perfil: <strong>{user.perfil}</strong> — {perfilResources.size} herdadas + {explicitCount} explícitas = {totalGranted} de {resources.length} recursos
                </div>
              </div>
            </div>
          )}

          {/* Legenda */}
          <div className="flex items-center gap-5 text-xs" style={{ color: "var(--fips-fg-muted)" }}>
            <span className="flex items-center gap-1.5">
              <Shield size={12} style={{ color: "var(--fips-success)" }} />
              Herdada do perfil
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={12} style={{ color: "#60a5fa" }} />
              Concedida explicitamente
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={12} />
              Sem acesso
            </span>
          </div>

          {/* Permission grid by section */}
          {sections.map((section) => {
            const sectionResources = resources.filter((r) => r.section === section);
            const toggleable = sectionResources.filter((r) => !perfilResources.has(r.href));
            const allToggleableGranted = toggleable.length > 0 && toggleable.every((r) => permissions.includes(r.href));

            return (
              <div key={section}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--fips-fg-muted)" }}>
                    {section}
                  </h4>
                  {toggleable.length > 0 && (
                    <button
                      onClick={() => toggleSection(section)}
                      className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                      style={{
                        background: allToggleableGranted ? "rgba(96,165,250,0.1)" : "var(--fips-surface)",
                        color: allToggleableGranted ? "#60a5fa" : "var(--fips-fg-muted)",
                        border: `1px solid ${allToggleableGranted ? "rgba(96,165,250,0.3)" : "var(--fips-border)"}`,
                        cursor: "pointer",
                      }}
                    >
                      {allToggleableGranted ? "Remover todos" : "Selecionar todos"}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sectionResources.map((r) => {
                    const inherited = perfilResources.has(r.href);
                    const explicit = !inherited && permissions.includes(r.href);
                    const granted = inherited || explicit;

                    return (
                      <button
                        key={r.href}
                        onClick={() => toggle(r.href)}
                        className="flex items-center gap-2 p-3 rounded-xl text-sm transition-all text-left"
                        style={{
                          background: inherited
                            ? "rgba(0,198,76,0.06)"
                            : explicit
                              ? "rgba(96,165,250,0.08)"
                              : "var(--fips-surface)",
                          border: `1px solid ${
                            inherited
                              ? "rgba(0,198,76,0.25)"
                              : explicit
                                ? "rgba(96,165,250,0.3)"
                                : "var(--fips-border)"
                          }`,
                          color: granted ? "var(--fips-fg)" : "var(--fips-fg-muted)",
                          cursor: inherited ? "default" : "pointer",
                          opacity: inherited ? 0.85 : 1,
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={{
                            borderColor: inherited
                              ? "var(--fips-success)"
                              : explicit
                                ? "#60a5fa"
                                : "var(--fips-border)",
                            background: inherited
                              ? "var(--fips-success)"
                              : explicit
                                ? "#60a5fa"
                                : "transparent",
                          }}
                        >
                          {inherited && (
                            <Shield size={8} color="#fff" strokeWidth={3} />
                          )}
                          {explicit && (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[12px]">{r.label}</span>
                          {inherited && (
                            <span className="block text-[9px]" style={{ color: "var(--fips-success)" }}>
                              via perfil
                            </span>
                          )}
                        </div>
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
