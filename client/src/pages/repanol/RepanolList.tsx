import { useEffect, useState } from "react";
import { Droplets, Plus, Search, ArrowRight, ArrowLeft, Weight, AlertTriangle } from "lucide-react";
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
import { NovoRepanolDialog } from "./NovoRepanolDialog";
import { RepanolRetornoDialog } from "./RepanolRetornoDialog";

interface Repanol {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  empresaFornecedor: string;
  tipoMaterial: string;
  dataEnvio: string | null;
  dataRetorno: string | null;
  pesoManchadoEnvio: number;
  pesoMolhadoEnvio: number;
  pesoTingidoEnvio: number;
  pesoManchadoRetorno: number;
  pesoMolhadoRetorno: number;
  pesoTingidoRetorno: number;
  repanolResiduo: number;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "secondary" }> = {
  pendente: { label: "Pendente Envio", variant: "warning" },
  enviado: { label: "Enviado", variant: "info" },
  retornado: { label: "Retornado", variant: "success" },
};

export default function RepanolList() {
  const [repanois, setRepanois] = useState<Repanol[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [retornoItem, setRetornoItem] = useState<Repanol | null>(null);

  const fetchRepanois = async () => {
    try {
      const res = await fetch("/api/repanol");
      const data = await res.json();
      setRepanois(data);
    } catch (err) {
      console.error("Erro ao buscar repanol:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepanois();
  }, []);

  const filtered = repanois.filter((r) => {
    const matchSearch =
      !search ||
      r.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      r.tipoMaterial.toLowerCase().includes(search.toLowerCase()) ||
      r.empresaFornecedor.toLowerCase().includes(search.toLowerCase()) ||
      String(r.coletaNumero).includes(search);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalEnvio = (r: Repanol) => r.pesoManchadoEnvio + r.pesoMolhadoEnvio + r.pesoTingidoEnvio;
  const totalRetorno = (r: Repanol) => r.pesoManchadoRetorno + r.pesoMolhadoRetorno + r.pesoTingidoRetorno;

  const stats = {
    total: repanois.length,
    enviados: repanois.filter((r) => r.status === "enviado").length,
    pesoEnviado: repanois.filter((r) => r.status === "enviado").reduce((acc, r) => acc + totalEnvio(r), 0),
    residuoTotal: repanois.reduce((acc, r) => acc + r.repanolResiduo, 0),
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repanol"
        description="Envio e retorno de material para tratamento externo (tingimento/lavagem)"
        icon={Droplets}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Envio
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Registros" value={stats.total} icon={Droplets} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Aguardando Retorno" value={stats.enviados} icon={ArrowRight} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Peso em Trânsito" value={`${stats.pesoEnviado.toLocaleString("pt-BR")} kg`} icon={Weight} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Resíduo Total" value={`${stats.residuoTotal.toLocaleString("pt-BR")} kg`} icon={AlertTriangle} color="text-red-500" bg="bg-red-500/10" />
      </div>

      {/* Filtros */}
      <div className="fips-surface-panel p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por fornecedor, material, empresa..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendente Envio</option>
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
              <TableHead>Fornecedor Origem</TableHead>
              <TableHead>Empresa Repanol</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Envio</TableHead>
              <TableHead>Retorno</TableHead>
              <TableHead>Resíduo</TableHead>
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
              filtered.map((rep) => {
                const sc = statusConfig[rep.status] || { label: rep.status, variant: "secondary" as const };
                const envio = totalEnvio(rep);
                const retorno = totalRetorno(rep);
                const diff = envio - retorno;
                return (
                  <TableRow key={rep.id}>
                    <TableCell className="font-bold">#{rep.coletaNumero}</TableCell>
                    <TableCell>{rep.fornecedor}</TableCell>
                    <TableCell>{rep.empresaFornecedor || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rep.tipoMaterial}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div>Manchado: <span className="font-medium">{rep.pesoManchadoEnvio} kg</span></div>
                        <div>Molhado: <span className="font-medium">{rep.pesoMolhadoEnvio} kg</span></div>
                        <div>Tingido: <span className="font-medium">{rep.pesoTingidoEnvio} kg</span></div>
                        <div className="font-semibold border-t pt-0.5 mt-0.5">Total: {envio} kg</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rep.status === "retornado" ? (
                        <div className="text-xs space-y-0.5">
                          <div>Manchado: <span className="font-medium">{rep.pesoManchadoRetorno} kg</span></div>
                          <div>Molhado: <span className="font-medium">{rep.pesoMolhadoRetorno} kg</span></div>
                          <div>Tingido: <span className="font-medium">{rep.pesoTingidoRetorno} kg</span></div>
                          <div className="font-semibold border-t pt-0.5 mt-0.5">Total: {retorno} kg</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rep.repanolResiduo > 0 ? (
                        <span className="text-destructive font-medium">{rep.repanolResiduo} kg</span>
                      ) : rep.status === "retornado" && diff > 0 ? (
                        <span className="text-destructive font-medium">{diff} kg</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} dot>{sc.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {rep.status === "enviado" && (
                        <Button variant="outline" size="sm" onClick={() => setRetornoItem(rep)}>
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

      <NovoRepanolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchRepanois}
      />

      {retornoItem && (
        <RepanolRetornoDialog
          repanol={retornoItem}
          open={!!retornoItem}
          onOpenChange={(open) => { if (!open) setRetornoItem(null); }}
          onSuccess={fetchRepanois}
        />
      )}
    </div>
  );
}
