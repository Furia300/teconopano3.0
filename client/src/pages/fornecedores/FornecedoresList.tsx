import { useEffect, useState } from "react";
import { Truck, Plus, Search, Edit, Trash2, Phone, Mail, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Fornecedor {
  id: string;
  nome: string;
  razaoSocial: string;
  cnpj: string;
  contato: string;
  email: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
}

export default function FornecedoresList() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Fornecedor | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", razaoSocial: "", cnpj: "", contato: "", email: "", endereco: "", cidade: "", estado: "" });

  const fetchFornecedores = async () => {
    try {
      const res = await fetch("/api/fornecedores");
      setFornecedores(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchFornecedores(); }, []);

  const filtered = fornecedores.filter((f) =>
    !search ||
    f.nome.toLowerCase().includes(search.toLowerCase()) ||
    f.cnpj.includes(search) ||
    (f.razaoSocial || "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditItem(null);
    setForm({ nome: "", razaoSocial: "", cnpj: "", contato: "", email: "", endereco: "", cidade: "", estado: "" });
    setDialogOpen(true);
  };

  const openEdit = (f: Fornecedor) => {
    setEditItem(f);
    setForm({ nome: f.nome, razaoSocial: f.razaoSocial || "", cnpj: f.cnpj, contato: f.contato || "", email: f.email || "", endereco: f.endereco || "", cidade: f.cidade || "", estado: f.estado || "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/fornecedores/${editItem.id}` : "/api/fornecedores";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(editItem ? "Fornecedor atualizado!" : "Fornecedor cadastrado!");
      setDialogOpen(false);
      fetchFornecedores();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este fornecedor?")) return;
    await fetch(`/api/fornecedores/${id}`, { method: "DELETE" });
    toast.success("Fornecedor excluído");
    fetchFornecedores();
  };

  const update = (f: string, v: string) => setForm((prev) => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Fornecedores" description="Hotéis, empresas e outros que vendem matéria-prima" icon={Truck}
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" />Novo Fornecedor</Button>} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Fornecedores" value={fornecedores.length} icon={Building2} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Ativos" value={fornecedores.filter((f) => f.ativo !== false).length} icon={Truck} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Com E-mail" value={fornecedores.filter((f) => f.email).length} icon={Mail} color="text-purple-500" bg="bg-purple-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-4">
        <Input placeholder="Buscar por nome, CNPJ ou razão social..." icon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableEmpty colSpan={6} message="Carregando..." /> :
             filtered.length === 0 ? <TableEmpty colSpan={6} /> :
             filtered.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center text-amber-600 font-bold text-xs">
                      {f.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-medium">{f.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.razaoSocial || "—"}</TableCell>
                <TableCell className="font-mono text-sm">{f.cnpj}</TableCell>
                <TableCell>{f.contato || "—"}</TableCell>
                <TableCell>{f.email || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="iconSm" onClick={() => openEdit(f)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="iconSm" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            <DialogTitle>{editItem ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
            <DialogDescription>Hotéis, empresas e outros que fornecem matéria-prima</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Nome Fantasia *</label><Input value={form.nome} onChange={(e) => update("nome", e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">CNPJ</label><Input value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Razão Social</label><Input value={form.razaoSocial} onChange={(e) => update("razaoSocial", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Contato</label><Input value={form.contato} onChange={(e) => update("contato", e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">E-mail</label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Endereço</label><Input value={form.endereco} onChange={(e) => update("endereco", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Cidade</label><Input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">UF</label><Input value={form.estado} onChange={(e) => update("estado", e.target.value)} maxLength={2} /></div>
            </div>
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
