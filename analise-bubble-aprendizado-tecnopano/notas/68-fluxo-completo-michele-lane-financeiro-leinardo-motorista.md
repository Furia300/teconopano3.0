# Fluxo end-to-end Bubble — Michele → Lane → Financeiro → Leinardo → Motorista

> **Esta nota sintetiza** a narrativa do utilizador (sessão 2026-04-11) com as observações MCP das notas 58–67 e as notas 01–56 do Cursor. **Não substitui** as notas individuais — é o **mapa que liga tudo** e responde à pergunta "como funciona hoje no Bubble da Tecnopano, ponta a ponta?"

**Citação âncora do utilizador:**

> «A **Expedição** é a área que pede a matéria-prima ao motorista, mas hoje não está optimizado. A Expedição (= colaboradora **Michele**) faz o pedido para o galpão produzir conforme a tabela da Expedição. A tabela de Expedição da colaboradora **Lane** (galpão, parte operacional) **aprova** quando está pronto. **O Financeiro só libera a carga** quando aprova conforme sua respectiva tabela. **O Leinardo da emissão de nota emite a nota e manda o motorista** mandar para o cliente conforme a rota que vai de A a Z. **No Bubble não tem automação direito. Não tem rastreabilidade.** Hoje **não tem RH no Bubble**, mas eles (Cursor) incluíram no 3.0.»

---

## 1. Os 5 papéis do fluxo

| # | Papel | Pessoa real | Onde trabalha no Bubble | Notas |
|---|-------|-------------|------------------------|-------|
| 1 | **Expedição (escritório)** | **Michele** | Menu **Coleta** (pedido para fornecedor) + menu **Expedição** (pedido para galpão produzir) | [03](./03-inicio-pedido-coleta-michele.md), [04](./04-perfis-menu-michele-vs-admin.md), [06](./06-bubble-ui-coleta-via-mcp.md), [07](./07-bubble-cadastro-coleta-modal.md), [66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md) |
| 2 | **Galpão (operacional)** | **Lane** (Alane) | Menu **Galpão** (`PAINEL DE CONTROLE GALPÃO`, URL `tecnopano`) | [12](./12-bubble-lane-calendario-e-painel-galpao-coleta.md), [32](./32-lane-galpao-indicadores-status-e-tabela-coleta.md), [67](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md) |
| 3 | **Financeiro** | (sem nome confirmado) | Menu **Financeiro** | [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md) |
| 4 | **Emissão de Nota** | **Leinardo** | Menu **Emitir Nota** (`Emissão de Nota`) | [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md) |
| 5 | **Motorista** | (sem cadastro no Bubble) | Apenas **assinaturas** dentro do popup costureira | [02](./02-fluxo-coleta-mp-motorista.md), [10](./10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md), [60](./60-bubble-motorista-mesma-pagina-costureira-motorista.md) |

---

## 2. Fluxo passo-a-passo (AS-IS)

