import { FipsModulePageHero, type FipsModulePageHeroProps } from "@/composites/FipsModulePageHero";
import { TutorialContextual } from "./TutorialContextual";

export type PageHeaderProps = FipsModulePageHeroProps & {
  /** Nome da página para carregar tutorial contextual (ex: "coleta", "producao") */
  tutorialPage?: string;
};

/**
 * Cabeçalho de página de módulo — wrapper do padrão FIPS (`FipsModulePageHero`).
 * Fluxo recomendado: hero → KPIs (`StatsCard` / `FipsDataListingKpiCard`) → toolbar → tabela.
 */
export function PageHeader({ tutorialPage, actions, ...props }: PageHeaderProps) {
  const mergedActions = tutorialPage ? (
    <div className="flex items-center gap-2">
      <TutorialContextual pageName={tutorialPage} steps={[]} />
      {actions}
    </div>
  ) : actions;

  return <FipsModulePageHero {...props} actions={mergedActions} />;
}
