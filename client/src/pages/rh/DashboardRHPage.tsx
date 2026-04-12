import { useEffect, useState } from "react";
import type { DashboardData } from "@/types/dashboard";
import { MOCK_ADMIN_DASHBOARD } from "@/data/mockAdminDashboard";
import DashboardAdmin from "../dashboard/DashboardAdmin";

export default function DashboardRHPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/coletas").then((r) => r.json()).catch(() => []),
      fetch("/api/separacoes").then((r) => r.json()).catch(() => []),
      fetch("/api/producoes").then((r) => r.json()).catch(() => []),
      fetch("/api/repanol").then((r) => r.json()).catch(() => []),
      fetch("/api/costureira").then((r) => r.json()).catch(() => []),
      fetch("/api/estoque").then((r) => r.json()).catch(() => []),
      fetch("/api/expedicoes").then((r) => r.json()).catch(() => []),
      fetch("/api/colaboradores").then((r) => r.json()).catch(() => ({ colaboradores: [] })),
      fetch("/api/clientes").then((r) => r.json()).catch(() => []),
    ])
      .then(([coletas, separacoes, producoes, repanol, costureira, estoque, expedicoes, colabRes, clientes]) => {
        setData({
          coletas: Array.isArray(coletas) ? coletas : [],
          separacoes: Array.isArray(separacoes) ? separacoes : [],
          producoes: Array.isArray(producoes) ? producoes : [],
          repanol: Array.isArray(repanol) ? repanol : [],
          costureira: Array.isArray(costureira) ? costureira : [],
          estoque: Array.isArray(estoque) ? estoque : [],
          expedicoes: Array.isArray(expedicoes) ? expedicoes : [],
          colaboradores: colabRes.colaboradores || colabRes || [],
          clientes: Array.isArray(clientes) ? clientes : [],
        });
      })
      .catch(() => {
        // Fallback to mock data if all APIs fail
        setData(MOCK_ADMIN_DASHBOARD as unknown as DashboardData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--fips-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--fips-fg-muted)]">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return <DashboardAdmin data={data} />;
}
