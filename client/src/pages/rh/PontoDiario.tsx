import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Check,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import {
  DataListingTable,
  type DataListingColumn,
  CellMonoMuted,
  CellMuted,
} from "@/components/domain/DataListingTable";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ──────────────────────────── TIPOS ──────────────────────────── */

type LinhaStatus = "presente" | "feriado" | "ferias" | "desconsiderar" | "vazio";

interface LinhaPonto {
  id: string;
  funcionario: string;
  pis: string;
  departamento: string;
  status: LinhaStatus;
  escala: string | null;
  ent1: string;
  sai1: string;
  ent2: string;
  sai2: string;
  totalNormais: string;
  totalNoturno: string;
  diaFalta: string;
  faltaAtraso: string;
  abono: string;
  extraDiurna: string;
  extraNoturna: string;
  bancoTotal: string;
  bancoSaldo: string;
  exclusoes: string;
}

/* ──────────────────────────── HELPERS ──────────────────────────── */

function shiftTime(t: string, deltaMin: number): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return t;
  let h = Number(m[1]);
  let mi = Number(m[2]) + deltaMin;
  h += Math.floor(mi / 60);
  mi = ((mi % 60) + 60) % 60;
  h = ((h % 24) + 24) % 24;
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

function formatarData(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function gerarLinha(
  id: string,
  funcionario: string,
  pis: string,
  departamento: string,
  status: LinhaStatus,
  seed: number,
): LinhaPonto {
  if (status === "feriado") {
    return {
      id, funcionario, pis, departamento, status,
      escala: null,
      ent1: "Feriado", sai1: "Feriado", ent2: "Feriado", sai2: "Feriado",
      totalNormais: "—", totalNoturno: "—", diaFalta: "—", faltaAtraso: "—",
      abono: "—", extraDiurna: "—", extraNoturna: "—", bancoTotal: "—", bancoSaldo: "—", exclusoes: "—",
    };
  }
  if (status === "ferias") {
    return {
      id, funcionario, pis, departamento, status,
      escala: null,
      ent1: "Ferias", sai1: "Ferias", ent2: "Ferias", sai2: "Ferias",
      totalNormais: "—", totalNoturno: "—", diaFalta: "—", faltaAtraso: "—",
      abono: "—", extraDiurna: "—", extraNoturna: "—", bancoTotal: "—", bancoSaldo: "—", exclusoes: "—",
    };
  }
  if (status === "desconsiderar") {
    return {
      id, funcionario, pis, departamento, status,
      escala: "08:00-12:00 / 13:00-17:48",
      ent1: "DESCONSIDERAR MARCAÇÃO", sai1: "DESCONSIDERAR MARCAÇÃO",
      ent2: "DESCONSIDERAR MARCAÇÃO", sai2: "DESCONSIDERAR MARCAÇÃO",
      totalNormais: "—", totalNoturno: "—", diaFalta: "1", faltaAtraso: "08:00",
      abono: "—", extraDiurna: "—", extraNoturna: "—", bancoTotal: "-08:00", bancoSaldo: "-08:00", exclusoes: "—",
    };
  }
  if (status === "presente") {
    const e1m = 55 + (seed % 8);
    const s1m = (seed % 5);
    const e2m = 55 + ((seed * 3) % 10);
    const s2m = 43 + ((seed * 7) % 10);
    const ent1 = `07:${String(e1m).padStart(2, "0")}`;
    const sai1 = `12:${String(s1m).padStart(2, "0")}`;
    const ent2 = `12:${String(e2m).padStart(2, "0")}`;
    const sai2 = `17:${String(s2m).padStart(2, "0")}`;
    const extra = (seed % 3 === 0) ? "00:15" : "—";
    return {
      id, funcionario, pis, departamento, status,
      escala: "08:00-12:00 / 13:00-17:48",
      ent1, sai1, ent2, sai2,
      totalNormais: "08:00", totalNoturno: "—", diaFalta: "—", faltaAtraso: "—",
      abono: "—", extraDiurna: extra, extraNoturna: "—",
      bancoTotal: extra === "—" ? "00:00" : "00:15",
      bancoSaldo: extra === "—" ? "00:00" : "+00:15",
      exclusoes: "—",
    };
  }
  return {
    id, funcionario, pis, departamento, status: "vazio",
    escala: "08:00-12:00 / 13:00-17:48",
    ent1: "—", sai1: "—", ent2: "—", sai2: "—",
    totalNormais: "—", totalNoturno: "—", diaFalta: "1", faltaAtraso: "08:00",
    abono: "—", extraDiurna: "—", extraNoturna: "—", bancoTotal: "-08:00", bancoSaldo: "-08:00", exclusoes: "—",
  };
}

function aplicarVariacaoDia(linhas: LinhaPonto[], dataRef: Date): LinhaPonto[] {
  const ep = Math.floor(dataRef.getTime() / 86400000);
  const delta = (ep % 11) - 5;
  return linhas.map((row) => {
    if (row.status !== "presente") return row;
    return {
      ...row,
      ent1: shiftTime(row.ent1, delta),
      sai1: shiftTime(row.sai1, delta),
      ent2: shiftTime(row.ent2, delta),
      sai2: shiftTime(row.sai2, delta),
    };
  });
}

/* ──────────────────────────── STATUS ──────────────────────────── */

function StatusMarca({ status }: { status: LinhaStatus }) {
  if (status === "presente") {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--fips-success)]/30 bg-[var(--fips-success)]/10 text-[var(--fips-success)]">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--fips-success)]/30 bg-[var(--fips-success)]/10 text-[var(--fips-success)]">
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] text-[var(--fips-fg-muted)]">
      —
    </span>
  );
}

