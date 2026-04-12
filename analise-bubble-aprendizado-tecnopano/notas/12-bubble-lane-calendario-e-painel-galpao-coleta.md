# Bubble — Lane: calendário de coleta **e** tabela no painel galpão

A **lane** (operação no **galpão**) vê o mesmo pedido de coleta em **dois sítios** no Bubble: (1) **calendário** de planejamento e (2) **tabela** no painel de controlo, com **coluna Status** alinhada ao ciclo de vida do registo.

**Relação com outras vistas**

- Vista **Michele** (menu **Coleta** — lista + filtros): [06-bubble-ui-coleta-via-mcp.md](./06-bubble-ui-coleta-via-mcp.md), exemplos de linha em [10](./10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md) §1.1.
- **Motorista** no Bubble **não** tem a mesma visibilidade — [10](./10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md) §2–3.

---

## 1. Calendário — **CALENDÁRIO DE PLANEJAMENTO DE COLETA**

**Print:** [`../imagens/capturas-bubble/12-bubble-lane-calendario-planejamento-coleta.png`](../imagens/capturas-bubble/12-bubble-lane-calendario-planejamento-coleta.png)

- **Título:** **CALENDÁRIO DE PLANEJAMENTO DE COLETA** (com ícone de camião).
- **Vista:** **Mês** (alternância **Mês / Semana / Dia**); navegação **Hoje** e setas **‹ ›**; cabeçalho **abril de 2026**.
- **Grelha:** dias da semana **Dom … Sab**; células com número do dia; dia corrente com realce (ex.: **11** com fundo amarelo claro no print).
- **Eventos (faixas verdes):** cada coleta agendada aparece como barra no dia correspondente. No exemplo:
  - **Sáb 11/04:** texto tipo **`12 ATMOSFERA GESTAO`** *(provável **ID** ou código + trecho do nome da empresa; texto pode truncar na UI)*.
  - **Ter 21/04:** entrada equivalente **`12 ATMOSFERA GESTAO`**.
- **Interpretação de produto:** o calendário posiciona a coleta na **data relevante** (ex.: previsão de chegada e/ou outra data de planejamento — confirmar regra exacta no Bubble); serve à lane para **visão temporal** complementar à tabela.
- **Interacção:** ao **clicar no evento** do calendário correspondente a um pedido (identificado pelo **ID** / texto do evento), o Bubble abre um **popup** com o detalhe desse pedido *(conteúdo exacto do popup a capturar num print futuro)*.

---

## 2. Painel galpão — **PAINEL DE CONTROLE GALPÃO** (formulário + tabela)

Para o par **painel de indicadores por etapa** + **tabela com Status** (ex.: Repanol na linha) e a exigência de sincronização no Tecnopano 3.0, ver também [32-lane-galpao-indicadores-status-e-tabela-coleta.md](./32-lane-galpao-indicadores-status-e-tabela-coleta.md).

> **Sessão MCP 2026-04-11:** complementos a esta nota e à [32](./32-lane-galpao-indicadores-status-e-tabela-coleta.md) (catálogo completo de **27 materiais** com kg, valores reais da coleta 43 — `Valor R$ 5.885`, `Peso NF 606599`, `Peso Atual 628552`, **segunda secção `EXPEDIÇÃO` na mesma página com botão `LIBERAR`**, dados sobre o deadlock `QTDE ESTOQUE = 0`, e o `STATUS MISSÃO NOTA`) ficam em [67-bubble-galpao-lane-painel-controle-liberar-funil-status.md](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md).

**Print:** [`../imagens/capturas-bubble/13-bubble-lane-painel-galpao-tabela-coleta.png`](../imagens/capturas-bubble/13-bubble-lane-painel-galpao-tabela-coleta.png)

- **URL observada (exemplo):** `https://operation.app.br/version-test/tecnopano` *(path distinto de `/expedicao` — confirma que a lane pode estar numa **página/rota** própria)*.
- **Título da área:** **PAINEL DE CONTROLE GALPÃO**.

### 2.1 Formulário **CADASTRAR COLETA** (entrada pela lane)

Campos distintos do modal **CADASTRO COLETA** da Michele (datas + lupas — ver [07](./07-bubble-cadastro-coleta-modal.md)):

| Campo | Observação |
|-------|------------|
| **NOME DA EMPRESA** | Texto + ícone edifício |
| **STATUS DE SERVIÇO** | Dropdown + ícone pasta/mala |
| **Nº NOTA FISCAL** | Texto + ícone documento |
| **GALPÃO** | Dropdown + ícone casa/galpão |
| **CADASTRAR COLETA** | Botão (branco, texto vermelho, ícone PDF/documento) |

Ou seja: na lane o registo pode ser **completado** ou **criado** com foco operacional (NF, galpão, status de serviço), enquanto a Michele agenda com outro conjunto de campos.

### 2.2 Tabela (com **Status**)

