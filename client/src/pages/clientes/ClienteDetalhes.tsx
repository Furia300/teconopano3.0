import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Building2, MapPin, Phone, Mail, Calendar } from "lucide-react";

interface Cliente {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string | null;
  tipo?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  contato?: string | null;
  email?: string | null;
  ativo?: boolean;
  createdAt?: string | null;
}

interface ClienteDetalhesProps {
  cliente: Cliente;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClienteDetalhes({ cliente, open, onOpenChange }: ClienteDetalhesProps) {
  const formatDate = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {cliente.nomeFantasia}
            </DialogTitle>
            <Badge variant={cliente.ativo !== false ? "success" : "secondary"} dot>
              {cliente.ativo !== false ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Razão Social</p>
                <p className="font-medium">{cliente.razaoSocial || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">CNPJ</p>
                <p className="font-medium font-mono">{cliente.cnpj || "—"}</p>
              </div>
            </div>

            {cliente.tipo && (
              <div className="flex items-start gap-3">
                <ShoppingCart className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-medium">{cliente.tipo}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Contato</p>
                <p className="font-medium">{cliente.contato || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium">{cliente.email || "—"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="font-medium">{cliente.endereco || "—"}</p>
                {cliente.bairro && <p className="text-xs text-muted-foreground">{cliente.bairro}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Cidade / UF</p>
                <p className="font-medium">
                  {cliente.cidade ? `${cliente.cidade}${cliente.estado ? ` / ${cliente.estado}` : ""}` : cliente.estado || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">CEP</p>
                <p className="font-medium font-mono">{cliente.cep || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-medium">{cliente.telefone || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{formatDate(cliente.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
