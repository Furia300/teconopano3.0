import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Truck,
  User as UserIcon,
  IdCard,
  CalendarDays,
  Phone,
  MessageSquare,
  Mail,
  Car,
  Hash,
  Scale,
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
import { Field, FieldLabel, type FieldInset } from "@/components/ui/field";

interface Motorista {
  id: string;
  nome: string;
  cpf?: string | null;
  cnh?: string | null;
  categoriaCnh?: string | null;
  validadeCnh?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  veiculo?: string | null;
  placa?: string | null;
  capacidadeKg?: number | null;
  observacao?: string | null;
  ativo?: boolean;
}

interface NovoMotoristaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  motorista?: Motorista | null;
}

const EMPTY_FORM = {
  nome: "",
  cpf: "",
  cnh: "",
  categoriaCnh: "B",
  validadeCnh: "",
  telefone: "",
  whatsapp: "",
  email: "",
  veiculo: "",
  placa: "",
  capacidadeKg: "",
};

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

export function NovoMotoristaDialog({
  open,
  onOpenChange,
  onSuccess,
  motorista,
}: NovoMotoristaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(motorista?.id);

  useEffect(() => {
    if (open && motorista) {
      setForm({
        nome: motorista.nome ?? "",
        cpf: motorista.cpf ?? "",
        cnh: motorista.cnh ?? "",
        categoriaCnh: motorista.categoriaCnh ?? "B",
        validadeCnh: motorista.validadeCnh ?? "",
        telefone: motorista.telefone ?? "",
        whatsapp: motorista.whatsapp ?? "",
        email: motorista.email ?? "",
        veiculo: motorista.veiculo ?? "",
        placa: motorista.placa ?? "",
        capacidadeKg: motorista.capacidadeKg?.toString() ?? "",
      });
    } else if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open, motorista]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim() || null,
        cnh: form.cnh.trim() || null,
        categoriaCnh: form.categoriaCnh || null,
        validadeCnh: form.validadeCnh || null,
        telefone: form.telefone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        veiculo: form.veiculo.trim() || null,
        placa: form.placa.trim().toUpperCase() || null,
        capacidadeKg: form.capacidadeKg ? Number(form.capacidadeKg) : null,
      };
      const res = await fetch(
        isEdit ? `/api/motoristas/${motorista!.id}` : "/api/motoristas",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Motorista atualizado." : "Motorista cadastrado.");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(isEdit ? "Erro ao atualizar motorista." : "Erro ao cadastrar motorista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Truck className="h-5 w-5 text-[var(--fips-secondary)]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>{isEdit ? "Editar motorista" : "Novo motorista"}</DialogTitle>
              <DialogDescription>
                Cadastro do colaborador motorista — busca matéria-prima nos fornecedores e entrega
                produtos finais aos clientes B2B.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="form-motorista" onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {/* IDENTIFICAÇÃO */}
          <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
            <ModalField label="Nome completo" required inset="icon">
              <Input
                density="compact"
                placeholder="Ex: João Silva"
                leftIcon={<UserIcon className="h-4 w-4" aria-hidden />}
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
              />
            </ModalField>
            <ModalField label="CPF" inset="icon">
              <Input
                density="compact"
                placeholder="000.000.000-00"
                leftIcon={<IdCard className="h-4 w-4" aria-hidden />}
                value={form.cpf}
                onChange={(e) => update("cpf", e.target.value)}
              />
            </ModalField>
          </div>

          {/* CNH */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              CNH
            </p>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-[1fr_120px_180px]">
              <ModalField label="Número CNH" inset="icon">
                <Input
                  density="compact"
                  placeholder="00000000000"
                  leftIcon={<IdCard className="h-4 w-4" aria-hidden />}
                  value={form.cnh}
                  onChange={(e) => update("cnh", e.target.value)}
                />
              </ModalField>
              <ModalField label="Categoria" inset="icon">
                <Select
                  density="compact"
                  aria-label="Categoria CNH"
                  leftIcon={<Hash className="h-4 w-4" aria-hidden />}
                  value={form.categoriaCnh}
                  onChange={(e) => update("categoriaCnh", e.target.value)}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="AB">AB</option>
                  <option value="AC">AC</option>
                  <option value="AD">AD</option>
                  <option value="AE">AE</option>
                </Select>
              </ModalField>
              <ModalField label="Validade" inset="icon">
                <Input
                  density="compact"
                  type="date"
                  leftIcon={<CalendarDays className="h-4 w-4" aria-hidden />}
                  value={form.validadeCnh}
                  onChange={(e) => update("validadeCnh", e.target.value)}
                />
              </ModalField>
            </div>
          </div>

          {/* CONTATO */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Contato
            </p>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-3">
              <ModalField label="Telefone" inset="icon">
                <Input
                  density="compact"
                  placeholder="11-99999-9999"
                  leftIcon={<Phone className="h-4 w-4" aria-hidden />}
                  value={form.telefone}
                  onChange={(e) => update("telefone", e.target.value)}
                />
              </ModalField>
              <ModalField label="WhatsApp" inset="icon">
                <Input
                  density="compact"
                  placeholder="11-99999-9999"
                  leftIcon={<MessageSquare className="h-4 w-4" aria-hidden />}
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                />
              </ModalField>
              <ModalField label="E-mail" inset="icon">
                <Input
                  density="compact"
                  type="email"
                  placeholder="motorista@tecnopano.com.br"
                  leftIcon={<Mail className="h-4 w-4" aria-hidden />}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </ModalField>
            </div>
          </div>

          {/* VEÍCULO */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Veículo
            </p>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-[1fr_140px_160px]">
              <ModalField label="Modelo / Tipo" inset="icon">
                <Input
                  density="compact"
                  placeholder="Ex: Iveco Daily 2018"
                  leftIcon={<Car className="h-4 w-4" aria-hidden />}
                  value={form.veiculo}
                  onChange={(e) => update("veiculo", e.target.value)}
                />
              </ModalField>
              <ModalField label="Placa" inset="icon">
                <Input
                  density="compact"
                  placeholder="ABC-1234"
                  leftIcon={<Hash className="h-4 w-4" aria-hidden />}
                  maxLength={8}
                  value={form.placa}
                  onChange={(e) => update("placa", e.target.value.toUpperCase())}
                />
              </ModalField>
              <ModalField label="Capacidade (kg)" inset="icon">
                <Input
                  density="compact"
                  type="number"
                  step="1"
                  placeholder="0"
                  leftIcon={<Scale className="h-4 w-4" aria-hidden />}
                  value={form.capacidadeKg}
                  onChange={(e) => update("capacidadeKg", e.target.value)}
                />
              </ModalField>
            </div>
          </div>
        </form>

        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-motorista"
                variant="success"
                loading={loading}
                className="gap-2"
              >
                <Check className="h-4 w-4" aria-hidden />
                {isEdit ? "Salvar alterações" : "Cadastrar motorista"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
