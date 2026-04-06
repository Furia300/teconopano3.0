import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const MATERIAIS = [
  "BR CASAL", "CASAL RVA", "C2 RVA", "C2 LISA", "CASAL EUA",
  "KING", "MICROFIBRA", "ME RVA", "C2P", "C2M", "C2 PP",
  "LAMBRELA", "C2 PQUI", "CINZA G", "CINZA AG", "CINZA C2",
  "E-AMÉRICA", "SEPROV", "A9 (3mm)", "JAQUETA", "COBERTÓRIO",
  "KINGUA", "C2 UA",
];

const SALAS = [
  "O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8",
  "COBERTÓRIO", "CORTE 01", "CORTE 02", "CORTE 03", "CORTE 04", "CORTE 05",
  "FAIXA", "CORTE VLI",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  defaultData: string;
}

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

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Registro de Produção</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data</label>
              <Input type="date" value={form.data} onChange={e => update("data", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome / Dupla *</label>
              <Input
                placeholder="Ex: GLINS/KAYAN"
                value={form.nomeDupla}
                onChange={e => update("nomeDupla", e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sala *</label>
              <Select value={form.sala} onChange={e => update("sala", e.target.value)}>
                <option value="">Selecionar sala</option>
                {SALAS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Material *</label>
              <Select value={form.material} onChange={e => update("material", e.target.value)}>
                <option value="">Selecionar material</option>
                {MATERIAIS.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Horário Início *</label>
              <Input type="time" value={form.horarioInicio} onChange={e => update("horarioInicio", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Horário Fim</label>
              <Input type="time" value={form.horarioFim} onChange={e => update("horarioFim", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={form.status} onChange={e => update("status", e.target.value)}>
              <option value="completa">Completa</option>
              <option value="incompleta">Incompleta</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assinatura</label>
              <Input
                placeholder="Nome de quem assina"
                value={form.assinatura}
                onChange={e => update("assinatura", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Encarregado</label>
              <Input
                placeholder="Nome do encarregado"
                value={form.encarregado}
                onChange={e => update("encarregado", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Observação</label>
            <Input
              placeholder="Observação opcional"
              value={form.observacao}
              onChange={e => update("observacao", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!form.nomeDupla || !form.sala || !form.material || !form.horarioInicio}>
              Salvar Registro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
