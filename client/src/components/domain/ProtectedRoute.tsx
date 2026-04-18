import { usePermissions } from "@/hooks/usePermissions";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  resource?: string;
  perfis?: string[];
}

export function ProtectedRoute({ children, adminOnly, resource, perfis }: ProtectedRouteProps) {
  const { user, loading, isAdmin, canAccess } = usePermissions();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Shield className="h-12 w-12" style={{ color: "var(--fips-danger)" }} />
        <h2 className="text-lg font-bold" style={{ color: "var(--fips-fg)" }}>Acesso Restrito</h2>
        <p className="text-sm" style={{ color: "var(--fips-fg-muted)" }}>
          Esta página é exclusiva para administradores.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "var(--fips-primary)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  if (resource && !canAccess(resource, perfis)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Shield className="h-12 w-12" style={{ color: "var(--fips-danger)" }} />
        <h2 className="text-lg font-bold" style={{ color: "var(--fips-fg)" }}>Acesso Negado</h2>
        <p className="text-sm" style={{ color: "var(--fips-fg-muted)" }}>
          Você não tem permissão para acessar esta página.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "var(--fips-primary)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
