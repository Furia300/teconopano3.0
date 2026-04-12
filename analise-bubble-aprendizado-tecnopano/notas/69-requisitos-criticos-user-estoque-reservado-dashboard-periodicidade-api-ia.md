# Requisitos críticos do utilizador (sessão 2026-04-11) — **mudança de galpão**, **stock reservado**, **dashboard de periodicidade**, **API IA**, **edição global**

> Esta nota **não documenta o Bubble AS-IS**. Documenta **5 requisitos de negócio** transmitidos pelo utilizador na sessão de 2026-04-11 que **não estão no Bubble** (alguns nem deveriam, são para o **3.0 obrigatoriamente**) e que **mudam o desenho** de vários módulos já documentados.

**Citação âncora:**

> «Atualmente no Bubble eles utilizam, mas eles **mudaram de galpão** maior. Por isto agora eles têm **espaço para estoque**. Ou seja, quando a Michele for fazer o pedido expedição para o galpão e selecionar o material, ela tem que **saber se tem algo disponível e não reservado** para pedir ao galpão. Aí o galpão só produz o **restante**, mas desde que **não esteja reservado**. E outra coisa, **se ele errar tem opção de editar** — não só ela como todos os colaboradores. E ele quer um **dashboard completo**: no dashboard dela vai ter **periodicidade de cada cliente** que faz pedido (alguns clientes pedem a cada **1 semana**, a cada **3 dias**, a cada **15 dias**, a cada **mês**) e deixar **programado por 1 ano** o pedido. E deixar uma **API aberta para ela ter uma IA que ajude no dia-a-dia** como **alertas, coisas pessoais e até mexer no sistema**. Esta API vai para **ela, financeiro e admin**. Aí não tem [no Bubble], mas inclui **porque eles contrataram e [precisamos] terminar a integração via API**.»

---

## 1. Requisito **R1** — Mudança para **galpão maior** com espaço de estoque real

### Contexto

