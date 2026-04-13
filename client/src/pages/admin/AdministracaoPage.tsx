import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Shield, Users, Key, Bell, ScrollText, MessageCircle,
  UserCheck, UserX, Clock, Activity,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { UsuariosTab } from "./tabs/UsuariosTab";
import { PermissoesTab } from "./tabs/PermissoesTab";
import { SolicitacoesTab } from "./tabs/SolicitacoesTab";
import { AuditLogTab } from "./tabs/AuditLogTab";
import { NotificacoesTab } from "./tabs/NotificacoesTab";

/* ─── Cores FIPS DS canônicas ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

const TABS = [
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "permissoes", label: "Permissões", icon: Key },
  { id: "solicitacoes", label: "Solicitações", icon: Bell },
  { id: "notificacoes", label: "Notificações", icon: MessageCircle },
  { id: "logs", label: "Auditoria", icon: ScrollText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdministracaoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("usuarios");
  const [userCount, setUserCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((users: any[]) => {
        setUserCount(users.length);
        setActiveCount(users.filter((u) => u.acesso).length);
        setInactiveCount(users.filter((u) => !u.acesso).length);
      })
      .catch(() => {});

    fetch("/api/admin/access-requests/pending")
      .then((r) => r.json())
      .then((reqs: any[]) => setPendingRequests(reqs.length))
      .catch(() => {});
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* ─── PageHeader FIPS DS ─── */}
      <PageHeader
        title="Administração"
        description="Gestão de usuários, permissões, solicitações de acesso e auditoria do sistema"
        icon={Shield}
        stats={[
          { label: "Usuários", value: userCount, color: "#93BDE4" },
          { label: "Ativos", value: activeCount, color: "#00C64C" },
          { label: "Inativos", value: inactiveCount, color: "#ed1b24" },
          { label: "Pendências", value: pendingRequests, color: "#FDC24E" },
        ]}
      />

      {/* ─── Cards Relatório FIPS DS ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Usuários"
          value={userCount}
          subtitle="Cadastrados no sistema"
          icon={Users}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Ativos"
          value={activeCount}
          subtitle="Com acesso liberado"
          icon={UserCheck}
          color={FIPS_COLORS.verdeFloresta}
        />
        <StatsCard
          label="Inativos"
          value={inactiveCount}
          subtitle="Acesso bloqueado"
          icon={UserX}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Solicitações Pendentes"
          value={pendingRequests}
          subtitle="Aguardando aprovação"
          icon={Clock}
          color={FIPS_COLORS.amareloEscuro}
        />
      </div>

      {/* ─── Tabs no padrão FIPS DS ─── */}
      <div
        className="flex items-center gap-0.5 p-1"
        style={{
          background: "var(--fips-surface)",
          border: "1px solid var(--fips-border)",
          borderRadius: "10px 10px 10px 18px",
          boxShadow: "var(--shadow-card)",
          width: "fit-content",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold transition-all"
              style={{
                borderRadius: "8px 8px 8px 14px",
                background: active
                  ? "var(--color-fips-blue-200)"
                  : "transparent",
                color: active
                  ? "var(--fips-primary)"
                  : "var(--fips-fg-muted)",
                border: active
                  ? "1px solid var(--fips-primary)"
                  : "1px solid transparent",
                cursor: "pointer",
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={13} />
              {tab.label}
              {tab.id === "solicitacoes" && pendingRequests > 0 && (
                <span
                  className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "var(--fips-danger)" }}
                >
                  {pendingRequests}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Content ─── */}
      {activeTab === "usuarios" && <UsuariosTab />}
      {activeTab === "permissoes" && <PermissoesTab />}
      {activeTab === "solicitacoes" && <SolicitacoesTab />}
      {activeTab === "notificacoes" && <NotificacoesTab />}
      {activeTab === "logs" && <AuditLogTab />}
    </div>
  );
}
