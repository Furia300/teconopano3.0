import { cn } from "@/lib/utils";

interface AvatarProps {
  /** Nome completo — usado para gerar as iniciais (primeira + última palavra) */
  name: string;
  /** Tamanho em px (default 28). FontSize = round(size * 0.36) seguindo o canônico FIPS DS */
  size?: number;
  className?: string;
}

/**
 * Avatar canônico do FIPS DS (`DataListingDemo`):
 * - círculo `bg-[#F2F4F8]` (light) / `bg-[var(--fips-surface-soft)]` (dark adapt)
 * - border `1px solid #E2E8F0` (cardBorder)
 * - cor do texto `#7B8C96` (cinzaChumbo)
 * - font-family **Saira Expanded** weight 700, letterSpacing 0.5px
 * - 2 iniciais (primeira + última palavra) ou 1 inicial se nome único
 */
export function Avatar({ name, size = 28, className }: AvatarProps) {
  const parts = (name || "").split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0]
        ? parts[0][0]
        : "?";

  return (
    <div
      className={cn(
        "font-heading flex flex-shrink-0 items-center justify-center rounded-full border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] font-bold tracking-[0.5px] text-[var(--fips-fg-muted)] uppercase",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}
