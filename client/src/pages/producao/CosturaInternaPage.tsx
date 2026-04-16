import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Scissors,
  QrCode,
  Weight,
  CheckCircle2,
  ChevronLeft,
  User,
  Search,
  Palette,
  Clock,
  Package,
  X,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { QrScanner } from "@/components/domain/QrScanner";
import {
  DataListingTable,
  type DataListingColumn,
  CellMonoStrong,
  CellMonoMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";

/* ─── Cores FIPS DS canonicas ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
  danger: "#DC3545",
};

/* ─── Tipos ─── */
interface CosturaRegistro {
  id: string;
  tipoMaterial: string;
  cor: string;
  pesoEntrada: number;
  pesoSaida: number;
  tipoCostura: string;
  operador: string;
  status: string;
  observacao?: string | null;
  dataCriacao: string;
}

interface QRScanResult {
  id: string;
  codigo: string;
  coletaId: string;
  coletaNumero: number;
  separacaoId: string;
  fornecedor: string;
  tipoMaterial: string;
  cor: string;
  peso: number;
  destino: string;
  coleta?: {
    numero: number;
    nomeFantasia: string;
    dataColeta: string;
  };
}

const TIPOS_COSTURA = ["Overlock", "Zig-Zag", "Corte-Reto", "Bainha", "Acabamento"];

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  pendente: { label: "Pendente", variant: "warning" },
  em_andamento: { label: "Em Andamento", variant: "info" },
  concluido: { label: "Concluído", variant: "success" },
};

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n != null && n > 0 ? `${n.toLocaleString("pt-BR")} kg` : "—";

