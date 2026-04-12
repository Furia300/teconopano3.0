# Bubble — **CADASTRO PRODUÇÃO** (micro popup) e **PRODUÇÃO REALIZADA**

**Âmbito:** documentação AS-IS do Bubble (galpão / modal de lote) e **requisitos TO-BE** para Tecnopano 3.0 — **sem** implementação de código nesta fase (alinhamento posterior).

**Relação:** fluxo após **SEPARAÇÃO REALIZADA** no mesmo modal de processo por lote — ver [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md) §2.9.

---

## 1. Abrir o micro popup **CADASTRO PRODUÇÃO**

No bloco **PRODUÇÃO** (`MESA → PRODUÇÃO → ESTOQUE`), um botão (ex.: fluxo **REGISTRAR PRODUÇÃO**) abre um modal pequeno com título **CADASTRO PRODUÇÃO**.

**Print (estado inicial — data + tipo material vazio):** [`../imagens/capturas-bubble/38-bubble-popup-cadastro-producao-inicial-tipo-material.png`](../imagens/capturas-bubble/38-bubble-popup-cadastro-producao-inicial-tipo-material.png)

- **Data:** pré-preenchida (ex.: 11/04/2026).
- **Tipo Material:** dropdown; **não** lista o catálogo completo da base — apenas tipos **já registados em SEPARAÇÃO REALIZADA** para aquele contexto de lote/pedido (ex.: **A2** e **Avental**).
- Botões **Fechar** / **Adicionar**.

---

## 2. Cascata de campos (após escolher o tipo de material)

Ao seleccionar um tipo (ex.: **Avental**), aparecem campos dependentes da **BD**, na ordem operacional descrita pelo utilizador:

1. **Acabamento** — valores conforme cadastro (ex.: *Corte-Reto*).
2. **Tamanho** — valores conforme cadastro (ex.: *P*).
3. **Cor** — valores conforme cadastro (ex.: *Florzinha*).
4. **Unidade de medida** — preenchida **automaticamente** a partir da regra do material / produto (não é escolha livre desconectada do catálogo).

**Print (formulário completo antes de gravar):** [`../imagens/capturas-bubble/39-bubble-popup-cadastro-producao-preenchido-avental-kilo.png`](../imagens/capturas-bubble/39-bubble-popup-cadastro-producao-preenchido-avental-kilo.png)

- Exemplo: **Avental**, **Corte-Reto**, **P**, **Florzinha**, **Unidade de medida = Kilo**, campo **Peso Kilo** = **5882**.

### 2.1 Unidade **por peça** vs **por kilo**

- Se a unidade for **por peça/unidade**, o fluxo deve pedir **quantidade em unidades** (não só peso).
- Se for **Kilo**, deve aparecer o campo de **quantidade em kg** (como no print).

No 3.0, esta regra deve estar na **API** e na **UI** de forma explícita para evitar registos inconsistentes.

---

## 3. Após **Adicionar** — **REGISTRAR PRODUÇÃO** + tabela **PRODUÇÃO REALIZADA**

**Print:** [`../imagens/capturas-bubble/40-bubble-registrar-producao-realizada-tabela.png`](../imagens/capturas-bubble/40-bubble-registrar-producao-realizada-tabela.png)

- **REGISTRAR PRODUÇÃO:** entradas de **kg** e de **quantidade** (caixa) + botão **ADICIONAR**.
- **PRODUÇÃO REALIZADA:** grelha com colunas (ex.: **ID**, **STATUS**, **DATA DE CRIAÇÃO**, **TIPO MATERIAL**, **ACABAMENTO**, **TAMANHO**, **COR**, **UNIDADE DE MEDIDA**); primeira linha com **STATUS** *Pendente* (vermelho) no exemplo.
- **ENCAMINHAR PARA ESTOQUE:** acção seguinte no fluxo (stock).

**Print (actualização — material adicionado, STATUS Pendente visível, fullPage MCP):** [`../imagens/capturas-bubble/55-bubble-producao-realizada-pendente-tipo-material-avental.png`](../imagens/capturas-bubble/55-bubble-producao-realizada-pendente-tipo-material-avental.png) — linha **ID 1**, **TIPO MATERIAL Avental**, **ACABAMENTO Corte-Reto**, **TAMANHO P**, **COR Florzinha**, **UNIDADE Kilo**; **REGISTRAR PRODUÇÃO** com **5882** kg e quantidade **0**; botão verde **ENCAMINHAR PARA ESTOQUE**; bloco **DESCARTE** (Resíduos → Renova) visível no rodapé do modal.

### 3.1 Clique em **ENCAMINHAR PARA ESTOQUE** → STATUS muda automaticamente para **Enviado**

