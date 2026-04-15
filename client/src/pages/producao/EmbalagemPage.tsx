import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  Weight,
  Clock,
  CheckCircle2,
  QrCode,
  ChevronLeft,
  Search,
  Layers,
  Palette,
  Ruler,
  User,
  X,
  BoxSelect,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
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

/* ─── Cores FIPS DS canonicas para os Cards Relatorio ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

/* ─── Tipos ─── */
interface Embalagem {
  id: string;
  material: string;
  cor: string;
  medida: string;
  pesoEntrada: number;
  pesoFardo: number;
  qtdePacotes: number;
  tipoEmbalagem: string;
  fardo: string;
  operador: string;
  status: string;
  createdAt: string;
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

const STATUS_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  embalado: { label: "Embalado", variant: "info" },
  pronto_estoque: { label: "Pronto p/ Estoque", variant: "success" },
};

const TIPOS_EMBALAGEM = [
  "Fardo Plástico",
  "Fardo Ráfia",
  "Saco",
  "Caixa",
];

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n != null && n > 0 ? `${n.toLocaleString("pt-BR")} kg` : "—";

/* ─── Componente principal ─── */
export default function EmbalagemPage() {
  const me = useAppAuthMe();

  /* ─── State: listing ─── */
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterEmbalagem, setFilterEmbalagem] = useState<string>("");

  /* ─── State: QR scan panel ─── */
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<QRScanResult | null>(null);
  const [qrError, setQrError] = useState("");
  const qrInputRef = useRef<HTMLInputElement>(null);

  /* ─── State: form (auto-filled from QR) ─── */
  const [formMedida, setFormMedida] = useState("");
  const [formQtdePacotes, setFormQtdePacotes] = useState("");
  const [formPesoFardo, setFormPesoFardo] = useState("");
  const [formTipoEmbalagem, setFormTipoEmbalagem] = useState("Fardo Plástico");
  const [formStatus, setFormStatus] = useState("embalado");
  const [submitting, setSubmitting] = useState(false);

  /* ─── Fetch embalagens ─── */
  const fetchEmbalagens = useCallback(async () => {
    try {
      const res = await fetch("/api/estoque");
      const data = await res.json();
      setEmbalagens(data);
    } catch {
      toast.error("Erro ao carregar dados de embalagem");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmbalagens();
  }, [fetchEmbalagens]);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    const total = embalagens.length;
    const pesoEmbalado = embalagens.reduce((acc, e) => acc + (e.pesoFardo ?? 0), 0);
    const pendentes = embalagens.filter((e) => e.status === "embalado").length;
    const prontos = embalagens.filter((e) => e.status === "pronto_estoque").length;
    return { total, pesoEmbalado, pendentes, prontos };
  }, [embalagens]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    return embalagens.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (e.material ?? "").toLowerCase().includes(q) ||
        (e.cor ?? "").toLowerCase().includes(q) ||
        (e.fardo ?? "").toLowerCase().includes(q) ||
        (e.operador ?? "").toLowerCase().includes(q);
      const matchStatus = !filterStatus || e.status === filterStatus;
      const matchEmbalagem = !filterEmbalagem || e.tipoEmbalagem === filterEmbalagem;
      return matchSearch && matchStatus && matchEmbalagem;
    });
  }, [embalagens, search, filterStatus, filterEmbalagem]);

  const activeFilters = [filterStatus, filterEmbalagem].filter(Boolean).length;

  /* ─── QR Scan ─── */
  const handleQrScan = async () => {
    const codigo = qrInput.trim();
    if (!codigo) return;
    setQrLoading(true);
    setQrError("");
    setQrData(null);
    try {
      const res = await fetch(`/api/qr-codes/scan/${encodeURIComponent(codigo)}`);
      if (!res.ok) throw new Error("QR não encontrado");
      const data: QRScanResult = await res.json();
      setQrData(data);
      setFormMedida("");
      setFormQtdePacotes("");
      setFormPesoFardo("");
      setFormTipoEmbalagem("Fardo Plástico");
      setFormStatus("embalado");
      toast.success(`QR lido: ${data.tipoMaterial} — ${data.cor}`);
    } catch {
      setQrError("QR Code não encontrado ou inválido.");
      toast.error("Erro ao ler QR Code");
    } finally {
      setQrLoading(false);
    }
  };

  const handleQrKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQrScan();
    }
  };

  /* ─── Submit embalagem ─── */
  const handleSubmit = async () => {
    if (!qrData) return;
    if (!formQtdePacotes || !formPesoFardo) {
      toast.error("Preencha qtde pacotes e peso do fardo.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        material: qrData.tipoMaterial,
        cor: qrData.cor,
        medida: formMedida || null,
        pesoEntrada: qrData.peso,
        pesoFardo: parseFloat(formPesoFardo),
        qtdePacotes: parseInt(formQtdePacotes, 10),
        tipoEmbalagem: formTipoEmbalagem,
        operador: me?.nome || "Operador",
        status: formStatus,
        qrCodeId: qrData.id,
        coletaId: qrData.coletaId,
        fornecedor: qrData.fornecedor,
      };
      const res = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Fardo registrado com sucesso!");
      setShowQrPanel(false);
      setQrData(null);
      setQrInput("");
      fetchEmbalagens();
    } catch {
      toast.error("Erro ao registrar embalagem.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Focus QR input when panel opens ─── */
  useEffect(() => {
    if (showQrPanel) {
      setTimeout(() => qrInputRef.current?.focus(), 150);
    }
  }, [showQrPanel]);

  /* ─── QR Panel render ─── */
  if (showQrPanel) {
    return (
      <div className="space-y-6">
        {/* Back header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowQrPanel(false); setQrData(null); setQrInput(""); setQrError(""); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] text-[var(--fips-fg-muted)] transition-colors hover:bg-[var(--fips-surface-soft)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-[15px] font-bold text-[var(--fips-fg)]">Escanear QR Code</h2>
            <p className="text-[11px] text-[var(--fips-fg-muted)]">
              Leia o QR do lote de produção para registrar o fardo
            </p>
          </div>
        </div>

        {/* QR Input */}
        <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="h-5 w-5 text-[var(--fips-primary)]" />
            <span className="text-[13px] font-semibold text-[var(--fips-fg)]">Código QR</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-fg-muted)]" />
              <Input
                ref={qrInputRef}
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={handleQrKeyDown}
                placeholder="Escaneie ou digite o código QR..."
                className="pl-9"
              />
            </div>
            <Button onClick={handleQrScan} disabled={qrLoading || !qrInput.trim()}>
              {qrLoading ? "Lendo..." : "Buscar"}
            </Button>
          </div>
          {qrError && (
            <p className="mt-2 text-[11px] text-[var(--fips-danger)]">{qrError}</p>
          )}
        </div>

        {/* QR Result + Form */}
        {qrData && (
          <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5 space-y-5">
            {/* QR Info readonly */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Dados do Lote (QR)
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field density="compact" inset="icon">
                  <FieldLabel>Fornecedor</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-success)]" />
                    <Input
                      value={qrData.coleta?.nomeFantasia || qrData.fornecedor}
                      readOnly
                      className="pl-9 border-[var(--fips-success)]/40 bg-[var(--fips-success)]/5 text-[var(--fips-fg)]"
                    />
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Material</FieldLabel>
                  <div className="relative">
                    <Layers className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-success)]" />
                    <Input
                      value={qrData.tipoMaterial}
                      readOnly
                      className="pl-9 border-[var(--fips-success)]/40 bg-[var(--fips-success)]/5 text-[var(--fips-fg)]"
                    />
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Cor</FieldLabel>
                  <div className="relative">
                    <Palette className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-success)]" />
                    <Input
                      value={qrData.cor}
                      readOnly
                      className="pl-9 border-[var(--fips-success)]/40 bg-[var(--fips-success)]/5 text-[var(--fips-fg)]"
                    />
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Peso Entrada</FieldLabel>
                  <div className="relative">
                    <Weight className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-success)]" />
                    <Input
                      value={`${qrData.peso?.toLocaleString("pt-BR")} kg`}
                      readOnly
                      className="pl-9 border-[var(--fips-success)]/40 bg-[var(--fips-success)]/5 text-[var(--fips-fg)]"
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Editable form */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Dados do Fardo
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field density="compact" inset="icon">
                  <FieldLabel>Medida</FieldLabel>
                  <div className="relative">
                    <Ruler className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-fg-muted)]" />
                    <Input
                      value={formMedida}
                      onChange={(e) => setFormMedida(e.target.value)}
                      placeholder="Ex: 1,00 x 1,50m"
                      className="pl-9"
                    />
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Qtde Pacotes</FieldLabel>
                  <div className="relative">
                    <Package className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-fg-muted)]" />
                    <Input
                      type="number"
                      min={1}
                      value={formQtdePacotes}
                      onChange={(e) => setFormQtdePacotes(e.target.value)}
                      placeholder="0"
                      className="pl-9"
                    />
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Peso do Fardo (kg)</FieldLabel>
                  <div className="relative">
                    <Weight className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-fg-muted)]" />
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={formPesoFardo}
                      onChange={(e) => setFormPesoFardo(e.target.value)}
                      placeholder="0,0"
                      className="pl-9"
                    />
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Tipo Embalagem</FieldLabel>
                  <div className="relative">
                    <BoxSelect className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-fg-muted)]" />
                    <Select
                      value={formTipoEmbalagem}
                      onChange={(e) => setFormTipoEmbalagem(e.target.value)}
                      className="pl-9"
                    >
                      {TIPOS_EMBALAGEM.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Operador</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-success)]" />
                    <Input
                      value={me?.nome || "Operador"}
                      readOnly
                      className="pl-9 border-[var(--fips-success)]/40 bg-[var(--fips-success)]/5 text-[var(--fips-fg)]"
                    />
                  </div>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Status</FieldLabel>
                  <div className="relative">
                    <CheckCircle2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fips-fg-muted)]" />
                    <Select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="pl-9"
                    >
                      <option value="embalado">Embalado</option>
                      <option value="pronto_estoque">Pronto p/ Estoque</option>
                    </Select>
                  </div>
                </Field>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--fips-border)]">
              <Button
                variant="outline"
                onClick={() => { setQrData(null); setQrInput(""); }}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Package className="mr-1.5 h-3.5 w-3.5" />
                {submitting ? "Registrando..." : "Registrar Fardo"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Main listing view ─── */
  return (
    <div className="space-y-6">
      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Acabamento e Embalagem"
        description="Dobra, empacotamento e registro de fardos para estoque"
        icon={Package}
        stats={[
          { label: "Total Fardos", value: stats.total, color: "#93BDE4" },
          { label: "Peso Embalado", value: `${stats.pesoEmbalado.toLocaleString("pt-BR")}kg`, color: FIPS_COLORS.azulProfundo },
          { label: "Pendentes", value: stats.pendentes, color: FIPS_COLORS.amareloEscuro },
          { label: "Prontos p/ Estoque", value: stats.prontos, color: FIPS_COLORS.verdeFloresta },
        ]}
        actions={
          <Button onClick={() => setShowQrPanel(true)}>
            <QrCode className="mr-1.5 h-4 w-4" />
            Escanear QR
          </Button>
        }
      />

      {/* ─── Cards Relatorio — padrao FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Fardos"
          value={stats.total}
          subtitle="Fardos registrados no sistema"
          icon={Package}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Peso Embalado"
          value={`${stats.pesoEmbalado.toLocaleString("pt-BR")} kg`}
          subtitle="Peso total dos fardos"
          icon={Weight}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Pendentes"
          value={stats.pendentes}
          subtitle="Embalados aguardando liberação"
          icon={Clock}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Prontos p/ Estoque"
          value={stats.prontos}
          subtitle="Liberados para entrada no estoque"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
      </div>

      {/* ─── Toolbar — padrao FIPS DS Data Listing ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por material, cor, fardo ou operador..."
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
                  { v: "embalado", l: "Embalado" },
                  { v: "pronto_estoque", l: "Pronto p/ Estoque" },
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

            {/* Tipo Embalagem */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Tipo Embalagem
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFilterEmbalagem("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filterEmbalagem
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todos os tipos
                </button>
                {TIPOS_EMBALAGEM.map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setFilterEmbalagem(tipo)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterEmbalagem === tipo
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {tipo}
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

      {/* ─── Tabela canonica DS-FIPS — Data Listing ─── */}
      <DataListingTable<Embalagem>
        icon={<Package className="h-[22px] w-[22px]" />}
        title="Acabamento e Embalagem"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(e) => e.id}
        emptyState={
          loading
            ? "Carregando..."
            : "Nenhum fardo registrado ainda"
        }
        columns={embalagemColumns()}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

function embalagemColumns(): DataListingColumn<Embalagem>[] {
  return [
    {
      id: "id",
      label: "ID",
      fixed: true,
      sortable: true,
      width: "70px",
      render: (e) => (
        <CellMonoStrong>#{e.id?.slice(-6).toUpperCase()}</CellMonoStrong>
      ),
    },
    {
      id: "material",
      label: "Material",
      sortable: true,
      width: "130px",
      render: (e) => (
        <div className="truncate max-w-[120px]" title={e.material || ""}>
          <span className="text-[11px] font-medium text-[var(--fips-fg)]">{e.material || "—"}</span>
        </div>
      ),
    },
    {
      id: "cor",
      label: "Cor",
      sortable: true,
      width: "100px",
      render: (e) => (
        <div className="flex items-center gap-1.5">
          <Palette className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="text-[11px] text-[var(--fips-fg)]">{e.cor || "—"}</span>
        </div>
      ),
    },
    {
      id: "medida",
      label: "Medida",
      sortable: true,
      width: "90px",
      render: (e) => <CellMonoMuted>{e.medida || "—"}</CellMonoMuted>,
    },
    {
      id: "peso",
      label: "Peso (kg)",
      sortable: true,
      align: "right",
      width: "85px",
      render: (e) => (
        <div className="text-right">
          <CellMonoStrong align="right">{formatKg(e.pesoFardo)}</CellMonoStrong>
          {e.pesoEntrada > 0 && (
            <div className="text-[9px] text-[var(--fips-fg-muted)]">
              entrada: {e.pesoEntrada?.toLocaleString("pt-BR")} kg
            </div>
          )}
        </div>
      ),
    },
    {
      id: "qtdePacotes",
      label: "Pacotes",
      sortable: true,
      align: "right",
      width: "70px",
      render: (e) => (
        <CellMonoStrong align="right">
          {e.qtdePacotes > 0 ? e.qtdePacotes : "—"}
        </CellMonoStrong>
      ),
    },
    {
      id: "fardo",
      label: "Fardo",
      sortable: true,
      width: "100px",
      render: (e) => (
        <div className="truncate max-w-[90px]" title={e.tipoEmbalagem || ""}>
          <span className="text-[11px] text-[var(--fips-fg)]">{e.tipoEmbalagem || "—"}</span>
        </div>
      ),
    },
    {
      id: "operador",
      label: "Operador",
      sortable: true,
      width: "110px",
      render: (e) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="text-[11px] text-[var(--fips-fg)] truncate max-w-[85px]">{e.operador || "—"}</span>
        </div>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "110px",
      render: (e) => {
        const sc = STATUS_VARIANTS[e.status] || {
          label: e.status || "—",
          variant: "secondary" as const,
        };
        return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
      },
    },
    {
      id: "data",
      label: "Data",
      sortable: true,
      width: "80px",
      render: (e) => <CellMonoMuted>{formatDateBR(e.createdAt)}</CellMonoMuted>,
    },
  ];
}
