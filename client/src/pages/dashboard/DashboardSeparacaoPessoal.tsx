import {
  LuClipboardList, LuWeight, LuPackage, LuArrowRight,
} from "react-icons/lu";
const ClipboardList = LuClipboardList, Weight = LuWeight, Package = LuPackage, ArrowRight = LuArrowRight;
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/composites/PageHero";

interface Props {
  data: any;
  userName: string;
}

const destinoLabel: Record<string, string> = {
  producao: "Produção",
  repanol: "Repanol",
  costureira: "Costureira",
  doacao: "Doação",
  descarte: "Descarte",
};

export default function DashboardSeparacaoPessoal({ data, userName }: Props) {
  const minhas = data.separacoes.filter((s: any) => s.colaborador === userName);
  const totalKg = minhas.reduce((a: number, s: any) => a + (Number(s.peso) || 0), 0);

  // Agrupar por destino
  const porDestino: Record<string, number> = {};
  minhas.forEach((s: any) => {
    porDestino[s.destino] = (porDestino[s.destino] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <PageHero>
        <div className="relative flex items-start gap-4 px-6 py-5 sm:px-7 sm:py-6">
          <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
            <ClipboardList className="h-6 w-6" style={{ color: "#ed1b24" }} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Minha Separação</h2>
            <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Olá, {userName} — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
        </div>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatsCard label="Total Separações" value={minhas.length} icon={ClipboardList} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatsCard label="Total Kg" value={`${totalKg.toLocaleString("pt-BR")}kg`} icon={Weight} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Destinos" value={Object.keys(porDestino).length} icon={ArrowRight} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      {Object.keys(porDestino).length > 0 && (
        <div className="bg-card rounded-xl border shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Por Destino</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(porDestino).map(([destino, count]) => (
              <div key={destino} className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{destinoLabel[destino] || destino}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-500" />
          Minhas Separações
        </h3>
        {minhas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma separação registrada para você</p>
        ) : (
          <div className="space-y-2">
            {minhas.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{s.tipoMaterial} {s.cor} — {s.peso}kg</p>
                  <p className="text-xs text-muted-foreground">Coleta #{s.coletaNumero} • {s.fornecedor}</p>
                </div>
                <Badge variant="default">{destinoLabel[s.destino] || s.destino}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
