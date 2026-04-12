# Tabela Bubble — painel do galpão (chegada de matéria-prima)

**Origem:** app Tecnopano no Bubble (`operation.app.br`), elemento inspecionado no preview.

**Imagem:** `../imagens/bubble-tabela-acoes-pedido.png`

## Contexto (negócio) — confirmado pelo time

- **Quem usa:** a **lane do galpão** (operacional do armazém).
- **Para quê:** **visualizar a chegada da matéria-prima** (entradas / movimentos que interessam ao galpão), em cima da **tabela de Expedição** no Bubble (mesmo tipo ou mesma lista que o app chama de expedição — hoje a UI é **funcional porém feia**).
- **Implicação para o 3.0:** no Tecnopano novo, esse fluxo pode virar uma tela dedicada **“Galpão — entradas / MP”** (ou reaproveitar dados de coleta + estoque + expedição) com **UX melhor**, sem perder colunas que o galpão já usa para decidir **LIBERAR** e acompanhar status.
- **Upstream do fluxo:** a coleta é **pedida e agendada pela colaboradora Michele**; em **~90%** dos casos o **motorista próprio da Tecnopano** é quem **busca** a MP. Ver [02-fluxo-coleta-mp-motorista.md](./02-fluxo-coleta-mp-motorista.md).

## Container (DOM)

- **Classe Bubble:** `bubble-element Group coaXkr1 bubble-r-container flex column`
- **Caminho resumido:** `Page.main-page` → grupos aninhados até o `Group` que envolve a tabela.
- **Texto visível no grupo (cabeçalhos):** lista completa de colunas abaixo.

## Colunas (ordem lógica)

| Coluna Bubble | Observação na UI |
|---------------|------------------|
| **AÇÕES** | Botão vermelho **LIBERAR** (ícone de cadeado) por linha — libera etapa / pedido. |
| **DATA CRIAÇÃO** | Ex.: `06/02/26` |
| **DATA ENTREGA** | Prazo / data prevista de entrega |
| **ROTA** | Código curto (ex.: M, N, Q) + contexto de logística |
| **PESO MÉDIO (TARA)** | Peso em Kg (tara / média) |
| **LOGÍSTICA** | *(presente no `visible_text` do nó; confirmar rótulo exato na captura)* |
| **ID** | Identificador numérico do registro |
| **QTDE PEDIDO** | Quantidade pedida (decimal) |
| **QTDE ESTOQUE** | Estoque disponível; **0 em vermelho** nas linhas visíveis |
| **UNIDADE DE MEDIDA** | **Kilo** ou **Unidade** |
| **STATUS ENTREGA** | Ex.: **Pendente** (indicador vermelho) + botão laranja (ação circular) |
| **STATUS FINANCEIRO** | Trilha financeira do pedido |
| **STATUS MISSÃO** | Estado operacional da “missão” / execução |
| **NOTA** | NF / referência fiscal |
| **OBS ESCRITÓRIO** | Observação back-office |
| **COMUNICAÇÃO** | Canal / registro de comunicação com cliente ou interno |
| **OBS GALPÃO** | Observação do galpão *(texto no DOM pode truncar como “OBS GALPÃ”)* |

## Comportamento inferido

- Painel é a **visão operacional do galpão** sobre linhas ligadas à **expedição** (nomenclatura Bubble), focada em **acompanhar chegada de MP** e trâmites associados.
- **LIBERAR** atua como **gate manual** por linha (ex.: liberar após conferência, financeiro, ou próxima etapa — validar regra exata no Bubble).
- **QTDE ESTOQUE** em vermelho quando **0** reforça decisão no galpão (“não tem no armazém” / aguardando entrada).
- **Status entrega** + **status financeiro** + **status missão** → três eixos de estado visíveis na mesma grade (pesado para operação + escritório).
- Barra **Debugger** no rodapé → ambiente **version-test** / desenvolvimento.

## Relação com Tecnopano 3.0 (repo atual)

O galpão hoje no 3.0 tem **dashboard** e fluxos de **coleta / separação / produção**; **não** há ainda uma tabela “cara feia” espelhando essa grade 1:1. O mock de **`/api/expedicoes`** cobre **parte** dos mesmos dados que essa visão consome no Bubble:

| Bubble | Campo / conceito 3.0 (mock) |
|--------|-------------------------------|
| DATA CRIAÇÃO | `createdAt` |
| ROTA | `rota` |
| QTDE PEDIDO | `qtdePedido` |
| UNIDADE DE MEDIDA | `unidadeMedida` |
| STATUS ENTREGA | `statusEntrega` |
| STATUS FINANCEIRO | `statusFinanceiro` |
| NOTA | `notaFiscal`, `statusNota` |
| OBS ESCRITÓRIO / OBS GALPÃO | `observacaoEscritorio`, `observacaoGalpao` |
| PESO / material | `kilo`, `kiloSolicitada`, `tipoMaterial`, `descricaoProduto`, etc. |

**Ainda não mapeado 1:1 no mock (validar no Bubble / schema real):**

- **QTDE ESTOQUE** por linha (pode vir de ligação com estoque ou cálculo).
- **STATUS MISSÃO** (pode equivaler a `statusMaterial` ou campo à parte).
- **COMUNICAÇÃO** (thread / histórico — não há coluna dedicada no mock atual).
- **LIBERAR** — provável composição de workflows (financeiro + NF + entrega); no 3.0 há endpoints separados (`aprovar-financeiro`, `emitir-nf`, `entregar`).

## Próximos passos sugeridos

1. No Bubble, anotar **qual “Type” de dados** alimenta essa repeating group e **quais campos** são de lookup.
2. Comparar com `shared/schema.ts` (`expedicoes` / pedidos) quando o banco real estiver ligado.
3. Definir se **uma** tela no 3.0 deve reunir todas essas colunas (paridade UX) ou se quebramos em subviews (financeiro, galpão, motorista).
