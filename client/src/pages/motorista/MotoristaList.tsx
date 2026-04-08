import { useEffect, useMemo, useState } from "react";
import { Truck, MapPin, Factory, Scissors, Package, Route, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Coleta = {
  id: string;
  numero?: number;
  nomeFantasia?: string;
  galpao?: string;
  status?: string;
  dataChegada?: string | null;
};

type Costureira = {
  id: string;
  costureira?: string;
  galpaoEnvio?: string;
  galpaoRetorno?: string;
  tipoMaterial?: string;
  status?: string;
};

type Expedicao = {
  id: string;
  nomeFantasia?: string;
  rota?: string;
  galpao?: string;
  statusEntrega?: string;
  statusNota?: string;
};

export default function MotoristaList() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [costureira, setCostureira] = useState<Costureira[]>([]);
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/coletas").then((r) => r.json()).catch(() => []),
      fetch("/api/costureira").then((r) => r.json()).catch(() => []),
      fetch("/api/expedicoes").then((r) => r.json()).catch(() => []),
    ])
      .then(([coletaRes, costureiraRes, expedicaoRes]) => {
        setColetas(Array.isArray(coletaRes) ? coletaRes : []);
        setCostureira(Array.isArray(costureiraRes) ? costureiraRes : []);
        setExpedicoes(Array.isArray(expedicaoRes) ? expedicaoRes : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const tarefasColeta = useMemo(
    () =>
      coletas.filter((c) => ["pendente", "agendado", "em_rota"].includes((c.status || "").toLowerCase())),
    [coletas],
  );

  const tarefasCostureira = useMemo(
    () =>
      costureira.filter((c) => ["enviado", "retorno_pendente", "aguardando_retorno"].includes((c.status || "").toLowerCase())),
    [costureira],
  );

  const tarefasEntrega = useMemo(
    () =>
      expedicoes.filter((e) => {
        const stEntrega = (e.statusEntrega || "").toLowerCase();
        const stNota = (e.statusNota || "").toLowerCase();
        return stNota === "emitida" && ["pronto_entrega", "em_rota", "pendente"].includes(stEntrega);
      }),
    [expedicoes],
  );

  const searchNorm = search.toLowerCase();
  const match = (txt?: string) => !search || (txt || "").toLowerCase().includes(searchNorm);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel do Motorista"
        description="Ordens da Expedição e do Galpão: coletas, costureiras e entregas em rota"
        icon={Route}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Coletas de Matéria-Prima" value={tarefasColeta.length} icon={Factory} color="text-blue-500" bg="bg-blue-500/10" />
        <StatsCard label="Envios para Costureiras" value={tarefasCostureira.length} icon={Scissors} color="text-fuchsia-500" bg="bg-fuchsia-500/10" />
        <StatsCard label="Entregas para Clientes" value={tarefasEntrega.length} icon={Truck} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      <div className="bg-card rounded-xl border shadow p-4">
        <Input
          placeholder="Buscar por cliente, costureira, galpão, rota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="bg-card rounded-xl border shadow p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Factory className="h-4 w-4 text-blue-500" />
            Coleta de Matéria-Prima
          </h3>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : tarefasColeta.filter((c) => match(c.nomeFantasia) || match(c.galpao)).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem ordens de coleta.</p>
            ) : (
              tarefasColeta
                .filter((c) => match(c.nomeFantasia) || match(c.galpao))
                .map((c) => (
                  <div key={c.id} className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">#{c.numero || c.id} · {c.nomeFantasia || "Fornecedor"}</p>
                      <Badge variant="info">{c.status || "pendente"}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {c.galpao || "Galpão não informado"}
                    </p>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="bg-card rounded-xl border shadow p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Scissors className="h-4 w-4 text-fuchsia-500" />
            Rotas para Costureiras
          </h3>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : tarefasCostureira.filter((c) => match(c.costureira) || match(c.galpaoEnvio) || match(c.galpaoRetorno)).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem ordens para costureira.</p>
            ) : (
              tarefasCostureira
                .filter((c) => match(c.costureira) || match(c.galpaoEnvio) || match(c.galpaoRetorno))
                .map((c) => (
                  <div key={c.id} className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{c.costureira || "Costureira externa"}</p>
                      <Badge variant="warning">{c.status || "enviado"}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.galpaoEnvio || "Galpão"} → Costureira → {c.galpaoRetorno || "Retorno"}
                    </p>
                    {c.tipoMaterial && <p className="text-xs text-muted-foreground">{c.tipoMaterial}</p>}
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="bg-card rounded-xl border shadow p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-500" />
            Entregas ao Cliente
          </h3>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : tarefasEntrega.filter((e) => match(e.nomeFantasia) || match(e.rota) || match(e.galpao)).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem entregas em rota.</p>
            ) : (
              tarefasEntrega
                .filter((e) => match(e.nomeFantasia) || match(e.rota) || match(e.galpao))
                .map((e) => (
                  <div key={e.id} className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{e.nomeFantasia || "Cliente"}</p>
                      <Badge variant={e.statusEntrega === "em_rota" ? "info" : "default"}>{e.statusEntrega || "pendente"}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <Route className="h-3 w-3" /> Rota {e.rota || "não definida"} · {e.galpao || "Galpão"}
                    </p>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>

      <div className="bg-card rounded-xl border shadow p-4 text-sm text-muted-foreground flex items-center gap-2">
        <Clock3 className="h-4 w-4" />
        O painel consolida ordens da Expedição (coleta e entrega) e do Galpão (fluxo com costureiras externas).
      </div>
    </div>
  );
}
