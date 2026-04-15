import { useState } from "react";
import {
  Factory, CalendarDays, Clock, Users, Layers, Pen, UserCheck,
  Maximize2, Minimize2, Check, MessageSquare, CheckCircle2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";

/* --- Constants --- */
const MATERIAIS = [
  "BR CASAL", "CASAL RVA", "C2 RVA", "C2 LISA", "CASAL EUA",
  "KING", "MICROFIBRA", "ME RVA", "C2P", "C2M", "C2 PP",
  "LAMBRELA", "C2 PQUI", "CINZA G", "CINZA AG", "CINZA C2",
  "E-AMERICA", "SEPROV", "A9 (3mm)", "JAQUETA", "COBERTORIO",
  "KINGUA", "C2 UA",
];

const SALAS = [
  "O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8",
  "COBERTORIO", "CORTE 01", "CORTE 02", "CORTE 03", "CORTE 04", "CORTE 05",
  "FAIXA", "CORTE VLI",
];

/* --- Sizes --- */
type DialogSize = "normal" | "grande" | "tela-cheia";
const SIZES: Record<DialogSize, { maxW: string; maxH: string; label: string }> = {
  normal:       { maxW: "max-w-xl",     maxH: "max-h-[85vh]", label: "Normal" },
  grande:       { maxW: "max-w-3xl",    maxH: "max-h-[90vh]", label: "Grande" },
  "tela-cheia": { maxW: "max-w-[92vw]", maxH: "max-h-[95vh]", label: "Tela cheia" },
};
const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

/* --- Types --- */
interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  defaultData: string;
}

/* --- Component --- */
export default function NovaProducaoDiariaDialog({ open, onClose, onSave, defaultData }: Props) {
  const [form, setForm] = useState({
    data: defaultData,
    nomeDupla: "",
    sala: "",
    material: "",
    horarioInicio: "",
    horarioFim: "",
    status: "completa" as "completa" | "incompleta",
    assinatura: "",
    encarregado: "",
    observacao: "",
  });
  const [dialogSize, setDialogSize] = useState<DialogSize>("normal");

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  const cycleSize = () => {
    const i = SIZE_ORDER.indexOf(dialogSize);
    setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]);
  };
  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomeDupla || !form.sala || !form.material || !form.horarioInicio) return;
    onSave({
      ...form,
      horarioFim: form.horarioFim || null,
    });
    setForm({
      data: defaultData,
      nomeDupla: form.nomeDupla,
      sala: form.sala,
      material: "",
      horarioInicio: "",
      horarioFim: "",
      status: "completa",
      assinatura: form.assinatura,
      encarregado: form.encarregado,
      observacao: "",
    });
  };

  const canSubmit = form.nomeDupla && form.sala && form.material && form.horarioInicio;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${sz.maxH} ${sz.maxW} overflow-y-auto p-0 transition-all duration-200`}>
        {/* === HEADER === */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Factory className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Novo Registro de Producao</DialogTitle>
              <DialogDescription>
                Registre a producao diaria com dupla, sala, material e horarios.
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

            {/* -- COL 1: Data, Dupla, Sala, Material -- */}
            <div className="flex flex-col gap-5">
              {/* Data + Nome/Dupla */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel required>Data</FieldLabel>
                  <Input density="compact" type="date"
                    leftIcon={<CalendarDays className="h-3.5 w-3.5" />}
                    value={form.data}
                    onChange={(e) => update("data", e.target.value)}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="hide-native-picker cursor-pointer"
                  />
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel required>Nome / Dupla</FieldLabel>
                  <Input density="compact"
                    leftIcon={<Users className="h-3.5 w-3.5" />}
                    placeholder="Ex: GLINS/KAYAN"
                    value={form.nomeDupla}
                    onChange={(e) => update("nomeDupla", e.target.value.toUpperCase())}
                  />
                </Field>
              </div>

              {/* Sala + Material */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel required>Sala</FieldLabel>
                  <Select density="compact" leftIcon={<Layers className="h-3.5 w-3.5" />} value={form.sala} onChange={(e) => update("sala", e.target.value)}>
                    <option value="">Selecionar sala</option>
                    {SALAS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel required>Material</FieldLabel>
                  <Select density="compact" leftIcon={<Layers className="h-3.5 w-3.5" />} value={form.material} onChange={(e) => update("material", e.target.value)}>
                    <option value="">Selecionar material</option>
                    {MATERIAIS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </Field>
              </div>

              {/* Horarios */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel required>Horario Inicio</FieldLabel>
                  <Input density="compact" type="time"
                    leftIcon={<Clock className="h-3.5 w-3.5" />}
                    value={form.horarioInicio}
                    onChange={(e) => update("horarioInicio", e.target.value)}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="hide-native-picker cursor-pointer"
                  />
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Horario Fim</FieldLabel>
                  <Input density="compact" type="time"
                    leftIcon={<Clock className="h-3.5 w-3.5" />}
                    value={form.horarioFim}
                    onChange={(e) => update("horarioFim", e.target.value)}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="hide-native-picker cursor-pointer"
                  />
                </Field>
              </div>
            </div>

            {/* -- COL 2: Status, Assinatura, Encarregado, Obs -- */}
            <div className="flex flex-col gap-5">
              {/* Status chips */}
              <div>
                <FieldLabel className="mb-2 text-xs font-semibold text-[var(--fips-fg)]">Status</FieldLabel>
                <div className="flex gap-2">
                  {([
                    { value: "completa", label: "Completa", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                    { value: "incompleta", label: "Incompleta", icon: <Clock className="h-3.5 w-3.5" /> },
                  ] as const).map((opt) => {
                    const active = form.status === opt.value;
                    return (
                      <button key={opt.value} type="button" onClick={() => update("status", opt.value)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          background: active ? "var(--fips-primary)" : "var(--fips-surface-muted)",
                          color: active ? "#fff" : "var(--fips-fg)",
                          border: `1.5px solid ${active ? "var(--fips-primary)" : "var(--fips-border)"}`,
                          boxShadow: active ? "0 2px 8px rgba(0,75,155,0.25)" : "none",
                        }}>
                        {opt.icon} {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assinatura + Encarregado */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel>Assinatura</FieldLabel>
                  <Input density="compact"
                    leftIcon={<Pen className="h-3.5 w-3.5" />}
                    placeholder="Nome de quem assina"
                    value={form.assinatura}
                    onChange={(e) => update("assinatura", e.target.value)}
                  />
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Encarregado</FieldLabel>
                  <Input density="compact"
                    leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                    placeholder="Nome do encarregado"
                    value={form.encarregado}
                    onChange={(e) => update("encarregado", e.target.value)}
                  />
                </Field>
              </div>

              {/* Observacao */}
              <Field density="compact" inset="icon">
                <FieldLabel>Observacao</FieldLabel>
                <Input density="compact"
                  leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                  placeholder="Observacao opcional"
                  value={form.observacao}
                  onChange={(e) => update("observacao", e.target.value)}
                />
                <FieldHint>Campos com * sao obrigatorios</FieldHint>
              </Field>
            </div>
          </div>
        </form>

        {/* === FOOTER === */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="submit" form="form-producao" variant="success" disabled={!canSubmit} className="gap-2">
                <Check className="h-4 w-4" /> Salvar Registro
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