/* ──────────────────────────── COLUNAS ──────────────────────────── */

const pontoColumns: DataListingColumn<LinhaPonto>[] = [
  {
    id: "funcionario", label: "Funcionário", fixed: true, sortable: true,
    render: (r) => <span className="font-medium truncate max-w-[200px] block">{r.funcionario}</span>,
  },
  {
    id: "pis", label: "PIS", sortable: true,
    render: (r) => <CellMonoMuted>{r.pis}</CellMonoMuted>,
  },
  {
    id: "status", label: "", sortable: true, align: "center", width: "80px",
    render: (r) => <StatusMarca status={r.status} />,
  },
  {
    id: "escala", label: "Escala",
    render: (r) => r.escala ? (
      <span className="inline-flex items-center rounded bg-[var(--fips-primary)]/8 px-1.5 py-0.5 text-[10px] font-medium text-[var(--fips-primary)] dark:bg-white/[0.06] dark:text-white/60">
        {r.escala}
      </span>
    ) : <CellMuted>—</CellMuted>,
  },
  {
    id: "ent1", label: "Ent. 1",
    render: (r) => <span className="text-xs whitespace-nowrap tabular-nums">{r.ent1}</span>,
  },
  {
    id: "sai1", label: "Saí. 1",
    render: (r) => <span className="text-xs whitespace-nowrap tabular-nums">{r.sai1}</span>,
  },
  {
    id: "ent2", label: "Ent. 2",
    render: (r) => <span className="text-xs whitespace-nowrap tabular-nums">{r.ent2}</span>,
  },
  {
    id: "sai2", label: "Saí. 2",
    render: (r) => <span className="text-xs whitespace-nowrap tabular-nums">{r.sai2}</span>,
  },
  {
    id: "totalNormais", label: "Total Normais",
    render: (r) => <span className="text-xs tabular-nums whitespace-nowrap">{r.totalNormais}</span>,
  },
  {
    id: "totalNoturno", label: "Total Noturno",
    render: (r) => <span className="text-xs tabular-nums whitespace-nowrap">{r.totalNoturno}</span>,
  },
  {
    id: "diaFalta", label: "Dia Falta",
    render: (r) => r.diaFalta !== "—" ? (
      <span className="text-xs font-semibold text-[var(--fips-danger)]">{r.diaFalta}</span>
    ) : <CellMuted>—</CellMuted>,
  },
  {
    id: "faltaAtraso", label: "Falta e Atraso",
    render: (r) => r.faltaAtraso !== "—" ? (
      <span className="text-xs font-semibold text-[var(--fips-danger)]">{r.faltaAtraso}</span>
    ) : <CellMuted>—</CellMuted>,
  },
  {
    id: "abono", label: "Abono",
    render: (r) => <span className="text-xs tabular-nums">{r.abono}</span>,
  },
  {
    id: "extraDiurna", label: "Extra Diurna",
    render: (r) => r.extraDiurna !== "—" ? (
      <span className="text-xs font-semibold text-[var(--fips-success)]">{r.extraDiurna}</span>
    ) : <CellMuted>—</CellMuted>,
  },
  {
    id: "extraNoturna", label: "Extra Noturna",
    render: (r) => r.extraNoturna !== "—" ? (
      <span className="text-xs font-semibold text-[var(--fips-success)]">{r.extraNoturna}</span>
    ) : <CellMuted>—</CellMuted>,
  },
  {
    id: "bancoTotal", label: "Banco Total",
    render: (r) => <span className={cn("text-xs tabular-nums", r.bancoTotal.startsWith("-") && "text-[var(--fips-danger)]")}>{r.bancoTotal}</span>,
  },
  {
    id: "bancoSaldo", label: "Banco Saldo",
    render: (r) => <span className={cn("text-xs tabular-nums font-semibold", r.bancoSaldo.startsWith("-") ? "text-[var(--fips-danger)]" : r.bancoSaldo.startsWith("+") ? "text-[var(--fips-success)]" : "")}>{r.bancoSaldo}</span>,
  },
  {
    id: "exclusoes", label: "Exclusões",
    render: (r) => <CellMuted>{r.exclusoes}</CellMuted>,
  },
];