**Colunas:** **ID**, **Data**, **Nº Nota Fiscal**, **Empresa**, **Valor** (R$), **Galpão**, **Peso NF**, **Peso Atual**, **Status**.

**Exemplo de linha no print (ID 43):**

| Coluna | Valor |
|--------|--------|
| ID | 43 |
| Data | 11/04/26 12:55 |
| Nº Nota Fiscal | *(vazio no print)* |
| Empresa | ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A. |
| Valor | *(vazio)* |
| Galpão | *(vazio)* |
| Peso NF / Peso Atual | *(vazio)* |
| **Status** | **Planejamento Coleta** |

**Paginação:** ex. **« 1 of 1 »**.

**Print (linha / tabela — contexto de clique):** [`../imagens/capturas-bubble/14-bubble-lane-tabela-coleta-linha-clicavel.png`](../imagens/capturas-bubble/14-bubble-lane-tabela-coleta-linha-clicavel.png)

O **status na tabela** (**Planejamento Coleta**) deve permanecer **consistente** com o que a Michele vê na lista do menu Coleta e com o que faz sentido mostrar ao **motorista** no 3.0 (ver [10](./10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md)).

### 2.3 Clique na linha → **popup** do pedido

**Regra de UX (Bubble):** ao **clicar na linha da tabela** (ou na célula / registo associado ao **ID** do pedido — ex. **43**), abre-se um **popup** com os **detalhes** dessa coleta. É o mesmo tipo de **aprofundamento** que pelo calendário: **tabela ou calendário** servem de entrada; o **ID** identifica o pedido no popup.

### 2.4 Conteúdo do popup — **Gerenciamento de Processo por Lote**

**Print (popup já aberto, sem interacção adicional):** [`../imagens/capturas-bubble/15-bubble-popup-gerenciamento-processo-lote-coleta.png`](../imagens/capturas-bubble/15-bubble-popup-gerenciamento-processo-lote-coleta.png)

**Título do modal:** **Gerenciamento de Processo por Lote**

O popup divide-se em **duas zonas** de processo:

#### A) **COLETA** (fluxo **ESCRITÓRIO → MOTORISTA → GALPÃO**)

Campos **preenchidos** no exemplo capturado (ID **43**):

| Campo | Valor exibido |
|-------|----------------|
| **ID COLETA** | 43 |
| **DATA DA COLETA** | 11/04/26 · 12:55 |
| **DATA/HORA PREVISÃO DE CHEGADA** | 11/04/26 · 12:56 |
| **CNPJ** | 00886257000273 |
| **NOME DA EMPRESA** | ATMOSFERA GESTAO E HIGIENIZACAC *(texto conforme UI; pode truncar)* |
| **NOME FANTASIA** | ATMOSFERA - SP - DIADEMA |
| **OBSERVAÇÃO** | TSTE *(conteúdo tal como no ecrã no momento da captura)* |

#### B) **ENTRADA DE COLETA** (fluxo **GALPÃO → CHEGADA DE CAMINHÃO**)

Esta secção fica **abaixo** dos campos de **COLETA** no mesmo popup. Representa o momento em que a **matéria-prima chega** ao galpão (caminhão / receção física). Os dados aqui são o registo operacional da **entrada**: nota, destino no galpão, valores e pesos para conferência.

**Quem acede e preenche no Bubble (AS-IS):**

- **Administrador** e **Galpão** (perfil / contexto **lane** — supervisora do armazém) têm **acesso** ao painel, à tabela e ao popup onde se grava a **ENTRADA DE COLETA**; após **Salvar**, os dados e o **status** actualizado na tabela ficam **visíveis nesta vista** só para quem tem esse nível de permissão.
- **Triagem** — **não** tem acesso a esta funcionalidade no Bubble (não vê / não edita este fluxo).  
- **Tecnopano 3.0 (TO-BE):** o time pretende que o pessoal da **Triagem** **também** possa preencher os **mesmos campos** de entrada (ou rota equivalente), com **permissões** e **auditoria** — hoje é **lacuna** face ao Bubble.

**Quem preenche na prática operacional (galpão):**

- **Lane / supervisora do galpão** (dentro do perfil **Galpão** no Bubble).

**Campos da ENTRADA DE COLETA** (confirmados no popup — print [15](../imagens/capturas-bubble/15-bubble-popup-gerenciamento-processo-lote-coleta.png)):

| Campo (rótulo Bubble) | Tipo / uso | Notas |
|------------------------|------------|--------|
| **Nº NOTA FISCAL** | Texto | NF recebida com a MP |
| **GALPÃO** | Dropdown | Onde a MP entra / fica alocada |
| **VALOR** | Monetário (R$:) | Valor declarado / conferido conforme regra fiscal-comercial |
| **TOTAL KG NF** | Peso (placeholder “PESO”) | Peso total segundo **nota fiscal** |
| **TOTAL KG ATUAL** | Peso | Peso **medido** na receção (balança / conferência) |
| **TOTAL DIF. KG** | Peso | Diferença entre NF e peso actual (controlo de desvio) |

