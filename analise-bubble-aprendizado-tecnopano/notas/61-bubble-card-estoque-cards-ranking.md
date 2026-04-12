# Bubble — **Card** = vista alternativa do **Estoque** (cards + Ranking)

**Print:** [`../imagens/capturas-bubble/61-bubble-card-estoque-cards-ranking.png`](../imagens/capturas-bubble/61-bubble-card-estoque-cards-ranking.png)

**Origem (MCP):** menu **Card** → título da página **`Estoque - Card`** (mesma URL base de expedicao no Bubble; o item de menu apenas troca o componente visível).

**Surpresa #3** (depois de [Triagem](./59-bubble-triagem-painel-operador-status-servico.md) e [Motorista](./60-bubble-motorista-mesma-pagina-costureira-motorista.md)): **Card** **não** é cadastro de cartões/clientes/cards físicos — é uma **visualização em cards** do mesmo conteúdo do **Estoque**, com um botão `Ranking` por linha. Confirma que o nome do item de menu no Bubble é, em vários sítios, **enganador** (Triagem→painel operador; Motorista→costureira; Card→estoque visual).

---

## 1. Layout AS-IS

### 1.1 Cabeçalho de filtros (idêntico ao Estoque)

Mesmo conjunto de [58 §1.1](./58-bubble-estoque-listagem-filtros-retirar.md#11-cabeçalho-de-filtros): **DATA INICIAL**, **DATA FINAL**, **GALPÃO** (`Oceânica`/`Vicente`), **TIPO MATERIAL** (`Avental`/`Barreira De Contenção`), **ACABAMENTO** (`Corte-Reto`/`Overlock`), **COR** (`Florzinha`/`Variado`).

### 1.2 Cards (em vez da grelha)

Cada item de stock vira um **card** com 9 campos + 2 botões:

| Campo | Card 1 (pedido 43) | Card 2 (pedido 40) |
|-------|---------------------|---------------------|
| **Descrição do produto** | ` Tecnopano Fur 2.2, , , ` | ` Tecnopano Fur 2.2, , , ` |
| **ID** | 43 | 40 |
| **Tipo de pano** | Avental | Barreira De Contenção |
| **Data** | 11/04/26 | 19/01/26 |
| **Galpão** | Nova Mirim | Nova Mirim |
| **Acabamento** | **43** (?!) | **40** (?!) |
| **Medida** | P | 80 Cm |
| **Cor** | Florzinha | Variado |
| **Peso médio pct** | Barreira De Contenção (?!) | 3 |
| **Tipo material (header)** | Avental | Barreira De Contenção |

E dois botões por card (uids `12_31`, `12_32` no card 1; `12_52`, `12_53` no card 2) — provavelmente **Ranking** e outra acção (a explorar com clique no próximo MCP).

### 1.3 Bugs visíveis no template do card

**Campos cruzados** entre cards — claros indícios de **binding errado** no template Bubble:

1. `Acabamento` mostra **o ID do pedido** (43, 40), e **não** o valor real do acabamento (`Corte-Reto`, `Overlock`).
2. `Peso médio pct` mostra **`Barreira De Contenção`** (uma string!) no card 1, e `3` no card 2 — claramente o template está a buscar o campo errado da fonte de dados (ou faltam guards null).
3. `Descrição do produto` mostra `Tecnopano Fur 2.2, , ,` — a string com vírgulas vazias sugere concatenação de campos opcionais (`nome, tamanho?, cor?, acabamento?`) onde os opcionais estão vazios.

> Para o 3.0: serve de exemplo para **não** confiar em concatenações soltas de campos no template — usar **objetos tipados** (`producto.nome`, `producto.descricao`) e `null-coalescing` explícito na UI.

### 1.4 Botão `Ranking`

Existe um label `Ranking` por card. Hipóteses (a confirmar com clique numa próxima sessão):

1. **Ranking de stock** — quanto este SKU rota (popularidade / giro de estoque).
2. **Ranking de costureira** — quanto cada costureira produz desta peça (alinhar com [60 §1.3](./60-bubble-motorista-mesma-pagina-costureira-motorista.md#13-catálogo-de-costureiras-21-nomes-vistos-no-dropdown)).
3. **Ranking de fornecedor** — qual cliente compra mais desta peça.

Sem clique, fica em aberto.

---

## 2. Tecnopano 3.0 — direcção

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Visualização do Estoque** | Duas páginas separadas (`Estoque` grelha + `Card` cards) | Uma só rota `/estoque` com **toggle de view** (`grid` / `cards` / `kanban por status`) — não duplicar páginas. |
| **Bindings dos cards** | Acabamento mostra ID, peso médio mostra string aleatória | Componente `<ProductCard product={p} />` tipado, com testes de snapshot — bugs deste tipo capturados em CI. |
| **Botão Ranking** | Por card, comportamento desconhecido | Se for útil: dashboard **separado** com top-N por SKU/costureira/cliente, e não acção pendurada em cada card. |
| **`Tecnopano Fur 2.2`** | String hardcoded em todas as descrições | Campo `linhaProduto` ou `colecao` numa tabela de **catálogo de produtos** (alinhar com módulo Produtos — task pendente). |

---

## 3. Pendente

- [ ] Clicar em `Ranking` numa sessão futura para descobrir o que faz.
- [ ] Confirmar com utilizador se a vista Card é **usada** na operação ou se está abandonada (os bugs sugerem que pouca gente abre).
- [ ] Confirmar o significado de `Tecnopano Fur 2.2` — é versão de produto, linha de coleção, ou só nome interno?
