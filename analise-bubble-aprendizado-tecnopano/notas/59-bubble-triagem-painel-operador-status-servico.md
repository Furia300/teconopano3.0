# Bubble — **Triagem** abre o **PAINEL OPERADOR** (filtro por **STATUS DE SERVIÇO**)

**Print:** [`../imagens/capturas-bubble/59-bubble-triagem-painel-operador-status-servico.png`](../imagens/capturas-bubble/59-bubble-triagem-painel-operador-status-servico.png)

**Origem (MCP):** menu **Triagem** → URL `https://operation.app.br/version-test/painel_operador?debug_mode=true`.

**Surpresa:** clicar em **Triagem** no menu lateral **não** abre uma tela específica de triagem (como a §2.6 do popup de coleta em [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md)) — abre um **PAINEL OPERADOR** com filtros de pedido por status. Ou seja, “Triagem” no menu = **fila de trabalho do operador**, não a acção de triar.

---

## 1. Layout AS-IS

### 1.1 Filtros do painel

| Campo | Tipo | Observação |
|-------|------|------------|
| **DATA INICIAL** | date picker | default `11/04/2026` |
| **DATA FINAL** | date picker | default `11/04/2026` (intervalo só do dia) |
| **GALPÃO** | combobox | `Oceânica`, `Vicente` (mesma lista do Estoque, ver [58 §1.1](./58-bubble-estoque-listagem-filtros-retirar.md#11-cabeçalho-de-filtros)) |
| **STATUS DE SERVIÇO** | combobox | **lista completa documentada na §2** |
| **NOME DA EMPRESA** | listbox multi-select | filtro por fornecedor / cliente |

### 1.2 Tabela (com dados após scroll/refresh)

Colunas: `ID PEDIDO` · `DATA` · `EMPRESA` · `GALPÃO` · `STATUS`

Linhas observadas (página 1 de 4 — paginação `< 1 Pág. 4 >`):

| ID | Data | Empresa | Galpão | Status |
|----|------|---------|--------|--------|
| 43 | 11/04/26 | ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A. | **Nova Mirim** | **Produção** |
| 42 | 15/04/26 | ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A. | — | **Planejamento Coleta** |
| 41 | 19/01/26 | ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A. | — | Planejamento Coleta |
| 40 | 19/01/26 | ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A. | **Nova Mirim** | Produção |
| 39 | 02/12/25 | ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A. | — | Planejamento Coleta |
| 38 | 10/11/25 | **CHOCOLATE TEXTIL LTDA** | — | Planejamento Coleta |
| 37 | 10/11/25 | CHOCOLATE TEXTIL LTDA | — | Planejamento Coleta |
| 35 | 19/11/25 | ATMOSFERA … | — | Planejamento Coleta |
| 31 | 11/11/25 | ATMOSFERA … | — | Planejamento Coleta |
| 28 | 24/11/25 | ATMOSFERA … | — | Planejamento Coleta |

Notar que muitas linhas têm **galpão vazio** — confirma que `galpão` só é preenchido **depois** que o pedido sai do estado `Planejamento Coleta` e cai num galpão físico (Nova Mirim aparece como destino real, não estava no dropdown de filtro).

### 1.3 Achados imediatos da grelha

- **Empresas vistas:** `ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A.` (clientes principais) e `CHOCOLATE TEXTIL LTDA`. Cliente “ATMOSFERA” aparece em quase todos os pedidos — é provável **anchor customer** do galpão.
- **Galpão `Nova Mirim`** aparece nos dados, mas o **dropdown de filtro** só lista `Oceânica` e `Vicente`. **Inconsistência do Bubble:** existe um galpão real que o filtro não cobre. Para o 3.0: `client/src/lib/galpoes.ts` deve incluir Nova Mirim (Cursor já tem a lista canónica — confirmar).
- **Status reais visto na grelha:** `Planejamento Coleta` (não bate com `Planejamento` do filtro) e `Produção`. **Outra inconsistência:** o filtro mostra `Planejamento` mas o valor armazenado é `Planejamento Coleta`. Isto explica porque filtrar pelo dropdown pode dar zero resultados — o `value` do option não bate com o conteúdo da coluna.
- **Pedido 43** (`11/04/26`, `Nova Mirim`, `Produção`) bate com o lote do **Avental Corte-Reto P Florzinha** documentado em [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado) e [58 tabela](./58-bubble-estoque-listagem-filtros-retirar.md#12-tabela) — mesma data e contexto. **Confirma que ID PEDIDO no painel = ID coleta na produção.**
- Há paginação `< 1 / Pág. 4 >` → ~10 pedidos × 4 = ~40 pedidos no histórico total.

Há também um botão **PAINEL PRODUÇÃO** (atalho lateral) para navegar ao painel da nota 32.

---

## 2. Achado importante — **STATUS DE SERVIÇO** revela todo o pipeline

A lista do combobox dá, pela primeira vez vista de forma **explícita**, a sequência de estados que o Bubble usa para um pedido/lote ao longo do galpão:

| # | Status | Notas / mapa para o que já foi documentado |
|---|--------|---------------------------------------------|
| 1 | **Planejamento** | criação do pedido pela Michele ([03-inicio-pedido-coleta-michele.md](./03-inicio-pedido-coleta-michele.md)); estado inicial após cadastro coleta ([07-bubble-cadastro-coleta-modal.md](./07-bubble-cadastro-coleta-modal.md)) |
| 2 | **Chegada de Caminhão** | momento físico em que o caminhão chega ao galpão |
| 3 | **Descarregamento** | descarrega MP — ainda não pesado/triado |
| 4 | **Estocagem** | passa ao stock após receber/triar (ligação a [58-bubble-estoque-listagem-filtros-retirar.md](./58-bubble-estoque-listagem-filtros-retirar.md)) |
| 5 | **Costureira** | envio para costureira ([35-bubble-costureira-tabela-resumo-vs-popup-motorista.md](./35-bubble-costureira-tabela-resumo-vs-popup-motorista.md)) |
| 6 | **Produção** | em produção no galpão ([38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md)) |
| 7 | **Pausa** | estado de espera (sem detalhe ainda — confirmar com utilizador o que pausa) |
| 8 | **Finalizado** | encerramento do pedido |

> Estes 8 valores são **estados oficiais** do Bubble. **Não há** `Em Rota` (já adicionado por Cursor no 3.0 — ver `client/src/pages/coleta/ColetaList.tsx` no diff descrito em `git diff`), nem `Recebido`, nem `Em Separação` separado de `Estocagem`.

### 2.1 Comparação com o esquema actual do 3.0

| 3.0 (após patch Cursor uncommitted) | Bubble equivalente |
|-------------------------------------|---------------------|
| `pendente` | (sem equivalente — pedido criado sem data) |
| `agendado` | `Planejamento` |
| `em_rota` | (não existe no Bubble — gap a ganhar) |
| `recebido` | `Chegada de Caminhão` + `Descarregamento` (Bubble separa em 2 estados) |
| `em_separacao` | (parte do `Descarregamento`/`Estocagem`?) |
| `em_producao` | `Produção` |
| `finalizado` | `Finalizado` |

**Observação:** o Bubble tem **mais granularidade física** (Chegada/Descarregamento separados) e **trata Costureira como estado de pedido**, não como sub-fluxo paralelo. No 3.0 isto deve ser repensado: ou Costureira é estado, ou é flag adicional ortogonal ao status principal.

---

## 3. O que **não** está aqui (importante)

- **Triagem como acção física** (pesagem, separação por tipo, descarte) **não tem tela própria** no menu — só aparece dentro do popup do lote (§2.6 da [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md)).
- **Pausa** não tem documentação visual ainda — confirmar com utilizador *quando/quem* põe um pedido em pausa.

---

## 4. Tecnopano 3.0 — ideias

1. **Adoptar** os 8 status do Bubble como **vocabulário canónico** (ou justificar cada divergência) — hoje o 3.0 tem 7 valores e não cobre `Chegada de Caminhão`/`Descarregamento` de forma separada.
2. **`Pausa`** vira coluna `pausadoEm` + `pausadoPor` + `motivoPausa` + `pausadoAte`, não um status terminal — assim a transição volta para o status anterior automaticamente.
3. **`Triagem`** no menu do 3.0 deve ir para uma **tela própria** (não só popup), para ser usada por um operador que está só a triar a fila do dia — alinhado com como o utilizador disse que clicar em Triagem no Bubble cai num painel de pedidos por status.
4. Ligar **STATUS DE SERVIÇO** ao gráfico de funil/dashboard (vista admin/galpão) — alinhado com o requisito de dashboards de [41 §6](./41-tecnopano-30-producao-salas-gamificacao-rh.md#6-dashboards--produção-e-costureira-galpão-admin-e-colaboradores).

---

## 5. Pendente para confirmar

- [ ] O que distingue `Estocagem` (status de serviço) do **estoque físico** documentado em [58](./58-bubble-estoque-listagem-filtros-retirar.md)?
- [ ] `Pausa` — quem aciona, quando volta, há motivo registado?
- [ ] O atalho **PAINEL PRODUÇÃO** (botão visível no canto) é o mesmo painel do galpão da nota 32, ou outro?
- [ ] **Discrepância filtro vs dado:** dropdown lista `Planejamento`, dado armazenado é `Planejamento Coleta`. É bug do Bubble (texto vs option) ou são chaves diferentes (uma para serviço, outra para o pedido)?
- [ ] **Galpão `Nova Mirim`** existe nos dados mas não no filtro — está descontinuado, ou é input livre? Confirmar com utilizador (e adicionar/remover de `client/src/lib/galpoes.ts` no 3.0).