No exemplo inicial ([15](../imagens/capturas-bubble/15-bubble-popup-gerenciamento-processo-lote-coleta.png)), todos estes campos estavam **vazios** (ainda sem entrada física registada).

**Rodapé:** **Fechar** (cinza) · **Salvar** (verde).

**Contexto visual:** por trás do overlay, vê-se a tabela do painel com a linha **ID 43** e status **Planejamento Coleta**.

### 2.5 Depois de preencher **ENTRADA DE COLETA** e clicar **Salvar**

**Print (popup com bloco preenchido):** [`../imagens/capturas-bubble/16-bubble-popup-entrada-coleta-preenchida.png`](../imagens/capturas-bubble/16-bubble-popup-entrada-coleta-preenchida.png)

Exemplo **ID 43** — valores na secção **ENTRADA DE COLETA**:

| Campo | Valor |
|--------|--------|
| **OBSERVAÇÃO** *(zona acima / mesmo modal)* | TSTE |
| **Nº NOTA FISCAL** | 007 |
| **GALPÃO** | Nova Mirim |
| **VALOR** | R$: 5.885,00 |
| **TOTAL KG NF** | 606599 |
| **TOTAL KG ATUAL** | 628552 |
| **TOTAL DIF. KG** | 21953 *(coerente com 628552 − 606599)* |

**Print (tabela da lane após gravar):** [`../imagens/capturas-bubble/17-bubble-lane-tabela-entrada-de-coleta.png`](../imagens/capturas-bubble/17-bubble-lane-tabela-entrada-de-coleta.png)

A **tabela do painel** passa a reflectir os mesmos dados; a coluna **Status** deixa de **Planejamento Coleta** e passa a **Entrada de Coleta**.

| Coluna | Valor (exemplo ID 43) |
|--------|------------------------|
| ID | 43 |
| Data | 11/04/26 12:55 |
| Nº Nota Fiscal | 007 |
| Empresa | ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A. |
| Valor | R$: 5.885 |
| Galpão | Nova Mirim |
| Peso NF | 606599 |
| Peso Atual | 628552 |
| **Status** | **Entrada de Coleta** |

O **calendário** de planejamento (**CALENDÁRIO DE PLANEJAMENTO DE COLETA**) mantém-se abaixo da tabela no mesmo ecrã (continuidade da vista lane/galpão).

**Resumo do fluxo de estado:** **Planejamento Coleta** → (preencher ENTRADA DE COLETA + **Salvar**) → **Entrada de Coleta** na tabela.

### 2.6 Novo clique na tabela da lane — secção **TRIAGEM E PESAGEM** (mesmo fio do popup)

Ao **voltar a abrir** o popup a partir da linha da tabela (ex.: após **Entrada de Coleta** gravada), o modal pode mostrar **outras zonas** do mesmo processo por lote. A parte de **triagem** (primeiro bloco visível neste estado) segue o fluxo indicado no título:

**Subtítulo do processo:** **DESCARREGAMENTO → PESAGEM → SEPARAÇÃO**

**Print (recorte só desta faixa — TRIAGEM E PESAGEM):** [`../imagens/capturas-bubble/18-bubble-popup-apenas-triagem-pesagem.png`](../imagens/capturas-bubble/18-bubble-popup-apenas-triagem-pesagem.png)  
*(Recorte vertical do ecrã completo, para destacar apenas este bloco.)*

**Print (popup completo neste estado — triagem + tabelas abaixo):** [`../imagens/capturas-bubble/19-bubble-popup-lane-reaberto-triagem-pesagem-full.png`](../imagens/capturas-bubble/19-bubble-popup-lane-reaberto-triagem-pesagem-full.png)

| Campo / controlo | Observação |
|------------------|------------|
| **TOTAL KG SEPARAÇÃO** | Peso (placeholder **PESO**), ícone de balança |
| **DIFEREÇA KG SEPARAÇÃO** | Peso (placeholder **PESO**); no Bubble o rótulo usa grafia **DIFEREÇA** *(possível typo de “Diferença”)* |
| **ADICIONAR** | Botão (azul escuro) — regista linha na grelha de separação |

**Abaixo** (visível no print completo **19**), no mesmo popup:

- **SEPARAÇÃO REALIZADA** — tabela com colunas entre outras: **ID**, **USUÁRIO**, **DATA DA SEPARAÇÃO**, **TIPO MATERIAL**, **PESO**, **COLABORADOR**, **REPANOL**, **EDITAR**, **CALC** (scroll horizontal).
- **COSTUREIRA** — outro bloco com legenda (observações / entrega / devolução) e tabela (envio, galpão, motorista, etc.).

