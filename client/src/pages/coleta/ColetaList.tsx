import { useEffect, useState } from "react";
import { Truck, Plus, Search, Filter, Eye, Trash2, Package } from "lucide-react";
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
import { NovaColetaDialog } from "./NovaColetaDialog";
import { ColetaDetalhes } from "./ColetaDetalhes";

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  cnpjFornecedor: string;
  notaFiscal: string;
  pesoTotalNF: number;
  pesoTotalAtual: number;
  dataPedido: string;
  dataChegada: string | null;
  galpao: string;
  status: string;
  statusServico: string;
  observacao: string;
  fornecedorId: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  agendado: { label: "Agendado", variant: "info" },
  em_rota: { label: "Em Rota", variant: "info" },
  recebido: { label: "Recebido", variant: "secondary" },
  em_separacao: { label: "Em Separação", variant: "default" },
  separado: { label: "Separado", variant: "secondary" },
  em_producao: { label: "Em Produção", variant: "info" },
  finalizado: { label: "Finalizado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

export default function ColetaList() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesColeta, setDetalhesColeta] = useState<Coleta | null>(null);

  const fetchColetas = async () => {
    try {
      const res = await fetch("/api/coletas");
      const data = await res.json();
      setColetas(data);
    } catch (err) {
      console.error("Erro ao buscar coletas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColetas();
  }, []);

  const filtered = coletas.filter((c) => {
    const matchSearch =
      !search ||
      c.nomeFantasia.toLowerCase().includes(search.toLowerCase()) ||
      c.notaFiscal.toLowerCase().includes(search.toLowerCase()) ||
      String(c.numero).includes(search);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: coletas.length,
    pendentes: coletas.filter((c) => c.status === "pendente" || c.status === "agendado").length,
    emAndamento: coletas.filter((c) => ["recebido", "em_separacao", "em_producao"].includes(c.status)).length,
    finalizados: coletas.filter((c) => c.status === "finalizado").length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta coleta?")) return;
    await fetch(`/api/coletas/${id}`, { method: "DELETE" });
    fetchColetas();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatWeight = (weight: number) => {
    if (!weight) return "—";
    return `${weight.toLocaleString("pt-BR")} kg`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coleta"
        description="Entrada de matéria-prima dos fornecedores"
        icon={Truck}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Coleta
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Coletas" value={stats.total} icon={Truck} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Pendentes" value={stats.pendentes} icon={Package} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Em Andamento" value={stats.emAndamento} icon={Filter} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Finalizados" value={stats.finalizados} icon={Package} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl border shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por fornecedor, NF ou número..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="agendado">Agendado</option>
              <option value="recebido">Recebido</option>
              <option value="em_separacao">Em Separação</option>
              <option value="em_producao">Em Produção</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Nota Fiscal</TableHead>
              <TableHead>Peso NF</TableHead>
              <TableHead>Peso Atual</TableHead>
              <TableHead>Data Pedido</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmpty colSpan={9} message="Carregando..." />
            ) : filtered.length === 0 ? (
              <TableEmpty colSpan={9} />
            ) : (
              filtered.map((coleta) => {
                const sc = statusConfig[coleta.status] || { label: coleta.status, variant: "secondary" as const };
                return (
                  <TableRow key={coleta.id}>
                    <TableCell className="font-bold">#{coleta.numero}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{coleta.nomeFantasia}</p>
                        <p className="text-xs text-muted-foreground">{coleta.cnpjFornecedor}</p>
                      </div>
                    </TableCell>
                    <TableCell>{coleta.notaFiscal || "—"}</TableCell>
                    <TableCell>{formatWeight(coleta.pesoTotalNF)}</TableCell>
                    <TableCell>{formatWeight(coleta.pesoTotalAtual)}</TableCell>
                    <TableCell>{formatDate(coleta.dataPedido)}</TableCell>
                    <TableCell>{formatDate(coleta.dataChegada)}</TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} dot>{sc.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="iconSm" onClick={() => setDetalhesColeta(coleta)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="iconSm" onClick={() => handleDelete(coleta.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Nova Coleta */}
      <NovaColetaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchColetas}
      />

      {/* Modal Detalhes */}
      {detalhesColeta && (
        <ColetaDetalhes
          coleta={detalhesColeta}
          open={!!detalhesColeta}
          onOpenChange={(open) => { if (!open) setDetalhesColeta(null); }}
        />
      )}
    </div>
  );
}
