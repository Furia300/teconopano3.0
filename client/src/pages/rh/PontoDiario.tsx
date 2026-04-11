import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminTableColumnMenu, AdminTablePagination } from "@/components/ui/admin-listing";

const LS_PREFS = "tecnopano-ponto-diario-prefs-v1";

type LinhaStatus = "presente" | "feriado" | "ferias" | "desconsiderar" | "vazio";

interface LinhaPonto {
  id: string;
  funcionario: string;
  pis: string;
  status: LinhaStatus;
  escala: string | null;
  escalaDestaque?: boolean;
  ent1: string;
  sai1: string;
  ent2: string;
  sai2: string;
  apuracao: string;
  calculo: string;
  ajuste: string;
}

const COLUNAS_PONTO = [
  { id: "funcionario", label: "Funcionário" },
  { id: "pis", label: "PIS" },
  { id: "status", label: "Situação" },
  { id: "escala", label: "Escala" },
  { id: "ent1", label: "Ent. 1" },
  { id: "sai1", label: "Saí. 1" },
  { id: "ent2", label: "Ent. 2" },
  { id: "sai2", label: "Saí. 2" },
] as const;

const COLUNAS_EXTRAS = [
  { id: "apuracao", label: "Apuração" },
  { id: "calculo", label: "Cálculo" },
  { id: "ajuste", label: "Ajuste" },
] as const;

const ALL_COLUNAS = [...COLUNAS_PONTO, ...COLUNAS_EXTRAS] as const;
type ColunaPontoId = (typeof ALL_COLUNAS)[number]["id"];

const DEFAULT_ORDER: string[] = [...COLUNAS_PONTO.map((c) => c.id), ...COLUNAS_EXTRAS.map((c) => c.id)];

const DEFAULT_VISIBLE: Record<string, boolean> = {
  ...Object.fromEntries(COLUNAS_PONTO.map((c) => [c.id, true])),
  ...Object.fromEntries(COLUNAS_EXTRAS.map((c) => [c.id, false])),
};

function extrasPorStatus(status: LinhaStatus): Pick<LinhaPonto, "apuracao" | "calculo" | "ajuste"> {
  if (status === "presente") {
    return { apuracao: "08h 02m", calculo: "08h 00m", ajuste: "—" };
  }
  if (status === "feriado" || status === "ferias") {
    return { apuracao: "—", calculo: "—", ajuste: "—" };
  }
  return { apuracao: "—", calculo: "—", ajuste: "Pendente" };
}

const MOCK_INICIAL: LinhaPonto[] = [
  {
    id: "1",
    funcionario: "Allan Cristian de Oliveira",
    pis: "12345678501",
    status: "feriado",
    escala: null,
    ent1: "Feriado",
    sai1: "Feriado",
    ent2: "Feriado",
    sai2: "Feriado",
    ...extrasPorStatus("feriado"),
  },
  {
    id: "2",
    funcionario: "EDELSON LAGO DE MOURA",
    pis: "23456789502",
    status: "ferias",
    escala: null,
    ent1: "Ferias",
    sai1: "Ferias",
    ent2: "Ferias",
    sai2: "Ferias",
    ...extrasPorStatus("ferias"),
  },
  {
    id: "3",
    funcionario: "Edilene Lima dos Santos",
    pis: "34567890503",
    status: "desconsiderar",
    escala: "08:00-12:00 / 13:00-17:48",
    escalaDestaque: true,
    ent1: "DESCONSIDERAR MARCAÇÃO",
    sai1: "DESCONSIDERAR MARCAÇÃO",
    ent2: "DESCONSIDERAR MARCAÇÃO",
    sai2: "DESCONSIDERAR MARCAÇÃO",
    ...extrasPorStatus("desconsiderar"),
  },
  {
    id: "4",
    funcionario: "Eduardo Silva Costa",
    pis: "45678901504",
    status: "desconsiderar",
    escala: "08:00-12:00 / 13:00-17:48",
    ent1: "DESCONSIDERAR MARCAÇÃO",
    sai1: "DESCONSIDERAR MARCAÇÃO",
    ent2: "DESCONSIDERAR MARCAÇÃO",
    sai2: "DESCONSIDERAR MARCAÇÃO",
    ...extrasPorStatus("desconsiderar"),
  },
  {
    id: "5",
    funcionario: "Fabricio Almeida Souza",
    pis: "56789012505",
    status: "feriado",
    escala: null,
    ent1: "Feriado",
    sai1: "Feriado",
    ent2: "Feriado",
    sai2: "Feriado",
    ...extrasPorStatus("feriado"),
  },
  {
    id: "6",
    funcionario: "Mariana Costa Pereira",
    pis: "67890123506",
    status: "presente",
    escala: "08:00-12:00 / 13:00-17:48",
    ent1: "07:58",
    sai1: "12:02",
    ent2: "12:58",
    sai2: "17:45",
    ...extrasPorStatus("presente"),
  },
];

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

