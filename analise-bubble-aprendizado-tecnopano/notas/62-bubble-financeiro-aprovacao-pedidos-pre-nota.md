# Bubble — **Financeiro** (fila de aprovação de pedidos antes da NF)

**Print:** [`../imagens/capturas-bubble/62-bubble-financeiro-aprovacao-pedidos-pre-nota.png`](../imagens/capturas-bubble/62-bubble-financeiro-aprovacao-pedidos-pre-nota.png)

**Origem (MCP):** menu **Financeiro** (sessão admin).

**Conclusão imediata:** o módulo **Financeiro** do Bubble da Tecnopano **não é** controlo de contas a pagar/receber, contas correntes ou DRE — é uma **fila de aprovação** de pedidos prontos para faturação. Cada linha aguarda um botão **APROVAR** que destrava a próxima etapa (**EMITIR NOTA**).

---

## 1. Layout AS-IS

### 1.1 Filtros

| Campo | Tipo |
|-------|------|
| **DATA ENTREGA** | date picker (default `11/04/2026`) |
| **STATUS FINANCEIRO** | combobox — apenas **2 valores**: `Pendente Aprovação`, `Aprovado` |
| **ID CLIENTE** | input numérico |
| **EMPRESA** | search box (autocomplete por nome de cliente) |
| **AÇÕES** | (label de coluna; ver §1.3) |

### 1.2 Colunas da tabela

`ID CLIENTE` · `EMPRESA` · `CNPJ` · `DATA ENTREGA` · `ROTA` · `STATUS FINANCEIRO` · `ID` · `QTDE PEDIDO` · `UNIDADE DE MEDIDA` · `TIPO MATERIAL` · `MEDIDA` · `ACABAMENTO` · `Nº NOTA FISCAL` · `EMITIR NOTA` · `EDITAR`

