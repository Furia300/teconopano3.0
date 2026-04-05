import { useEffect, useState } from "react";
import { Box, Plus, Search, Edit, Trash2, Ruler, Weight, Palette } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Produto {
  id: string;
  descricao: string;
  tipoMaterial: string;
  cor: string;
  medida: string;
  acabamento: string;
  pesoMedio: number;
  unidadeMedida: string;
  observacao: string;
}

const TIPOS = ["TNT","GSY","TOALHA","UNIFORME","FRONHA","FITILHO","LISTRADO","AVENTAL","A9","ESTOPA","MALHA","MANTA ABSORÇÃO","PASTELÃO","ATM","A2","ENXOVAL","GRU","MANTA FINA","GR","FUR","BR","EDREDON","FAIXA","LENÇOL"];
const ACABAMENTOS = ["Corte-Reto", "Zig-Zag", "Overlock", "Sem Acabamento"];
const MEDIDAS = ["20x20 Cm", "30x30 Cm", "40x40 Cm", "50x50 Cm", "60x80 Cm", "Sob medida"];
const CORES = ["Branco","Colorido","Escuro","Azul","Verde","Variado","Preto"];

export default function ProdutosList() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Produto | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ descricao: "", tipoMaterial: "", cor: "", medida: "", acabamento: "", pesoMedio: "", unidadeMedida: "Pacote/Kilo", observacao: "" });

  const fetchProdutos = async () => {
    try {
      const res = await fetch("/api/produtos");
      setProdutos(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProdutos(); }, []);

  const filtered = produtos.filter((p) => {
    const matchSearch = !search || p.descricao.toLowerCase().includes(search.toLowerCase()) || p.tipoMaterial.toLowerCase().includes(search.toLowerCase());
    const matchMaterial = !filterMaterial || p.tipoMaterial === filterMaterial;
    return matchSearch && matchMaterial;
  });

  const materiais = [...new Set(produtos.map((p) => p.tipoMaterial))].sort();

  const openNew = () => {
    setEditItem(null);
    setForm({ descricao: "", tipoMaterial: "", cor: "", medida: "", acabamento: "", pesoMedio: "", unidadeMedida: "Pacote/Kilo", observacao: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Produto) => {
    setEditItem(p);
    setForm({ descricao: p.descricao, tipoMaterial: p.tipoMaterial, cor: p.cor || "", medida: p.medida || "", acabamento: p.acabamento || "", pesoMedio: String(p.pesoMedio || ""), unidadeMedida: p.unidadeMedida || "Pacote/Kilo", observacao: p.observacao || "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.tipoMaterial) { toast.error("Descrição e tipo material obrigatórios"); return; }
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/produtos/${editItem.id}` : "/api/produtos";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(editItem ? "Produto atualizado!" : "Produto cadastrado!");
      setDialogOpen(false);
      fetchProdutos();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    toast.success("Produto excluído");
    fetchProdutos();
  };

  const update = (f: string, v: string) => setForm((prev) => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Produtos" description="Catálogo de panos, toalhas, trapos e materiais" icon={Box}
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" />Novo Produto</Button>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Produtos" value={produtos.length} icon={Box} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Tipos Material" value={materiais.length} icon={Palette} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Com Medida" value={produtos.filter((p) => p.medida).length} icon={Ruler} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Com Peso Médio" value={produtos.filter((p) => p.pesoMedio > 0).length} icon={Weight} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><Input placeholder="Buscar por descrição ou material..." icon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="w-full sm:w-44">
            <Select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)}>
              <option value="">Todos materiais</option>
              {materiais.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Medida</TableHead>
              <TableHead>Acabamento</TableHead>
              <TableHead>Peso Médio</TableHead>
              <TableHead>Un. Medida</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableEmpty colSpan={8} message="Carregando..." /> :
             filtered.length === 0 ? <TableEmpty colSpan={8} /> :
             filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.descricao}</TableCell>
                <TableCell><Badge variant="outline">{p.tipoMaterial}</Badge></TableCell>
                <TableCell>{p.cor || "—"}</TableCell>
                <TableCell>{p.medida || "—"}</TableCell>
                <TableCell>{p.acabamento || "—"}</TableCell>
                <TableCell>{p.pesoMedio ? `${p.pesoMedio} kg` : "—"}</TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px]">{p.unidadeMedida}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="iconSm" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="iconSm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>Catálogo de produtos Tecnopano</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Descrição *</label><Input value={form.descricao} onChange={(e) => update("descricao", e.target.value)} placeholder="Ex: Pano Industrial Branco 30x30" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Tipo Material *</label>
                <Select value={form.tipoMaterial} onChange={(e) => update("tipoMaterial", e.target.value)}>
                  <option value="">Selecione</option>{TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Cor</label>
                <Select value={form.cor} onChange={(e) => update("cor", e.target.value)}>
                  <option value="">Selecione</option>{CORES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Medida</label>
                <Select value={form.medida} onChange={(e) => update("medida", e.target.value)}>
                  <option value="">Selecione</option>{MEDIDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Acabamento</label>
                <Select value={form.acabamento} onChange={(e) => update("acabamento", e.target.value)}>
                  <option value="">Selecione</option>{ACABAMENTOS.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Peso Médio (kg)</label><Input type="number" step="0.01" value={form.pesoMedio} onChange={(e) => update("pesoMedio", e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Un. Medida</label>
                <Select value={form.unidadeMedida} onChange={(e) => update("unidadeMedida", e.target.value)}>
                  <option value="Pacote/Kilo">Pacote/Kilo</option><option value="Kilo">Kilo</option><option value="Unidade">Unidade</option>
                </Select></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Observação</label><Textarea value={form.observacao} onChange={(e) => update("observacao", e.target.value)} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>{editItem ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
