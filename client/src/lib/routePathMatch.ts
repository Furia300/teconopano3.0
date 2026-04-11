/** `/clientes` considerado ativo em `/clientes/…`; `/` só com match exato. */
export function routePathMatches(loc: string, href: string): boolean {
  if (href === "/") return loc === "/";
  return loc === href || loc.startsWith(`${href}/`);
}
