import { useState, useRef, useEffect } from "react";
import { Filter as FilterIcon, Search as SearchIcon, Calendar as CalendarIcon, ChevronDown, X as XIcon, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface DataListingToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  /** Conteúdo do popover de Filtros (já renderizado pelo pai). Se omitido, o botão fica visível mas inerte. */
  filtersContent?: React.ReactNode;
  /** Quantidade de filtros ativos — mostra badge no botão Filtros */
  activeFilters?: number;
  /** Período atual (ex.: "Últimos 30 dias"). Se omitido, esconde o controle. */
  periodo?: string;
  onPeriodoChange?: (v: string) => void;
  periodoOptions?: string[];
  /** Callbacks dos exports — se omitidos, esconde o ícone correspondente */
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  /** Conteúdo extra renderizado na mesma linha da toolbar (ao lado da search pill). */
  extraContent?: React.ReactNode;
}

const DEFAULT_PERIODOS = [
  "Hoje",
  "Últimos 7 dias",
  "Últimos 30 dias",
  "Últimos 90 dias",
  "Este ano",
  "Todos",
];

/**
 * Toolbar canônica do Padrão Data Listing do FIPS DS (`/docs/patterns/data-listing`).
 *
 * Contém, em uma única linha:
 *  - Botão **Filtros** com counter (popover renderizado pelo pai)
 *  - **Search pill** com ícone de lupa, focus state azul, botão clear (×)
 *  - **Período** dropdown pill com calendário + chevron
 *  - flex spacer
 *  - Botões quadrados de export **Excel** e **PDF**
 *
 * Mantém o mesmo radius `8px`, mesma altura 35px e mesmo padding `7-12px` do canônico.
 */

/* Botão export DS FIPS — SVG custom com dark mode auto */
import { forwardRef } from "react";

const ExportButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void;
  lightColor: string;
  darkColor: string;
  children: (color: string) => React.ReactNode;
  "aria-label"?: string;
}>(({ onClick, lightColor, darkColor, children, ...props }, ref) => {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const c = isDark ? darkColor : lightColor;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34, borderRadius: 8, cursor: "pointer",
        background: "var(--fips-surface)",
        border: `1px solid ${isDark ? `${darkColor}40` : "var(--fips-border)"}`,
        transition: "all .15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${c}14`;
        e.currentTarget.style.borderColor = `${c}66`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "var(--fips-surface)";
        e.currentTarget.style.borderColor = isDark ? `${darkColor}40` : "var(--fips-border)";
      }}
      {...props}
    >
      {children(c)}
    </button>
  );
});

