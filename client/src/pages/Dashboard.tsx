import { useEffect, useState } from "react";
import type { DashboardData } from "@/types/dashboard";
import { MOCK_ADMIN_DASHBOARD } from "@/data/mockAdminDashboard";
import DashboardGalpao from "./dashboard/DashboardGalpao";
import DashboardFinanceiro from "./dashboard/DashboardFinanceiro";
import DashboardExpedicao from "./dashboard/DashboardExpedicao";
import DashboardEmissaoNF from "./dashboard/DashboardEmissaoNF";
import DashboardRH from "./dashboard/DashboardRH";
import DashboardProducaoPessoal from "./dashboard/DashboardProducaoPessoal";
import DashboardSeparacaoPessoal from "./dashboard/DashboardSeparacaoPessoal";
import DashboardAdmin from "./dashboard/DashboardAdmin";

function useCurrentUser() {
  const [user, setUser] = useState<{ nome: string; perfil: string } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUser(u ?? { nome: "Admin", perfil: "administrador" }))
      .catch(() => setUser({ nome: "Admin", perfil: "administrador" }))
      .finally(() => setLoading(false));
  }, []);
  return { user, loading };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (userLoading) return;

    const perfil = currentUser?.perfil || "administrador";
    const isSuperAdmin = perfil === "administrador" || perfil === "super_admin";

    if (isSuperAdmin) {
      setData(MOCK_ADMIN_DASHBOARD as unknown as DashboardData);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    Promise.all([
      fetch("/api/coletas").then((r) => r.json()),
      fetch("/api/separacoes").then((r) => r.json()),
      fetch("/api/producoes").then((r) => r.json()),
      fetch("/api/repanol").then((r) => r.json()),
      fetch("/api/costureira").then((r) => r.json()),
      fetch("/api/estoque").then((r) => r.json()),
      fetch("/api/expedicoes").then((r) => r.json()),
      fetch("/api/colaboradores").then((r) => r.json()),
      fetch("/api/clientes").then((r) => r.json()),
    ])
      .then(
        ([coletas, separacoes, producoes, repanol, costureira, estoque, expedicoes, colabRes, clientes]) => {
          setData({
            coletas,
            separacoes,
            producoes,
            repanol,
            costureira,
            estoque,
            expedicoes,
            colaboradores: colabRes.colaboradores || colabRes,
            clientes,
          });
        }
      )
      .catch(() => setData(null))
      .finally(() => setDataLoading(false));
  }, [currentUser, userLoading]);

  if (userLoading || dataLoading) {
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

  const perfil = currentUser?.perfil || "administrador";
  const nome = currentUser?.nome || "Usuário";

  switch (perfil) {
    case "galpao":
      return <DashboardGalpao data={data} />;
    case "financeiro":
      return <DashboardFinanceiro data={data} />;
    case "expedicao":
      return <DashboardExpedicao data={data} />;
    case "emissao_nf":
      return <DashboardEmissaoNF data={data} />;
    case "rh":
      return <DashboardRH data={data} />;
    case "producao":
      return <DashboardProducaoPessoal data={data} userName={nome} />;
    case "separacao":
      return <DashboardSeparacaoPessoal data={data} userName={nome} />;
    default:
      return <DashboardAdmin data={data} />;
  }
}
