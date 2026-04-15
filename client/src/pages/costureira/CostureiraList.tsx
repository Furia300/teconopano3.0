import { useEffect, useState, useMemo } from "react";
import { Scissors, Plus, ArrowLeft, Weight, Truck, Eye } from "lucide-react";
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
import { NovoEnvioDialog } from "./NovoEnvioDialog";
import { RetornoCostureiraDialog } from "./RetornoCostureiraDialog";

const FIPS_COLORS = { azulProfundo: "#004B9B", verdeFloresta: "#00C64C", amareloEscuro: "#F6921E", azulEscuro: "#002A68" };

interface CostureiraEnvio {
  id: string; coletaId: string; coletaNumero: number; fornecedor: string;
  costureira: string; tipoMaterial: string; tipoMedida: string; status: string;
  dataEnvio: string | null; dataRetorno: string | null; motoristaEnvio: string;
  motoristaRetorno: string; qtdsSaidaKg: number; qtdsRetornoKg: number;
  qtdsPacotesRetorno: number; totalDifKg: number; residuos: number;
  assCostEntrega: string | null; assMotEntrega: string | null;
  assCostDevolucao: string | null; assMotDevolucao: string | null; observacao: string;
}

const STATUS_VARIANTS: Record<string, { label: string; variant: "warning" | "info" | "success" | "secondary" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  enviado: { label: "Enviado", variant: "info" },
  retornado: { label: "Retornado", variant: "success" },
};

const formatDate = (s: string | null) => s ? new Date(s).toLocaleDateString("pt-BR") : "—";
const formatKg = (n: number) => n ? `${n.toLocaleString("pt-BR")} kg` : "—";
const hasSig = (v: string | null) => !!v && v !== "null";

