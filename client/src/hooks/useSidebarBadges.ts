import { useEffect, useState } from "react";

export interface SidebarBadges {
  financeiroPendente: number;
  notaPendente: number;
  producaoEmAndamento: number;
  estoqueAbaixoMinimo: number;
}

export function useSidebarBadges(): SidebarBadges {
  const [badges, setBadges] = useState<SidebarBadges>({
    financeiroPendente: 0,
    notaPendente: 0,
    producaoEmAndamento: 0,
    estoqueAbaixoMinimo: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [expRes, prodRes] = await Promise.all([
          fetch("/api/expedicoes").then(r => r.json()),
          fetch("/api/producoes").then(r => r.json()),
        ]);
        setBadges({
          financeiroPendente: expRes.filter((e: any) => e.statusFinanceiro === "pendente_aprovacao").length,
          notaPendente: expRes.filter((e: any) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao").length,
          producaoEmAndamento: prodRes.filter((p: any) => p.statusEstoque === "pendente").length,
          estoqueAbaixoMinimo: 0,
        });
      } catch { /* silently fail */ }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return badges;
}
