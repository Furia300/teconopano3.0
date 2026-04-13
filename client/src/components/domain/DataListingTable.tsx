import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import {
  List as ListIcon,
  Grid3x3 as GridIcon,
  Settings as SettingsIcon,
  X as XIcon,
  ChevronUp,
  ChevronsUpDown,
  Pencil,
  MoreHorizontal,
  Columns3,
  Rows3,
  LayoutGrid,
  GripVertical,
  Check as CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────── TIPOS ──────────────────────────── */

export type Density = "compact" | "normal" | "comfortable";
export type ViewMode = "table" | "cards";

export interface DataListingColumn<T> {
  id: string;
  label: string;
  /** Se `fixed`, não pode ser ocultada no Configurar */
  fixed?: boolean;
  /** Marcado por default na lista de colunas visíveis */
  default?: boolean;
  /** Renderização do conteúdo da célula */
  render: (row: T, ctx: { density: Density }) => ReactNode;
  /** Alinhamento (esquerda default) */
  align?: "left" | "right" | "center";
  /** Se true, ativa setas de sort no header (sort manual fica a cargo do pai) */
  sortable?: boolean;
  /** Largura fixa (CSS). Se omitido, fica auto */
  width?: string;
  /** Render alternativo da linha quando view = "cards" */
  cardRender?: (row: T) => ReactNode;
}

export interface DataListingTableProps<T> {
  /** Ícone do header (mesmo padrão `inbox` do canônico) */
  icon: ReactNode;
  title: string;
  /** Subtítulo — geralmente "N registros no total · Atualizado agora" */
  subtitle?: string;
  /** Indica se há filtros aplicados — mostra a tag "Filtrado" no header */
  filtered?: boolean;
  data: T[];
  columns: DataListingColumn<T>[];
  /** Função para extrair o id único de cada linha */
  getRowId: (row: T) => string;
  /** Conteúdo da linha vazia */
  emptyState?: ReactNode;
  /** Se true, mostra checkboxes de seleção (default true) */
  selectable?: boolean;
  /** Se true, mostra o toggle Tabela/Cards no header (default true) */
  enableViewSwitch?: boolean;
  /** Se true, mostra o botão Configurar no header (default true) */
  enableConfigure?: boolean;
  /** Renderização opcional dos cards quando view = "cards" */
  renderCard?: (row: T, ctx: { selected: boolean }) => ReactNode;
}

/* ──────────────────────────── DENSITY MAP ──────────────────────────── */

const DENSITY_SPEC: Record<Density, { rowH: number; fs: number; padX: number }> = {
  compact: { rowH: 28, fs: 11, padX: 8 },
  normal: { rowH: 34, fs: 12, padX: 12 },
  comfortable: { rowH: 44, fs: 13, padX: 16 },
};

/* ──────────────────────────── CHECKBOX ──────────────────────────── */

function MiniCheckbox({
  checked,
  onChange,
  size = 14,
}: {
  checked: boolean;
  onChange: (e: React.MouseEvent) => void;
  size?: number;
}) {
  return (
    <div
      onClick={onChange}
      className={cn(
        "flex flex-shrink-0 cursor-pointer items-center justify-center rounded transition-all",
        checked
          ? "border-[var(--fips-primary)] bg-[var(--fips-primary)] text-white"
          : "border-[var(--fips-border-strong)] bg-[var(--fips-surface)]",
      )}
      style={{ width: size, height: size, borderWidth: 1.5 }}
    >
      {checked && <CheckIcon style={{ width: Math.round(size * 0.7), height: Math.round(size * 0.7) }} />}
    </div>
  );
}

/* ──────────────────────────── TOGGLE SWITCH (config aparência) ──────────────────────────── */

function MiniToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={cn(
        "relative flex h-[18px] w-[30px] flex-shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-[var(--fips-primary)]" : "bg-[var(--fips-border-strong)]",
      )}
    >
      <div
        className="absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all"
        style={{ left: checked ? 14 : 2 }}
      />
    </div>
  );
}

/* ──────────────────────────── COMPONENT ──────────────────────────── */

