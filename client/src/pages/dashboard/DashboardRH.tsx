import {
  Users, Building2, UserCheck, UserX, TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/domain/StatsCard";

interface Props {
  data: any;
}

export default function DashboardRH({ data }: Props) {
  const total = data.colaboradores.length;
  const ativos = data.colaboradores.filter((c: any) => c.situacao !== "Demitido" && c.situacao !== "Inativo").length;
  const inativos = total - ativos;

  // Agrupar por departamento
  const porDepartamento: Record<string, number> = {};
  data.colaboradores.forEach((c: any) => {
    const dept = c.departamento || c.cargo || "Sem departamento";
    porDepartamento[dept] = (porDepartamento[dept] || 0) + 1;
  });
  const departamentos = Object.entries(porDepartamento).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Dashboard RH</h1>
        <p className="text-white/70 text-sm mt-1">Colaboradores e departamentos — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Total Colaboradores" value={total} icon={Users} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Ativos" value={ativos} icon={UserCheck} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatsCard label="Inativos" value={inativos} icon={UserX} color="text-red-500" bg="bg-red-500/10" />
        <StatsCard label="Departamentos" value={departamentos.length} icon={Building2} color="text-violet-500" bg="bg-violet-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          Colaboradores por Departamento
        </h3>
        <div className="space-y-3">
          {departamentos.map(([dept, count]) => (
            <div key={dept} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">{dept}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-teal-500 rounded-full" style={{ width: `${Math.max(20, (count / total) * 200)}px` }} />
                <span className="text-sm font-bold min-w-[2rem] text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
