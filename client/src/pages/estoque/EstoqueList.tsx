import { useEffect, useState } from "react";
import { Warehouse, Plus, Search, Package, Weight, QrCode, ArrowDownToLine } from "lucide-react";
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
import { NovoEstoqueDialog } from "./NovoEstoqueDialog";

interface EstoqueItem {
  id: string;
  coletaNumero: number;
  fornecedor: string;
  descricaoProduto: string;
  tipoMaterial: string;
  cor: string;
  medida: string;
  acabamento: string;
  kilo: number;
  unidade: number;
  pesoMedioPct: number;
  unidadeMedida: string;
  qtdeReservadaPacote: number;
  galpao: string;
  status: string;
  statusMaterial: string;
  data: string;
}

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "secondary" | "danger" }> = {
  Pendente: { label: "Pendente", variant: "warning" },
  Disponivel: { label: "Disponível", variant: "success" },
  Reservado: { label: "Reservado", variant: "info" },
  Expedido: { label: "Expedido", variant: "secondary" },
  Esgotado: { label: "Esgotado", variant: "danger" },
};

export default function EstoqueList() {
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchEstoque = async () => {
    try {
      const res = await fetch("/api/estoque");
      const data = await res.json();
      setItens(data);
    } catch (err) {
      console.error("Erro ao buscar estoque:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstoque();
  }, []);

  const filtered = itens.filter((i) => {
    const matchSearch =
      !search ||
      i.descricaoProduto.toLowerCase().includes(search.toLowerCase()) ||
      i.tipoMaterial.toLowerCase().includes(search.toLowerCase()) ||
      i.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      String(i.coletaNumero).includes(search);
    const matchStatus = !filterStatus || i.status === filterStatus;
    const matchMaterial = !filterMaterial || i.tipoMaterial === filterMaterial;
    return matchSearch && matchStatus && matchMaterial;
  });

  const materiais = [...new Set(itens.map((i) => i.tipoMaterial))].sort();

  const stats = {
    totalItens: itens.length,
    pesoTotal: itens.reduce((acc, i) => acc + i.kilo, 0),
    disponiveis: itens.filter((i) => i.status === "Disponivel").length,
    reservados: itens.filter((i) => i.status === "Reservado").reduce((acc, i) => acc + i.qtdeReservadaPacote, 0),
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Produto pronto empacotado — entrada pós-produção e acabamento"
        icon={Warehouse}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4" />
              Scan Fardo
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <ArrowDownToLine className="h-4 w-4" />
              Entrada Manual
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Itens em Estoque" value={stats.totalItens} icon={Package} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Peso Total" value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`} icon={Weight} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Disponíveis" value={stats.disponiveis} icon={Warehouse} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Pacotes Reservados" value={stats.reservados} icon={Package} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl border shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por produto, material, fornecedor..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos status</option>
              <option value="Disponivel">Disponível</option>
              <option value="Reservado">Reservado</option>
              <option value="Pendente">Pendente</option>
              <option value="Expedido">Expedido</option>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)}>
              <option value="">Todos materiais</option>
              {materiais.map((m) => (
                <option key={m} value={m}>{m}</option>
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
              <TableHead>Coleta</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Medida</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Unidades</TableHead>
              <TableHead>Reservado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entrada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmpty colSpan={10} message="Carregando..." />
            ) : filtered.length === 0 ? (
              <TableEmpty colSpan={10} />
            ) : (
              filtered.map((item) => {
                const sc = statusConfig[item.status] || { label: item.status, variant: "secondary" as const };
                const disponivel = (item.unidade || 0) - item.qtdeReservadaPacote;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold">#{item.coletaNumero}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.descricaoProduto}</p>
                        <p className="text-xs text-muted-foreground">{item.fornecedor}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.tipoMaterial}</Badge>
                    </TableCell>
                    <TableCell>{item.cor || "—"}</TableCell>
                    <TableCell>{item.medida || "—"}</TableCell>
                    <TableCell className="font-medium">{item.kilo.toLocaleString("pt-BR")} kg</TableCell>
                    <TableCell>
                      {item.unidade > 0 ? (
                        <div className="text-xs">
                          <p className="font-semibold">{item.unidade} un</p>
                          <p className="text-muted-foreground">~{item.pesoMedioPct} kg/pct</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Por kilo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.qtdeReservadaPacote > 0 ? (
                        <div className="text-xs">
                          <p className="font-semibold text-amber-600">{item.qtdeReservadaPacote} pct</p>
                          <p className="text-muted-foreground">Disp: {disponivel}</p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} dot>{sc.label}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(item.data)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NovoEstoqueDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchEstoque}
      />
    </div>
  );
}
