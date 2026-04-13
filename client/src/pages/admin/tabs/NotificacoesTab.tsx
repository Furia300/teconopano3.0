import { useEffect, useState, useCallback } from "react";
import { MessageCircle, Wifi, WifiOff, Send, Info, QrCode, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface WhatsAppStatus {
  configured: boolean;
  connected: boolean;
  instance: string;
  qrCode: string | null;
  phone: string | null;
  error: string | null;
}

export function NotificacoesTab() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("5511965119797");
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ configured: false, connected: false, instance: "", qrCode: null, phone: null, error: "Backend não respondeu" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll a cada 5s para status
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/admin/whatsapp/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Conexão iniciada! Aguarde o QR code.");
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/admin/whatsapp/disconnect", { method: "POST" });
      toast.success("WhatsApp desconectado");
      fetchStatus();
    } catch {
      toast.error("Erro ao desconectar");
    }
  };

  const handleTest = async () => {
    if (!testPhone.trim()) return toast.error("Informe um número");
    setTesting(true);
    try {
      const res = await fetch("/api/admin/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Mensagem de teste enviada!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar teste");
    } finally {
      setTesting(false);
    }
  };

  const isConnected = status?.connected === true;
  const hasQR = status?.qrCode && !isConnected;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div
        className="flex items-center justify-between p-5 rounded-xl"
        style={{
          background: isConnected ? "rgba(0,198,76,0.06)" : "rgba(255,7,58,0.06)",
          border: `1px solid ${isConnected ? "rgba(0,198,76,0.2)" : "rgba(255,7,58,0.15)"}`,
          borderRadius: "10px 10px 10px 18px",
        }}
      >
        <div className="flex items-center gap-4">
          {isConnected ? <Wifi size={24} color="#00C64C" /> : <WifiOff size={24} color="#FF073A" />}
          <div>
            <div className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--fips-fg)" }}>
              {loading ? "Verificando..." : isConnected ? "WhatsApp Conectado" : "WhatsApp Desconectado"}
              {isConnected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(0,198,76,0.15)", color: "#00C64C" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ONLINE
                </span>
              )}
            </div>
            <div className="text-xs" style={{ color: "var(--fips-fg-muted)" }}>
              {isConnected
                ? `Conectado: ${status?.phone || "número não identificado"}`
                : status?.configured
                  ? "Evolution API configurada mas não conectada"
                  : "Evolution API será configurada no deploy (VPS + Docker + Traefik)"}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isConnected ? (
            <Button size="sm" onClick={handleConnect} loading={connecting}>
              <QrCode size={13} className="mr-1" /> Conectar
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handleDisconnect}>
              <XCircle size={13} className="mr-1" /> Desconectar
            </Button>
          )}
          <button
            onClick={fetchStatus}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--fips-fg-muted)", cursor: "pointer", background: "none", border: "none" }}
            title="Atualizar status"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* QR Code */}
      {hasQR && (
        <div
          className="flex flex-col items-center p-6 rounded-xl"
          style={{
            background: "var(--fips-surface)",
            border: "1px solid var(--fips-border)",
            borderRadius: "10px 10px 10px 18px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <QrCode size={20} className="mb-2" style={{ color: "var(--fips-primary)" }} />
          <h3 className="text-sm font-bold mb-1" style={{ color: "var(--fips-fg)" }}>Escaneie o QR Code</h3>
          <p className="text-xs mb-4" style={{ color: "var(--fips-fg-muted)" }}>
            Abra o WhatsApp no celular → Menu (⋮) → Aparelhos conectados → Conectar
          </p>
          <div className="p-3 rounded-xl bg-white">
            <img src={`data:image/png;base64,${status!.qrCode}`} alt="QR Code" style={{ width: 220, height: 220 }} />
          </div>
          <p className="text-[10px] mt-3 animate-pulse" style={{ color: "var(--fips-fg-muted)" }}>
            Atualizando automaticamente...
          </p>
        </div>
      )}

      {/* Teste */}
      {isConnected && (
        <div
          className="p-5 rounded-xl"
          style={{
            background: "var(--fips-surface)",
            border: "1px solid var(--fips-border)",
            borderRadius: "10px 10px 10px 18px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--fips-fg)" }}>
            <Send size={14} style={{ color: "var(--fips-success)" }} />
            Enviar Mensagem de Teste
          </h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-[9px] font-bold uppercase tracking-[1px] mb-1.5" style={{ color: "var(--fips-fg-muted)" }}>
                Número (com DDI+DDD)
              </label>
              <input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="5511965119797"
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ background: "var(--fips-surface-muted)", borderColor: "var(--fips-border)", color: "var(--fips-fg)" }}
              />
            </div>
            <Button size="sm" onClick={handleTest} loading={testing}>
              <Send size={13} className="mr-1" /> Testar
            </Button>
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: "var(--fips-surface)",
          border: "1px solid var(--fips-border)",
          borderRadius: "10px 10px 10px 18px",
        }}
      >
        <Info size={16} style={{ color: "var(--fips-primary)", marginTop: 2, flexShrink: 0 }} />
        <div className="text-xs" style={{ color: "var(--fips-fg-muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--fips-fg)" }}>Como funciona:</strong>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            <li>Clique <strong>Conectar</strong> → escaneie o QR code com WhatsApp</li>
            <li>Cadastros em <code>/cadastro</code> notificam os admins automaticamente</li>
            <li>Solicitações de acesso (menu trancado) notificam os admins</li>
            <li>Aprovações/negações notificam o solicitante</li>
            <li>Sem WhatsApp conectado, pendências aparecem no <strong>badge vermelho</strong> do menu Administração</li>
          </ul>
        </div>
      </div>

      {/* Canais ativos */}
      <div
        className="p-5 rounded-xl"
        style={{
          background: "var(--fips-surface)",
          border: "1px solid var(--fips-border)",
          borderRadius: "10px 10px 10px 18px",
        }}
      >
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--fips-fg)" }}>
          Canais de Notificação
        </h3>
        <div className="space-y-2">
          {[
            { label: "Badge no menu Administração", active: true, desc: "Sempre ativo — mostra pendências em tempo real" },
            { label: "Tab Solicitações", active: true, desc: "Sempre ativo — lista completa com aprovar/negar" },
            { label: "WhatsApp para Admins", active: isConnected, desc: isConnected ? `Enviando para admins com WhatsApp cadastrado` : "Conecte acima para ativar" },
          ].map((ch) => (
            <div
              key={ch.label}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: "var(--fips-surface-muted)" }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: ch.active ? "var(--fips-success)" : "var(--fips-border)" }}
              />
              <div>
                <div className="text-xs font-medium" style={{ color: "var(--fips-fg)" }}>{ch.label}</div>
                <div className="text-[10px]" style={{ color: "var(--fips-fg-muted)" }}>{ch.desc}</div>
              </div>
              <div className="ml-auto">
                {ch.active ? (
                  <CheckCircle2 size={14} color="var(--fips-success)" />
                ) : (
                  <XCircle size={14} style={{ color: "var(--fips-border)" }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy info */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: "var(--fips-surface-muted)",
          border: "1px solid var(--fips-border)",
          borderRadius: "10px 10px 10px 18px",
        }}
      >
        <p className="text-[10px]" style={{ color: "var(--fips-fg-muted)" }}>
          <strong>Deploy:</strong> A Evolution API será configurada como container Docker na VPS (5.78.90.166) com Traefik.
          As variáveis <code>WHATSAPP_API_URL</code>, <code>WHATSAPP_TOKEN</code> e <code>WHATSAPP_ENABLED</code> serão definidas no <code>.env</code> de produção.
        </p>
      </div>
    </div>
  );
}
