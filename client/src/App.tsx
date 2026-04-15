import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "sonner";

const ApplicationShellDemo = lazy(() => import("../tecnopano/ApplicationShellDemo"));
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ColetaList from "./pages/coleta/ColetaList";
import SeparacaoList from "./pages/separacao/SeparacaoList";
import ProducaoList from "./pages/producao/ProducaoList";
import RepanolList from "./pages/repanol/RepanolList";
import CostureiraList from "./pages/costureira/CostureiraList";
import EstoqueList from "./pages/estoque/EstoqueList";
import ExpedicaoList from "./pages/expedicao/ExpedicaoList";
import FinanceiroPage from "./pages/financeiro/FinanceiroPage";
import EmissaoNFPage from "./pages/emissao-nf/EmissaoNFPage";
import ClientesList from "./pages/clientes/ClientesList";
import FornecedoresList from "./pages/fornecedores/FornecedoresList";
import ProdutosList from "./pages/produtos/ProdutosList";
import FuncionariosList from "./pages/funcionarios/FuncionariosList";
import PontoDiario from "./pages/rh/PontoDiario";
import DashboardRHPage from "./pages/rh/DashboardRHPage";
import DashboardColetaPage from "./pages/coleta/DashboardColetaPage";
import DashboardExpedicaoPage from "./pages/expedicao/DashboardExpedicaoPage";
import DashboardFinanceiroPage from "./pages/financeiro/DashboardFinanceiroPage";
import ProducaoDiariaPage from "./pages/producao-diaria/ProducaoDiariaPage";
import AutomaticoPage from "./pages/automatico/AutomaticoPage";
import MotoristaList from "./pages/motorista/MotoristaList";
import PainelLogisticaPage from "./pages/motorista/PainelLogisticaPage";
import DashboardGamificacaoPage from "./pages/dashboard/DashboardGamificacaoPage";
import DashboardRendimentoPage from "./pages/dashboard/DashboardRendimentoPage";
import AdministracaoPage from "./pages/admin/AdministracaoPage";
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import DefinirSenha from "./pages/auth/DefinirSenha";

function AppContent() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/coleta" component={ColetaList} />
        <Route path="/dashboard-coleta" component={DashboardColetaPage} />
        <Route path="/separacao" component={SeparacaoList} />
        <Route path="/producao" component={ProducaoList} />
        <Route path="/repanol" component={RepanolList} />
        <Route path="/costureira" component={CostureiraList} />
        <Route path="/estoque" component={EstoqueList} />
        <Route path="/expedicao" component={ExpedicaoList} />
        <Route path="/dashboard-expedicao" component={DashboardExpedicaoPage} />
        <Route path="/financeiro" component={FinanceiroPage} />
        <Route path="/dashboard-financeiro" component={DashboardFinanceiroPage} />
        <Route path="/emissao-nf" component={EmissaoNFPage} />
        <Route path="/clientes" component={ClientesList} />
        <Route path="/fornecedores" component={FornecedoresList} />
        <Route path="/produtos" component={ProdutosList} />
        <Route path="/dashboard-rh" component={DashboardRHPage} />
        <Route path="/funcionarios" component={FuncionariosList} />
        <Route path="/ponto-diario" component={PontoDiario} />
        <Route path="/producao-diaria" component={ProducaoDiariaPage} />
        <Route path="/motorista" component={PainelLogisticaPage} />
        <Route path="/motorista-cadastro" component={MotoristaList} />
        <Route path="/automatico" component={AutomaticoPage} />
        <Route path="/gamificacao" component={DashboardGamificacaoPage} />
        <Route path="/rendimento" component={DashboardRendimentoPage} />
        <Route path="/administracao" component={AdministracaoPage} />
        <Route>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold">404 - Página não encontrada</h1>
            <p className="text-muted-foreground mt-2">A página que você procura não existe.</p>
          </div>
        </Route>
      </Switch>
    </AppLayout>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/cadastro" component={Cadastro} />
        <Route path="/definir-senha" component={DefinirSenha} />
        <Route path="/shell-demo">
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">A carregar…</div>}>
            <ApplicationShellDemo />
          </Suspense>
        </Route>
        <Route>
          <AppContent />
        </Route>
      </Switch>
    </>
  );
}
