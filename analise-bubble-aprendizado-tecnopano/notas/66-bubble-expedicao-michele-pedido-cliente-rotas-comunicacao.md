# Bubble — **Expedição (Michele)** — pedido do cliente, rotas e comunicação com o galpão

**Prints:**

- **`66`** (fornecido pelo utilizador): [`../imagens/capturas-bubble/66-bubble-expedicao-michele-tabela-pedidos-cliente.png`](../imagens/capturas-bubble/66-bubble-expedicao-michele-tabela-pedidos-cliente.png)
- **`66b`** (captura MCP, mais campos visíveis — incl. `COMUNICAÇÃO`, `OBS ESCRITÓRIO`, botão `RESPONDER`, dropdown completo de rotas): [`../imagens/capturas-bubble/66b-bubble-expedicao-michele-mcp-rotas-comunicacao-responder.png`](../imagens/capturas-bubble/66b-bubble-expedicao-michele-mcp-rotas-comunicacao-responder.png)

**Origem (MCP):** menu **Expedição** (overlay sobre painel). **Não há rota de URL** — abre como FloatingGroup, à semelhança de Clientes ([65](./65-bubble-clientes-overlay-cnpj-razao-182-clientes.md)). Foi preciso `evaluate_script` com `dispatchEvent` para abrir.

