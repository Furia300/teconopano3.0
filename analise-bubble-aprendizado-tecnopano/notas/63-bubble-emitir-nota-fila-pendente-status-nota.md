# Bubble — **Emitir Nota** (`Emissão de Nota`) — fila idêntica ao Financeiro com `STATUS NOTA`

**Print:** [`../imagens/capturas-bubble/63-bubble-emitir-nota-fila-pendente-status-nota.png`](../imagens/capturas-bubble/63-bubble-emitir-nota-fila-pendente-status-nota.png)

**Origem (MCP):** menu **Emitir Nota** → título **`Emissão de Nota`**.

**Conclusão:** o módulo `Emitir Nota` é a **mesma fila** do `Financeiro` ([62](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md)) com colunas reorganizadas para o operador fiscal — **mesmas 90 linhas**, mesmos clientes, mesmas rotas, mesmos itens. A diferença é o **eixo de status**: aqui o foco é `STATUS NOTA` (`Pendente` em todas) e quem é o **`Usuário`** responsável pela emissão.

---

## 1. Layout AS-IS

### 1.1 Filtros

| Campo | Tipo |
|-------|------|
| **STATUS FINANCEIRO** | combobox — `Pendente Aprovação`, `Aprovado` (igual ao Financeiro [62 §1.1](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md#11-filtros)) |
| **ID CLIENTE** | input |
| **EMPRESA** | search box |
| **AÇÕES** | (label de coluna) |

> **Não há** filtro `STATUS NOTA` no topo, embora a coluna exista — gap de UX (operador fiscal vai querer filtrar por “já emitida” vs “a emitir”).

### 1.2 Colunas

`Nº NOTA FISCAL` · `STATUS NOTA` · `DATA EMISSÃO DA NOTA` · `ROTA` · `ID` · `QTDE PEDIDO` · `UNIDADE DE MEDIDA` · `STATUS FINANCEIRO` · `Usuário` · `ID CLIENTE` · `CNPJ` · `EMPRESA` · `TIPO MATERIAL` · `MEDIDA` · `ACABAMENTO` · `COR`

**Diferenças vs Financeiro [62 §1.2](./62-bubble-financeiro-aprovacao-pedidos-pre-nota.md#12-colunas-da-tabela):**

- **+ `STATUS NOTA`** — `Pendente` em todas as 90 linhas (mesma redundância visual).
- **+ `DATA EMISSÃO DA NOTA`** — vazia em todas (NF ainda não emitida).
- **+ `Usuário`** — sempre `fellipe.paiva.brito` (= o admin logado, o **único** que tem mexido na sessão de teste).
- **+ `COR`** — agora visível como coluna (não estava no Financeiro).
- **− `EMITIR NOTA` / `EDITAR`** — botões de acção sumiram desta tela; ao que parece, esta é uma **vista de leitura** com filtros, e a acção real fica no Financeiro.

### 1.3 Linhas observadas (paginação `1 a 90 de 90` — mesma fila do Financeiro)

| ID | Rota | Qtde | Unid. | StFin | StNota | Cliente | CNPJ | Empresa | Tipo | Med. | Acab. | **Cor** |
|----|------|------|-------|-------|--------|---------|------|---------|------|------|-------|---------|
| 95 | L | 5.00 | Kilo | Pendente Aprovação | Pendente | 147 | 00034616000183 | COMPANHIA DE ENGENHARIA DE TRAFEGO | Avental | G | Corte-Reto | **Verde** |
| 94 | N | 55.00 | Kilo | Pendente Aprovação | Pendente | 1077 | 00008220000161 | BTM ELETROMECANICA LTDA | Avental | G | Corte-Reto | Verde |
| 93 | O | 3.00 | Kilo | Pendente Aprovação | Pendente | 1077 | 00008220000161 | BTM ELETROMECANICA LTDA | Avental | GG | Corte-Reto | Verde |
| 92 | P | 258.00 | Kilo | Pendente Aprovação | Pendente | 1077 | 00008220000161 | BTM ELETROMECANICA LTDA | Avental | G | Corte-Reto | Verde |
| 91 | M | 11.00 | Kilo | Pendente Aprovação | Pendente | 1380 | 00028986006220 | ELEVADORES ATLAS SCHINDLER LTDA | Avental | GG | Corte-Reto | Verde |
| 90 | N | 25 | Unidade | Pendente Aprovação | Pendente | 1077 | 00008220000161 | BTM ELETROMECANICA LTDA | TNT | 30x30 Cm | Corte-Reto | **Branco** |
| 89 | E | 565 | Unidade | Pendente Aprovação | Pendente | 1077 | 00008220000161 | BTM ELETROMECANICA LTDA | TNT | 30x30 Cm | Corte-Reto | Branco |
| 88 | O | 55.00 | Kilo | Pendente Aprovação | Pendente | 1021 | 00003519000123 | TITANIUM LUBRIFICANTES IND LTDA | Avental | M | Corte-Reto | Verde |
| 87 | N | 25 | Unidade | Pendente Aprovação | Pendente | 1077 | 00008220000161 | BTM ELETROMECANICA LTDA | GSY | 30x30 Cm | Overlock | Branco |
| 86 | M | 574.00 | Kilo | Pendente Aprovação | Pendente | 1380 | 00028986006220 | ELEVADORES ATLAS SCHINDLER LTDA | Avental | G | Corte-Reto | Verde |

### 1.4 Achados

1. **Cor `Verde`** = padrão dos aventais industriais (BTM, Atlas Schindler, Titanium, CET) — confirma que **avental verde Corte-Reto** é o produto-âncora da Tecnopano para clientes industriais.
2. **Cor `Branco`** sempre que o material é `TNT` ou `GSY` (não tecidos descartáveis 30x30 cm) — diferente da linha avental.
3. **Coluna `Usuário` = sempre `fellipe.paiva.brito`** — o operador fiscal e o admin de teste são a mesma pessoa nesta sessão. Em produção real seria o utilizador do perfil **`emissao_nf`** ([04-perfis-menu-michele-vs-admin.md](./04-perfis-menu-michele-vs-admin.md)).
4. **Badge `4`** no menu lateral (`Emitir Nota` ⓿4) **não bate** com `90 itens pendentes` aqui — o badge provavelmente reflecte **só os já aprovados** (pendentes de emissão real), enquanto a tela mostra **todos os 90** porque o filtro default é `Pendente Aprovação`.
   - Confirmar mudando o filtro para `Aprovado` e contando — devem ser 4 linhas. **Pendente para o próximo MCP.**
5. **`Nº NOTA FISCAL` e `DATA EMISSÃO DA NOTA` vazios em todas** — confirma que a NF é gerada **fora** do Bubble (provavelmente outro sistema), e o Bubble só **regista** o número depois.

---

## 2. Relação Financeiro ↔ Emitir Nota

```
                ┌─── 90 itens ───┐
                │ Pendente Aprov.│
                └─┬──────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   FINANCEIRO            EMITIR NOTA
   (62, esta fila)       (63, esta nota)
        │                    │
   APROVAR/EDITAR         (vista de leitura?)
        │                    │
   Aprovado ─────────► Aparece com STATUS NOTA = Pendente,
                       aguarda emissão NF externa,
                       depois `Nº NOTA FISCAL` é preenchido,
                       `STATUS NOTA = Emitida`.
```

> **Pendente para confirmar:** as duas telas operam na **mesma tabela** do Bubble (vista filtrada) ou são tabelas distintas que se referenciam? A `STATUS NOTA` ser `Pendente` para todos os 90 sugere a mesma tabela.

---

## 3. Tecnopano 3.0 — direcção

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Duplicação Financeiro/Emitir Nota** | Duas páginas mostram o mesmo dataset com colunas diferentes | Uma só rota `/faturacao` com **abas/segmentos**: `Aprovação`, `A emitir`, `Emitidas`, `Canceladas`. |
| **`STATUS NOTA`** | Só `Pendente` visto | Estados: `aguardando_aprovacao`, `aprovada`, `em_emissao`, `emitida`, `erro_emissao`, `cancelada`. |
| **Badge desincronizado** | `4` no menu vs `90` na tela | Badge = só itens **accionáveis** pelo perfil corrente; coerente com o filtro default da página. |
| **`Usuário`** | Texto livre, sempre o admin | FK ao utilizador do sistema, com auditoria por evento (`quem aprovou`, `quem emitiu`, `quem cancelou`). |
| **Integração NF** | Manual, número entra externamente | Webhook para NFe.io / Bling / Omie / Asaas com retries; estado `em_emissao` enquanto aguarda confirmação. |
| **Filtro `STATUS NOTA`** | Não existe na tela | Adicionar — operador fiscal precisa saber rapidamente o que ainda **falta** emitir. |

---

## 4. Pendente para confirmar

- [ ] Mudar filtro `STATUS FINANCEIRO` para `Aprovado` e contar quantos itens aparecem — bate com o badge `4` do menu?
- [ ] Onde é registado o **`Nº NOTA FISCAL`** depois de emitido externamente — há um botão `MARCAR COMO EMITIDA` algures? Ou é o **EDITAR** do Financeiro?
- [ ] Existe **campo `valor`** numa tabela de pedidos? Não vimos `R$` em nenhuma das telas Financeiro/Emitir Nota — só **quantidade** e **unidade**. Como é calculado o valor da NF?
- [ ] O 3.0 deve **emitir** NF directamente ou só **registar** o número emitido externamente? (definição de scope crítica).
