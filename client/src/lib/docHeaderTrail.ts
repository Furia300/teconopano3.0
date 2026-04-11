import type { AppMenuItem } from "@/lib/appMenu";
import { titleForPath } from "@/lib/headerNav";
import { routePathMatches } from "@/lib/routePathMatch";

/**
 * Trilho estilo DocLayout: grupo (ex. Produção) + página atual (ex. Separação).
 */
export function docTrailForPath(pathname: string, menu: AppMenuItem[]): { groupLabel: string; pageTitle: string } {
  for (const item of menu) {
    if (item.href && !item.children?.length) {
      if (routePathMatches(pathname, item.href)) {
        const pageTitle = item.href === "/" ? "Visão geral" : item.label;
        return { groupLabel: "Início", pageTitle };
      }
    }
    if (item.children?.length) {
      const child = item.children.find((c) => c.href && routePathMatches(pathname, c.href));
      if (child) {
        const pageTitle = child.label === item.label ? "Visão geral" : child.label;
        return { groupLabel: item.label, pageTitle };
      }
    }
  }
  return { groupLabel: "Início", pageTitle: titleForPath(pathname) };
}
