import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Calendar } from "lucide-react";

interface Fornecedor {
  id: string;
  nome: string;
  razaoSocial?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  contato?: string | null;
  email?: string | null;
  ativo?: boolean;
  createdAt?: string | null;
}

interface FornecedorDetalhesProps {
  fornecedor: Fornecedor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FornecedorDetalhes({ fornecedor, open, onOpenChange }: FornecedorDetalhesProps) {
  const formatDate = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {fornecedor.nome}
            </DialogTitle>
            <Badge variant={fornecedor.ativo !== false ? "success" : "secondary"} dot>
              {fornecedor.ativo !== false ? "Ativo" : "Inativo"}
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
                <p className="font-medium">{fornecedor.razaoSocial || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">CNPJ</p>
                <p className="font-medium font-mono">{fornecedor.cnpj || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Contato</p>
                <p className="font-medium">{fornecedor.contato || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium">{fornecedor.email || "—"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="font-medium">{fornecedor.endereco || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Cidade / UF</p>
                <p className="font-medium">
                  {fornecedor.cidade ? `${fornecedor.cidade}${fornecedor.estado ? ` / ${fornecedor.estado}` : ""}` : fornecedor.estado || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">CEP</p>
                <p className="font-medium font-mono">{fornecedor.cep || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-medium">{fornecedor.telefone || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{formatDate(fornecedor.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
