import { useState, useEffect, useMemo } from "react";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";
import { toast } from "sonner";
import {
  QrCode, Box, AlertTriangle, Weight, User, Palette,
  Factory, ArrowRight, Check, Maximize2, Minimize2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";

/* --- Types --- */
interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  status: string;
}

interface NovaSeparacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tiposMaterial: string[];
}

/* --- Constants --- */
const CORES = ["Branco", "Colorido", "Escuro", "Azul", "Verde", "Variado", "Preto"];

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
  tipoMaterial: "",
  cor: "",
  peso: "",
  destino: "producao",
  colaborador: "",
  observacao: "",
};

/* --- Component --- */
export function NovaSeparacaoDialog({ open, onOpenChange, onSuccess, tiposMaterial }: NovaSeparacaoDialogProps) {
  const me = useAppAuthMe();
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dialogSize, setDialogSize] = useState<DialogSize>("grande");

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, colaborador: me.nome });
      fetch("/api/coletas")
        .then((r) => r.json())
        .then((data: Coleta[]) => {
          setColetas(data.filter((c) => ["recebido", "em_separacao"].includes(c.status)));
        })
        .catch(console.error);
    }
  }, [open]);

  const selectedColeta = coletas.find((c) => c.id === form.coletaId);

  const getAutoDestino = (material: string, cor: string) => {
    if (cor === "Escuro" || cor === "Preto") return "repanol";
    return "producao";
  };

  const handleMaterialChange = (material: string) => {
    const autoDestino = getAutoDestino(material, form.cor);
    setForm((f) => ({ ...f, tipoMaterial: material, destino: autoDestino }));
  };

  const handleCorChange = (cor: string) => {
    const autoDestino = getAutoDestino(form.tipoMaterial, cor);
    setForm((f) => ({ ...f, cor, destino: autoDestino }));
  };

  const cycleSize = () => {
    const i = SIZE_ORDER.indexOf(dialogSize);
    setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coletaId || !form.tipoMaterial || !form.peso) {
      toast.error("Preencha coleta, tipo de material e peso");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/separacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao registrar triagem");

      toast.success("Triagem registrada com sucesso!");
      setForm(EMPTY_FORM);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar triagem");
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
              <DialogTitle>Nova triagem</DialogTitle>
              <DialogDescription>
                Classifique o material recebido por tipo, cor e destino. Destino ajustado automaticamente pela cor.
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
        <form id="form-separacao" onSubmit={handleSubmit} className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "flex flex-col gap-5"}>

            {/* -- COL 1: Coleta + Material + Cor + Peso -- */}
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
                <FieldHint>Coletas com status recebido ou em triagem</FieldHint>
              </Field>

              {/* Info coleta selecionada */}
              {selectedColeta && (
                <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-4 py-3 text-xs space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[var(--fips-fg-muted)]">Fornecedor</span>
                    <span className="font-medium text-[var(--fips-fg)]">{selectedColeta.nomeFantasia}</span>
                  </div>
                </div>
              )}

              {/* Material e Cor */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel required>Tipo Material</FieldLabel>
                  <Select density="compact" leftIcon={<Factory className="h-3.5 w-3.5" />} value={form.tipoMaterial} onChange={(e) => handleMaterialChange(e.target.value)}>
                    <option value="">Selecione</option>
                    {tiposMaterial.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Cor</FieldLabel>
                  <Select density="compact" leftIcon={<Palette className="h-3.5 w-3.5" />} value={form.cor} onChange={(e) => handleCorChange(e.target.value)}>
                    <option value="">Selecione</option>
                    {CORES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* Peso */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Peso (kg)</FieldLabel>
                <Input density="compact" type="number" step="0.01" placeholder="0.00"
                  leftIcon={<Weight className="h-3.5 w-3.5" />}
                  value={form.peso} onChange={(e) => update("peso", e.target.value)} />
              </Field>
            </div>

            {/* -- COL 2: Destino + Aviso + Colaborador + Obs -- */}
            <div className="flex flex-col gap-5">
              {/* Destino */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Destino</FieldLabel>
                <Select density="compact" leftIcon={<ArrowRight className="h-3.5 w-3.5" />} value={form.destino} onChange={(e) => update("destino", e.target.value)}>
                  <option value="producao">Produção</option>
                  <option value="repanol">Repanol (manchado/tingir)</option>
                  <option value="costureira">Costureira</option>
                  <option value="doacao">Doação</option>
                  <option value="descarte">Descarte</option>
                </Select>
                <FieldHint>Ajustado automaticamente pela cor selecionada</FieldHint>
              </Field>

              {/* Aviso Repanol */}
              {form.destino === "repanol" && (
                <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-warning)]/30 bg-[var(--fips-warning)]/[0.06] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--fips-warning)]" />
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-warning)]">Material para Repanol</p>
                  </div>
                  <p className="text-xs text-[var(--fips-fg-muted)]">Manchado, molhado ou precisa tingir. Será registrado no módulo Repanol.</p>
                </div>
              )}

              {/* Colaborador (auto do login) */}
              <Field density="compact" inset="icon">
                <FieldLabel>Colaborador</FieldLabel>
                <Input density="compact" readOnly
                  leftIcon={<Check className="h-3.5 w-3.5" style={{ color: "var(--fips-success)" }} />}
                  style={{ borderColor: "var(--fips-success)", background: "rgba(0,198,76,0.05)" }}
                  value={form.colaborador} onChange={(e) => update("colaborador", e.target.value)} />
              </Field>

              {/* Observação */}
              <Field density="compact" inset="none">
                <FieldLabel>Observação</FieldLabel>
                <Textarea density="compact" placeholder="Detalhes adicionais sobre a triagem..."
                  value={form.observacao} onChange={(e) => update("observacao", e.target.value)}
                  className={isWide ? "min-h-[100px]" : ""} />
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
              <Button type="submit" form="form-separacao" variant="success" loading={loading} className="gap-2">
                <Check className="h-4 w-4" /> Registrar triagem
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
