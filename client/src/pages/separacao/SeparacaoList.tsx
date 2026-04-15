import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  ClipboardList, Plus, QrCode, Factory, Droplets, Scissors, Gift, Trash2,
  ChevronLeft, Weight, Package, Truck, User, Calendar, CheckCircle2,
  AlertTriangle, Scale, ArrowDownUp, Barcode,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";
import { NovaSeparacaoDialog } from "./NovaSeparacaoDialog";

/* ─── Constants ─── */
const FIPS = {
  azulProfundo: "#004B9B", verdeFloresta: "#00C64C", amareloEscuro: "#F6921E",
  azulEscuro: "#002A68", danger: "#DC3545", gold: "#FDC24E",
};

const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

const DESTINOS = [
  { value: "producao", label: "Produção", color: "#004B9B", icon: Factory },
  { value: "costureira", label: "Costureira", color: "#F6921E", icon: Scissors },
  { value: "repanol", label: "Repanol", color: "#9B59B6", icon: Droplets },
  { value: "descarte", label: "Descarte", color: "#DC3545", icon: Trash2 },
  { value: "doacao", label: "Doação", color: "#00C64C", icon: Gift },
];

const destinoMap = Object.fromEntries(DESTINOS.map(d => [d.value, d]));

const FADE_IN = `@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`;
const formatDateBR = (s: string) => s ? new Date(s).toLocaleDateString("pt-BR") : "—";
const formatKg = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg`;

/* ─── Types ─── */
interface Coleta {
  id: string;
  numero: number;
  fornecedor: string;
  dataColeta: string;
  status: string;
  pesoTotalNF: number | null;
  pesoTotalAtual: number | null;
  notaFiscal: string | null;
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

/* ─── Status helpers ─── */
function statusVariant(s: string): "warning" | "info" | "success" | "secondary" {
  if (s === "em_triagem" || s === "Em Triagem") return "info";
  if (s === "triada" || s === "Triada" || s === "Concluída") return "success";
  return "warning";
}
function statusLabel(s: string): string {
  if (s === "em_triagem") return "Em Triagem";
  if (s === "triada") return "Triada";
  if (s === "pendente") return "Pendente";
  if (s === "recebido") return "Recebido";
  return s || "Pendente";
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  COLETA CARD — visual card for the grid                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ColetaCard({ coleta, onClick }: { coleta: Coleta; onClick: () => void }) {
  const pesoNF = coleta.pesoTotalNF ?? 0;
  const pesoAtual = coleta.pesoTotalAtual ?? 0;
  const hasPeso = pesoNF > 0 || pesoAtual > 0;

  return (
    <button onClick={onClick} className="group relative text-left transition-all duration-300" style={{
      background: "var(--fips-surface)",
      border: "2px solid var(--fips-border)",
      borderRadius: "12px 12px 12px 20px",
      padding: "16px",
      cursor: "pointer",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      minHeight: 130,
      width: "100%",
    }}>
      {/* Status indicator dot */}
      {coleta.status === "em_triagem" && (
        <div className="absolute top-3 right-3 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: FIPS.azulProfundo }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: FIPS.azulProfundo }} />
        </div>
      )}

      {/* Header: number + badge */}
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-4 w-4" style={{ color: "var(--fips-fg-muted)" }} />
        <span className="text-[15px] font-bold" style={{ fontFamily: "'Saira Expanded', sans-serif", color: FIPS.azulProfundo }}>
          #{coleta.numero}
        </span>
      </div>

      {/* Supplier */}
      <div className="text-[12px] font-semibold text-[var(--fips-fg)] truncate mb-1" title={coleta.fornecedor}>
        {coleta.fornecedor}
      </div>

      {/* Date */}
      <div className="flex items-center gap-1 text-[10px] text-[var(--fips-fg-muted)] mb-3">
        <Calendar className="h-3 w-3" />
        {formatDateBR(coleta.dataColeta)}
      </div>

      {/* Weight info */}
      {hasPeso && (
        <div className="flex gap-2 mb-3">
          {pesoNF > 0 && (
            <div className="rounded px-2 py-1 text-[9px] font-semibold" style={{ background: "var(--fips-surface-muted)", color: "var(--fips-fg-muted)" }}>
              NF: {formatKg(pesoNF)}
            </div>
          )}
          {pesoAtual > 0 && (
            <div className="rounded px-2 py-1 text-[9px] font-bold" style={{ background: `${FIPS.azulProfundo}15`, color: FIPS.azulProfundo }}>
              Atual: {formatKg(pesoAtual)}
            </div>
          )}
        </div>
      )}

      {/* Status badge */}
      <div className="absolute bottom-3 right-3">
        <Badge variant={statusVariant(coleta.status)} className="text-[9px]">
          {statusLabel(coleta.status)}
        </Badge>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-[12px_12px_12px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ boxShadow: `0 0 0 2px ${FIPS.azulProfundo}40, 0 8px 24px rgba(0,75,155,0.12)` }} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TROUXA TIMELINE ITEM                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
function TrouxaItem({ sep, qrCode, isLast }: { sep: Separacao; qrCode?: QRCode; isLast: boolean }) {
  const dest = destinoMap[sep.destino];
  const color = dest?.color || "#888";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: `${color}18`, border: `2px solid ${color}` }}>
          <CheckCircle2 className="h-3 w-3" style={{ color }} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 min-h-[20px]" style={{ background: "var(--fips-border)" }} />}
      </div>
      <div className="flex-1 pb-3">
        <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{sep.tipoMaterial}</Badge>
              {sep.cor && <span className="text-[10px] text-[var(--fips-fg-muted)]">{sep.cor}</span>}
            </div>
            <Badge variant={statusVariant(sep.destino === "producao" ? "em_triagem" : "triada")} dot className="text-[9px]" style={{ borderColor: color, color }}>
              {dest?.label || sep.destino}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--fips-fg-muted)] mt-1">
            <span className="flex items-center gap-1 font-bold text-[var(--fips-fg)]"><Scale className="h-3 w-3" />{formatKg(sep.peso)}</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{sep.colaborador}</span>
            {qrCode && (
              <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: FIPS.azulProfundo }}>
                <Barcode className="h-3 w-3" />{qrCode.codigo}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function SeparacaoList() {
  const me = useAppAuthMe();
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [coletaAberta, setColetaAberta] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Triagem panel state
  const [separacoes, setSeparacoes] = useState<Separacao[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Pesagem form
  const [pesoNF, setPesoNF] = useState("");
  const [pesoAtual, setPesoAtual] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [savingPesagem, setSavingPesagem] = useState(false);

  // Trouxa form
  const [tipoMaterial, setTipoMaterial] = useState("");
  const [cor, setCor] = useState("");
  const [peso, setPeso] = useState("");
  const [destino, setDestino] = useState("");
  const [savingTrouxa, setSavingTrouxa] = useState(false);

  /* ─── Fetch coletas ─── */
  const fetchColetas = useCallback(async () => {
    try {
      const res = await fetch("/api/coletas");
      const data = await res.json();
      setColetas(Array.isArray(data) ? data : []);
    } catch { console.error("Erro ao buscar coletas"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchColetas(); }, [fetchColetas]);

  /* ─── Open coleta detail ─── */
  const openColeta = useCallback(async (coletaId: string) => {
    setColetaAberta(coletaId);
    setLoadingDetail(true);
    const coleta = coletas.find(c => c.id === coletaId);
    if (coleta) {
      setPesoNF(coleta.pesoTotalNF ? String(coleta.pesoTotalNF) : "");
      setPesoAtual(coleta.pesoTotalAtual ? String(coleta.pesoTotalAtual) : "");
      setNotaFiscal(coleta.notaFiscal || "");
    }
    // Reset trouxa form
    setTipoMaterial(""); setCor(""); setPeso(""); setDestino("");

    try {
      const [seps, qrs] = await Promise.all([
        fetch(`/api/separacoes/coleta/${coletaId}`).then(r => r.json()).catch(() => []),
        fetch(`/api/qr-codes/coleta/${coletaId}`).then(r => r.json()).catch(() => []),
      ]);
      setSeparacoes(Array.isArray(seps) ? seps : []);
      setQrCodes(Array.isArray(qrs) ? qrs : []);
    } catch { setSeparacoes([]); setQrCodes([]); }
    finally { setLoadingDetail(false); }
  }, [coletas]);

  const closeColeta = () => { setColetaAberta(null); setSeparacoes([]); setQrCodes([]); };

  /* ─── Current coleta ─── */
  const currentColeta = useMemo(() => coletas.find(c => c.id === coletaAberta), [coletas, coletaAberta]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const total = coletas.length;
    const pendentes = coletas.filter(c => c.status === "pendente" || c.status === "Pendente" || !c.status).length;
    const emTriagem = coletas.filter(c => c.status === "em_triagem" || c.status === "Em Triagem").length;
    const triadas = coletas.filter(c => c.status === "triada" || c.status === "Triada" || c.status === "Concluída").length;
    return { total, pendentes, emTriagem, triadas };
  }, [coletas]);

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
  const handlePesagem = async () => {
    if (!coletaAberta) return;
    setSavingPesagem(true);
    try {
      const res = await fetch(`/api/coletas/${coletaAberta}/entrada`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoTotalAtual: parseFloat(pesoAtual) || 0,
          pesoTotalNF: parseFloat(pesoNF) || 0,
          notaFiscal: notaFiscal || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Pesagem registrada com sucesso!");
      // Update local coleta state
      setColetas(prev => prev.map(c => c.id === coletaAberta ? {
        ...c,
        pesoTotalAtual: parseFloat(pesoAtual) || 0,
        pesoTotalNF: parseFloat(pesoNF) || 0,
        notaFiscal: notaFiscal || null,
        status: "em_triagem",
      } : c));
    } catch { toast.error("Erro ao registrar pesagem"); }
    finally { setSavingPesagem(false); }
  };

  /* ─── Adicionar Trouxa + QR ─── */
  const handleAddTrouxa = async () => {
    if (!coletaAberta || !currentColeta) return;
    if (!tipoMaterial) { toast.error("Selecione o tipo de material"); return; }
    if (!peso || parseFloat(peso) <= 0) { toast.error("Informe o peso da trouxa"); return; }
    if (!destino) { toast.error("Selecione o destino"); return; }

    setSavingTrouxa(true);
    try {
      // 1) Create separacao
      const sepRes = await fetch("/api/separacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coletaId: coletaAberta,
          coletaNumero: currentColeta.numero,
          fornecedor: currentColeta.fornecedor,
          tipoMaterial, cor, peso: parseFloat(peso), destino,
          colaborador: me.nome,
        }),
      });
      if (!sepRes.ok) throw new Error();
      const newSep = await sepRes.json();

      // 2) Create QR code
      const qrRes = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coletaId: coletaAberta,
          coletaNumero: currentColeta.numero,
          separacaoId: newSep.id,
          fornecedor: currentColeta.fornecedor,
          tipoMaterial, cor, peso: parseFloat(peso), destino,
        }),
      });
      const newQR = qrRes.ok ? await qrRes.json() : null;

      setSeparacoes(prev => [...prev, newSep]);
      if (newQR) setQrCodes(prev => [...prev, newQR]);

      // Reset form
      setTipoMaterial(""); setCor(""); setPeso(""); setDestino("");
      toast.success(`Trouxa adicionada${newQR ? " + QR gerado" : ""}!`);
    } catch { toast.error("Erro ao criar trouxa"); }
    finally { setSavingTrouxa(false); }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--fips-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--fips-fg-muted)]">Carregando coletas...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                               */
  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      <style>{FADE_IN}</style>

      <PageHeader
        title="Triagem"
        description={`${me.nome} · Separação e classificação de material`}
        icon={ClipboardList}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Em Triagem", value: stats.emTriagem, color: "#004B9B" },
          { label: "Triadas", value: stats.triadas, color: "#00C64C" },
        ]}
        actions={
          <Button variant="outline" onClick={() => setDialogOpen(true)} className="gap-1.5">
            <QrCode className="h-4 w-4" /> Ler QR Code
          </Button>
        }
      />

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Coletas" value={stats.total} subtitle="Para triagem" icon={Package} color={FIPS.azulProfundo} />
        <StatsCard label="Pendentes" value={stats.pendentes} subtitle="Aguardando pesagem" icon={AlertTriangle} color={FIPS.amareloEscuro} />
        <StatsCard label="Em Triagem" value={stats.emTriagem} subtitle="Sendo separadas" icon={ArrowDownUp} color={FIPS.azulEscuro} />
        <StatsCard label="Triadas" value={stats.triadas} subtitle="Concluídas" icon={CheckCircle2} color={FIPS.verdeFloresta} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  STATE 1: Grid de Coletas                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!coletaAberta ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[var(--fips-fg-muted)]" />
              <h3 className="text-[14px] font-bold text-[var(--fips-fg)]" style={{ fontFamily: "'Saira Expanded', sans-serif" }}>
                Coletas para Triagem
              </h3>
              <span className="text-[11px] text-[var(--fips-fg-muted)]">· Clique para iniciar triagem</span>
            </div>
          </div>

          {coletas.length === 0 ? (
            <div className="rounded-[12px_12px_12px_20px] border border-dashed border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-10 text-center">
              <Package className="h-10 w-10 mx-auto mb-3 text-[var(--fips-fg-muted)] opacity-40" />
              <p className="text-[13px] font-semibold text-[var(--fips-fg)]">Nenhuma coleta encontrada</p>
              <p className="text-[11px] text-[var(--fips-fg-muted)] mt-1">Coletas aparecerão aqui quando forem registradas</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {coletas.map((coleta, i) => (
                <div key={coleta.id} style={{ animation: `fadeIn .3s ease ${i * 0.04}s both` }}>
                  <ColetaCard coleta={coleta} onClick={() => openColeta(coleta.id)} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /*  STATE 2: Triagem Panel                                          */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div style={{ animation: "fadeIn .25s ease" }}>

          {/* ─── A) Header Bar ─── */}
          <div className="flex items-center justify-between rounded-[12px_12px_12px_20px] border border-[var(--fips-border)] p-4 mb-5"
            style={{ background: "linear-gradient(135deg, #004B9B 0%, #002A68 100%)" }}>
            <div className="flex items-center gap-3">
              <button onClick={closeColeta} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <div>
                <h3 className="text-white text-[18px] font-bold" style={{ fontFamily: "'Saira Expanded', sans-serif" }}>
                  Coleta #{currentColeta?.numero}
                  <span className="ml-3 text-[13px] font-normal text-white/70">{currentColeta?.fornecedor}</span>
                </h3>
                <p className="text-white/50 text-[11px]">
                  {me.nome} · {formatDateBR(currentColeta?.dataColeta || "")} · {separacoes.length} trouxas registradas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(currentColeta?.status || "")} className="text-[10px] border-white/20">
                {statusLabel(currentColeta?.status || "")}
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
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* ─── LEFT COLUMN: Pesagem + Trouxa Form ─── */}
              <div className="space-y-5">

                {/* ─── B) PESAGEM — Entrada de Coleta ─── */}
                <div className="rounded-[12px_12px_12px_20px] border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Weight className="h-4 w-4" style={{ color: FIPS.azulProfundo }} />
                    <span className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: FIPS.azulProfundo, fontFamily: "'Saira Expanded', sans-serif" }}>
                      Entrada de Coleta — Pesagem
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Peso NF */}
                    <div className="rounded-[10px_10px_10px_16px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-3">
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">Peso NF</div>
                      <Input density="compact" type="number" step="0.1" placeholder="0.0" value={pesoNF}
                        onChange={e => setPesoNF(e.target.value)} className="text-[14px] font-bold" />
                      <div className="text-[8px] text-[var(--fips-fg-muted)] mt-1">kg (nota fiscal)</div>
                    </div>

                    {/* Peso Atual */}
                    <div className="rounded-[10px_10px_10px_16px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-3">
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">Peso Atual</div>
                      <Input density="compact" type="number" step="0.1" placeholder="0.0" value={pesoAtual}
                        onChange={e => setPesoAtual(e.target.value)} className="text-[14px] font-bold" />
                      <div className="text-[8px] text-[var(--fips-fg-muted)] mt-1">kg (balança)</div>
                    </div>

                    {/* Diferença */}
                    <div className="rounded-[10px_10px_10px_16px] border p-3 flex flex-col justify-center items-center" style={{
                      borderColor: diferenca === null ? "var(--fips-border)" : diferenca >= 0 ? FIPS.verdeFloresta : FIPS.danger,
                      background: diferenca === null ? "var(--fips-surface-soft)" : diferenca >= 0 ? `${FIPS.verdeFloresta}08` : `${FIPS.danger}08`,
                    }}>
                      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--fips-fg-muted)] mb-1">Diferença</div>
                      <div className="text-[20px] font-extrabold" style={{
                        color: diferenca === null ? "var(--fips-fg-muted)" : diferenca >= 0 ? FIPS.verdeFloresta : FIPS.danger,
                        fontFamily: "'Saira Expanded', sans-serif",
                      }}>
                        {diferenca === null ? "—" : `${diferenca >= 0 ? "+" : ""}${diferenca.toFixed(1)}`}
                      </div>
                      <div className="text-[8px] text-[var(--fips-fg-muted)]">kg</div>
                    </div>
                  </div>

                  <Field density="compact" className="mb-3">
                    <FieldLabel>Nota Fiscal</FieldLabel>
                    <Input density="compact" placeholder="Nº da nota fiscal" value={notaFiscal}
                      onChange={e => setNotaFiscal(e.target.value)} />
                  </Field>

                  <Button onClick={handlePesagem} disabled={savingPesagem} className="w-full gap-2" style={{ background: FIPS.azulProfundo }}>
                    <Scale className="h-4 w-4" />
                    {savingPesagem ? "Registrando..." : "Registrar Pesagem"}
                  </Button>
                </div>

                {/* ─── C) TRIAGEM — Separação por Material ─── */}
                <div className="rounded-[12px_12px_12px_20px] border-2 border-dashed border-[var(--fips-primary)] bg-[var(--fips-surface-soft)] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="h-4 w-4" style={{ color: FIPS.azulProfundo }} />
                    <span className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: FIPS.azulProfundo, fontFamily: "'Saira Expanded', sans-serif" }}>
                      Separação por Material — Nova Trouxa
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Field density="compact">
                      <FieldLabel required>Tipo Material</FieldLabel>
                      <Select value={tipoMaterial} onChange={e => setTipoMaterial(e.target.value)}>
                        <option value="">Selecione</option>
                        {TIPOS_MATERIAL.map(t => <option key={t} value={t}>{t}</option>)}
                      </Select>
                    </Field>
                    <Field density="compact">
                      <FieldLabel>Cor</FieldLabel>
                      <Input density="compact" placeholder="Ex: Branco, Azul" value={cor}
                        onChange={e => setCor(e.target.value)} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Field density="compact">
                      <FieldLabel required>Peso (kg)</FieldLabel>
                      <Input density="compact" type="number" step="0.1" placeholder="0.0" value={peso}
                        onChange={e => setPeso(e.target.value)} />
                    </Field>
                    <Field density="compact">
                      <FieldLabel required>Destino</FieldLabel>
                      <Select value={destino} onChange={e => setDestino(e.target.value)}>
                        <option value="">Selecione</option>
                        {DESTINOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </Select>
                    </Field>
                  </div>

                  {/* Destino chips visual */}
                  {destino && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase text-[var(--fips-fg-muted)]">Destino:</span>
                      {(() => {
                        const d = destinoMap[destino];
                        if (!d) return null;
                        const Icon = d.icon;
                        return (
                          <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
                            style={{ background: d.color }}>
                            <Icon className="h-3.5 w-3.5" />{d.label}
                          </span>
                        );
                      })()}
                    </div>
                  )}

                  <Button onClick={handleAddTrouxa} disabled={savingTrouxa} className="w-full gap-2" style={{ background: FIPS.gold, color: FIPS.azulEscuro }}>
                    <QrCode className="h-4 w-4" />
                    {savingTrouxa ? "Criando..." : "Adicionar Trouxa + Gerar QR"}
                  </Button>
                </div>
              </div>

              {/* ─── RIGHT COLUMN: Trouxas + QR Codes ─── */}
              <div className="space-y-5">

                {/* ─── D) Progress Bar ─── */}
                {progress.totalColeta > 0 && (
                  <div className="rounded-[12px_12px_12px_20px] border border-[var(--fips-border)] bg-[var(--fips-surface)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[var(--fips-fg)]">
                        Total separado: {formatKg(progress.totalSep)} de {formatKg(progress.totalColeta)}
                      </span>
                      <span className="text-[13px] font-extrabold" style={{
                        color: progress.pct >= 100 ? FIPS.verdeFloresta : FIPS.azulProfundo,
                        fontFamily: "'Saira Expanded', sans-serif",
                      }}>
                        {progress.pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--fips-surface-muted)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{
                        width: `${Math.min(100, progress.pct)}%`,
                        background: progress.pct >= 100
                          ? `linear-gradient(90deg, ${FIPS.verdeFloresta}, #00E05A)`
                          : `linear-gradient(90deg, ${FIPS.azulProfundo}, ${FIPS.azulEscuro})`,
                      }} />
                    </div>
                  </div>
                )}

                {/* ─── D) Trouxas Registradas ─── */}
                <div className="rounded-[12px_12px_12px_20px] border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="h-4 w-4 text-[var(--fips-fg-muted)]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--fips-fg-muted)]">
                      Trouxas Registradas — {separacoes.length} itens
                    </span>
                  </div>

                  {separacoes.length === 0 ? (
                    <div className="py-8 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-[var(--fips-fg-muted)] opacity-30" />
                      <p className="text-[11px] text-[var(--fips-fg-muted)]">Nenhuma trouxa registrada ainda</p>
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto pr-1">
                      {separacoes.map((sep, i) => (
                        <TrouxaItem
                          key={sep.id}
                          sep={sep}
                          qrCode={qrCodes.find(q => q.separacaoId === sep.id)}
                          isLast={i === separacoes.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* ─── E) QR Codes Gerados ─── */}
                {qrCodes.length > 0 && (
                  <div className="rounded-[12px_12px_12px_20px] border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode className="h-4 w-4" style={{ color: FIPS.azulProfundo }} />
                      <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: FIPS.azulProfundo }}>
                        QR Codes — {qrCodes.length} gerados
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {qrCodes.map(qr => {
                        const dest = destinoMap[qr.destino];
                        return (
                          <div key={qr.id} className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-3 flex items-start gap-3">
                            {/* QR visual placeholder */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${FIPS.azulProfundo}12`, border: `1.5px solid ${FIPS.azulProfundo}30` }}>
                              <QrCode className="h-5 w-5" style={{ color: FIPS.azulProfundo }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-bold font-mono" style={{ color: FIPS.azulProfundo }}>{qr.codigo}</div>
                              <div className="text-[9px] text-[var(--fips-fg-muted)] truncate">{qr.tipoMaterial}{qr.cor ? ` · ${qr.cor}` : ""}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-[var(--fips-fg)]">{formatKg(qr.peso)}</span>
                                {dest && (
                                  <span className="rounded px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ background: dest.color }}>
                                    {dest.label}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Fallback Dialog ─── */}
      <NovaSeparacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchColetas}
        tiposMaterial={TIPOS_MATERIAL}
      />
    </div>
  );
}
