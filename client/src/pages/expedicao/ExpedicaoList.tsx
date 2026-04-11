import { useEffect, useState } from "react";
import { Package, Plus, Search, DollarSign, FileText, Truck, Eye } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsListUnderline, TabsTriggerUnderline, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { NovaExpedicaoDialog } from "./NovaExpedicaoDialog";
import { ExpedicaoDetalhes } from "./ExpedicaoDetalhes";

interface Expedicao {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  contato: string;
  descricaoProduto: string;
  tipoMaterial: string;
  cor: string;
  medida: string;
  kilo: number;
  kiloSolicitada: number;
  unidade: number;
  qtdePedido: number;
  unidadeMedida: string;
  statusPedido: string;
  statusEntrega: string;
  statusFinanceiro: string;
  statusNota: string;
  galpao: string;
  rota: string;
  prioridade: string;
  notaFiscal: string;
  observacaoEscritorio: string;
  observacaoGalpao: string;
  createdAt: string;
}

const entregaConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "secondary" | "danger" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  reservado: { label: "Reservado", variant: "info" },
  separado: { label: "Separado", variant: "secondary" },
  aguardando_financeiro: { label: "Aguard. Financeiro", variant: "warning" },
  aguardando_nf: { label: "Aguard. NF", variant: "warning" },
  pronto_entrega: { label: "Pronto Entrega", variant: "info" },
  em_rota: { label: "Em Rota", variant: "info" },
  entregue: { label: "Entregue", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

const financeiroConfig: Record<string, { label: string; variant: "warning" | "success" | "danger" }> = {
  pendente_aprovacao: { label: "Pend. Aprovação", variant: "warning" },
  aprovado: { label: "Aprovado", variant: "success" },
  rejeitado: { label: "Rejeitado", variant: "danger" },
};

const notaConfig: Record<string, { label: string; variant: "warning" | "success" | "danger" }> = {
  pendente_emissao: { label: "Pend. Emissão", variant: "warning" },
  emitida: { label: "Emitida", variant: "success" },
  cancelada: { label: "Cancelada", variant: "danger" },
};

export default function ExpedicaoList() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEntrega, setFilterEntrega] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesItem, setDetalhesItem] = useState<Expedicao | null>(null);
  const [tab, setTab] = useState("todos");

  const fetchExpedicoes = async () => {
    try {
      const res = await fetch("/api/expedicoes");
      const data = await res.json();
      setExpedicoes(data);
    } catch (err) {
      console.error("Erro ao buscar expedições:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpedicoes();
  }, []);

  const filtered = expedicoes.filter((e) => {
    const matchSearch =
      !search ||
      e.nomeFantasia.toLowerCase().includes(search.toLowerCase()) ||
      e.descricaoProduto.toLowerCase().includes(search.toLowerCase()) ||
      e.tipoMaterial.toLowerCase().includes(search.toLowerCase());
    const matchEntrega = !filterEntrega || e.statusEntrega === filterEntrega;

    // Tab filter
    if (tab === "financeiro") return matchSearch && e.statusFinanceiro === "pendente_aprovacao";
    if (tab === "nf") return matchSearch && e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao";
    if (tab === "entrega") return matchSearch && e.statusNota === "emitida" && e.statusEntrega !== "entregue";

    return matchSearch && matchEntrega;
  });

  const stats = {
    total: expedicoes.length,
    pendFinanceiro: expedicoes.filter((e) => e.statusFinanceiro === "pendente_aprovacao").length,
    pendNF: expedicoes.filter((e) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao").length,
    prontoEntrega: expedicoes.filter((e) => e.statusNota === "emitida" && e.statusEntrega !== "entregue").length,
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expedição"
        description="Pedidos dos clientes — do estoque até a entrega"
        icon={Package}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Expedição
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Expedições" value={stats.total} icon={Package} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard
          label="Pend. Financeiro"
          value={stats.pendFinanceiro}
          icon={DollarSign}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatsCard
          label="Pend. Emissão NF"
          value={stats.pendNF}
          icon={FileText}
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
        <StatsCard
          label="Pronto p/ Entrega"
          value={stats.prontoEntrega}
          icon={Truck}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* Tabs da cadeia de aprovação */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsListUnderline>
          <TabsTriggerUnderline value="todos">
            Todos ({expedicoes.length})
          </TabsTriggerUnderline>
          <TabsTriggerUnderline value="financeiro">
            Financeiro ({stats.pendFinanceiro})
          </TabsTriggerUnderline>
          <TabsTriggerUnderline value="nf">
            Emissão NF ({stats.pendNF})
          </TabsTriggerUnderline>
          <TabsTriggerUnderline value="entrega">
            Entrega ({stats.prontoEntrega})
          </TabsTriggerUnderline>
        </TabsListUnderline>
      </Tabs>

      {/* Filtros */}
      <div className="fips-surface-panel p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por cliente, produto, material..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {tab === "todos" && (
            <div className="w-full sm:w-52">
              <Select value={filterEntrega} onChange={(e) => setFilterEntrega(e.target.value)}>
                <option value="">Todos status entrega</option>
                <option value="pendente">Pendente</option>
                <option value="aguardando_financeiro">Aguard. Financeiro</option>
                <option value="aguardando_nf">Aguard. NF</option>
                <option value="pronto_entrega">Pronto Entrega</option>
                <option value="em_rota">Em Rota</option>
                <option value="entregue">Entregue</option>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="fips-surface-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Qtde/Peso</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Financeiro</TableHead>
              <TableHead>Nota Fiscal</TableHead>
              <TableHead>Rota</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmpty colSpan={9} message="Carregando..." />
            ) : filtered.length === 0 ? (
              <TableEmpty colSpan={9} />
            ) : (
              filtered.map((exp) => {
                const ec = entregaConfig[exp.statusEntrega] || { label: exp.statusEntrega, variant: "secondary" as const };
                const fc = financeiroConfig[exp.statusFinanceiro] || { label: exp.statusFinanceiro, variant: "warning" as const };
                const nc = notaConfig[exp.statusNota] || { label: exp.statusNota, variant: "warning" as const };
                return (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{exp.nomeFantasia}</p>
                        <p className="text-xs text-muted-foreground">{exp.cnpj}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{exp.descricaoProduto}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{exp.tipoMaterial}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {exp.unidade > 0 && <p>{exp.unidade} un</p>}
                        <p className="font-semibold">{exp.kilo} kg</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ec.variant} dot>{ec.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={fc.variant} dot>{fc.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant={nc.variant} dot>{nc.label}</Badge>
                        {exp.notaFiscal && (
                          <p className="text-xs text-muted-foreground mt-0.5">{exp.notaFiscal}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {exp.rota ? (
                        <Badge variant="outline">{exp.rota}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{formatDate(exp.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="iconSm" onClick={() => setDetalhesItem(exp)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {tab === "financeiro" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={async () => {
                              await fetch(`/api/expedicoes/${exp.id}/aprovar-financeiro`, { method: "PUT" });
                              fetchExpedicoes();
                            }}
                          >
                            <DollarSign className="h-3 w-3" />
                            Aprovar
                          </Button>
                        )}
                        {tab === "nf" && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              await fetch(`/api/expedicoes/${exp.id}/emitir-nf`, { method: "PUT" });
                              fetchExpedicoes();
                            }}
                          >
                            <FileText className="h-3 w-3" />
                            Emitir NF
                          </Button>
                        )}
                        {tab === "entrega" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={async () => {
                              await fetch(`/api/expedicoes/${exp.id}/entregar`, { method: "PUT" });
                              fetchExpedicoes();
                            }}
                          >
                            <Truck className="h-3 w-3" />
                            Entregar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NovaExpedicaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchExpedicoes}
      />

      {detalhesItem && (
        <ExpedicaoDetalhes
          expedicao={detalhesItem}
          open={!!detalhesItem}
          onOpenChange={(open) => { if (!open) setDetalhesItem(null); }}
        />
      )}
    </div>
  );
}