> Cada linha = **1 item de pedido** (não o pedido inteiro). Note que o `ID` da linha aqui é da **linha de pedido** (95, 94, …, 86 vistos), distinto do `ID CLIENTE` (1077, 1380, 1021, 147) e do `ID PEDIDO` da nota [59 §1.2](./59-bubble-triagem-painel-operador-status-servico.md#12-tabela-com-dados-após-scrollrefresh).

### 1.3 Linhas observadas (página 1, **1 a 90 de 90** — vista totalmente carregada)

| ID linha | ID Cli | Empresa | CNPJ | Entrega | Rota | Qtde | Unid. | Tipo | Med. | Acab. |
|----|------|---------|------|---------|------|------|-------|------|------|-------|
| 95 | 147 | **COMPANHIA DE ENGENHARIA DE TRAFEGO** (CET) | 00034616000183 | 06/02/26 | **L** | 5.00 | Kilo | Avental | G | Corte-Reto |
| 94 | 1077 | BTM ELETROMECANICA LTDA | 00008220000161 | 20/02/26 | **N** | 55.00 | Kilo | Avental | G | Corte-Reto |
| 93 | 1077 | BTM ELETROMECANICA LTDA | 00008220000161 | 11/02/26 | **O** | 3.00 | Kilo | Avental | GG | Corte-Reto |
| 92 | 1077 | BTM ELETROMECANICA LTDA | 00008220000161 | 06/02/26 | **P** | 258.00 | Kilo | Avental | G | Corte-Reto |
| 91 | 1380 | ELEVADORES ATLAS SCHINDLER LTDA | 00028986006220 | 12/02/26 | **M** | 11.00 | Kilo | Avental | GG | Corte-Reto |
| 90 | 1077 | BTM ELETROMECANICA LTDA | 00008220000161 | — | **N** | 25 | Unidade | **TNT** | 30x30 Cm | Corte-Reto |
| 89 | 1077 | BTM ELETROMECANICA LTDA | 00008220000161 | 10/02/26 | **E** | 565 | Unidade | TNT | 30x30 Cm | Corte-Reto |
| 88 | 1021 | TITANIUM LUBRIFICANTES IND LTDA | 00003519000123 | — | **O** | 55.00 | Kilo | Avental | M | Corte-Reto |
| 87 | 1077 | BTM ELETROMECANICA LTDA | 00008220000161 | 15/02/26 | **N** | 25 | Unidade | **GSY** | 30x30 Cm | Overlock |
| 86 | 1380 | ELEVADORES ATLAS SCHINDLER LTDA | 00028986006220 | 20/02/26 | **M** | 574.00 | Kilo | Avental | G | Corte-Reto |

Todas com `STATUS FINANCEIRO = Pendente Aprovação`. Botão **APROVAR** por linha. Paginação `1 a 90 de 90` → não há mais itens em fila (cabe numa página).

### 1.4 Achados

1. **Catálogo de clientes B2B real** — empresas grandes (CET, Atlas Schindler, BTM, Titanium, etc.). Confirma que a Tecnopano fornece **EPI/avental industrial** para grandes operadores.
2. **Coluna `ROTA`** com letras únicas (`L`, `N`, `O`, `P`, `M`, `E`) — parecem **identificadores de rota de entrega** (motorista). Provavelmente cada letra = uma rota nomeada (ex.: rota Norte, rota Leste). Isto **liga financeiro a logística** — o pedido só é aprovado financeiramente quando se sabe **qual rota** vai entregar.
3. **Tipos de material novos** vistos só aqui: `TNT` (não tecido) e `GSY` — não estavam nos dropdowns de Estoque/Card. Confirma que a lista de tipos de material **não está sincronizada** entre módulos (ou os dropdowns mostram só os tipos com stock activo).
4. **Pedidos em `Unidade`** (não só `Kilo`) — confirma o requisito de [38 §2.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#21-unidade-por-peça-vs-por-kilo) sobre suportar **kg** e **unidades**.
5. **CNPJs visíveis** com prefixo `0000` — formatação à esquerda preservada (string, não número).
6. **`Nº NOTA FISCAL`** vazio em todas as linhas — confirmação de que a NF só é gerada **depois** do `APROVAR`. Liga ao módulo **Emitir Nota** (badge `0` no menu — provavelmente fila vazia neste momento).
7. **`DATA ENTREGA` vazia** em algumas linhas (88, 90) — pedidos sem agendamento de entrega ainda. O 3.0 deve ter validação obrigatória OU permitir aprovar sem data desde que haja outro mecanismo (rota?).
8. **`EDITAR`** ao lado de `EMITIR NOTA` — antes de aprovar, é possível ainda corrigir o item.

---

## 2. Fluxo inferido (AS-IS Bubble)

```
Coleta (planejamento) → Produção/Costureira → Estoque
                                                 ↓
                                          Pedido com rota atribuída
                                                 ↓
                                  ┌──────► FINANCEIRO (esta nota)
                                  │           │
                                  │           │ APROVAR
                                  │           ↓
                                  │     EMITIR NOTA (próximo módulo)
                                  │           │
                                  └─── EDITAR (corrigir antes de aprovar)
```

> **Pendente** com utilizador: o módulo Financeiro **bloqueia** a expedição até aprovar, ou só **registra** o status sem bloqueio físico?

---

## 3. Tecnopano 3.0 — direcção

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Escopo do Financeiro** | Só fila de aprovação pré-NF | Manter este escopo (não inflar) — o nome no menu deveria ser **`Aprovação`** ou **`Pré-faturação`**, pois `Financeiro` cria expectativa de DRE/contas. |
| **`STATUS FINANCEIRO`** | 2 valores (`Pendente`, `Aprovado`) | + `Reprovado` (com motivo) e `Em revisão` (quando aguarda info do operador). |
| **`ROTA` por letra única** | `L`, `N`, `O`, etc. | Tabela `rotas` (id, nome, motorista, dia da semana, zona) — letra vira slug, mas com nome legível. Liga ao módulo Motorista do 3.0. |
| **`Nº NOTA FISCAL`** | Vazio até emitir, gerado externamente | Integração com emissor de NFe (escolher: NFE.io, Bling, Omie, Asaas) — o 3.0 não emite NF próprio. |
| **Edição inline** | Botão EDITAR por linha | Drawer lateral com formulário, sem perder posição na fila. |
| **`Pendente Aprovação` × 90 itens** | Tudo numa página, sem agrupamento | Agrupar por **cliente** ou por **rota** — operador financeiro aprova lote inteiro de uma só vez. |

---

## 4. Pendente para confirmar

- [ ] O que `APROVAR` faz exactamente — só muda status, ou também consome stock, gera nota, dispara webhook?
- [ ] Quem é o utilizador-tipo do Financeiro? Há um perfil específico no Bubble (ex.: `financeiro` de [04-perfis-menu-michele-vs-admin.md](./04-perfis-menu-michele-vs-admin.md))?
- [ ] As **letras de rota** (`L`, `N`, `O`, `P`, `M`, `E`) — onde estão definidas e como são atribuídas a um pedido?
- [ ] `EMITIR NOTA` na coluna é **clicável** mesmo se o pedido estiver `Pendente Aprovação`, ou só fica activo após aprovar?
