import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import {
  fipsUnderlineTabBar,
  fipsUnderlineTabInactive,
  fipsUnderlineTabTriggerBase,
} from '@/lib/fipsTabUnderline'

/** Abas por rota no header: `header-tabs.tsx` (mesmos tokens FIPS em `fipsTabUnderline.ts`). */

const Tabs = TabsPrimitive.Root

/** Lista estilo “segmentado” (painéis internos). */
const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex min-h-12 items-center justify-center gap-1 rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] p-1.5 text-[var(--fips-fg-muted)] shadow-[var(--shadow-field)]',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:ring-4 focus-visible:ring-[var(--fips-ring)]/20 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--fips-surface)] data-[state=active]:text-[var(--fips-primary)] data-[state=active]:shadow-[var(--shadow-card)]',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 rounded-2xl border border-[var(--fips-border)] bg-[var(--fips-surface)] p-6 shadow-[var(--shadow-card)] focus-visible:outline-none',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

/** Lista FIPS: linha base + traço 3px laranja no trigger ativo (navegação principal / filtros). */
const TabsListUnderline = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(fipsUnderlineTabBar, className)}
    {...props}
  />
))
TabsListUnderline.displayName = 'TabsListUnderline'

const TabsTriggerUnderline = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      fipsUnderlineTabTriggerBase,
      'min-w-0 flex-1 justify-center',
      fipsUnderlineTabInactive,
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:border-[#F6921E] data-[state=active]:font-bold data-[state=active]:text-[#002A68] data-[state=active]:[&_svg]:text-[#F6921E]',
      'dark:data-[state=active]:border-[#F6921E] dark:data-[state=active]:text-[#E2E2E8] dark:data-[state=active]:[&_svg]:text-[#FDC24E]',
      className,
    )}
    {...props}
  />
))
TabsTriggerUnderline.displayName = 'TabsTriggerUnderline'

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsListUnderline, TabsTriggerUnderline }
