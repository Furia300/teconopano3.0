import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ColetaList from "./pages/coleta/ColetaList";
import SeparacaoList from "./pages/separacao/SeparacaoList";
import ProducaoList from "./pages/producao/ProducaoList";
import RepanolList from "./pages/repanol/RepanolList";
import CostureiraList from "./pages/costureira/CostureiraList";
import EstoqueList from "./pages/estoque/EstoqueList";
import ExpedicaoList from "./pages/expedicao/ExpedicaoList";
import FuncionariosList from "./pages/funcionarios/FuncionariosList";
import Login from "./pages/auth/Login";

function AppContent() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/coleta" component={ColetaList} />
        <Route path="/separacao" component={SeparacaoList} />
        <Route path="/producao" component={ProducaoList} />
        <Route path="/repanol" component={RepanolList} />
        <Route path="/costureira" component={CostureiraList} />
        <Route path="/estoque" component={EstoqueList} />
        <Route path="/expedicao" component={ExpedicaoList} />
        <Route path="/funcionarios" component={FuncionariosList} />
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
        <Route>
          <AppContent />
        </Route>
      </Switch>
    </>
  );
}
