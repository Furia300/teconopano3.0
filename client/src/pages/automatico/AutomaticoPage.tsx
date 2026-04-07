import { PageHeader } from "@/components/domain/PageHeader";
import { Zap } from "lucide-react";

export default function AutomaticoPage() {
  return (
    <div>
      <PageHeader
        icon={Zap}
        title="Automático"
        subtitle="Configurações automáticas do sistema"
      />
      <div className="p-6">
        <p className="text-muted-foreground">Página em construção.</p>
      </div>
    </div>
  );
}
