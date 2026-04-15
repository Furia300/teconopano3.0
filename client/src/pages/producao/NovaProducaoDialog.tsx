import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  QrCode, Box, Info, Hash, Weight, User, Scissors, Ruler,
  Palette, Check, Maximize2, Minimize2, Factory,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";

/* --- Types --- */
interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  status: string;
}

interface NovaProducaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  salas: string[];
  salaSaidaMap: Record<string, string>;
}

/* --- Constants --- */
const ACABAMENTOS = ["Corte-Reto", "Zig-Zag", "Overlock", "Sem Acabamento"];
const MEDIDAS = ["20x20 Cm", "30x30 Cm", "40x40 Cm", "50x50 Cm", "60x80 Cm", "Sob medida"];
const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];
const CORES = ["Branco", "Colorido", "Escuro", "Azul", "Verde", "Variado"];

/* --- Sizes --- */
type DialogSize = "normal" | "grande" | "tela-cheia";
const SIZES: Record<DialogSize, { maxW: string; maxH: string; label: string }> = {
  normal:       { maxW: "max-w-xl",      maxH: "max-h-[85vh]", label: "Normal" },
  grande:       { maxW: "max-w-3xl",     maxH: "max-h-[90vh]", label: "Grande" },
  "tela-cheia": { maxW: "max-w-[92vw]",  maxH: "max-h-[95vh]", label: "Tela cheia" },
};
const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

const EMPTY_FORM = {
  coletaId: "",
  sala: "",
  tipoMaterial: "",
  cor: "",
  acabamento: "",
  medida: "",
  kilo: "",
  pesoMedio: "",
  qtdePacote: "",
  operador: "",
};

