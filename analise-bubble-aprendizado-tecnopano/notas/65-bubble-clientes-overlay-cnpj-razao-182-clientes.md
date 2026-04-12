# Bubble — **Clientes** (overlay/popup com 182 clientes B2B)

**Print:** [`../imagens/capturas-bubble/65-bubble-clientes-overlay-cnpj-razao-182-clientes.png`](../imagens/capturas-bubble/65-bubble-clientes-overlay-cnpj-razao-182-clientes.png)

**Origem (MCP):** menu **Clientes** (overlay sobre a página `expedicao`).

**Surpresa #4** (após [Triagem](./59-bubble-triagem-painel-operador-status-servico.md), [Motorista](./60-bubble-motorista-mesma-pagina-costureira-motorista.md) e [Card](./61-bubble-card-estoque-cards-ranking.md)): **Clientes não é uma página separada** — é um **FloatingGroup overlay** que abre sobre a tela actual. Tentar navegar pela URL `/clientes` ou `/cliente` devolve **404** porque não existe rota; o conteúdo só carrega quando o botão do menu dispara o workflow Bubble que torna o popup visível.

> **Nota técnica MCP:** o `click` simples do Chrome DevTools no botão do menu não disparou o overlay; foi preciso usar `evaluate_script` com `dispatchEvent(new MouseEvent('click', …))` para o Bubble registar o clique. Pode ser que o handler exija sequência `mousedown → mouseup → click` real. **Não usar** `click` MCP nem `navigate_page` para aceder a Clientes — usar `evaluate_script` ou clicar no menu manualmente.

---

## 1. Layout AS-IS

### 1.1 Filtros

| Campo | Tipo |
|-------|------|
| **CNPJ** | input texto + icon search |
| **RAZÃO SOCIAL** | input texto + icon search |
| **NOME FANTASIA** | input texto + icon search |
| **ID CLIENTE** | combobox autocomplete |

Botão de topo: **CADASTRAR CLIENTE** (modal — não aberto nesta sessão).

### 1.2 Tabela

Colunas: `ID` · `CNPJ` · `Razão Social` · `Nome Fantasia` · *(acção — botão por linha)*

Paginação: **`< 1 of 182 >`** → **182 clientes** cadastrados (parecido com o número de SKUs ~150 do [64](./64-bubble-produtos-registro-skus-peso-medio.md), confirma uma operação B2B real e não brinquedo).

### 1.3 Linhas observadas (página 1, 5 linhas)

| ID | CNPJ | Razão Social | Nome Fantasia |
|----|------|--------------|---------------|
| **1021** | 00003519000123 | TITANIUM LUBRIFICANTES IND LTDA | TITANIUM LUBRIFICANTES IND LTDA |
| **1077** | 00008220000161 | BTM ELETROMECANICA LTDA | BTM ELETROMECANICA LTDA |
| **1380** | 00028986006220 | ELEVADORES ATLAS SCHINDLER LTDA | ELEVADORES ATLAS SCHINDLER LTDA |
| **147** | 00034616000183 | COMPANHIA DE ENGENHARIA DE TRAFEGO | COMPANHIA DE ENGENHARIA DE TRAFEGO |
| **1201** | 00122107000102 | MARENOSTRUM CONSUTORIA E ASSISTE *(truncado)* | MARENOSTRUM CONSUTORIA E ASSISTE |

### 1.4 Achados

