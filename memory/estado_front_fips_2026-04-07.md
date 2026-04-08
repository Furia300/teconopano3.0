# Estado do front — Tecnopano 3.0 / FIPS (referência interna)

**Atualizado:** 2026-04-08  
**Projeto:** raiz do repositório (`origin` → `https://github.com/Furia300/teconopano3.0.git`)

**Backup local de ambiente:** cópia do `.env` do projeto (não versionada) em  
`../memory/teconopano3.0.env.backup-2026-04-08` dentro da pasta de trabalho `tecnopano/`.  
Template seguro: `teconopano3.0/.env.example` (versionado).

## Commit de referência (UI FIPS / RH / motorista)

- `e911ce9` — *docs(memory): referência do commit fd78d4e (Ponto diário)*
- `fd78d4e` — *fix(rh): Ponto diário — filtros, FIPS e build do servidor*
- `a35e0f9` — *feat(ui): RH Data List FIPS, motorista e ajustes de layout*
- `d25765d` — *docs: referência FIPS/RH e front em memory/*
- `ac002d6` — *fix(ui): hero FIPS — PageHero com gradiente DS e JunctionLines; dashboard admin alinhado; docs memory*

## Hero navy FIPS (PageHero + Painel admin)

- **`client/src/composites/PageHero.tsx`:** gradiente institucional único `135deg #004B9B → #002A68 → #001A4A`; sem vinheta `from-black/25`; decoração **`FipsJunctionLines`** (trilhos do demo).
- **`client/src/pages/dashboard/DashboardAdmin.tsx`:** header “Painel operacional” com o mesmo navy FIPS, raio `12px 12px 12px 24px`, sombra e JunctionLines (não usar cinza no dark só no hero).
- Export: `FipsJunctionLines` em `client/src/composites/index.ts`.

## Decisões / padrões que importam

1. **Design system FIPS** integrado em `client/` com tokens `--fips-*` em `client/src/styles/globals.css`. Não alterar por padrão: **paleta do botão principal Tecnopano**, **sidebar** e **tela de login** (regras do produto).
2. **Página RH / Colaboradores** (`client/src/pages/funcionarios/FuncionariosList.tsx`) segue o fluxo do demo **Data List** do repositório FIPS: *Header → KPIs → Toolbar única → Card de tabela com header obrigatório (ícone, título, subtítulo, Filtrado, Configurar)*.
3. **KPIs** no padrão demo: `client/src/components/domain/FipsDataListingKpiCard.tsx` (raio `10px 10px 10px 18px`, ícone top-right, delta com seta, sparkline com área em gradiente e hover).
4. **Menu lateral:** RH pai de Funcionários; Configurações pai de Usuários; Expedição com Coleta/Estoque/Motorista; Financeiro com NF; Produção com filhos definidos. Ver `client/src/components/layout/Sidebar.tsx`.
5. **Motorista:** `DashboardMotorista`, rota `/motorista`, `MotoristaList.tsx`; perfil `motorista` em `client/src/pages/Dashboard.tsx`.
6. **Layout:** `AppLayout` usa estado de hover do sidebar para evitar sobreposição do conteúdo quando o menu expande no hover.
7. **Header:** toggle claro/escuro; ícone alinhado à cor dos ícones do sidebar em um dos ajustes.
8. **Tabela admin:** menu de colunas em `client/src/components/ui/admin-listing.tsx` (popover com **z-50**).
9. Ver secção **Hero navy FIPS** acima.

## Referência externa DS

- Padrão Data List: `Design-system-FIPS` → `src/docs/pages/patterns/DataListingDemo.tsx`

## Porta dev

- Cliente Vite: porta **3002** (`vite.config.ts`).

## Ponto diário (`/ponto-diário`)

- **`client/src/pages/rh/PontoDiario.tsx`:** listagem estilo Data List FIPS (hero + toolbar + card de tabela); colunas extras Apuração / Cálculo / Ajuste; persistência de colunas em `localStorage` (`tecnopano-ponto-diario-prefs-v1`); filtro por nome/PIS com painel **Mostrar/Ocultar filtros** (chips de resumo + busca no mesmo bloco); paginação `AdminTablePagination`; simulação de horários por dia; merge opcional com `/api/colaboradores`.
- **Build servidor:** `tsconfig.server.json` inclui só `server/` (evita TS6059 com `shared/`); **`server/routes.ts`:** normalização de `req.params.depto` para `string` antes de `toLowerCase()`.
