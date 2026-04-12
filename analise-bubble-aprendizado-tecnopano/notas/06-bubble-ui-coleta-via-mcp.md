# Bubble — UI Coleta (captura via MCP no browser)

**Print (página Coleta):** [`../imagens/capturas-bubble/06-coleta-bubble-expedicao.png`](../imagens/capturas-bubble/06-coleta-bubble-expedicao.png)

**App:** Tecnopano em `operation.app.br`, ambiente **version-test** (`?debug_mode=true`).  
**Nota:** a rota pode permanecer `/version-test/expedicao` mesmo com o conteúdo “Coleta” — o Bubble troca grupos/páginas internas sem mudar o path.

## 1. Painel operacional (antes de clicar em Coleta)

- **URL observada:** `https://operation.app.br/version-test/expedicao?debug_mode=true`
- **Título da área:** **PAINEL OPERACIONAL**
- **Conteúdo central:** imagem grande (enxoval / toalhas) — ecrã inicial do módulo.
- **Menu lateral (exemplo com user admin):** Coleta, Expedição, Estoque, Triagem, Motorista, Galpão, Card, Financeiro (badge), Emitir Nota (badge), Produtos, Clientes.
- Utilizador de teste no print: **fellipe.paiva.brito**, perfil **Administrador**.

## 2. Tela **Coleta** (após clicar em “Coleta” no menu)

- **Coleta** fica destacada no menu lateral.
- **Barra superior do módulo:** título **Coleta** + ícone de camião.
- **Bloco FILTROS:**
  - **Data inicial** e **Data final** (date pickers; exemplo preenchido: 11/04/2026).
  - **ID** (campo com ícone de código de barras).
  - **Empresa** (campo de texto com ícone de edifício).
- **Ação:** botão verde **CADASTRAR** (com ícone de camião) — novo registo de coleta. Modal e campos: [07-bubble-cadastro-coleta-modal.md](./07-bubble-cadastro-coleta-modal.md).
- **Tabela (colunas):**
  - **ID**
  - **Data** (data e hora)
  - **Empresa** (ex.: “ATMOSFERA - MG - BELO HORIZONTE”, “SAUIPE - BA”)
  - **Observação** (ex.: “teste michele”, “teste”)
  - **Status** (ex.: **Planejamento Coleta**, **Produção**)

## 3. Duas entradas para Coleta (negócio)

O time indicou que a coleta existe em **dois contextos**: um para a **lane** e outro para a **Michele** pelo menu **Expedição**. Esta nota documenta a vista acedida pelo **menu lateral → Coleta** no painel operacional (URL `expedicao`).

**Vista da lane (calendário + painel galpão + tabela com Status):** [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md).

## 4. Comparação rápida com Tecnopano 3.0

| Bubble (esta tela) | 3.0 atual (`/coleta`) |
|--------------------|------------------------|
| Filtros: datas, ID, empresa | Busca texto + filtro status |
| Botão CADASTRAR | Pedido de coleta (modal) |
| Colunas: ID, Data, Empresa, Obs, Status | Nº, Fornecedor, NF, pesos, datas, status |
| Status “Planejamento Coleta” | `pendente` / `agendado` / … |

Alinhar nomes de status e filtros quando houver paridade de produto.