/* ─── Componente principal ─── */
export default function CosturaInternaPage() {
  const me = useAppAuthMe();

  /* ─── State: listing ─── */
  const [registros, setRegistros] = useState<CosturaRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");

  /* ─── State: QR scan panel ─── */
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<QRScanResult | null>(null);
  const [qrError, setQrError] = useState("");
  const qrInputRef = useRef<HTMLInputElement>(null);

  /* ─── State: form (after QR scan) ─── */
  const [formTipoCostura, setFormTipoCostura] = useState("");
  const [formPesoSaida, setFormPesoSaida] = useState("");
  const [formObservacao, setFormObservacao] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ─── Fetch registros (producoes filtradas por sala COSTURA) ─── */
  const fetchRegistros = useCallback(async () => {
    try {
      const res = await fetch("/api/producoes");
      const data: any[] = await res.json();
      const costuras: CosturaRegistro[] = data
        .filter((p: any) => (p.sala || "").toUpperCase().includes("COSTURA"))
        .map((p: any) => ({
          id: p.id,
          tipoMaterial: p.tipoMaterial || "—",
          cor: p.cor || "—",
          pesoEntrada: p.kilo || 0,
          pesoSaida: p.pesoSaida ?? p.kilo ?? 0,
          tipoCostura: p.acabamento || p.tipoCostura || "—",
          operador: p.operador || "—",
          status: p.statusEstoque || "pendente",
          observacao: p.observacao || null,
          dataCriacao: p.dataCriacao || p.createdAt || "",
        }));
      setRegistros(costuras);
    } catch (err) {
      console.error("Erro ao buscar costuras internas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  /* ─── Auto-focus QR input ─── */
  useEffect(() => {
    if (showQrPanel && qrInputRef.current) {
      qrInputRef.current.focus();
    }
  }, [showQrPanel]);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    let pesoTotal = 0;
    let emAndamento = 0;
    let concluidos = 0;
    for (const r of registros) {
      pesoTotal += r.pesoSaida || r.pesoEntrada;
      if (r.status === "em_andamento") emAndamento++;
      if (r.status === "concluido") concluidos++;
    }
    return { total: registros.length, emAndamento, concluidos, pesoTotal };
  }, [registros]);

  /* ─── Materiais únicos para filtro ─── */
  const materiaisUnicos = useMemo(() => {
    const set = new Set<string>();
    registros.forEach((r) => { if (r.tipoMaterial !== "—") set.add(r.tipoMaterial); });
    return Array.from(set).sort();
  }, [registros]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registros.filter((r) => {
      const matchSearch =
        !q ||
        r.tipoMaterial.toLowerCase().includes(q) ||
        r.cor.toLowerCase().includes(q) ||
        r.operador.toLowerCase().includes(q) ||
        r.tipoCostura.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchMaterial = !filterMaterial || r.tipoMaterial === filterMaterial;
      return matchSearch && matchStatus && matchMaterial;
    });
  }, [registros, search, filterStatus, filterMaterial]);

  const activeFilters = [filterStatus, filterMaterial].filter(Boolean).length;

  /* ─── QR Scan handler ─── */
  const handleQrScan = async (code?: string) => {
    const codigo = (code || qrInput).trim();
    if (!codigo) {
      setQrError("Digite ou escaneie um código QR");
      return;
    }

    setQrLoading(true);
    setQrError("");
    setQrData(null);

    try {
      const res = await fetch(`/api/qr-codes/scan/${encodeURIComponent(codigo)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setQrError("QR Code não encontrado. Verifique o código e tente novamente.");
        } else {
          setQrError("Erro ao buscar QR Code. Tente novamente.");
        }
        return;
      }
      const data: QRScanResult = await res.json();
      setQrData(data);
      setQrError("");
      toast.success("QR Code escaneado com sucesso!");

      // Reset form fields
      setFormTipoCostura("");
      setFormPesoSaida(String(data.peso));
      setFormObservacao("");
    } catch {
      setQrError("Erro de conexão. Verifique sua rede.");
    } finally {
      setQrLoading(false);
    }
  };

  const handleQrKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQrScan();
    }
  };

  /* ─── Submit costura interna ─── */
  const handleSubmitCostura = async () => {
    if (!qrData) return;
    if (!formTipoCostura) { toast.error("Selecione o tipo de costura"); return; }
    if (!formPesoSaida) { toast.error("Informe o peso de saída"); return; }

    setSubmitting(true);
    try {
      const body = {
        coletaId: qrData.coletaId,
        coletaNumero: qrData.coletaNumero || qrData.coleta?.numero,
        fornecedor: qrData.fornecedor,
        sala: "COSTURA",
        tipoMaterial: qrData.tipoMaterial,
        cor: qrData.cor,
        acabamento: formTipoCostura,
        kilo: qrData.peso,
        pesoSaida: parseFloat(formPesoSaida) || qrData.peso,
        unidadeSaida: "kilo",
        operador: me.nome,
        qrCodeId: qrData.id,
        observacao: formObservacao || null,
      };

      const res = await fetch("/api/producoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      toast.success("Costura registrada com sucesso!");
      fetchRegistros();

      // Reset
      setQrData(null);
      setQrInput("");
      setFormTipoCostura("");
      setFormPesoSaida("");
      setFormObservacao("");

      setTimeout(() => qrInputRef.current?.focus(), 100);
    } catch {
      toast.error("Erro ao registrar costura. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Close QR panel ─── */
  const closeQrPanel = () => {
    setShowQrPanel(false);
    setQrData(null);
    setQrInput("");
    setQrError("");
    setFormTipoCostura("");
    setFormPesoSaida("");
    setFormObservacao("");
  };

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                                   */
  /* ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Costura Interna"
        description="Sala de costura interna — funcionários CLT"
        icon={Scissors}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Em Andamento", value: stats.emAndamento, color: "#FDC24E" },
          { label: "Concluídos", value: stats.concluidos, color: "#00C64C" },
          { label: "Peso Total", value: `${stats.pesoTotal.toLocaleString("pt-BR")}kg`, color: "#ed1b24" },
        ]}
        actions={
          <Button
            variant={showQrPanel ? "default" : "outline"}
            onClick={() => {
              if (showQrPanel) closeQrPanel();
              else setShowQrPanel(true);
            }}
          >
            <QrCode className="h-4 w-4" />
            Escanear QR
          </Button>
        }
      />

      {/* ─── Cards Relatório — padrão FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Registros"
          value={stats.total}
          subtitle="Costuras registradas"
          icon={Scissors}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Em Andamento"
          value={stats.emAndamento}
          subtitle="Aguardando conclusão"
          icon={Clock}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Concluídos"
          value={stats.concluidos}
          subtitle="Finalizados"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Peso Total"
          value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`}
          subtitle="Material processado"
          icon={Weight}
          color={FIPS_COLORS.azulEscuro}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  QR SCAN PANEL                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showQrPanel && (
        <div className="space-y-4">
          {/* Header bar */}
          <div
            className="flex items-center justify-between rounded-lg border border-[var(--fips-border)] p-4"
            style={{ background: "linear-gradient(135deg, #004B9B 0%, #002A68 100%)" }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={closeQrPanel}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <div>
                <h3
                  className="text-white text-[18px] font-bold"
                  style={{ fontFamily: "'Saira Expanded', sans-serif" }}
                >
                  Escanear QR Code
                  <span className="ml-3 text-[13px] font-normal text-white/70">
                    Leitura de lote para costura
                  </span>
                </h3>
                <p className="text-white/50 text-[11px]">
                  {me.nome} — Escaneie o código para auto-preencher material, cor e peso
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-white/10 border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">
              <User className="inline h-3 w-3 mr-1" />{me.nome}
            </span>
          </div>

          {/* QR Input Section */}
          <div
            className="rounded-lg border-2 border-dashed p-6 transition-colors"
            style={{
              borderColor: qrData
                ? FIPS_COLORS.verdeFloresta
                : qrError
                  ? FIPS_COLORS.danger
                  : "var(--fips-border)",
              background: qrData
                ? `${FIPS_COLORS.verdeFloresta}06`
                : "var(--fips-surface)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  background: qrData
                    ? `${FIPS_COLORS.verdeFloresta}15`
                    : `${FIPS_COLORS.azulProfundo}15`,
                }}
              >
                <QrCode
                  className="h-5 w-5"
                  style={{ color: qrData ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.azulProfundo }}
                />
              </div>
              <div>
                <p
                  className="text-[12px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    color: qrData ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.azulProfundo,
                    fontFamily: "'Saira Expanded', sans-serif",
                  }}
                >
                  {qrData ? "QR Code Identificado" : "Leitura de QR Code"}
                </p>
                <p className="text-[10px] text-[var(--fips-fg-muted)]">
                  {qrData
                    ? `Código: ${qrData.codigo}`
                    : "Posicione o leitor ou digite o código manualmente"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  ref={qrInputRef}
                  density="compact"
                  leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Escanear ou digitar código... (ex: TN-MO0MYNSW-KKJU)"
                  value={qrInput}
                  onChange={(e) => { setQrInput(e.target.value); setQrError(""); }}
                  onKeyDown={handleQrKeyDown}
                  className="font-mono text-[13px] tracking-wide"
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <Button onClick={() => handleQrScan()} disabled={qrLoading || !qrInput.trim()}>
                {qrLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>

            {/* Error */}
            {qrError && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2">
                <X className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-[11px] text-red-500">{qrError}</p>
              </div>
            )}
          </div>

          {/* ─── QR Data Card + Form ─── */}
          {qrData && (
            <div className="space-y-4">
              {/* Read-only data from QR */}
              <div
                className="rounded-lg border-2 p-5"
                style={{ borderColor: FIPS_COLORS.verdeFloresta, background: `${FIPS_COLORS.verdeFloresta}06` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-4 w-4" style={{ color: FIPS_COLORS.verdeFloresta }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FIPS_COLORS.verdeFloresta, fontFamily: "'Saira Expanded', sans-serif" }}
                  >
                    Dados do Lote (Auto-preenchido)
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Material */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Material
                    </div>
                    <div className="text-[13px] font-bold text-[var(--fips-fg)]">
                      {qrData.tipoMaterial}
                    </div>
                  </div>

                  {/* Cor */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Cor
                    </div>
                    <div className="text-[13px] font-bold text-[var(--fips-fg)]">
                      {qrData.cor || "—"}
                    </div>
                  </div>

                  {/* Peso Entrada */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Peso Entrada
                    </div>
                    <div
                      className="text-[16px] font-extrabold"
                      style={{ color: FIPS_COLORS.verdeFloresta, fontFamily: "'Saira Expanded', sans-serif" }}
                    >
                      {qrData.peso.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable form fields */}
              <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors className="h-4 w-4" style={{ color: FIPS_COLORS.azulProfundo }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FIPS_COLORS.azulProfundo, fontFamily: "'Saira Expanded', sans-serif" }}
                  >
                    Dados da Costura
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipo Costura */}
                  <Field density="compact" inset="icon">
                    <FieldLabel>Tipo de Costura *</FieldLabel>
                    <Select
                      density="compact"
                      value={formTipoCostura}
                      onChange={(e) => setFormTipoCostura(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {TIPOS_COSTURA.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>

                  {/* Peso Saída */}
                  <Field density="compact" inset="icon">
                    <FieldLabel>Peso Saída (kg) *</FieldLabel>
                    <Input
                      density="compact"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ex: 12.5"
                      value={formPesoSaida}
                      onChange={(e) => setFormPesoSaida(e.target.value)}
                    />
                  </Field>

                  {/* Operador (auto) */}
                  <Field density="compact" inset="icon">
                    <FieldLabel>Operador</FieldLabel>
                    <Input
                      density="compact"
                      value={me.nome}
                      readOnly
                      className="!bg-emerald-500/5 !border-emerald-500/20 !text-[var(--fips-fg)]"
                    />
                  </Field>

                  {/* Observação */}
                  <Field density="compact" inset="icon">
                    <FieldLabel>Observação</FieldLabel>
                    <Input
                      density="compact"
                      placeholder="Opcional..."
                      value={formObservacao}
                      onChange={(e) => setFormObservacao(e.target.value)}
                    />
                  </Field>
                </div>

                {/* Submit */}
                <div className="mt-5 flex justify-end gap-2">
                  <Button variant="outline" onClick={closeQrPanel}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitCostura} disabled={submitting || !formTipoCostura}>
                    {submitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Scissors className="h-4 w-4" />
                    )}
                    Registrar Costura
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Toolbar — padrão FIPS DS Data Listing ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por material, cor, operador..."
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
                  { v: "em_andamento", l: "Em Andamento" },
                  { v: "concluido", l: "Concluído" },
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

            {/* Material */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Material
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
                {materiaisUnicos.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setFilterMaterial(mat)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterMaterial === mat
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {mat}
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
      <DataListingTable<CosturaRegistro>
        icon={<Scissors className="h-[22px] w-[22px]" />}
        title="Costura Interna"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(r) => r.id}
        emptyState={loading ? "Carregando..." : "Nenhum registro de costura interna encontrado"}
        columns={costuraColumns}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

const costuraColumns: DataListingColumn<CosturaRegistro>[] = [
  {
    id: "id",
    label: "ID",
    fixed: true,
    sortable: true,
    width: "70px",
    render: (r) => (
      <CellMonoStrong>#{r.id.slice(0, 6).toUpperCase()}</CellMonoStrong>
    ),
  },
  {
    id: "material",
    label: "Material",
    sortable: true,
    width: "140px",
    render: (r) => (
      <div className="truncate max-w-[130px]" title={r.tipoMaterial}>
        <span className="text-[11px] font-semibold text-[var(--fips-fg)]">{r.tipoMaterial}</span>
      </div>
    ),
  },
  {
    id: "cor",
    label: "Cor",
    sortable: true,
    width: "100px",
    render: (r) => (
      <div className="flex items-center gap-1.5">
        <Palette className="h-3 w-3 text-[var(--fips-fg-muted)]" />
        <span className="text-[11px] text-[var(--fips-fg)]">{r.cor}</span>
      </div>
    ),
  },
  {
    id: "peso",
    label: "Peso",
    sortable: true,
    align: "right",
    width: "90px",
    render: (r) => (
      <div className="text-right">
        <CellMonoStrong align="right">{formatKg(r.pesoEntrada)}</CellMonoStrong>
        {r.pesoSaida !== r.pesoEntrada && (
          <div className="text-[9px] text-[var(--fips-fg-muted)]">
            Saída: {formatKg(r.pesoSaida)}
          </div>
        )}
      </div>
    ),
  },
  {
    id: "tipoCostura",
    label: "Tipo Costura",
    sortable: true,
    width: "110px",
    render: (r) => (
      <span className="text-[11px] text-[var(--fips-fg)]">{r.tipoCostura}</span>
    ),
  },
  {
    id: "operador",
    label: "Operador",
    sortable: true,
    width: "120px",
    render: (r) => (
      <div className="flex items-center gap-1.5">
        <User className="h-3 w-3 text-[var(--fips-fg-muted)]" />
        <span className="text-[11px] text-[var(--fips-fg)] truncate max-w-[100px]">{r.operador}</span>
      </div>
    ),
  },
  {
    id: "status",
    label: "Status",
    sortable: true,
    width: "100px",
    render: (r) => {
      const sc = statusConfig[r.status] || { label: r.status || "—", variant: "secondary" as const };
      return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
    },
  },
  {
    id: "data",
    label: "Data",
    sortable: true,
    width: "80px",
    render: (r) => <CellMonoMuted>{formatDateBR(r.dataCriacao)}</CellMonoMuted>,
  },
  {
    id: "acoes",
    label: "Ações",
    fixed: true,
    align: "center",
    width: "50px",
    render: (r) => (
      <CellActions>
        <CellActionButton
          title="Ver detalhes"
          icon={<Eye className="h-3.5 w-3.5 text-[var(--fips-primary)]" />}
          onClick={() => toast.info(`Detalhes do registro ${r.id.slice(0, 6)}`)}
        />
      </CellActions>
    ),
  },
];
