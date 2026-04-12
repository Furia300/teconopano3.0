import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--fips-primary)]/10 text-[var(--fips-primary)] dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-[var(--fips-primary)]',
        secondary:
          'border-transparent bg-[var(--fips-surface-muted)] text-[var(--fips-fg)] dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-white/70',
        success:
          'border-transparent bg-[var(--fips-success)]/14 text-[var(--fips-success-strong)] dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-[#00C64C]',
        warning:
          'border-transparent bg-[var(--color-fips-orange-100)] text-[var(--fips-accent-strong)] dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-[#FDC24E]',
        danger:
          'border-transparent bg-[var(--color-fips-red-100)] text-[var(--fips-danger)] dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-[#ed1b24]',
        outline:
          'border-[var(--fips-border)] bg-[var(--fips-surface)] text-[var(--fips-fg)] dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-white/70',
        info:
          'border-transparent bg-[var(--color-fips-blue-200)]/65 text-[var(--fips-primary)] dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-[#93BDE4]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
