import * as React from 'react'

/* ═══ DS FIPS Badge — réplica exata do DataListingDemo (dark mode com inline styles) ═══ */

const BV_LIGHT: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: "#C4D9F0", color: "#003D7A", border: "#7AAAD6" },
  secondary: { bg: "#E8ECF1", color: "#4A5568", border: "#A0AEC0" },
  success: { bg: "#D1FAE5", color: "#047857", border: "#6EE7B7" },
  warning: { bg: "#FFEDD5", color: "#C2410C", border: "#FB923C" },
  danger: { bg: "#FEE2E2", color: "#B91C1C", border: "#FCA5A5" },
  info: { bg: "#C4D9F0", color: "#003D7A", border: "#7AAAD6" },
  outline: { bg: "transparent", color: "#333B41", border: "#d7e0ea" },
}

const BV_DARK: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: "rgba(147,189,228,0.14)", color: "#93BDE4", border: "rgba(147,189,228,0.28)" },
  secondary: { bg: "rgba(255,255,255,0.06)", color: "#A1A1AA", border: "rgba(255,255,255,0.12)" },
  success: { bg: "rgba(0,198,76,0.14)", color: "#8BE5AD", border: "rgba(0,198,76,0.28)" },
  warning: { bg: "rgba(246,146,30,0.14)", color: "#FDC24E", border: "rgba(246,146,30,0.28)" },
  danger: { bg: "rgba(239,68,68,0.14)", color: "#FCA5A5", border: "rgba(239,68,68,0.28)" },
  info: { bg: "rgba(147,189,228,0.14)", color: "#93BDE4", border: "rgba(147,189,228,0.28)" },
  outline: { bg: "transparent", color: "#E2E2E8", border: "#2E2E2E" },
}

function useDark() {
  const [dark, setDark] = React.useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  React.useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')))
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  dot?: boolean
}

function Badge({ variant = 'default', dot = false, children, className, style, ...props }: BadgeProps) {
  const dark = useDark()
  const v = (dark ? BV_DARK : BV_LIGHT)[variant] || (dark ? BV_DARK : BV_LIGHT).default

  return (
    <span
      data-badge=""
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "'Open Sans', sans-serif",
        color: v.color,
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: 4,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {dot ? (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: v.color,
            flexShrink: 0,
          }}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  )
}

export { Badge }
