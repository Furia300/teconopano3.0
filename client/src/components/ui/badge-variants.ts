import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--fips-primary)]/10 text-[var(--fips-primary)]',
        secondary:
          'border-transparent bg-[var(--fips-surface-muted)] text-[var(--fips-fg)]',
        success:
          'border-transparent bg-[var(--fips-success)]/14 text-[var(--fips-success-strong)]',
        warning:
          'border-transparent bg-[var(--color-fips-orange-100)] text-[var(--fips-accent-strong)]',
        danger: 'border-transparent bg-[var(--color-fips-red-100)] text-[var(--fips-danger)]',
        outline: 'border-[var(--fips-border)] bg-[var(--fips-surface)] text-[var(--fips-fg)]',
        info: 'border-transparent bg-[var(--color-fips-blue-200)]/65 text-[var(--fips-primary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
