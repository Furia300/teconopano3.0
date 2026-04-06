import { useEffect, useState } from "react";
import {
  ClipboardList, Plus, Calendar, Clock, User, Factory,
  CheckCircle2, AlertTriangle, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NovaProducaoDiariaDialog from "./NovaProducaoDiariaDialog";

interface ProducaoDiariaItem {
  id: string;
  data: string;
  nomeDupla: string;
  sala: string;
  material: string;
  horarioInicio: string;
  horarioFim: string | null;
  status: "completa" | "incompleta";
  assinatura: string;
  encarregado: string;
  observacao: string;
}

export default function ProducaoDiariaPage() {
  const [registros, setRegistros] = useState<ProducaoDiariaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtroData, setFiltroData] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch("/api/producao-diaria")
      .then(r => r.json())
      .then(data => { setRegistros(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (item: Omit<ProducaoDiariaItem, "id">) => {
    const res = await fetch("/api/producao-diaria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const novo = await res.json();
      setRegistros(prev => [novo, ...prev]);
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/producao-diaria/${id}`, { method: "DELETE" });
    if (res.ok) setRegistros(prev => prev.filter(r => r.id !== id));
  };

  const registrosDia = registros.filter(r => r.data === filtroData);

  // Agrupar por dupla
  const porDupla: Record<string, ProducaoDiariaItem[]> = {};
  registrosDia.forEach(r => {
    if (!porDupla[r.nomeDupla]) porDupla[r.nomeDupla] = [];
    porDupla[r.nomeDupla].push(r);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando produção diária...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produção Diária"
        description="Registro digital de produção por mesa — substitui a folha de papel"
        icon={ClipboardList}
      />

      {/* Filtro por data + botão novo */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-card"
          />
          <span className="text-sm text-muted-foreground">
            {registrosDia.length} registro(s)
          </span>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      {/* Resumo do dia */}
      {registrosDia.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl border shadow p-4 text-center">
            <p className="text-2xl font-bold">{registrosDia.length}</p>
            <p className="text-xs text-muted-foreground">Total Registros</p>
          </div>
          <div className="bg-card rounded-xl border shadow p-4 text-center">
            <p className="text-2xl font-bold">{Object.keys(porDupla).length}</p>
            <p className="text-xs text-muted-foreground">Duplas/Operadores</p>
          </div>
          <div className="bg-card rounded-xl border shadow p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {registrosDia.filter(r => r.status === "completa").length}
            </p>
            <p className="text-xs text-muted-foreground">Completas</p>
          </div>
          <div className="bg-card rounded-xl border shadow p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {registrosDia.filter(r => r.status === "incompleta").length}
            </p>
            <p className="text-xs text-muted-foreground">Incompletas</p>
          </div>
        </div>
      )}

      {/* Tabela por dupla */}
      {Object.keys(porDupla).length === 0 ? (
        <div className="bg-card rounded-xl border shadow p-10 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Nenhum registro para {new Date(filtroData + "T12:00:00").toLocaleDateString("pt-BR")}</p>
          <p className="text-sm text-muted-foreground mt-1">Clique em "Novo Registro" para começar</p>
        </div>
      ) : (
        Object.entries(porDupla).map(([dupla, items]) => (
          <div key={dupla} className="bg-card rounded-xl border shadow overflow-hidden">
            <div className="bg-gradient-to-r from-[#001443] to-[#1a3a6b] px-6 py-3 flex items-center gap-3">
              <User className="h-5 w-5 text-white" />
              <h3 className="text-white font-semibold">{dupla}</h3>
              <Badge variant="secondary" className="ml-auto">{items.length} registro(s)</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sala</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Material</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Horário</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assinatura</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Encarregado</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Factory className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.sala}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.material}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{item.horarioInicio}</span>
                          <span className="text-muted-foreground">—</span>
                          <span>{item.horarioFim || "..."}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.status === "completa" ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completa
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Incompleta
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.assinatura || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.encarregado || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <NovaProducaoDiariaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        defaultData={filtroData}
      />
    </div>
  );
}
