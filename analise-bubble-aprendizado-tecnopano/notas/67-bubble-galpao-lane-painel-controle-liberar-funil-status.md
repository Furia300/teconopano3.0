# Bubble — **Galpão (Lane)** `PAINEL DE CONTROLE GALPÃO` — *complementos* às notas 12 e 32

> **Esta nota é um delta** sobre o que o Cursor já documentou em [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md) (calendário + tabela coleta + popup) e [32-lane-galpao-indicadores-status-e-tabela-coleta.md](./32-lane-galpao-indicadores-status-e-tabela-coleta.md) (indicadores + sincronização painel↔tabela). Aqui só ficam **achados novos** que vieram da captura MCP de 2026-04-11. Não duplica conteúdo.

**Prints:**

- **`67`** (fornecido pelo utilizador, recorte da segunda secção da página com `LIBERAR`): [`../imagens/capturas-bubble/67-bubble-galpao-lane-tabela-liberar-qtde-estoque-status-missao-nota.png`](../imagens/capturas-bubble/67-bubble-galpao-lane-tabela-liberar-qtde-estoque-status-missao-nota.png)
- **`67b`** (captura MCP, página completa do `tecnopano`, full page com **27 materiais + funil + mapa + calendário + tabela coleta + secção EXPEDIÇÃO**): [`../imagens/capturas-bubble/67b-bubble-galpao-lane-painel-controle-completo-mcp.png`](../imagens/capturas-bubble/67b-bubble-galpao-lane-painel-controle-completo-mcp.png)

