# Bubble — Costureira: **tabela resumo** no lote vs **popup** (motorista / datas)

**Objetivo desta nota:** guardar o que aprendemos do Tecnopano antigo (Bubble) sobre **rastreabilidade** do fluxo costureira: na vista resumo da tabela **COSTUREIRA** (dentro do modal de **Gerenciamento de Processo por Lote**) muitas células aparecem **vazias** mesmo com **STATUS** preenchido; o detalhe operacional (datas, motorista, costureira, devolução) vive num **segundo nível** — **popup** ao interagir com a linha da tabela.

**Relação:** [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md) §2.8 (separação + costureira); [32-lane-galpao-indicadores-status-e-tabela-coleta.md](./32-lane-galpao-indicadores-status-e-tabela-coleta.md) (painel + tabela lane).

---

## 1. Tabela **COSTUREIRA** (resumo no popup do lote)

**Print (captura do utilizador):** [`../imagens/capturas-bubble/34-bubble-tabela-costureira-campos-vazios-enviar-costureira.png`](../imagens/capturas-bubble/34-bubble-tabela-costureira-campos-vazios-enviar-costureira.png)

- Secção **COSTUREIRA** com legenda **OBSERVAÇÃO GERAIS** / **ENTREGA** / **DEVOLUÇÃO**.
- Linha **ID 2**, **STATUS** = **Enviar Costureira** (realce amarelo).
- Preenchidos na linha: **GALPÃO** Nova Mirim, **TIPO MATERIAL** A2, **QTDS SAÍDA KG** 5555.
- **Vazios** na mesma linha: **DATA DE ENVIO**, **MOTORISTA**, coluna **COSTUREIRA** (nome truncado na UI); existe **scroll horizontal** — mais colunas (ex.: **DATA DE RETORNO** e métricas de devolução) podem estar à direita.

**Interpretação para o 3.0:** a tabela pode ser só **resumo** / estado agregado; **não** substitui o formulário completo até alguém (ex.: **motorista** ou galpão) abrir o drill-down e gravar os campos.

---

## 2. Popup **COSTUREIRA** (detalhe — após clicar na linha da tabela)

**Print (captura MCP só leitura, Bubble `debug_mode`):** [`../imagens/capturas-bubble/35-bubble-popup-costureira-entrega-devolucao-motorista.png`](../imagens/capturas-bubble/35-bubble-popup-costureira-entrega-devolucao-motorista.png)

**Título do modal:** **COSTUREIRA** (fluxo **GALPÃO → MOTORISTA → COSTUREIRA** na ida; **COSTUREIRA → MOTORISTA → GALPÃO** na volta).

### 2.1 **ENTREGA**

| Campo | Observação no print |
|-------|---------------------|
| **ID PEDIDO** | **43** (liga o pedido de coleta / lote ao contexto da costureira). |
| **DATA DE ENTREGA** | Data **11/04/26** e hora **12:00** (podem estar desabilitados ou pré-preenchidos — validar regra no editor Bubble). |
| **GALPÃO** | **Nova Mirim**. |
| **TIPO DE MATERIAL** | **A2** (no print MCP; no print 34 a coluna resumo também era A2). |
| **QTDS KG** | **5555**. |
| **MOTORISTA** | Dropdown **“Selecione motorista”** — ponto de entrada para o **motorista** assumir / registar o envio. |
| **COSTUREIRA** | Dropdown para escolher a costureira (destino físico). |

### 2.2 **DEVOLUÇÃO**

- **DATA DEVOLUÇÃO**, **GALPÃO**, **QTDS PACOTES**, **QTDS KG**, **RESÍDUOS**, **MOTORISTA** (segundo motorista na volta).
- No print, vários campos ainda vazios ou com placeholder **PESO** — preenchimento quando houver retorno.

### 2.3 **OBSERVAÇÃO GERAIS**

- **STATUS SERVIÇO:** **Enviar Costureira** (alinhado à linha da tabela resumo).
- **TOTAL DIF. KG** com placeholder **PESO**.

---

## 3. Implicações Tecnopano 3.0 (passo a passo com o time)

