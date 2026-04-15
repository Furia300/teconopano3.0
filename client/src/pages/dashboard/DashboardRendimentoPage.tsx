import { useEffect, useState, useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import {
  DataListingTable,
  type DataListingColumn,
  CellMonoStrong,
  CellMonoMuted,
  CellMuted,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";

const FIPS = { azulProfundo: "#004B9B", verdeFloresta: "#00C64C", amareloEscuro: "#F6921E", azulEscuro: "#002A68", danger: "#DC3545" };

interface FornecedorRendimento {
  fornecedor: string;
  totalColetas: number;
  pesoEntrada: number;
  pesoProducao: number;
  pesoDescarte: number;
  rendimento: number; // %
  ultimaColeta: string;
}

function formatKg(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)} kg`; }

function rendimentoColumns(): DataListingColumn<FornecedorRendimento>[] {
  return [
    {
      id: "rank", label: "#", fixed: true, width: "50px",
      render: (_r, _ctx, i) => <CellMonoStrong>{(i ?? 0) + 1}</CellMonoStrong>,
    },
    {
      id: "fornecedor", label: "Fornecedor", fixed: true, sortable: true, width: "220px",
      render: (r) => <span className="text-[12px] font-semibold text-[var(--fips-fg)]">{r.fornecedor}</span>,
    },
    {
      id: "coletas", label: "Coletas", sortable: true, align: "right", width: "80px",
      render: (r) => <CellMonoStrong align="right">{r.totalColetas}</CellMonoStrong>,
    },
    {
      id: "pesoEntrada", label: "Peso Entrada", sortable: true, align: "right", width: "100px",
      render: (r) => <CellMonoStrong align="right">{formatKg(r.pesoEntrada)}</CellMonoStrong>,
    },
    {
      id: "pesoProducao", label: "Produção", sortable: true, align: "right", width: "100px",
      render: (r) => <CellMonoStrong align="right">{formatKg(r.pesoProducao)}</CellMonoStrong>,
    },
    {
      id: "pesoDescarte", label: "Descarte", sortable: true, align: "right", width: "90px",
      render: (r) => <span className="text-[11px] font-mono font-semibold text-[var(--fips-danger)]">{formatKg(r.pesoDescarte)}</span>,
    },
    {
      id: "rendimento", label: "Rendimento", sortable: true, align: "right", width: "110px",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-[50px] h-[6px] rounded bg-[var(--fips-border)]">
            <div className="h-full rounded" style={{
              width: `${Math.min(r.rendimento, 100)}%`,
              background: r.rendimento >= 80 ? FIPS.verdeFloresta : r.rendimento >= 50 ? FIPS.amareloEscuro : FIPS.danger,
            }} />
          </div>
          <span className="text-[11px] font-mono font-bold" style={{
            color: r.rendimento >= 80 ? FIPS.verdeFloresta : r.rendimento >= 50 ? FIPS.amareloEscuro : FIPS.danger,
          }}>{r.rendimento}%</span>
        </div>
      ),
    },
    {
      id: "ultima", label: "Última Coleta", width: "100px",
      render: (r) => <CellMonoMuted>{r.ultimaColeta ? new Date(r.ultimaColeta).toLocaleDateString("pt-BR") : "—"}</CellMonoMuted>,
    },
  ];
}

export default function DashboardRendimentoPage() {
  const [coletas, setColetas] = useState<any[]>([]);
  const [producoes, setProducoes] = useState<any[]>([]);
  const [separacoes, setSeparacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");

  useEffect(() => {
    Promise.all([
      fetch("/api/coletas").then(r => r.json()).catch(() => []),
      fetch("/api/producoes").then(r => r.json()).catch(() => []),
      fetch("/api/separacoes").then(r => r.json()).catch(() => []),
    ])
      .then(([c, p, s]) => { setColetas(c); setProducoes(p); setSeparacoes(s); })
      .finally(() => setLoading(false));
  }, []);

  const rendimentos = useMemo((): FornecedorRendimento[] => {
    const map: Record<string, { fornecedor: string; coletas: number; pesoEntrada: number; pesoProducao: number; pesoDescarte: number; ultima: string }> = {};

    for (const c of coletas) {
      const nome = c.nomeFantasia || "Desconhecido";
      if (!map[nome]) map[nome] = { fornecedor: nome, coletas: 0, pesoEntrada: 0, pesoProducao: 0, pesoDescarte: 0, ultima: "" };
      map[nome].coletas++;
      map[nome].pesoEntrada += c.pesoTotalAtual || c.pesoTotalNF || 0;
      if (c.createdAt && (!map[nome].ultima || c.createdAt > map[nome].ultima)) map[nome].ultima = c.createdAt;
    }

    // Add producao weights by coleta → fornecedor
    for (const p of producoes) {
      const coleta = coletas.find((c: any) => c.id === p.coletaId);
      if (coleta) {
        const nome = coleta.nomeFantasia || "Desconhecido";
        if (map[nome]) map[nome].pesoProducao += p.pesoTotal || 0;
      }
    }

    // Calculate descarte from separacoes destino=descarte
    for (const s of separacoes) {
      if (s.destino === "descarte") {
        const coleta = coletas.find((c: any) => c.id === s.coletaId);
        if (coleta) {
          const nome = coleta.nomeFantasia || "Desconhecido";
          if (map[nome]) map[nome].pesoDescarte += s.peso || 0;
        }
      }
    }

    return Object.values(map)
      .map(f => ({
        fornecedor: f.fornecedor,
        totalColetas: f.coletas,
        pesoEntrada: f.pesoEntrada,
        pesoProducao: f.pesoProducao,
        pesoDescarte: f.pesoDescarte,
        rendimento: f.pesoEntrada > 0 ? Math.round((f.pesoProducao / f.pesoEntrada) * 100) : 0,
        ultimaColeta: f.ultima,
      }))
      .sort((a, b) => b.pesoEntrada - a.pesoEntrada);
  }, [coletas, producoes, separacoes]);

  const filtered = useMemo(() => {
    if (!search) return rendimentos;
    const q = search.toLowerCase();
    return rendimentos.filter(r => r.fornecedor.toLowerCase().includes(q));
  }, [rendimentos, search]);

  const totalEntrada = rendimentos.reduce((a, r) => a + r.pesoEntrada, 0);
  const totalProducao = rendimentos.reduce((a, r) => a + r.pesoProducao, 0);
  const totalDescarte = rendimentos.reduce((a, r) => a + r.pesoDescarte, 0);
  const rendimentoGeral = totalEntrada > 0 ? Math.round((totalProducao / totalEntrada) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rendimento por Fornecedor"
        description="Quanto cada fornecedor rende em produção vs descarte — visão do dono"
        icon={TrendingUp}
        actions={<DashboardPrintButton title="Rendimento Fornecedores" />}
        stats={[
          { label: "Fornecedores", value: rendimentos.length, color: "#93BDE4" },
          { label: "Entrada", value: formatKg(totalEntrada), color: "#FDC24E" },
          { label: "Produção", value: formatKg(totalProducao), color: "#00C64C" },
          { label: "Rendimento", value: `${rendimentoGeral}%`, color: "#ed1b24" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Fornecedores" value={rendimentos.length} subtitle="Com coletas registradas" icon={BarChart3} color={FIPS.azulProfundo} />
        <StatsCard label="Peso Entrada" value={formatKg(totalEntrada)} subtitle="Total recebido" icon={TrendingUp} color={FIPS.amareloEscuro} />
        <StatsCard label="Peso Produção" value={formatKg(totalProducao)} subtitle="Total produzido" icon={TrendingUp} color={FIPS.verdeFloresta} />
        <StatsCard label="Descarte Total" value={formatKg(totalDescarte)} subtitle={`${rendimentoGeral}% rendimento geral`} icon={TrendingUp} color={FIPS.danger} />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar fornecedor..."
        periodo={periodo}
        onPeriodoChange={setPeriodo}
      />

      <DataListingTable<FornecedorRendimento>
        icon={<TrendingUp className="h-[22px] w-[22px]" />}
        title="Rendimento por Fornecedor"
        subtitle={`${filtered.length} fornecedores · Rendimento geral: ${rendimentoGeral}%`}
        filtered={!!search}
        data={filtered}
        getRowId={(r) => r.fornecedor}
        selectable={false}
        emptyState={loading ? "Carregando..." : "Nenhum dado de rendimento encontrado"}
        columns={rendimentoColumns()}
      />
    </div>
  );
}
