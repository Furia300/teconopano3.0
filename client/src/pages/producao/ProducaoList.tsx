import { useCallback, useEffect, useMemo, useState } from "react";
import { Factory, Plus, Search, QrCode, Weight, Package, Ruler } from "lucide-react";
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
import { NovaProducaoDialog } from "./NovaProducaoDialog";

interface Producao {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  sala: string;
  tipoMaterial: string;
  cor: string;
  acabamento: string;
  medida: string;
  kilo: number;
  pesoMedio: number;
  qtdePacote: number;
  unidadeSaida: string;
  statusEstoque: string;
  operador: string;
  dataCriacao: string;
}

const SALAS = [
  "CORTE 01", "CORTE 02", "CORTE 03", "CORTE 04", "CORTE 05",
  "CORTE VLI", "FAIXA",
];

const salaSaidaMap: Record<string, string> = {
  "CORTE 01": "unidade",
  "CORTE 02": "unidade",
  "CORTE 03": "unidade",
  "CORTE 04": "unidade",
  "CORTE 05": "kilo",
  "CORTE VLI": "kilo",
  "FAIXA": "kilo",
};

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  em_estoque: { label: "No Estoque", variant: "success" },
  em_andamento: { label: "Em Andamento", variant: "info" },
};

function formatProducaoDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export default function ProducaoList() {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSala, setFilterSala] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProducoes = useCallback(async () => {
    try {
      const res = await fetch("/api/producoes");
      const data = await res.json();
      setProducoes(data);
    } catch (err) {
      console.error("Erro ao buscar produções:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducoes();
  }, [fetchProducoes]);

  const searchNorm = useMemo(() => search.trim().toLowerCase(), [search]);

  const countBySala = useMemo(() => {
    const m: Record<string, number> = {};
    for (let i = 0; i < producoes.length; i++) {
      const s = producoes[i].sala;
      m[s] = (m[s] || 0) + 1;
    }
    return m;
  }, [producoes]);

  const filtered = useMemo(() => {
    if (!searchNorm && !filterSala && !filterStatus) return producoes;
    return producoes.filter((p) => {
      const matchSearch =
        !searchNorm ||
        p.fornecedor.toLowerCase().includes(searchNorm) ||
        p.tipoMaterial.toLowerCase().includes(searchNorm) ||
        p.sala.toLowerCase().includes(searchNorm) ||
        String(p.coletaNumero).includes(searchNorm);
      const matchSala = !filterSala || p.sala === filterSala;
      const matchStatus = !filterStatus || p.statusEstoque === filterStatus;
      return matchSearch && matchSala && matchStatus;
    });
  }, [producoes, searchNorm, filterSala, filterStatus]);

  const stats = useMemo(() => {
    let pesoTotal = 0;
    let porUnidade = 0;
    let porKilo = 0;
    for (let i = 0; i < producoes.length; i++) {
      const p = producoes[i];
      pesoTotal += p.kilo;
      if (p.unidadeSaida === "unidade") porUnidade++;
      else if (p.unidadeSaida === "kilo") porKilo++;
    }
    return {
      total: producoes.length,
      pesoTotal,
      porUnidade,
      porKilo,
    };
  }, [producoes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produção"
        description="Salas de corte e processamento de material"
        icon={Factory}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Peso Total", value: `${stats.pesoTotal.toLocaleString("pt-BR")}kg`, color: "#00C64C" },
          { label: "Por Unidade", value: stats.porUnidade, color: "#FDC24E" },
          { label: "Por Kilo", value: stats.porKilo, color: "#ed1b24" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Registrar Produção
            </Button>
          </div>
        }
      />

      {/* Salas - visual cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {SALAS.map((sala) => {
          const count = countBySala[sala] ?? 0;
          const isKilo = salaSaidaMap[sala] === "kilo";
          const isActive = filterSala === sala;
          return (
            <button
              key={sala}
              onClick={() => setFilterSala(isActive ? "" : sala)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card hover:border-primary/50"
              }`}
            >
              <p className="text-xs font-medium opacity-70">{sala}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
              <Badge variant={isKilo ? "info" : "success"} className="mt-1 text-[10px]">
                {isKilo ? "Kilo" : "Unidade"}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Produções" value={stats.total} icon={Factory} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Peso Total" value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`} icon={Weight} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Saída Unidade" value={stats.porUnidade} icon={Package} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Saída Kilo" value={stats.porKilo} icon={Ruler} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      {/* Filtros */}
      <div className="fips-surface-panel p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por fornecedor, material, sala..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="em_estoque">No Estoque</option>
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
              <TableHead>Sala</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Medida</TableHead>
              <TableHead>Acabamento</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Pacotes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmpty colSpan={11} message="Carregando..." />
            ) : filtered.length === 0 ? (
              <TableEmpty colSpan={11} />
            ) : (
              filtered.map((prod) => {
                const sc = statusConfig[prod.statusEstoque] || { label: prod.statusEstoque, variant: "warning" as const };
                return (
                  <TableRow key={prod.id}>
                    <TableCell className="font-bold">#{prod.coletaNumero}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prod.sala}</Badge>
                    </TableCell>
                    <TableCell>{prod.tipoMaterial}</TableCell>
                    <TableCell>{prod.cor || "—"}</TableCell>
                    <TableCell>{prod.medida || "—"}</TableCell>
                    <TableCell>{prod.acabamento || "—"}</TableCell>
                    <TableCell className="font-medium">{prod.kilo.toLocaleString("pt-BR")} kg</TableCell>
                    <TableCell>
                      <Badge variant={prod.unidadeSaida === "kilo" ? "info" : "success"} className="text-[10px]">
                        {prod.unidadeSaida === "kilo" ? "Kilo" : "Unidade"}
                      </Badge>
                    </TableCell>
                    <TableCell>{prod.qtdePacote || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} dot>{sc.label}</Badge>
                    </TableCell>
                    <TableCell>{formatProducaoDate(prod.dataCriacao)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NovaProducaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchProducoes}
        salas={SALAS}
        salaSaidaMap={salaSaidaMap}
      />
    </div>
  );
}