**Nota de permissões:** o acesso a **abrir** este popup continua alinhado ao que está documentado para o painel da lane (**Admin** + **Galpão**). O nome **“Triagem”** aqui descreve a **fase operacional** da MP; o requisito de negócio de dar **ao pessoal de Triagem** capacidade de **preencher** campos que hoje estão fechados no Bubble mantém-se na §3 — ver linha **ENTRADA DE COLETA** e extensão natural a **TRIAGEM E PESAGEM** no 3.0.

### 2.7 Requisito de produto (TO-BE) — Triagem além dos **2 campos** do Bubble

**AS-IS no Bubble (§2.6):** na secção **TRIAGEM E PESAGEM** existem essencialmente **dois** campos numéricos de peso (**TOTAL KG SEPARAÇÃO**, **DIFEREÇA KG SEPARAÇÃO**) mais **ADICIONAR** e tabelas associadas.

**O que o processo tem de suportar (regra informada pelo time):** esses totais **continuam a fazer sentido**, mas o colaborador da **Triagem** precisa de **separar e registar** a operação de forma **ligada à origem da matéria-prima** e ao **tipo de material**, com identificação física/digital:

| Necessidade | Descrição |
|-------------|-----------|
| **Rastreio por chegada / ID** | Cada registo de separação deve ficar associado ao **ID da chegada** (pedido de coleta / lote que entrou) — a **empresa que trouxe a MP** (**fornecedor**) já vem desse fluxo; a triagem trabalha **em cima** desse vínculo. |
| **Tipo de pano** | Classificar **tipo de pano** (tipo de material / produto têxtil) em cada linha ou movimento de separação — não basta só peso agregado sem discriminar material. |
| **QR Code** | Incluir **código QR** no processo (etiqueta, lote, ou apontador para registo no sistema) para **acompanhar** o físico e o digital no armazém e nas etapas seguintes. |
| **Fluxo end-to-end por fornecedor** | **Todo o fluxo** deve permitir ao **dono** (gestão) ver **quanto se aproveitou** daquele **material** em relação à **empresa/fornecedor** de onde a MP chegou — ou seja, **rentabilidade / uso** por **origem de fornecimento**, não só totais globais. |

**Implicações para modelagem no 3.0:** entidades ou relações que guardem `coletaId` / `fornecedorId` / `empresaOrigem` em cada evento de **separação**; tipo de pano como atributo obrigatório ou catálogo; geração/leitura de **QR** (conteúdo e padrão a definir); relatórios/dashboards por **fornecedor** e por **lote/chegada**.

*(Sem print novo — requisito verbal; implementação futura no código e APIs.)*

### 2.8 Bubble (legado) — botão **ADICIONAR** → popup **CADASTRO SEPARAÇÃO**

Na secção **TRIAGEM E PESAGEM**, o botão **ADICIONAR** abre um segundo popup dedicado ao registo de **separação** (triagem / envio), independente dos dois campos de peso agregados.

**Print (triagem + totais + tabela SEPARAÇÃO REALIZADA + botão ADICIONAR):** [`../imagens/capturas-bubble/20-bubble-triagem-adicionar-separacao-realizada.png`](../imagens/capturas-bubble/20-bubble-triagem-adicionar-separacao-realizada.png)

Elementos visíveis no exemplo:

- **TOTAL KG SEPARAÇÃO** — valor numérico (ex.: `55555555`), ícone balança.
- **DIFEREÇA KG SEPARAÇÃO** — valor numérico (ex.: `54927003`), ícone balança (realce verde no print).
- **ADICIONAR** — botão escuro; **abre** o modal abaixo.

**Tabela SEPARAÇÃO REALIZADA** (abaixo): colunas entre outras **ID**, **USUÁRIO**, **DATA DA SEPARAÇÃO**, **TIPO MATERIAL**, **PESO**, **COLABORADOR**, **REPANOL**, **EDITAR**, **CALC** (pode haver scroll horizontal).

---

**Print (popup aberto — formulário “antigo” antes de novo preenchimento):** [`../imagens/capturas-bubble/21-bubble-popup-cadastro-separacao.png`](../imagens/capturas-bubble/21-bubble-popup-cadastro-separacao.png)

**Título do modal:** **CADASTRO SEPARAÇÃO**

| Campo (rótulo Bubble) | Tipo | Exemplo / estado no print |
|------------------------|------|---------------------------|
| **Data Inicio Separação** | Data | `11/04/2026` |
| **Colaborador** | Dropdown | vazio / por seleccionar |
| **Tipo Material** | Dropdown | vazio / por seleccionar |
| **Cor** | Dropdown | vazio / por seleccionar |
| **Peso Kilo** | Texto / número | vazio |
| **Enviar costureira** | Rádio **Não** / **Sim** | **Não** seleccionado |

**Rodapé:** **Fechar** (cinza) · **Adicionar** (verde) — grava a linha de separação (comportamento típico Bubble).

