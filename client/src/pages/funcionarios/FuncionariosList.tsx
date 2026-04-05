import { useEffect, useState } from "react";
import { Users, Plus, Search, Wifi, WifiOff, Truck, Scissors, Warehouse } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { NovoColaboradorDialog } from "./NovoColaboradorDialog";

interface Colaborador {
  id: number;
  cpf: string;
  name: string;
  registration: string;
  departamento: string;
  status: number;
  fonte: "rhid" | "local";
}

interface ColaboradoresResponse {
  fonte: "rhid" | "local";
  colaboradores: Colaborador[];
}

export default function FuncionariosList() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [fonte, setFonte] = useState<"rhid" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDepto, setFilterDepto] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchColaboradores = async () => {
    try {
      const res = await fetch("/api/colaboradores");
      const data: ColaboradoresResponse = await res.json();
      setColaboradores(data.colaboradores);
      setFonte(data.fonte);
    } catch (err) {
      console.error("Erro ao buscar colaboradores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const departamentos = [...new Set(colaboradores.map((c) => c.departamento).filter(Boolean))].sort();

  const filtered = colaboradores.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search) ||
      c.registration.toLowerCase().includes(search.toLowerCase());
    const matchDepto = !filterDepto || c.departamento === filterDepto;
    return matchSearch && matchDepto;
  });

  const stats = {
    total: colaboradores.length,
    motoristas: colaboradores.filter((c) => c.departamento.toLowerCase().includes("motorista")).length,
    galpao: colaboradores.filter((c) => c.departamento.toLowerCase().includes("galp")).length,
    costura: colaboradores.filter((c) => c.departamento.toLowerCase().includes("costur")).length,
  };

  const formatCPF = (cpf: string) => {
    const digits = cpf.replace(/\D/g, "").padStart(11, "0");
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const deptoIcon = (depto: string) => {
    const d = depto.toLowerCase();
    if (d.includes("motorista")) return <Truck className="h-3 w-3" />;
    if (d.includes("costur")) return <Scissors className="h-3 w-3" />;
    return <Warehouse className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colaboradores"
        description="Funcionários sincronizados do RHiD ou cadastro manual"
        icon={Users}
        actions={
          <div className="flex items-center gap-3">
            {/* Indicador fonte */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              fonte === "rhid"
                ? "bg-success/10 text-success border border-success/20"
                : "bg-warning/10 text-warning border border-warning/20"
            }`}>
              {fonte === "rhid" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {fonte === "rhid" ? "RHiD Conectado" : "Modo Local"}
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Cadastro Manual
            </Button>
          </div>
        }
      />

      {/* Alerta modo local */}
      {fonte === "local" && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
          <WifiOff className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">API RHiD não configurada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Usando cadastro local. Para sincronizar com o RHiD, configure RHID_EMAIL e RHID_PASSWORD no arquivo .env.
              Peça as credenciais para a Tecnopano ou para o Luiz (suporte ControlID).
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Colaboradores" value={stats.total} icon={Users} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Motoristas" value={stats.motoristas} icon={Truck} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Galpão" value={stats.galpao} icon={Warehouse} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Costura" value={stats.costura} icon={Scissors} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl border shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, CPF ou matrícula..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterDepto} onChange={(e) => setFilterDepto(e.target.value)}>
              <option value="">Todos departamentos</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fonte</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmpty colSpan={6} message="Carregando..." />
            ) : filtered.length === 0 ? (
              <TableEmpty colSpan={6} />
            ) : (
              filtered.map((colab) => (
                <TableRow key={`${colab.fonte}-${colab.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
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
                    <Badge variant={colab.fonte === "rhid" ? "info" : "secondary"} className="text-[10px]">
                      {colab.fonte === "rhid" ? "RHiD" : "Local"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NovoColaboradorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchColaboradores}
      />
    </div>
  );
}