```
┌────────────────────────────────────────────────────────────────────┐
│ A. ENTRADA DE MATÉRIA-PRIMA (upstream do galpão)                    │
└────────────────────────────────────────────────────────────────────┘

  Cliente fornecedor                MICHELE                    LANE
  (ex.: Atmosfera)                 (Coleta)                  (Galpão)
        │                             │                          │
        │                             ├── 1. CADASTRAR COLETA    │
        │                             │   (ver [07])             │
        │                             │   → status:              │
        │                             │     "Planejamento Coleta"│
        │                             │                          │
        │                             ├── 2. agenda no calendário├── vê no calendário
        │                             │                          │   ([12 §1])
        │                             │                          │
        │ ◀──────────── motorista vai buscar (~90% caso) ────────┤
        │                             │                          │
        │ ──── caminhão chega ───────▶│                          ├── 3. Lane RECEBE
        │                             │                          │   ([12 §2.4-2.6])
        │                             │                          │   PESAGEM, TRIAGEM
        │                             │                          │
        │                             │                          ├── 4. abre popup
        │                             │                          │   "Gerenciamento de
        │                             │                          │   Processo por Lote"
        │                             │                          │   ([12 §2.4-2.9])
        │                             │                          │
        │                             │                          ├── 5. SEPARAÇÃO
        │                             │                          │   (CADASTRO SEPARAÇÃO,
        │                             │                          │   calculadora,
        │                             │                          │   Repanol, Renova)
        │                             │                          │
┌────────────────────────────────────────────────────────────────────┐
│ B. COSTUREIRA (paralelo)                                            │
└────────────────────────────────────────────────────────────────────┘
                                      │
                                      ├── 6. lote vai pra costureira
                                      │   (Madalena Mister, 5555 kg
                                      │    do pedido 43 — ver [60])
                                      │
                                      │   MOTORISTA + COSTUREIRA
                                      │   ASSINAM NA IDA
                                      │   (única vez que motorista
                                      │    é registado no Bubble!)
                                      │   ([60 §1] confirmação user)
                                      │
                                      │   COSTURANDO ── ── ──▶│
                                      │                       │
                                      │   ◀── ── DEVOLUÇÃO ── │
                                      │                       │
                                      │   MOTORISTA + COSTUREIRA
                                      │   ASSINAM NA DEVOLUÇÃO
                                      │
┌────────────────────────────────────────────────────────────────────┐
│ C. PRODUÇÃO (no galpão, sala FAIXA/CORTE/COSTURA/EMBALAGEM)         │
└────────────────────────────────────────────────────────────────────┘
                                      │
                                      ├── 7. PRODUÇÃO no galpão
                                      │   (cada sala — ver [42], [54])
                                      │   → tipo, cor, medida,
                                      │     unidade (kg ou un)
                                      │   ([38 §1-2])
                                      │
                                      ├── 8. REGISTRAR PRODUÇÃO
                                      │   (5.882 kg → tabela
                                      │   PRODUÇÃO REALIZADA)
                                      │   ([38 §3])
                                      │
                                      ├── 9. ENCAMINHAR PARA ESTOQUE
                                      │   = embalagem no 3.0
                                      │   STATUS: Pendente → Enviado
                                      │   ([38 §3.1])
                                      │
┌────────────────────────────────────────────────────────────────────┐
│ D. PEDIDO DO CLIENTE (paralelo, começa em qualquer momento)         │
└────────────────────────────────────────────────────────────────────┘

  Cliente B2B                      MICHELE                       LANE
  (BTM, CET, Atlas,               (Expedição)               (Galpão Lane)
   Titanium...)                       │                          │
        │                             │                          │
        │ ── liga / email ──────────▶│                          │
        │                             │                          │
        │                             ├── 10. CADASTRAR pedido   │
        │                             │   no menu Expedição      │
        │                             │   ([66])                 │
        │                             │   → STATUS ENTREGA       │
        │                             │     = Pendente           │
        │                             │   → STATUS FINANCEIRO    │
        │                             │     = Pendente Aprov.    │
        │                             │   → ROTA atribuída       │
        │                             │     (A-S, Spot, Retire   │
        │                             │     Aqui, VLI)           │
        │                             │   → linha aparece em     │
        │                             │     todos os painéis     │
        │                             │                          │
        │                             ├── 11. comunica via       │
        │                             │   OBS GALPÃO/COMUNICAR ◀▶├── 12. Lane responde
        │                             │   (chat embutido         │   via OBS GALPÃO /
        │                             │    na linha)             │   RESPONDER
        │                             │                          │
        │                             │                          ├── 13. quando produção
        │                             │                          │   pronta (= sai do
        │                             │                          │   passo 9 + atribui
        │                             │                          │   ao pedido):
        │                             │                          │
        │                             │                          ├── 14. clica LIBERAR
        │                             │                          │   no painel galpão
        │                             │                          │   (secção EXPEDIÇÃO,
        │                             │                          │   ver [67 §5])
        │                             │                          │   → STATUS ENTREGA
        │                             │                          │     Pendente → Liberado
        │                             │                          │
┌────────────────────────────────────────────────────────────────────┐
│ E. APROVAÇÃO FINANCEIRA                                             │
└────────────────────────────────────────────────────────────────────┘
                                                                  │
                                                          FINANCEIRO
                                                                  │
                                                                  ├── 15. vê na fila
                                                                  │   "Pendente Aprovação"
                                                                  │   ([62])
                                                                  │
                                                                  ├── 16. valida valor,
                                                                  │   condições
                                                                  │
                                                                  ├── 17. clica APROVAR
                                                                  │   → STATUS FINANCEIRO
                                                                  │     Pendente → Aprovado
                                                                  │
┌────────────────────────────────────────────────────────────────────┐
│ F. EMISSÃO DE NOTA                                                  │
└────────────────────────────────────────────────────────────────────┘
                                                                  │
                                                       LEINARDO (Emissão Nota)
                                                                  │
                                                                  ├── 18. vê fila já
                                                                  │   aprovada ([63])
                                                                  │
                                                                  ├── 19. emite NF
                                                                  │   EXTERNAMENTE
                                                                  │   (não no Bubble)
                                                                  │
                                                                  ├── 20. registra
                                                                  │   Nº NOTA FISCAL
                                                                  │   + DATA EMISSÃO NF
                                                                  │   no Bubble
                                                                  │   → STATUS MISSÃO NOTA
                                                                  │     Pendente → ?
                                                                  │
┌────────────────────────────────────────────────────────────────────┐
│ G. ENTREGA AO CLIENTE                                               │
└────────────────────────────────────────────────────────────────────┘
                                                                  │
                                                          MOTORISTA
                                                          (sem registo
                                                           no Bubble!)
                                                                  │
                                                                  ├── 21. recebe ordem
                                                                  │   verbal/papel
                                                                  │   "vai entregar
                                                                  │   rota X"
                                                                  │
                                                                  ├── 22. entrega cliente
                                                                  │   B2B final
                                                                  │   SEM ASSINATURA
                                                                  │   SEM FOTO
                                                                  │   SEM GPS
                                                                  │   SEM REGISTO
                                                                  │
                                                                  ├── 23. cliente recebe
                                                                  │
                                                                  └── pedido fica
                                                                      eternamente em
                                                                      "Pendente" no
                                                                      Bubble.
```