**Lacunas face ao TO-BE (§2.7):** não há no formulário **ID de chegada** explícito, **fornecedor** por linha, **tipo de pano** como conceito distinto além de “Tipo Material”, nem **QR Code** — ficam como evolução do **Tecnopano 3.0**.

#### 2.8.1 Exemplo **preenchido** — **Enviar costureira: Não**

**Print:** [`../imagens/capturas-bubble/22-bubble-popup-cadastro-separacao-preenchido-nao-costureira.png`](../imagens/capturas-bubble/22-bubble-popup-cadastro-separacao-preenchido-nao-costureira.png)

| Campo | Valor no print |
|--------|----------------|
| **Data Inicio Separação** | 11/04/2026 |
| **Colaborador** | Edson *(selecção manual no Bubble)* |
| **Tipo Material** | Avental |
| **Cor** | Florzinha |
| **Peso Kilo** | 55555 |
| **Enviar costureira** | **Não** |

**Comportamento observado (Bubble):** ao escolher **Tipo Material** = **Avental**, o campo **Cor** actualiza automaticamente para **Florzinha** — a lista de cores é **dependente** do tipo de material na base de dados (só existem variantes válidas para aquele material; não é livre). O mesmo padrão de **catálogo** aplica-se à lista de **tipos de material** (dados já existentes no Bubble).

#### 2.8.1b Segundo exemplo — **Tipo A2**, cor **Variado**, **Enviar costureira: Sim**

**Print:** [`../imagens/capturas-bubble/27-bubble-popup-cadastro-separacao-a2-sim-costureira.png`](../imagens/capturas-bubble/27-bubble-popup-cadastro-separacao-a2-sim-costureira.png)

Outro registo de **CADASTRO SEPARAÇÃO** na triagem: outro **tipo de material** da BD, com variante de **cor** imposta pelo catálogo, desta vez com envio à **costureira**.

| Campo | Valor no print |
|--------|----------------|
| **Data Inicio Separação** | 11/04/2026 |
| **Colaborador** | Edson |
| **Tipo Material** | **A2** |
| **Cor** | **Variado** *(preenchido automaticamente conforme regras da BD para o tipo **A2**)* |
| **Peso Kilo** | 5555 |
| **Enviar costureira** | **Sim** |

O layout do popup **não muda** em relação ao cenário **Não** (§2.8.1): só alteram valores e o rádio **Sim**; campos extra visíveis **só** após **Adicionar** podem aparecer noutros ecrãs (ex.: bloco **COSTUREIRA** na lista principal — validar com operação quando houver print da linha na tabela).

#### 2.8.2 Direcção Tecnopano 3.0 (requisitos descritos pelo time)

- **API + ID de controlo:** integrar com identificador de controlo / contexto da coleta ou lote, para a separação não ficar “solta” do pedido de chegada (alinhar com §2.7).
- **Antes de iniciar o trabalho:** ecrã em que o **colaborador indica a localização** / posto (ex.: entrou na **Triagem** → sessão ou registo ligado à **área Triagem**). Evita depender só de escolher o nome manualmente no dropdown sem contexto de onde está a trabalhar.
- **Tipo de material:** no Bubble a lista vem de **BD**; no 3.0 manter **API de materiais** com boa **pesquisa / favoritos / uso recente** para ficar mais rápido que percorrer lista longa.
- **Cor:** **BD de cores** filtrada pelo **tipo de material** seleccionado (dropdown dependente, como no exemplo Avental → Florzinha).
- **Peso:** campo numérico por linha de separação.
- **Enviar costureira:** dois cenários documentados com print — (1) **Não** (§2.8.1); (2) **Sim** (§2.8.1b).

#### 2.8.3 Após **Adicionar** na separação — linha na tabela **SEPARAÇÃO REALIZADA**

**Print (ecrã após gravar a separação):** [`../imagens/capturas-bubble/23-bubble-separacao-realizada-linha-apos-adicionar.png`](../imagens/capturas-bubble/23-bubble-separacao-realizada-linha-apos-adicionar.png)

Depois de confirmar o **CADASTRO SEPARAÇÃO** (§2.8.1), o Bubble **actualiza** a grelha **SEPARAÇÃO REALIZADA** com uma **nova linha** alinhada aos dados do formulário.

**Exemplo de linha visível (ID interno da separação = 1):**

| Coluna | Valor / UI |
|--------|------------|
| **ID** | 1 |
| **USUÁRIO** | *(coluna presente; valor conforme sessão Bubble)* |
| **DATA DA SEPARAÇÃO** | 11/04/26 |
| **TIPO MATERIAL** | Avental |
| **PESO** | 55555 Kg |
| **COLABORADOR** | Edson |
| **REPANOL** | **Ícone de lavandaria / máquina de lavar** — representa o envio ou vínculo com a **Repanol**, empresa que faz o **melhoramento** de tecidos que chegam **danificados / “zuados”** (recuperação do pano). Acção própria na linha da separação. |
| **EDITAR** | **Ícone lápis** — abre o registo da separação para **corrigir** dados. |
| **CALC** | **Ícone calculadora** — abre o popup **CALCULADORA** (§2.8.4) para **somar mais pesos** relativos à **mesma linha** / mesmo tipo de material, sem criar outra separação do zero. |

