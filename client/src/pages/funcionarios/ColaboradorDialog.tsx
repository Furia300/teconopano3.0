import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users,
  User as UserIcon,
  IdCard,
  Hash,
  Building2,
  Wifi,
  WifiOff,
  Check,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, type FieldInset } from "@/components/ui/field";

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

function ModalField({
  label,
  required = false,
  inset = "control",
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  inset?: FieldInset;
  children: React.ReactNode;
}) {
  return (
    <Field density="compact" inset={inset}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </Field>
  );
}

const formatCPFInput = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

export function ColaboradorDialog({ open, onOpenChange, editItem, fonte, onSuccess }: ColaboradorDialogProps) {
  const [loading, setSaving] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    registration: "",
    departamento: "",
    idDepartment: 0,
    status: 1,
  });
  const isEdit = Boolean(editItem);

  useEffect(() => {
    if (open) {
      fetch("/api/departamentos")
        .then((r) => r.json())
        .then((data) => setDepartamentos(data.departamentos || []))
        .catch(console.error);

      if (editItem) {
        setForm({
          name: editItem.name,
          cpf: formatCPFInput(editItem.cpf),
          registration: editItem.registration,
          departamento: editItem.departamento,
          idDepartment: editItem.idDepartment,
          status: editItem.status,
        });
      } else {
        setForm({ name: "", cpf: "", registration: "", departamento: "", idDepartment: 0, status: 1 });
      }
    }
  }, [open, editItem]);

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
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/colaboradores/${editItem!.id}` : "/api/colaboradores";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cpf: form.cpf.replace(/\D/g, "") }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const syncMsg = data.rhidSync
        ? " (sincronizado com RHiD)"
        : fonte === "local"
          ? " (salvo local)"
          : "";
      toast.success(`${isEdit ? "Atualizado" : "Cadastrado"}!${syncMsg}`);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        {/* HEADER canônico FIPS DS Modal Form */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Users className="h-5 w-5 text-[var(--fips-secondary)]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>
                {isEdit ? "Editar colaborador" : "Novo colaborador"}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {fonte === "rhid" ? (
                  <Badge variant="success" className="mt-1 gap-1 text-[10px]">
                    <Wifi className="h-3 w-3" />
                    Será sincronizado com RHiD
                  </Badge>
                ) : (
                  <Badge variant="warning" className="mt-1 gap-1 text-[10px]">
                    <WifiOff className="h-3 w-3" />
                    Salvo local (RHiD não configurado)
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <form id="form-colaborador" onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
            <ModalField label="Nome completo" required inset="icon">
              <Input
                density="compact"
                placeholder="Nome do colaborador"
                leftIcon={<UserIcon className="h-4 w-4" aria-hidden />}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </ModalField>

            <ModalField label="CPF" required inset="icon">
              <Input
                density="compact"
                placeholder="000.000.000-00"
                leftIcon={<IdCard className="h-4 w-4" aria-hidden />}
                value={form.cpf}
                onChange={(e) => setForm((f) => ({ ...f, cpf: formatCPFInput(e.target.value) }))}
                maxLength={14}
              />
            </ModalField>
          </div>

          <div className="grid gap-x-5 gap-y-3 md:grid-cols-[1fr_180px]">
            <ModalField label="Departamento" required inset="icon">
              <Select
                density="compact"
                aria-label="Departamento"
                leftIcon={<Building2 className="h-4 w-4" aria-hidden />}
                value={form.departamento}
                onChange={(e) => handleDeptoChange(e.target.value)}
              >
                <option value="">Selecione</option>
                {departamentos
                  .filter((d) => !["*", ".", ".."].includes(d.name))
                  .map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
              </Select>
            </ModalField>

            <ModalField label="Matrícula" inset="icon">
              <Input
                density="compact"
                placeholder="M001"
                leftIcon={<Hash className="h-4 w-4" aria-hidden />}
                value={form.registration}
                onChange={(e) => setForm((f) => ({ ...f, registration: e.target.value }))}
              />
            </ModalField>
          </div>

          <ModalField label="Status" inset="icon">
            <Select
              density="compact"
              aria-label="Status"
              leftIcon={<Users className="h-4 w-4" aria-hidden />}
              value={String(form.status)}
              onChange={(e) => setForm((f) => ({ ...f, status: Number(e.target.value) }))}
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </Select>
          </ModalField>
        </form>

        {/* FOOTER */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">
              ⌘ + Enter para salvar
            </p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-colaborador"
                variant="success"
                loading={loading}
                className="gap-2"
              >
                <Check className="h-4 w-4" aria-hidden />
                {isEdit ? "Salvar alterações" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
