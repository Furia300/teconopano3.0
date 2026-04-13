import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Send, X } from "lucide-react";
import { toast } from "sonner";

interface AccessRequestModalProps {
  open: boolean;
  onClose: () => void;
  resourceLabel: string;
  resourceHref: string;
  onSubmit: (resource: string, motivo: string) => Promise<void>;
}

export function AccessRequestModal({
  open,
  onClose,
  resourceLabel,
  resourceHref,
  onSubmit,
}: AccessRequestModalProps) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo da solicitação");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(resourceHref, motivo.trim());
      toast.success("Solicitação enviada! Aguarde aprovação do administrador.");
      setMotivo("");
      onClose();
    } catch {
      toast.error("Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="access-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 9998,
            }}
          />
          {/* Dialog */}
          <motion.div
            key="access-dialog"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              width: 420,
              maxWidth: "calc(100vw - 32px)",
              background:
                "linear-gradient(165deg, #232328 0%, #1a1a1e 50%, #151518 100%)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset",
              overflow: "hidden",
            }}
          >
            {/* Grain overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 20,
                pointerEvents: "none",
                opacity: 0.03,
                mixBlendMode: "overlay",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Red accent line */}
            <div
              style={{
                height: 3,
                background:
                  "linear-gradient(90deg, #FF073A, #B20028 50%, transparent)",
                borderRadius: "20px 20px 0 0",
              }}
            />

            {/* Content */}
            <div style={{ padding: "24px 28px 28px", position: "relative" }}>
              {/* Close */}
              <button
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "none",
                  border: "none",
                  color: "#71717a",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {/* Lock icon tile */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background:
                      "linear-gradient(160deg, #303036 0%, #222226 55%, #1c1c20 100%)",
                    border: "1px solid #3f3f46",
                    boxShadow:
                      "0 3px 10px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock size={18} color="#FF073A" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fafafa",
                      margin: 0,
                      fontFamily: "'Saira Expanded', sans-serif",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Acesso Restrito
                  </h3>
                  <p style={{ fontSize: 11, color: "#71717a", margin: "2px 0 0" }}>
                    {resourceLabel}
                  </p>
                </div>
              </motion.div>

              {/* Info box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.25 }}
                style={{
                  background: "rgba(255,7,58,0.06)",
                  border: "1px solid rgba(255,7,58,0.15)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#a1a1aa",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Você não tem permissão para acessar{" "}
                  <strong style={{ color: "#fafafa" }}>{resourceLabel}</strong>.
                  Envie uma solicitação com o motivo e um administrador irá
                  avaliar.
                </p>
              </motion.div>

              {/* Textarea */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
              >
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Motivo da solicitação
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva por que precisa de acesso a este recurso..."
                  rows={3}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid #3f3f46",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "#fafafa",
                    fontSize: 13,
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(255,7,58,0.4)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "#3f3f46")}
                />
              </motion.div>

              {/* Submit button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.25 }}
                onClick={handleSubmit}
                disabled={loading || !motivo.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 10,
                  background:
                    loading || !motivo.trim()
                      ? "#3f3f46"
                      : "linear-gradient(135deg, #FF073A, #B20028)",
                  color: loading || !motivo.trim() ? "#71717a" : "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor:
                    loading || !motivo.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow:
                    loading || !motivo.trim()
                      ? "none"
                      : "0 4px 15px rgba(255,7,58,0.3)",
                  transition: "all 0.2s",
                }}
              >
                <Send size={14} />
                {loading ? "Enviando..." : "Solicitar Acesso"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