**Print (recorte da tabela com REPANOL + EDITAR + CALC):** [`../imagens/capturas-bubble/25-bubble-tabela-separacao-realizada-repanol-editar-calc.png`](../imagens/capturas-bubble/25-bubble-tabela-separacao-realizada-repanol-editar-calc.png)

A tabela mantém **scroll horizontal** se houver mais colunas. Abaixo continua o bloco **COSTUREIRA** (legenda entrega / devolução / observações e segunda tabela).

#### 2.8.4 Popup **CALCULADORA** (ícone **CALC** na linha)

**Print:** [`../imagens/capturas-bubble/24-bubble-popup-calculadora-separacao-peso.png`](../imagens/capturas-bubble/24-bubble-popup-calculadora-separacao-peso.png)

**Título:** **CALCULADORA**

| Zona | Comportamento |
|------|----------------|
| **Histórico de soma** | Lista de parcelas já incluídas (ex.: `55.555,0`); cada linha pode ter **eliminar** (ícone lixo vermelho). |
| **Soma total** | Exibe o total acumulado (ex.: **SOMA TOTAL: 55.555,0**). |
| **Novo peso** | Campo **Peso** + botão **+** (amarelo) para **adicionar** o valor ao histórico e ao total. |
| **Enviar costureira** | Rádio **Não** / **Sim** (no mesmo modal — alinha ao fluxo de envio à costureira). |
| **Rodapé** | **Excluir** (vermelho), **Fechar** (cinza), **Salvar** (verde). |

**Negócio:** permite **acrescentar informação de peso** por **parcelas** para o **mesmo material / mesma linha de separação**, com total explícito antes de gravar.

**Para implementação no 3.0:** `GET/POST` de linhas de peso filhas da separação (ou JSON de parcelas); botões **Salvar** / **Excluir** com regras claras; integração opcional com **Repanol** e **costureira** conforme flags.

#### 2.8.5 Clicar no ícone **REPANOL** — popup **DADOS REPANOL**

**Print:** [`../imagens/capturas-bubble/26-bubble-popup-dados-repanol.png`](../imagens/capturas-bubble/26-bubble-popup-dados-repanol.png)

**Título do modal:** **DADOS REPANOL** (dados do envio à **Repanol** — tratamento de tecidos, ver §2.8.3).

**Secção ENTREGA** (ida do material):

| Campo | Tipo |
|-------|------|
| **DATA ENVIO** | Data (ex.: 11/04/26) |
| **MANCHADO** | Peso (placeholder PESO, ícone KG) |
| **MOLHADO** | Peso |
| **TINGIDO** | Peso |

**Secção DEVOLUÇÃO** (regresso após tratamento):

| Campo | Tipo |
|-------|------|
| **DATA RETORNO** | Data (ex.: 11/04/26) |
| **MANCHADO** / **MOLHADO** / **TINGIDO** | Pesos por categoria na volta |

**RENOVA REPANOL** — campo de peso (fundo rosa claro no print). **Renova** é empresa de **incineração de resíduos**; a nomenclatura no formulário associa este peso a esse destino / linha de descarte (explicação operacional do time).

**Rodapé:** **Fechar** · **Salvar**.

---

**Problema no Bubble (AS-IS):** o popup é **simples** — só datas e pesos por categoria. **Não** aparecem **ID da matéria-prima**, **fornecedor**, **QR**, nem um **lote** que amarre o envio ao resto do ecossistema (coleta → entrada → separação). Fica **desorganizado** para rastrear **de onde** veio o pano e **qual** lote está na Repanol.

**TO-BE (processo desejado — contexto do utilizador):**

1. **Na triagem**, ao enviar para **Repanol**, gerar/usar um **lote** (identificador único do envio) com **QR Code** impresso ou exibido — o mesmo **lote/QR** acompanha o físico.
2. **Na volta**, o **mesmo** lote/QR liga as **peças devolvidas** aos pesos de **DEVOLUÇÃO** por categoria (**MANCHADO**, **MOLHADO**, **TINGIDO**), conforme o que a Repanol tratou (limpeza, secagem, retirada de manchas / tingimento, etc. — detalhe fino na especificação com operação).
3. **Dono / gestão:** conseguir ver o fio completo: **fornecedor** da MP → coleta → entrada → separação → **Repanol** (ida/volta) por **lote/QR**.

No **Tecnopano 3.0**, modelar entidade tipo `repanol_envio` com `separacaoId`, `coletaId`/`fornecedorId`, `loteCodigo`, `qrPayload`, parcelas de peso ida/volta e ligação a **Renova** quando aplicável.

