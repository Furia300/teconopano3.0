import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, IdCard, Building2, Wifi } from "lucide-react";

interface Colaborador {
  id: number;
  cpf: string;
  name: string;
  registration: string;
  departamento: string;
  idDepartment: number;
  status: number;
  fonte: "rhid" | "local" | "rhid+local";
}

interface ColaboradorDetalhesProps {
  colaborador: Colaborador;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCPF = (cpf: string) => {
  const d = cpf.replace(/\D/g, "").padStart(11, "0");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const deptoColor = (depto: string) => {
  const d = depto.toLowerCase();
  if (d.includes("motorista") || d.includes("logis")) return "#93BDE4";
  if (d.includes("costur")) return "#FDC24E";
  if (d.includes("produ") || d.includes("galp")) return "#00C64C";
  if (d.includes("exped")) return "#ed1b24";
  if (d.includes("financ") || d.includes("escrit")) return "#FDC24E";
  if (d.includes("admin")) return "#ed1b24";
  return "#93BDE4";
};

export function ColaboradorDetalhes({ colaborador, open, onOpenChange }: ColaboradorDetalhesProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {colaborador.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={colaborador.status === 1 ? "success" : "danger"} dot>
                {colaborador.status === 1 ? "Ativo" : "Inativo"}
              </Badge>
              <Badge
                variant={colaborador.fonte === "rhid" ? "info" : colaborador.fonte === "rhid+local" ? "success" : "secondary"}
                className="text-[10px]"
              >
                {colaborador.fonte === "rhid" ? "RHiD" : colaborador.fonte === "rhid+local" ? "Sync" : "Local"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <IdCard className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="font-medium font-mono">{formatCPF(colaborador.cpf)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IdCard className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Matrícula</p>
                <p className="font-medium font-mono">{colaborador.registration || "—"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Departamento</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: deptoColor(colaborador.departamento) }} />
                  <p className="font-medium">{colaborador.departamento || "—"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Wifi className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Fonte / ID</p>
                <p className="font-medium">
                  {colaborador.fonte === "rhid" ? "RHiD ControlID" : colaborador.fonte === "rhid+local" ? "Sincronizado" : "Cadastro Local"}
                </p>
                <p className="text-xs text-muted-foreground">ID: {colaborador.id}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
