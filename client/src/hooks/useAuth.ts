import { useState, useCallback } from "react";
import { TECNOPANO_AUTH_CHANGED } from "@/lib/authEvents";

interface AuthUser {
  id: string;
  username: string;
  nome: string;
  perfil: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (
    email: string,
    password: string,
    twoFactorCode?: string,
    twoFactorMethod?: string
  ) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, twoFactorCode, twoFactorMethod }),
    });

    if (!res.ok) {
      const data = await res.json();
      const error: any = new Error(data.message || "Erro ao fazer login");
      error.response = { data };
      throw error;
    }

    const data = await res.json();
    setUser(data.user);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event(TECNOPANO_AUTH_CHANGED));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event(TECNOPANO_AUTH_CHANGED));
  }, []);

  return { user, isAuthenticated, login, logout };
}
