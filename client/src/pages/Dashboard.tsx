import {
  Package,
  Truck,
  Box,
  Users,
  TrendingUp,
  ClipboardList,
  Factory,
  ArrowDownToLine,
} from "lucide-react";

const stats = [
  { label: "Coletas Pendentes", value: "12", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Em Produção", value: "34", icon: Factory, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Estoque Disponível", value: "1.250", icon: Box, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Expedições Hoje", value: "8", icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema Tecnopano</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            Últimas Coletas
          </h3>
          <p className="text-muted-foreground text-sm">Nenhuma coleta registrada ainda.</p>
        </div>

        <div className="bg-card rounded-xl border shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Expedições Recentes
          </h3>
          <p className="text-muted-foreground text-sm">Nenhuma expedição registrada ainda.</p>
        </div>
      </div>
    </div>
  );
}
