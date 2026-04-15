import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  ClipboardList, QrCode, Package, Scale, AlertTriangle, ArrowDownUp,
  CheckCircle2, ChevronLeft, Weight, Plus, Eye, User,
  Factory, Scissors, Droplets, Trash2, Gift,
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";

/* ─── Cores FIPS DS canônicas ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
  danger: "#DC3545",
  gold: "#FDC24E",
};

/* ─── Constants ─── */
const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

const DESTINOS = [
  { value: "producao", label: "Produção", variant: "info" as const, color: "#004B9B", icon: Factory },
  { value: "costureira", label: "Costureira", variant: "warning" as const, color: "#F6921E", icon: Scissors },
  { value: "repanol", label: "Repanol", variant: "secondary" as const, color: "#9B59B6", icon: Droplets },
  { value: "descarte", label: "Descarte", variant: "danger" as const, color: "#DC3545", icon: Trash2 },
  { value: "doacao", label: "Doação", variant: "success" as const, color: "#00C64C", icon: Gift },
];

const destinoMap = Object.fromEntries(DESTINOS.map(d => [d.value, d]));

/* ─── Types ─── */
interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  razaoSocial: string;
  fornecedor: string;
  notaFiscal: string | null;
  pesoTotalNF: number | null;
  pesoTotalAtual: number | null;
  status: string;
  dataColeta: string;
}

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

interface QRCode {
  id: string;
  codigo: string;
  coletaId: string;
  separacaoId: string;
  tipoMaterial: string;
  cor: string;
  peso: number;
  destino: string;
}

/* ─── Helpers ─── */
const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n != null && n > 0 ? `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg` : "—";

/* ─── Status helpers ─── */
const STATUS_VARIANTS: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  recebido: { label: "Recebido", variant: "info" },
  em_triagem: { label: "Em Triagem", variant: "info" },
  triada: { label: "Triada", variant: "success" },
};

