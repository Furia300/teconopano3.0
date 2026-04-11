import { useEffect, useState } from "react";
import { Scissors, Plus, Search, ArrowRight, ArrowLeft, Weight, PenTool, Truck } from "lucide-react";
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
import { NovoEnvioDialog } from "./NovoEnvioDialog";
import { RetornoCostureiraDialog } from "./RetornoCostureiraDialog";

interface CostureiraEnvio {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  costureira: string;
  tipoMaterial: string;
  tipoMedida: string;
  status: string;
  dataEnvio: string | null;
  dataRetorno: string | null;
  motoristaEnvio: string;
  motoristaRetorno: string;
  qtdsSaidaKg: number;
  qtdsRetornoKg: number;
  qtdsPacotesRetorno: number;
  totalDifKg: number;
  residuos: number;
  assCostEntrega: string | null;
  assMotEntrega: string | null;
  assCostDevolucao: string | null;
  assMotDevolucao: string | null;
  observacao: string;
}

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "secondary" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  enviado: { label: "Enviado", variant: "info" },
  retornado: { label: "Retornado", variant: "success" },
};

export default function CostureiraList() {
  const [envios, setEnvios] = useState<CostureiraEnvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [retornoItem, setRetornoItem] = useState<CostureiraEnvio | null>(null);

  const fetchEnvios = async () => {
    try {
      const res = await fetch("/api/costureira");
      const data = await res.json();
      setEnvios(data);
    } catch (err) {
      console.error("Erro ao buscar envios costureira:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  const filtered = envios.filter((e) => {
    const matchSearch =
      !search ||
      e.costureira.toLowerCase().includes(search.toLowerCase()) ||
      e.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      e.tipoMaterial.toLowerCase().includes(search.toLowerCase()) ||
      String(e.coletaNumero).includes(search);
    const matchStatus = !filterStatus || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: envios.length,
    enviados: envios.filter((e) => e.status === "enviado").length,
    pesoEmTransito: envios.filter((e) => e.status === "enviado").reduce((acc, e) => acc + e.qtdsSaidaKg, 0),
    residuoTotal: envios.reduce((acc, e) => acc + e.residuos, 0),
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const hasAssinatura = (url: string | null) => !!url;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Costureira"
        description="Envio e retorno de material para costura (CLT interna + terceirizadas)"
        icon={Scissors}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Envio
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Envios" value={stats.total} icon={Scissors} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Aguardando Retorno" value={stats.enviados} icon={ArrowRight} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Peso em Trânsito" value={`${stats.pesoEmTransito.toLocaleString("pt-BR")} kg`} icon={Weight} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Resíduo Total" value={`${stats.residuoTotal.toLocaleString("pt-BR")} kg`} icon={Weight} color="text-red-500" bg="bg-red-500/10" />
      </div>

      {/* Filtros */}
      <div className="fips-surface-panel p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por costureira, fornecedor, material..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="enviado">Enviado</option>
              <option value="retornado">Retornado</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="fips-surface-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coleta</TableHead>
              <TableHead>Costureira</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Envio</TableHead>
              <TableHead>Retorno</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>Assinaturas</TableHead>
              <TableHead>Dif/Resíduo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmpty colSpan={10} message="Carregando..." />
            ) : filtered.length === 0 ? (
              <TableEmpty colSpan={10} />
            ) : (
              filtered.map((envio) => {
                const sc = statusConfig[envio.status] || { label: envio.status, variant: "secondary" as const };
                return (
                  <TableRow key={envio.id}>
                    <TableCell className="font-bold">#{envio.coletaNumero}</TableCell>
                    <TableCell>
                      <p className="font-medium">{envio.costureira}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{envio.tipoMaterial}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p>{formatDate(envio.dataEnvio)}</p>
                        <p className="font-semibold">{envio.qtdsSaidaKg} kg</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {envio.status === "retornado" ? (
                        <div className="text-xs">
                          <p>{formatDate(envio.dataRetorno)}</p>
                          <p className="font-semibold">{envio.qtdsRetornoKg} kg</p>
                          <p className="text-muted-foreground">{envio.qtdsPacotesRetorno} pacotes</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        {envio.motoristaEnvio && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3 text-muted-foreground" />
                            <span>Ida: {envio.motoristaEnvio}</span>
                          </div>
                        )}
                        {envio.motoristaRetorno && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3 text-muted-foreground" />
                            <span>Volta: {envio.motoristaRetorno}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <div title="Costureira Entrega" className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${hasAssinatura(envio.assCostEntrega) ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          CE
                        </div>
                        <div title="Motorista Entrega" className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${hasAssinatura(envio.assMotEntrega) ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          ME
                        </div>
                        <div title="Costureira Devolução" className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${hasAssinatura(envio.assCostDevolucao) ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          CD
                        </div>
                        <div title="Motorista Devolução" className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${hasAssinatura(envio.assMotDevolucao) ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          MD
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {envio.totalDifKg !== 0 || envio.residuos > 0 ? (
                        <div className="text-xs">
                          {envio.totalDifKg !== 0 && (
                            <p className="text-destructive font-medium">Dif: {envio.totalDifKg} kg</p>
                          )}
                          {envio.residuos > 0 && (
                            <p className="text-muted-foreground">Res: {envio.residuos} kg</p>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} dot>{sc.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {envio.status === "enviado" && (
                        <Button variant="outline" size="sm" onClick={() => setRetornoItem(envio)}>
                          <ArrowLeft className="h-3 w-3" />
                          Retorno
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NovoEnvioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchEnvios}
      />

      {retornoItem && (
        <RetornoCostureiraDialog
          envio={retornoItem}
          open={!!retornoItem}
          onOpenChange={(open) => { if (!open) setRetornoItem(null); }}
          onSuccess={fetchEnvios}
        />
      )}
    </div>
  );
}
