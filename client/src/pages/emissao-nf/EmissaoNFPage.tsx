import { useEffect, useState } from "react";
import { FileText, Check, Clock, CheckCircle2, Printer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty,
} from "@/components/ui/table";

interface Expedicao {
  id: string;
  nomeFantasia: string;
  cnpj: string;
  descricaoProduto: string;
  tipoMaterial: string;
  kilo: number;
  unidade: number;
  statusFinanceiro: string;
  statusNota: string;
  statusEntrega: string;
  rota: string;
  prioridade: string;
  notaFiscal: string;
  createdAt: string;
}

export default function EmissaoNFPage() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/expedicoes");
      setExpedicoes(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const pendentes = expedicoes.filter((e) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao");
  const emitidas = expedicoes.filter((e) => e.statusNota === "emitida");

  const filtered = pendentes.filter((e) =>
    !search || e.nomeFantasia.toLowerCase().includes(search.toLowerCase()) || e.descricaoProduto.toLowerCase().includes(search.toLowerCase())
  );

  const handleEmitir = async (id: string) => {
    await fetch(`/api/expedicoes/${id}/emitir-nf`, { method: "PUT" });
    toast.success("Nota fiscal emitida!");
    fetchData();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <PageHeader title="Emissão de Notas Fiscais" description="Notas pendentes de emissão — aprovadas pelo financeiro" icon={FileText} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Pendentes Emissão" value={pendentes.length} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="NFs Emitidas" value={emitidas.length} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Peso Total Pendente" value={`${pendentes.reduce((a, e) => a + e.kilo, 0).toLocaleString("pt-BR")} kg`} icon={FileText} color="text-blue-500" bg="bg-blue-500/10" />
      </div>

      {pendentes.length === 0 ? (
        <div className="bg-card rounded-xl border shadow p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Nenhuma NF pendente</h3>
          <p className="text-muted-foreground text-sm mt-1">Todas as notas fiscais foram emitidas</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border shadow p-4">
            <Input placeholder="Buscar por cliente ou produto..." icon={<FileText />} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="bg-card rounded-xl border shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtde/Peso</TableHead>
                  <TableHead>Financeiro</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Data Pedido</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((exp) => (
                  <TableRow key={exp.id} className={exp.prioridade === "Urgente" ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <p className="font-medium">{exp.nomeFantasia}</p>
                      <p className="text-xs text-muted-foreground">{exp.cnpj}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{exp.descricaoProduto}</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">{exp.tipoMaterial}</Badge>
                    </TableCell>
                    <TableCell>
                      {exp.unidade > 0 && <p className="text-xs">{exp.unidade} un</p>}
                      <p className="font-semibold">{exp.kilo} kg</p>
                    </TableCell>
                    <TableCell><Badge variant="success" dot>Aprovado</Badge></TableCell>
                    <TableCell>
                      <Badge variant={exp.prioridade === "Urgente" ? "danger" : "secondary"}>{exp.prioridade}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(exp.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleEmitir(exp.id)}>
                        <Printer className="h-3 w-3" />
                        Emitir NF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