/* ──────────────────────────── COMPONENTE ──────────────────────────── */

export default function PontoDiario() {
  const [dataRef, setDataRef] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [linhasBase, setLinhasBase] = useState<LinhaPonto[]>([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApuracao, setShowApuracao] = useState(false);
  const [showCalculo, setShowCalculo] = useState(false);
  const [showAjuste, setShowAjuste] = useState(false);

  const diaInput = useMemo(() => dataRef.toISOString().slice(0, 10), [dataRef]);
  const linhasPorDia = useMemo(() => aplicarVariacaoDia(linhasBase, dataRef), [linhasBase, dataRef]);

  const departamentos = useMemo(() => {
    const set = new Set<string>();
    linhasBase.forEach((l) => l.departamento && set.add(l.departamento));
    return Array.from(set).sort();
  }, [linhasBase]);

  const linhasFiltradas = useMemo(() => {
    const q = filtroNome.trim().toLowerCase();
    return linhasPorDia.filter((r) => {
      const matchSearch = !q || r.funcionario.toLowerCase().includes(q) || r.pis.includes(q.replace(/\D/g, ""));
      const matchStatus = !filtroStatus || r.status === filtroStatus;
      const matchDepto = !filtroDepartamento || r.departamento === filtroDepartamento;
      return matchSearch && matchStatus && matchDepto;
    });
  }, [linhasPorDia, filtroNome, filtroStatus, filtroDepartamento]);

  const pontoStats = useMemo(() => {
    const total = linhasPorDia.length;
    const presentes = linhasPorDia.filter((r) => r.status === "presente").length;
    const feriado = linhasPorDia.filter((r) => r.status === "feriado").length;
    const ferias = linhasPorDia.filter((r) => r.status === "ferias").length;
    const desconsiderar = linhasPorDia.filter((r) => r.status === "desconsiderar").length;
    return { total, presentes, feriado, ferias, desconsiderar };
  }, [linhasPorDia]);

  const alterarDia = useCallback((delta: number) => {
    setDataRef((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + delta);
      return n;
    });
  }, []);

  const onDataInput = useCallback((v: string) => {
    if (!v) return;
    const [y, m, day] = v.split("-").map(Number);
    const n = new Date(y, m - 1, day, 12, 0, 0, 0);
    if (!Number.isNaN(n.getTime())) setDataRef(n);
  }, []);

  const carregarDados = useCallback(
    async (silent?: boolean) => {
      setRefreshing(true);
      try {
        const res = await fetch("/api/colaboradores");
        if (!res.ok) throw new Error("API");
        const data = await res.json();
        const list = data.colaboradores as {
          id: number; name: string; cpf: string; departamento: string;
          status: number;
        }[] | undefined;
        if (list?.length) {
          const statuses: LinhaStatus[] = ["presente", "feriado", "ferias", "desconsiderar", "presente", "presente"];
          const pisPad = (cpf: string) => (cpf || "").replace(/\D/g, "").padStart(11, "0").slice(0, 11);
          setLinhasBase(
            list.map((c, i) => {
              const st = c.status === 1 ? statuses[i % statuses.length] : "desconsiderar";
              return gerarLinha(String(c.id), c.name, pisPad(c.cpf), c.departamento || "Sem departamento", st, i);
            }),
          );
          if (!silent) toast.success(`Ponto carregado (${list.length} colaboradores).`);
        }
      } catch {
        if (!silent) toast.error("Erro ao carregar colaboradores — tente novamente.");
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void carregarDados(true);
  }, [carregarDados]);

  const activeFilters = (filtroStatus ? 1 : 0) + (filtroDepartamento ? 1 : 0);

  // Colunas de apuração/cálculo/ajuste são grupos que se ativam pelos toggles
  const APURACAO_IDS = new Set(["totalNormais", "totalNoturno", "diaFalta", "faltaAtraso"]);
  const CALCULO_IDS = new Set(["abono", "extraDiurna", "extraNoturna"]);
  const AJUSTE_IDS = new Set(["bancoTotal", "bancoSaldo", "exclusoes"]);

  const activeCols = useMemo(() => {
    return pontoColumns.filter((c) => {
      if (APURACAO_IDS.has(c.id)) return showApuracao;
      if (CALCULO_IDS.has(c.id)) return showCalculo;
      if (AJUSTE_IDS.has(c.id)) return showAjuste;
      return true;
    });
  }, [showApuracao, showCalculo, showAjuste]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando ponto diário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ponto diário"
        description={`Marcações do dia ${formatarData(dataRef)} — sincronização bidirecional RHiD ControlID`}
        icon={Clock}
        stats={[
          { label: "Total", value: pontoStats.total, color: "#93BDE4" },
          { label: "Presentes", value: pontoStats.presentes, color: "#00C64C" },
          { label: "Feriado", value: pontoStats.feriado, color: "#FDC24E" },
          { label: "Férias", value: pontoStats.ferias, color: "#ed1b24" },
        ]}
      />

      <DataListingToolbar
        search={filtroNome}
        onSearchChange={setFiltroNome}
        searchPlaceholder="Buscar por funcionário ou PIS…"
        activeFilters={activeFilters}
        filtersContent={
          <div className="space-y-4 px-4 py-3">
            {/* Navegação de dia + Sincronizar */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Dia</p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-2 py-1 shadow-sm">
                  <CalendarIcon className="h-4 w-4 text-[var(--fips-fg-muted)]" />
                  <input
                    type="date"
                    value={diaInput}
                    onChange={(e) => onDataInput(e.target.value)}
                    className="border-0 bg-transparent text-sm text-[var(--fips-fg)] outline-none"
                  />
                </div>
                <div className="flex gap-0.5 rounded-lg border border-[var(--fips-border)] p-0.5">
                  <Button type="button" variant="ghost" size="iconSm" onClick={() => alterarDia(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="iconSm" onClick={() => alterarDia(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="secondary" size="sm" onClick={() => carregarDados(false)} disabled={refreshing}>
                  <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                  Sincronizar
                </Button>
              </div>
            </div>
            {/* Situação */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Situação</p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todas as situações" },
                  { v: "presente", l: "Presente" },
                  { v: "feriado", l: "Feriado" },
                  { v: "ferias", l: "Férias" },
                  { v: "desconsiderar", l: "Desconsiderar" },
                  { v: "vazio", l: "Sem marcação" },
                ].map((opt) => (
                  <button
                    key={opt.v || "todos"}
                    onClick={() => setFiltroStatus(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filtroStatus === opt.v
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            {/* Departamento */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Departamento</p>
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                <button
                  onClick={() => setFiltroDepartamento("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filtroDepartamento
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todos os departamentos
                </button>
                {departamentos.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFiltroDepartamento(d)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filtroDepartamento === d
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        extraContent={
          <div className="flex flex-wrap items-center gap-3 border-l border-[var(--fips-border)] pl-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fips-fg-muted)]">Colunas:</span>
            {([
              { label: "Apuração", active: showApuracao, toggle: () => setShowApuracao((v: boolean) => !v) },
              { label: "Cálculo", active: showCalculo, toggle: () => setShowCalculo((v: boolean) => !v) },
              { label: "Ajuste", active: showAjuste, toggle: () => setShowAjuste((v: boolean) => !v) },
            ] as const).map((t) => (
              <button
                key={t.label}
                type="button"
                role="switch"
                aria-checked={t.active}
                onClick={t.toggle}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--fips-fg-muted)]"
              >
                {t.label}:
                <span
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                    t.active ? "bg-[var(--fips-primary)]" : "bg-[var(--fips-border-strong)]/40",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
                      t.active ? "left-[18px]" : "left-0.5",
                    )}
                  />
                </span>
              </button>
            ))}
          </div>
        }
      />

      <DataListingTable
        icon={<Clock className="h-6 w-6" />}
        title="Marcações do dia"
        subtitle={`${linhasFiltradas.length} de ${linhasPorDia.length} registro(s) · Dia: ${formatarData(dataRef)}${activeFilters ? " · filtrado" : ""}`}
        filtered={activeFilters > 0 || !!filtroNome.trim()}
        data={linhasFiltradas}
        getRowId={(r) => r.id}
        emptyState="Nenhum registro para este filtro ou dia."
        columns={activeCols}
      />
    </div>
  );
}