**Origem (MCP):** menu **Galpão** → URL **`https://operation.app.br/version-test/tecnopano?debug_mode=true`** → título **`PAINEL DE CONTROLE GALPÃO`**. Confirma o que [12 §2](./12-bubble-lane-calendario-e-painel-galpao-coleta.md#2-painel-galpão--painel-de-controle-galpão-formulário--tabela) já tinha apontado: a página interna chama-se `tecnopano`, item de menu chama-se `Galpão`.

---

## 1. NOVO — `INDICADORES DE STATUS SEPARAÇÃO`: **catálogo completo de 27 materiais**

A nota [32 §1](./32-lane-galpao-indicadores-status-e-tabela-coleta.md#1-anexo-a--indicadores-de-status-geral--produção-e-mapa) menciona genericamente "cartões por macro-etapa". A captura MCP nova mostra **um segundo painel acima**, dedicado a **kg por tipo de material**, com a lista **completa** que nunca tinha sido extraída:

| Material | Kg vistos | Notas |
|----------|-----------|-------|
| PASTELÃO |  | |
| ATM |  | |
| **A2** | **5555** | **= peso enviado à costureira Madalena Mister no pedido 43** ([60 §1.4](./60-bubble-motorista-mesma-pagina-costureira-motorista.md#15-reconciliação-com-o-pedido-43-avental-corte-reto-p-florzinha)). Confirma que **A2** é o código interno do material que entra como avental cortado-reto. |
| ENXOVAL |  | |
| GRU |  | |
| MANTA FINA |  | |
| **RESÍDUO COSTUREIRA** | **144** | resíduo gerado pela costureira (alinhado com [38 §3.1 bloco DESCARTE](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado)) |
| **RENOVA** | **1** | bucket de reaproveitamento (Renova) |
| **REPANOL** | **11** | bucket Repanol (mesmo do popup [12 §2.8.5](./12-bubble-lane-calendario-e-painel-galpao-coleta.md)) |
| GR · FUR · BR · EDREDON · FAIXA · LENÇOL · TNT · GSY · TOALHA · UNIFORME · FRONHA · FITILHO · LISTRADO · AVENTAL · A9 · ESTOPA · MALHA · MANTA ABSORÇÃO |  | todos a zero hoje — **sem volume activo** mas mantidos visíveis |

### Por que isto é importante

- **27 tipos > 8** que tinha visto somando os dropdowns de Estoque ([58](./58-bubble-estoque-listagem-filtros-retirar.md)), Triagem ([59](./59-bubble-triagem-painel-operador-status-servico.md)), Costureira ([60](./60-bubble-motorista-mesma-pagina-costureira-motorista.md)), Card ([61](./61-bubble-card-estoque-cards-ranking.md)) — confirma o **descasamento de listas** entre módulos do Bubble.
- **Esta é a única tela** onde aparecem **todos os tipos juntos**. Para o 3.0: usar este painel como referência canónica de `enum tipoMaterial`.
- O cruzamento `A2 = 5555 kg` no painel do galpão **com** `5555 kg` enviado à Madalena (Costureira) **com** o `Avental Corte-Reto P Florzinha` produzido em [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado) **prova** que A2 → costureira → produto final é a cadeia real do pedido 43. **Primeira reconciliação completa** que conseguimos no Bubble.

---

## 2. NOVO — `INDICADORES DE PRODUÇÃO`: confirma os 5.882 kg de [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado)

| Métrica | Valor MCP |
|---------|-----------|
| **PACOTES REALIZADOS** | **0** |
| **KILOS REALIZADOS** | **5.882 kg** |

**5.882 kg = match perfeito** com o `REGISTRAR PRODUÇÃO` do modal de produção do pedido 43. Confirma que **toda** a produção realizada hoje no galpão é uma única linha (o lote do pedido 43), e que o registo foi feito em **kilo** (não em pacotes — por isso `PACOTES = 0`).

---

## 3. NOVO — Coleta 43 com **Valor R$ 5.885** + Peso NF/Atual

A nota [32 §2](./32-lane-galpao-indicadores-status-e-tabela-coleta.md#2-anexo-b--tabela-com-coluna-status) e [12 §2.2](./12-bubble-lane-calendario-e-painel-galpao-coleta.md#22-tabela-com-status) já mostraram a tabela com colunas `Valor`, `Peso NF`, `Peso Atual` e `Status` — mas **com células vazias** no exemplo capturado. Hoje (2026-04-11) a tabela tem **dado real**:

| ID | Data | Nº NF | Empresa | **Valor** | Galpão | **Peso NF** | **Peso Atual** | Status |
|----|------|-------|---------|-----------|--------|-------------|----------------|--------|
| **43** | 11/04/26 12:55 | 007 | ATMOSFERA … TEXTEIS S.A. | **R$: 5.885** | **Nova Mirim** | **606599** | **628552** | **Produção** |

### Achados novos

- **Primeiro VALOR em R$ visto no Bubble:** `R$ 5.885`. **Importante:** todos os outros painéis (Financeiro [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md), Emitir Nota [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md), Expedição Michele [66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md)) **não mostram valor monetário** — só quantidade. Aqui, na tabela de coleta, o valor aparece. **Sugere que `Valor` está atado ao pedido de coleta (entrada de MP), não ao pedido de cliente.**
- **`Peso NF: 606599` vs `Peso Atual: 628552`** — diferença de **+21.953**. Sem unidade de medida clara: provavelmente **g** (606 kg vs 628 kg de MP recebida da Atmosfera, coerente com nota fiscal real). No 3.0: **sempre kg como SI**.
- **`Galpão: Nova Mirim`** aparece preenchido — contradiz [59 §1.3](./59-bubble-triagem-painel-operador-status-servico.md#13-achados-imediatos-da-grelha): existe nos dados, **não existe** no dropdown de filtro.
- **`Nº NF: 007`** — número curto, formato livre (não SEFAZ).

---

## 4. NOVO — `STATUS DE SERVIÇO` do filtro tem **9 valores diferentes** dos vistos em Triagem

Confirmação importante de que o Bubble **não tem fonte única** para o enum de status:

```
Triagem ([59 §2]):       Planejamento, Chegada de Caminhão, Descarregamento,
                          Estocagem, Costureira, Produção, Pausa, Finalizado    (8 valores)

Galpão (esta nota):       Planejamento Coleta, Entrada de Coleta, Pesagem,
                          Costureira, Repanol, Produção, Estoque, Expedição,
                          Finalizado                                              (9 valores)
```

| Status | Em Triagem? | No Galpão? |
|--------|:-----------:|:----------:|
| Planejamento [Coleta] | ✅ (sem "Coleta") | ✅ (com "Coleta") |
| Chegada de Caminhão | ✅ | ❌ |
| Descarregamento | ✅ | ❌ |
| Entrada de Coleta | ❌ | ✅ |
| Pesagem | ❌ | ✅ |
| Costureira | ✅ | ✅ |
| Repanol | ❌ | ✅ |
| Estocagem / Estoque | ✅ "Estocagem" | ✅ "Estoque" |
| Produção | ✅ | ✅ |
| Pausa | ✅ | ❌ |
| Expedição | ❌ | ✅ |
| Finalizado | ✅ | ✅ |

**12 valores únicos no total**, **3 em ambos**, **9 que aparecem só num lado**. Resolver no 3.0 com **`enum coletaStatus`** central.

---

## 5. NOVO — Segunda secção da página: `EXPEDIÇÃO` com botão **LIBERAR**

**Esta é a parte mais importante** desta nota — **não documentada** em 12 nem em 32.

A página `tecnopano` tem **duas tabelas distintas**: a tabela de coleta no topo (já documentada em 12/32) **e**, abaixo do calendário, uma segunda secção titulada **`EXPEDIÇÃO`** que é a **fila de pedidos da Lane** — mesma data dos 90 itens do Financeiro/Emitir Nota mas **com botão `LIBERAR`** por linha. Esta secção bate com a **imagem `67` que o utilizador forneceu**.

### 5.1 Filtros próprios

`DATA INICIAL` · `DATA FINAL` · **`STATUS ENTREGA`** (`Pendente`/`Liberado`) · **`DATA RETIRADA`**

### 5.2 Colunas (16 colunas — vista mais larga do Bubble inteiro)

`AÇÕES` · `DATA CRIAÇÃO` · `DATA ENTREGA` · `ROTA` · `PESO MÉDIO (TARA)` · **`LOGÍSTICA`** · `ID` · `QTDE PEDIDO` · **`QTDE ESTOQUE`** · `UNIDADE DE MEDIDA` · `STATUS ENTREGA` · `STATUS FINANCEIRO` · **`STATUS MISSÃO NOTA`** · `OBS ESCRITÓRIO` · `COMUNICAÇÃO` · `OBS GALPÃO`

+ bloco lateral: `Usuário`, `ID CLIENTE`, `CNPJ`, `EMPRESA`, `TIPO MATERIAL`, `MEDIDA`, `ACABAMENTO`, `COR`, **`DATA EMISSÃO NF`**, `Nº NOTA FISCAL`

### 5.3 Comparação com a vista da Michele ([66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md))

| Campo | Michele (66) | Lane (esta nota) |
|-------|:------------:|:----------------:|
| Botão `LIBERAR` | ❌ | ✅ vermelho por linha |
| `LOGÍSTICA` | ❌ | ✅ (vazia) |
| `QTDE ESTOQUE` | ❌ | ✅ (**0 em todas** as linhas vistas) |
| `STATUS MISSÃO NOTA` | ❌ | ✅ `Pendente` em todas |
| `DATA EMISSÃO NF` | ❌ | ✅ (vazia) |
| `Nº NOTA FISCAL` | ❌ | ✅ (vazio) |
| `RESPONDER` | ✅ | ✅ |
| `COMUNICAR` (em vez de RESPONDER) | ❌ | ✅ no pedido **84** |

A vista da Lane tem **6 colunas a mais** que a vista da Michele — esperado, porque a Lane tem responsabilidade de **liberar** com base em estoque + status financeiro + missão nota.

### 5.4 Achado-chave: deadlock operacional `QTDE ESTOQUE = 0`

Em **todas** as 10 linhas observadas, `QTDE ESTOQUE` está a **0**. Pedidos abertos há semanas (entrega prevista 06/02 a 20/02, IDs 84-95) sem stock disponível — coerente com o `KILOS REALIZADOS = 5.882 kg` que cobre **um único** lote. 

**Conclusão:** a Lane **não consegue clicar `LIBERAR`** porque não há stock para sair. Os 90 pedidos do Financeiro/Emitir Nota estão **bloqueados** neste hand-off. **Isto é a evidência observável da frase do utilizador:**

> «no Bubble, não tem automação direito. Não tem rastreabilidade.»

A produção física (5.882 kg) **existe** mas o stock disponível para expedir **continua a marcar 0**, porque o link `produção → estoque → expedição` não foi materializado no Bubble.

> **Resolução no 3.0 (requisito R2 do user, sessão 2026-04-11):** ver [69 §2 — Stock disponível ≠ reservado](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md#2-requisito-r2--stock-disponível--reservado-ao-fazer-o-pedido-de-expedição-michele). A coluna `QTDE ESTOQUE` deve ser **3 colunas** (`total`, `reservado`, `disponivel`), e cada produção deve **nascer** ligada a um `pedidoItem`, materializando o link que falta.

### 5.5 `STATUS MISSÃO NOTA` — terminologia nova

Todas as linhas estão em `Pendente`. **`MISSÃO NOTA`** = a missão de emitir a NF, atribuída ao **Leinardo** (perfil `emissao_nf`, ver [04](./04-perfis-menu-michele-vs-admin.md)). No 3.0, manter o nome da UI ("Missão Nota") por familiaridade da equipa, mas no schema usar `notaFiscalStatus` ou similar.

### 5.6 `LOGÍSTICA` — coluna sem dado

Coluna existe mas **vazia** em todas as linhas. Pendente: confirmar com o utilizador o que vai ali (motorista? veículo? rota detalhada?). Possível ligação com o módulo Motorista do 3.0.

### 5.7 Pedido **84** — caso especial: incompleto + `COMUNICAR` em vez de `RESPONDER`

| Campo | Pedido 84 |
|-------|-----------|
| PESO MÉDIO (TARA) | **0Kg** (vazio) |
| QTDE PEDIDO | **vazio** |
| QTDE ESTOQUE | 0 |
| Rota | **Q** (letra alta, pouco usada) |
| Cliente | CET |
| Botão | **`COMUNICAR`** (não `RESPONDER`) |

> **Interpretação:** o pedido foi criado **incompleto** pela Michele, e o botão `COMUNICAR` é o que a Lane usa para **iniciar** uma conversa com o escritório (vs `RESPONDER` quando já há OBS para responder). Estado de UX importante para reproduzir no 3.0: o botão muda de label conforme há ou não comunicação prévia.

### 5.8 Pedido **85** — apareceu na Lane mas não na página 1 do Financeiro

ID 85 (06/02/26, BTM, 742 kg, Avental G Verde, Rota N, OBS GALPÃO `"teste"`) está nesta secção mas **não** estava na página 1 do Financeiro ([62 §1.3](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md#13-linhas-observadas-página-1-1-a-90-de-90--vista-totalmente-carregada)) — provavelmente diferença de ordenação. **Pendente:** ver se as duas vistas têm a **mesma contagem total** (deveriam, se for a mesma fonte de dados).

---

## 6. NOVO — Funil `INDICADORES DE STATUS GERAL` (números de hoje)

A nota [32 §1](./32-lane-galpao-indicadores-status-e-tabela-coleta.md#1-anexo-a--indicadores-de-status-geral--produção-e-mapa) descreveu **os cartões** sem valores. Hoje os números são:

| Status | Contagem |
|--------|----------|
| **PLANEJAMENTO** | **19** |
| ENTRADA DE COLETA | 0 |
| PESAGEM | 0 |
| **COSTUREIRA** | **1** |
| **REPANOL** | **1** |
| **PRODUÇÃO** | **13** |
| ESTOQUE | 0 |
| EXPEDIÇÃO | 0 |
| FINALIZADO | 0 |

### Achado: o funil **não** corresponde aos 90 itens do Financeiro

**19 + 13 + 1 + 1 = 34 pedidos activos**, mas há **90 itens** em fila no Financeiro/Emitir Nota. **Onde estão os outros 56?** Possíveis explicações:

1. Os 90 itens do Financeiro são **`PedidoItem`** (linhas), não pedidos. Cada pedido pode ter várias linhas → 34 pedidos × ~3 linhas ≈ 90 ✅ **mais provável**.
2. Há pedidos finalizados que foram **excluídos** do funil por filtro de data/galpão.

**Conclusão para o 3.0:** distinguir claramente **pedido** vs **item de pedido** no schema — `PedidoCliente` (cabeçalho) + `PedidoItem[]` (linhas).

---

## 7. NOVO — Mapa Google centrado em **Manhattan, NY** (default não configurado)

Mapa Google embutido na página com coordenadas `(40.72743, -74.00595)` = **Lower Manhattan**. É o **default** do plugin Bubble sem geolocalização real configurada. Não tem pinos, não tem rotas — só "está lá" como espaço reservado.

> **3.0:** mapa real centrado nos galpões (Vicente, Oceânica, Nova Mirim) com pinos por motorista LIVE (GPS) + rotas A-S sobrepostas.

---

## 8. Resumo dos achados desta sessão

1. **A2 (5555 kg) = lote enviado à Madalena Mister = pedido 43** → primeira reconciliação completa do pedido pela rede de tabelas Bubble
2. **27 tipos de material** (catálogo completo, não 8)
3. **5.882 kg** match perfeito com [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado)
4. **R$ 5.885** primeiro valor monetário visível no Bubble
5. **STATUS DE SERVIÇO divergente** entre Triagem (8) e Galpão (9) → **12 valores únicos** combinados
6. **Segunda secção `EXPEDIÇÃO` na mesma página** com `LIBERAR`/`COMUNICAR`/`STATUS MISSÃO NOTA` → não documentada antes
7. **Deadlock `QTDE ESTOQUE = 0`** em 10/10 linhas → evidência observável de "sem rastreabilidade"
8. **Pedido 84 incompleto + Pedido 85** novo na Lane → indica que a fila tem ordenações diferentes por painel
9. **Funil 34 pedidos vs 90 itens** → confirma que `PedidoItem` é o nível dos 90 (cabeçalho × linhas)
10. **Mapa Google em Manhattan** → não configurado

---

## 9. Pendente para confirmar com o utilizador

- [ ] `LOGÍSTICA` — o que vai nessa coluna quando preenchida?
- [ ] `Peso NF: 606599` está em **g** ou **kg**? Confirmar unidade.
- [ ] Pedido `84` — porque está com qtde/peso vazios? Quem tem de completar (Michele ou Lane)?
- [ ] No 3.0, `pedidoCliente` deve agrupar várias linhas por NF (1 NF = N linhas)?
- [ ] Os pedidos parados em `Pendente Aprovação` há 2 meses (entregas 06/02 a 20/02) — são **dados de teste** ou são fila real bloqueada?
