import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Users, AlertTriangle } from "lucide-react";

interface NovoColaboradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DEPARTAMENTOS = [
  "Motorista",
  "Galpão",
  "Costura",
  "Expedição",
  "Escritório",
  "Financeiro",
  "Administração",
];

export function NovoColaboradorDialog({ open, onOpenChange, onSuccess }: NovoColaboradorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    registration: "",
    departamento: "",
  });

  const formatCPFInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cpf || !form.departamento) {
      toast.error("Preencha nome, CPF e departamento");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cpf: form.cpf.replace(/\D/g, ""),
        }),
      });
      if (!res.ok) throw new Error("Erro");

      toast.success("Colaborador cadastrado!");
      setForm({ name: "", cpf: "", registration: "", departamento: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao cadastrar colaborador");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Cadastro Manual de Colaborador
          </DialogTitle>
          <DialogDescription>
            Use quando a API RHiD não estiver disponível
          </DialogDescription>
        </DialogHeader>

        {/* Aviso fallback */}
        <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Este cadastro é um <strong>fallback</strong>. Quando o RHiD estiver configurado,
            os colaboradores serão sincronizados automaticamente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome Completo *</label>
            <Input
              placeholder="Nome do colaborador"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">CPF *</label>
              <Input
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => update("cpf", formatCPFInput(e.target.value))}
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Matrícula</label>
              <Input
                placeholder="Ex: M001"
                value={form.registration}
                onChange={(e) => update("registration", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Departamento *</label>
            <Select value={form.departamento} onChange={(e) => update("departamento", e.target.value)}>
              <option value="">Selecione</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
