# Bubble — **ESTOQUE** (listagem, filtros e acção *Retirar*)

**Print:** [`../imagens/capturas-bubble/58-bubble-estoque-listagem-filtros-retirar.png`](../imagens/capturas-bubble/58-bubble-estoque-listagem-filtros-retirar.png)

**Origem (MCP):** `https://operation.app.br/version-test/expedicao?debug_mode=true` → menu **Estoque** (sessão admin `fellipe.paiva.brito`).

**Relação:** continuação directa do fluxo documentado em [38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md) — depois de **ENCAMINHAR PARA ESTOQUE** no modal de produção, a linha **chega aqui**.

> **Requisitos críticos do utilizador (sessão 2026-04-11)** — ver [69 §1-2](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md):
>
> - **R1:** A operação **mudou para um galpão maior** que agora tem espaço físico para estoque real (antes não tinha — ver [38 §4](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#4-contexto-operacional-porque-o-bubble-fica-aquém)). É o pré-requisito de R2.
> - **R2:** No 3.0, a tabela de estoque deve distinguir `qtde_total`, `qtde_reservada` e `qtde_disponivel`. Quando a Michele cria pedido de Expedição, o sistema reserva automaticamente o disponível e cria ordem de produção só para a diferença.

---

## 1. Layout AS-IS

### 1.1 Cabeçalho de filtros

| Campo | Tipo | Observação |
|-------|------|------------|
| **DATA INICIAL** | date picker | exemplo: `01/01/2026` |
| **DATA FINAL** | date picker | exemplo: `11/04/2026` |
| **GALPÃO** | combobox | opções `Oceânica`, `Vicente` (multi-galpão real, não só Vicente) |
| **TIPO MATERIAL** | combobox | opções vistas: `Avental`, `Barreira De Contenção` |
| **ACABAMENTO** | combobox | opções vistas: `Corte-Reto`, `Overlock` |
| **COR** | combobox | opções vistas: `Florzinha`, `Variado` |

> **Nota:** os comboboxes não incluem **SALA** / **ZONA** — o estoque é tratado como um único bucket por galpão, sem subdivisão de sala (CORTE 01-04, FAIXA, etc., documentadas em [42-galpao-novo-nomenclatura-salas-anexos.md](./42-galpao-novo-nomenclatura-salas-anexos.md)).

### 1.2 Tabela

Colunas: `Data` · `ID PRODUTO` · `Tipo material` · `Acabamento` · `Cor` · `Medida` · `Unidade` · `Kilo` · *(acção)*

Linhas observadas (sessão MCP):

| Data | ID | Tipo | Acabamento | Cor | Medida | Unidade | Kilo | Acção |
|------|----|------|-------------|-----|--------|---------|------|-------|
| 11/04/26 | 105 | Avental | Corte-Reto | Florzinha | P |  | 5940 | **Retirar** |
| 19/01/26 | 9 | Barreira De Contenção | Overlock | Variado | 80 Cm | 5558 |  | **Retirar** |

Paginação `< 1 / Pág. 1 >` — só uma página visível na sessão.

### 1.3 Acção única: **Retirar**

- Cada linha tem **uma só acção** (`Retirar`) — não há editar, não há transferência entre zonas, não há histórico inline.
- Não há campo para **quem retirou**, **para onde foi**, **motivo** nem **NF de saída** visível na grelha.
- Estado da linha é **implícito** (existe = está em stock; se for retirada, presume-se que sai da listagem).

---

## 2. Pontes com outras notas

- **Origem da linha** — vem do botão `ENCAMINHAR PARA ESTOQUE` do modal de produção: [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado).
- **Variação de peso (sinal a investigar):** o exemplo da nota 38 §3.1 mostra **REGISTRAR PRODUÇÃO** com **5882 kg** para Avental Corte-Reto P Florzinha; aqui no Estoque a linha equivalente (Avental Corte-Reto P Florzinha, mesma data 11/04/26) aparece com **5940 kg**. **Diferença = +58 kg** — pode indicar:
  1. Reembalagem / nova entrada no estoque depois do registo de produção (delta acumulado);
  2. Outra linha de produção que somou no mesmo *bucket*;
  3. Reconciliação manual entre produção e estoque (o utilizador deve confirmar qual destas é a regra real).
  > **Para alinhar com o utilizador:** o estoque mostra o **acumulado por SKU** ou **uma linha por entrada de produção**?
- **Galpão multi-unidade:** filtro confirma **Oceânica + Vicente** — alinhar com `client/src/lib/galpoes.ts` no 3.0 (Cursor já centralizou esta lista, ver diff `client/src/pages/dashboard/DashboardAdmin.tsx`).
- **Catálogo de Tipo/Acabamento/Cor:** as listas vistas aqui são as **mesmas** vistas no popup CADASTRO PRODUÇÃO ([38 §2](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#2-cascata-de-campos-após-escolher-o-tipo-de-material)) — confirma que o Bubble usa **uma única tabela de catálogo** partilhada entre produção e estoque.

---

## 3. Tecnopano 3.0 — direcção (TO-BE)

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Modelo de localização** | 1 bucket por galpão | **Galpão → Sala/Zona → Posição** (mapa físico em [42](./42-galpao-novo-nomenclatura-salas-anexos.md)) |
| **Origem da linha** | linha aparece após `Encaminhar` (estado implícito) | Movimento explícito `embalado → em_estoque` ([38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado)) com origem rastreada (lote, colaborador, sala) |
| **Acção `Retirar`** | botão único, sem rastreio | Acção `retirar` exige: motivo (venda/expedição/descarte), destino, colaborador, NF (se aplicável), data |
| **Conferência peso** | aparente delta entre produção e estoque (5882 → 5940) sem visibilidade do porquê | Movimento de stock = **registo auditável** com `pesoEntrada`, `pesoSaida`, `delta`, `motivoDelta` |
| **Filtros** | data, galpão, tipo, acabamento, cor | + filtro por **sala/zona**, **lote**, **colaborador (embalado por)**, **status** (`em_estoque`, `reservado`, `expedido`, `descartado`) |
| **Identificação** | ID PRODUTO numérico do catálogo | **QR no fardo** ligado ao lote + linha de produção; leitura no posto (alinhado a [38 §5 e 41 §4](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#5-tecnopano-30--direcção-to-be-para-alinhar-depois)) |
| **Histórico** | inexistente na grelha | Drawer/expand por linha mostra timeline (entrada, retiradas parciais, ajustes) |

---

## 4. Pendente para confirmar com o utilizador

- [ ] A linha do Estoque é **agregada por SKU** (somando entradas) ou **uma por entrada de produção**? (delta 5882→5940 entre [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado) e esta nota).
- [ ] O que `Retirar` faz exactamente — apaga a linha, marca como saída, gera NF, abre modal? (capturar acção no próximo MCP).
- [ ] Existe **ESTOQUE por sala** em algum sítio (relatório / outro menu) ou só por galpão?
- [ ] Como o stock se relaciona com **Expedição / Pedidos** — a expedição puxa daqui ou tem o seu próprio inventário?