#### 2.8.6 Verificação — estado actual das tabelas (após os exemplos)

**Print (captura MCP só leitura):** [`../imagens/capturas-bubble/28-bubble-verificacao-tabelas-separacao-costureira-repanol.png`](../imagens/capturas-bubble/28-bubble-verificacao-tabelas-separacao-costureira-repanol.png)

**1) SEPARAÇÃO REALIZADA** — duas linhas:

| ID | Data | Tipo material | Peso | Colaborador | REPANOL / EDITAR / CALC |
|----|------|---------------|------|-------------|-------------------------|
| 1 | 11/04/26 | Avental | 55555 Kg | Edson | ícones lavandaria / lápis / calculadora |
| 2 | 11/04/26 | A2 | 5555 Kg | Edson | idem |

**2) COSTUREIRA** (legenda: observações / entrega / devolução) — linha ligada ao envio **Sim**:

| ID | Status | Data envio | Galpão | Tipo material | Qtd saída kg | Motorista | Costureira |
|----|--------|------------|--------|---------------|--------------|-----------|--------------|
| 2 | **Enviar Costureira** | *(vazio no print)* | Nova Mirim | A2 | 5555 | *(vazio)* | *(coluna parcial)* |

**3) REPANOL** — linha ligada à separação **1** (Avental):

| ID | Status | Data envio | Galpão | Empresa |
|----|--------|------------|--------|---------|
| 1 | **Devolvido** *(texto verde)* | 11/04/26 | Nova Mirim | ATMOSFERA GESTAO E HIGIENIZACAO TEXTEIS S.A. |

Confirma o encadeamento: **Sim** costureira gera linha na tabela **COSTUREIRA** (ID alinhado à separação **2**); fluxo **Repanol** na separação **1** com estado **Devolvido** e empresa visível. A barra **Debugger** do Bubble mostrava aviso **(1)** no momento da captura — tratar no editor Bubble se for erro de dados ou workflow.

**Drill-down costureira (tabela resumo → popup motorista / datas):** a linha da tabela **COSTUREIRA** pode mostrar só **STATUS** e poucos campos; o detalhe (**DATA DE ENTREGA**, **MOTORISTA**, **COSTUREIRA**, bloco **DEVOLUÇÃO**, etc.) abre noutro popup — ver [35-bubble-costureira-tabela-resumo-vs-popup-motorista.md](./35-bubble-costureira-tabela-resumo-vs-popup-motorista.md).

#### 2.8.7 Capturas complementares — tabelas longas (fullPage + viewport largo)

O print §2.8.6 usa largura de janela habitual; as grelhas **SEPARAÇÃO REALIZADA**, **COSTUREIRA** e **REPANOL** têm **scroll horizontal** interno, pelo que parte das colunas fica fora do recorte. Foram feitas capturas adicionais (MCP, só leitura): **fullPage** na largura habitual e **viewport ~2800×1600** com scroll vertical no documento para alinhar o recorte ao bloco desejado.

| # | Ficheiro | Conteúdo útil |
|---|----------|----------------|
| **29** | [`../imagens/capturas-bubble/29-bubble-separacao-realizada-tabelas-longas-fullpage.png`](../imagens/capturas-bubble/29-bubble-separacao-realizada-tabelas-longas-fullpage.png) | **fullPage** — altura completa do modal e fundo (lista **LIBERAR**); confirma extensão vertical e barras de scroll nas três tabelas. |
| **30** | [`../imagens/capturas-bubble/30-bubble-tabelas-separacao-costureira-repanol-viewport-largo.png`](../imagens/capturas-bubble/30-bubble-tabelas-separacao-costureira-repanol-viewport-largo.png) | Viewport largo + scroll: **SEPARAÇÃO REALIZADA** com **linhas 1 e 2** visíveis (colunas **ID** … **CALC.**); **COSTUREIRA** com sub-colunas **DATA DE RETORNO**, **GALPÃO**, **QTDS PACOTES**, **QTDS KG**, **RESÍDUOS**, **MOTORISTA**, **TOTAL DIF. KG** (legenda observação / entrega / devolução); **REPANOL** com **MANCHADO** / **MOLHADO** / **TINGIDO** em blocos de **entrega** e **devolução** e **DATA DE RETORNO** entre eles. |
| **31** | [`../imagens/capturas-bubble/31-bubble-entrada-triagem-separacao-realizada-viewport-largo.png`](../imagens/capturas-bubble/31-bubble-entrada-triagem-separacao-realizada-viewport-largo.png) | Topo do mesmo modal: **ENTRADA DE COLETA**, **TRIAGEM E PESAGEM** e cabeçalho da **SEPARAÇÃO REALIZADA** com todas as colunas da grelha principal na mesma linha. |

