import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Building2 } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Cliente {
  id: string;
  nome: string;
  cnpj: string;
  contato: string;
  email: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  observacao?: string;
}

export default function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", cnpj: "", contato: "", email: "", endereco: "", cidade: "", estado: "", observacao: "" });

  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      setClientes(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchClientes(); }, []);

  const filtered = clientes.filter((c) =>
    !search ||
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditItem(null);
    setForm({ nome: "", cnpj: "", contato: "", email: "", endereco: "", cidade: "", estado: "", observacao: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditItem(c);
    setForm({ nome: c.nome, cnpj: c.cnpj, contato: c.contato || "", email: c.email || "", endereco: c.endereco || "", cidade: c.cidade || "", estado: c.estado || "", observacao: c.observacao || "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/clientes/${editItem.id}` : "/api/clientes";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(editItem ? "Cliente atualizado!" : "Cliente cadastrado!");
      setDialogOpen(false);
      fetchClientes();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cliente?")) return;
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    toast.success("Cliente excluído");
    fetchClientes();
  };

  const update = (f: string, v: string) => setForm((prev) => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Empresas que compram panos prontos" icon={ShoppingCart}
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" />Novo Cliente</Button>} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Clientes" value={clientes.length} icon={Building2} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Com E-mail" value={clientes.filter((c) => c.email).length} icon={Mail} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Com Contato" value={clientes.filter((c) => c.contato).length} icon={Phone} color="text-purple-500" bg="bg-purple-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-4">
        <Input placeholder="Buscar por nome, CNPJ ou e-mail..." icon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableEmpty colSpan={6} message="Carregando..." /> :
             filtered.length === 0 ? <TableEmpty colSpan={6} /> :
             filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                      {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-medium">{c.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{c.cnpj}</TableCell>
                <TableCell>{c.contato || "—"}</TableCell>
                <TableCell>{c.email || "—"}</TableCell>
                <TableCell>{c.cidade && c.estado ? `${c.cidade}/${c.estado}` : "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="iconSm" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="iconSm" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            <DialogTitle>{editItem ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>Cadastro de empresa compradora de panos</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Fantasia *</label>
              <Input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome da empresa" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">CNPJ</label><Input value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Contato</label><Input value={form.contato} onChange={(e) => update("contato", e.target.value)} placeholder="(00) 0000-0000" /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">E-mail</label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@empresa.com" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Endereço</label><Input value={form.endereco} onChange={(e) => update("endereco", e.target.value)} placeholder="Rua, número" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Cidade</label><Input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Estado</label><Input value={form.estado} onChange={(e) => update("estado", e.target.value)} placeholder="SP" maxLength={2} /></div>
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
