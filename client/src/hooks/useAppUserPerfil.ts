import { useEffect, useState } from "react";
import { TECNOPANO_AUTH_CHANGED } from "@/lib/authEvents";

export type AppAuthMe = {
  perfil: string;
  nome: string;
  username: string;
};

const defaultMe: AppAuthMe = {
  perfil: "administrador",
  nome: "Admin",
  username: "admin",
};

/**
 * Sessão `/api/auth/me` (perfil + nome para menu e chip do header).
 */
export function useAppAuthMe(): AppAuthMe {
  const [me, setMe] = useState<AppAuthMe>(defaultMe);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((u: { perfil?: string; nome?: string; username?: string } | null) => {
          if (cancelled || !u) return;
          setMe({
            perfil: (u.perfil ?? defaultMe.perfil).trim().toLowerCase(),
            nome: (u.nome ?? defaultMe.nome).trim() || defaultMe.nome,
            username: (u.username ?? defaultMe.username).trim() || defaultMe.username,
          });
        })
        .catch(() => {});
    };

    load();
    window.addEventListener(TECNOPANO_AUTH_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(TECNOPANO_AUTH_CHANGED, load);
    };
  }, []);

  return me;
}

/** @deprecated Prefira `useAppAuthMe().perfil` quando precisar também de `nome`. */
export function useAppUserPerfil(): string {
  return useAppAuthMe().perfil;
}
