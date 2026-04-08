import * as React from 'react'
import { cn } from '@/lib/utils'
import type { FieldDensity } from './field'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  density?: FieldDensity
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, density = 'default', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full resize-y rounded-xl border border-[var(--fips-border)]/60 bg-[var(--fips-surface)] text-[var(--fips-fg)] transition-all duration-200 placeholder:text-[var(--fips-fg-muted)] placeholder:opacity-100 hover:border-[var(--fips-border)]/80 focus-visible:border-[var(--fips-primary)] focus-visible:ring-2 focus-visible:ring-[var(--fips-primary)]/20 focus-visible:outline-none data-[state-preview=focused]:border-[var(--fips-primary)] data-[state-preview=focused]:ring-2 data-[state-preview=focused]:ring-[var(--fips-primary)]/20 data-[state-preview=focused]:outline-none disabled:cursor-not-allowed disabled:bg-[var(--fips-surface-muted)] disabled:text-[var(--fips-fg-muted)] disabled:opacity-70 aria-[invalid=true]:border-[var(--fips-danger)]/70 aria-[invalid=true]:focus-visible:border-[var(--fips-danger)] aria-[invalid=true]:focus-visible:ring-2 aria-[invalid=true]:focus-visible:ring-[var(--fips-danger)]/20 aria-[invalid=true]:data-[state-preview=focused]:border-[var(--fips-danger)] aria-[invalid=true]:data-[state-preview=focused]:ring-2 aria-[invalid=true]:data-[state-preview=focused]:ring-[var(--fips-danger)]/20',
          density === 'compact'
            ? 'min-h-[92px] px-3 py-2 text-sm shadow-sm'
            : 'min-h-[132px] px-4 py-3 text-[1.02rem] shadow-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
