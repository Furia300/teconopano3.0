import { useState, useEffect } from "react";
import { UserCog, User, Mail, Phone, Briefcase, Building2, Hash } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

interface UserData {
  id?: string;
  username?: string;
  nome?: string;
  email?: string;
  cargo?: string;
  departamento?: string;
  matricula?: string;
  whatsapp?: string;
  perfil?: string;
  acesso?: boolean;
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onSuccess: () => void;
}

const PERFIS = [
  "administrador", "galpao", "emissao_nf", "financeiro",
  "expedicao", "rh", "producao", "separacao", "motorista", "costureira",
];

export function UserEditDialog({ open, onOpenChange, user, onSuccess }: UserEditDialogProps) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        nome: user?.nome || "",
        username: user?.username || "",
        email: user?.email || "",
        cargo: user?.cargo || "",
        departamento: user?.departamento || "",
        matricula: user?.matricula || "",
        whatsapp: user?.whatsapp || "",
        perfil: user?.perfil || "galpao",
        password: "",
      });
    }
  }, [open, user]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome?.trim()) return toast.error("Nome é obrigatório");
    if (!isEdit && !form.username?.trim()) return toast.error("Login é obrigatório");
    if (!isEdit && !form.password?.trim()) return toast.error("Senha é obrigatória");

    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/users/${user!.id}` : "/api/admin/users";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? { ...form } : { ...form };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      toast.success(isEdit ? "Usuário atualizado" : "Usuário criado");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-fips-blue-200)" }}>
              <UserCog size={20} style={{ color: "var(--fips-primary)" }} />
            </div>
            <div>
              <DialogTitle>{isEdit ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
              <DialogDescription>
                {isEdit ? "Altere os dados do usuário" : "Preencha os dados para criar um novo usuário"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          <Field density="compact" inset="icon">
            <FieldLabel>Nome</FieldLabel>
            <Input density="compact" leftIcon={<User size={14} />} value={form.nome || ""} onChange={(e) => set("nome", e.target.value)} />
          </Field>

          <Field density="compact" inset="icon">
            <FieldLabel>Login</FieldLabel>
            <Input density="compact" leftIcon={<Mail size={14} />} value={form.username || ""} onChange={(e) => set("username", e.target.value)} disabled={isEdit} />
          </Field>

          {!isEdit && (
            <Field density="compact" inset="icon">
              <FieldLabel>Senha</FieldLabel>
              <Input density="compact" type="password" value={form.password || ""} onChange={(e) => set("password", e.target.value)} />
            </Field>
          )}

          <Field density="compact" inset="icon">
            <FieldLabel>Perfil</FieldLabel>
            <select
              value={form.perfil || "galpao"}
              onChange={(e) => set("perfil", e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm border"
              style={{ background: "var(--fips-surface)", borderColor: "var(--fips-border)", color: "var(--fips-fg)" }}
            >
              {PERFIS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field density="compact" inset="icon">
            <FieldLabel>Cargo</FieldLabel>
            <Input density="compact" leftIcon={<Briefcase size={14} />} value={form.cargo || ""} onChange={(e) => set("cargo", e.target.value)} />
          </Field>

          <Field density="compact" inset="icon">
            <FieldLabel>Departamento</FieldLabel>
            <Input density="compact" leftIcon={<Building2 size={14} />} value={form.departamento || ""} onChange={(e) => set("departamento", e.target.value)} />
          </Field>

          <Field density="compact" inset="icon">
            <FieldLabel>Matrícula</FieldLabel>
            <Input density="compact" leftIcon={<Hash size={14} />} value={form.matricula || ""} onChange={(e) => set("matricula", e.target.value)} />
          </Field>

          <Field density="compact" inset="icon">
            <FieldLabel>WhatsApp</FieldLabel>
            <Input density="compact" leftIcon={<Phone size={14} />} value={form.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>
            {isEdit ? "Salvar" : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
