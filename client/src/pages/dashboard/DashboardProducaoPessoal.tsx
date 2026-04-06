import {
  Factory, Clock, CheckCircle2, Weight, Package,
} from "lucide-react";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: any;
  userName: string;
}

export default function DashboardProducaoPessoal({ data, userName }: Props) {
  const minhas = data.producoes.filter((p: any) => p.operador === userName);
  const pendentes = minhas.filter((p: any) => p.statusEstoque === "pendente");
  const finalizadas = minhas.filter((p: any) => p.statusEstoque === "em_estoque");
  const totalKg = minhas.reduce((a: number, p: any) => a + (Number(p.kilo) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-violet-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Minha Produção</h1>
        <p className="text-white/70 text-sm mt-1">Olá, {userName} — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Total Registros" value={minhas.length} icon={Factory} color="text-violet-500" bg="bg-violet-500/10" />
        <StatsCard label="Pendentes" value={pendentes.length} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Em Estoque" value={finalizadas.length} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Total Kg" value={`${totalKg.toLocaleString("pt-BR")}kg`} icon={Weight} color="text-blue-500" bg="bg-blue-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Factory className="h-5 w-5 text-violet-500" />
          Minhas Produções
        </h3>
        {minhas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma produção registrada para você</p>
        ) : (
          <div className="space-y-2">
            {minhas.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{p.tipoMaterial} {p.cor} — {p.sala}</p>
                  <p className="text-xs text-muted-foreground">
                    Coleta #{p.coletaNumero} • {p.fornecedor} • {p.kilo}kg
                    {p.acabamento ? ` • ${p.acabamento}` : ""}
                    {p.medida ? ` • ${p.medida}` : ""}
                  </p>
                </div>
                <Badge variant={p.statusEstoque === "em_estoque" ? "default" : "warning"}>
                  {p.statusEstoque === "em_estoque" ? "Em Estoque" : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
