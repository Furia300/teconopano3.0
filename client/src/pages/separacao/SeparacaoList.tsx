import { useEffect, useState } from "react";
import { ClipboardList, Plus, Search, QrCode, Factory, Droplets, Scissors, Gift, Trash2 } from "lucide-react";
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
import { NovaSeparacaoDialog } from "./NovaSeparacaoDialog";

interface Separacao {
  id: string;
  coletaId: string;
  coletaNumero: number;
  fornecedor: string;
  tipoMaterial: string;
  cor: string;
  peso: number;
  destino: string;
  colaborador: string;
  data: string;
}

const destinoConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "info" | "danger" | "secondary"; icon: typeof Factory }> = {
  producao: { label: "Produção", variant: "info", icon: Factory },
  repanol: { label: "Repanol", variant: "warning", icon: Droplets },
  costureira: { label: "Costureira", variant: "default", icon: Scissors },
  doacao: { label: "Doação", variant: "success", icon: Gift },
  descarte: { label: "Descarte", variant: "danger", icon: Trash2 },
};

const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

export default function SeparacaoList() {
  const [separacoes, setSeparacoes] = useState<Separacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDestino, setFilterDestino] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchSeparacoes = async () => {
    try {
      const res = await fetch("/api/separacoes");
      const data = await res.json();
      setSeparacoes(data);
    } catch (err) {
      console.error("Erro ao buscar separações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeparacoes();
  }, []);

  const filtered = separacoes.filter((s) => {
    const matchSearch =
      !search ||
      s.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      s.tipoMaterial.toLowerCase().includes(search.toLowerCase()) ||
      String(s.coletaNumero).includes(search);
    const matchDestino = !filterDestino || s.destino === filterDestino;
    const matchMaterial = !filterMaterial || s.tipoMaterial === filterMaterial;
    return matchSearch && matchDestino && matchMaterial;
  });

  const stats = {
    total: separacoes.length,
    pesoTotal: separacoes.reduce((acc, s) => acc + s.peso, 0),
    producao: separacoes.filter((s) => s.destino === "producao").length,
    repanol: separacoes.filter((s) => s.destino === "repanol").length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Separação"
        description="Triagem e classificação do material recebido"
        icon={ClipboardList}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4" />
              Ler QR Code
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova Separação
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Separações" value={stats.total} icon={ClipboardList} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Peso Total" value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`} icon={ClipboardList} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Para Produção" value={stats.producao} icon={Factory} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Para Repanol" value={stats.repanol} icon={Droplets} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl border shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por fornecedor, material ou nº coleta..."
              icon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={filterDestino} onChange={(e) => setFilterDestino(e.target.value)}>
              <option value="">Todos destinos</option>
              <option value="producao">Produção</option>
              <option value="repanol">Repanol</option>
              <option value="costureira">Costureira</option>
              <option value="doacao">Doação</option>
              <option value="descarte">Descarte</option>
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)}>
              <option value="">Todos materiais</option>
              {TIPOS_MATERIAL.map((m) => (
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
              <TableHead>Fornecedor</TableHead>
              <TableHead>Tipo Material</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableEmpty colSpan={8} message="Carregando..." />
            ) : filtered.length === 0 ? (
              <TableEmpty colSpan={8} />
            ) : (
              filtered.map((sep) => {
                const dc = destinoConfig[sep.destino] || { label: sep.destino, variant: "secondary" as const };
                return (
                  <TableRow key={sep.id}>
                    <TableCell className="font-bold">#{sep.coletaNumero}</TableCell>
                    <TableCell>{sep.fornecedor}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sep.tipoMaterial}</Badge>
                    </TableCell>
                    <TableCell>{sep.cor}</TableCell>
                    <TableCell className="font-medium">{sep.peso.toLocaleString("pt-BR")} kg</TableCell>
                    <TableCell>
                      <Badge variant={dc.variant} dot>{dc.label}</Badge>
                    </TableCell>
                    <TableCell>{sep.colaborador}</TableCell>
                    <TableCell>{formatDate(sep.data)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NovaSeparacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchSeparacoes}
        tiposMaterial={TIPOS_MATERIAL}
      />
    </div>
  );
}