export function DataListingTable<T>({
  icon,
  title,
  subtitle,
  filtered,
  data,
  columns,
  getRowId,
  emptyState,
  selectable = true,
  enableViewSwitch = true,
  enableConfigure = true,
  renderCard,
}: DataListingTableProps<T>) {
  /* ── State ── */
  const [view, setView] = useState<ViewMode>("table");
  const [density, setDensity] = useState<Density>("normal");
  const [appearance, setAppearance] = useState({
    zebra: true,
    verticalBorders: false,
    stickyHeader: true,
    wrapText: false,
  });
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.default !== false).map((c) => c.id)),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<{ col: string | null; dir: "asc" | "desc" }>({
    col: null,
    dir: "asc",
  });
  const [showConfig, setShowConfig] = useState(false);
  const [colOrder, setColOrder] = useState<string[]>(() => columns.map((c) => c.id));
  const [dragColId, setDragColId] = useState<string | null>(null);
  const [configTab, setConfigTab] = useState<"colunas" | "densidade" | "aparencia">("colunas");

  // Sincronizar quando columns prop muda (ex: toggles de Apuração/Cálculo/Ajuste)
  const colIds = useMemo(() => columns.map((c) => c.id).join(","), [columns]);
  useEffect(() => {
    const ids = columns.map((c) => c.id);
    setColOrder(ids);
    setVisibleCols(new Set(columns.filter((c) => c.default !== false).map((c) => c.id)));
  }, [colIds]);

  const configRef = useRef<HTMLDivElement>(null);

  /* ── Click outside fecha popovers ── */
  useEffect(() => {
    if (!showConfig) return;
    const h = (e: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(e.target as Node)) setShowConfig(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showConfig]);

  /* ── Helpers ── */
  const D = DENSITY_SPEC[density];
  const visibleColumnList = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.id, c]));
    return colOrder.filter((id) => visibleCols.has(id) && colMap.has(id)).map((id) => colMap.get(id)!);
  }, [columns, visibleCols, colOrder]);

  const toggleSel = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const toggleAll = () => {
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map(getRowId)));
  };
  const toggleCol = (id: string) => {
    const c = columns.find((x) => x.id === id);
    if (c?.fixed) return;
    const n = new Set(visibleCols);
    n.has(id) ? n.delete(id) : n.add(id);
    setVisibleCols(n);
  };
  const restoreCols = () =>
    setVisibleCols(new Set(columns.filter((c) => c.default !== false).map((c) => c.id)));
  const handleSort = (colId: string) => {
    setSortBy((s) => ({
      col: colId,
      dir: s.col === colId && s.dir === "asc" ? "desc" : "asc",
    }));
  };

  /* ── Render ── */
  return (
    <div className="overflow-visible rounded-[12px_12px_12px_24px] border border-[var(--fips-border)] bg-[var(--fips-surface)] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
      {/* ───── HEADER OBRIGATÓRIO ───── */}
      <div className="flex items-center gap-3.5 border-b border-[var(--fips-border)] px-5 pt-[18px] pb-3.5">
        {/* Ícone */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] border border-[color-mix(in_srgb,var(--fips-primary)_8%,transparent)] bg-[color-mix(in_srgb,var(--fips-primary)_4%,transparent)] text-[var(--fips-primary)]">
          {icon}
        </div>
        {/* Título + Subtítulo */}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading m-0 text-base font-bold leading-tight text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">
            {title}
          </h3>
          {subtitle && (
            <p className="m-0 mt-[3px] text-[11px] leading-[1.4] text-[var(--fips-fg-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {/* Lado direito */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {filtered && (
            <span className="font-heading rounded-xl bg-[var(--color-fips-blue-200)]/65 px-2.5 py-1 text-[10px] font-bold tracking-[0.5px] text-[var(--fips-primary)] uppercase">
              Filtrado
            </span>
          )}
          {enableViewSwitch && (
            <div className="flex gap-[3px] rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-[3px]">
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border-0 px-2.5 py-[5px] text-[11px] font-semibold transition-all",
                  view === "table"
                    ? "bg-[var(--fips-surface)] text-[var(--fips-primary)] shadow-[0_1px_2px_rgba(0,42,104,0.08)]"
                    : "bg-transparent text-[var(--fips-fg-muted)]",
                )}
              >
                <ListIcon className="h-3 w-3" /> Tabela
              </button>
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border-0 px-2.5 py-[5px] text-[11px] font-semibold transition-all",
                  view === "cards"
                    ? "bg-[var(--fips-surface)] text-[var(--fips-primary)] shadow-[0_1px_2px_rgba(0,42,104,0.08)]"
                    : "bg-transparent text-[var(--fips-fg-muted)]",
                )}
              >
                <GridIcon className="h-3 w-3" /> Cards
              </button>
            </div>
          )}
          {enableConfigure && (
            <div ref={configRef} className="relative">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-[7px] text-[11px] font-semibold transition-all",
                  showConfig
                    ? "border-[var(--fips-primary)] bg-[var(--color-fips-blue-200)]/65 text-[var(--fips-primary)]"
                    : "border-[var(--fips-border)] bg-[var(--fips-surface)] text-[var(--fips-fg)] hover:border-[var(--fips-border-strong)]",
                )}
                title="Configurações da tabela"
              >
                <SettingsIcon className="h-3.5 w-3.5" /> Configurar
              </button>
              {showConfig && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[300px] overflow-hidden rounded-[10px_10px_10px_16px] border border-[var(--fips-border)] bg-[var(--fips-surface)] shadow-[0_12px_36px_rgba(0,42,104,0.18),0_2px_8px_rgba(0,42,104,0.06)]">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--fips-border)] px-4 py-3">
                    <span className="font-heading text-[13px] font-bold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">
                      Configurações
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConfig(false)}
                      className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent"
                    >
                      <XIcon className="h-3 w-3 text-[var(--fips-fg-muted)]" />
                    </button>
                  </div>
                  {/* Tabs */}
                  <div className="flex border-b border-[var(--fips-border)] bg-[var(--fips-surface-soft)]">
                    {[
                      { id: "colunas" as const, label: "Colunas", icon: Columns3 },
                      { id: "densidade" as const, label: "Densidade", icon: Rows3 },
                      { id: "aparencia" as const, label: "Aparência", icon: LayoutGrid },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setConfigTab(t.id)}
                        className={cn(
                          "inline-flex flex-1 items-center justify-center gap-1.5 border-0 border-b-2 bg-transparent px-2 py-[9px] text-[11px] font-semibold transition-all",
                          configTab === t.id
                            ? "border-b-[var(--fips-primary)] bg-[var(--fips-surface)] text-[var(--fips-primary)]"
                            : "border-b-transparent text-[var(--fips-fg-muted)]",
                        )}
                      >
                        <t.icon className="h-3 w-3" /> {t.label}
                      </button>
                    ))}
                  </div>
                  {/* Body */}
                  <div className="max-h-[320px] overflow-y-auto px-4 py-3">
                    {configTab === "colunas" && (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading mb-1.5 ml-1 text-[9px] font-bold tracking-[1px] text-[var(--fips-fg-muted)] uppercase">
                          Visíveis ({visibleCols.size})
                        </span>
                        {colOrder.map((colId) => {
                          const col = columns.find((c) => c.id === colId);
                          if (!col) return null;
                          const isVisible = visibleCols.has(col.id);
                          return (
                            <div
                              key={col.id}
                              draggable={!col.fixed}
                              onDragStart={() => setDragColId(col.id)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (!dragColId || dragColId === col.id) return;
                                setColOrder((prev) => {
                                  const next = [...prev];
                                  const from = next.indexOf(dragColId);
                                  const to = next.indexOf(col.id);
                                  if (from === -1 || to === -1) return prev;
                                  next.splice(from, 1);
                                  next.splice(to, 0, dragColId);
                                  return next;
                                });
                              }}
                              onDragEnd={() => setDragColId(null)}
                              onClick={() => toggleCol(col.id)}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-[7px] transition-colors",
                                col.fixed ? "cursor-not-allowed opacity-60" : "cursor-grab hover:bg-[var(--fips-surface-soft)]",
                                dragColId === col.id && "opacity-40",
                              )}
                            >
                              <GripVertical className="h-2.5 w-2.5 text-[var(--fips-fg-muted)]" />
                              <MiniCheckbox checked={isVisible} onChange={() => {}} size={14} />
                              <span className="flex-1 text-[11px] font-medium text-[var(--fips-fg)]">
                                {col.label}
                              </span>
                              {col.fixed && (
                                <span className="font-mono text-[9px] text-[var(--fips-fg-muted)]">fixa</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {configTab === "densidade" && (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-heading mb-1.5 ml-1 text-[9px] font-bold tracking-[1px] text-[var(--fips-fg-muted)] uppercase">
                          Altura das linhas
                        </span>
                        {(
                          [
                            { id: "compact", label: "Compacta", desc: "30px · alta densidade" },
                            { id: "normal", label: "Normal", desc: "42px · padrão" },
                            { id: "comfortable", label: "Confortável", desc: "56px · acessível" },
                          ] as const
                        ).map((opt) => {
                          const isA = density === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setDensity(opt.id)}
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all",
                                isA
                                  ? "border-[var(--fips-primary)] bg-[var(--color-fips-blue-200)]/65"
                                  : "border-[var(--fips-border)] bg-[var(--fips-surface)]",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2",
                                  isA ? "border-[var(--fips-primary)]" : "border-[var(--fips-border-strong)]",
                                )}
                              >
                                {isA && <div className="h-2 w-2 rounded-full bg-[var(--fips-primary)]" />}
                              </div>
                              <div className="flex-1">
                                <div
                                  className={cn(
                                    "text-xs font-semibold",
                                    isA ? "text-[var(--fips-primary)]" : "text-[var(--fips-fg)]",
                                  )}
                                >
                                  {opt.label}
                                </div>
                                <div className="text-[10px] text-[var(--fips-fg-muted)]">{opt.desc}</div>
                              </div>
                              <div className="flex flex-col items-end gap-[2px]">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "w-6 rounded-[1px]",
                                      isA ? "bg-[var(--fips-primary)]" : "bg-[var(--fips-border-strong)]",
                                    )}
                                    style={{
                                      height: opt.id === "compact" ? 2 : opt.id === "normal" ? 3 : 4,
                                      opacity: 0.6,
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {configTab === "aparencia" && (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading mb-1.5 ml-1 text-[9px] font-bold tracking-[1px] text-[var(--fips-fg-muted)] uppercase">
                          Aparência da tabela
                        </span>
                        {(
                          [
                            { id: "zebra", label: "Linhas zebradas", desc: "Alterna fundo das linhas" },
                            { id: "verticalBorders", label: "Bordas verticais", desc: "Linhas entre colunas" },
                            { id: "stickyHeader", label: "Header fixo", desc: "Cabeçalho fica visível ao rolar" },
                            { id: "wrapText", label: "Quebra de linha", desc: "Texto longo quebra em várias linhas" },
                          ] as const
                        ).map((opt) => (
                          <div
                            key={opt.id}
                            onClick={() => setAppearance((a) => ({ ...a, [opt.id]: !a[opt.id] }))}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-[var(--fips-surface-soft)]"
                          >
                            <div className="flex-1">
                              <div className="text-[11px] font-semibold text-[var(--fips-fg)]">{opt.label}</div>
                              <div className="text-[10px] text-[var(--fips-fg-muted)]">{opt.desc}</div>
                            </div>
                            <MiniToggle
                              checked={appearance[opt.id as keyof typeof appearance]}
                              onChange={() => {}}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--fips-border)] bg-[var(--fips-surface-soft)] px-3.5 py-2.5">
                    <button
                      type="button"
                      onClick={
                        configTab === "colunas"
                          ? restoreCols
                          : () => {
                              setDensity("normal");
                              setAppearance({
                                zebra: true,
                                verticalBorders: false,
                                stickyHeader: true,
                                wrapText: false,
                              });
                            }
                      }
                      className="border-0 bg-transparent text-[10px] font-semibold text-[var(--fips-fg-muted)]"
                    >
                      Restaurar padrão
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfig(false)}
                      className="rounded-md border-0 bg-[var(--fips-primary)] px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───── TABLE ───── */}
      {view === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--fips-surface-soft)]">
                {selectable && (
                  <th
                    style={{ width: 36, padding: `4px ${D.padX}px` }}
                    className="border-b-2 border-[var(--fips-border)] text-left"
                  >
                    <MiniCheckbox
                      checked={selected.size === data.length && selected.size > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {visibleColumnList.map((col) => (
                  <th
                    key={col.id}
                    onClick={() => col.sortable && handleSort(col.id)}
                    style={{
                      padding: `4px ${D.padX}px`,
                      width: col.width,
                      borderRight: appearance.verticalBorders
                        ? "1px solid var(--fips-border)"
                        : "none",
                    }}
                    className={cn(
                      "font-heading whitespace-nowrap border-b-2 border-[var(--fips-border)] text-[9px] font-bold tracking-[1px] text-[var(--fips-fg-muted)] uppercase",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.align !== "right" && col.align !== "center" && "text-left",
                      col.sortable && "cursor-pointer",
                    )}
                  >
                    <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                      {col.label}
                      {col.sortable &&
                        (sortBy.col === col.id ? (
                          <ChevronUp
                            className={cn("h-2.5 w-2.5 text-[var(--fips-primary)] transition-transform", sortBy.dir === "desc" && "rotate-180")}
                          />
                        ) : (
                          <ChevronsUpDown className="h-2.5 w-2.5 text-[var(--fips-border-strong)]" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumnList.length + (selectable ? 1 : 0)}
                    className="px-6 py-14 text-center text-sm text-[var(--fips-fg-muted)]"
                  >
                    {emptyState ?? "Nenhum registro encontrado"}
                  </td>
                </tr>
              )}
              {data.map((row, i) => {
                const id = getRowId(row);
                const isSel = selected.has(id);
                return (
                  <tr
                    key={id}
                    style={{ height: D.rowH }}
                    className={cn(
                      "border-b border-[var(--fips-border)] transition-colors",
                      isSel
                        ? "bg-[var(--fips-primary)]/[0.06]"
                        : appearance.zebra && i % 2 === 1
                          ? "bg-[var(--color-fips-blue-200)]/25"
                          : "",
                      "hover:bg-white/[0.04] dark:hover:bg-white/[0.06]",
                    )}
                  >
                    {selectable && (
                      <td style={{ padding: `0 ${D.padX}px` }}>
                        <MiniCheckbox checked={isSel} onChange={() => toggleSel(id)} />
                      </td>
                    )}
                    {visibleColumnList.map((col) => (
                      <td
                        key={col.id}
                        style={{
                          padding: `2px ${D.padX}px`,
                          fontSize: D.fs,
                          borderRight: appearance.verticalBorders
                            ? "1px solid var(--fips-border)"
                            : "none",
                          whiteSpace: appearance.wrapText ? "normal" : "nowrap",
                        }}
                        className={cn(
                          "text-[var(--fips-fg)]",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                        )}
                      >
                        {col.render(row, { density })}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ───── CARDS VIEW ───── */}
      {view === "cards" && (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.length === 0 ? (
            <div className="col-span-full py-14 text-center text-sm text-[var(--fips-fg-muted)]">
              {emptyState ?? "Nenhum registro encontrado"}
            </div>
          ) : (
            data.map((row) => {
              const id = getRowId(row);
              const isSel = selected.has(id);
              return (
                <div
                  key={id}
                  onClick={() => toggleSel(id)}
                  className={cn(
                    "cursor-pointer rounded-[8px_8px_8px_14px] border p-3.5 transition-all",
                    isSel
                      ? "border-[var(--fips-primary)] bg-[var(--fips-primary)]/[0.08]"
                      : "border-[var(--fips-border)] bg-[var(--fips-surface)] hover:border-[var(--fips-border-strong)]",
                  )}
                >
                  {renderCard ? renderCard(row, { selected: isSel }) : (
                    <div className="text-sm text-[var(--fips-fg)]">
                      {visibleColumnList.map((col) => (
                        <div key={col.id} className="flex justify-between gap-3 py-1">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--fips-fg-muted)]">
                            {col.label}
                          </span>
                          <span className="text-right">{col.render(row, { density })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── HELPERS COMUNS DE CÉLULA ──────────────────────────── */

/** Código (ID) em azul mono — usar como render do col `id` */
export function CellCodigo({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono font-semibold text-[var(--fips-primary)]">{children}</span>
  );
}

/** Texto numérico monoespaçado, weight 700, azul escuro — bom para valores e pesos */
export function CellMonoStrong({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <span
      className={cn(
        "font-mono font-bold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]",
        align === "right" && "block text-right",
      )}
    >
      {children}
    </span>
  );
}

/** Texto monoespaçado normal, cor muted — bom para datas */
export function CellMonoMuted({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[var(--fips-fg-muted)]">{children}</span>;
}

/** Texto secundário (descrição/departamento) em cinza muted */
export function CellMuted({ children }: { children: ReactNode }) {
  return <span className="text-[var(--fips-fg-muted)]">{children}</span>;
}

/** Wrapper para ações inline (edit/more etc.) — botões transparentes 24x24 */
export function CellActions({ children }: { children: ReactNode }) {
  return <div className="inline-flex justify-center gap-0.5">{children}</div>;
}

export function CellActionButton({
  onClick,
  title,
  icon,
}: {
  onClick?: () => void;
  title: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--fips-fg-muted)] transition-colors hover:bg-[var(--fips-surface-soft)] hover:text-[var(--fips-fg)]"
    >
      {icon}
    </button>
  );
}

/** Sentinels comuns que usuários do componente podem importar e reaproveitar */
export const TableActionIcons = { Pencil, MoreHorizontal };
