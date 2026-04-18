import { useState } from "react";
import { HelpCircle, X, ChevronRight } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
}

interface TutorialContextualProps {
  pageName: string;
  steps: TutorialStep[];
}

const PAGE_TUTORIALS: Record<string, TutorialStep[]> = {
  coleta: [
    { title: "Criar pedido de coleta", description: "Clique em 'Pedido de coleta' para agendar uma nova retirada no fornecedor." },
    { title: "Acompanhar status", description: "Cada coleta passa por: Pendente → Agendado → Em Rota → Recebido → Em Separação → Em Produção → Finalizado." },
    { title: "Recorrência", description: "Na aba 'Coletas Programadas' veja agendamentos automáticos (ex: a cada 3 dias)." },
    { title: "Exportar", description: "Use os botões Excel/PDF na toolbar para exportar a listagem." },
  ],
  separacao: [
    { title: "Triagem do material", description: "Registre peso de chegada, peso atual e número da nota fiscal." },
    { title: "Criar lote", description: "Selecione tipo de material, cor, peso e destino (Produção, Costura, Descarte, Doação)." },
    { title: "QR Code", description: "Após criar o lote, gere e imprima o QR Code para rastreamento." },
  ],
  producao: [
    { title: "Iniciar produção", description: "Escaneie o QR Code do lote para carregar dados automaticamente." },
    { title: "Registrar saída", description: "Informe pacotes, quilos, descarte e material para costura." },
    { title: "Finalizar mesa", description: "Ao finalizar, o material segue para Embalagem → Estoque." },
  ],
  "producao-diaria": [
    { title: "Registro diário", description: "Clique em 'Novo' para registrar produção com dupla, sala e material." },
    { title: "4 colunas de resultado", description: "Informe: Pacotes produzidos, Quilos, Descarte e material para Costura." },
    { title: "Filtrar por data", description: "Use o seletor de data para ver produção de qualquer dia." },
  ],
  expedicao: [
    { title: "Novo pedido", description: "Cadastre pedido com cliente, produto, quantidade e rota." },
    { title: "Fluxo de aprovação", description: "Pedido → Financeiro aprova → Emissão NF → Motorista entrega." },
    { title: "Ver detalhes", description: "Clique no ícone de olho para ver status completo do pedido." },
  ],
  estoque: [
    { title: "Visão do estoque", description: "Total de itens, peso, reservado e disponível para novos pedidos." },
    { title: "Filtrar por galpão", description: "Use o filtro para ver estoque por localização." },
  ],
  financeiro: [
    { title: "Aprovar pedidos", description: "Pedidos aguardando aprovação aparecem com badge 'Pendente'." },
    { title: "Fluxo", description: "Aprovado → Emissão de NF → Entrega pelo motorista." },
  ],
  motorista: [
    { title: "Tarefas do dia", description: "Veja coletas, entregas e devoluções pendentes." },
    { title: "Registrar retorno", description: "Ao retornar da costureira/repanol, registre peso e assinatura." },
  ],
  administracao: [
    { title: "Gerenciar usuários", description: "Crie, edite, ative/desative e resete senhas dos colaboradores." },
    { title: "Permissões", description: "Configure acesso por módulo. Permissões herdadas do perfil aparecem em verde." },
    { title: "Solicitações", description: "Aprove ou negue pedidos de acesso dos colaboradores." },
    { title: "Auditoria", description: "Veja quem fez login, quem liberou acessos e em que horário." },
  ],
};

export function TutorialContextual({ pageName, steps: customSteps }: TutorialContextualProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = customSteps.length > 0 ? customSteps : PAGE_TUTORIALS[pageName] || [];
  if (steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Botão de ajuda */}
      <button
        onClick={() => { setOpen(true); setCurrentStep(0); }}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all"
        style={{
          background: "var(--fips-surface)",
          border: "1px solid var(--fips-border)",
          color: "var(--fips-fg-muted)",
          cursor: "pointer",
        }}
        title="Tutorial desta página"
      >
        <HelpCircle size={14} />
        Ajuda
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6"
            style={{
              background: "var(--fips-surface)",
              border: "1px solid var(--fips-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} style={{ color: "var(--fips-primary)" }} />
                <span className="text-sm font-bold" style={{ color: "var(--fips-fg)" }}>
                  Tutorial — {pageName}
                </span>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: "var(--fips-fg-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-1 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full flex-1 transition-all"
                  style={{
                    background: i <= currentStep ? "var(--fips-primary)" : "var(--fips-border)",
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-1" style={{ color: "var(--fips-fg)" }}>
                {currentStep + 1}. {step.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--fips-fg-muted)" }}>
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "var(--fips-fg-muted)" }}>
                {currentStep + 1} de {steps.length}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "var(--fips-surface-muted)",
                      color: "var(--fips-fg)",
                      border: "1px solid var(--fips-border)",
                      cursor: "pointer",
                    }}
                  >
                    Anterior
                  </button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "var(--fips-primary)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Próximo <ChevronRight size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => setOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "var(--fips-success)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Entendi!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { PAGE_TUTORIALS };
