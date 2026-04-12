import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShoppingCart,
  Building2,
  FileBadge,
  FileText,
  MapPin,
  Map as MapIcon,
  Phone,
  Mail,
  User as UserIcon,
  Hash,
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
import { Field, FieldLabel, type FieldInset } from "@/components/ui/field";

interface Cliente {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string | null;
  tipo?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  contato?: string | null;
  email?: string | null;
  ativo?: boolean;
}

interface NovoClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  cliente?: Cliente | null;
}

const EMPTY_FORM = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  telefone: "",
  contato: "",
  email: "",
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

export function NovoClienteDialog({
  open,
  onOpenChange,
  onSuccess,
  cliente,
}: NovoClienteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(cliente?.id);

  useEffect(() => {
    if (open && cliente) {
      setForm({
        nomeFantasia: cliente.nomeFantasia ?? "",
        razaoSocial: cliente.razaoSocial ?? "",
        cnpj: cliente.cnpj ?? "",
        endereco: cliente.endereco ?? "",
        bairro: cliente.bairro ?? "",
        cidade: cliente.cidade ?? "",
        estado: cliente.estado ?? "",
        cep: cliente.cep ?? "",
        telefone: cliente.telefone ?? "",
        contato: cliente.contato ?? "",
        email: cliente.email ?? "",
      });
    } else if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open, cliente]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomeFantasia.trim()) {
      toast.error("Nome fantasia é obrigatório");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nomeFantasia: form.nomeFantasia.trim(),
        razaoSocial: form.razaoSocial.trim() || null,
        tipo: "juridica",
        cnpj: form.cnpj.trim() || null,
        endereco: form.endereco.trim() || null,
        bairro: form.bairro.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim().toUpperCase() || null,
        cep: form.cep.trim() || null,
        telefone: form.telefone.trim() || null,
        contato: form.contato.trim() || null,
        email: form.email.trim() || null,
      };
      const res = await fetch(
        isEdit ? `/api/clientes/${cliente!.id}` : "/api/clientes",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("erro http");
      toast.success(isEdit ? "Cliente atualizado." : "Cliente cadastrado.");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(isEdit ? "Erro ao atualizar cliente." : "Erro ao cadastrar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
        {/* HEADER canônico FIPS DS Modal Form */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <ShoppingCart className="h-5 w-5 text-[var(--fips-secondary)]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
              <DialogDescription>
                Empresa B2B que recebe os produtos prontos (panos higienizados, EPI, etc.). Cada
                {" "}<strong className="font-semibold text-[var(--fips-fg)]">filial</strong> com
                endereço de entrega próprio é um cadastro próprio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <form id="form-cliente" onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {/* IDENTIFICAÇÃO */}
          <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
            <ModalField label="Nome Fantasia" required inset="icon">
              <Input
                density="compact"
                placeholder="Ex: BTM ELETROMECANICA LTDA"
                leftIcon={<ShoppingCart className="h-4 w-4" aria-hidden />}
                value={form.nomeFantasia}
                onChange={(e) => update("nomeFantasia", e.target.value)}
              />
            </ModalField>

            <ModalField label="CNPJ" inset="icon">
              <Input
                density="compact"
                placeholder="00.000.000/0000-00"
                leftIcon={<FileBadge className="h-4 w-4" aria-hidden />}
                value={form.cnpj}
                onChange={(e) => update("cnpj", e.target.value)}
              />
            </ModalField>
          </div>

          <ModalField label="Razão Social" inset="icon">
            <Input
              density="compact"
              placeholder="Razão social oficial (Receita Federal)"
              leftIcon={<FileText className="h-4 w-4" aria-hidden />}
              value={form.razaoSocial}
              onChange={(e) => update("razaoSocial", e.target.value)}
            />
          </ModalField>

          {/* ENDEREÇO DE ENTREGA */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Endereço de entrega
            </p>
            <div className="space-y-3">
              <div className="grid gap-x-5 gap-y-3 md:grid-cols-[2fr_1fr]">
                <ModalField label="Logradouro" inset="icon">
                  <Input
                    density="compact"
                    placeholder="Rua, número"
                    leftIcon={<MapPin className="h-4 w-4" aria-hidden />}
                    value={form.endereco}
                    onChange={(e) => update("endereco", e.target.value)}
                  />
                </ModalField>
                <ModalField label="Bairro" inset="icon">
                  <Input
                    density="compact"
                    placeholder="Bairro"
                    leftIcon={<Building2 className="h-4 w-4" aria-hidden />}
                    value={form.bairro}
                    onChange={(e) => update("bairro", e.target.value)}
                  />
                </ModalField>
              </div>
              <div className="grid gap-x-5 gap-y-3 md:grid-cols-[1fr_120px_140px]">
                <ModalField label="Cidade" inset="icon">
                  <Input
                    density="compact"
                    placeholder="São Paulo"
                    leftIcon={<MapIcon className="h-4 w-4" aria-hidden />}
                    value={form.cidade}
                    onChange={(e) => update("cidade", e.target.value)}
                  />
                </ModalField>
                <ModalField label="UF" inset="icon">
                  <Input
                    density="compact"
                    placeholder="SP"
                    leftIcon={<MapIcon className="h-4 w-4" aria-hidden />}
                    maxLength={2}
                    value={form.estado}
                    onChange={(e) => update("estado", e.target.value.toUpperCase())}
                  />
                </ModalField>
                <ModalField label="CEP" inset="icon">
                  <Input
                    density="compact"
                    placeholder="00000-000"
                    leftIcon={<Hash className="h-4 w-4" aria-hidden />}
                    value={form.cep}
                    onChange={(e) => update("cep", e.target.value)}
                  />
                </ModalField>
              </div>
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
              <ModalField label="E-mail" inset="icon">
                <Input
                  density="compact"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  leftIcon={<Mail className="h-4 w-4" aria-hidden />}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </ModalField>
              <ModalField label="Pessoa de contato" inset="icon">
                <Input
                  density="compact"
                  placeholder="Nome do contato"
                  leftIcon={<UserIcon className="h-4 w-4" aria-hidden />}
                  value={form.contato}
                  onChange={(e) => update("contato", e.target.value)}
                />
              </ModalField>
            </div>
          </div>
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
                form="form-cliente"
                variant="success"
                loading={loading}
                className="gap-2"
              >
                <Check className="h-4 w-4" aria-hidden />
                {isEdit ? "Salvar alterações" : "Cadastrar cliente"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
