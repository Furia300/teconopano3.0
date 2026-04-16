import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Factory,
  QrCode,
  Weight,
  Package,
  CheckCircle2,
  ChevronLeft,
  User,
  Search,
  Clock,
  X,
  Play,
  Square,
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

/* ─── Cores FIPS DS canonicas ─── */
const FIPS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
  danger: "#DC3545",
};

/* ─── Salas de producao ─── */
const SALAS = [
  "O1","O2","O3","O4","O5","O6","O7","O8",
  "COBERTORIO","CORTE 01","CORTE 02","CORTE 03","CORTE 04","CORTE 05",
  "FAIXA","CORTE VLI",
];

/* ─── Tipos ─── */
interface Producao {
  id: string;
  coletaId: string;
  qrCodeId: string;
  fornecedor: string;
  sala: string;
  tipoMaterial: string;
  cor: string;
  pesoEntrada: number;
  pesoProduzido: number | null;
  qtdePacotes: number | null;
  operador: string;
  status: "em_andamento" | "finalizado";
  horarioInicio: string;
  horarioFim: string | null;
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
  em_andamento: { label: "Em Andamento", variant: "info" },
  finalizado: { label: "Finalizado", variant: "success" },
};

const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "\u2014";

const formatTimeBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "\u2014";

const formatKg = (n: number | null | undefined) =>
  n != null && n > 0 ? `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg` : "\u2014";

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

  /* ─── State: QR scan panel ─── */
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<QRScanResult | null>(null);
  const [qrError, setQrError] = useState("");
  const qrInputRef = useRef<HTMLInputElement>(null);

  /* ─── State: production start form ─── */
  const [formSala, setFormSala] = useState("");
  const [formCor, setFormCor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ─── State: finalizar inline ─── */
  const [finalizarId, setFinalizarId] = useState<string | null>(null);
  const [finPesoProduzido, setFinPesoProduzido] = useState("");
  const [finQtdePacotes, setFinQtdePacotes] = useState("");
  const [finSubmitting, setFinSubmitting] = useState(false);

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
    const emAndamento = producoes.filter((p) => p.status === "em_andamento").length;
    const hoje = new Date().toISOString().slice(0, 10);
    const finalizadasHoje = producoes.filter(
      (p) => p.status === "finalizado" && p.horarioFim && p.horarioFim.slice(0, 10) === hoje,
    ).length;
    const pesoProduzido = producoes
      .filter((p) => p.status === "finalizado")
      .reduce((acc, p) => acc + (p.pesoProduzido ?? 0), 0);
    const colaboradores = new Set(producoes.map((p) => p.operador)).size;
    return { emAndamento, finalizadasHoje, pesoProduzido, colaboradores };
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
        p.operador.toLowerCase().includes(q) ||
        (p.cor || "").toLowerCase().includes(q);
      const matchSala = !filterSala || p.sala === filterSala;
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchSala && matchStatus;
    });
  }, [producoes, search, filterSala, filterStatus]);

  const activeFilters = [filterSala, filterStatus].filter(Boolean).length;

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
      setFormSala("");
      setFormCor("");
    } catch {
      setQrError("Erro de conexao. Verifique sua rede.");
    } finally {
      setQrLoading(false);
    }
  };

  /* ─── QR Input key handler ─── */
  const handleQrKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQrScan();
    }
  };

  /* ─── Iniciar Producao ─── */
  const handleIniciarProducao = async () => {
    if (!qrData) return;
    if (!formSala) {
      toast.error("Selecione a sala de producao");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        coletaId: qrData.coletaId,
        qrCodeId: qrData.id,
        fornecedor: qrData.fornecedor,
        sala: formSala,
        tipoMaterial: qrData.tipoMaterial,
        cor: qrData.cor || formCor || "",
        pesoEntrada: qrData.peso,
        operador: me.nome,
        status: "em_andamento",
        horarioInicio: new Date().toISOString(),
      };

      const res = await fetch("/api/producoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      toast.success("Producao iniciada!");
      fetchProducoes();

      // Reset for next scan
      setQrData(null);
      setQrInput("");
      setFormSala("");
      setFormCor("");
      setTimeout(() => qrInputRef.current?.focus(), 100);
    } catch {
      toast.error("Erro ao iniciar producao. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Finalizar Producao ─── */
  const handleFinalizarProducao = async () => {
    if (!finalizarId) return;
    const peso = parseFloat(finPesoProduzido);
    const pacotes = parseInt(finQtdePacotes, 10);

    if (!peso || peso <= 0) {
      toast.error("Informe o peso produzido");
      return;
    }
    if (!pacotes || pacotes <= 0) {
      toast.error("Informe a quantidade de pacotes");
      return;
    }

    setFinSubmitting(true);
    try {
      const body = {
        pesoProduzido: peso,
        qtdePacotes: pacotes,
        horarioFim: new Date().toISOString(),
        status: "finalizado",
      };

      const res = await fetch(`/api/producoes/${finalizarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      toast.success("Producao finalizada!");
      setFinalizarId(null);
      setFinPesoProduzido("");
      setFinQtdePacotes("");
      fetchProducoes();
    } catch {
      toast.error("Erro ao finalizar producao.");
    } finally {
      setFinSubmitting(false);
    }
  };

  /* ─── Close QR panel ─── */
  const closeQrPanel = () => {
    setShowQrPanel(false);
    setQrData(null);
    setQrInput("");
    setQrError("");
    setFormSala("");
    setFormCor("");
  };

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                                   */
  /* ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ─── PageHeader ─── */}
      <PageHeader
        title="Producao"
        description="Salas de corte e processamento de material"
        icon={Factory}
        stats={[
          { label: "Em Andamento", value: stats.emAndamento, color: "#93BDE4" },
          { label: "Finalizadas Hoje", value: stats.finalizadasHoje, color: "#00C64C" },
          { label: "Peso Produzido", value: `${stats.pesoProduzido.toLocaleString("pt-BR")}kg`, color: "#FDC24E" },
          { label: "Colaboradores", value: stats.colaboradores, color: "#ed1b24" },
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

      {/* ─── Cards Relatorio ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Em Andamento"
          value={stats.emAndamento}
          subtitle="Producoes ativas agora"
          icon={Clock}
          color={FIPS.azulProfundo}
        />
        <StatsCard
          label="Finalizadas Hoje"
          value={stats.finalizadasHoje}
          subtitle="Concluidas no dia"
          icon={CheckCircle2}
          color={FIPS.verdeFloresta}
        />
        <StatsCard
          label="Peso Produzido"
          value={`${stats.pesoProduzido.toLocaleString("pt-BR")} kg`}
          subtitle="Total finalizado"
          icon={Weight}
          color={FIPS.amareloEscuro}
        />
        <StatsCard
          label="Colaboradores"
          value={stats.colaboradores}
          subtitle="Operadores ativos"
          icon={User}
          color={FIPS.azulEscuro}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  QR SCAN + START PRODUCTION PANEL                                 */}
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
                  {me.nome} -- Escaneie o QR, selecione a sala e inicie a producao
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
                ? FIPS.verdeFloresta
                : qrError
                  ? FIPS.danger
                  : "var(--fips-border)",
              background: qrData
                ? `${FIPS.verdeFloresta}06`
                : "var(--fips-surface)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  background: qrData
                    ? `${FIPS.verdeFloresta}15`
                    : `${FIPS.azulProfundo}15`,
                }}
              >
                <QrCode
                  className="h-5 w-5"
                  style={{
                    color: qrData ? FIPS.verdeFloresta : FIPS.azulProfundo,
                  }}
                />
              </div>
              <div>
                <p
                  className="text-[12px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    color: qrData ? FIPS.verdeFloresta : FIPS.azulProfundo,
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

          {/* ─── QR Data Card + Start Form ─── */}
          {qrData && (
            <div className="space-y-4">
              {/* Material info from QR -- read only */}
              <div
                className="rounded-lg border-2 p-5"
                style={{
                  borderColor: FIPS.verdeFloresta,
                  background: `${FIPS.verdeFloresta}06`,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-4 w-4" style={{ color: FIPS.verdeFloresta }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FIPS.verdeFloresta, fontFamily: "'Saira Expanded', sans-serif" }}
                  >
                    Dados do Lote (Auto-preenchido)
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

                  {/* Cor */}
                  {qrData.cor ? (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                        Cor (auto)
                      </div>
                      <div className="text-[13px] font-bold text-[var(--fips-fg)]">
                        {qrData.cor}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-amber-600 mb-1">
                        Cor (manual)
                      </div>
                      <Input
                        density="compact"
                        placeholder="Informe a cor"
                        value={formCor}
                        onChange={(e) => setFormCor(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Peso */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">
                      Peso Entrada
                    </div>
                    <div
                      className="text-[16px] font-extrabold"
                      style={{ color: FIPS.verdeFloresta, fontFamily: "'Saira Expanded', sans-serif" }}
                    >
                      {qrData.peso.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Start Production Form ─── */}
              <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="h-4 w-4" style={{ color: FIPS.azulProfundo }} />
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FIPS.azulProfundo, fontFamily: "'Saira Expanded', sans-serif" }}
                  >
                    Iniciar Producao
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
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
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>

                  {/* Operador (readonly) */}
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--fips-fg-muted)]" />
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)]">
                        Operador
                      </div>
                      <div className="text-[13px] font-bold text-[var(--fips-fg)]">{me.nome}</div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleIniciarProducao}
                    disabled={submitting || !formSala}
                    className="flex-1"
                    style={{
                      background: submitting ? undefined : `linear-gradient(135deg, ${FIPS.azulProfundo}, ${FIPS.azulEscuro})`,
                      fontSize: "14px",
                      fontWeight: 700,
                      padding: "12px 24px",
                    }}
                  >
                    {submitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                    Iniciar Producao
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setQrData(null);
                    setQrInput("");
                    setFormSala("");
                    setFormCor("");
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
      {/*  FINALIZAR INLINE FORM                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {finalizarId && (
        <div
          className="rounded-lg border-2 p-5"
          style={{ borderColor: FIPS.amareloEscuro, background: `${FIPS.amareloEscuro}08` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Square className="h-4 w-4" style={{ color: FIPS.amareloEscuro }} />
            <span
              className="text-[12px] font-bold uppercase tracking-[0.06em]"
              style={{ color: FIPS.amareloEscuro, fontFamily: "'Saira Expanded', sans-serif" }}
            >
              Finalizar Producao
            </span>
            <span className="text-[10px] text-[var(--fips-fg-muted)] ml-2">
              ID: {finalizarId.slice(0, 8)}...
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Field density="compact">
              <FieldLabel>Peso Produzido (kg) *</FieldLabel>
              <Input
                density="compact"
                leftIcon={<Weight className="h-3.5 w-3.5" />}
                type="number"
                min="0"
                step="0.1"
                placeholder="0.0"
                value={finPesoProduzido}
                onChange={(e) => setFinPesoProduzido(e.target.value)}
                autoFocus
              />
            </Field>
            <Field density="compact">
              <FieldLabel>Qtde Pacotes *</FieldLabel>
              <Input
                density="compact"
                leftIcon={<Package className="h-3.5 w-3.5" />}
                type="number"
                min="1"
                placeholder="0"
                value={finQtdePacotes}
                onChange={(e) => setFinQtdePacotes(e.target.value)}
              />
            </Field>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleFinalizarProducao}
                disabled={finSubmitting}
                className="flex-1"
                style={{
                  background: finSubmitting ? undefined : FIPS.verdeFloresta,
                }}
              >
                {finSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Finalizar Producao
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFinalizarId(null);
                  setFinPesoProduzido("");
                  setFinQtdePacotes("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  DATA LISTING                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por operador, material, sala ou fornecedor..."
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
                  { v: "em_andamento", l: "Em Andamento" },
                  { v: "finalizado", l: "Finalizado" },
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
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel -- placeholder")}
        onExportPdf={() => alert("Export PDF -- placeholder")}
      />

      {/* ─── Tabela ─── */}
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
        columns={producaoColumns({
          onFinalizar: (id) => {
            setFinalizarId(id);
            setFinPesoProduzido("");
            setFinQtdePacotes("");
          },
        })}
      />
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

interface ProducaoColumnActions {
  onFinalizar: (id: string) => void;
}

function producaoColumns({ onFinalizar }: ProducaoColumnActions): DataListingColumn<Producao>[] {
  return [
    {
      id: "sala",
      label: "Sala",
      fixed: true,
      sortable: true,
      width: "100px",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Factory className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <CellMonoStrong>{p.sala}</CellMonoStrong>
        </div>
      ),
    },
    {
      id: "operador",
      label: "Operador",
      sortable: true,
      width: "120px",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-[var(--fips-fg-muted)]" />
          <span className="text-[11px] font-semibold text-[var(--fips-fg)] truncate max-w-[100px]">
            {p.operador}
          </span>
        </div>
      ),
    },
    {
      id: "material",
      label: "Material",
      sortable: true,
      width: "120px",
      render: (p) => <Badge variant="outline">{p.tipoMaterial}</Badge>,
    },
    {
      id: "cor",
      label: "Cor",
      sortable: true,
      width: "80px",
      render: (p) => <CellMuted>{p.cor || "\u2014"}</CellMuted>,
    },
    {
      id: "pesoEntrada",
      label: "Peso Entrada",
      sortable: true,
      align: "right",
      width: "95px",
      render: (p) => <CellMonoStrong align="right">{formatKg(p.pesoEntrada)}</CellMonoStrong>,
    },
    {
      id: "pesoProduzido",
      label: "Peso Produzido",
      sortable: true,
      align: "right",
      width: "105px",
      render: (p) => (
        <CellMonoStrong align="right" style={{ color: p.pesoProduzido ? "#00C64C" : undefined }}>
          {formatKg(p.pesoProduzido)}
        </CellMonoStrong>
      ),
    },
    {
      id: "pacotes",
      label: "Pacotes",
      sortable: true,
      align: "right",
      width: "70px",
      render: (p) => <CellMonoMuted>{p.qtdePacotes ?? "\u2014"}</CellMonoMuted>,
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "105px",
      render: (p) => {
        const sc = STATUS_VARIANTS[p.status] || { label: p.status, variant: "secondary" as const };
        return <Badge variant={sc.variant} dot>{sc.label}</Badge>;
      },
    },
    {
      id: "inicio",
      label: "Inicio",
      sortable: true,
      width: "90px",
      render: (p) => (
        <div className="leading-tight">
          <CellMonoMuted>{formatDateBR(p.horarioInicio)}</CellMonoMuted>
          <div className="text-[9px] text-[var(--fips-fg-muted)] font-mono">{formatTimeBR(p.horarioInicio)}</div>
        </div>
      ),
    },
    {
      id: "fim",
      label: "Fim",
      sortable: true,
      width: "90px",
      render: (p) => p.horarioFim ? (
        <div className="leading-tight">
          <CellMonoMuted>{formatDateBR(p.horarioFim)}</CellMonoMuted>
          <div className="text-[9px] text-[var(--fips-fg-muted)] font-mono">{formatTimeBR(p.horarioFim)}</div>
        </div>
      ) : (
        <CellMuted>...</CellMuted>
      ),
    },
    {
      id: "actions",
      label: "Acao",
      fixed: true,
      align: "center",
      width: "80px",
      render: (p) => {
        if (p.status === "em_andamento") {
          return (
            <CellActions>
              <CellActionButton
                title="Finalizar producao"
                icon={<Square className="h-3.5 w-3.5 text-[var(--fips-warning)]" />}
                onClick={() => onFinalizar(p.id)}
              />
            </CellActions>
          );
        }
        return (
          <CellActions>
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--fips-success-strong)]" />
          </CellActions>
        );
      },
    },
  ];
}