function SigDot({ label, value }: { label: string; value: string | null }) {
  const ok = hasSig(value);
  return (
    <div title={label} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${ok ? "bg-[#00C64C20] text-[#00C64C]" : "bg-[var(--fips-surface-soft)] text-[var(--fips-fg-muted)]"}`}>
      {label.split(" ").map(w => w[0]).join("")}
    </div>
  );
}

function costureiraColumns({ onRetorno }: { onRetorno: (e: CostureiraEnvio) => void }): DataListingColumn<CostureiraEnvio>[] {
  return [
    {
      id: "coleta", label: "Coleta", fixed: true, sortable: true, width: "70px",
      render: (e) => <CellMonoStrong>#{e.coletaNumero}</CellMonoStrong>,
    },
    {
      id: "costureira", label: "Costureira", fixed: true, sortable: true, width: "140px",
      render: (e) => (
        <div className="min-w-0 leading-tight">
          <div className="font-semibold text-[11px] text-[var(--fips-fg)] truncate max-w-[130px]">{e.costureira}</div>
          <div className="text-[9px] text-[var(--fips-fg-muted)]">{e.fornecedor}</div>
        </div>
      ),
    },
    {
      id: "material", label: "Material", sortable: true, width: "90px",
      render: (e) => <Badge variant="outline">{e.tipoMaterial}</Badge>,
    },
    {
      id: "envio", label: "Envio", sortable: true, width: "90px",
      render: (e) => (
        <div className="text-[11px]">
          <div className="font-mono font-semibold">{formatKg(e.qtdsSaidaKg)}</div>
          <CellMonoMuted>{formatDate(e.dataEnvio)}</CellMonoMuted>
        </div>
      ),
    },
    {
      id: "retorno", label: "Retorno", sortable: true, width: "100px",
      render: (e) => e.status === "retornado" ? (
        <div className="text-[11px]">
          <div className="font-mono font-semibold">{formatKg(e.qtdsRetornoKg)}</div>
          <CellMonoMuted>{formatDate(e.dataRetorno)}</CellMonoMuted>
          <div className="text-[9px] text-[var(--fips-fg-muted)]">{e.qtdsPacotesRetorno} pct</div>
        </div>
      ) : <CellMuted>—</CellMuted>,
    },
    {
      id: "motorista", label: "Motorista", width: "110px",
      render: (e) => (
        <div className="text-[10px] space-y-0.5">
          {e.motoristaEnvio && <div className="flex items-center gap-1"><Truck className="h-3 w-3 text-[var(--fips-fg-muted)]" /><span>Ida: {e.motoristaEnvio}</span></div>}
          {e.motoristaRetorno && <div className="flex items-center gap-1"><Truck className="h-3 w-3 text-[var(--fips-fg-muted)]" /><span>Volta: {e.motoristaRetorno}</span></div>}
          {!e.motoristaEnvio && !e.motoristaRetorno && <CellMuted>—</CellMuted>}
        </div>
      ),
    },
    {
      id: "assinaturas", label: "Assinaturas", width: "100px", align: "center",
      render: (e) => (
        <div className="flex gap-1 justify-center">
          <SigDot label="Costureira Entrega" value={e.assCostEntrega} />
          <SigDot label="Motorista Entrega" value={e.assMotEntrega} />
          <SigDot label="Costureira Devolução" value={e.assCostDevolucao} />
          <SigDot label="Motorista Devolução" value={e.assMotDevolucao} />
        </div>
      ),
    },
    {
      id: "difResiduo", label: "Dif/Resíduo", width: "80px", align: "right",
      render: (e) => (e.totalDifKg !== 0 || e.residuos > 0) ? (
        <div className="text-right text-[11px]">
          {e.totalDifKg !== 0 && <div className="font-semibold text-[var(--fips-danger)]">Dif: {e.totalDifKg} kg</div>}
          {e.residuos > 0 && <div className="text-[var(--fips-fg-muted)]">Res: {e.residuos} kg</div>}
        </div>
      ) : <CellMuted>—</CellMuted>,
    },
    {
      id: "status", label: "Status", sortable: true, width: "90px",
      render: (e) => { const s = STATUS_VARIANTS[e.status]; return <Badge variant={s?.variant || "secondary"} dot>{s?.label || e.status}</Badge>; },
    },
    {
      id: "actions", label: "Ações", fixed: true, align: "center", width: "60px",
      render: (e) => (
        <CellActions>
          {e.status === "enviado" && (
            <CellActionButton title="Registrar retorno" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => onRetorno(e)} />
          )}
        </CellActions>
      ),
    },
  ];
}

export default function CostureiraList() {
  const [envios, setEnvios] = useState<CostureiraEnvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [retornoItem, setRetornoItem] = useState<CostureiraEnvio | null>(null);

  const fetchEnvios = async () => {
    try { const res = await fetch("/api/costureira"); setEnvios(await res.json()); }
    catch { console.error("Erro ao buscar envios costureira"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchEnvios(); }, []);

  const stats = useMemo(() => ({
    total: envios.length,
    enviados: envios.filter(e => e.status === "enviado").length,
    pesoTransito: envios.filter(e => e.status === "enviado").reduce((a, e) => a + e.qtdsSaidaKg, 0),
    residuo: envios.reduce((a, e) => a + e.residuos, 0),
  }), [envios]);

  const filtered = useMemo(() => envios.filter(e => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || e.costureira.toLowerCase().includes(q) || e.fornecedor.toLowerCase().includes(q) || e.tipoMaterial.toLowerCase().includes(q) || String(e.coletaNumero).includes(q);
    const matchStatus = !filterStatus || e.status === filterStatus;
    return matchSearch && matchStatus;
  }), [envios, search, filterStatus]);

  const activeFilters = filterStatus ? 1 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Costureira"
        description="Envio e retorno de material para costura (CLT interna + terceirizadas)"
        icon={Scissors}
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Envio</Button>}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Enviados", value: stats.enviados, color: "#FDC24E" },
          { label: "Em Trânsito", value: `${stats.pesoTransito.toLocaleString("pt-BR")}kg`, color: "#00C64C" },
          { label: "Resíduo", value: `${stats.residuo.toLocaleString("pt-BR")}kg`, color: "#ed1b24" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Envios" value={stats.total} subtitle="Registrados no sistema" icon={Scissors} color={FIPS_COLORS.azulProfundo} />
        <StatsCard label="Aguardando Retorno" value={stats.enviados} subtitle="Material na costureira" icon={Weight} color={FIPS_COLORS.amareloEscuro} />
        <StatsCard label="Peso em Trânsito" value={`${stats.pesoTransito.toLocaleString("pt-BR")} kg`} subtitle="Soma dos enviados" icon={Truck} color={FIPS_COLORS.verdeFloresta} />
        <StatsCard label="Resíduo Total" value={`${stats.residuo.toLocaleString("pt-BR")} kg`} subtitle="Perda acumulada" icon={Weight} color={FIPS_COLORS.azulEscuro} />
      </div>

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por costureira, fornecedor, material..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Status</p>
              <div className="flex flex-col gap-1">
                {[{ v: "", l: "Todos" }, { v: "pendente", l: "Pendente" }, { v: "enviado", l: "Enviado" }, { v: "retornado", l: "Retornado" }].map(opt => (
                  <button key={opt.v || "all"} onClick={() => setFilterStatus(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${filterStatus === opt.v ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]" : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
      />

      <DataListingTable<CostureiraEnvio>
        icon={<Scissors className="h-[22px] w-[22px]" />}
        title="Envios Costureira"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${activeFilters || search ? "filtrados" : "no total"} · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(e) => e.id}
        emptyState={loading ? "Carregando..." : "Nenhum envio de costureira encontrado"}
        columns={costureiraColumns({ onRetorno: setRetornoItem })}
      />

      <NovoEnvioDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchEnvios} />
      {retornoItem && (
        <RetornoCostureiraDialog envio={retornoItem} open={!!retornoItem} onOpenChange={v => { if (!v) setRetornoItem(null); }} onSuccess={fetchEnvios} />
      )}
    </div>
  );
}
