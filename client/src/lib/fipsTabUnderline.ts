/**
 * Abas “underline” em páginas internas — mesma superfície clara `#EDF2F8` que DocHeaderSectionNav.
 */

export const fipsUnderlineTabBar =
  "flex w-full flex-nowrap items-stretch overflow-x-auto border-b border-[#D7E0EA] bg-[#EDF2F8] dark:border-white/[0.1] dark:bg-[#26262A] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--fips-border-strong)]/35 dark:[&::-webkit-scrollbar-thumb]:bg-white/12";

export const fipsUnderlineTabTriggerBase =
  "group inline-flex h-[52px] min-h-[52px] items-center gap-2.5 whitespace-nowrap border-b-[3px] border-transparent px-5 text-sm transition-[color,border-color] duration-150 sm:gap-3 sm:px-6 -mb-px box-border no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B9B]/30 dark:focus-visible:ring-[#F6921E]/35";

export const fipsUnderlineTabInactive =
  "font-medium text-[#6B7784] hover:text-[#334155] [&_svg]:text-[#9CA3AF] group-hover:[&_svg]:text-[#64748B] dark:text-[#A1A1AA] dark:hover:text-[#D4D4D8] dark:[&_svg]:text-[#71717A] dark:group-hover:[&_svg]:text-[#A1A1AA]";

export const fipsUnderlineTabActive =
  "border-[#F6921E] font-bold text-[#002A68] [&_svg]:text-[#F6921E] dark:border-[#F6921E] dark:text-[#E2E2E8] dark:[&_svg]:text-[#FDC24E]";
