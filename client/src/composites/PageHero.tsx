import type { ReactNode, SVGAttributes } from "react";
import { cn } from "@/lib/utils";

/** Exportado para manter compatibilidade com imports existentes. */
export const PAGE_HERO_DEFAULT_DECORATION = "/backgrounds/app-shell-home-trains.png";

/** Trilhos decorativos (mantido para imports legados). */
export function FipsJunctionLines({
  className,
  ...props
}: SVGAttributes<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      className={cn("pointer-events-none text-white", className)}
      aria-hidden
      {...props}
    >
      <path d="M0 60H100C120 60 120 60 140 40L200 40H320" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M0 60H100C120 60 120 60 140 80L200 80H320" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M0 120H60C80 120 80 120 100 100L160 100H320" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M0 120H60C80 120 80 120 100 140L160 140H320" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/* ── CSS idêntico ao RH hero ── */
const heroStyle = `
.page-hero {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 16px 28px;
  background: linear-gradient(135deg, #001443 0%, #002A68 50%, #001443 100%);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 4px 20px rgba(0,20,67,0.3);
}
:is(.dark) .page-hero {
  background: rgba(26,26,26,0.85);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.05);
}
.page-hero-frost {
  display: none;
}
:is(.dark) .page-hero-fade-rect {
  display: none;
}
:is(.dark) .page-hero-frost {
  display: block;
  position: absolute; inset: 0;
  pointer-events: none;
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  background: rgba(26,26,26,0.7);
  border-radius: inherit;
}
.page-hero-bottom {
  position: absolute; bottom: 0; left: 8%; right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ed1b24 25%, #B20028 50%, #ed1b24 75%, transparent);
  opacity: 0.35; border-radius: 1px;
}
:is(.dark) .page-hero-bottom { opacity: 0.5; }
.page-hero-stat {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
}
:is(.dark) .page-hero-stat {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.06);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
`;

/** SVG de trama têxtil — réplica exata do RH hero */
function FabricSVG() {
  return (
    <svg
      viewBox="0 0 900 220"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden
    >
      <path d="M0,35 C150,20 300,55 450,30 C600,5 750,50 900,25" stroke="white" strokeWidth="0.6" fill="none" opacity="0.05" />
      <path d="M0,60 C200,45 350,80 500,55 C650,30 800,70 900,50" stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
      <path d="M0,90 C180,75 320,110 480,85 C640,60 780,100 900,80" stroke="white" strokeWidth="0.6" fill="none" opacity="0.05" />
      <path d="M0,120 C220,105 400,140 550,115 C700,90 820,130 900,110" stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
      <path d="M0,150 C170,135 330,170 490,145 C650,120 790,160 900,140" stroke="white" strokeWidth="0.6" fill="none" opacity="0.05" />
      <path d="M0,178 C200,165 380,195 530,172 C680,150 810,185 900,168" stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
      <path d="M0,200 C250,190 400,215 560,195 C720,175 830,205 900,195" stroke="white" strokeWidth="0.5" fill="none" opacity="0.035" />

      <path d="M120,0 C110,55 140,110 115,165 C100,200 130,220 120,220" stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M240,0 C255,50 230,100 250,150 C265,190 240,220 245,220" stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M380,0 C370,60 395,120 375,170 C360,210 390,220 380,220" stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M520,0 C530,45 510,105 535,155 C550,195 515,220 525,220" stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M660,0 C650,55 675,115 655,170 C640,205 670,220 660,220" stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />
      <path d="M790,0 C800,50 780,110 805,160 C820,200 785,220 795,220" stroke="white" strokeWidth="0.5" fill="none" opacity="0.03" />

      <path d="M0,100 C120,70 240,130 360,85 C480,40 600,120 720,75 C810,45 870,90 900,80" stroke="#ed1b24" strokeWidth="1.2" fill="none" opacity="0.18" strokeLinecap="round" />
      <path d="M0,115 C140,90 280,145 400,105 C520,65 640,135 760,95 C840,70 880,105 900,98" stroke="#ed1b24" strokeWidth="0.6" fill="none" opacity="0.09" strokeLinecap="round" />

      <circle cx="120" cy="90" r="1.5" fill="#ed1b24" opacity="0.12" />
      <circle cx="240" cy="115" r="1.5" fill="#ed1b24" opacity="0.10" />
      <circle cx="380" cy="85" r="1.5" fill="#ed1b24" opacity="0.12" />
      <circle cx="520" cy="105" r="1.5" fill="#ed1b24" opacity="0.10" />
      <circle cx="660" cy="78" r="1.5" fill="#ed1b24" opacity="0.12" />
      <circle cx="790" cy="95" r="1.5" fill="#ed1b24" opacity="0.10" />

      <defs>
        <linearGradient id="ph-fade-l" x1="0" x2="0.15" y1="0" y2="0">
          <stop offset="0" stopColor="#001443" stopOpacity="1" />
          <stop offset="1" stopColor="#001443" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ph-fade-r" x1="0.85" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#001443" stopOpacity="0" />
          <stop offset="1" stopColor="#001443" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect className="page-hero-fade-rect" x="0" y="0" width="900" height="220" fill="url(#ph-fade-l)" />
      <rect className="page-hero-fade-rect" x="0" y="0" width="900" height="220" fill="url(#ph-fade-r)" />
    </svg>
  );
}

export type PageHeroProps = {
  children: ReactNode;
  className?: string;
  decorationSrc?: string | null;
  showTrainSilhouette?: boolean;
};

/**
 * Hero padrão Tecnopano — réplica exata do RH hero.
 * Light: gradiente navy + trama têxtil. Dark: glassmorphism vidro fosco.
 */
export function PageHero({ children, className }: PageHeroProps) {
  return (
    <>
      <style>{heroStyle}</style>
      <div className={cn("page-hero", className)}>
        <FabricSVG />
        <div className="page-hero-frost" />
        <div className="relative z-10">{children}</div>
        <div className="page-hero-bottom" />
      </div>
    </>
  );
}
