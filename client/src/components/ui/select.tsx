import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FieldDensity } from './field'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  leftIcon?: React.ReactNode
  icon?: React.ReactNode
  density?: FieldDensity
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, leftIcon, icon, density = 'default', ...props }, ref) => {
    const startIcon = leftIcon ?? icon
    return (
      <div className="relative w-full">
        {startIcon ? (
          <span
            className={cn(
              'pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[var(--fips-fg-muted)]',
              density === 'compact'
                ? 'left-3 [&_svg]:h-3.5 [&_svg]:w-3.5'
                : 'left-4 [&_svg]:h-4 [&_svg]:w-4',
            )}
          >
            {startIcon}
          </span>
        ) : null}
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border border-[var(--fips-border)]/60 bg-[var(--fips-surface)] text-[var(--fips-fg)] transition-all duration-200 hover:border-[var(--fips-border)]/80 focus-visible:border-[var(--fips-primary)] focus-visible:ring-2 focus-visible:ring-[var(--fips-primary)]/20 focus-visible:outline-none data-[state-preview=focused]:border-[var(--fips-primary)] data-[state-preview=focused]:ring-2 data-[state-preview=focused]:ring-[var(--fips-primary)]/20 data-[state-preview=focused]:outline-none disabled:cursor-not-allowed disabled:bg-[var(--fips-surface-muted)] disabled:text-[var(--fips-fg-muted)] disabled:opacity-70 aria-[invalid=true]:border-[var(--fips-danger)]/70 aria-[invalid=true]:focus-visible:border-[var(--fips-danger)] aria-[invalid=true]:focus-visible:ring-2 aria-[invalid=true]:focus-visible:ring-[var(--fips-danger)]/20 aria-[invalid=true]:data-[state-preview=focused]:border-[var(--fips-danger)] aria-[invalid=true]:data-[state-preview=focused]:ring-2 aria-[invalid=true]:data-[state-preview=focused]:ring-[var(--fips-danger)]/20',
            density === 'compact'
              ? 'h-9 px-3 text-sm leading-none shadow-sm'
              : 'h-12 px-4 text-[1.08rem] shadow-sm',
            startIcon && (density === 'compact' ? 'pl-9' : 'pl-11'),
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--fips-fg-muted)]',
            density === 'compact' ? 'right-3 h-3.5 w-3.5' : 'right-4 h-4 w-4',
          )}
          aria-hidden
        />
      </div>
    )
  },
)
Select.displayName = 'Select'

export { Select }
