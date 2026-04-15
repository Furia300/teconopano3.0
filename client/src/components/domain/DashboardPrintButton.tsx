import { useCallback, useState } from "react";

/**
 * Botão de exportação PDF para dashboards.
 * Usa window.print() com @media print CSS otimizado.
 * Adiciona classe `.printing-dashboard` ao body durante a impressão
 * para ativar estilos de print específicos.
 */
export function DashboardPrintButton({ title }: { title?: string }) {
  const [preparing, setPreparing] = useState(false);

  const handlePrint = useCallback(() => {
    setPreparing(true);
    document.body.classList.add("printing-dashboard");
    if (title) document.title = `${title} — Tecnopano 3.0`;

    // Pequeno delay para garantir que o CSS de print aplique
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        document.body.classList.remove("printing-dashboard");
        document.title = "Tecnopano - Sistema de Gestão Industrial";
        setPreparing(false);
      }, 100);
    });
  }, [title]);

  return (
    <button
      onClick={handlePrint}
      disabled={preparing}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 16px",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "'Saira Expanded', sans-serif",
        letterSpacing: "0.03em",
        color: "#FFFFFF",
        background: "linear-gradient(135deg, #004B9B 0%, #002A68 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "8px 8px 8px 16px",
        cursor: preparing ? "wait" : "pointer",
        boxShadow: "0 2px 8px rgba(0,42,104,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
        transition: "all 0.2s ease",
        opacity: preparing ? 0.7 : 1,
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!preparing) {
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,42,104,0.35), inset 0 1px 0 rgba(255,255,255,0.15)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,42,104,0.25), inset 0 1px 0 rgba(255,255,255,0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Ícone PDF */}
      <svg width={15} height={15} viewBox="0 0 20 20" fill="none">
        <rect x="3" y="1" width="14" height="18" rx="2" stroke="#fff" strokeWidth="1.5" />
        <path d="M7 1V6H3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 11h6M7 14h4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="11" y="8" width="5" height="3" rx="0.8" fill="rgba(237,27,36,0.9)" />
        <text x="13.5" y="10.3" textAnchor="middle" fontSize="2.8" fontWeight="800" fill="#fff" fontFamily="sans-serif">PDF</text>
      </svg>
      {preparing ? "Preparando..." : "Exportar PDF"}
    </button>
  );
}
