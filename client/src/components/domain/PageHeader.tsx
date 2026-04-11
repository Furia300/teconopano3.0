import { FipsModulePageHero, type FipsModulePageHeroProps } from "@/composites/FipsModulePageHero";

export type PageHeaderProps = FipsModulePageHeroProps;

/**
 * Cabeçalho de página de módulo — wrapper do padrão FIPS (`FipsModulePageHero`).
 * Fluxo recomendado: hero → KPIs (`StatsCard` / `FipsDataListingKpiCard`) → toolbar → tabela.
 */
export function PageHeader(props: PageHeaderProps) {
  return <FipsModulePageHero {...props} />;
}
