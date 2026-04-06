import { useEffect, useState } from "react";
import {
  Truck, Package, Factory, Warehouse, Scissors, Droplets,
  DollarSign, FileText, TrendingUp, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Weight, Users, ShoppingCart,
} from "lucide-react";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardGalpao from "./dashboard/DashboardGalpao";
import DashboardFinanceiro from "./dashboard/DashboardFinanceiro";
import DashboardExpedicao from "./dashboard/DashboardExpedicao";
import DashboardEmissaoNF from "./dashboard/DashboardEmissaoNF";
import DashboardRH from "./dashboard/DashboardRH";
import DashboardProducaoPessoal from "./dashboard/DashboardProducaoPessoal";
import DashboardSeparacaoPessoal from "./dashboard/DashboardSeparacaoPessoal";

interface DashboardData {
  coletas: any[];
  separacoes: any[];
  producoes: any[];
  repanol: any[];
  costureira: any[];
  estoque: any[];
  expedicoes: any[];
  colaboradores: any[];
  clientes: any[];
}

// Simula usuário logado — será substituído pelo useAuth real
function useCurrentUser() {
  const [user, setUser] = useState<{ nome: string; perfil: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u))
      .catch(() => setUser({ nome: "Admin", perfil: "administrador" }));
  }, []);
  return user;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = useCurrentUser();

  useEffect(() => {
    Promise.all([
      fetch("/api/coletas").then((r) => r.json()),
      fetch("/api/separacoes").then((r) => r.json()),
      fetch("/api/producoes").then((r) => r.json()),
      fetch("/api/repanol").then((r) => r.json()),
      fetch("/api/costureira").then((r) => r.json()),
      fetch("/api/estoque").then((r) => r.json()),
      fetch("/api/expedicoes").then((r) => r.json()),
      fetch("/api/colaboradores").then((r) => r.json()),
      fetch("/api/clientes").then((r) => r.json()),
    ]).then(([coletas, separacoes, producoes, repanol, costureira, estoque, expedicoes, colabRes, clientes]) => {
      setData({ coletas, separacoes, producoes, repanol, costureira, estoque, expedicoes, colaboradores: colabRes.colaboradores || colabRes, clientes });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const perfil = currentUser?.perfil || "administrador";
  const nome = currentUser?.nome || "Usuário";

  // Renderiza dashboard específico por perfil
  switch (perfil) {
    case "galpao":
      return <DashboardGalpao data={data} />;
    case "financeiro":
      return <DashboardFinanceiro data={data} />;
    case "expedicao":
      return <DashboardExpedicao data={data} />;
    case "emissao_nf":
      return <DashboardEmissaoNF data={data} />;
    case "rh":
      return <DashboardRH data={data} />;
    case "producao":
      return <DashboardProducaoPessoal data={data} userName={nome} />;
    case "separacao":
      return <DashboardSeparacaoPessoal data={data} userName={nome} />;
    default:
      // Super Admin — vê tudo (dashboard original)
      return <DashboardAdmin data={data} />;
  }
}

// ==================== Dashboard Admin (Super Admin / Visão Completa) ====================

function DashboardAdmin({ data }: { data: DashboardData }) {
  const pendFinanceiro = data.expedicoes.filter((e: any) => e.statusFinanceiro === "pendente_aprovacao").length;
  const pendNF = data.expedicoes.filter((e: any) => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao").length;
  const prontoEntrega = data.expedicoes.filter((e: any) => e.statusNota === "emitida" && e.statusEntrega !== "entregue").length;
  const coletasPendentes = data.coletas.filter((c: any) => c.status === "pendente" || c.status === "agendado").length;
  const emProducao = data.coletas.filter((c: any) => ["recebido", "em_separacao", "em_producao"].includes(c.status)).length;
  const repanolEnviados = data.repanol.filter((r: any) => r.status === "enviado").length;
  const costureiraEnviados = data.costureira.filter((c: any) => c.status === "enviado").length;
  const pesoEstoque = data.estoque.reduce((a: number, e: any) => a + (e.kilo || 0), 0);
  const totalAlertas = pendFinanceiro + pendNF + repanolEnviados + costureiraEnviados;

  const pipeline = [
    { label: "Coleta", count: data.coletas.length, icon: Truck, color: "text-blue-500" },
    { label: "Separação", count: data.separacoes.length, icon: Factory, color: "text-indigo-500" },
    { label: "Produção", count: data.producoes.length, icon: Factory, color: "text-violet-500" },
    { label: "Estoque", count: data.estoque.length, icon: Warehouse, color: "text-emerald-500" },
    { label: "Expedição", count: data.expedicoes.length, icon: Package, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-[#ed1b24] to-[#001443] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Tecnopano</h1>
            <p className="text-white/70 text-sm mt-1">Visão geral do sistema — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          {totalAlertas > 0 && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
              <AlertCircle className="h-5 w-5 text-yellow-300" />
              <div>
                <p className="text-sm font-semibold">{totalAlertas} pendências</p>
                <p className="text-[10px] text-white/60">requerem atenção</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard label="Coletas Pendentes" value={coletasPendentes} icon={Truck} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Em Produção" value={emProducao} icon={Factory} color="text-violet-500" bg="bg-violet-500/10" />
        <StatsCard label="Estoque" value={`${(pesoEstoque / 1000).toFixed(1)}t`} icon={Warehouse} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Pend. Financeiro" value={pendFinanceiro} icon={DollarSign} color="text-amber-500" bg="bg-amber-500/10" />
        <StatsCard label="Pend. NF" value={pendNF} icon={FileText} color="text-purple-500" bg="bg-purple-500/10" />
        <StatsCard label="Pronto Entrega" value={prontoEntrega} icon={Package} color="text-teal-500" bg="bg-teal-500/10" />
      </div>

      {/* Pipeline visual */}
      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          Pipeline de Produção
        </h3>
        <div className="flex items-center gap-2">
          {pipeline.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div className="flex-1 bg-muted/50 rounded-xl p-4 text-center hover:bg-muted/80 transition-colors">
                <step.icon className={`h-6 w-6 mx-auto mb-1 ${step.color}`} />
                <p className="text-2xl font-bold">{step.count}</p>
                <p className="text-[11px] text-muted-foreground">{step.label}</p>
              </div>
              {i < pipeline.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas / Pendências */}
        <div className="bg-card rounded-xl border shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pendências
          </h3>
          <div className="space-y-3">
            {pendFinanceiro > 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Aprovação Financeira</p>
                    <p className="text-xs text-muted-foreground">{pendFinanceiro} pedido(s) aguardando</p>
                  </div>
                </div>
                <Badge variant="warning">{pendFinanceiro}</Badge>
              </div>
            )}
            {pendNF > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Emissão de NF</p>
                    <p className="text-xs text-muted-foreground">{pendNF} nota(s) para emitir</p>
                  </div>
                </div>
                <Badge variant="default">{pendNF}</Badge>
              </div>
            )}
            {repanolEnviados > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Repanol em Trânsito</p>
                    <p className="text-xs text-muted-foreground">{repanolEnviados} lote(s) aguardando retorno</p>
                  </div>
                </div>
                <Badge variant="info">{repanolEnviados}</Badge>
              </div>
            )}
            {costureiraEnviados > 0 && (
              <div className="flex items-center justify-between p-3 bg-pink-500/5 rounded-lg border border-pink-500/10">
                <div className="flex items-center gap-3">
                  <Scissors className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium">Costureira em Trânsito</p>
                    <p className="text-xs text-muted-foreground">{costureiraEnviados} envio(s) aguardando retorno</p>
                  </div>
                </div>
                <Badge variant="default">{costureiraEnviados}</Badge>
              </div>
            )}
            {totalAlertas === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                <p className="text-sm font-medium">Tudo em dia!</p>
                <p className="text-xs text-muted-foreground">Nenhuma pendência no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo Geral */}
        <div className="bg-card rounded-xl border shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Resumo do Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Clientes</span>
              </div>
              <span className="font-bold">{data.clientes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Fornecedores</span>
              </div>
              <span className="font-bold">5</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Colaboradores</span>
              </div>
              <span className="font-bold">{data.colaboradores.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Itens em Estoque</span>
              </div>
              <span className="font-bold">{data.estoque.length}</span>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Expedições por Status</p>
              <div className="space-y-2">
                {[
                  { label: "Entregues", count: data.expedicoes.filter((e: any) => e.statusEntrega === "entregue").length, total: data.expedicoes.length, color: "bg-success" },
                  { label: "Em Andamento", count: data.expedicoes.filter((e: any) => e.statusEntrega !== "entregue" && e.statusEntrega !== "cancelado").length, total: data.expedicoes.length, color: "bg-info" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.count}/{item.total}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
