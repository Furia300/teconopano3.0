# Bubble — **Motorista** abre `costureira_motorista` (mesma página da Costureira)

**Print:** [`../imagens/capturas-bubble/60-bubble-motorista-mesma-pagina-costureira-motorista.png`](../imagens/capturas-bubble/60-bubble-motorista-mesma-pagina-costureira-motorista.png)

**Origem (MCP):** menu **Motorista** → URL `https://operation.app.br/version-test/costureira_motorista?debug_mode=true` → título **COSTUREIRA / MOTORISTA**.

**Surpresa #2** (depois de [59-bubble-triagem-painel-operador-status-servico.md](./59-bubble-triagem-painel-operador-status-servico.md)): clicar em **Motorista** **não** abre cadastro de motoristas — abre a **mesma página** da costureira. No Bubble da Tecnopano, **“Motorista” = página de envio/devolução da costureira pelo motorista**, e não um módulo de gestão de motoristas em si.

Isto reforça a observação da [nota 02-fluxo-coleta-mp-motorista.md](./02-fluxo-coleta-mp-motorista.md): **o motorista no Bubble não tem cadastro/identificação própria** — ele é apenas o veículo que liga galpão↔costureira, e tudo é registado do ponto de vista do **pedido/lote** que ele transporta.

### Confirmação do utilizador (sessão 2026-04-11)

> «O motorista hoje no Bubble só pega dados para ele ir na costureira. Aí ele e a costureira **assinam na ida**, e quando vai devolver **assinam de novo**.»

Ou seja, o **único** registo de "motorista" no Bubble são as **2 assinaturas por lote** (envio + devolução) capturadas no popup da costureira (ver [35-bubble-costureira-tabela-resumo-vs-popup-motorista.md §5](./35-bubble-costureira-tabela-resumo-vs-popup-motorista.md)). Não há:

