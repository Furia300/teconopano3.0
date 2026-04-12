# Módulo Coleta no Tecnopano 3.0 — início do fluxo (implementação)

**Objetivo:** tratar **Coleta** como o **primeiro passo** do fluxo de MP (pedido + agendamento), alinhado ao papel da Michele e ao que foi documentado nas notas 02–04.

## Comportamento da API (`POST /api/coletas`)

- **Sem** `dataChegada` → `status: pendente`, serviço: pedido sem data agendada.
- **Com** `dataChegada` → `status: agendado`, serviço: aguardando busca/chegada — **não** marca `recebido` na criação (correção do legado lógico em que data prevista gerava “recebido”).

`recebido` / `em_rota` devem ser definidos por ações posteriores (motorista, conferência no galpão), ainda a implementar conforme automação.

## UI

- **`/coleta`:** texto do `PageHeader` e botão enfatizam **pedido de coleta** e início do fluxo.
- **`NovaColetaDialog`:** título **Pedido de coleta**, campo **Data prevista (busca / chegada)**, galpões **Oceânica, Vicente, Nova Mirim, Goiânia** (`client/src/lib/galpoes.ts`).
- **Filtro de lista:** inclui **Em rota**; KPI “Em andamento” considera `em_rota`.

## Perfil `michele`

- Login com parte local do email **`michele`** (ex.: `michele@tecnopano.com`) resolve o perfil `michele` (`PERFIL_LOGIN_VALUES` no servidor).
- **Menu:** item próprio **Coleta**; grupo **Expedição** sem duplicar Coleta no submenu; **Pedidos, Motorista, Estoque, Clientes, Produtos**; sem **Dashboard** geral nem módulos admin.
- Após login e ao aceder `/`, **redireciona para `/coleta`**.

## Galpão (lane) — **tabela** + **dashboard** (paridade Bubble)

Quem opera no galpão (ex.: **Alane**) precisa de **duas entradas** na UX, como no Bubble: (1) **painel de indicadores** por etapa (planejamento, entrada, triagem/pesagem, Repanol, costureira, produção, estoque, expedição, finalizado) e (2) **tabela de coletas** com coluna **Status** que **muda** conforme o registo avança. Os contadores do painel e os valores da coluna Status devem vir da **mesma** regra de negócio (ver [32-lane-galpao-indicadores-status-e-tabela-coleta.md](./32-lane-galpao-indicadores-status-e-tabela-coleta.md)). O **administrador** deve ter vista **mais ampla** (agregação / multi-galpão — escopo a detalhar).

- **Menu:** o perfil `galpao` tem item **Coleta** no topo da sidebar (`/coleta`) para a tabela; **Dashboard** em `/` para o painel.
- **Pendência:** alinhar cartões do `DashboardGalpao` aos indicadores do Bubble e aos rótulos de status da tabela (incl. fases tipo **Repanol** como no print [33](../imagens/capturas-bubble/33-bubble-tabela-coleta-status-repanol.png)).

## Pendências (próximas iterações)

- Ação explícita “MP recebida” / “motorista saiu” → transições `agendado` → `em_rota` → `recebido`.
- Tela **estoque em card** para Michele (paridade Bubble).
- Campo **quem registrou** (`createdBy`) ligado à sessão.
