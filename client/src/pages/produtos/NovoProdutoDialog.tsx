import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Box,
  Hash,
  FileText,
  Palette,
  Ruler,
  Scissors,
  Scale,
  DollarSign,
  Tag,
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

interface Produto {
  id: string;
  codigo?: string | null;
  nome?: string | null;
  descricao: string;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  pesoMedio?: number | null;
  unidadeMedida?: string | null;
  precoCusto?: number | null;
  precoVenda?: number | null;
  ativo?: boolean;
}

interface NovoProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  produto?: Produto | null;
}

const EMPTY_FORM = {
  codigo: "",
  nome: "",
  descricao: "",
  tipoMaterial: "",
  cor: "",
  medida: "",
  acabamento: "",
  pesoMedio: "",
  unidadeMedida: "Pacote/Kilo",
  precoCusto: "",
  precoVenda: "",
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

export function NovoProdutoDialog({
  open,
  onOpenChange,
  onSuccess,
  produto,
}: NovoProdutoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(produto?.id);

  useEffect(() => {
    if (open && produto) {
      setForm({
        codigo: produto.codigo ?? "",
        nome: produto.nome ?? "",
        descricao: produto.descricao ?? "",
        tipoMaterial: produto.tipoMaterial ?? "",
        cor: produto.cor ?? "",
        medida: produto.medida ?? "",
        acabamento: produto.acabamento ?? "",
        pesoMedio: produto.pesoMedio?.toString() ?? "",
        unidadeMedida: produto.unidadeMedida ?? "Pacote/Kilo",
        precoCusto: produto.precoCusto?.toString() ?? "",
        precoVenda: produto.precoVenda?.toString() ?? "",
      });
    } else if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open, produto]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao.trim() && !form.nome.trim()) {
      toast.error("Descrição ou nome é obrigatório");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        codigo: form.codigo.trim() || null,
        nome: form.nome.trim() || null,
        descricao: form.descricao.trim() || form.nome.trim(),
        tipoMaterial: form.tipoMaterial.trim() || form.nome.trim() || null,
        cor: form.cor.trim() || null,
        medida: form.medida.trim() || null,
        acabamento: form.acabamento.trim() || null,
        pesoMedio: form.pesoMedio ? Number(form.pesoMedio) : null,
        unidadeMedida: form.unidadeMedida || null,
        precoCusto: form.precoCusto ? Number(form.precoCusto) : null,
        precoVenda: form.precoVenda ? Number(form.precoVenda) : null,
      };
      const res = await fetch(
        isEdit ? `/api/produtos/${produto!.id}` : "/api/produtos",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Produto atualizado." : "Produto cadastrado.");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(isEdit ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.");
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
              <Box className="h-5 w-5 text-[var(--fips-secondary)]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
              <DialogDescription>
                Cada combinação <strong className="font-semibold text-[var(--fips-fg)]">cor + medida + acabamento</strong>
                {" "}é uma <strong className="font-semibold text-[var(--fips-fg)]">variante</strong> distinta do mesmo
                código de produto.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="form-produto" onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {/* IDENTIFICAÇÃO */}
          <div className="grid gap-x-5 gap-y-3 md:grid-cols-[120px_1fr]">
            <ModalField label="Código" inset="icon">
              <Input
                density="compact"
                placeholder="000"
                leftIcon={<Hash className="h-4 w-4" aria-hidden />}
                value={form.codigo}
                onChange={(e) => update("codigo", e.target.value)}
              />
            </ModalField>
            <ModalField label="Nome / Linha" required inset="icon">
              <Input
                density="compact"
                placeholder="Ex: Tecnopano Avental Verde"
                leftIcon={<Tag className="h-4 w-4" aria-hidden />}
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
              />
            </ModalField>
          </div>

          <ModalField label="Descrição completa" inset="icon">
            <Input
              density="compact"
              placeholder="Descrição (opcional — se vazio usa o nome)"
              leftIcon={<FileText className="h-4 w-4" aria-hidden />}
              value={form.descricao}
              onChange={(e) => update("descricao", e.target.value)}
            />
          </ModalField>

          {/* CARACTERÍSTICAS — variante */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Variante (cor · medida · acabamento)
            </p>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-3">
              <ModalField label="Cor" inset="icon">
                <Input
                  density="compact"
                  placeholder="Verde, Branco, Variado..."
                  leftIcon={<Palette className="h-4 w-4" aria-hidden />}
                  value={form.cor}
                  onChange={(e) => update("cor", e.target.value)}
                />
              </ModalField>
              <ModalField label="Medida" inset="icon">
                <Input
                  density="compact"
                  placeholder="P, M, G, GG ou 30x30 Cm"
                  leftIcon={<Ruler className="h-4 w-4" aria-hidden />}
                  value={form.medida}
                  onChange={(e) => update("medida", e.target.value)}
                />
              </ModalField>
              <ModalField label="Acabamento" inset="icon">
                <Input
                  density="compact"
                  placeholder="Corte-Reto, Overlock, Zig-Zag..."
                  leftIcon={<Scissors className="h-4 w-4" aria-hidden />}
                  value={form.acabamento}
                  onChange={(e) => update("acabamento", e.target.value)}
                />
              </ModalField>
            </div>
          </div>

          {/* PESO + UNIDADE */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Medida e unidade
            </p>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
              <ModalField label="Peso médio (kg/un)" inset="icon">
                <Input
                  density="compact"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  leftIcon={<Scale className="h-4 w-4" aria-hidden />}
                  value={form.pesoMedio}
                  onChange={(e) => update("pesoMedio", e.target.value)}
                />
              </ModalField>
              <ModalField label="Unidade de saída" inset="icon">
                <Select
                  density="compact"
                  aria-label="Unidade de medida"
                  leftIcon={<Box className="h-4 w-4" aria-hidden />}
                  value={form.unidadeMedida}
                  onChange={(e) => update("unidadeMedida", e.target.value)}
                >
                  <option value="Pacote/Kilo">Pacote/Kilo</option>
                  <option value="Kilo">Kilo</option>
                  <option value="Pacote">Pacote</option>
                  <option value="Unidade">Unidade</option>
                </Select>
              </ModalField>
            </div>
          </div>

          {/* PREÇOS */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Preços
            </p>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
              <ModalField label="Preço de custo (R$)" inset="icon">
                <Input
                  density="compact"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="h-4 w-4" aria-hidden />}
                  value={form.precoCusto}
                  onChange={(e) => update("precoCusto", e.target.value)}
                />
              </ModalField>
              <ModalField label="Preço de venda (R$)" inset="icon">
                <Input
                  density="compact"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="h-4 w-4" aria-hidden />}
                  value={form.precoVenda}
                  onChange={(e) => update("precoVenda", e.target.value)}
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
                form="form-produto"
                variant="success"
                loading={loading}
                className="gap-2"
              >
                <Check className="h-4 w-4" aria-hidden />
                {isEdit ? "Salvar alterações" : "Cadastrar produto"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