- Cadastro do motorista (nome, CNH, telefone, veículo, capacidade)
- Histórico de viagens por motorista
- Vinculação rota↔motorista (apesar das rotas A-S existirem na Expedição da Michele — ver [66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md §2.1](./66-bubble-expedicao-michele-pedido-cliente-rotas-comunicacao.md#21-filtros))
- Notificação app/SMS quando há nova rota
- GPS / tracking
- Comprovante de entrega no cliente final (assinatura existe **só** para o circuito costureira ↔ galpão; para a entrega ao cliente B2B final, **não** há assinatura nem comprovante registado no Bubble)

**No 3.0** o motorista deve ser **um perfil próprio** (Cursor já adicionou `motorista` em `PERFIL_LOGIN_VALUES` no diff uncommitted de `server/routes.ts`) com:

1. Cadastro: nome, CPF, CNH (validade), veículo, contacto
2. App/PWA mobile com fila de tarefas (envios à costureira + entregas a cliente + retiradas da Atmosfera)
3. Captura de assinatura digital + foto do produto + GPS no momento de cada hand-off
4. Histórico auditável por motorista (vai para a futura gamificação RH — ver [41 §2](./41-tecnopano-30-producao-salas-gamificacao-rh.md#2-forma-de-trabalho--duplas-ou-individual))

---

## 1. Layout AS-IS

### 1.1 Filtros (`FILTRO PESQUISA`)

| Campo | Tipo | Observação |
|-------|------|------------|
| **DATA INICIAL** | date picker | exemplo `24/02/2026` |
| **DATA FINAL** | date picker | exemplo `11/04/2026` |
| **GALPÃO ENVIO** | combobox | `Oceânica`, `Vicente` (mesma lista do Estoque/Triagem — `Nova Mirim` continua sem aparecer no dropdown apesar de existir nos dados; ver [59 §1.3](./59-bubble-triagem-painel-operador-status-servico.md#13-achados-imediatos-da-grelha)) |
| **STATUS SERVIÇO** | combobox | **lista própria do fluxo costureira/motorista** — diferente do `STATUS DE SERVIÇO` da [nota 59 §2](./59-bubble-triagem-painel-operador-status-servico.md#2-achado-importante--status-de-serviço-revela-todo-o-pipeline) |
| **COSTUREIRA** | combobox | catálogo nominal — **21 costureiras** vistas (lista completa abaixo) |

### 1.2 STATUS SERVIÇO próprio da costureira/motorista (5 estados)

1. **Enviar Costureira** — pedido pronto no galpão, aguarda saída do motorista
2. **Em Caminhão Envio** — motorista a caminho da costureira
3. **Costurando** — entregue, costureira está a costurar
4. **Em Caminhão Devolução** — motorista a buscar para trazer de volta
5. **Finalizado** — pedido devolvido ao galpão

> Estes 5 estados são **paralelos** aos 8 do `STATUS DE SERVIÇO` principal (nota 59 §2). Isto significa que **um pedido tem dois eixos de status**: o macro do pipeline geral (`Planejamento → … → Finalizado`) **e** o micro da costureira quando esse passo é necessário.
>
> No 3.0 isto deve ser modelado como **estado composto** ou **sub-status** (e.g., `coletaStatus = produção` + `costureiraStatus = costurando`), evitando colisão entre as duas listas.

### 1.3 Catálogo de costureiras (21 nomes vistos no dropdown)

`Madalena Mister`, `Gisele C. Fonseca`, `Gisele M. R. Ozzi`, `Bárbara S. Santos`, `Bruno S. Cardoso`, `Josilma M. Correia`, `Reinaldo`, `Patrícia A. Diego`, `Delma Alves`, `Elaete Teixeira`, `Márcia Matos`, `Zorilda`, `Maria luiza leonete`, `Rita Anailde`, `Zelândia de Lima`, `Andreia Cristina`, `Marcia Regina Pedro`, `Marcia garrido`, `Luana Maria`, `Julia Cássia`, `Gisele isso`.

**Observações:**

- **Naming inconsistente:** capitalização aleatória (`Maria luiza leonete`, `Marcia garrido`, `Gisele isso`), nomes incompletos (`Reinaldo`, `Zorilda`), e até um valor que parece **bug/typo** (`Gisele isso`). Confirma que o catálogo foi **digitado à mão** sem validação.
- **Bruno S. Cardoso** é provavelmente homem — costureiro. Trata como género-neutro no 3.0.
- A lista é **independente** do RH/Funcionários do 3.0 — quando o **API RH** entrar online ([41 §3](./41-tecnopano-30-producao-salas-gamificacao-rh.md#3-rh-e-dados-de-colaboradores)), estas costureiras (que são **prestadoras externas**, não CLT — apenas a `COSTURA` interna do galpão é CLT, ver [42 §10](./42-galpao-novo-nomenclatura-salas-anexos.md)) precisam de **outra** entrada (ex.: tabela `prestadores` ou `costureiras_externas`), pois RH cobre apenas funcionários internos.

### 1.4 Tabela

Colunas: `ID PEDIDO` · `KILO` · `COSTUREIRA` · `Galpão` · `STATUS`

Linhas observadas (1 página, 1 linha):

| ID | Kilo | Costureira | Galpão | Status |
|----|------|------------|--------|--------|
| **43** | **5555** | **Madalena Mister** | **Nova Mirim** | **Enviar Costureira** |

### 1.5 Reconciliação com o pedido 43 (Avental Corte-Reto P Florzinha)

O **mesmo pedido 43** já apareceu em outras notas — agora podemos **reconstituir o fluxo de pesos**:

| Onde | Peso (kg) | Documento |
|------|-----------|-----------|
| `REGISTRAR PRODUÇÃO` (input no modal de produção) | **5882** | [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado) |
| `Estoque` (após `ENCAMINHAR PARA ESTOQUE`) | **5940** | [58](./58-bubble-estoque-listagem-filtros-retirar.md#12-tabela) |
| `Costureira / Motorista` (envio para costureira Madalena Mister) | **5555** | esta nota |

**Leitura possível** (a confirmar com o utilizador):

- O peso `5882` é o que **entra** na produção (input do operador antes da costura).
- O peso `5940` no estoque pode ser o **acumulado** com outras entradas, ou o peso **após embalagem** (mais embalagem = mais peso).
- O peso `5555` enviado à costureira é **menor** que o do estoque — sugere que **só uma parte** vai para costura (o resto fica em stock como pano cortado pronto).

> **Pendente:** confirmar com o utilizador se a relação `produção → estoque → costureira` é **conservativa** (soma fechada) ou **aberta** (cada bucket é um snapshot independente). Se for conservativa, deveria haver: `5882 (produção) = 5555 (costureira) + 327 (em stock pendente)`. Mas o estoque mostra `5940`, não `327` — então **não fecha**, e a relação é provavelmente **independente** (cada tabela tem o seu próprio kg, sem amarração contábil). Isto **é o problema** que o 3.0 precisa resolver com QR + lote rastreável.

---

## 2. Tecnopano 3.0 — direcção (TO-BE)

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Página `Motorista`** | É a página de envio à costureira (`costureira_motorista`) | Separar em **dois módulos**: (a) `motoristas` — gestão CRUD do colaborador motorista (vínculo RH, CNH, veículo); (b) `entregas` ou `transportes` — registo de cada viagem (origem, destino, motorista, itens, peso, fotos/assinaturas). |
| **Catálogo de costureiras** | Texto livre, ~21 entradas com bugs de digitação | Tabela `costureiras_externas` (ou `prestadores_costura`) com CPF, contacto, endereço, capacidade kg/dia, histórico — fonte única de verdade. |
| **Status duplo** | `STATUS DE SERVIÇO` vs `STATUS SERVIÇO` (costureira) — listas paralelas, propensas a colisão | `coletaStatus` (eixo principal) + `costureiraSubStatus` (eixo opcional, só quando há envio) — evita ambiguidade. |
| **Conservação de peso** | Nenhuma — três tabelas, três valores diferentes | **Movimentos auditáveis** (`pesoOrigem`, `pesoDestino`, `delta`, `motivoDelta`) entre cada estado, ligados ao mesmo `coletaId`. |
| **Confirmação física** | Sem assinatura, sem foto | Evidência ao envio (assinatura motorista + costureira) e ao retorno (peso conferido + foto), conforme já apontado em [35-bubble-costureira §5](./35-bubble-costureira-tabela-resumo-vs-popup-motorista.md). |

---

## 3. Pendente para confirmar com o utilizador

- [ ] O catálogo de **costureiras é estável** ou tem rotatividade alta? (define se vale a pena migrar todos os 21 nomes ou recadastrar do zero no 3.0).
- [ ] **Relação peso-pedido entre tabelas** (5882 / 5940 / 5555 do pedido 43) é coincidência de teste ou erro real do Bubble? Se for real, precisa **regra de conciliação** no 3.0.
- [ ] Existe **algum** lugar no Bubble com cadastro real de motoristas (CNH, telefone, veículo)? Ou tudo é “quem entregou hoje” sem registo?
- [ ] `Bruno S. Cardoso` é mesmo um costureiro homem (caso a tratar) ou é um **motorista** entrando por engano no catálogo de costureiras?
