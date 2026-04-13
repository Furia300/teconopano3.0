import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Truck, Building2, CalendarDays,
  AlignLeft, Check, Search, Star, TrendingUp, Repeat,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldHint, type FieldInset } from "@/components/ui/field";

interface Fornecedor {
  id: string;
  nome: string;
  razaoSocial?: string;
  cnpj: string;
}

interface Coleta {
  fornecedorId: string;
  nomeFantasia?: string;
}

interface NovaColetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ModalField({
  label, required = false, inset = "control", children,
}: { label: React.ReactNode; required?: boolean; inset?: FieldInset; children: React.ReactNode }) {
  return (
    <Field density="compact" inset={inset}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </Field>
  );
}

const FREQUENCIAS = [
  { value: "", label: "Sem recorrência" },
  { value: "3dias", label: "A cada 3 dias" },
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal (15 dias)" },
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

export function NovaColetaDialog({ open, onOpenChange, onSuccess }: NovaColetaDialogProps) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchForn, setSearchForn] = useState("");
  const [showFornList, setShowFornList] = useState(false);

  const [form, setForm] = useState({
    fornecedorId: "",
    fornecedorNome: "",
    dataChegada: "",
    observacao: "",
    recorrencia: "",
  });

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/fornecedores").then((r) => r.json()),
        fetch("/api/coletas").then((r) => r.json()).catch(() => []),
      ]).then(([forns, cols]) => {
        setFornecedores(forns);
        setColetas(cols);
      });
    }
  }, [open]);

  /* ─── Métricas: top fornecedores por frequência ─── */
  const topFornecedores = useMemo(() => {
    const freq: Record<string, { count: number; nome: string; id: string }> = {};
    for (const c of coletas) {
      if (!c.fornecedorId) continue;
      if (!freq[c.fornecedorId]) {
        const forn = fornecedores.find((f) => f.id === c.fornecedorId);
        freq[c.fornecedorId] = { count: 0, nome: forn?.nome || c.nomeFantasia || "?", id: c.fornecedorId };
      }
      freq[c.fornecedorId].count++;
    }
    return Object.values(freq).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [coletas, fornecedores]);

  /* ─── Filtro de fornecedores ─── */
  const filteredForn = useMemo(() => {
    const q = searchForn.trim().toLowerCase();
    if (!q) return fornecedores;
    return fornecedores.filter((f) =>
      (f.nome || "").toLowerCase().includes(q) ||
      (f.razaoSocial || "").toLowerCase().includes(q) ||
      (f.cnpj || "").replace(/\D/g, "").includes(q.replace(/\D/g, "")),
    );
  }, [fornecedores, searchForn]);

  const selectFornecedor = (f: Fornecedor) => {
    setForm((prev) => ({ ...prev, fornecedorId: f.id, fornecedorNome: f.nome }));
    setSearchForn("");
    setShowFornList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fornecedorId) return toast.error("Selecione um fornecedor");

    setLoading(true);
    try {
      const res = await fetch("/api/coletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Pedido de coleta registrado.");
      setForm({ fornecedorId: "", fornecedorNome: "", dataChegada: "", observacao: "", recorrencia: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao cadastrar coleta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0">
        {/* ─── HEADER ─── */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Truck className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Pedido de coleta</DialogTitle>
              <DialogDescription>
                Escritório → Motorista → Galpão. NF e peso serão preenchidos pelo galpão na chegada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ─── BODY ─── */}
        <form onSubmit={handleSubmit} id="form-nova-coleta" className="space-y-4 px-6 py-4">

          {/* Fornecedor com busca */}
          <div className="relative">
            <ModalField label="Fornecedor" required inset="icon">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fips-fg-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar por nome, razão social ou CNPJ..."
                  value={form.fornecedorId ? form.fornecedorNome : searchForn}
                  onChange={(e) => {
                    setSearchForn(e.target.value);
                    setShowFornList(true);
                    if (form.fornecedorId) setForm((f) => ({ ...f, fornecedorId: "", fornecedorNome: "" }));
                  }}
                  onFocus={() => setShowFornList(true)}
                  className="w-full pl-9 pr-9 py-2 rounded-xl text-sm"
                  style={{
                    background: form.fornecedorId ? "rgba(0,198,76,0.06)" : "var(--fips-surface)",
                    border: `1.5px solid ${form.fornecedorId ? "rgba(0,198,76,0.3)" : "var(--fips-border)"}`,
                    color: "var(--fips-fg)",
                    outline: "none",
                    boxShadow: "var(--shadow-field)",
                  }}
                />
                {form.fornecedorId && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fips-success)]" />
                )}
              </div>
            </ModalField>

            {/* Dropdown resultados */}
            {showFornList && !form.fornecedorId && (
              <div
                className="absolute z-50 mt-1 w-full overflow-hidden"
                style={{
                  background: "var(--fips-surface)",
                  border: "1px solid var(--fips-border)",
                  borderRadius: "10px 10px 10px 18px",
                  boxShadow: "var(--shadow-elevated)",
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                {/* Top fornecedores */}
                {!searchForn && topFornecedores.length > 0 && (
                  <div className="px-3 py-2 border-b" style={{ borderColor: "var(--fips-border)", background: "var(--fips-surface-muted)" }}>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp size={10} style={{ color: "var(--fips-warning)" }} />
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--fips-fg-muted)" }}>Mais frequentes</span>
                    </div>
                    {topFornecedores.map((t) => (
                      <button
                        key={t.id} type="button"
                        onClick={() => { const f = fornecedores.find((x) => x.id === t.id); if (f) selectFornecedor(f); }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-left text-[11px] hover:bg-white/[0.06] transition-colors"
                        style={{ color: "var(--fips-fg)", cursor: "pointer", background: "none", border: "none" }}
                      >
                        <Star size={10} style={{ color: "var(--fips-warning)" }} />
                        <span className="flex-1 truncate">{t.nome}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--fips-surface)", color: "var(--fips-fg-muted)" }}>{t.count}x</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredForn.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs" style={{ color: "var(--fips-fg-muted)" }}>Nenhum fornecedor encontrado</div>
                ) : (
                  filteredForn.slice(0, 15).map((f) => (
                    <button
                      key={f.id} type="button"
                      onClick={() => selectFornecedor(f)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-[11px] hover:bg-white/[0.04] transition-colors"
                      style={{ color: "var(--fips-fg)", cursor: "pointer", background: "none", border: "none", borderBottom: "1px solid var(--fips-border)" }}
                    >
                      <Building2 size={12} style={{ color: "var(--fips-fg-muted)", flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{f.nome}</div>
                        {f.cnpj && <div className="text-[9px]" style={{ color: "var(--fips-fg-muted)" }}>{f.cnpj}</div>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {showFornList && !form.fornecedorId && (
            <div className="fixed inset-0 z-40" onClick={() => setShowFornList(false)} />
          )}

          {/* Data + Recorrência */}
          <div className="grid gap-x-5 gap-y-3 grid-cols-2">
            <ModalField label="Data prevista de chegada" inset="icon">
              <Input
                density="compact"
                type="date"
                leftIcon={<CalendarDays className="h-4 w-4" />}
                value={form.dataChegada}
                onChange={(e) => setForm((f) => ({ ...f, dataChegada: e.target.value }))}
              />
              <FieldHint>Sem data = fica pendente.</FieldHint>
            </ModalField>

            <ModalField label="Agendamento recorrente" inset="icon">
              <Select
                density="compact"
                leftIcon={<Repeat className="h-4 w-4" />}
                value={form.recorrencia}
                onChange={(e) => setForm((f) => ({ ...f, recorrencia: e.target.value }))}
              >
                {FREQUENCIAS.map((fr) => (
                  <option key={fr.value} value={fr.value}>{fr.label}</option>
                ))}
              </Select>
              <FieldHint>Cria próxima coleta automaticamente.</FieldHint>
            </ModalField>
          </div>

          {/* Observação */}
          <ModalField label="Observação" inset="icon">
            <div className="relative">
              <AlignLeft className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
              <Textarea
                density="compact"
                placeholder="Instruções para o motorista, detalhes da retirada..."
                value={form.observacao}
                onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                className="min-h-[60px] resize-none pl-9"
              />
            </div>
          </ModalField>
        </form>

        {/* ─── FOOTER ─── */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" form="form-nova-coleta" variant="success" loading={loading} className="gap-2">
                <Check className="h-4 w-4" /> Registrar pedido
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