function getStatusInfo(s: string) {
  const key = s?.toLowerCase().replace(/ /g, "_") || "pendente";
  return STATUS_VARIANTS[key] || { label: s || "Pendente", variant: "secondary" as const };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function SeparacaoList() {
  const me = useAppAuthMe();

  /* ─── State 1: listing ─── */
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFornecedor, setFilterFornecedor] = useState("");

  /* ─── State 2: triagem panel ─── */
  const [selectedColetaId, setSelectedColetaId] = useState<string | null>(null);
  const [separacoes, setSeparacoes] = useState<Separacao[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* Pesagem form */
  const [pesoNF, setPesoNF] = useState("");
  const [pesoAtual, setPesoAtual] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [savingPesagem, setSavingPesagem] = useState(false);

  /* Trouxa form */
  const [tipoMaterial, setTipoMaterial] = useState("");
  const [cor, setCor] = useState("");
  const [peso, setPeso] = useState("");
  const [destino, setDestino] = useState("");
  const [savingTrouxa, setSavingTrouxa] = useState(false);

  /* Produtos para cascata material → cor/medida */
  const [produtos, setProdutos] = useState<{ tipoMaterial: string; cor: string; medida: string; pesoMedio: number }[]>([]);
  useEffect(() => {
    fetch("/api/produtos").then(r => r.json())
      .then((data: any[]) => setProdutos(data.map((p: any) => ({ tipoMaterial: (p.tipoMaterial || "").trim(), cor: (p.cor || "").trim(), medida: (p.medida || "").trim(), pesoMedio: p.pesoMedio || 0 }))))
      .catch(() => {});
  }, []);

  /* Tipos de material únicos dos produtos (normalizados) */
  const tiposFromProdutos = useMemo(() => {
    const raw = [...new Set(produtos.map(p => p.tipoMaterial).filter(Boolean))];
    // Normalizar: trim espaços duplos, capitalizar
    return raw.map(t => t.replace(/\s+/g, " ").trim()).filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [produtos]);
  /* Cores filtradas pelo material selecionado */
  const coresDoMaterial = useMemo(() => {
    if (!tipoMaterial) return [];
    // Match flexível: ignora espaços extras
    const norm = tipoMaterial.replace(/\s+/g, " ").trim().toLowerCase();
    return [...new Set(
      produtos
        .filter(p => p.tipoMaterial.replace(/\s+/g, " ").trim().toLowerCase() === norm)
        .map(p => p.cor)
        .filter(Boolean)
    )].sort();
  }, [produtos, tipoMaterial]);

  /* ─── Fetch coletas ─── */
  const fetchColetas = useCallback(async () => {
    try {
      const res = await fetch("/api/coletas");
      const data = await res.json();
      setColetas(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar coletas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColetas(); }, [fetchColetas]);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    const total = coletas.length;
    const pendentes = coletas.filter(c => {
      const s = c.status?.toLowerCase();
      return !s || s === "pendente" || s === "agendado";
    }).length;
    const emTriagem = coletas.filter(c => {
      const s = c.status?.toLowerCase();
      return s === "em_triagem" || s === "recebido";
    }).length;
    const pesoTotal = coletas.reduce((acc, c) => acc + (c.pesoTotalNF ?? 0), 0);
    return { total, pendentes, emTriagem, pesoTotal };
  }, [coletas]);

  /* ─── Fornecedores únicos para filtro ─── */
  const fornecedoresUnicos = useMemo(() => {
    const set = new Set<string>();
    coletas.forEach(c => {
      const nome = c.nomeFantasia || c.fornecedor;
      if (nome) set.add(nome);
    });
    return Array.from(set).sort();
  }, [coletas]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    return coletas.filter(c => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(c.numero).includes(q) ||
        (c.nomeFantasia ?? "").toLowerCase().includes(q) ||
        (c.razaoSocial ?? "").toLowerCase().includes(q) ||
        (c.fornecedor ?? "").toLowerCase().includes(q) ||
        (c.notaFiscal ?? "").toLowerCase().includes(q);
      const matchStatus = !filterStatus || c.status?.toLowerCase().replace(/ /g, "_") === filterStatus;
      const matchFornecedor = !filterFornecedor || (c.nomeFantasia || c.fornecedor) === filterFornecedor;
      return matchSearch && matchStatus && matchFornecedor;
    });
  }, [coletas, search, filterStatus, filterFornecedor]);

  const activeFilters = [filterStatus, filterFornecedor].filter(Boolean).length;

  /* ─── Open coleta detail ─── */
  const openColeta = useCallback(async (coletaId: string) => {
    setSelectedColetaId(coletaId);
    setLoadingDetail(true);
    const coleta = coletas.find(c => c.id === coletaId);
    if (coleta) {
      setPesoNF(coleta.pesoTotalNF ? String(coleta.pesoTotalNF) : "");
      setPesoAtual(coleta.pesoTotalAtual ? String(coleta.pesoTotalAtual) : "");
      setNotaFiscal(coleta.notaFiscal || "");
    }
    setTipoMaterial(""); setCor(""); setPeso(""); setDestino(""); setPesagemSalva(false);

    try {
      const [seps, qrs] = await Promise.all([
        fetch(`/api/separacoes/coleta/${coletaId}`).then(r => r.json()).catch(() => []),
        fetch(`/api/qr-codes/coleta/${coletaId}`).then(r => r.json()).catch(() => []),
      ]);
      setSeparacoes(Array.isArray(seps) ? seps : []);
      setQrCodes(Array.isArray(qrs) ? qrs : []);
    } catch {
      setSeparacoes([]);
      setQrCodes([]);
    } finally {
      setLoadingDetail(false);
    }
  }, [coletas]);

  const closeColeta = () => {
    setSelectedColetaId(null);
    setSeparacoes([]);
    setQrCodes([]);
  };

  const currentColeta = useMemo(
    () => coletas.find(c => c.id === selectedColetaId),
    [coletas, selectedColetaId],
  );

  /* ─── Pesagem difference ─── */
  const diferenca = useMemo(() => {
    const nf = parseFloat(pesoNF) || 0;
    const atual = parseFloat(pesoAtual) || 0;
    if (nf === 0 && atual === 0) return null;
    return atual - nf;
  }, [pesoNF, pesoAtual]);

  /* ─── Triagem progress ─── */
  const progress = useMemo(() => {
    const totalSep = separacoes.reduce((acc, s) => acc + (s.peso || 0), 0);
    const totalColeta = parseFloat(pesoAtual) || currentColeta?.pesoTotalAtual || 0;
    const pct = totalColeta > 0 ? Math.min(100, (totalSep / totalColeta) * 100) : 0;
    return { totalSep, totalColeta, pct };
  }, [separacoes, pesoAtual, currentColeta]);

  /* ─── Registrar Pesagem ─── */
  const [pesagemSalva, setPesagemSalva] = useState(false);
  const handlePesagem = async () => {
    if (!selectedColetaId) return;
    if (!pesoAtual || parseFloat(pesoAtual) <= 0) {
      toast.error("Informe o peso atual da balança");
      return;
    }
    setSavingPesagem(true);
    try {
      const res = await fetch(`/api/coletas/${selectedColetaId}/entrada`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoTotalAtual: parseFloat(pesoAtual) || 0,
          pesoTotalNF: parseFloat(pesoNF) || 0,
          notaFiscal: notaFiscal || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Pesagem registrada! Dados salvos no sistema.");
      setPesagemSalva(true);
      setColetas(prev => prev.map(c => c.id === selectedColetaId ? {
        ...c,
        pesoTotalAtual: parseFloat(pesoAtual) || 0,
        pesoTotalNF: parseFloat(pesoNF) || 0,
        notaFiscal: notaFiscal || null,
        status: "recebido",
      } : c));
    } catch {
      toast.error("Erro ao registrar pesagem — verifique a conexão");
    } finally {
      setSavingPesagem(false);
    }
  };

  /* ─── Adicionar Trouxa + QR ─── */
  const handleAddTrouxa = async () => {
    if (!selectedColetaId || !currentColeta) return;
    if (!tipoMaterial) { toast.error("Selecione o tipo de material"); return; }
    if (!peso || parseFloat(peso) <= 0) { toast.error("Informe o peso da trouxa"); return; }
    if (!destino) { toast.error("Selecione o destino"); return; }

    setSavingTrouxa(true);
    try {
      const sepRes = await fetch("/api/separacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coletaId: selectedColetaId,
          coletaNumero: currentColeta.numero,
          fornecedor: currentColeta.nomeFantasia || currentColeta.fornecedor,
          tipoMaterial, cor, peso: parseFloat(peso), destino,
          colaborador: me.nome,
        }),
      });
      if (!sepRes.ok) throw new Error();
      const newSep = await sepRes.json();

      const qrRes = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coletaId: selectedColetaId,
          coletaNumero: currentColeta.numero,
          separacaoId: newSep.id,
          fornecedor: currentColeta.nomeFantasia || currentColeta.fornecedor,
          tipoMaterial, cor, peso: parseFloat(peso), destino,
        }),
      });
      const newQR = qrRes.ok ? await qrRes.json() : null;

      setSeparacoes(prev => [...prev, newSep]);
      if (newQR) setQrCodes(prev => [...prev, newQR]);

      setTipoMaterial(""); setCor(""); setPeso(""); setDestino("");
      toast.success(`Trouxa adicionada${newQR ? " + QR gerado" : ""}!`);
    } catch {
      toast.error("Erro ao criar trouxa");
    } finally {
      setSavingTrouxa(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                               */
  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Triagem"
        description="Separação e classificação de material por coleta"
        icon={ClipboardList}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Em Triagem", value: stats.emTriagem, color: "#004B9B" },
          {
            label: "Peso Total",
            value: `${stats.pesoTotal.toLocaleString("pt-BR")}kg`,
            color: "#ed1b24",
          },
        ]}
      />

      {/* ─── Cards Relatório — padrão FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Coletas"
          value={stats.total}
          subtitle="Para triagem"
          icon={Package}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Pendentes Triagem"
          value={stats.pendentes}
          subtitle="Aguardando pesagem"
          icon={AlertTriangle}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Em Triagem"
          value={stats.emTriagem}
          subtitle="Sendo separadas"
          icon={ArrowDownUp}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Peso Total"
          value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`}
          subtitle="Peso total NF registrado"
          icon={Scale}
          color={FIPS_COLORS.verdeFloresta}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  STATE 1: DataListingTable de Coletas                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!selectedColetaId ? (
        <>
          {/* ─── Toolbar — padrão FIPS DS Data Listing ─── */}
          <DataListingToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por nº coleta, fornecedor ou NF..."
            activeFilters={activeFilters}
            filtersContent={
              <div className="px-4 py-3 space-y-4">
                {/* Status */}
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                    Status
                  </p>
                  <div className="flex flex-col gap-1">
                    {[
                      { v: "", l: "Todos os status" },
                      { v: "pendente", l: "Pendente" },
                      { v: "recebido", l: "Recebido" },
                      { v: "em_triagem", l: "Em Triagem" },
                      { v: "triada", l: "Triada" },
                    ].map((opt) => (
                      <button
                        key={opt.v || "todos-status"}
                        onClick={() => setFilterStatus(opt.v)}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                          filterStatus === opt.v
                            ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                            : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fornecedor */}
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                    Fornecedor
                  </p>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setFilterFornecedor("")}
                      className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                        !filterFornecedor
                          ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                          : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                      }`}
                    >
                      Todos os fornecedores
                    </button>
                    {fornecedoresUnicos.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilterFornecedor(f)}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                          filterFornecedor === f
                            ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                            : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                        }`}
                      >
                        {f}
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
          <DataListingTable<Coleta>
            icon={<ClipboardList className="h-[22px] w-[22px]" />}
            title="Coletas para Triagem"
            subtitle={`${filtered.length} ${filtered.length === 1 ? "coleta" : "coletas"} ${
              activeFilters || search ? "filtradas" : "no total"
            } · Atualizado agora`}
            filtered={!!(search || activeFilters)}
            data={filtered}
            getRowId={(c) => c.id}
            emptyState={
              loading
                ? "Carregando coletas..."
                : "Nenhuma coleta encontrada"
            }
            columns={coletaColumns({ onView: openColeta })}
          />
        </>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /*  STATE 2: Triagem Panel                                          */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div>

          {/* ─── Header Bar — blue gradient ─── */}
          <div
            className="flex items-center justify-between rounded-lg border border-[var(--fips-border)] p-4 mb-5"
            style={{ background: "linear-gradient(135deg, #004B9B 0%, #002A68 100%)" }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={closeColeta}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <div>
                <h3
                  className="text-white text-[18px] font-bold"
                  style={{ fontFamily: "'Saira Expanded', sans-serif" }}
                >
                  Coleta #{currentColeta?.numero}
                  <span className="ml-3 text-[13px] font-normal text-white/70">
                    {currentColeta?.nomeFantasia || currentColeta?.fornecedor}
                  </span>
                </h3>
                <p className="text-white/50 text-[11px]">
                  {me.nome} · {formatDateBR(currentColeta?.dataColeta)} · {separacoes.length} trouxas registradas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={getStatusInfo(currentColeta?.status || "").variant}
                className="text-[10px] border-white/20"
              >
                {getStatusInfo(currentColeta?.status || "").label}
              </Badge>
              <span className="rounded-lg bg-white/10 border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">
                <User className="inline h-3 w-3 mr-1" />{me.nome}
              </span>
            </div>
          </div>

          {loadingDetail ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--fips-primary)] border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-5">

              {/* ─── Section A: Pesagem ─── */}
              <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Weight className="h-4 w-4" style={{ color: FIPS_COLORS.azulProfundo }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FIPS_COLORS.azulProfundo, fontFamily: "'Saira Expanded', sans-serif" }}
                  >
                    Entrada de Coleta — Pesagem
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Peso NF */}
                  <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Peso NF
                    </div>
                    <Input
                      density="compact"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={pesoNF}
                      onChange={(e) => setPesoNF(e.target.value)}
                      className="text-[14px] font-bold"
                    />
                    <div className="text-[8px] text-[var(--fips-fg-muted)] mt-1">kg (nota fiscal)</div>
                  </div>

                  {/* Peso Atual */}
                  <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Peso Atual
                    </div>
                    <Input
                      density="compact"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={pesoAtual}
                      onChange={(e) => setPesoAtual(e.target.value)}
                      className="text-[14px] font-bold"
                    />
                    <div className="text-[8px] text-[var(--fips-fg-muted)] mt-1">kg (balança)</div>
                  </div>

                  {/* Diferença */}
                  <div
                    className="rounded-lg border p-3 flex flex-col justify-center items-center"
                    style={{
                      borderColor: diferenca === null ? "var(--fips-border)" : diferenca >= 0 ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.danger,
                      background: diferenca === null ? "var(--fips-surface-soft)" : diferenca >= 0 ? `${FIPS_COLORS.verdeFloresta}08` : `${FIPS_COLORS.danger}08`,
                    }}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Diferença
                    </div>
                    <div
                      className="text-[20px] font-extrabold"
                      style={{
                        color: diferenca === null ? "var(--fips-fg-muted)" : diferenca >= 0 ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.danger,
                        fontFamily: "'Saira Expanded', sans-serif",
                      }}
                    >
                      {diferenca === null ? "—" : `${diferenca >= 0 ? "+" : ""}${diferenca.toFixed(1)}`}
                    </div>
                    <div className="text-[8px] text-[var(--fips-fg-muted)]">kg</div>
                  </div>
                </div>

                <Field density="compact" className="mb-3">
                  <FieldLabel>Nota Fiscal</FieldLabel>
                  <Input
                    density="compact"
                    placeholder="Nº da nota fiscal"
                    value={notaFiscal}
                    onChange={(e) => setNotaFiscal(e.target.value)}
                  />
                </Field>

                <Button
                  onClick={handlePesagem}
                  disabled={savingPesagem || pesagemSalva}
                  className="w-full gap-2"
                  style={{ background: pesagemSalva ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.azulProfundo }}
                >
                  {pesagemSalva ? <CheckCircle2 className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
                  {savingPesagem ? "Salvando..." : pesagemSalva ? "Pesagem Salva ✓" : "Registrar Pesagem"}
                </Button>
              </div>

              {/* ─── Section B: Nova Trouxa ─── */}
              <div className="rounded-lg border-2 border-dashed border-[var(--fips-primary)] bg-[var(--fips-surface-soft)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-4 w-4" style={{ color: FIPS_COLORS.azulProfundo }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FIPS_COLORS.azulProfundo, fontFamily: "'Saira Expanded', sans-serif" }}
                  >
                    Separação por Material — Nova Trouxa
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field density="compact">
                    <FieldLabel required>Tipo Material</FieldLabel>
                    <Select value={tipoMaterial} onChange={(e) => { setTipoMaterial(e.target.value); setCor(""); }}>
                      <option value="">Selecione</option>
                      {(tiposFromProdutos.length > 0 ? tiposFromProdutos : TIPOS_MATERIAL).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field density="compact">
                    <FieldLabel>Cor</FieldLabel>
                    {coresDoMaterial.length > 0 ? (
                      <Select value={cor} onChange={(e) => setCor(e.target.value)}>
                        <option value="">Selecione a cor</option>
                        {coresDoMaterial.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Select>
                    ) : (
                      <Select value={cor} onChange={(e) => setCor(e.target.value)} disabled={!tipoMaterial}>
                        <option value="">{tipoMaterial ? "Sem cores cadastradas" : "Selecione o material primeiro"}</option>
                      </Select>
                    )}
                    {tipoMaterial && coresDoMaterial.length > 0 && (
                      <FieldHint>{coresDoMaterial.length} cor(es) disponível(is) para {tipoMaterial}</FieldHint>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Field density="compact">
                    <FieldLabel required>Peso (kg)</FieldLabel>
                    <Input
                      density="compact"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                    />
                  </Field>
                  <Field density="compact">
                    <FieldLabel required>Destino</FieldLabel>
                    <Select value={destino} onChange={(e) => setDestino(e.target.value)}>
                      <option value="">Selecione</option>
                      {DESTINOS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Button
                  onClick={handleAddTrouxa}
                  disabled={savingTrouxa}
                  className="w-full gap-2"
                  style={{ background: FIPS_COLORS.gold, color: FIPS_COLORS.azulEscuro }}
                >
                  <QrCode className="h-4 w-4" />
                  {savingTrouxa ? "Criando..." : "Adicionar Trouxa + Gerar QR"}
                </Button>
              </div>

              {/* ─── Section C: Trouxas Registradas — DataListingTable ─── */}
              <DataListingTable<Separacao>
                icon={<ClipboardList className="h-[22px] w-[22px]" />}
                title="Trouxas Registradas"
                subtitle={`${separacoes.length} ${separacoes.length === 1 ? "trouxa" : "trouxas"} registradas`}
                filtered={false}
                data={separacoes}
                getRowId={(s) => s.id}
                emptyState="Nenhuma trouxa registrada ainda"
                columns={separacaoColumns(qrCodes)}
              />

              {/* ─── Progress Bar ─── */}
              {progress.totalColeta > 0 && (
                <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[var(--fips-fg)]">
                      Total separado: {formatKg(progress.totalSep)} de {formatKg(progress.totalColeta)}
                    </span>
                    <span
                      className="text-[13px] font-extrabold"
                      style={{
                        color: progress.pct >= 100 ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.azulProfundo,
                        fontFamily: "'Saira Expanded', sans-serif",
                      }}
                    >
                      {progress.pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--fips-surface-muted)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, progress.pct)}%`,
                        background: progress.pct >= 100
                          ? `linear-gradient(90deg, ${FIPS_COLORS.verdeFloresta}, #00E05A)`
                          : `linear-gradient(90deg, ${FIPS_COLORS.azulProfundo}, ${FIPS_COLORS.azulEscuro})`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── COLUMNS: COLETAS ──────────────────────────── */

function coletaColumns({ onView }: { onView: (id: string) => void }): DataListingColumn<Coleta>[] {
  return [
    {
      id: "numero",
      label: "Nº",
      fixed: true,
      sortable: true,
      width: "70px",
      render: (c) => <CellMonoStrong>#{c.numero}</CellMonoStrong>,
    },
    {
      id: "fornecedor",
      label: "Fornecedor",
      fixed: true,
      sortable: true,
      width: "180px",
      render: (c) => (
        <div className="min-w-0 leading-tight">
          <div className="font-semibold text-[11px] text-[var(--fips-fg)] truncate max-w-[170px]">
            {c.nomeFantasia || c.fornecedor || "—"}
          </div>
          {c.razaoSocial && (
            <div className="text-[9px] leading-none text-[var(--fips-fg-muted)] truncate max-w-[170px]">
              {c.razaoSocial}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "notaFiscal",
      label: "NF",
      sortable: true,
      width: "100px",
      render: (c) => <CellMonoMuted>{c.notaFiscal || "—"}</CellMonoMuted>,
    },
    {
      id: "pesoNF",
      label: "Peso NF",
      sortable: true,
      align: "right",
      width: "90px",
      render: (c) => <CellMonoStrong align="right">{formatKg(c.pesoTotalNF)}</CellMonoStrong>,
    },
    {
      id: "pesoAtual",
      label: "Peso Atual",
      sortable: true,
      align: "right",
      width: "90px",
      render: (c) => <CellMonoStrong align="right">{formatKg(c.pesoTotalAtual)}</CellMonoStrong>,
    },
    {
      id: "diferenca",
      label: "Diferença",
      sortable: true,
      align: "right",
      width: "90px",
      render: (c) => {
        const nf = c.pesoTotalNF ?? 0;
        const atual = c.pesoTotalAtual ?? 0;
        if (nf === 0 && atual === 0) return <CellMuted>—</CellMuted>;
        const diff = atual - nf;
        const isPositive = diff >= 0;
        return (
          <span
            className="text-[11px] font-mono font-bold"
            style={{ color: isPositive ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.danger }}
          >
            {isPositive ? "+" : ""}{diff.toFixed(1)} kg
          </span>
        );
      },
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "100px",
      render: (c) => {
        const info = getStatusInfo(c.status);
        return <Badge variant={info.variant} dot>{info.label}</Badge>;
      },
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "60px",
      render: (c) => (
        <CellActions>
          <CellActionButton
            title="Abrir triagem"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onView(c.id)}
          />
        </CellActions>
      ),
    },
  ];
}

/* ──────────────────────────── COLUMNS: SEPARAÇÕES ──────────────────────────── */

function separacaoColumns(qrCodes: QRCode[]): DataListingColumn<Separacao>[] {
  return [
    {
      id: "material",
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
      render: (s) => <CellMuted>{s.cor || "—"}</CellMuted>,
    },
    {
      id: "peso",
      label: "Peso",
      sortable: true,
      align: "right",
      width: "80px",
      render: (s) => <CellMonoStrong align="right">{formatKg(s.peso)}</CellMonoStrong>,
    },
    {
      id: "destino",
      label: "Destino",
      sortable: true,
      width: "110px",
      render: (s) => {
        const d = destinoMap[s.destino];
        if (!d) return <CellMuted>{s.destino || "—"}</CellMuted>;
        return <Badge variant={d.variant}>{d.label}</Badge>;
      },
    },
    {
      id: "qrCode",
      label: "QR Code",
      width: "120px",
      render: (s) => {
        const qr = qrCodes.find((q) => q.separacaoId === s.id);
        return <CellMonoMuted>{qr?.codigo || "—"}</CellMonoMuted>;
      },
    },
    {
      id: "data",
      label: "Data",
      sortable: true,
      width: "90px",
      render: (s) => <CellMonoMuted>{formatDateBR(s.data)}</CellMonoMuted>,
    },
  ];
}
