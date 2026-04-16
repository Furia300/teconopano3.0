import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Factory,
  Plus,
  QrCode,
  Weight,
  Package,
  Ruler,
  Eye,
  CheckCircle2,
  ChevronLeft,
  User,
  Search,
  Scissors,
  Palette,
  Layers,
  X,
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
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";
import { NovaProducaoDialog } from "./NovaProducaoDialog";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";

/* ─── Cores FIPS DS canonicas para os Cards Relatorio ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
  danger: "#DC3545",
};

/* ─── Tipos ─── */
interface Producao {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  sala: string;
  tipoMaterial: string;
  cor: string;
  acabamento: string;
  medida: string;
  kilo: number;
  pesoMedio: number;
  qtdePacote: number;
  unidadeSaida: string;
  statusEstoque: string;
  operador: string;
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

const SALAS = [
  "CORTE 01", "CORTE 02", "CORTE 03", "CORTE 04", "CORTE 05",
  "CORTE VLI", "FAIXA",
];

const salaSaidaMap: Record<string, string> = {
  "CORTE 01": "unidade",
  "CORTE 02": "unidade",
  "CORTE 03": "unidade",
  "CORTE 04": "unidade",
  "CORTE 05": "kilo",
  "CORTE VLI": "kilo",
  "FAIXA": "kilo",
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }
> = {
  pendente: { label: "Pendente", variant: "warning" },
  em_estoque: { label: "No Estoque", variant: "success" },
  em_andamento: { label: "Em Andamento", variant: "info" },
};

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "\u2014";

const formatKg = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} kg` : "\u2014";

/* ─── Componente principal ─── */
export default function ProducaoList() {
  const me = useAppAuthMe();

  /* ─── State: listing ─── */
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Ultimos 30 dias");
  const [filterSala, setFilterSala] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSaida, setFilterSaida] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ─── State: QR scan panel ─── */
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<QRScanResult | null>(null);
  const [qrError, setQrError] = useState("");
  const qrInputRef = useRef<HTMLInputElement>(null);

  /* ─── State: production form (auto-filled from QR) ─── */
  const [formSala, setFormSala] = useState("");
  const [formCor, setFormCor] = useState(""); // manual se QR não tem cor
  const [formAcabamento, setFormAcabamento] = useState("");
  const [formMedida, setFormMedida] = useState("");
  const [formQtdePacote, setFormQtdePacote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ─── Produtos para cascata acabamento/medida ─── */
  const [produtos, setProdutos] = useState<{ tipoMaterial: string; cor: string; medida: string; pesoMedio: number }[]>([]);
  useEffect(() => {
    fetch("/api/produtos")
      .then((r) => r.json())
      .then((data: any[]) =>
        setProdutos(
          data.map((p: any) => ({
            tipoMaterial: (p.tipoMaterial || "").trim(),
            cor: (p.cor || "").trim(),
            medida: (p.medida || "").trim(),
            pesoMedio: p.pesoMedio || 0,
          })),
        ),
      )
      .catch(() => {});
  }, []);

  /* Acabamentos filtrados pelo material do QR */
  const acabamentosDoMaterial = useMemo(() => {
    if (!qrData?.tipoMaterial) return [];
    const norm = qrData.tipoMaterial.replace(/\s+/g, " ").trim().toLowerCase();
    const set = new Set(
      produtos
        .filter((p) => p.tipoMaterial.replace(/\s+/g, " ").trim().toLowerCase() === norm)
        .map((p) => p.medida)
        .filter(Boolean),
    );
    return Array.from(set).sort();
  }, [produtos, qrData?.tipoMaterial]);

  /* Medidas filtradas */
  const medidasDoMaterial = useMemo(() => {
    if (!qrData?.tipoMaterial) return [];
    const norm = qrData.tipoMaterial.replace(/\s+/g, " ").trim().toLowerCase();
    const set = new Set(
      produtos
        .filter((p) => p.tipoMaterial.replace(/\s+/g, " ").trim().toLowerCase() === norm)
        .map((p) => p.medida)
        .filter(Boolean),
    );
    return Array.from(set).sort();
  }, [produtos, qrData?.tipoMaterial]);

  /* Unidade de saida automatica pela sala */
  const unidadeSaida = useMemo(() => {
    return formSala ? (salaSaidaMap[formSala] || "unidade") : "";
  }, [formSala]);

  /* ─── Fetch producoes ─── */
  const fetchProducoes = useCallback(async () => {
    try {
      const res = await fetch("/api/producoes");
      const data = await res.json();
      setProducoes(data);
    } catch (err) {
      console.error("Erro ao buscar producoes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducoes();
  }, [fetchProducoes]);

  /* ─── Auto-focus QR input ─── */
  useEffect(() => {
    if (showQrPanel && qrInputRef.current) {
      qrInputRef.current.focus();
    }
  }, [showQrPanel]);

  /* ─── Stats memoizados ─── */
  const stats = useMemo(() => {
    let pesoTotal = 0;
    let porUnidade = 0;
    let porKilo = 0;
    for (let i = 0; i < producoes.length; i++) {
      const p = producoes[i];
      pesoTotal += p.kilo;
      if (p.unidadeSaida === "unidade") porUnidade++;
      else if (p.unidadeSaida === "kilo") porKilo++;
    }
    return {
      total: producoes.length,
      pesoTotal,
      porUnidade,
      porKilo,
    };
  }, [producoes]);

  /* ─── Contagem por sala ─── */
  const countBySala = useMemo(() => {
    const m: Record<string, number> = {};
    for (let i = 0; i < producoes.length; i++) {
      const s = producoes[i].sala;
      m[s] = (m[s] || 0) + 1;
    }
    return m;
  }, [producoes]);

  /* ─── Dados filtrados ─── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return producoes.filter((p) => {
      const matchSearch =
        !q ||
        p.fornecedor.toLowerCase().includes(q) ||
        p.tipoMaterial.toLowerCase().includes(q) ||
        p.sala.toLowerCase().includes(q) ||
        String(p.coletaNumero).includes(q);
      const matchSala = !filterSala || p.sala === filterSala;
      const matchStatus = !filterStatus || p.statusEstoque === filterStatus;
      const matchSaida = !filterSaida || p.unidadeSaida === filterSaida;
      return matchSearch && matchSala && matchStatus && matchSaida;
    });
  }, [producoes, search, filterSala, filterStatus, filterSaida]);

  const activeFilters = [filterSala, filterStatus, filterSaida].filter(Boolean).length;

  /* ─── QR Scan handler ─── */
  const handleQrScan = async (code?: string) => {
    const codigo = (code || qrInput).trim();
    if (!codigo) {
      setQrError("Digite ou escaneie um codigo QR");
      return;
    }

    setQrLoading(true);
    setQrError("");
    setQrData(null);

    try {
      const res = await fetch(`/api/qr-codes/scan/${encodeURIComponent(codigo)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setQrError("QR Code nao encontrado. Verifique o codigo e tente novamente.");
        } else {
          setQrError("Erro ao buscar QR Code. Tente novamente.");
        }
        return;
      }
      const data: QRScanResult = await res.json();
      setQrData(data);
      setQrError("");
      toast.success("QR Code escaneado com sucesso!");

      // Reset form fields for manual input
      setFormSala("");
      setFormAcabamento("");
      setFormMedida("");
      setFormQtdePacote("");
    } catch {
      setQrError("Erro de conexao. Verifique sua rede.");
    } finally {
      setQrLoading(false);
    }
  };

  /* ─── QR Input key handler (Enter = scan, for barcode scanner) ─── */
  const handleQrKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQrScan();
    }
  };

  /* ─── Submit production from QR data ─── */
  const handleSubmitProducao = async () => {
    if (!qrData) return;
    if (!formSala) { toast.error("Selecione a sala de producao"); return; }

    setSubmitting(true);
    try {
      const body = {
        coletaId: qrData.coletaId,
        coletaNumero: qrData.coletaNumero || qrData.coleta?.numero,
        fornecedor: qrData.fornecedor,
        sala: formSala,
        tipoMaterial: qrData.tipoMaterial,
        cor: qrData.cor || formCor || "",
        acabamento: formAcabamento || null,
        medida: formMedida || null,
        kilo: qrData.peso,
        qtdePacote: formQtdePacote ? parseInt(formQtdePacote, 10) : null,
        unidadeSaida: unidadeSaida || "unidade",
        operador: me.nome,
        qrCodeId: qrData.id,
      };

      const res = await fetch("/api/producoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      toast.success("Producao registrada com sucesso!");
      fetchProducoes();

      // Reset QR panel
      setQrData(null);
      setQrInput("");
      setFormSala("");
      setFormAcabamento("");
      setFormMedida("");
      setFormQtdePacote("");

      // Re-focus for next scan
      setTimeout(() => qrInputRef.current?.focus(), 100);
    } catch {
      toast.error("Erro ao registrar producao. Tente novamente.");
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
    setFormSala("");
    setFormAcabamento("");
    setFormMedida("");
    setFormQtdePacote("");
  };

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                                   */
  /* ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ─── PageHeader com stats pills ─── */}
      <PageHeader
        title="Producao"
        description="Salas de corte e processamento de material"
        icon={Factory}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Peso Total", value: `${stats.pesoTotal.toLocaleString("pt-BR")}kg`, color: "#00C64C" },
          { label: "Por Unidade", value: stats.porUnidade, color: "#FDC24E" },
          { label: "Por Kilo", value: stats.porKilo, color: "#ed1b24" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant={showQrPanel ? "default" : "outline"}
              onClick={() => {
                if (showQrPanel) {
                  closeQrPanel();
                } else {
                  setShowQrPanel(true);
                }
              }}
            >
              <QrCode className="h-4 w-4" />
              Escanear QR
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Registrar Producao
            </Button>
          </div>
        }
      />

      {/* ─── Cards Relatorio -- padrao FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Producoes"
          value={stats.total}
          subtitle="Registradas no sistema"
          icon={Factory}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Peso Total"
          value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`}
          subtitle="Material processado"
          icon={Weight}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Saida Unidade"
          value={stats.porUnidade}
          subtitle="Producoes por unidade"
          icon={Package}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Saida Kilo"
          value={stats.porKilo}
          subtitle="Producoes por kilo"
          icon={Ruler}
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
                    Leitura automatica de lote
                  </span>
                </h3>
                <p className="text-white/50 text-[11px]">
                  {me.nome} -- Escaneie ou digite o codigo do QR para auto-preencher a producao
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
                  style={{
                    color: qrData ? FIPS_COLORS.verdeFloresta : FIPS_COLORS.azulProfundo,
                  }}
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
                    ? `Codigo: ${qrData.codigo}`
                    : "Posicione o leitor ou digite o codigo manualmente"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  ref={qrInputRef}
                  density="compact"
                  leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Escanear ou digitar codigo... (ex: TN-MO0MYNSW-KKJU)"
                  value={qrInput}
                  onChange={(e) => {
                    setQrInput(e.target.value);
                    setQrError("");
                  }}
                  onKeyDown={handleQrKeyDown}
                  className="font-mono text-[13px] tracking-wide"
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <Button
                onClick={() => handleQrScan()}
                disabled={qrLoading || !qrInput.trim()}
              >
                {qrLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>

            {/* Error message */}
            {qrError && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2">
                <X className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-[11px] text-red-500">{qrError}</p>
              </div>
            )}
          </div>

          {/* ─── QR Data Card (when scanned) ─── */}
          {qrData && (
            <div className="space-y-4">
              {/* Material info from QR -- read only */}
              <div
                className="rounded-lg border-2 p-5"
                style={{
                  borderColor: FIPS_COLORS.verdeFloresta,
                  background: `${FIPS_COLORS.verdeFloresta}06`,
                }}
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Fornecedor */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Fornecedor
                    </div>
                    <div className="text-[13px] font-bold text-[var(--fips-fg)]">
                      {qrData.fornecedor}
                    </div>
                  </div>

                  {/* Material */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Material
                    </div>
                    <div className="text-[13px] font-bold text-[var(--fips-fg)]">
                      {qrData.tipoMaterial}
                    </div>
                  </div>

                  {/* Cor — auto se QR tem, manual se não */}
                  {qrData.cor ? (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">Cor (auto)</div>
                      <div className="text-[13px] font-bold text-[var(--fips-fg)]">{qrData.cor}</div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-amber-600 mb-1">Cor (manual)</div>
                      <Select density="compact" value={formCor} onChange={(e: any) => setFormCor(e.target.value)}>
                        <option value="">Selecione a cor</option>
                        {[...new Set(produtos.filter(p => p.tipoMaterial === qrData.tipoMaterial).map(p => p.cor).filter(Boolean))].sort().map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Peso */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Peso
                    </div>
                    <div
                      className="text-[16px] font-extrabold"
                      style={{ color: FIPS_COLORS.verdeFloresta, fontFamily: "'Saira Expanded', sans-serif" }}
                    >
                      {qrData.peso.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg
                    </div>
                  </div>

                  {/* Coleta */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Coleta
                    </div>
                    <div className="text-[13px] font-bold text-[var(--fips-fg)]">
                      #{qrData.coletaNumero || qrData.coleta?.numero || "\u2014"}
                    </div>
                    {qrData.coleta?.dataColeta && (
                      <div className="text-[9px] text-[var(--fips-fg-muted)]">
                        {formatDateBR(qrData.coleta.dataColeta)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Production Form -- manual fields ─── */}
              <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors className="h-4 w-4" style={{ color: FIPS_COLORS.azulProfundo }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FIPS_COLORS.azulProfundo, fontFamily: "'Saira Expanded', sans-serif" }}
                  >
                    Dados da Producao (Preencher)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {/* Sala */}
                  <Field density="compact">
                    <FieldLabel>Sala de Producao *</FieldLabel>
                    <Select
                      density="compact"
                      leftIcon={<Factory className="h-3.5 w-3.5" />}
                      value={formSala}
                      onChange={(e) => setFormSala(e.target.value)}
                    >
                      <option value="">Selecione a sala...</option>
                      {SALAS.map((s) => (
                        <option key={s} value={s}>
                          {s} {countBySala[s] ? `(${countBySala[s]})` : ""}
                        </option>
                      ))}
                    </Select>
                    {formSala && (
                      <FieldHint>
                        Saida automatica: {salaSaidaMap[formSala] === "kilo" ? "Kilo" : "Unidade"}
                      </FieldHint>
                    )}
                  </Field>

                  {/* Acabamento */}
                  <Field density="compact">
                    <FieldLabel>Acabamento</FieldLabel>
                    <Select
                      density="compact"
                      leftIcon={<Palette className="h-3.5 w-3.5" />}
                      value={formAcabamento}
                      onChange={(e) => setFormAcabamento(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {acabamentosDoMaterial.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </Select>
                  </Field>

                  {/* Medida */}
                  <Field density="compact">
                    <FieldLabel>Medida</FieldLabel>
                    <Select
                      density="compact"
                      leftIcon={<Ruler className="h-3.5 w-3.5" />}
                      value={formMedida}
                      onChange={(e) => setFormMedida(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {medidasDoMaterial.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </Field>

                  {/* Qtde Pacote */}
                  <Field density="compact">
                    <FieldLabel>Qtde Pacotes</FieldLabel>
                    <Input
                      density="compact"
                      leftIcon={<Layers className="h-3.5 w-3.5" />}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formQtdePacote}
                      onChange={(e) => setFormQtdePacote(e.target.value)}
                    />
                  </Field>
                </div>

                {/* Operador info + unidade saida */}
                <div className="flex items-center justify-between rounded-lg bg-[var(--fips-surface-soft)] border border-[var(--fips-border)] px-4 py-2.5 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                      <span className="text-[10px] text-[var(--fips-fg-muted)]">Operador:</span>
                      <span className="text-[10px] font-bold text-[var(--fips-fg)]">{me.nome}</span>
                    </div>
                    {formSala && (
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                        <span className="text-[10px] text-[var(--fips-fg-muted)]">Saida:</span>
                        <Badge variant={unidadeSaida === "kilo" ? "info" : "success"} className="text-[9px]">
                          {unidadeSaida === "kilo" ? "Kilo" : "Unidade"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitProducao}
                    disabled={submitting || !formSala}
                    className="flex-1"
                  >
                    {submitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Registrar Producao
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setQrData(null);
                    setQrInput("");
                    setFormSala("");
                    setFormAcabamento("");
                    setFormMedida("");
                    setFormQtdePacote("");
                    setTimeout(() => qrInputRef.current?.focus(), 100);
                  }}>
                    <QrCode className="h-4 w-4" />
                    Novo Scan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  DATA LISTING (always visible)                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ─── Toolbar -- padrao FIPS DS Data Listing ─── */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por fornecedor, material, sala ou coleta..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            {/* Sala */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Sala
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFilterSala("")}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    !filterSala
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  Todas as salas
                </button>
                {SALAS.map((sala) => (
                  <button
                    key={sala}
                    onClick={() => setFilterSala(sala)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterSala === sala
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {sala}
                  </button>
                ))}
              </div>
            </div>

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
                  { v: "em_estoque", l: "No Estoque" },
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

            {/* Unidade de Saida */}
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                Unidade de Saida
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todas" },
                  { v: "unidade", l: "Unidade" },
                  { v: "kilo", l: "Kilo" },
                ].map((opt) => (
                  <button
                    key={opt.v || "todos-saida"}
                    onClick={() => setFilterSaida(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                      filterSaida === opt.v
                        ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                        : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel -- placeholder")}
        onExportPdf={() => alert("Export PDF -- placeholder")}
      />

      {/* ─── Tabela canonica DS-FIPS -- Data Listing ─── */}
      <DataListingTable<Producao>
        icon={<Factory className="h-[22px] w-[22px]" />}
        title="Producao"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          activeFilters || search ? "filtrados" : "no total"
        } \u00b7 Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(p) => p.id}
        emptyState={
          loading
            ? "Carregando..."
            : "Nenhuma producao encontrada"
        }
        columns={producaoColumns()}
      />

      <NovaProducaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchProducoes}
        salas={SALAS}
        salaSaidaMap={salaSaidaMap}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

function producaoColumns(): DataListingColumn<Producao>[] {
  return [
    {
      id: "coleta",
      label: "Coleta",
      fixed: true,
      sortable: true,
      width: "80px",
      render: (p) => <CellMonoStrong>#{p.coletaNumero}</CellMonoStrong>,
    },
    {
      id: "sala",
      label: "Sala",
      sortable: true,
      width: "100px",
      render: (p) => <Badge variant="outline">{p.sala}</Badge>,
    },
    {
      id: "material",
      label: "Material",
      sortable: true,
      width: "130px",
      render: (p) => (
        <div className="truncate max-w-[120px]" title={p.tipoMaterial}>
          <span className="text-[11px] text-[var(--fips-fg)]">{p.tipoMaterial}</span>
        </div>
      ),
    },
    {
      id: "cor",
      label: "Cor",
      sortable: true,
      width: "90px",
      render: (p) => <CellMuted>{p.cor || "\u2014"}</CellMuted>,
    },
    {
      id: "medida",
      label: "Medida",
      sortable: true,
      width: "80px",
      render: (p) => <CellMuted>{p.medida || "\u2014"}</CellMuted>,
    },
    {
      id: "acabamento",
      label: "Acabamento",
      sortable: true,
      width: "100px",
      render: (p) => <CellMuted>{p.acabamento || "\u2014"}</CellMuted>,
    },
    {
      id: "peso",
      label: "Peso",
      sortable: true,
      align: "right",
      width: "90px",
      render: (p) => <CellMonoStrong align="right">{formatKg(p.kilo)}</CellMonoStrong>,
    },
    {
      id: "saida",
      label: "Saida",
      sortable: true,
      width: "75px",
      render: (p) => (
        <Badge variant={p.unidadeSaida === "kilo" ? "info" : "success"} className="text-[10px]">
          {p.unidadeSaida === "kilo" ? "Kilo" : "Unidade"}
        </Badge>
      ),
    },
    {
      id: "pacotes",
      label: "Pacotes",
      sortable: true,
      align: "right",
      width: "70px",
      render: (p) => <CellMonoMuted>{p.qtdePacote || "\u2014"}</CellMonoMuted>,
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "95px",
      render: (p) => {
        const sc = statusConfig[p.statusEstoque] || {
          label: p.statusEstoque,
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
      render: (p) => <CellMonoMuted>{formatDateBR(p.dataCriacao)}</CellMonoMuted>,
    },
    {
      id: "actions",
      label: "Acao",
      fixed: true,
      align: "center",
      width: "50px",
      render: (p) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => console.log("Ver producao:", p.id)}
          />
        </CellActions>
      ),
    },
  ];
}
