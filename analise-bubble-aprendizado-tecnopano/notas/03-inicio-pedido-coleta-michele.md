# Início do fluxo — Michele faz o pedido da coleta

**Posição na cadeia:** este é o **primeiro passo** operacional do fluxo de coleta no escritório: alguém (tipicamente a Michele) **abre o pedido de coleta** e **agenda** a expectativa de chegada da matéria-prima. Se o **fornecedor/empresa ainda não existir** na base, ela pode **cadastrar** a empresa no momento (popup **CADASTRAR EMPRESA +** no Bubble — ver [09](./09-bubble-cadastro-empresa-modal.md)); o mesmo tipo de cadastro pode ser feito por **TI** ou **admin**.

**Responsável:** **Michele** (colaboradora — grafia no sistema pode variar).

**Menu que ela usa no Bubble:** não é o painel cheio do admin — ver [04-perfis-menu-michele-vs-admin.md](./04-perfis-menu-michele-vs-admin.md).

**Como a tela de Coleta aparece no Bubble (MCP):** ver [06-bubble-ui-coleta-via-mcp.md](./06-bubble-ui-coleta-via-mcp.md).

---

## O que esse passo precisa representar (negócio)

1. **Registrar** que haverá uma **coleta** vinculada a um **fornecedor** (origem da MP) — **criando o fornecedor no ato** se ainda não houver registo (Michele / TI / admin).
2. **Agendar** quando a MP **deve chegar** (ou quando a retirada está prevista — alinhar vocabulário com operação).
3. Servir de **gatilho upstream** para: galpão, motorista (~90% busca própria), financeiro/NF conforme o caso.

Tudo o que vem depois (lane, impressão legada, motorista, painel feio de expedição) **depende** desse pedido existir no sistema.

---

## Bubble (AS-IS) — a documentar

*Ainda não temos print nem nome exato da página no Bubble para o formulário da Michele.*

**Para capturar na próxima sessão no app:**

- Nome da **página** / menu (ex.: “Planejamento Coleta”, “Entrada de Coleta”, etc.).
- **Campos** obrigatórios e opcionais no pedido.
- Se o status inicial é `pendente`, `agendado`, ou outro.
- Se já existe vínculo com **motorista** ou **rota** neste momento ou só depois.

Quando houver imagem, salvar em `imagens/` e linkar aqui.

---

## Tecnopano 3.0 (hoje no código) — equivalente

| Conceito | Onde está |
|----------|-----------|
| Lista de coletas | `client/src/pages/coleta/ColetaList.tsx` — rota `/coleta` |
| Criar pedido de coleta | `NovaColetaDialog` — botão de nova coleta; `POST /api/coletas` |
| Campos atuais do formulário | Fornecedor *, NF, peso total NF, **data chegada**, galpão, observação |

Trecho da intenção do diálogo no 3.0: *“Registre a entrada de matéria-prima de um fornecedor”* — está alinhado ao papel da Michele como **quem cadastra o pedido**, mas pode faltar no futuro: **quem criou** (`createdBy` / Michele), **tipo de retirada** (motorista Tecnopano vs exceção), e **automação** pós-salvamento (notificar motorista sem passar pela lane/impressão).

---

## Ligação com outras notas

- Depois do pedido: fluxo completo e legado Bubble → [02-fluxo-coleta-mp-motorista.md](./02-fluxo-coleta-mp-motorista.md)
- Visão galpão / tabela → [01-tabela-pedidos-logistica-bubble.md](./01-tabela-pedidos-logistica-bubble.md)
