import { ROUTE_PAGE_TITLE } from "@/lib/appMenu";

export { ROUTE_PAGE_TITLE };

export function titleForPath(pathname: string): string {
  if (pathname === "/") return "Início";
  if (ROUTE_PAGE_TITLE[pathname]) return ROUTE_PAGE_TITLE[pathname];
  const seg = pathname.replace(/^\//, "").split("/")[0];
  if (!seg) return "Início";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
