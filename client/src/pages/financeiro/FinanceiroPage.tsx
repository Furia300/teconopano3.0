import { useEffect, useState } from "react";
import { DollarSign, Check, X, Eye, Clock, CheckCircle2, AlertCircle } from "lucide-react";
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
  statusEntrega: string;
  rota: string;
  prioridade: string;
  createdAt: string;
  observacaoEscritorio: string;
}

export default function FinanceiroPage() {
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

  const pendentes = expedicoes.filter((e) => e.statusFinanceiro === "pendente_aprovacao");
  const aprovados = expedicoes.filter((e) => e.statusFinanceiro === "aprovado");

  const filtered = pendentes.filter((e) =>
    !search || e.nomeFantasia.toLowerCase().includes(search.toLowerCase()) || e.descricaoProduto.toLowerCase().includes(search.toLowerCase())
  );

  const handleAprovar = async (id: string) => {
    await fetch(`/api/expedicoes/${id}/aprovar-financeiro`, { method: "PUT" });
    toast.success("Pagamento aprovado!");
    fetchData();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" description="Aprovação de pagamentos para liberação de notas fiscais" icon={DollarSign} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Pendentes Aprovação" value={pendentes.length} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Aprovados" value={aprovados.length} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Peso Total Pendente" value={`${pendentes.reduce((a, e) => a + e.kilo, 0).toLocaleString("pt-BR")} kg`} icon={DollarSign} color="text-blue-500" bg="bg-blue-500/10" />
      </div>

      {pendentes.length === 0 ? (
        <div className="fips-surface-panel p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Nenhuma pendência financeira</h3>
          <p className="text-muted-foreground text-sm mt-1">Todos os pagamentos estão aprovados</p>
        </div>
      ) : (
        <>
          <div className="fips-surface-panel p-4">
            <Input placeholder="Buscar por cliente ou produto..." icon={<DollarSign />} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="fips-surface-panel">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtde/Peso</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Obs.</TableHead>
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
                    <TableCell>
                      <Badge variant={exp.prioridade === "Urgente" ? "danger" : exp.prioridade === "Baixa" ? "secondary" : "info"}>
                        {exp.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>{exp.rota || "—"}</TableCell>
                    <TableCell>{formatDate(exp.createdAt)}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">{exp.observacaoEscritorio || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="success" size="sm" onClick={() => handleAprovar(exp.id)}>
                        <Check className="h-3 w-3" />
                        Aprovar
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
