import { DocHeaderStandardPreview } from "../src/components/layout/DocHeaderStandard";
import { HeaderDocSectionNav } from "../src/components/layout/HeaderDocSectionNav";
import {
  APP_MENU,
  filterMenuByPerfil,
  getActiveMenuGroup,
  headerChildNavItems,
  headerParentNavItems,
} from "../src/lib/appMenu";
import { cn } from "../src/lib/utils";

/** Path fixo só para a demo exibir faixa de subitens (ex.: grupo Produção). */
const DEMO_PATH = "/producao";
const perfil = "administrador";
const filteredMenu = filterMenuByPerfil(APP_MENU, perfil);
const demoActiveGroup = getActiveMenuGroup(DEMO_PATH, filteredMenu);
const childNav = demoActiveGroup ? headerChildNavItems(demoActiveGroup, perfil) : [];
const showChildNavRow = childNav.length > 0;
const parentNav = headerParentNavItems(filteredMenu);

/**
 * Demo do application shell — mesmo header padrão que a app (`DocHeaderStandard` / `Header`).
 * Imports relativos a `../src/...` (módulo em `client/tecnopano/`).
 */
export default function ApplicationShellDemo() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <DocHeaderStandardPreview
        groupLabel="Design System"
        pageTitle="Application Shell"
        sectionNav={
          <>
            {!showChildNavRow && <HeaderDocSectionNav menu={parentNav} bottomBorder="full" />}
            {showChildNavRow && (
              <HeaderDocSectionNav
                menu={childNav}
                bottomBorder="full"
                ariaLabel="Subseções da área atual"
              />
            )}
          </>
        }
        withCardChrome={false}
        footer={null}
      />
      <main className={cn("mx-auto max-w-4xl p-6")}>
        <p className="text-muted-foreground">
          Header padrão FIPS (<code className="text-foreground">DocHeaderStandardPreview</code> +{" "}
          <code className="text-foreground">HeaderDocSectionNav</code>). Rota:{" "}
          <code className="text-foreground">/shell-demo</code>
        </p>
      </main>
    </div>
  );
}