A operação Tecnopano **mudou recentemente para um galpão maior**. Antes, o galpão antigo **não tinha espaço suficiente** para guardar produto pronto — ver [38 §4](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#4-contexto-operacional-porque-o-bubble-fica-aquém):

> *"Galpão antigo: pouco espaço e sem controlo de stock estruturado; processo manual tolerado com limitações. Galpão actual: maior capacidade e necessidade de divisão física/lógica por zona."*

Agora, no **galpão novo** ([42-galpao-novo-nomenclatura-salas-anexos.md](./42-galpao-novo-nomenclatura-salas-anexos.md)), há salas dedicadas a stock (anexo 11 — `52-galpao-stock-fardos-etiquetas-manuais.png`) que **fisicamente** permitem manter produto pronto entre encomendas.

### Implicação

Este é o **pré-requisito físico** para que R2 (stock disponível vs reservado) possa existir. Sem espaço para guardar produto, não havia o que reservar — toda produção saía direto para o cliente. Agora há **inventory** real no galpão, o que muda completamente a lógica de Expedição.

### Notas relacionadas

- [41-tecnopano-30-producao-salas-gamificacao-rh.md](./41-tecnopano-30-producao-salas-gamificacao-rh.md) — galpão novo (salas, gamificação)
- [42-galpao-novo-nomenclatura-salas-anexos.md](./42-galpao-novo-nomenclatura-salas-anexos.md) — anexos físicos (12 fotos das salas)
- [38 §4](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#4-contexto-operacional-porque-o-bubble-fica-aquém) — diferença entre galpão antigo e novo
- [58-bubble-estoque-listagem-filtros-retirar.md](./58-bubble-estoque-listagem-filtros-retirar.md) — vista actual do estoque no Bubble (sem zonas, sem reserva)

---

## 2. Requisito **R2** — Stock **disponível ≠ reservado** ao fazer o pedido de Expedição (Michele)

### Regra de negócio

Quando a **Michele** abre o menu **Expedição** ([66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md)) e selecciona o material para um novo pedido de cliente, ela precisa **ver imediatamente**:

| Coluna | Significado |
|--------|-------------|
| `qtdeTotalEstoque` | Quanto existe fisicamente no estoque do galpão |
| `qtdeReservada` | Quanto já está **prometido** a outros pedidos (ainda não saídos) |
| `qtdeDisponivel` | `qtdeTotalEstoque - qtdeReservada` — **o que ela pode usar agora** |

A regra: **o galpão só produz a diferença entre o pedido e o disponível**. Exemplo:

> Cliente BTM pede **100 kg** de Avental Verde G Corte-Reto.
> Stock total: **70 kg**.
> Reservado para outros pedidos: **30 kg**.
> **Disponível: 40 kg**.
> **Galpão precisa produzir: 100 - 40 = 60 kg** (não 100 - 70 = 30, porque os 30 reservados não contam).

### Estado actual no Bubble (gap absoluto)

O Bubble **não tem este conceito**. Na fila da Lane ([67 §5.4](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#54-achado-chave-deadlock-operacional-qtde-estoque--0)) a coluna `QTDE ESTOQUE` está **a zero em todas as 10 linhas observadas** — não distingue total vs reservado vs disponível, e na prática **nunca é populada**. Esta é a evidência observável do "**não tem rastreabilidade**" do utilizador.

### Modelo TO-BE para o 3.0

```sql
-- pseudo-schema
produtos_estoque (
  produto_id           int  -- FK produtos_variantes
  galpao_id            int  -- FK galpoes (Vicente, Oceânica, Nova Mirim, ...)
  zona_id              int  -- FK galpao_zonas (CORTE 01, ACABAMENTO, etc. — ver [42])
  qtde_total           numeric(10,3)
  ultima_atualizacao   timestamptz
)

produtos_reserva (
  id                   bigserial pk
  produto_id           int
  galpao_id            int
  pedido_item_id       int  -- FK pedido_cliente_item
  qtde_reservada       numeric(10,3)
  reservado_em         timestamptz
  reservado_por        int  -- FK users
  liberado_em          timestamptz null  -- preenchido quando vira embarque real
)

-- vista
produtos_disponivel AS
SELECT
  e.produto_id,
  e.galpao_id,
  e.qtde_total,
  COALESCE(SUM(r.qtde_reservada), 0)         AS qtde_reservada,
  e.qtde_total - COALESCE(SUM(r.qtde_reservada), 0) AS qtde_disponivel
FROM produtos_estoque e
LEFT JOIN produtos_reserva r
  ON r.produto_id = e.produto_id
 AND r.galpao_id = e.galpao_id
 AND r.liberado_em IS NULL
GROUP BY e.produto_id, e.galpao_id, e.qtde_total;
```

### Fluxo no formulário da Michele (`CADASTRAR pedido de expedição`)

1. Michele escolhe **cliente** (autocomplete em [65](./65-bubble-clientes-overlay-cnpj-razao-182-clientes.md))
2. Michele escolhe **produto** (autocomplete em [64](./64-bubble-produtos-registro-skus-peso-medio.md))
3. **UI mostra automaticamente**: `Disponível: 40 kg de 70 kg total (30 kg reservados)`
4. Michele introduz **qtde pedida** = 100 kg
5. **Sistema calcula automaticamente**:
   - **Reserva imediata** dos 40 kg disponíveis para este pedido
   - **Cria ordem de produção** ao galpão para os 60 kg restantes
   - Envia **dois eventos** ligados ao mesmo `PedidoItem`:
     - `EstoqueReservado(40 kg, pedidoItemId)`
     - `OrdemProducao(60 kg, pedidoItemId)`
6. Quando o galpão produz os 60 kg, o sistema **automaticamente** atualiza:
   - `EstoqueReservado(60 kg, pedidoItemId)` — soma à reserva
   - Pedido fica com **100 kg de 100 kg reservados** → pronto para `LIBERAR`

### Por que isto **resolve** o deadlock observado em 67 §5.4

Hoje, no Bubble, os 90 itens estão parados em "Pendente Aprovação" porque **não há link entre produção e estoque**, e **não há reserva**. A Lane vê `QTDE ESTOQUE = 0` mesmo havendo `KILOS REALIZADOS = 5.882 kg` ([67 §2](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#2-novo--indicadores-de-produção-confirma-os-5882-kg-de-38-31)) porque a produção **não foi atribuída a nenhum pedido**. Com R2, cada produção **já nasce** ligada a um `pedidoItem` específico, então a reserva é automática e a fila avança.

### Notas relacionadas

- [66 §3](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md#3-fluxo-end-to-end-com-base-na-narrativa-do-utilizador--observações-mcp) — fluxo da Michele
- [67 §5.4](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#54-achado-chave-deadlock-operacional-qtde-estoque--0) — deadlock actual
- [58](./58-bubble-estoque-listagem-filtros-retirar.md) — estoque actual sem zonas
- [68 §3.1](./68-fluxo-completo-michele-lane-financeiro-leinardo-motorista.md#31-falha-1--qtde-estoque--0-em-todas-as-90-linhas-deadlock-observável) — falha #1 do Bubble

---

## 3. Requisito **R3** — **Edição** disponível para todos os colaboradores

### Regra

> «Se ele errar [o pedido], tem opção de editar — **não só ela como todos os colaboradores**.»

Hoje no Bubble, a coluna `EDITAR` aparece na vista da Michele ([66 §2.3](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md#23-colunas-da-tabela)), no Financeiro ([62 §1.2](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md#12-colunas-da-tabela)) e talvez noutras telas — mas o utilizador quer **garantir** que:

1. **Todos os perfis** que veem um pedido podem editá-lo (não só Michele).
2. **Erro humano é esperado** e o sistema deve permitir correção sem burocracia (sem ticket, sem aprovação prévia para correção).

### Modelo TO-BE

| Camada | Decisão |
|--------|---------|
| **Permissões** | Cada perfil que tem `read` num pedido também tem `update`. **Excepção:** após `STATUS FINANCEIRO = Aprovado` ou `STATUS NOTA = Emitida`, edição requer **estorno** (segurança contábil). |
| **Auditoria** | Toda edição **logada** em `pedidos_audit (pedido_id, campo, valor_antigo, valor_novo, alterado_por, alterado_em)`. Visível na timeline do pedido. |
| **UI** | Ícone lápis em cada linha em todas as vistas (Michele/Lane/Financeiro/Leinardo). Drawer lateral com formulário, mantendo posição na fila. |
| **Concorrência** | Lock optimista (`updatedAt` no payload) para evitar 2 colaboradores sobrescreverem. |

### Tensão com R2 (reserva)

> Se a Michele edita a `qtde pedida` de 100 kg para 80 kg **depois** que o sistema reservou 40 kg + criou ordem de produção de 60 kg, o que acontece?

**Decisão sugerida:**

1. Sistema cancela a ordem de produção dos 60 kg (se ainda não iniciada)
2. Mantém a reserva dos 40 kg (já alocada)
3. Cria nova ordem de produção de **(80 - 40) = 40 kg**
4. Audita a mudança

Se a produção dos 60 kg **já foi iniciada**, o sistema **avisa** a Michele e pede confirmação ("já produzimos 30 kg dos 60 que pediu — quer manter? quer cancelar e perder?"). Não bloquear, **avisar**.

### Notas relacionadas

- [66 §2.3](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md#23-colunas-da-tabela) — coluna EDITAR existente no Bubble
- [62 §1.2](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md#12-colunas-da-tabela) — EDITAR no Financeiro

---

## 4. Requisito **R4** — Dashboard com **periodicidade de cliente** + **recorrência programada por 1 ano**

### Regra

> «No dashboard dela vai ter **periodicidade de cada cliente** que faz pedido. Alguns clientes pedem a cada **1 semana**, a cada **3 dias**, a cada **15 dias**, a cada **mês**. E deixar **programado por 1 ano** o pedido.»

A Michele quer:

1. **Visão histórica** da periodicidade de cada cliente (intervalo médio entre pedidos por cliente).
2. **Capacidade de programar** uma recorrência (ex.: BTM pede 100 kg de Avental Verde G **toda quarta-feira**) e o sistema **cria automaticamente** os pedidos correspondentes pelos próximos 12 meses.
3. **Editar/cancelar** uma recorrência específica sem afectar as outras.

### Modelo TO-BE

```sql
clientes_recorrencia (
  id                  bigserial pk
  cliente_id          int          -- FK clientes
  produto_id          int          -- FK produtos_variantes
  qtde                numeric(10,3)
  unidade             text         -- 'kg' | 'unidade'
  rota                text         -- 'A' .. 'S' | 'Spot' | 'Retire Aqui' | 'VLI' (ver [66 §2.1])
  intervalo_dias      int          -- 3, 7, 15, 30, ...
  proxima_data        date
  ate_quando          date         -- default: hoje + 1 ano
  ativo               bool default true
  criado_por          int
  criado_em           timestamptz
  observacoes         text
)

-- job diário (cron)
-- para cada recorrência ativa cuja proxima_data <= hoje:
--   cria PedidoCliente correspondente
--   atualiza proxima_data = proxima_data + intervalo_dias
--   se nova proxima_data > ate_quando, marca ativo = false
```

### KPIs do dashboard da Michele

| Cartão | O que mostra |
|--------|--------------|
| **Próximas recorrências** (7 dias) | Lista de pedidos que serão criados automaticamente nos próximos 7 dias |
| **Clientes mais frequentes** | Top 10 por número de pedidos / mês |
| **Periodicidade média** | Por cliente: intervalo médio entre pedidos (calculado do histórico) — destacar **anomalias** ("BTM costuma pedir a cada 7 dias mas não pede há 21") |
| **Recorrências ativas** | Total + breakdown por intervalo (semanal/quinzenal/mensal) |
| **Valor previsto (próximos 30 dias)** | Soma dos pedidos automaticamente criados, valorizados pelo `produto.preco` |
| **Clientes inactivos** | Quem não pede há > 2× a sua periodicidade média (alerta de churn) |

### Por que isto não existe no Bubble

O Bubble tem o calendário de coleta ([12 §1](./12-bubble-lane-calendario-e-painel-galpao-coleta.md#1-calendário--calendário-de-planejamento-de-coleta)) mas é **só visual** — não há job que cria pedidos automaticamente, e não há analytics de periodicidade do cliente. Tudo é **manual**.

### Tensão com R3 (edição)

Se a Michele edita uma recorrência **depois** de já terem sido criados pedidos (ex.: "BTM agora pede 120 kg, não 100"), o sistema deve perguntar:

- **Aplicar só aos próximos** (default — não mexe nos passados)
- Ou **aplicar a todos os pendentes** (incluindo já criados mas ainda não aprovados)

### Notas relacionadas

- [12 §1](./12-bubble-lane-calendario-e-painel-galpao-coleta.md#1-calendário--calendário-de-planejamento-de-coleta) — calendário Bubble actual (visual, sem automação)
- [65 §4](./65-bubble-clientes-overlay-cnpj-razao-182-clientes.md#4-universo-de-clientes-parcial) — clientes-âncora identificados (BTM, CET, Atlas, Titanium) — provavelmente são os de maior frequência
- [66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md) — onde a recorrência será criada/gerida

---

## 5. Requisito **R5** — **API IA** integrada (já contratada externamente — falta integrar)

### Regra

> «Deixar uma **API aberta para ela ter uma IA que ajude no dia-a-dia** como **alertas, coisas pessoais e até mexer no sistema**. Esta API vai para **ela, financeiro e admin**. Aí não tem [no Bubble], mas inclui **porque eles contrataram e [precisamos] terminar a integração via API**.»

### Decomposição

| Componente | O que faz |
|------------|-----------|
| **Provedor de LLM** | A empresa **já contratou** um serviço de IA. **Pendente:** confirmar com o utilizador qual provedor (Anthropic Claude API? OpenAI? Outra?). Como o utilizador disse "API" no singular e a colaboração actual é com Claude Code (Anthropic), **provável Anthropic Claude**. |
| **Acesso por perfil** | **3 perfis** com acesso ao agente IA: `michele` (Expedição), `financeiro`, `administrador`. Outros perfis não. |
| **Capacidades pedidas** | (1) **Alertas inteligentes** — ex.: "Cliente BTM costuma pedir há 21 dias e não pediu, ligar?"; (2) **Lembretes pessoais** — ex.: "Lembrar de assinar contrato Atmosfera amanhã"; (3) **Acções no sistema** — agente pode chamar a API do 3.0 para criar/editar pedidos, gerar relatórios, mudar status. |

### Modelo TO-BE para o 3.0

```
┌─────────────────────────────────────────────────────────────┐
│ FRONT-END (chat lateral + botão na sidebar do 3.0)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ /api/agente (endpoint do servidor 3.0)                      │
│   - autentica perfil (michele/financeiro/admin)             │
│   - recebe mensagem do user                                 │
│   - constrói contexto: pedidos do user, clientes, alertas   │
│   - chama Claude (Anthropic API) com tools                  │
│   - tools = funções do 3.0 (criar pedido, listar pedido,    │
│     editar pedido, marcar lembrete, etc.)                   │
│   - executa as tools que o LLM pediu                        │
│   - devolve resposta (texto + acções executadas)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude API (anthropic-sdk)                                  │
│   - modelo: claude-opus-4-6 ou claude-sonnet-4-6           │
│   - tool use ativo                                          │
│   - system prompt = papel do assistente Tecnopano           │
└─────────────────────────────────────────────────────────────┘
```

### Tools que o agente IA precisa ter (mínimo viável)

Para a **Michele**:
- `listarPedidosCliente(clienteId, ultimosNDias)`
- `criarPedidoExpedicao(clienteId, produtoId, qtde, rota, observacao)`
- `editarPedido(pedidoId, campos)`
- `verificarStockDisponivel(produtoId, galpaoId)` — usa R2
- `criarRecorrencia(clienteId, produtoId, qtde, intervaloDias)` — usa R4
- `listarAnomaliasPeriodicidade()` — usa R4
- `criarLembretePessoal(texto, data)`
- `listarLembretes()`

Para o **Financeiro**:
- `listarPedidosPendentesAprovacao()`
- `aprovarPedido(pedidoId)`
- `relatorioFaturamentoMensal(mes, ano)`

Para o **Admin**:
- Tudo do Michele e Financeiro
- `criarUtilizador(...)`, `editarPermissoes(...)`, `relatoriosGlobais(...)`

### Considerações de segurança (importantes)

1. **Auditoria:** toda chamada do agente que **mexe** no sistema deve ser logada com `user_id`, `tool_chamada`, `argumentos`, `resultado`, `timestamp`.
2. **Confirmação humana** para acções destrutivas (apagar pedido, cancelar recorrência grande, etc.) — o agente **propõe**, o utilizador **confirma**.
3. **Rate limit** para evitar custo desnecessário com LLM (e prevenir abuso/loop).
4. **Sandboxing** das tools — o agente só pode chamar funções **whitelisted**, nunca executar SQL/shell direto.
5. **Dados pessoais:** os "lembretes pessoais" da Michele **não** devem ir para outros perfis nem para o LLM como contexto global — só dela.

### Notas relacionadas (poucas — é assunto novo)

- [04-perfis-menu-michele-vs-admin.md](./04-perfis-menu-michele-vs-admin.md) — define os perfis que receberão a IA (`michele`, `administrador`, `financeiro`)
- [reference: rhid_api](../../) — memory `reference_rhid_api.md` — outra integração externa que o 3.0 precisa fazer (RH/ponto)

---

## 6. Sumário em uma frase por requisito

| ID | Requisito | Tipo | Notas afetadas |
|----|-----------|------|----------------|
| **R1** | Galpão maior agora tem espaço para estoque real (pré-requisito físico de R2) | Contexto operacional | [38 §4](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#4-contexto-operacional-porque-o-bubble-fica-aquém), [41](./41-tecnopano-30-producao-salas-gamificacao-rh.md), [42](./42-galpao-novo-nomenclatura-salas-anexos.md) |
| **R2** | Stock **disponível ≠ reservado** ao Michele criar pedido — galpão só produz a diferença | **Funcionalidade nova** | [58](./58-bubble-estoque-listagem-filtros-retirar.md), [66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md), [67 §5.4](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#54-achado-chave-deadlock-operacional-qtde-estoque--0), [68 §3.1](./68-fluxo-completo-michele-lane-financeiro-leinardo-motorista.md#31-falha-1--qtde-estoque--0-em-todas-as-90-linhas-deadlock-observável) |
| **R3** | Edição disponível para **todos** os colaboradores que veem o pedido (com auditoria) | Permissões | [66 §2.3](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md#23-colunas-da-tabela), [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md) |
| **R4** | Dashboard de **periodicidade de cliente** + **recorrência programada por 1 ano** | **Funcionalidade nova** | [12 §1](./12-bubble-lane-calendario-e-painel-galpao-coleta.md#1-calendário--calendário-de-planejamento-de-coleta), [65 §4](./65-bubble-clientes-overlay-cnpj-razao-182-clientes.md#4-universo-de-clientes-parcial), [66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md) |
| **R5** | **API IA** (já contratada) integrada para `michele`/`financeiro`/`administrador` com tools do sistema | **Integração nova** | [04](./04-perfis-menu-michele-vs-admin.md) |

---

## 7. Estado dos requisitos no Tecnopano 3.0 (uncommitted Cursor)

| Requisito | Existe no 3.0? | Onde |
|-----------|:--------------:|------|
| R1 (galpão maior) | ✅ contexto | Memory `project_tecnopano_sistema.md` |
| R2 (stock disponível ≠ reservado) | ❌ | **gap absoluto** — schema do Drizzle ainda não tem `produtos_estoque` nem `produtos_reserva` |
| R3 (edição global) | ⚠️ parcial | Existe `EDITAR` em algumas listas; falta auditoria centralizada |
| R4 (recorrência + dashboard) | ❌ | **gap absoluto** — não há tabela `clientes_recorrencia` nem job de criação automática |
| R5 (API IA) | ❌ | **gap absoluto** — não há endpoint `/api/agente`, não há SDK Anthropic instalado, não está claro qual provedor foi contratado |

---

## 8. Pendente para confirmar com o utilizador

- [ ] **Qual provedor de IA** foi contratado? (Anthropic Claude? OpenAI? Outra?). Confirmar para escolher SDK certo.
- [ ] No conceito de **reserva**, há prioridade entre pedidos? (ex.: cliente VIP reserva primeiro, ou ordem de chegada?)
- [ ] **Quanto tempo** uma reserva permanece válida sem confirmação? (24h? 7 dias? indefinido?)
- [ ] **Recorrência:** se a Michele cancelar um pedido criado automaticamente, a próxima ocorrência ainda nasce ou é pulada também?
- [ ] **Edição após aprovação financeira:** confirmar política — bloqueia edição, ou permite com aviso ao financeiro?
- [ ] **Lembretes pessoais da IA** ficam **dentro** do 3.0 (tabela própria) ou **fora** (Google Calendar / Notion)?
- [ ] A IA pode **ler email** da Michele (alguns alertas implicariam isso)? Ou só dados internos do 3.0?
- [ ] **Custo** da IA: há orçamento mensal, há rate limit por user?

---

## 9. Próximos passos sugeridos

1. **Confirmar provedor LLM** com o utilizador (acima)
2. Adicionar **migrations Drizzle** para `produtos_estoque`, `produtos_reserva`, `clientes_recorrencia`, `pedidos_audit` no `server/db/`
3. Criar endpoint `POST /api/expedicao/pedido` que:
   - Calcula `qtde_disponivel`
   - Cria reserva imediata + ordem de produção do restante
   - Devolve breakdown ao cliente
4. Adicionar coluna **Disponível** no select de produtos do form da Expedição (`client/src/pages/expedicao/NovoPedidoDialog.tsx` — a criar)
5. Esboçar `/api/agente/chat` com SDK Anthropic + 3 tools mínimas (`listarPedidos`, `criarPedido`, `criarLembrete`)
6. UI flutuante de chat na sidebar do 3.0 só para os 3 perfis autorizados