> **Requisitos críticos do utilizador (sessão 2026-04-11) que mudam o desenho desta tela no 3.0** — ver [69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md):
>
> - **R2 — Stock disponível ≠ reservado:** ao seleccionar o material, a Michele deve ver `qtde_disponivel = qtde_total - qtde_reservada`; o galpão só produz a diferença. Resolve o deadlock observado em [67 §5.4](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#54-achado-chave-deadlock-operacional-qtde-estoque--0).
> - **R3 — Edição global:** todos os colaboradores que veem o pedido podem editá-lo (com auditoria) — não só a Michele.
> - **R4 — Recorrência por 1 ano:** dashboard com periodicidade de cada cliente + capacidade de **programar pedidos automáticos** (semanal, 3 dias, 15 dias, mensal) por 12 meses.
> - **R5 — API IA:** Michele tem acesso a um agente IA (provedor já contratado) que pode ler/criar/editar pedidos e dar alertas inteligentes/lembretes pessoais.

---

## 1. Quem usa esta tela e para quê

Confirmado pelo utilizador:

> A **Expedição** é a área que pede a matéria-prima ao motorista, mas **hoje não está optimizado**. A Expedição (= a colaboradora **Michele**) faz o **pedido para o galpão produzir** conforme esta tabela. A tabela de Expedição da colaboradora **Lane (Galpão, parte operacional)** aprova quando está pronto ([67](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md)). O **Financeiro** ([62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md)) só libera a carga quando aprova; o **Leinardo (Emissão de Nota** — [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md)**)** emite a nota e manda o motorista entregar ao cliente conforme a **rota A→S** + 3 rotas especiais. **No Bubble não tem automação directa nem rastreabilidade.**

Esta nota corrige uma confusão das notas anteriores: **a Michele não é só do módulo Coleta** ([03-inicio-pedido-coleta-michele.md](./03-inicio-pedido-coleta-michele.md)) — ela orquestra também a **Expedição**:

| Acção da Michele | Tela | Documentado em |
|------------------|------|----------------|
| Pede MP ao fornecedor (Atmosfera, Chocolate Têxtil) | **Coleta** | [03](./03-inicio-pedido-coleta-michele.md), [07](./07-bubble-cadastro-coleta-modal.md) |
| **Recebe pedido do cliente** (BTM, CET, Atlas, Titanium) e **registra** para o galpão produzir | **Expedição** | esta nota |

---

## 2. Layout AS-IS

### 2.1 Filtros

| Campo | Tipo | Notas |
|-------|------|-------|
| **DATA ENTREGA** | date picker | só uma data — não é intervalo (gap UX) |
| **STATUS ENTREGA** | combobox | 2 valores: `Pendente`, `Liberado` |
| **ROTA** | combobox | **22 valores: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S + Rota Spot + Rota Retire Aqui + Rota VLI** |
| **ID CLIENTE** | input | |
| **EMPRESA** | search box | |

> **Rotas oficiais Bubble:** o utilizador descreveu como "rota A a Z", mas o dropdown só vai até **`S`** — apenas **19 letras** (não 26), mais 3 rotas especiais. **Rotas que não existem:** T, U, V, W, X, Y, Z. Para o 3.0: confirmar se é decisão de produto (max 22 rotas) ou se T-Z foram removidas/nunca usadas.

### 2.2 Botão de topo

**`CADASTRAR`** (modal não aberto nesta sessão — provavelmente abre o form de novo pedido para Michele preencher).

### 2.3 Colunas da tabela

`DATA CRIAÇÃO` · `DATA ENTREGA` · `ROTA` · `PESO MÉDIO (TARA)` · `ID` · `QTDE PEDIDO` · `UNIDADE DE MEDIDA` · `STATUS ENTREGA` · `STATUS FINANCEIRO` · `OBS GALPÃO` · **`COMUNICAÇÃO`** · **`OBS ESCRITÓRIO`** · `Usuário` · `ID CLIENTE` · `CNPJ` · `EMPRESA` · `TIPO MATERIAL` · `MEDIDA` · `ACABAMENTO` · `COR` · `EDITAR`

> **Diferença vs imagem `66` do user (com 10 colunas):** o MCP mostra **+5 colunas**: `COMUNICAÇÃO`, `OBS ESCRITÓRIO`, `EDITAR` e o segmento `Usuário/ID CLIENTE/CNPJ/...` que está num **bloco lateral colapsado** na imagem. A tela é **muito mais larga** do que o user vê no monitor dele.

### 2.4 Acção por linha — botão **`RESPONDER`**

Cada linha tem um botão **`RESPONDER`** ao lado do `OBS GALPÃO` — confirma que a tela é **bidireccional**: a Lane do galpão escreve em `OBS GALPÃO` e a Michele responde via `OBS ESCRITÓRIO` / `COMUNICAÇÃO`. É um **chat embutido na linha do pedido**, sem histórico estruturado.

### 2.5 Linhas observadas (10 linhas, paginação `1 a   de 90` — bug Bubble: o número intermediário não renderiza)

| ID | Criação | Entrega | Rota | Tara | Qtde | Unid. | StEntr | StFin | OBS Galpão | Cliente | Tipo |
|----|---------|---------|------|------|------|-------|--------|-------|------------|---------|------|
| 95 | 06/02/26 | 06/02/26 | L | 5kg | 5.00 | Kilo | Pendente | Pendente Aprovação | "teste 255" | CET | Avental G Verde |
| 94 | 06/02/26 | 20/02/26 | N | 55kg | 55.00 | Kilo | Pendente | Pendente Aprovação | "55" | BTM | Avental G Verde |
| 93 | 06/02/26 | 11/02/26 | O | 3kg | 3.00 | Kilo | Pendente | Pendente Aprovação | "3" | BTM | Avental GG Verde |
| 92 | 06/02/26 | 06/02/26 | P | 258kg | 258.00 | Kilo | Pendente | Pendente Aprovação | "258" | BTM | Avental G Verde |
| 91 | 06/02/26 | 12/02/26 | M | 11kg | 11.00 | Kilo | Pendente | Pendente Aprovação | "11" | Atlas | Avental GG Verde |
| 90 | 06/02/26 | — | N | 50kg | 25 | Unidade | Pendente | Pendente Aprovação | **"2555"** | BTM | TNT 30x30 Branco |
| 89 | 06/02/26 | 10/02/26 | E | 1130kg | 565 | Unidade | Pendente | Pendente Aprovação | "1130" | BTM | TNT 30x30 Branco |
| 88 | 06/02/26 | — | O | 55kg | 55.00 | Kilo | Pendente | Pendente Aprovação | "55" | Titanium | Avental M Verde |
| 87 | 06/02/26 | 15/02/26 | N | 72,5kg | 25 | Unidade | Pendente | Pendente Aprovação | "72,5" | BTM | GSY 30x30 Branco |
| 86 | 06/02/26 | 20/02/26 | M | 574kg | 574.00 | Kilo | Pendente | Pendente Aprovação | "574" | Atlas | Avental G Verde |

### 2.6 Achados sobre `OBS GALPÃO`

- A maioria das `OBS GALPÃO` é **só um número** que **bate exactamente** com a `QTDE PEDIDO` ou com o `PESO MÉDIO (TARA)`. Ou seja, a Lane está a usar o campo **livre** para repetir a quantidade — provavelmente porque há **alguma regra de validação** por trás (ex.: "confirmação de leitura" antes de aceitar produzir).
- **Excepções:**
  - Pedido **95**: `"teste 255"` — texto livre claramente de teste
  - Pedido **90**: `"2555"` — número que **não bate** com qtde (25 unidades) nem com peso (50 kg). Possível erro de digitação ou unidade diferente.
- **Para o 3.0:** este campo é **estruturado** disfarçado — separar em (a) confirmação numérica obrigatória e (b) texto livre opcional, em vez de uma única caixa que mistura tudo.

### 2.7 `PESO MÉDIO (TARA)`

A coluna chama-se **PESO MÉDIO (TARA)**. **TARA** no contexto industrial = peso da embalagem vazia (sem o conteúdo). Mas aqui parece estar a guardar o **peso esperado total** do pedido, não a tara real. Possíveis interpretações:

1. Peso médio do produto × quantidade = peso esperado de envio (tara + carga).
2. Apenas a tara (embalagem) — mas então 1130 kg de tara para 565 unidades de TNT 30×30 é ~2 kg/un de tara, o que é **enorme** para um saco de TNT. Improvável.
3. Peso total (tara + produto) = mais coerente.

> **Pendente:** confirmar com utilizador o que `TARA` significa nesta coluna. Se for "peso total esperado", mudar o label no 3.0 para `PESO TOTAL ESPERADO`.

---

## 3. Fluxo end-to-end (com base na narrativa do utilizador + observações MCP)

```
┌─ MICHELE (Expedição) ─────────────────┐
│ 1. Cliente liga/email a pedir produto │
│ 2. Michele cria linha aqui (CADASTRAR)│
│    → STATUS ENTREGA = Pendente        │
│    → STATUS FINANCEIRO = Pendente Aprov│
│    → ROTA atribuída (A-S, Spot, Retire│
│       Aqui, VLI)                      │
│ 3. Linha aparece em todos os painéis: │
└─────────────┬─────────────────────────┘
              │
              ▼
┌─ LANE (Galpão, painel operacional) ───┐  ← nota 67
│ vê linha em PAINEL DE CONTROLE GALPÃO │
│ + indicador de funil (PRODUÇÃO 13)    │
│ + STATUS DE SERVIÇO actualizado pelo  │
│   fluxo Coleta → … → Estoque          │
│ Comunica com Michele via OBS GALPÃO/  │
│ RESPONDER (chat-na-linha)             │
│ Quando produção pronta → clica LIBERAR│
│ → STATUS ENTREGA: Pendente → Liberado │
└─────────────┬─────────────────────────┘
              │
              ▼
┌─ FINANCEIRO ──────────────────────────┐  ← nota 62
│ vê a fila em "Pendente Aprovação"     │
│ valida valor, condições comerciais    │
│ clica APROVAR                         │
│ → STATUS FINANCEIRO: Pendente → Aprov │
└─────────────┬─────────────────────────┘
              │
              ▼
┌─ LEINARDO (Emissão Nota) ─────────────┐  ← nota 63
│ vê fila já aprovada                    │
│ emite NF (externamente, não no Bubble) │
│ regista Nº NOTA FISCAL + DATA EMISSÃO  │
│ → STATUS MISSÃO NOTA: Pendente → ?     │
└─────────────┬─────────────────────────┘
              │
              ▼
┌─ MOTORISTA ───────────────────────────┐  ← nota 60 §1
│ recebe ordem para entregar             │
│ rota da letra (A-S) define o circuito  │
│ NÃO há cadastro de motorista no Bubble │
│ NÃO há registo de chegada/assinatura   │
│   no cliente                           │
└────────────────────────────────────────┘
```

> **Observação crítica do utilizador:** **"no Bubble, não tem automação direito. Não tem rastreabilidade."** Esta é a **falha estruturante** que justifica o 3.0.

---

## 4. Tecnopano 3.0 — direcção (TO-BE)

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Página vs overlay** | Floating sem rota | Página `/expedicao` (Cursor já tem o item no menu) com filtros, tabela e modal de criação. |
| **Pedido = item solto** | Cada linha = 1 SKU | `PedidoCliente` (cabeçalho com cliente, data, rota) + `PedidoItem[]` (linhas SKU). Permite NF agregada por pedido, não por SKU. |
| **OBS GALPÃO ≡ chat** | Texto livre | Tabela `comunicacoes_pedido` (sender, message, timestamp, leitura). |
| **`Pendente Aprovação` em todo lado** | Status duplicado em 3+ tabelas | Estado **único** `pedidoStatusFinanceiro` referenciado pelas vistas de Michele/Lane/Financeiro/Leinardo. |
| **Rotas A-S** | Letras soltas no dropdown | Tabela `rotas` (id, nome, motorista, cidades cobertas, dia da semana, ordem de visita). |
| **Sem assinatura cliente** | Nenhum registo | App de motorista (PWA) com captura de assinatura + foto + GPS na entrega. |
| **`PESO MÉDIO (TARA)`** | Label ambíguo, talvez errado | Label claro (`Peso esperado de envio`) + auto-cálculo (qtde × `produto.pesoMedio`). |
| **22 rotas hardcoded** | Letras + 3 nomes especiais | Rotas configuráveis na admin; legacy `letra` mantida para migração. |
| **Sem RH no Bubble** | Inexistente | Cursor já adicionou `motorista`, `costureira`, `rh`, `producao`, `separacao` como perfis em `server/routes.ts` (ver estado uncommitted documentado). |

---

## 5. Pendente para confirmar

- [ ] Abrir o modal **`CADASTRAR`** numa próxima sessão para ver os campos do form de Michele.
- [ ] Significado real de `PESO MÉDIO (TARA)` (peso só, peso + tara, ou tara só).
- [ ] Por que o dropdown de rotas só vai até `S`? Há histórico de rotas T-Z que foram removidas?
- [ ] Como `Rota Spot`, `Rota Retire Aqui` e `Rota VLI` se diferenciam das letras?
- [ ] O botão `RESPONDER` por linha abre um modal de chat ou só um input simples?
- [ ] No 3.0, a Michele vai **continuar** a usar a Coleta (do fornecedor) **e** a Expedição (do cliente), ou estas devem ser papéis separados?
