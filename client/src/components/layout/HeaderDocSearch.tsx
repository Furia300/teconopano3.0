import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { docHeaderSearchInputLightClass } from "@/lib/docHeaderChrome";

/** Campo de busca na faixa #f5f5f5 — fundo branco e texto escuro. */
export function HeaderDocSearch({
  dark,
  className,
  placeholder = "Buscar pedidos, clientes ou produtos…",
}: {
  dark?: boolean;
  className?: string;
  placeholder?: string;
}) {
  if (dark) {
    return (
      <div className={cn("relative mx-auto w-full max-w-xs", className)}>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          placeholder={placeholder}
          aria-label="Buscar"
          className="h-[35px] w-full rounded-lg border border-[#3F3F46] bg-[#141416] py-0 pl-9 pr-3 font-sans text-[13px] leading-normal text-[#E2E2E8] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-[#71717A] backdrop-blur-sm focus-visible:outline-none focus-visible:border-[#FDC24E]/50 focus-visible:ring-2 focus-visible:ring-[#FDC24E]/20 focus-visible:ring-offset-0"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative mx-auto w-full max-w-xs", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-neutral-500"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        placeholder={placeholder}
        aria-label="Buscar"
        className={docHeaderSearchInputLightClass}
      />
    </div>
  );
}