---

## 3. As 5 falhas estruturais do Bubble (síntese)

### 3.1 Falha #1 — `QTDE ESTOQUE = 0` em todas as 90 linhas (deadlock observável)

A produção real (`KILOS REALIZADOS = 5.882 kg` em [67 §2](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#2-novo--indicadores-de-produção-confirma-os-5882-kg-de-38-31)) **existe**, mas a coluna `QTDE ESTOQUE` na fila da Expedição da Lane **continua zero** ([67 §5.4](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#54-achado-chave-deadlock-operacional-qtde-estoque--0)). Resultado: **a Lane não consegue clicar `LIBERAR`** porque não há stock para sair → 90 itens parados há 2 meses.

**Esta é a evidência observável** da frase do utilizador *"não tem automação direito"*: o link `produção realizada → estoque disponível` **nunca** foi materializado.

### 3.2 Falha #2 — 3 valores diferentes de peso para o mesmo pedido 43

| Tabela | Peso | Documento |
|--------|------|-----------|
| `REGISTRAR PRODUÇÃO` (modal produção) | **5.882 kg** | [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado) |
| `Estoque` (após `ENCAMINHAR PARA ESTOQUE`) | **5.940 kg** | [58 §1.2](./58-bubble-estoque-listagem-filtros-retirar.md#12-tabela) |
| `Costureira/Motorista` (envio Madalena) | **5.555 kg** | [60 §1.4](./60-bubble-motorista-mesma-pagina-costureira-motorista.md#15-reconciliação-com-o-pedido-43-avental-corte-reto-p-florzinha) |
| `INDICADORES SEPARAÇÃO A2` (galpão) | **5.555 kg** | [67 §1](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#1-novo--indicadores-de-status-separação-catálogo-completo-de-27-materiais) |

Os números **não fecham**. Não há **um único** lote rastreável — cada tabela tem o seu próprio kg, sem amarração contábil. **Esta é a evidência observável** da frase *"não tem rastreabilidade"*.

### 3.3 Falha #3 — `STATUS DE SERVIÇO` divergente entre páginas

**12 valores únicos no total**, **3 em ambas Triagem e Galpão**, **9 só num lado**. Não há fonte única ([67 §4](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#4-novo--status-de-serviço-do-filtro-tem-9-valores-diferentes-dos-vistos-em-triagem)).

### 3.4 Falha #4 — Galpão `Nova Mirim` existe nos dados mas **não no dropdown**

Confirmado em [59 §1.3](./59-bubble-triagem-painel-operador-status-servico.md#13-achados-imediatos-da-grelha) (Triagem), [58 §1.1](./58-bubble-estoque-listagem-filtros-retirar.md#11-cabeçalho-de-filtros) (Estoque) e [67 §3](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md#3-novo--coleta-43-com-valor-r-5885--peso-nfatual). O dropdown só lista `Oceânica` e `Vicente`, mas o valor real do pedido 43 é `Nova Mirim` — **filtros bugados**.

### 3.5 Falha #5 — Motorista sem cadastro, sem rastreio, sem assinatura no cliente final

Único registo de "motorista" no Bubble são as **2 assinaturas costureira ↔ galpão** ([60 §1 update](./60-bubble-motorista-mesma-pagina-costureira-motorista.md)). Para o cliente B2B final (CET, BTM, Atlas, Titanium) **não há nada**:

- ❌ Cadastro motorista (CNH, veículo)
- ❌ Histórico de viagens
- ❌ Comprovante de entrega
- ❌ GPS / tracking
- ❌ Vínculo motorista ↔ rota (apesar das 22 rotas A-S + Spot + Retire Aqui + VLI existirem)

---

## 4. O que **não existe** no Bubble (gap absoluto)

| Inexistente no Bubble | Onde deveria existir | Estado no Tecnopano 3.0 |
|----------------------|---------------------|-------------------------|
| **RH / Funcionários** | Todo o sistema | Cursor já adicionou os perfis `rh`, `producao`, `separacao`, `motorista`, `costureira`, `michele` em `server/routes.ts` (uncommitted) e tem rota `/rh` ativa |
| **Cadastro de motorista** | Menu Motorista (que hoje abre costureira) | Perfil `motorista` criado; falta CRUD + app mobile |
| **Stock real (qtde disponível) com reserva** | `QTDE ESTOQUE` da Lane | **Requisito R2 do utilizador (2026-04-11) — ver [69 §2](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md#2-requisito-r2--stock-disponível--reservado-ao-fazer-o-pedido-de-expedição-michele).** Stock deve distinguir `total`/`reservado`/`disponível`; resolve o deadlock §3.1 |
| **Recorrência programada de cliente** | Dashboard Michele | **Requisito R4 do utilizador — ver [69 §4](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md#4-requisito-r4--dashboard-com-periodicidade-de-cliente--recorrência-programada-por-1-ano).** Programar pedidos automáticos por 1 ano (semanal/3 dias/15 dias/mensal) |
| **Edição global (todos colaboradores)** | Toda fila de pedidos | **Requisito R3 do utilizador — ver [69 §3](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md#3-requisito-r3--edição-disponível-para-todos-os-colaboradores).** Edição com auditoria, todos os perfis que veem podem editar |
| **API IA integrada** | Sidebar Michele/Financeiro/Admin | **Requisito R5 do utilizador — ver [69 §5](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md#5-requisito-r5--api-ia-integrada-já-contratada-externamente--falta-integrar).** Provedor já contratado (pendente confirmar qual); tools de leitura + escrita no 3.0 |
| **Conservação de peso entre estados** | Cada hand-off (produção → estoque → costureira → expedição) | Não modelado ainda — usar `pesoOrigem`, `pesoDestino`, `delta`, `motivoDelta` |
| **Comprovante de entrega ao cliente** | Hand-off motorista → cliente B2B | Faltando — sugestão app PWA com assinatura + GPS + foto |
| **Status do funil sincronizado** | Triagem ↔ Galpão | Resolver com `enum coletaStatus` central em `shared/` |
| **Catálogo único de materiais** | Estoque/Card/Triagem/Produção/Galpão | Resolver com tabela `produtos` única (parcialmente em [64](./64-bubble-produtos-registro-skus-peso-medio.md)) |
| **Pedido vs item de pedido** | Toda a fila de 90 itens | Implementar `PedidoCliente` (cabeçalho) + `PedidoItem[]` (linhas) |
| **Gamificação por colaborador** | Galpão | Documentado em [41](./41-tecnopano-30-producao-salas-gamificacao-rh.md), pendente API RH |
| **Dashboards (produção + costureira)** | Galpão / Admin | Documentado em [41 §6](./41-tecnopano-30-producao-salas-gamificacao-rh.md#6-dashboards--produção-e-costureira-galpão-admin-e-colaboradores) |
| **Validação de schema** | Cadastros (clientes, costureiras, produtos) | Bugs reais vistos: `Gisele isso` ([60](./60-bubble-motorista-mesma-pagina-costureira-motorista.md#13-catálogo-de-costureiras-21-nomes-vistos-no-dropdown)), `MARENOSTRUM CONSUTORIA` ([65](./65-bubble-clientes-overlay-cnpj-razao-182-clientes.md#13-linhas-observadas-página-1-5-linhas)), `Acabamento Ferro` para Gaiola ([64](./64-bubble-produtos-registro-skus-peso-medio.md)), card `Acabamento` mostrando ID ([61](./61-bubble-card-estoque-cards-ranking.md)) |

---

## 5. Os 4 papéis da Michele (importante!)

Confusão histórica nas notas anteriores: **a Michele faz dois pedidos diferentes**, em dois menus diferentes:

| Papel da Michele | Menu Bubble | Que pedido faz | Status inicial | Documentado em |
|------------------|-------------|----------------|----------------|----------------|
| **Comprar matéria-prima** | **Coleta** | Pedido para fornecedor (Atmosfera, Chocolate Têxtil) **trazer pano usado** para reciclar | `Planejamento Coleta` | [03](./03-inicio-pedido-coleta-michele.md), [07](./07-bubble-cadastro-coleta-modal.md) |
| **Receber pedido do cliente** | **Expedição** | Pedido do cliente B2B (BTM, CET, Atlas, Titanium) → galpão produzir | `Pendente`/`Pendente Aprovação` | [66](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md) |

Mais dois papéis não capturados ainda mas mencionados pelo utilizador:

| Papel | Onde | Pendente |
|-------|------|----------|
| **Cadastrar fornecedor/cliente novo** | Popup `+CADASTRAR EMPRESA` no fluxo de Coleta + modal `CADASTRAR CLIENTE` no Clientes overlay | Confirmado em [09](./09-bubble-cadastro-empresa-modal.md) (fornecedor) e [65 §1.1](./65-bubble-clientes-overlay-cnpj-razao-182-clientes.md#11-filtros) (cliente) — modal não aberto ainda |
| **Pedir matéria-prima ao motorista** | (?) — utilizador disse *"a Expedição é a área que pede a matéria-prima ao motorista"*. **Não está claro** se isto é distinto do pedido de Coleta ou se é sinônimo | **Pendente confirmar** com o utilizador: é a mesma acção do menu Coleta, ou há um terceiro modal? |

---

## 6. As 22 rotas oficiais do Bubble (do dropdown da Expedição da Michele)

Confirmadas em [66 §2.1](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md#21-filtros):

| Letra | Notas |
|-------|-------|
| **A** a **S** | 19 letras (não vai até Z, como o utilizador disse "rota A a Z" — máximo é S) |
| **Rota Spot** | rota especial (avulsa?) |
| **Rota Retire Aqui** | cliente vem buscar (sem motorista) |
| **Rota VLI** | provavelmente operação dedicada VLI (cliente grande?) |

> **Pendente:** confirmar com utilizador se T-Z foram removidas, se as letras correspondem a regiões (Norte, Sul, etc.), e se há mapeamento `letra → cidades cobertas`.

---

## 7. Tecnopano 3.0 — direcção (TO-BE) por papel

| Papel | TO-BE no 3.0 | Estado no diff Cursor (uncommitted) |
|-------|---------------|--------------------------------------|
| **Michele Coleta** | `/coleta` com modal `Pedido de coleta` (renomeado de "Nova Coleta") + status `pendente`/`agendado`/`em_rota`/`recebido`/`em_separacao`/`em_producao`/`finalizado` | ✅ Cursor já tem (ver `client/src/pages/coleta/ColetaList.tsx` + `NovaColetaDialog.tsx`); status `em_rota` adicionado mas ainda **não há badge na UI** para ele |
| **Michele Expedição** | `/expedicao` página própria (não overlay) com `PedidoCliente` (cabeçalho) + `PedidoItem[]` (linhas) | ❌ não criado ainda — **gap a fechar** |
| **Lane Galpão** | `/galpao` com 3 abas: Indicadores, Coleta, Expedição (a fila com `LIBERAR`) | ⚠️ `DashboardGalpao.tsx` existe mas só com KPIs; falta a fila `LIBERAR` |
| **Financeiro** | `/faturacao?aba=aprovacao` com agrupamento por cliente/rota e botão APROVAR em lote | ❌ não criado ainda |
| **Leinardo Emissão NF** | `/faturacao?aba=emitir` com integração externa (NFE.io / Bling / Omie) | ❌ integração de NFe não escolhida ainda |
| **Motorista** | App PWA mobile com fila de tarefas + assinatura digital + GPS + foto | ❌ Cursor adicionou perfil `motorista` em `PERFIL_LOGIN_VALUES` mas falta toda a UI mobile |
| **RH (novo)** | `/rh` com sincronização API ControlID/RHiD | ⚠️ `/rh` existe (ver memory `rhid_api`), falta integração concreta com gamificação ([41 §3](./41-tecnopano-30-producao-salas-gamificacao-rh.md#3-rh-e-dados-de-colaboradores)) |

---

## 8. Pendente para confirmar com o utilizador (consolidado)

Já **respondidas** nesta conversa:
- ✅ "ENCAMINHAR PARA ESTOQUE" = embalagem no 3.0 ([38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado))
- ✅ Motorista assina ida e devolução com a costureira ([60](./60-bubble-motorista-mesma-pagina-costureira-motorista.md))
- ✅ Estoque tem modo tabela e modo card ([58](./58-bubble-estoque-listagem-filtros-retirar.md), [61](./61-bubble-card-estoque-cards-ranking.md))
- ✅ Não tem RH no Bubble (Cursor adicionou no 3.0)
- ✅ Não tem automação nem rastreabilidade (evidência observável em 67 §5.4)

**Pendentes** (para próxima sessão):
- [ ] "A Expedição pede a MP ao motorista" — é o mesmo que o pedido de Coleta, ou é um terceiro modal?
- [ ] As **22 rotas** A-S + Spot + Retire Aqui + VLI — qual o mapa real (quais cidades, quais motoristas)?
- [ ] `STATUS MISSÃO NOTA` — quais os outros valores além de `Pendente`? (`Em emissão`, `Emitida`, `Erro`?)
- [ ] `LOGÍSTICA` — coluna vazia da Lane: o que vai ali?
- [ ] `Peso NF: 606599` — em **g** ou **kg**?
- [ ] As coletas paradas em "Pendente Aprovação" há 2 meses — são teste ou fila real?
- [ ] Pedido `84` (incompleto, Q, sem qtde) — quem deve completar?
- [ ] No 3.0, a Michele continua com **dois menus** (Coleta + Expedição) ou unifica?

---

## 9. Próximos passos sugeridos para a colaboração

1. **Tirar print do modal `CADASTRAR`** da Expedição da Michele para entender o form completo (campos, validações)
2. **Tirar print do modal `CADASTRAR`** do menu Clientes para o cadastro completo dos campos (CNPJ, IE, endereço, etc.)
3. **Clicar no botão `LIBERAR`** numa linha de teste da Lane para ver o que acontece (fluxo de validação ou apenas mudança de status?)
4. **Clicar em `APROVAR`** numa linha de teste do Financeiro para ver o efeito downstream
5. **Clicar em `RESPONDER`** numa OBS GALPÃO para ver o modal de chat
6. **Confirmar mapeamento** dos 9 status do Galpão vs 8 da Triagem com o utilizador (cada nome o que representa de facto na operação)
7. Quando os 6 acima estiverem confirmados, **o 3.0 pode começar a refazer** os módulos Expedição e Galpão com a UX validada (sem reproduzir os 5 deadlocks)