/** Ajusta horários do dia (simulação) conforme a data selecionada — só linhas “presente”. */
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
      apuracao: `${Math.max(7, 8 + Math.sign(delta))}h ${String(Math.abs(delta * 3) % 60).padStart(2, "0")}m`,
      calculo: "08h 00m",
    };
  });
}

function formatarData(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function loadPrefs(): { columnOrder: string[]; visibleColumns: Record<string, boolean> } | null {
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (!raw) return null;
    const p = JSON.parse(raw) as { columnOrder?: string[]; visibleColumns?: Record<string, boolean> };
    if (!p.columnOrder?.length || !p.visibleColumns) return null;
    const valid = new Set(DEFAULT_ORDER);
    const order = p.columnOrder.filter((id) => valid.has(id));
    if (order.length !== DEFAULT_ORDER.length) return null;
    return { columnOrder: order, visibleColumns: { ...DEFAULT_VISIBLE, ...p.visibleColumns } };
  } catch {
    return null;
  }
}

function StatusMarca({ status }: { status: LinhaStatus }) {
  if (status === "presente") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--fips-success)]/30 bg-[var(--fips-success)]/10 text-[var(--fips-success)]">
        <span className="text-sm font-bold">✓</span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] text-[var(--fips-fg-muted)]">
      —
    </span>
  );
}

