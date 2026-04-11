/**
 * Cromia do header da documentação FIPS — alinhado a Design-system-FIPS `src/lib/docHeaderChrome.ts`.
 */

import type { CSSProperties } from "react";

/** Painel vidro sobre `#1A1A1A` — faixa de tabs (dark), barra de filtros e KPIs no dashboard. */
export const shellDarkGlassPanel: CSSProperties = {
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.10)",
};

export const docHeaderShellBorder = "";

export const docHeaderArtWash =
  "bg-[linear-gradient(135deg,rgba(245,245,245,0.94)_0%,rgba(255,255,255,0.88)_44%,rgba(235,235,235,0.96)_100%)]";

export const docHeaderArtDepth =
  "bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.5),transparent_48%),radial-gradient(circle_at_100%_100%,rgba(0,0,0,0.06),transparent_40%)]";

export const docHeaderBarSurface = "bg-[#f5f5f5]";

export const docHeaderBarTop = `border-b border-[#e5e5e5] ${docHeaderBarSurface}`;

export const docHeaderTabsSurface = "bg-white";

export const docHeaderBarTabs = `${docHeaderTabsSurface} pt-2 pb-0`;

export const docHeaderTabsNavSeparatorClass = "border-b-2 border-[#E2E8F0]";

/** Borda repouso (inputs, chip) — alinhada ao azulejo claro da sidebar. */
export const docHeaderBlueBarBorder = "rgba(0,0,0,0.10)";

/** Azulejo claro (#f5f5f5) — repouso; mesmo critério que `SB_ICON_TILE_LIGHT` na sidebar. */
export const docHeaderNeuLightBorderIdle = "rgba(0,0,0,0.10)";
export const docHeaderNeuLightBgIdle =
  "linear-gradient(145deg, #ffffff 0%, #ebebeb 55%, #e0e0e0 100%)";
export const docHeaderNeuLightShadowIdle =
  "0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)";
export const docHeaderNeuLightIconIdle = "rgba(55,55,55,0.82)";

/** Hover/active vermelho Tecnopano — igual sidebar + azulejo vermelho. */
export const docHeaderNeuAccentBorderHover = "rgba(255,7,58,0.4)";
export const docHeaderNeuAccentBgHover = "linear-gradient(135deg,#FF073A,#B20028)";
export const docHeaderNeuAccentShadowHover =
  "0 6px 22px -4px rgba(255,7,58,0.5), 0 3px 10px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.35) inset";
export const docHeaderNeuAccentIcon = "#ffffff";

/** Faixa escura do header — repouso alinhado à sidebar escura (gradiente + sombra 3D). */
export const docHeaderNeuDarkBorderIdle = "#3f3f46";
export const docHeaderNeuDarkBgIdle =
  "linear-gradient(160deg, #303036 0%, #222226 55%, #1c1c20 100%)";
export const docHeaderNeuDarkShadowIdle =
  "0 3px 10px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.45) inset";
export const docHeaderNeuDarkIconIdle = "#a1a1aa";

/** Brilho translúcido do sweep. */
export const docHeaderNeuShimmerGradient =
  "linear-gradient(135deg,transparent,rgba(255,255,255,0.25) 50%,transparent)";
/** Sobre hover vermelho — mais visível (igual sidebar `SHIMMER_ON_RED`). */
export const docHeaderNeuShimmerOnRed =
  "linear-gradient(135deg,transparent,rgba(255,255,255,0.38) 50%,transparent)";

export const docHeaderTabsUnderlineMd = {
  fontSizePx: 13,
  paddingXPx: 20,
  paddingYPx: 10,
  iconGapPx: 7,
  iconSizePx: 14,
  indicatorHeightPx: 3,
  borderBottomPx: 2,
  activeFontWeight: 600,
  inactiveFontWeight: 400,
  transitionMs: 200,
  indicatorTransition: "left .3s cubic-bezier(.4,0,.2,1), width .3s cubic-bezier(.4,0,.2,1)",
  accentHex: "#FF073A",
  activeTextOnLightHex: "#002A68",
  mutedOnLightHex: "#7B8C96",
  hoverTextOnLightHex: "#333B41",
  separatorOnLightHex: "#E2E8F0",
} as const;

/**
 * Botão quadrado (PanelLeft / tema) — **36×36**, raio **10px** — variante para faixa clara (#f5f5f5).
 */
export const docHeaderToolbarIconBtnClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.10] bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/25 focus-visible:ring-offset-0 [&_svg]:h-[17px] [&_svg]:w-[17px] [&_svg]:shrink-0";

export const docHeaderToolbarIconBtnDarkClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#3F3F46] bg-[#27272A] text-[#E2E2E8] shadow-sm transition-colors hover:bg-[#323236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC24E]/30 focus-visible:ring-offset-0 [&_svg]:h-[17px] [&_svg]:w-[17px] [&_svg]:shrink-0";

/** Input de busca no header claro — borda **1px** alinhada ao neu. */
export const docHeaderSearchInputLightClass =
  "h-[35px] w-full rounded-lg border border-black/[0.10] bg-white py-0 pl-9 pr-3 font-sans text-[13px] leading-normal text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-neutral-500 focus-visible:outline-none focus-visible:border-[#a3a3a3] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:ring-offset-0";

/** Chip no header claro. */
export const docHeaderUserChipLightClass =
  "flex h-[35px] max-w-[220px] items-center gap-2 rounded-full border border-black/[0.10] bg-white text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50";
