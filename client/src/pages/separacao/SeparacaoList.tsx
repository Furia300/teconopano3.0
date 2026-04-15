import { useEffect, useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  QrCode,
  Factory,
  Droplets,
  Scissors,
  Gift,
  Trash2,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import {
  DataListingTable,
  type DataListingColumn,
  CellMonoStrong,
  CellMonoMuted,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NovaSeparacaoDialog } from "./NovaSeparacaoDialog";

/* ─── Cores FIPS DS canônicas para os Cards Relatório ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

/* ─── Tipos ─── */
interface Separacao {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  tipoMaterial: string;
  cor: string;
  peso: number;
  destino: string;
  colaborador: string;
  data: string;
}

const destinoConfig: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "info" | "danger" | "secondary"; icon: typeof Factory }
> = {
  producao: { label: "Produção", variant: "info", icon: Factory },
  repanol: { label: "Repanol", variant: "warning", icon: Droplets },
  costureira: { label: "Costureira", variant: "default", icon: Scissors },
  doacao: { label: "Doação", variant: "success", icon: Gift },
  descarte: { label: "Descarte", variant: "danger", icon: Trash2 },
};

const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

/* ─── Componente principal ─── */
export default function SeparacaoList() {
  const [separacoes, setSeparacoes] = useState<Separacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterDestino, setFilterDestino] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchSeparacoes = async () => {
    try {
      const res = await fetch("/api/separacoes");
      const data = await res.json();
      setSeparacoes(data);
    } catch (err) {
      console.error("Erro ao buscar separações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeparacoes();
  }, []);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    const total = separacoes.length;
    const pesoTotal = separacoes.reduce((acc, s) => acc + s.peso, 0);
    const producao = separacoes.filter((s) => s.destino === "producao").length;
    const repanol = separacoes.filter((s) => s.destino === "repanol").length;
    return { total, pesoTotal, producao, repanol };
  }, [separacoes]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    return separacoes.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.fornecedor.toLowerCase().includes(q) ||
        s.tipoMaterial.toLowerCase().includes(q) ||
        String(s.coletaNumero).includes(q);
      const matchDestino = !filterDestino || s.destino === filterDestino;
      const matchMaterial = !filterMaterial || s.tipoMaterial === filterMaterial;
      return matchSearch && matchDestino && matchMaterial;
    });
  }, [separacoes, search, filterDestino, filterMaterial]);

  const activeFilters = [filterDestino, filterMaterial].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Separação"
        description="Triagem e classificação do material recebido"
        icon={ClipboardList}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Peso Total", value: `${stats.pesoTotal.toLocaleString("pt-BR")}kg`, color: "#00C64C" },
          { label: "Produção", value: stats.producao, color: "#FDC24E" },
          { label: "Repanol", value: stats.repanol, color: "#ed1b24" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4" />
              Ler QR Code
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova Separação
            </Button>
          </div>
        }
      />

      {/* ─── Cards Relatório — padrão FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Separações"
          value={stats.total}
          subtitle="Registros cadastrados"
          icon={ClipboardList}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Peso Total"
          value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`}
          subtitle="Peso total separado"
          icon={ClipboardList}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Para Produção"
          value={stats.producao}
          subtitle="Destinados à produção"
          icon={Factory}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Para Repanol"
          value={stats.repanol}
          subtitle="Destinados ao Repanol"
          icon={Droplets}
          color={FIPS_COLORS.azulEscuro}
        />
      </div>

      {/* ─── Toolbar — padrão FIPS DS Data Listing ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por fornecedor, material ou nº coleta..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            {/* Destino */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Destino
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todos os destinos" },
                  { v: "producao", l: "Produção" },
                  { v: "repanol", l: "Repanol" },
                  { v: "costureira", l: "Costureira" },
                  { v: "doacao", l: "Doação" },
                  { v: "descarte", l: "Descarte" },
                ].map((opt) => (
                  <button
                    key={opt.v || "todos-destino"}
                    onClick={() => setFilterDestino(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterDestino === opt.v
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo Material */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Tipo Material
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFilterMaterial("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filterMaterial
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todos os materiais
                </button>
                {TIPOS_MATERIAL.map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMaterial(m)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterMaterial === m
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel — placeholder")}
        onExportPdf={() => alert("Export PDF — placeholder")}
      />

      {/* ─── Tabela canônica DS-FIPS — Data Listing ─── */}
      <DataListingTable<Separacao>
        icon={<ClipboardList className="h-[22px] w-[22px]" />}
        title="Separação"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(s) => s.id}
        emptyState={
          loading
            ? "Carregando..."
            : "Nenhuma separação encontrada"
        }
        columns={separacaoColumns()}
      />

      <NovaSeparacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchSeparacoes}
        tiposMaterial={TIPOS_MATERIAL}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} kg` : "—";

function separacaoColumns(): DataListingColumn<Separacao>[] {
  return [
    {
      id: "coleta",
      label: "Coleta",
      fixed: true,
      sortable: true,
      width: "80px",
      render: (s) => <CellMonoStrong>#{s.coletaNumero}</CellMonoStrong>,
    },
    {
      id: "fornecedor",
      label: "Fornecedor",
      sortable: true,
      width: "160px",
      render: (s) => (
        <div className="truncate max-w-[150px]" title={s.fornecedor}>
          <span className="text-[11px] font-semibold text-[var(--fips-fg)]">{s.fornecedor}</span>
        </div>
      ),
    },
    {
      id: "tipoMaterial",
      label: "Material",
      sortable: true,
      width: "120px",
      render: (s) => <Badge variant="outline">{s.tipoMaterial}</Badge>,
    },
    {
      id: "cor",
      label: "Cor",
      sortable: true,
      width: "90px",
      render: (s) => <CellMuted>{s.cor}</CellMuted>,
    },
    {
      id: "peso",
      label: "Peso",
      sortable: true,
      align: "right",
      width: "90px",
      render: (s) => <CellMonoStrong align="right">{formatKg(s.peso)}</CellMonoStrong>,
    },
    {
      id: "destino",
      label: "Destino",
      sortable: true,
      width: "100px",
      render: (s) => {
        const dc = destinoConfig[s.destino] || {
          label: s.destino,
          variant: "secondary" as const,
        };
        return <Badge variant={dc.variant} dot>{dc.label}</Badge>;
      },
    },
    {
      id: "colaborador",
      label: "Colaborador",
      sortable: true,
      width: "130px",
      render: (s) => <CellMuted>{s.colaborador}</CellMuted>,
    },
    {
      id: "data",
      label: "Data",
      sortable: true,
      width: "80px",
      render: (s) => <CellMonoMuted>{formatDateBR(s.data)}</CellMonoMuted>,
    },
    {
      id: "actions",
      label: "Ação",
      fixed: true,
      align: "center",
      width: "50px",
      render: (s) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            icon={<Eye className="h-3.5 w-3.5 text-[var(--fips-primary)]" />}
            onClick={() => {}}
          />
        </CellActions>
      ),
    },
  ];
}
