import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--fips-primary)]/10 text-[var(--fips-primary)] dark:border-[rgba(147,189,228,0.28)] dark:bg-[rgba(147,189,228,0.14)] dark:text-[#93BDE4]',
        secondary:
          'border-transparent bg-[var(--fips-surface-muted)] text-[var(--fips-fg)]',
        success:
          'border-transparent bg-[var(--fips-success)]/14 text-[var(--fips-success-strong)] dark:border-[rgba(0,198,76,0.28)] dark:bg-[rgba(0,198,76,0.14)] dark:text-[#8BE5AD]',
        warning:
          'border-transparent bg-[var(--color-fips-orange-100)] text-[var(--fips-accent-strong)] dark:border-[rgba(246,146,30,0.28)] dark:bg-[rgba(246,146,30,0.14)] dark:text-[#FDC24E]',
        danger:
          'border-transparent bg-[var(--color-fips-red-100)] text-[var(--fips-danger)] dark:border-[rgba(239,68,68,0.28)] dark:bg-[rgba(239,68,68,0.14)] dark:text-[#FCA5A5]',
        outline:
          'border-[var(--fips-border)] bg-[var(--fips-surface)] text-[var(--fips-fg)]',
        info:
          'border-transparent bg-[var(--color-fips-blue-200)]/65 text-[var(--fips-primary)] dark:border-[rgba(147,189,228,0.28)] dark:bg-[rgba(147,189,228,0.14)] dark:text-[#93BDE4]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
