# Bubble — Cadastro de coleta (modal CADASTRAR)

**Print (modal aberto):** [`../imagens/capturas-bubble/07-cadastro-coleta-bubble-modal.png`](../imagens/capturas-bubble/07-cadastro-coleta-bubble-modal.png)

**Contexto:** tela **Coleta** → botão **CADASTRAR** (ver [06-bubble-ui-coleta-via-mcp.md](./06-bubble-ui-coleta-via-mcp.md)).  
**Ambiente:** `operation.app.br/version-test`, URL da página com o modal: `…/expedicao?debug_mode=true`.

**Exemplo real preenchido + gap motorista (Bubble vs 3.0):** [10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md](./10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md).

## 1. Cabeçalho do modal

- Título: **CADASTRO COLETA**
- Subtítulo / fluxo indicado: **COLETA: ESCRITÓRIO → MOTORISTA → GALPÃO** (direção do processo, alinhado à nota de fluxo AS-IS / lane).

## 2. Campos do formulário

| Campo (rótulo Bubble) | Comportamento observado |
|------------------------|-------------------------|
| **DATA INSERÇÃO COLETA** | Data + hora (ex.: 11/04/26, 12:00) — provável preenchimento automático com “agora” ou default editável |
| **DATA/HORA PREVISÃO DE CHEGADA** | Data + hora — equivalente conceitual à **previsão de busca/chegada** da MP |
| **CNPJ** | Texto + botão **lupa** (amarelo) — abre o mesmo popup de empresas |
| **NOME DA EMPRESA** | Texto + **lupa** — mesmo popup |
| **NOME FANTASIA** | Texto + **lupa** — mesmo popup |
| **Observação** | Campo livre (área larga); **sem** lupa |

**Regra observada:** qualquer uma das **três lupas** (CNPJ, Nome da empresa, Nome fantasia) abre **um único popup** para localizar a empresa/fornecedor na base cadastral — não são três fluxos diferentes.

### 2.1 Popup após clicar na lupa — **EMPRESAS**

**Print (tela com filtro + tabela):** [`../imagens/capturas-bubble/08-bubble-coleta-popup-empresas-lupa.png`](../imagens/capturas-bubble/08-bubble-coleta-popup-empresas-lupa.png)

- **Título do popup:** **EMPRESAS**
- **Secção FILTROS** (refinar a lista antes de escolher a linha):
  - **CNPJ**
  - **NOME DA EMPRESA**
  - **NOME FANTASIA**
- **Ação extra:** botão **CADASTRAR EMPRESA +** (vermelho) — criar empresa nova se não existir na lista. Tela desse segundo popup: [09-bubble-cadastro-empresa-modal.md](./09-bubble-cadastro-empresa-modal.md).
- **Tabela de resultados (colunas):** **CNPJ**, **Razão Social**, **Nome Fantasia** (destaque em azul no print), **Contato**, coluna com ícone **Editar** por linha.
- **Paginação:** exemplo **« 1 of 8 »** — lista grande, várias páginas.

Fecho do popup pelo **X** no cabeçalho (comportamento típico Bubble; seleção de linha provavelmente devolve dados ao modal **CADASTRO COLETA** — não gravado nesta captura).

## 3. Ações

- **Fechar** — fecha o modal sem gravar (cinza).
- **Salvar** — grava o registo (verde).

## 4. Hipótese de negócio pós-Salvar

Na lista ao fundo, registos aparecem com status como **Planejamento Coleta** ou **Produção**. O cadastro inicial deste fluxo corresponde, em produto, ao estado “coleta planejada / agendada”, antes da MP estar no galpão.

## 5. Comparação com Tecnopano 3.0 (`NovaColetaDialog` + `POST /api/coletas`)

| Bubble (este modal) | 3.0 atual |
|---------------------|-----------|
| Data inserção + data/hora previsão chegada | `dataPedido` automático (ISO) + `dataChegada` só **data** (sem hora no form) |
| Três lupas → popup **EMPRESAS** (filtros + tabela + paginação + cadastrar empresa) | Um único **select** de fornecedor (lista `/api/fornecedores`) |
| Sem NF / peso / galpão visíveis neste modal | **NF**, **peso NF**, **galpão** no mesmo formulário |
| Botões Fechar / Salvar | Cancelar / Registrar pedido |
| Status na lista “Planejamento Coleta” | `pendente` ou `agendado` + texto em `statusServico` |

### Gaps úteis para evoluir paridade (quando for prioridade)

1. **Hora** na previsão de chegada (Bubble usa data+hora).
2. **Modal de escolha de empresa** espelhando o Bubble: filtros CNPJ / razão / fantasia, tabela, paginação e atalho “nova empresa” (hoje o 3.0 só tem dropdown).
3. **Rótulos / status** exibidos na lista alinhados a “Planejamento Coleta” quando `agendado` ou equivalente.
4. Decidir se **NF e peso** entram no **primeiro** cadastro (Michele) ou só na etapa galpão — o Bubble neste modal não mostra esses campos; o 3.0 já os antecipa no mesmo passo.