1. **Dois níveis de UI:** lista/tabela resumo **e** ecrã (ou drawer) de **detalhe costureira** com os blocos **Entrega** / **Devolução** / **Observação**, espelhando o Bubble.
2. **Motorista:** permissão para ver e preencher o que o Bubble expõe nos dropdowns **MOTORISTA** e datas de entrega/devolução, com **auditoria** (quem, quando).
3. **Sincronização:** ao gravar o popup, a **linha da tabela COSTUREIRA** e, se aplicável, o **STATUS** na tabela principal de coletas / indicadores devem **atualizar** a partir da mesma entidade (ex.: `costureira_envio` ligado a `coletaId` / `separacaoId`).
4. **Rastreabilidade:** manter vínculo explícito **ID PEDIDO (coleta)** ↔ registo de envio/retorno costureira, para relatórios e SLA.

*(Sem alteração de código da app 3.0 nesta iteração — apenas registo AS-IS Bubble e requisitos.)*

---

## 4. Popup **COSTUREIRA** — exemplo **preenchido** (teste Bubble)

**Print (captura do utilizador — formulário completo):** [`../imagens/capturas-bubble/36-bubble-popup-costureira-preenchido-completo.png`](../imagens/capturas-bubble/36-bubble-popup-costureira-preenchido-completo.png)

Resumo do que o print mostra (valores reais de teste):

| Bloco | Destaque |
|-------|-----------|
| **ENTREGA** | **ID PEDIDO** 43; **DATA DE ENTREGA** 11/04/26; **GALPÃO** Nova Mirim; **TIPO DE MATERIAL** A2; **QTDS KG** 5555; **COSTUREIRA** seleccionada (**Madalena Mister**); **MOTORISTA** preenchido conforme fluxo *(no print pode estar vazio ou já escolhido — validar na UI)*. |
| **DEVOLUÇÃO** | **DATA DEVOLUÇÃO** 11/04/26; **GALPÃO** Nova Mirim; **QTDS PACOTES** 8528; **QTDS KG** 111; **RESÍDUOS** 144; **MOTORISTA** ainda com placeholder **Selecione motorista** na volta *(estado intermédio possível)*. |
| **OBSERVAÇÃO GERAIS** | **STATUS SERVIÇO** ainda **Enviar Costureira** neste exemplo de teste; **TOTAL DIF. KG** calculado (**-5444** no print — diferença entre peso de ida e linha de retorno + resíduos; realce a vermelho na UI). |

Isto confirma que o Bubble **suporta** preenchimento de ida e volta no mesmo ecrã; a **tabela resumo** §1 deve **espelhar** estes campos após **Salvar** (comportamento descrito pelo utilizador no ambiente real; em **version-test** parte da UX pode não reflectir produção).

---

## 5. Requisitos Tecnopano 3.0 (extensão — motorista, costureira, assinaturas, dashboards)

Documentação complementar ao §3, com base no feedback do operador:

1. **Dashboard do motorista** — ao iniciar sessão, o motorista vê a **rota / tarefas** que tem de executar para **entregar às costureiras** (e voltas associadas), derivadas dos envios em estado “a ir” / “em trânsito”, ligadas ao **ID PEDIDO** e ao registo costureira.
2. **Base de dados de costureiras** — dropdown (ou busca) com **nome** das costureiras (ex.: *Madalena Mister*), mantido em cadastro no 3.0.
3. **Campos de negócio** — datas (entrega / devolução), **resíduos**, **motorista** (ida e, se aplicável, volta), **status** de serviço, pesos e pacotes, **TOTAL DIF. KG** (regra de cálculo explícita na API para evitar divergência com a UI).
4. **Assinaturas (recepção / conferência)** — requisito **legal / operacional**: **motorista** e **quem recebe** (no galpão e/ou no ponto da costureira, conforme processo interno) devem **assinar** que receberam / conferiram, **tanto na ida como no regresso**. No Bubble em **modo de teste** isto pode **não aparecer**; no 3.0 deve ser **primeira classe** (captura de assinatura, carimbo de tempo, utilizador, eventual PDF ou registo imutável).
5. **Ao clicar Salvar** — persistir todos os blocos; **actualizar** a **tabela COSTUREIRA** (resumo no modal do lote) com os dados gravados; **actualizar STATUS** quando o fluxo passar a “já voltou da costureira” / equivalente, para alimentar **indicadores** e a **tabela principal de coleta**.
6. **Dashboard da costureira** — perfil ou portal onde a costureira vê que **lhe foi pedido o regresso** (ou que há material a devolver / levantar), alinhado ao novo **STATUS** após gravação — paridade com a necessidade de “avisar” o actor costureira no 3.0.

Estes pontos ficam como **backlog de produto** para implementação incremental no 3.0, mantendo **trilho de auditoria** e **coerência** entre popup, tabelas resumo e dashboards (galpão, motorista, costureira, admin).