function ToggleColuna({
  label,
  ativo,
  onToggle,
}: {
  label: string;
  ativo: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      onClick={onToggle}
      className="flex items-center gap-2 rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--fips-fg-muted)] transition-colors hover:text-[var(--fips-fg)]"
    >
      <span
        className={cn(
          "relative h-4 w-8 shrink-0 rounded-full transition-colors",
          ativo ? "bg-[var(--fips-primary)]" : "bg-[var(--fips-border-strong)]/40",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform",
            ativo ? "left-4" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}

export default function PontoDiario() {
  const saved = loadPrefs();
  const [dataRef, setDataRef] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [linhasBase, setLinhasBase] = useState<LinhaPonto[]>(MOCK_INICIAL);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroNome, setFiltroNome] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [columnOrder, setColumnOrder] = useState<string[]>(() => saved?.columnOrder ?? [...DEFAULT_ORDER]);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => saved?.visibleColumns ?? { ...DEFAULT_VISIBLE },
  );

  const diaInput = useMemo(() => dataRef.toISOString().slice(0, 10), [dataRef]);

  const linhasPorDia = useMemo(() => aplicarVariacaoDia(linhasBase, dataRef), [linhasBase, dataRef]);

  const linhasFiltradas = useMemo(() => {
    const q = filtroNome.trim().toLowerCase();
    if (!q) return linhasPorDia;
    return linhasPorDia.filter(
      (r) => r.funcionario.toLowerCase().includes(q) || r.pis.includes(q.replace(/\D/g, "")),
    );
  }, [linhasPorDia, filtroNome]);

  const pageCount = Math.max(1, Math.ceil(linhasFiltradas.length / itemsPerPage));
  const paged = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return linhasFiltradas.slice(start, start + itemsPerPage);
  }, [linhasFiltradas, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [filtroNome, dataRef, itemsPerPage, linhasFiltradas.length]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_PREFS, JSON.stringify({ columnOrder, visibleColumns }));
    } catch {
      /* ignore */
    }
  }, [columnOrder, visibleColumns]);

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

  const mesclarComMock = useCallback((list: { id: number; name: string; cpf: string }[]) => {
    const pisPad = (cpf: string) => (cpf || "").replace(/\D/g, "").padStart(11, "0").slice(0, 11);
    setLinhasBase(
      list.slice(0, 50).map((c, i) => {
        const mock = MOCK_INICIAL[i % MOCK_INICIAL.length];
        return {
          ...mock,
          id: String(c.id),
          funcionario: c.name,
          pis: pisPad(c.cpf),
        };
      }),
    );
  }, []);

  const recarregar = useCallback(
    async (silent?: boolean) => {
      setRefreshing(true);
      try {
        const res = await fetch("/api/colaboradores");
        if (!res.ok) throw new Error("API");
        const data = await res.json();
        const list = data.colaboradores as { id: number; name: string; cpf: string }[] | undefined;
        if (list?.length) {
          mesclarComMock(list);
          if (!silent) toast.success(`Lista atualizada (${list.length} colaboradores).`);
        } else {
          setLinhasBase(MOCK_INICIAL);
          if (!silent) toast.message("Sem colaboradores na API — exibindo dados mock.");
        }
      } catch {
        setLinhasBase(MOCK_INICIAL);
        if (!silent) toast.error("Não foi possível carregar colaboradores — mock ativo.");
      } finally {
        setRefreshing(false);
      }
    },
    [mesclarComMock],
  );

  useEffect(() => {
    void recarregar(true);
  }, [recarregar]);

  const setExtraVis = useCallback((id: string, vis: boolean) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: vis }));
  }, []);

  const onToggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => ({ ...prev, [columnId]: !(prev[columnId] ?? true) }));
  };

  const onReorderColumn = (sourceId: string, targetId: string) => {
    setColumnOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(sourceId);
      const to = next.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const orderedVisibleColumns = useMemo(
    () => columnOrder.filter((id) => visibleColumns[id] ?? true),
    [columnOrder, visibleColumns],
  );

  const allColumnsMenu = ALL_COLUNAS.map((c) => ({ id: c.id, label: c.label }));

  const renderCabecalhoColuna = (id: ColunaPontoId) => {
    const meta = ALL_COLUNAS.find((c) => c.id === id)!;
    const base =
      "!h-auto !px-3 !py-2 align-middle font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase";
    if (id === "status") return <TableHead key={id} className={cn(base, "w-14 text-center")}>{meta.label}</TableHead>;
    if (id === "escala") return <TableHead key={id} className={cn(base, "min-w-[160px]")}>{meta.label}</TableHead>;
    if (id === "funcionario") return <TableHead key={id} className={cn(base, "max-w-[220px]")}>{meta.label}</TableHead>;
    if (id === "apuracao" || id === "calculo" || id === "ajuste") {
      return <TableHead key={id} className={cn(base, "whitespace-nowrap")}>{meta.label}</TableHead>;
    }
    return <TableHead key={id} className={base}>{meta.label}</TableHead>;
  };

  const renderCelulaColuna = (row: LinhaPonto, id: ColunaPontoId) => {
    switch (id) {
      case "funcionario":
        return (
          <TableCell key={id} className="max-w-[220px] truncate font-medium text-[var(--fips-fg)]">
            {row.funcionario}
          </TableCell>
        );
      case "pis":
        return (
          <TableCell key={id} className="whitespace-nowrap font-mono text-xs text-[var(--fips-fg-muted)]">
            {row.pis}
          </TableCell>
        );
      case "status":
        return (
          <TableCell key={id} className="text-center align-middle">
            <StatusMarca status={row.status} />
          </TableCell>
        );
      case "escala":
        return (
          <TableCell
            key={id}
            className={cn(
              "text-xs text-[var(--fips-fg-muted)]",
              row.escalaDestaque && "bg-[var(--fips-surface-muted)] font-medium text-[var(--fips-fg)]",
            )}
          >
            {row.escala ?? "—"}
          </TableCell>
        );
      case "ent1":
        return <TableCell key={id} className="whitespace-nowrap text-xs text-[var(--fips-fg)]">{row.ent1}</TableCell>;
      case "sai1":
        return <TableCell key={id} className="whitespace-nowrap text-xs text-[var(--fips-fg)]">{row.sai1}</TableCell>;
      case "ent2":
        return <TableCell key={id} className="whitespace-nowrap text-xs text-[var(--fips-fg)]">{row.ent2}</TableCell>;
      case "sai2":
        return <TableCell key={id} className="whitespace-nowrap text-xs text-[var(--fips-fg)]">{row.sai2}</TableCell>;
      case "apuracao":
        return <TableCell key={id} className="whitespace-nowrap text-xs tabular-nums">{row.apuracao}</TableCell>;
      case "calculo":
        return <TableCell key={id} className="whitespace-nowrap text-xs tabular-nums">{row.calculo}</TableCell>;
      case "ajuste":
        return <TableCell key={id} className="whitespace-nowrap text-xs text-[var(--fips-fg-muted)]">{row.ajuste}</TableCell>;
      default:
        return null;
    }
  };

  const apuracaoOn = visibleColumns.apuracao ?? false;
  const calculoOn = visibleColumns.calculo ?? false;
  const ajusteOn = visibleColumns.ajuste ?? false;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ponto diário"
        description="Colunas e visibilidade ficam guardadas neste navegador. Troque o dia para recalcular horários simulados nos registos válidos."
        icon={Clock}
        badge={
          <Badge className="border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">
            RH · Frequência
          </Badge>
        }
      />

      <Card className="overflow-visible rounded-[10px_10px_10px_18px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
        <CardContent className="space-y-3 p-4 sm:p-[14px_18px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="relative gap-1.5"
                aria-expanded={mostrarFiltros}
                aria-controls="ponto-diario-filtros-panel"
                title={
                  !mostrarFiltros && filtroNome.trim()
                    ? "A busca continua filtrando a tabela. Abra os filtros para editar ou limpar."
                    : undefined
                }
                onClick={() => setMostrarFiltros((v) => !v)}
              >
                <Search className="h-3.5 w-3.5" />
                {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                {!mostrarFiltros && filtroNome.trim() ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--fips-primary)] ring-2 ring-[var(--fips-surface)]"
                    aria-hidden
                  />
                ) : null}
              </Button>
            </div>
            <div className="text-xs font-semibold text-[var(--fips-primary)]">
              Dia: {formatarData(dataRef)}
            </div>
          </div>

          {mostrarFiltros ? (
            <div id="ponto-diario-filtros-panel" className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {["Empresas: Todas", "Departamentos: Todos", "Centros: Todos", "Cargos: Todos", "Horários: Todos"].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-md border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-2 py-1 text-[10px] font-medium text-[var(--fips-fg-muted)]"
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
              <div
                className="flex items-center gap-2 rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2 shadow-sm"
                role="search"
              >
                <Search className="h-4 w-4 shrink-0 text-[var(--fips-fg-muted)]" />
                <input
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  placeholder="Buscar por funcionário ou PIS…"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[var(--fips-fg)] outline-none placeholder:text-[var(--fips-fg-muted)]"
                />
                {filtroNome ? (
                  <button
                    type="button"
                    className="text-[var(--fips-fg-muted)] hover:text-[var(--fips-fg)]"
                    aria-label="Limpar"
                    onClick={() => setFiltroNome("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-[var(--fips-border)] pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
                <Button type="button" variant="ghost" size="iconSm" onClick={() => alterarDia(-1)} aria-label="Dia anterior">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="iconSm" onClick={() => alterarDia(1)} aria-label="Próximo dia">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <AdminTableColumnMenu
                buttonLabel="Colunas"
                className="[&_button]:h-8 [&_button]:gap-1.5 [&_button]:rounded-md [&_button]:px-3 [&_button]:text-xs"
                columns={allColumnsMenu}
                visibleColumns={visibleColumns}
                onToggleColumn={onToggleColumn}
                onReorderColumn={onReorderColumn}
              />
              <Button
                type="button"
                variant="secondary"
                size="iconSm"
                onClick={() => recarregar(false)}
                disabled={refreshing}
                aria-label="Atualizar"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleColuna label="Apuração" ativo={apuracaoOn} onToggle={() => setExtraVis("apuracao", !apuracaoOn)} />
              <ToggleColuna label="Cálculo" ativo={calculoOn} onToggle={() => setExtraVis("calculo", !calculoOn)} />
              <ToggleColuna label="Ajuste" ativo={ajusteOn} onToggle={() => setExtraVis("ajuste", !ajusteOn)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[12px_12px_12px_24px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[var(--fips-border)] px-5 py-4 sm:flex-row sm:items-center sm:gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[var(--fips-primary)]/15 bg-[var(--fips-primary)]/[0.06]">
            <Clock className="h-6 w-6 text-[var(--fips-primary)]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-bold text-[var(--fips-fg)]">Marcações do dia</h3>
            <p className="mt-0.5 text-[11px] text-[var(--fips-fg-muted)]">
              {linhasFiltradas.length} de {linhasPorDia.length} registro(s) · {formatarData(dataRef)}
              {filtroNome.trim() ? " · filtrado" : ""}
            </p>
          </div>
          {filtroNome.trim() ? (
            <span className="shrink-0 rounded-xl bg-[var(--color-fips-sky-100)] px-2.5 py-1 font-heading text-[10px] font-bold tracking-wide text-[var(--fips-primary)] uppercase dark:bg-[var(--fips-primary)]/20 dark:text-[var(--color-fips-sky-200)]">
              Filtrado
            </span>
          ) : null}
        </div>

        <Table framed={false}>
          <TableHeader className="bg-[var(--fips-surface-muted)]">
            <TableRow className="hover:bg-transparent">
              {orderedVisibleColumns.map((id) => renderCabecalhoColuna(id as ColunaPontoId))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Math.max(orderedVisibleColumns.length, 1)} className="py-12 text-center text-sm text-[var(--fips-fg-muted)]">
                  Nenhum registro para este filtro ou dia.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, idx) => (
                <TableRow
                  key={row.id}
                  className={cn(idx % 2 === 1 && "bg-[var(--color-fips-sky-50)]/55 dark:bg-white/[0.04]")}
                >
                  {orderedVisibleColumns.map((id) => renderCelulaColuna(row, id as ColunaPontoId))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <AdminTablePagination
          page={page}
          pageCount={pageCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </Card>
    </div>
  );
}