1. **`Razão Social == Nome Fantasia`** em todas as 5 linhas vistas — confirma que o cadastro foi feito **rápido** e os dois campos foram preenchidos com a mesma string. No 3.0 vale **um único campo `nome`** + um opcional `nomeFantasia` que só preencher quando diferente.
2. **CNPJs com prefixo `0`** — a string é guardada com a formatação à esquerda, não como número (consistente com [62 §1.3 CNPJ visível](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md#13-linhas-observadas-página-1-1-a-90-de-90--vista-totalmente-carregada)).
3. **`Razão Social` truncada** (`MARENOSTRUM CONSUTORIA E ASSISTE`) — provavelmente VARCHAR(32) ou semelhante; o nome real seria `MARENOSTRUM CONSULTORIA E ASSISTÊNCIA` ou similar. **Bug de schema do Bubble.**
4. **Faltam campos críticos visíveis na grelha:**
   - Endereço, cidade, estado
   - Inscrição estadual
   - Contacto (telefone, email)
   - Situação cadastral (activo/inactivo)
   - Data de cadastro / última compra
   - Vendedor responsável

   Esses campos podem existir no modal `CADASTRAR CLIENTE` mas não na lista — a lista está **mínima**.
5. **182 clientes** em página 1 of 182 → **a paginação mostra 1 cliente por página**? Ou são páginas de 1 (1 of 182 = página 1 de 182 páginas)? Ver §3 pendente. (Mais provável: 1 cliente por página, pois só vemos 5 linhas mas o badge diz `of 182` — **possível erro de paginação** ou estilo Bubble “1 de 182” onde 1 = página actual).

   **Re-leitura:** vendo melhor o layout das 5 linhas mostradas com `1 of 182`, é mais provável que **5 linhas estão visíveis** mas o widget de paginação Bubble usa **`of` em inglês** e refere-se ao **número de páginas** (não de registos), o que daria 5 × 182 = 910 clientes — improvável. Mais coerente seria **`182 registos` exibidos como página 1 de N**. **Pendente confirmar com navegação.**
6. **`MARENOSTRUM CONSUTORIA`** (sic — falta o L de “consultoria”) — outro bug de digitação no cadastro, igual ao `Gisele isso` da [60 §1.3](./60-bubble-motorista-mesma-pagina-costureira-motorista.md#13-catálogo-de-costureiras-21-nomes-vistos-no-dropdown).

### 1.5 ID Cliente — formato

Os IDs vistos (147, 1021, 1077, 1201, 1380) **não são sequenciais** e variam de 3 a 4 dígitos. Sugere que o ID **não é auto-increment do Bubble** — pode ser **importado** de um sistema legado (ERP anterior ou Excel). No 3.0:

- Manter `id` interno auto-increment (PK), e
- Adicionar campo `codigoLegado` (string) para guardar estes números antigos da migração.

---

## 2. Tecnopano 3.0 — direcção

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Página vs overlay** | Popup floating sobre `expedicao` (sem rota própria) | Página com rota `/clientes` (Cursor já tem essa rota no menu — `client/src/lib/appMenu.ts`). |
| **Razão social == Nome fantasia** | Duplicação manual | Um campo `nome` obrigatório + `nomeFantasia` opcional. |
| **Truncamento** | Campos VARCHAR curtos | TEXT/VARCHAR(255) com validação de tamanho na UI, não no schema. |
| **Cadastro mínimo** | Só CNPJ + RS + NF + ID | + endereço completo, IE, contacto, situação, vendedor, ranking de compras (liga ao módulo Card §1.4 de [61](./61-bubble-card-estoque-cards-ranking.md)). |
| **Paginação `1 of 182`** | UX confusa | Paginação clara `Página 1 de N • 182 registos`. |
| **ID legado** | IDs aleatórios não sequenciais | Manter `codigoLegado` para migração; PK interno separado. |

---

## 3. Pendente

- [ ] Abrir o modal `CADASTRAR CLIENTE` numa próxima sessão para ver os campos completos.
- [ ] Confirmar a contagem real: `1 of 182` = página de 182 ou 182 registos? (Clicar `>` para ver se vai para `2 of 182`).
- [ ] Verificar se há filtro por **situação activa/inactiva** (a lista pode estar a mostrar todos os clientes históricos, mesmo os que já não compram).
- [ ] Listar **as 5 empresas mais compradoras** (cruzar com [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md) e [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md) — `1077` BTM aparece muito).

---

## 4. Universo de clientes (parcial)

Confirmação dos **clientes B2B reais** que aparecem em outras notas:

| ID | Empresa | Aparece em |
|----|---------|-----------|
| 147 | COMPANHIA DE ENGENHARIA DE TRAFEGO (CET) | [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md), [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md) |
| 1021 | TITANIUM LUBRIFICANTES IND LTDA | [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md), [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md) |
| 1077 | BTM ELETROMECANICA LTDA | [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md), [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md) — 6 linhas! cliente principal |
| 1201 | MARENOSTRUM CONSU(L)TORIA | só nesta lista por enquanto |
| 1380 | ELEVADORES ATLAS SCHINDLER LTDA | [62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md), [63](./63-bubble-emitir-nota-fila-pendente-status-nota.md) |

E **fornecedores** (não clientes) que aparecem em outras notas — provavelmente em tabela separada:

- **ATMOSFERA GESTAO E HIGIENIZACAO DE TEXTEIS S.A.** ([59](./59-bubble-triagem-painel-operador-status-servico.md)) — anchor supplier do galpão (envia panos para reciclagem/produção)
- **CHOCOLATE TEXTIL LTDA** ([59](./59-bubble-triagem-painel-operador-status-servico.md)) — fornecedor secundário

> **Para o 3.0:** confirmar se Bubble tem tabela `fornecedores` separada de `clientes`, ou se há flag no mesmo cadastro. Cursor já tem `client/src/pages/...` para ambos (`fornecedores`, `clientes`) — alinhar.
