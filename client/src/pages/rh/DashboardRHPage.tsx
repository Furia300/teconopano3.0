import { useEffect, useState } from "react";
import type { DashboardData } from "@/types/dashboard";
import DashboardRHDedicado from "../dashboard/DashboardRHDedicado";

export default function DashboardRHPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/colaboradores").then((r) => r.json()).catch(() => ({ colaboradores: [] })),
      fetch("/api/departamentos").then((r) => r.json()).catch(() => ({ departamentos: [] })),
    ])
      .then(([colabRes, deptoRes]) => {
        setData({
          colaboradores: colabRes.colaboradores || colabRes || [],
          coletas: [],
          separacoes: [],
          producoes: [],
          repanol: [],
          costureira: [],
          estoque: [],
          expedicoes: [],
          clientes: [],
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--fips-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--fips-fg-muted)]">Carregando dashboard RH...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return <DashboardRHDedicado data={data} />;
}