/* --- Component --- */
export function NovaProducaoDialog({ open, onOpenChange, onSuccess, salas, salaSaidaMap }: NovaProducaoDialogProps) {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dialogSize, setDialogSize] = useState<DialogSize>("grande");

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      fetch("/api/coletas")
        .then((r) => r.json())
        .then((data: Coleta[]) => {
          setColetas(data.filter((c) => ["em_separacao", "separado", "em_producao"].includes(c.status)));
        })
        .catch(console.error);
    }
  }, [open]);

  const unidadeSaida = salaSaidaMap[form.sala] || "unidade";

  const calcPacotes = () => {
    if (form.kilo && form.pesoMedio && Number(form.pesoMedio) > 0) {
      return Math.floor(Number(form.kilo) / Number(form.pesoMedio));
    }
    return 0;
  };

  const cycleSize = () => {
    const i = SIZE_ORDER.indexOf(dialogSize);
    setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coletaId || !form.sala || !form.tipoMaterial || !form.kilo) {
      toast.error("Preencha coleta, sala, material e peso");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/producoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          unidadeSaida,
          qtdePacote: form.qtdePacote || String(calcPacotes()),
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar produção");

      toast.success(`Produção registrada na ${form.sala}!`);
      setForm(EMPTY_FORM);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar produção");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sz.maxH} ${sz.maxW} overflow-y-auto p-0 transition-all duration-200`}>
        {/* === HEADER === */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <QrCode className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Registrar produção</DialogTitle>
              <DialogDescription>
                Operador lê o QR Code e registra o que foi produzido na sala. Pacotes calculados automaticamente.
              </DialogDescription>
            </div>
            <button type="button" onClick={cycleSize}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--fips-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fips-fg-muted)] transition-colors hover:border-[var(--fips-border-strong)] hover:text-[var(--fips-fg)]"
              title={`Tamanho: ${sz.label}`}>
              {dialogSize === "tela-cheia" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              {sz.label}
            </button>
          </div>
        </DialogHeader>

        {/* === BODY === */}
        <form id="form-producao" onSubmit={handleSubmit} className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "flex flex-col gap-5"}>

            {/* -- COL 1: Coleta + Sala + Material + Cor -- */}
            <div className="flex flex-col gap-5">
              {/* Coleta */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Coleta de origem</FieldLabel>
                <Select density="compact" leftIcon={<Box className="h-3.5 w-3.5" />} value={form.coletaId} onChange={(e) => update("coletaId", e.target.value)}>
                  <option value="">Selecione a coleta</option>
                  {coletas.map((c) => (
                    <option key={c.id} value={c.id}>#{c.numero} — {c.nomeFantasia}</option>
                  ))}
                </Select>
                <FieldHint>Coletas em separação, separadas ou em produção</FieldHint>
              </Field>

              {/* Sala de Produção */}
              <div>
                <FieldLabel className="mb-2 text-xs font-semibold text-[var(--fips-fg)]">Sala de Produção *</FieldLabel>
                <div className="grid grid-cols-4 gap-2">
                  {salas.map((sala) => {
                    const isKilo = salaSaidaMap[sala] === "kilo";
                    const isSelected = form.sala === sala;
                    return (
                      <button
                        key={sala}
                        type="button"
                        onClick={() => update("sala", sala)}
                        className="rounded-lg border p-2 text-center text-xs font-medium transition-all"
                        style={{
                          background: isSelected ? "var(--fips-primary)" : "var(--fips-surface-muted)",
                          color: isSelected ? "#fff" : "var(--fips-fg)",
                          border: `1.5px solid ${isSelected ? "var(--fips-primary)" : "var(--fips-border)"}`,
                          boxShadow: isSelected ? "0 2px 8px rgba(0,75,155,0.25)" : "none",
                        }}>
                        {sala}
                        <Badge variant={isKilo ? "info" : "success"} className="mt-1 mx-auto block text-[9px]">
                          {isKilo ? "kg" : "un"}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Material e Cor */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel required>Tipo Material</FieldLabel>
                  <Select density="compact" leftIcon={<Factory className="h-3.5 w-3.5" />} value={form.tipoMaterial} onChange={(e) => update("tipoMaterial", e.target.value)}>
                    <option value="">Selecione</option>
                    {TIPOS_MATERIAL.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Cor</FieldLabel>
                  <Select density="compact" leftIcon={<Palette className="h-3.5 w-3.5" />} value={form.cor} onChange={(e) => update("cor", e.target.value)}>
                    <option value="">Selecione</option>
                    {CORES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* Acabamento e Medida */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel>Acabamento</FieldLabel>
                  <Select density="compact" leftIcon={<Scissors className="h-3.5 w-3.5" />} value={form.acabamento} onChange={(e) => update("acabamento", e.target.value)}>
                    <option value="">Selecione</option>
                    {ACABAMENTOS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </Select>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Medida</FieldLabel>
                  <Select density="compact" leftIcon={<Ruler className="h-3.5 w-3.5" />} value={form.medida} onChange={(e) => update("medida", e.target.value)}>
                    <option value="">Selecione</option>
                    {MEDIDAS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>

            {/* -- COL 2: Peso + Pacotes + Info + Operador -- */}
            <div className="flex flex-col gap-5">
              {/* Peso Total */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Peso Total (kg)</FieldLabel>
                <Input density="compact" type="number" step="0.01" placeholder="0.00"
                  leftIcon={<Weight className="h-3.5 w-3.5" />}
                  value={form.kilo} onChange={(e) => update("kilo", e.target.value)} />
              </Field>

              {/* Peso Médio + Pacotes */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel>Peso Médio/Pct</FieldLabel>
                  <Input density="compact" type="number" step="0.01" placeholder="0.00"
                    leftIcon={<Weight className="h-3.5 w-3.5" />}
                    value={form.pesoMedio} onChange={(e) => update("pesoMedio", e.target.value)} />
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Qtde Pacotes</FieldLabel>
                  <Input density="compact" type="number" placeholder={String(calcPacotes()) || "0"}
                    leftIcon={<Hash className="h-3.5 w-3.5" />}
                    value={form.qtdePacote} onChange={(e) => update("qtdePacote", e.target.value)} />
                  <FieldHint>Auto-calculado se vazio</FieldHint>
                </Field>
              </div>

              {/* Info saída */}
              {form.sala && (
                <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Saída da sala</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--fips-fg)]">{form.sala}</span>
                    <span className="text-xs text-[var(--fips-fg-muted)]">Saída por</span>
                    <Badge variant={unidadeSaida === "kilo" ? "info" : "success"} className="text-[10px]">
                      {unidadeSaida === "kilo" ? "Kilo" : "Unidade"}
                    </Badge>
                    {calcPacotes() > 0 && (
                      <span className="text-xs text-[var(--fips-fg-muted)]">~{calcPacotes()} pacotes</span>
                    )}
                  </div>
                </div>
              )}

              {/* Operador */}
              <Field density="compact" inset="icon">
                <FieldLabel>Operador</FieldLabel>
                <Input density="compact" placeholder="Nome do operador na sala"
                  leftIcon={<User className="h-3.5 w-3.5" />}
                  value={form.operador} onChange={(e) => update("operador", e.target.value)} />
              </Field>
            </div>
          </div>
        </form>

        {/* === FOOTER === */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" form="form-producao" variant="success" loading={loading} className="gap-2">
                <Check className="h-4 w-4" /> Registrar produção
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
