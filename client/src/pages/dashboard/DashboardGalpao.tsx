import {
  LuTruck, LuFactory, LuWarehouse, LuClipboardList, LuDroplets, LuScissors,
  LuTrendingUp, LuArrowRight, LuCircleAlert, LuCircleCheck, LuTable2,
} from "react-icons/lu";
const Truck = LuTruck, Factory = LuFactory, Warehouse = LuWarehouse, ClipboardList = LuClipboardList, Droplets = LuDroplets, Scissors = LuScissors, TrendingUp = LuTrendingUp, ArrowRight = LuArrowRight, AlertCircle = LuCircleAlert, CheckCircle2 = LuCircleCheck, Table2 = LuTable2;
import { Link } from "wouter";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/composites/PageHero";

interface Props {
  data: any;
}

export default function DashboardGalpao({ data }: Props) {
  const coletasPendentes = data.coletas.filter((c: any) => c.status === "pendente" || c.status === "agendado").length;
  const emSeparacao = data.coletas.filter((c: any) => c.status === "em_separacao").length;
  const emProducao = data.coletas.filter((c: any) => c.status === "em_producao").length;
  const pesoEstoque = data.estoque.reduce((a: number, e: any) => a + (e.kilo || 0), 0);
  const repanolEnviados = data.repanol.filter((r: any) => r.status === "enviado").length;
  const costureiraEnviados = data.costureira.filter((c: any) => c.status === "enviado").length;

  const pipeline = [
    { label: "Coleta", count: data.coletas.filter((c: any) => c.status !== "finalizado" && c.status !== "cancelado").length, icon: Truck, color: "text-blue-500" },
    { label: "Separação", count: data.separacoes.length, icon: ClipboardList, color: "text-indigo-500" },
    { label: "Produção", count: data.producoes.filter((p: any) => p.statusEstoque === "pendente").length, icon: Factory, color: "text-violet-500" },
    { label: "Estoque", count: data.estoque.filter((e: any) => e.status === "Disponivel").length, icon: Warehouse, color: "text-emerald-500" },
  ];

  const pendencias = [
    { show: repanolEnviados > 0, icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/5 border-blue-500/10", label: "Repanol em Trânsito", sub: `${repanolEnviados} lote(s) aguardando retorno`, count: repanolEnviados },
    { show: costureiraEnviados > 0, icon: Scissors, color: "text-pink-500", bg: "bg-pink-500/5 border-pink-500/10", label: "Costureira em Trânsito", sub: `${costureiraEnviados} envio(s) aguardando retorno`, count: costureiraEnviados },
  ].filter(p => p.show);

  return (
    <div className="space-y-6">
      <PageHero>
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
              <Warehouse className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Dashboard Galpão</h2>
              <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Operações do galpão — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm" className="border-white/15 bg-white/8 text-white hover:bg-white/15">
              <Link href="/coleta"><Table2 className="h-3.5 w-3.5" /> Abrir tabela de coletas</Link>
            </Button>
          </div>
        </div>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard label="Coletas Pendentes" value={coletasPendentes} icon={Truck} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Em Separação" value={emSeparacao} icon={ClipboardList} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatsCard label="Em Produção" value={emProducao} icon={Factory} color="text-violet-500" bg="bg-violet-500/10" />
        <StatsCard label="Estoque (kg)" value={`${pesoEstoque.toLocaleString("pt-BR")}kg`} icon={Warehouse} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Repanol Enviado" value={repanolEnviados} icon={Droplets} color="text-cyan-500" bg="bg-cyan-500/10" />
        <StatsCard label="Costureira Env." value={costureiraEnviados} icon={Scissors} color="text-pink-500" bg="bg-pink-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          Pipeline Operacional
        </h3>
        <div className="flex items-center gap-2">
          {pipeline.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div className="flex-1 bg-muted/50 rounded-xl p-4 text-center hover:bg-muted/80 transition-colors">
                <step.icon className={`h-6 w-6 mx-auto mb-1 ${step.color}`} />
                <p className="text-2xl font-bold">{step.count}</p>
                <p className="text-[11px] text-muted-foreground">{step.label}</p>
              </div>
              {i < pipeline.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {pendencias.length > 0 && (
        <div className="bg-card rounded-xl border shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pendências do Galpão
          </h3>
          <div className="space-y-3">
            {pendencias.map((p) => (
              <div key={p.label} className={`flex items-center justify-between p-3 rounded-lg border ${p.bg}`}>
                <div className="flex items-center gap-3">
                  <p.icon className={`h-5 w-5 ${p.color}`} />
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.sub}</p>
                  </div>
                </div>
                <Badge variant="default">{p.count}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendencias.length === 0 && (
        <div className="bg-card rounded-xl border shadow p-6 text-center py-10">
          <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
          <p className="text-sm font-medium">Galpão em dia!</p>
          <p className="text-xs text-muted-foreground">Nenhuma pendência operacional</p>
        </div>
      )}
    </div>
  );
}