**Nota:** colunas totalmente à esquerda ou à direita dentro de cada grelha podem continuar a depender da posição do **scroll horizontal** da própria tabela Bubble; o alargamento do browser reduz truncagem mas **não** substitui, por si, todas as posições possíveis desse scroll.

### 2.9 **PRODUÇÃO** — micro popup **CADASTRO PRODUÇÃO** e grelha **PRODUÇÃO REALIZADA**

No mesmo modal de lote, o bloco **PRODUÇÃO** abre o popup **CADASTRO PRODUÇÃO**: o **Tipo material** lista **apenas** o que **já consta em SEPARAÇÃO REALIZADA** (ex.: A2 e Avental), não o catálogo inteiro. Depois da escolha, cascata **Acabamento → Tamanho → Cor** (BD); **Unidade de medida** automática; se unidade **Kilo**, surge **Peso Kilo**. Após **Adicionar**, a área **REGISTRAR PRODUÇÃO** / **PRODUÇÃO REALIZADA** mostra a linha (ex.: **STATUS Pendente**) e o fluxo segue para **ENCAMINHAR PARA ESTOQUE**.

Detalhe, prints e TO-BE (QR, FK, galpão maior): [38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md).

---

## 3. Implicações para Tecnopano 3.0

| Tema | Bubble (lane) | 3.0 |
|------|----------------|-----|
| Dupla visualização | Calendário **+** tabela no galpão | Avaliar **vista calendário** para coletas (filtro por galpão/data) além de `/coleta` lista |
| Drill-down | **Clique** no evento do **calendário** **ou** na **linha da tabela** (por **ID**) → popup **Gerenciamento de Processo por Lote** (§2.4) | Um detalhe que mostre bloco **escritório** (já preenchido) + bloco **entrada galpão** (NF, pesos, galpão) a completar; `GET` + `PUT` alinhados aos campos |
| **ENTRADA DE COLETA** | Só **Admin** + **Galpão** acedem; **Triagem** sem acesso no Bubble | No 3.0: manter roles explícitas; **adicionar** perfil **Triagem** com mesmo formulário + trilho de auditoria; opcionalmente leitura para outros perfis |
| **TRIAGEM E PESAGEM** (§2.6–2.7) | Só **2** campos de peso + **ADICIONAR** + tabelas; **sem** QR nem vínculo explícito a chegada/fornecedor/tipo pano ao nível desejado | Manter pesos; **mais:** separação por **ID chegada** + **fornecedor** + **tipo de pano** + **QR**; relatório de **aproveitamento por empresa/fornecedor** (§2.7) |
| **CADASTRO SEPARAÇÃO** (§2.8–2.8.2) | Colaborador manual; material/cor de **BD** (cor **dependente** do tipo); **Sim/Não** costureira | API com vínculo ao lote/chegada; **check-in** de posto (Triagem) antes do trabalho; `GET /materiais`, `GET /cores?materialId=`; UX de escolha rápida de material |
| **REPANOL / EDITAR / CALC** (§2.8.3–2.8.4) | **Repanol** = acção lavandaria/melhoria de panos “zuados”; **Editar** linha; **Calc** = popup soma de pesos + costureira Sim/Não | Serviço ou integração **Repanol**; edição `PUT`; sub-recurso **parcelas de peso** + modal calculadora; mesmas permissões Triagem conforme produto |
| **DADOS REPANOL** (§2.8.5) | Popup só com **ENTREGA** / **DEVOLUÇÃO** / **RENOVA** (pesos); **sem** ID MP, fornecedor, lote nem **QR** | **Lote + QR** desde triagem; ida/volta no mesmo identificador; vínculo a **fornecedor** e separação; campo **Renova** como incineração de resíduos |
| **CADASTRO PRODUÇÃO** (§2.9) | Micro popup; tipo = só **já separado**; cascata manual; unidade kg vs peça; grelha **PRODUÇÃO REALIZADA** + **ENCAMINHAR PARA ESTOQUE** | `GET` materiais filtrados por separações do lote; cascata com FK; **QR** / posto para reduzir digitação; stock com **zonas** no galpão maior |
| **Transição de status** | **Planejamento Coleta** → **Entrada de Coleta** após salvar entrada (§2.5) | `status` / `statusServico` alinhados a estes rótulos |
| Dois formulários | Michele (modal rico) vs lane (NF, galpão, status serviço) | Um fluxo unificado ou **dois passos** (pedido → receção lane) com mesma entidade `coleta` |
| Status | Coluna explícita **Planejamento Coleta** | Mapear para `status` + rótulo; mesma lista para motorista quando aplicável |

---

## 4. Ligações

- Coleta menu operacional (Michele): [06](./06-bubble-ui-coleta-via-mcp.md)  
- Cadastro coleta Michele: [07](./07-bubble-cadastro-coleta-modal.md)  
- Visibilidade motorista: [10](./10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md)  
- Fluxo MP / motorista: [02](./02-fluxo-coleta-mp-motorista.md)
