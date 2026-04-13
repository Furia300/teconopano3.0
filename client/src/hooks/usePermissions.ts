import { useState, useEffect, useCallback } from "react";
import { TECNOPANO_AUTH_CHANGED } from "@/lib/authEvents";

interface AuthMeResponse {
  id: string;
  username: string;
  nome: string;
  perfil: string;
  permissions: string[];
}

export function usePermissions() {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data: AuthMeResponse = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
    window.addEventListener(TECNOPANO_AUTH_CHANGED, fetchMe);
    return () => window.removeEventListener(TECNOPANO_AUTH_CHANGED, fetchMe);
  }, [fetchMe]);

  const isAdmin = user?.perfil === "administrador" || user?.perfil === "super_admin";

  const hasAccess = useCallback(
    (resource: string): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      // Check explicit permissions
      if (user.permissions.includes(resource)) return true;
      return false;
    },
    [user, isAdmin],
  );

  /** Check if a menu item's perfis include the user */
  const hasPerfilAccess = useCallback(
    (perfis?: string[]): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      if (!perfis || perfis.length === 0) return true;
      return perfis.some((p) => p.toLowerCase() === user.perfil.toLowerCase());
    },
    [user, isAdmin],
  );

  /** Combined check: perfil OR explicit permission */
  const canAccess = useCallback(
    (resource: string, perfis?: string[]): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      if (hasPerfilAccess(perfis)) return true;
      if (user.permissions.includes(resource)) return true;
      return false;
    },
    [user, isAdmin, hasPerfilAccess],
  );

  const requestAccess = useCallback(
    async (resource: string, motivo: string) => {
      if (!user) return;
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.nome,
          resource,
          motivo,
        }),
      });
      if (!res.ok) throw new Error("Erro ao enviar solicitação");
      return res.json();
    },
    [user],
  );

  return {
    user,
    loading,
    isAdmin,
    hasAccess,
    hasPerfilAccess,
    canAccess,
    requestAccess,
    refresh: fetchMe,
  };
}
