import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface Colaborador {
  id: number;
  cpf: string;
  name: string;
  registration: string;
  departamento: string;
  idDepartment: number;
  status: number;
  fonte: string;
}

interface Departamento {
  id: number;
  name: string;
}

interface ColaboradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: Colaborador | null;
  fonte: "rhid" | "local";
  onSuccess: () => void;
}

export function ColaboradorDialog({ open, onOpenChange, editItem, fonte, onSuccess }: ColaboradorDialogProps) {
  const [loading, setSaving] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [form, setForm] = useState({
    name: "", cpf: "", registration: "", departamento: "", idDepartment: 0, status: 1,
  });

  useEffect(() => {
    if (open) {
      fetch("/api/departamentos")
        .then((r) => r.json())
        .then((data) => setDepartamentos(data.departamentos || []))
        .catch(console.error);

      if (editItem) {
        setForm({
          name: editItem.name, cpf: formatCPFInput(editItem.cpf),
          registration: editItem.registration, departamento: editItem.departamento,
          idDepartment: editItem.idDepartment, status: editItem.status,
        });
      } else {
        setForm({ name: "", cpf: "", registration: "", departamento: "", idDepartment: 0, status: 1 });
      }
    }
  }, [open, editItem]);

  const formatCPFInput = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const handleDeptoChange = (deptoName: string) => {
    const depto = departamentos.find((d) => d.name === deptoName);
    setForm((f) => ({ ...f, departamento: deptoName, idDepartment: depto?.id || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cpf || !form.departamento) {
      toast.error("Preencha nome, CPF e departamento");
      return;
    }

    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/colaboradores/${editItem.id}` : "/api/colaboradores";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cpf: form.cpf.replace(/\D/g, "") }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const syncMsg = data.rhidSync ? " (sincronizado com RHiD)" : fonte === "local" ? " (salvo local)" : "";
      toast.success(`${editItem ? "Atualizado" : "Cadastrado"}!${syncMsg}`);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const update = (f: string, v: string | number) => setForm((prev) => ({ ...prev, [f]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {editItem ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {fonte === "rhid" ? (
              <Badge variant="success" className="gap-1 text-[10px]"><Wifi className="h-3 w-3" />Será sincronizado com RHiD</Badge>
            ) : (
              <Badge variant="warning" className="gap-1 text-[10px]"><WifiOff className="h-3 w-3" />Salvo local (RHiD não configurado)</Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome Completo *</label>
            <Input placeholder="Nome do colaborador" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">CPF *</label>
              <Input placeholder="000.000.000-00" value={form.cpf}
                onChange={(e) => update("cpf", formatCPFInput(e.target.value))} maxLength={14} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Matrícula</label>
              <Input placeholder="Ex: M001" value={form.registration}
                onChange={(e) => update("registration", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento *</label>
              <Select value={form.departamento} onChange={(e) => handleDeptoChange(e.target.value)}>
                <option value="">Selecione</option>
                {departamentos.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={String(form.status)} onChange={(e) => update("status", Number(e.target.value))}>
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </Select>
            </div>
          </div>

          {/* Info sync */}
          <div className={`p-3 rounded-lg border text-xs ${fonte === "rhid" ? "bg-success/5 border-success/20" : "bg-muted/50"}`}>
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-3 w-3" />
              <span className="font-medium">Sincronização</span>
            </div>
            {fonte === "rhid" ? (
              <p className="text-muted-foreground">Este cadastro será enviado para o RHiD automaticamente. Alterações feitas no RHiD também aparecerão aqui.</p>
            ) : (
              <p className="text-muted-foreground">Salvo apenas localmente. Quando o RHiD for configurado, será possível sincronizar.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" loading={loading}>
              {editItem ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
