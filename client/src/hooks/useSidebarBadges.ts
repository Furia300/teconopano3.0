import { useEffect, useState } from "react";

export interface SidebarBadges {
  financeiroPendente: number;
  notaPendente: number;
  producaoEmAndamento: number;
  estoqueAbaixoMinimo: number;
  adminPendencias: number;
}

export function useSidebarBadges(): SidebarBadges {
  const [badges, setBadges] = useState<SidebarBadges>({
    financeiroPendente: 0,
    notaPendente: 0,
    producaoEmAndamento: 0,
    estoqueAbaixoMinimo: 0,
    adminPendencias: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [expRes, prodCounts, pendingReqs, allUsers] = await Promise.all([
          fetch("/api/expedicoes").then(r => r.json()),
          fetch("/api/producoes/counts").then(r => r.json()),
          fetch("/api/admin/access-requests/pending").then(r => r.json()).catch(() => []),
          fetch("/api/admin/users").then(r => r.json()).catch(() => []),
        ]);
        const usersAguardando = Array.isArray(allUsers) ? allUsers.filter((u: any) => !u.acesso).length : 0;
        const reqsPendentes = Array.isArray(pendingReqs) ? pendingReqs.length : 0;
        setBadges({
          financeiroPendente: expRes.filter((e: any) => e.statusFinanceiro === "pendente_aprovacao").length,
          notaPendente: expRes.filter((e: any) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao").length,
          producaoEmAndamento: Number(prodCounts?.pendente) || 0,
          estoqueAbaixoMinimo: 0,
          adminPendencias: reqsPendentes + usersAguardando,
        });
      } catch { /* silently fail */ }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return badges;
}
