import { useEffect, useMemo, useState } from "react";
import { Users, Plus, Search, Wifi, WifiOff, Truck, Scissors, Warehouse, Edit, Trash2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { FipsDataListingKpiCard, fipsListingSparkFromSeed } from "@/components/domain/FipsDataListingKpiCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/composites/PageHero";
import { AdminTableColumnMenu, AdminTablePagination, AdminTableSortHeader } from "@/components/ui/admin-listing";
import { cn } from "@/lib/utils";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty,
} from "@/components/ui/table";
import { ColaboradorDialog } from "./ColaboradorDialog";

interface Colaborador {
  id: number;
  cpf: string;
  name: string;
  registration: string;
  departamento: string;
  idDepartment: number;
  status: number;
  fonte: "rhid" | "local" | "rhid+local";
}

interface ColaboradoresResponse {
  fonte: "rhid" | "local";
  colaboradores: Colaborador[];
}

export default function FuncionariosList() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [fonte, setFonte] = useState<"rhid" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDepto, setFilterDepto] = useState("");
  const [tab, setTab] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Colaborador | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<{ col: "name" | "cpf" | "registration" | "departamento" | "status" | "fonte"; dir: "asc" | "desc" }>({
    col: "name",
    dir: "asc",
  });
  const [columnOrder, setColumnOrder] = useState<string[]>(["colaborador", "cpf", "matricula", "departamento", "status", "fonte", "acoes"]);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    colaborador: true,
    cpf: true,
    matricula: true,
    departamento: true,
    status: true,
    fonte: true,
    acoes: true,
  });

  const fetchColaboradores = async () => {
    try {
      const res = await fetch("/api/colaboradores");
      const data: ColaboradoresResponse = await res.json();
      setColaboradores(data.colaboradores);
      setFonte(data.fonte);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchColaboradores(); }, []);

  const departamentos = [...new Set(colaboradores.map((c) => c.departamento).filter(Boolean))].sort();

  const filtered = colaboradores.filter((c) => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search.replace(/\D/g, "")) ||
      c.registration.toLowerCase().includes(search.toLowerCase());
    const matchDepto = !filterDepto || c.departamento === filterDepto;
    const matchTab = tab === "todos" ||
      (tab === "motorista" && c.departamento.toLowerCase().includes("motorista")) ||
      (tab === "galpao" && c.departamento.toLowerCase().includes("galp")) ||
      (tab === "costura" && c.departamento.toLowerCase().includes("costur"));
    return matchSearch && matchDepto && matchTab;
  });

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortBy.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const av = sortBy.col === "status" ? String(a.status) : String((a as any)[sortBy.col] ?? "");
      const bv = sortBy.col === "status" ? String(b.status) : String((b as any)[sortBy.col] ?? "");
      return av.localeCompare(bv, "pt-BR", { numeric: true, sensitivity: "base" }) * dir;
    });
    return arr;
  }, [filtered, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paged = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [search, filterDepto, tab, itemsPerPage]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const stats = {
    total: colaboradores.length,
    motoristas: colaboradores.filter((c) => c.departamento.toLowerCase().includes("motorista")).length,
    galpao: colaboradores.filter((c) => c.departamento.toLowerCase().includes("galp")).length,
    costura: colaboradores.filter((c) => c.departamento.toLowerCase().includes("costur")).length,
  };

  const formatCPF = (cpf: string) => {
    const d = cpf.replace(/\D/g, "").padStart(11, "0");
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const deptoIcon = (depto: string) => {
    const d = depto.toLowerCase();
    if (d.includes("motorista")) return <Truck className="h-3 w-3" />;
    if (d.includes("costur")) return <Scissors className="h-3 w-3" />;
    return <Warehouse className="h-3 w-3" />;
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetchColaboradores();
    setSyncing(false);
    toast.success(fonte === "rhid" ? "Sincronizado com RHiD!" : "Dados locais atualizados");
  };

  const openNew = () => { setEditItem(null); setDialogOpen(true); };
  const openEdit = (c: Colaborador) => { setEditItem(c); setDialogOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este colaborador? Isso também removerá do RHiD se estiver conectado.")) return;
    await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
    toast.success("Colaborador excluído");
    fetchColaboradores();
  };

  const toggleSort = (col: typeof sortBy.col) => {
    setSortBy((s) =>
      s.col === col
        ? { col, dir: s.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" },
    );
  };

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

  const allColumns = [
    { id: "colaborador", label: "Colaborador" },
    { id: "cpf", label: "CPF" },
    { id: "matricula", label: "Matrícula" },
    { id: "departamento", label: "Departamento" },
    { id: "status", label: "Status" },
    { id: "fonte", label: "Fonte" },
    { id: "acoes", label: "Ações" },
  ];

  const orderedVisibleColumns = columnOrder.filter((id) => visibleColumns[id] ?? true);

  const pctOfTotal = (n: number) => (stats.total > 0 ? `${Math.round((n / stats.total) * 100)}%` : "0%");
  const isFiltered = Boolean(search || filterDepto || tab !== "todos");

  return (
    <div className="space-y-6">
      <PageHero className="rounded-[12px_12px_12px_24px] border border-white/10 shadow-[0_4px_20px_rgba(0,42,104,0.12)]" decorationSrc="" showTrainSilhouette={false}>
        <div className="relative flex flex-wrap items-center gap-3 p-[18px] sm:gap-4 sm:p-[22px]">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#FDC24E]/30 bg-[#FDC24E]/18 sm:h-11 sm:w-11"
            aria-hidden
          >
            <Users className="h-5 w-5 text-[#FDC24E] sm:h-[22px] sm:w-[22px]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-[17px] font-bold tracking-tight text-white sm:text-[21px]">RH · Colaboradores</h2>
            <p className="mt-1 max-w-2xl text-[11px] leading-snug text-white/65 sm:text-xs">
              Quadro de colaboradores e vínculos com o RHiD — padrão visual Data List do DS-FIPS (header → KPIs → toolbar → tabela).
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Badge variant={fonte === "rhid" ? "success" : "warning"} className="border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">
              {fonte === "rhid" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {fonte === "rhid" ? "RHiD" : "Local"}
            </Badge>
            <Button variant="secondary" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar
            </Button>
            <Button size="sm" onClick={openNew} className="shadow-sm">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>
        </div>
      </PageHero>

      {fonte === "local" && (
        <Card className="rounded-[10px_10px_10px_18px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
          <CardContent className="flex items-start gap-3 py-4">
            <WifiOff className="h-5 w-5 text-[var(--fips-warning)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--fips-fg)]">API RHiD não configurada</p>
              <p className="text-xs text-[var(--fips-fg-muted)] mt-0.5">
                Cadastros feitos aqui serão salvos localmente. Quando o RHiD for configurado, novos cadastros serão enviados automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {fonte === "rhid" && (
        <Card className="rounded-[10px_10px_10px_18px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
          <CardContent className="flex items-start gap-3 py-4">
            <Wifi className="h-5 w-5 text-[var(--fips-success)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--fips-fg)]">Sincronização Bidirecional Ativa</p>
              <p className="text-xs text-[var(--fips-fg-muted)] mt-0.5">
                Alterações feitas aqui são enviadas para o RHiD. Alterações no RHiD aparecem aqui ao sincronizar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2.5 md:gap-3.5 xl:grid-cols-4">
        <FipsDataListingKpiCard
          label="Total de colaboradores"
          value={stats.total}
          delta={stats.total ? `+${Math.min(99, 12 + (stats.total % 7))}%` : "0%"}
          icon={Users}
          accent="blue"
          spark={fipsListingSparkFromSeed(11 + stats.total)}
        />
        <FipsDataListingKpiCard
          label="Motoristas"
          value={stats.motoristas}
          delta={pctOfTotal(stats.motoristas)}
          icon={Truck}
          accent="amber"
          spark={fipsListingSparkFromSeed(23 + stats.motoristas)}
        />
        <FipsDataListingKpiCard
          label="Galpão"
          value={stats.galpao}
          delta={pctOfTotal(stats.galpao)}
          icon={Warehouse}
          accent="teal"
          spark={fipsListingSparkFromSeed(37 + stats.galpao)}
        />
        <FipsDataListingKpiCard
          label="Costura"
          value={stats.costura}
          delta={pctOfTotal(stats.costura)}
          icon={Scissors}
          accent="green"
          spark={fipsListingSparkFromSeed(53 + stats.costura)}
        />
      </div>

      <Card className="overflow-visible rounded-[10px_10px_10px_18px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
        <CardContent className="flex flex-wrap items-center gap-2.5 p-[14px] sm:gap-3 sm:px-[18px] sm:py-3.5">
          <div className="flex w-full min-w-0 sm:w-auto">
            <div className="flex flex-wrap gap-0.5 rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] p-0.5">
              {(
                [
                  { id: "todos" as const, label: `Todos (${stats.total})` },
                  { id: "motorista" as const, label: `Motoristas (${stats.motoristas})` },
                  { id: "galpao" as const, label: `Galpão (${stats.galpao})` },
                  { id: "costura" as const, label: `Costura (${stats.costura})` },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                    tab === id
                      ? "bg-[var(--fips-surface)] text-[var(--fips-primary)] shadow-[0_1px_2px_rgba(0,42,104,0.08)]"
                      : "text-[var(--fips-fg-muted)] hover:text-[var(--fips-fg)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            role="search"
            onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()}
            className={cn(
              "flex h-9 min-w-[200px] flex-1 cursor-text items-center gap-2 rounded-lg border bg-[var(--fips-surface)] px-3 transition-all duration-150 sm:max-w-[320px]",
              searchFocused ? "border-[var(--fips-primary)] shadow-[0_0_0_3px_var(--color-fips-sky-100)]" : "border-[#CBD5E1] dark:border-[var(--fips-border)]",
            )}
            style={{ borderWidth: "1.5px" }}
          >
            <Search className="h-4 w-4 shrink-0 opacity-60 text-[var(--fips-fg-muted)]" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Buscar por nome, CPF ou matrícula..."
              className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[13px] text-[var(--fips-fg)] outline-none placeholder:text-[var(--fips-fg-muted)]"
            />
            {search ? (
              <button
                type="button"
                className="flex shrink-0 text-[var(--fips-fg-muted)] hover:text-[var(--fips-fg)]"
                aria-label="Limpar busca"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch("");
                }}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="w-full sm:w-auto sm:min-w-[11rem]">
            <Select density="compact" value={filterDepto} onChange={(e) => setFilterDepto(e.target.value)} aria-label="Departamento">
              <option value="">Todos os departamentos</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-visible rounded-[12px_12px_12px_24px] shadow-[0_1px_3px_rgba(0,75,155,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[var(--fips-border)] px-5 py-4 sm:flex-row sm:items-center sm:gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[var(--fips-primary)]/15 bg-[var(--fips-primary)]/[0.06]">
            <Users className="h-6 w-6 text-[var(--fips-primary)]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-bold text-[var(--fips-fg)]">Colaboradores</h3>
            <p className="mt-0.5 text-[11px] text-[var(--fips-fg-muted)]">
              {sorted.length} {sorted.length === 1 ? "registro" : "registros"} {isFiltered ? "filtrados" : "no quadro"}
              {loading ? "" : " · atualizado agora"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
            {isFiltered ? (
              <span className="rounded-xl bg-[var(--color-fips-sky-100)] px-2.5 py-1 font-heading text-[10px] font-bold tracking-wide text-[var(--fips-primary)] uppercase dark:bg-[var(--fips-primary)]/20 dark:text-[var(--color-fips-sky-200)]">
                Filtrado
              </span>
            ) : null}
            <AdminTableColumnMenu
              buttonLabel="Configurar"
              columns={allColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={onToggleColumn}
              onReorderColumn={onReorderColumn}
            />
          </div>
        </div>

        <Table framed={false}>
          <TableHeader className="bg-[var(--fips-surface-muted)]">
            <TableRow className="hover:bg-transparent">
              {orderedVisibleColumns.includes("colaborador") && (
                <TableHead className="!h-auto !px-3 !py-2 align-middle">
                  <AdminTableSortHeader
                    className="!gap-1 !text-[9px] !font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase hover:text-[var(--fips-fg)]"
                    label="Colaborador"
                    active={sortBy.col === "name"}
                    direction={sortBy.dir}
                    onClick={() => toggleSort("name")}
                  />
                </TableHead>
              )}
              {orderedVisibleColumns.includes("cpf") && (
                <TableHead className="!h-auto !px-3 !py-2 align-middle">
                  <AdminTableSortHeader
                    className="!gap-1 !text-[9px] !font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase hover:text-[var(--fips-fg)]"
                    label="CPF"
                    active={sortBy.col === "cpf"}
                    direction={sortBy.dir}
                    onClick={() => toggleSort("cpf")}
                  />
                </TableHead>
              )}
              {orderedVisibleColumns.includes("matricula") && (
                <TableHead className="!h-auto !px-3 !py-2 align-middle">
                  <AdminTableSortHeader
                    className="!gap-1 !text-[9px] !font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase hover:text-[var(--fips-fg)]"
                    label="Matrícula"
                    active={sortBy.col === "registration"}
                    direction={sortBy.dir}
                    onClick={() => toggleSort("registration")}
                  />
                </TableHead>
              )}
              {orderedVisibleColumns.includes("departamento") && (
                <TableHead className="!h-auto !px-3 !py-2 align-middle">
                  <AdminTableSortHeader
                    className="!gap-1 !text-[9px] !font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase hover:text-[var(--fips-fg)]"
                    label="Departamento"
                    active={sortBy.col === "departamento"}
                    direction={sortBy.dir}
                    onClick={() => toggleSort("departamento")}
                  />
                </TableHead>
              )}
              {orderedVisibleColumns.includes("status") && (
                <TableHead className="!h-auto !px-3 !py-2 align-middle">
                  <AdminTableSortHeader
                    className="!gap-1 !text-[9px] !font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase hover:text-[var(--fips-fg)]"
                    label="Status"
                    active={sortBy.col === "status"}
                    direction={sortBy.dir}
                    onClick={() => toggleSort("status")}
                  />
                </TableHead>
              )}
              {orderedVisibleColumns.includes("fonte") && (
                <TableHead className="!h-auto !px-3 !py-2 align-middle">
                  <AdminTableSortHeader
                    className="!gap-1 !text-[9px] !font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase hover:text-[var(--fips-fg)]"
                    label="Fonte"
                    active={sortBy.col === "fonte"}
                    direction={sortBy.dir}
                    onClick={() => toggleSort("fonte")}
                  />
                </TableHead>
              )}
              {orderedVisibleColumns.includes("acoes") && (
                <TableHead className="!h-auto !px-3 !py-2 text-right align-middle font-heading text-[9px] font-bold tracking-[0.08em] text-[var(--fips-fg-muted)] uppercase">
                  Ações
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableEmpty colSpan={orderedVisibleColumns.length} title="Carregando..." /> :
             sorted.length === 0 ? <TableEmpty colSpan={orderedVisibleColumns.length} /> :
             paged.map((colab, rowIdx) => (
              <TableRow
                key={`${colab.fonte}-${colab.id}`}
                className={rowIdx % 2 === 1 ? "bg-[var(--color-fips-sky-50)]/55 dark:bg-white/[0.04]" : undefined}
              >
                {orderedVisibleColumns.includes("colaborador") && (
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-fips-blue-100)] flex items-center justify-center text-[var(--fips-secondary)] font-bold text-xs">
                        {colab.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium">{colab.name}</span>
                    </div>
                  </TableCell>
                )}
                {orderedVisibleColumns.includes("cpf") && <TableCell className="font-mono text-sm">{formatCPF(colab.cpf)}</TableCell>}
                {orderedVisibleColumns.includes("matricula") && <TableCell>{colab.registration || "—"}</TableCell>}
                {orderedVisibleColumns.includes("departamento") && (
                  <TableCell>
                    {colab.departamento ? (
                      <Badge variant="outline" className="gap-1">
                        {deptoIcon(colab.departamento)}
                        {colab.departamento}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                )}
                {orderedVisibleColumns.includes("status") && (
                  <TableCell>
                    <Badge variant={colab.status === 1 ? "success" : "danger"} dot>
                      {colab.status === 1 ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                )}
                {orderedVisibleColumns.includes("fonte") && (
                  <TableCell>
                    <Badge variant={colab.fonte === "rhid" ? "info" : colab.fonte === "rhid+local" ? "success" : "secondary"} className="text-[10px]">
                      {colab.fonte === "rhid" ? "RHiD" : colab.fonte === "rhid+local" ? "Sync" : "Local"}
                    </Badge>
                  </TableCell>
                )}
                {orderedVisibleColumns.includes("acoes") && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="iconSm" onClick={() => openEdit(colab)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="iconSm" onClick={() => handleDelete(colab.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
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

      <ColaboradorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
        fonte={fonte}
        onSuccess={fetchColaboradores}
      />
    </div>
  );
}
