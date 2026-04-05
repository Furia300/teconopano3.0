import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { QrCode, Info } from "lucide-react";

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  status: string;
}

interface NovaProducaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  salas: string[];
  salaSaidaMap: Record<string, string>;
}

const ACABAMENTOS = ["Corte-Reto", "Zig-Zag", "Overlock", "Sem Acabamento"];
const MEDIDAS = ["20x20 Cm", "30x30 Cm", "40x40 Cm", "50x50 Cm", "60x80 Cm", "Sob medida"];
const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];
const CORES = ["Branco", "Colorido", "Escuro", "Azul", "Verde", "Variado"];

export function NovaProducaoDialog({ open, onOpenChange, onSuccess, salas, salaSaidaMap }: NovaProducaoDialogProps) {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    coletaId: "",
    sala: "",
    tipoMaterial: "",
    cor: "",
    acabamento: "",
    medida: "",
    kilo: "",
    pesoMedio: "",
    qtdePacote: "",
    operador: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/coletas")
        .then((r) => r.json())
        .then((data: Coleta[]) => {
          setColetas(data.filter((c) => ["em_separacao", "separado", "em_producao"].includes(c.status)));
        })
        .catch(console.error);
    }
  }, [open]);

  const unidadeSaida = salaSaidaMap[form.sala] || "unidade";

  // Auto-calc pacotes when peso medio changes
  const calcPacotes = () => {
    if (form.kilo && form.pesoMedio && Number(form.pesoMedio) > 0) {
      return Math.floor(Number(form.kilo) / Number(form.pesoMedio));
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coletaId || !form.sala || !form.tipoMaterial || !form.kilo) {
      toast.error("Preencha coleta, sala, material e peso");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/producoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          unidadeSaida,
          qtdePacote: form.qtdePacote || String(calcPacotes()),
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar produção");

      toast.success(`Produção registrada na ${form.sala}!`);
      setForm({ coletaId: "", sala: "", tipoMaterial: "", cor: "", acabamento: "", medida: "", kilo: "", pesoMedio: "", qtdePacote: "", operador: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar produção");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Registrar Produção
          </DialogTitle>
          <DialogDescription>
            Operador lê o QR Code e registra o que foi produzido na sala
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coleta */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Coleta de Origem *</label>
            <Select value={form.coletaId} onChange={(e) => update("coletaId", e.target.value)}>
              <option value="">Selecione a coleta</option>
              {coletas.map((c) => (
                <option key={c.id} value={c.id}>#{c.numero} — {c.nomeFantasia}</option>
              ))}
            </Select>
          </div>

          {/* Sala */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sala de Produção *</label>
            <div className="grid grid-cols-4 gap-2">
              {salas.map((sala) => {
                const isKilo = salaSaidaMap[sala] === "kilo";
                const isSelected = form.sala === sala;
                return (
                  <button
                    key={sala}
                    type="button"
                    onClick={() => update("sala", sala)}
                    className={`p-2 rounded-lg border text-center transition-all text-xs font-medium ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:border-primary/50"
                    }`}
                  >
                    {sala}
                    <Badge variant={isKilo ? "info" : "success"} className="mt-1 text-[9px] block mx-auto">
                      {isKilo ? "kg" : "un"}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material e Cor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo Material *</label>
              <Select value={form.tipoMaterial} onChange={(e) => update("tipoMaterial", e.target.value)}>
                <option value="">Selecione</option>
                {TIPOS_MATERIAL.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <Select value={form.cor} onChange={(e) => update("cor", e.target.value)}>
                <option value="">Selecione</option>
                {CORES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Acabamento e Medida */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Acabamento</label>
              <Select value={form.acabamento} onChange={(e) => update("acabamento", e.target.value)}>
                <option value="">Selecione</option>
                {ACABAMENTOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Medida</label>
              <Select value={form.medida} onChange={(e) => update("medida", e.target.value)}>
                <option value="">Selecione</option>
                {MEDIDAS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Peso, Peso Médio, Pacotes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso Total (kg) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.kilo}
                onChange={(e) => update("kilo", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso Médio/Pct</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.pesoMedio}
                onChange={(e) => update("pesoMedio", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Qtde Pacotes</label>
              <Input
                type="number"
                placeholder={String(calcPacotes()) || "0"}
                value={form.qtdePacote}
                onChange={(e) => update("qtdePacote", e.target.value)}
              />
            </div>
          </div>

          {/* Info saída */}
          {form.sala && (
            <div className="flex items-center gap-2 p-3 bg-info/10 border border-info/20 rounded-lg">
              <Info className="h-4 w-4 text-info shrink-0" />
              <p className="text-sm">
                <span className="font-medium">{form.sala}</span> — Saída por{" "}
                <Badge variant={unidadeSaida === "kilo" ? "info" : "success"} className="text-[10px]">
                  {unidadeSaida === "kilo" ? "Kilo" : "Unidade"}
                </Badge>
                {calcPacotes() > 0 && (
                  <span className="text-muted-foreground"> — ~{calcPacotes()} pacotes calculados</span>
                )}
              </p>
            </div>
          )}

          {/* Operador */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Operador</label>
            <Input
              placeholder="Nome do operador na sala"
              value={form.operador}
              onChange={(e) => update("operador", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Registrar Produção
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