export function DataListingToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filtersContent,
  activeFilters = 0,
  periodo,
  onPeriodoChange,
  periodoOptions = DEFAULT_PERIODOS,
  onExportExcel,
  onExportPdf,
  extraContent,
}: DataListingToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const periodoRef = useRef<HTMLDivElement>(null);

  // fecha popovers ao clicar fora
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
      if (periodoRef.current && !periodoRef.current.contains(e.target as Node)) setShowPeriodo(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface)] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
          {/* Filtros */}
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-[7px] text-[11px] font-semibold transition-all",
                activeFilters > 0
                  ? "border-[var(--fips-primary)] bg-[var(--color-fips-blue-200)]/65 text-[var(--fips-primary)]"
                  : "border-[var(--fips-border)] bg-[var(--fips-surface)] text-[var(--fips-fg)] hover:border-[var(--fips-border-strong)]",
              )}
            >
              <FilterIcon className="h-[13px] w-[13px]" />
              Filtros
              {activeFilters > 0 && (
                <span className="rounded-md bg-[var(--fips-primary)] px-1.5 py-px font-mono text-[9px] text-white">
                  {activeFilters}
                </span>
              )}
            </button>
            {showFilters && filtersContent && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] rounded-[10px_10px_10px_16px] border border-[var(--fips-border)] bg-[var(--fips-surface)] shadow-[0_12px_36px_rgba(0,42,104,0.18),0_2px_8px_rgba(0,42,104,0.06)]">
                {filtersContent}
              </div>
            )}
          </div>

          {/* Search pill */}
          <div
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              input?.focus();
            }}
            className={cn(
              "flex h-[35px] min-w-[200px] max-w-[320px] flex-1 cursor-text items-center gap-2 rounded-lg border-[1.5px] bg-[var(--fips-surface)] px-3 transition-all",
              searchFocused
                ? "border-[var(--fips-primary)] shadow-[0_0_0_3px_var(--color-fips-blue-200)]"
                : "border-[#CBD5E1] dark:border-[var(--fips-border)]",
            )}
          >
            <SearchIcon className="h-[15px] w-[15px] flex-shrink-0 text-[var(--fips-fg-muted)] opacity-80" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[var(--fips-fg)] outline-none placeholder:text-[var(--fips-fg-muted)]"
            />
            {search && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange("");
                }}
                className="flex flex-shrink-0 cursor-pointer opacity-60 hover:opacity-100"
              >
                <XIcon className="h-[14px] w-[14px] text-[var(--fips-fg-muted)]" />
              </span>
            )}
          </div>

          {/* Extra content (toggles, etc.) */}
          {extraContent}

          {/* Período */}
          {periodo !== undefined && (
            <div ref={periodoRef} className="relative">
              <button
                type="button"
                onClick={() => setShowPeriodo(!showPeriodo)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border bg-[var(--fips-surface)] px-3 py-[7px] text-[11px] font-semibold transition-all",
                  showPeriodo
                    ? "border-[var(--fips-primary)]"
                    : "border-[var(--fips-border)] hover:border-[var(--fips-border-strong)]",
                )}
              >
                <CalendarIcon className="h-[13px] w-[13px] text-[var(--fips-fg-muted)]" />
                <span className="text-[var(--fips-fg-muted)]">Período:</span>
                <span className="font-bold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">
                  {periodo}
                </span>
                <ChevronDown
                  className={cn(
                    "h-[10px] w-[10px] transition-transform",
                    showPeriodo ? "rotate-180 text-[var(--fips-primary)]" : "text-[var(--fips-fg-muted)]",
                  )}
                />
              </button>
              {showPeriodo && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[240px] overflow-hidden rounded-[8px_8px_8px_14px] border border-[var(--fips-border)] bg-[var(--fips-surface)] py-1.5 shadow-[0_12px_36px_rgba(0,42,104,0.18),0_2px_8px_rgba(0,42,104,0.06)]">
                  {periodoOptions.map((opt) => {
                    const isActive = periodo === opt;
                    return (
                      <div
                        key={opt}
                        onClick={() => {
                          onPeriodoChange?.(opt);
                          setShowPeriodo(false);
                        }}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 px-3.5 py-2 text-[11px] transition-colors",
                          isActive
                            ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                            : "font-medium text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px]",
                            isActive ? "border-[var(--fips-primary)]" : "border-[var(--fips-border)]",
                          )}
                        >
                          {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[var(--fips-primary)]" />}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export buttons — ícones SVG DS FIPS */}
          {onExportExcel && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ExportButton
                  onClick={onExportExcel}
                  lightColor="#1D6F42"
                  darkColor="#8BE5AD"
                  aria-label="Exportar para Excel (.xlsx)"
                >
                  {(c: string) => (
                    <svg width={16} height={16} viewBox="0 0 20 20" fill="none">
                      <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" fill={c} fillOpacity=".08" stroke={c} strokeWidth="1.5"/>
                      <path d="M2.5 7h15M2.5 12h15M7.5 2.5v15M12.5 2.5v15" stroke={c} strokeWidth="1.1" opacity=".6"/>
                      <path d="M6.5 9.5l3 3M9.5 9.5l-3 3" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  )}
                </ExportButton>
              </TooltipTrigger>
              <TooltipContent side="top">Exportar para Excel (.xlsx)</TooltipContent>
            </Tooltip>
          )}
          {onExportPdf && (
            <Tooltip>
              <TooltipTrigger asChild>
                <ExportButton
                  onClick={onExportPdf}
                  lightColor="#DC3545"
                  darkColor="#DB2631"
                  aria-label="Exportar para PDF (.pdf)"
                >
                  {(c: string) => (
                    <svg width={16} height={16} viewBox="0 0 20 20" fill="none">
                      <path d="M5 2h7l4 4v12H5V2z" fill={c} fillOpacity=".08" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M12 2v4h4" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M7 11.5h2.2c.6 0 1 .4 1 1s-.4 1-1 1H7v1.5M11.5 11.5v3M11.5 11.5h1.5M11.5 13h1" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </ExportButton>
              </TooltipTrigger>
              <TooltipContent side="top">Exportar para PDF (.pdf)</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
