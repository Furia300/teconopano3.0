import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  docHeaderNeuAccentBgHover,
  docHeaderNeuAccentBorderHover,
  docHeaderNeuAccentShadowHover,
  docHeaderNeuLightBgIdle,
  docHeaderNeuLightBorderIdle,
  docHeaderNeuLightShadowIdle,
  docHeaderNeuShimmerGradient,
  docHeaderNeuShimmerOnRed,
} from "@/lib/docHeaderChrome";

/** Chip de utilizador — mesma linguagem dos azulejos da sidebar / `DocHeaderNeuIconButton` (neu + hover vermelho + shimmer). */
export function HeaderDocUserChip({
  dark,
  name = "Admin",
  /** Incluído só em `aria-label` (acessibilidade); o DS não mostra segunda linha no header. */
  subtitle,
  initials = "AD",
}: {
  dark?: boolean;
  name?: string;
  subtitle?: string;
  initials?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const aria =
    subtitle && subtitle !== name ? `Conta: ${name} — ${subtitle}` : `Conta: ${name}`;

  if (dark) {
    return (
      <button
        type="button"
        className={cn(
          "flex h-[35px] max-w-[220px] items-center gap-2 rounded-full border border-[#3F3F46] bg-[#27272A] px-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-[#323236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC24E]/30 focus-visible:ring-offset-0",
        )}
        aria-label={aria}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E1E22] text-[12px] font-semibold text-[#FDC24E]">
          {initials}
        </span>
        <span className="hidden min-w-0 flex-1 truncate text-left font-sans text-[13px] leading-none text-[#E2E2E8] sm:block">
          {name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#A1A1AA]" strokeWidth={1.5} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={aria}
      className={cn(
        "relative flex h-[35px] max-w-[220px] items-center gap-2 overflow-hidden rounded-full px-2.5 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/25 focus-visible:ring-offset-0",
      )}
      style={{
        border: `1px solid ${hovered ? docHeaderNeuAccentBorderHover : docHeaderNeuLightBorderIdle}`,
        background: hovered ? docHeaderNeuAccentBgHover : docHeaderNeuLightBgIdle,
        boxShadow: hovered ? docHeaderNeuAccentShadowHover : docHeaderNeuLightShadowIdle,
        transform: hovered ? "translateY(-1px)" : "none",
        transition: hovered ? "all 0.3s ease" : "all 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: hovered ? docHeaderNeuShimmerOnRed : docHeaderNeuShimmerGradient,
          transform: hovered ? "translateX(0)" : "translateX(-100%)",
          animation: hovered ? "docsSidebarNeuShimmer 0.5s ease forwards" : "none",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute"
        style={{
          top: 1,
          left: 10,
          right: 10,
          height: "42%",
          borderRadius: 9999,
          background: hovered
            ? "linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0.02))"
            : "none",
        }}
        aria-hidden
      />
      <span
        className={cn(
          "relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-[#002A68]",
        )}
      >
        {initials}
      </span>
      <span
        className={cn(
          "relative z-[1] hidden min-w-0 flex-1 truncate text-left font-sans text-[13px] leading-none sm:block",
          hovered ? "text-white" : "text-neutral-800",
        )}
      >
        {name}
      </span>
      <ChevronDown
        className={cn(
          "relative z-[1] h-3.5 w-3.5 shrink-0",
          hovered ? "text-white" : "text-neutral-500",
        )}
        strokeWidth={1.5}
        aria-hidden
      />
    </button>
  );
}