**Print:** [`../imagens/capturas-bubble/57-bubble-producao-realizada-status-enviado-encaminhar-estoque.png`](../imagens/capturas-bubble/57-bubble-producao-realizada-status-enviado-encaminhar-estoque.png) — mesma linha **ID 1** (Avental / Corte-Reto / P / Florzinha / Kilo, criada em **11/04/26**) agora com **STATUS Enviado** (verde) logo após o clique no botão **ENCAMINHAR PARA ESTOQUE**.

**Comportamento Bubble (AS-IS):**

- O botão **ENCAMINHAR PARA ESTOQUE** é a única acção que faz a transição de estado da linha — não há intermediário.
- A transição é **automática** no clique: `Pendente` → `Enviado`. Não há confirmação/checagem (peso final, conferência, etiqueta) entre os dois estados.
- Não há (no Bubble) registo explícito de **quem** encaminhou, **para qual zona/sala** do estoque, nem **quando** chegou de facto — só que “saiu da produção”.

**Mapa para o Tecnopano 3.0 — corresponde à parte de *embalagem*:**

> Confirmação do utilizador: «no Tecnopano 3.0 esta acção corresponde à parte de **embalagem**».

Ou seja, no 3.0 o que o Bubble chama *“encaminhar para estoque”* é, operacionalmente, o passo de **embalagem** — a peça/lote sai da produção, é embalada (com etiqueta/QR) e só então entra no stock. Isto sugere para o 3.0:

| Bubble (AS-IS) | Tecnopano 3.0 (TO-BE) |
|----------------|------------------------|
| Botão único `ENCAMINHAR PARA ESTOQUE` muda STATUS para `Enviado`. | Acção `Embalar` no posto da sala **ACABAMENTO E EMBALAGEM** ([42 §10](./42-galpao-novo-nomenclatura-salas-anexos.md)): gera/lê **QR** do lote, regista colaborador (sessão de sala — [41 §4](./41-tecnopano-30-producao-salas-gamificacao-rh.md)), confirma peso/quantidade final. |
| Estado único `Enviado` (sem zona). | Estados separados: `embalado` (saiu da produção, etiquetado) → `em_estoque` (entrada confirmada na zona/sala de stock — [42 §11](./42-galpao-novo-nomenclatura-salas-anexos.md)). |
| Sem rastreio de quem/quando/onde. | `embaladoPor`, `embaladoEm`, `zonaEstoque` obrigatórios; movimento de stock cria registo auditável. |
| Não alimenta gamificação. | Conta para a **produção individual** do colaborador da sala de embalagem ([41 §2](./41-tecnopano-30-producao-salas-gamificacao-rh.md)). |

---

## 4. Contexto operacional (porque o Bubble fica “aquém”)

- **Galpão antigo:** pouco espaço e **sem** controlo de stock estruturado; processo manual tolerado com limitações.
- **Galpão actual:** maior capacidade e necessidade de **divisão física / lógica** por zona — o utilizador referiu envio de **print do armazém** (tabela de divisão) para documentação futura; ainda **não** reflectido no Bubble com o detalhe desejado.
- **Pressão do dia-a-dia:** o preenchimento manual de **todas** as variantes de pano/produção é **lento**; na prática a equipa **não** conseguiu manter o Bubble alinhado a esse nível de detalhe — reforça a necessidade de **automatizar** (ex.: **QR**, leitura em posto, menos campos manuais).

---

## 5. Tecnopano 3.0 — direcção (TO-BE, para alinhar depois)

| Tema | Intenção |
|------|-----------|
| **Fonte dos “tipos de material”** | Lista = **só** materiais **já separados** para aquele `coletaId` / lote (FK explícito), nunca o catálogo global solto. |
| **Cascata** | `GET` encadeado: material → acabamentos → tamanhos → cores → unidade por defeito; validação server-side. |
| **QR / identificação** | Reduzir entrada manual: etiqueta **QR** ligada ao lote ou à linha de separação/produção; leitor no galpão. |
| **Stock** | Modelar movimentos e localização no **galpão maior** (zonas — aguardar print de divisão do utilizador). |
| **UX** | Menos “planilha arcaica”; fluxos por **posto** e confirmações rápidas. |

---

## 6. Pendente do utilizador

- [x] **Prints e tabela de salas** (anexos 1–12, placas, stock, logística): [42-galpao-novo-nomenclatura-salas-anexos.md](./42-galpao-novo-nomenclatura-salas-anexos.md).

---

## 7. Ligação — salas, pares e gamificação (3.0)

Requisitos do **galpão novo** (nomenclatura de salas, trabalho em dupla vs individual, **gamificação por colaborador**, login por sala, API **RH**, **dashboards** produção + costureira para galpão/admin/colaboradores — nota 41 §6): [41-tecnopano-30-producao-salas-gamificacao-rh.md](./41-tecnopano-30-producao-salas-gamificacao-rh.md). **Mapa físico com fotos (anexos 1–12):** [42-galpao-novo-nomenclatura-salas-anexos.md](./42-galpao-novo-nomenclatura-salas-anexos.md).
