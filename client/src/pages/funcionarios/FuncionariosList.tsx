import { useEffect, useState } from "react";
import { Users, Plus, Search, Wifi, WifiOff, Truck, Scissors, Warehouse, Edit, Trash2, RefreshCw, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty,
} from "@/components/ui/table";
import { ColaboradorDialog } from "./ColaboradorDialog";

interface Colaborador {
  id: number;
  cpf: string;
  name: string;
  registration: string;
  departamento: string;
  idDepartment: number;
  status: number;
  fonte: "rhid" | "local" | "rhid+local";
}

interface ColaboradoresResponse {
  fonte: "rhid" | "local";
  colaboradores: Colaborador[];
}

export default function FuncionariosList() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [fonte, setFonte] = useState<"rhid" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDepto, setFilterDepto] = useState("");
  const [tab, setTab] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Colaborador | null>(null);

  const fetchColaboradores = async () => {
    try {
      const res = await fetch("/api/colaboradores");
      const data: ColaboradoresResponse = await res.json();
      setColaboradores(data.colaboradores);
      setFonte(data.fonte);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchColaboradores(); }, []);

  const departamentos = [...new Set(colaboradores.map((c) => c.departamento).filter(Boolean))].sort();

  const filtered = colaboradores.filter((c) => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search.replace(/\D/g, "")) ||
      c.registration.toLowerCase().includes(search.toLowerCase());
    const matchDepto = !filterDepto || c.departamento === filterDepto;
    const matchTab = tab === "todos" ||
      (tab === "motorista" && c.departamento.toLowerCase().includes("motorista")) ||
      (tab === "galpao" && c.departamento.toLowerCase().includes("galp")) ||
      (tab === "costura" && c.departamento.toLowerCase().includes("costur"));
    return matchSearch && matchDepto && matchTab;
  });

  const stats = {
    total: colaboradores.length,
    motoristas: colaboradores.filter((c) => c.departamento.toLowerCase().includes("motorista")).length,
    galpao: colaboradores.filter((c) => c.departamento.toLowerCase().includes("galp")).length,
    costura: colaboradores.filter((c) => c.departamento.toLowerCase().includes("costur")).length,
  };

  const formatCPF = (cpf: string) => {
    const d = cpf.replace(/\D/g, "").padStart(11, "0");
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const deptoIcon = (depto: string) => {
    const d = depto.toLowerCase();
    if (d.includes("motorista")) return <Truck className="h-3 w-3" />;
    if (d.includes("costur")) return <Scissors className="h-3 w-3" />;
    return <Warehouse className="h-3 w-3" />;
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetchColaboradores();
    setSyncing(false);
    toast.success(fonte === "rhid" ? "Sincronizado com RHiD!" : "Dados locais atualizados");
  };

  const openNew = () => { setEditItem(null); setDialogOpen(true); };
  const openEdit = (c: Colaborador) => { setEditItem(c); setDialogOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este colaborador? Isso também removerá do RHiD se estiver conectado.")) return;
    await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
    toast.success("Colaborador excluído");
    fetchColaboradores();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Colaboradores" description="Gestão de funcionários — sincronização bidirecional com RHiD" icon={Users}
        actions={
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              fonte === "rhid" ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"
            }`}>
              {fonte === "rhid" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {fonte === "rhid" ? "RHiD Conectado" : "Modo Local"}
            </div>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar
            </Button>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              Novo Colaborador
            </Button>
          </div>
        }
      />

      {fonte === "local" && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
          <WifiOff className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">API RHiD não configurada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cadastros feitos aqui serão salvos localmente. Quando o RHiD for configurado, novos cadastros serão enviados automaticamente para ambos os sistemas.
            </p>
          </div>
        </div>
      )}

      {fonte === "rhid" && (
        <div className="p-3 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3">
          <Wifi className="h-5 w-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-success">Sincronização Bidirecional Ativa</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alterações feitas aqui são enviadas para o RHiD. Alterações no RHiD aparecem aqui ao sincronizar.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Colaboradores" value={stats.total} icon={Users} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Motoristas" value={stats.motoristas} icon={Truck} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Galpão" value={stats.galpao} icon={Warehouse} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Costura" value={stats.costura} icon={Scissors} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      {/* Tabs rápidos por departamento */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="motorista">Motoristas ({stats.motoristas})</TabsTrigger>
          <TabsTrigger value="galpao">Galpão ({stats.galpao})</TabsTrigger>
          <TabsTrigger value="costura">Costura ({stats.costura})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-xl border shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input placeholder="Buscar por nome, CPF ou matrícula..." icon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterDepto} onChange={(e) => setFilterDepto(e.target.value)}>
              <option value="">Todos departamentos</option>
              {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableEmpty colSpan={7} message="Carregando..." /> :
             filtered.length === 0 ? <TableEmpty colSpan={7} /> :
             filtered.map((colab) => (
              <TableRow key={`${colab.fonte}-${colab.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                      {colab.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-medium">{colab.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{formatCPF(colab.cpf)}</TableCell>
                <TableCell>{colab.registration || "—"}</TableCell>
                <TableCell>
                  {colab.departamento ? (
                    <Badge variant="outline" className="gap-1">
                      {deptoIcon(colab.departamento)}
                      {colab.departamento}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={colab.status === 1 ? "success" : "danger"} dot>
                    {colab.status === 1 ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={colab.fonte === "rhid" ? "info" : colab.fonte === "rhid+local" ? "success" : "secondary"} className="text-[10px]">
                    {colab.fonte === "rhid" ? "RHiD" : colab.fonte === "rhid+local" ? "Sync" : "Local"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="iconSm" onClick={() => openEdit(colab)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="iconSm" onClick={() => handleDelete(colab.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ColaboradorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
        fonte={fonte}
        onSuccess={fetchColaboradores}
      />
    </div>
  );
}
