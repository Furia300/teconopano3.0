import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";

function AppContent() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
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
