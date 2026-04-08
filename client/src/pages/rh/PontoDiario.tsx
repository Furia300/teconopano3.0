import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Settings2,
} from "lucide-react";
import { PageHero } from "@/composites/PageHero";
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
  },
];

function formatarData(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
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
  const [dataRef, setDataRef] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [linhas, setLinhas] = useState<LinhaPonto[]>(MOCK_INICIAL);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [apuracao, setApuracao] = useState(false);
  const [calculo, setCalculo] = useState(false);
  const [ajuste, setAjuste] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const diaInput = useMemo(() => dataRef.toISOString().slice(0, 10), [dataRef]);

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
    setLinhas(
      list.slice(0, 20).map((c, i) => {
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
          setLinhas(MOCK_INICIAL);
          if (!silent) toast.message("Sem colaboradores na API — exibindo dados mock.");
        }
      } catch {
        setLinhas(MOCK_INICIAL);
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

  return (
    <div className="space-y-5">
      <PageHero
        className="rounded-[12px_12px_12px_24px] border border-white/10 shadow-[0_4px_20px_rgba(0,42,104,0.12)]"
        decorationSrc=""
        showTrainSilhouette={false}
      >
        <div className="flex flex-wrap items-center gap-3 p-[18px] sm:gap-4 sm:p-[22px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#FDC24E]/30 bg-[#FDC24E]/18 sm:h-11 sm:w-11">
            <Clock className="h-5 w-5 text-[#FDC24E]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-[17px] font-bold tracking-tight text-white sm:text-[21px]">
              Ponto diário
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-white/65 sm:text-xs">
              Espelho de marcações por dia — layout alinhado ao RHiD, visual no design system FIPS / Tecnopano.
            </p>
          </div>
          <Badge className="border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">
            RH · Frequência
          </Badge>
        </div>
      </PageHero>

      {/* Barra de contexto e filtros (como no RHiD) */}
      <Card className="overflow-visible rounded-[10px_10px_10px_18px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
        <CardContent className="space-y-3 p-4 sm:p-[14px_18px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => setMostrarFiltros((v) => !v)}
              >
                <Search className="h-3.5 w-3.5" />
                {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
              </Button>
              <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
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
            </div>
            <div className="text-xs font-semibold text-[var(--fips-primary)]">
              Dia: {formatarData(dataRef)}
            </div>
          </div>

          {mostrarFiltros ? (
            <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-[var(--fips-border)] bg-[var(--fips-surface-muted)]/50 p-3 text-[11px] text-[var(--fips-fg-muted)]">
              <Filter className="h-4 w-4 shrink-0 opacity-70" />
              Filtros avançados podem ser ligados à API RHiD quando o endpoint de espelho estiver disponível. Por
              agora, use os atalhos acima como referência visual.
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
              <Button type="button" variant="secondary" size="sm" className="gap-1.5">
                <Settings2 className="h-3.5 w-3.5" />
                Colunas
              </Button>
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
              <ToggleColuna label="Apuração" ativo={apuracao} onToggle={() => setApuracao((v) => !v)} />
              <ToggleColuna label="Cálculo" ativo={calculo} onToggle={() => setCalculo((v) => !v)} />
              <ToggleColuna label="Ajuste" ativo={ajuste} onToggle={() => setAjuste((v) => !v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela principal */}
      <Card className="overflow-hidden rounded-[12px_12px_12px_24px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
        <div className="flex items-center gap-3 border-b border-[var(--fips-border)] px-4 py-3 sm:px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[var(--fips-primary)]/15 bg-[var(--fips-primary)]/[0.06]">
            <Clock className="h-5 w-5 text-[var(--fips-primary)]" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-[var(--fips-fg)]">Marcações do dia</h3>
            <p className="text-[11px] text-[var(--fips-fg-muted)]">
              {linhas.length} funcionário(s) · {formatarData(dataRef)}
            </p>
          </div>
        </div>

        <Table framed={false} density="dense">
          <TableHeader className="bg-[var(--fips-surface-muted)]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                Funcionário
              </TableHead>
              <TableHead className="font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                PIS
              </TableHead>
              <TableHead className="w-14 text-center font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                {""}
              </TableHead>
              <TableHead className="min-w-[160px] font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                Escala
              </TableHead>
              <TableHead className="font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                Ent. 1
              </TableHead>
              <TableHead className="font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                Saí. 1
              </TableHead>
              <TableHead className="font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                Ent. 2
              </TableHead>
              <TableHead className="font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                Saí. 2
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((row, idx) => (
              <TableRow
                key={row.id}
                className={cn(idx % 2 === 1 && "bg-[var(--color-fips-sky-50)]/40 dark:bg-white/[0.04]")}
              >
                <TableCell className="max-w-[220px] truncate font-medium text-[var(--fips-fg)]">
                  {row.funcionario}
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-[var(--fips-fg-muted)]">{row.pis}</TableCell>
                <TableCell className="text-center">
                  <StatusMarca status={row.status} />
                </TableCell>
                <TableCell
                  className={cn(
                    "text-xs text-[var(--fips-fg-muted)]",
                    row.escalaDestaque && "bg-[var(--fips-surface-muted)] font-medium text-[var(--fips-fg)]",
                  )}
                >
                  {row.escala ?? "—"}
                </TableCell>
                {[row.ent1, row.sai1, row.ent2, row.sai2].map((cell, i) => (
                  <TableCell key={i} className="whitespace-nowrap text-xs text-[var(--fips-fg)]">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
