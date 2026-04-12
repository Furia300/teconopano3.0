# Lane galpão — painel de indicadores **e** tabela de coleta (Bubble → 3.0)

**Contexto:** no Bubble, quem opera no **galpão** (ex.: **Alane**) precisa de **dois modos** de leitura do mesmo fluxo: (1) um **painel** com contagens por etapa do processo e (2) uma **tabela** onde cada linha mostra o **status actual** da coleta, que **evolui** à medida que o trabalho avança (triagem, Repanol, costureira, produção, etc.). Os números do painel e o texto da coluna **Status** na tabela devem estar **alinhados** (a mesma lógica de negócio alimenta os dois).

**Relação com notas existentes**

- Painel de controlo + popup por lote: [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md) (calendário, tabela lane, **Status** na linha).
- Implementação base de coleta no 3.0: [05-modulo-coleta-inicio-3.0.md](./05-modulo-coleta-inicio-3.0.md).

---

> **Sessão MCP 2026-04-11:** valores reais do funil hoje (PLANEJAMENTO 19, COSTUREIRA 1, REPANOL 1, PRODUÇÃO 13), **catálogo completo de 27 materiais** com kg (incluindo o achado **A2 = 5555 kg = lote enviado à Madalena Mister no pedido 43**), confirmação **KILOS REALIZADOS = 5.882 kg** (= match perfeito com [38 §3.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#31-clique-em-encaminhar-para-estoque--status-muda-automaticamente-para-enviado)), **valor R$ 5.885** da coleta 43 (primeiro `Valor` em R$ visto no Bubble), **STATUS DE SERVIÇO com 9 valores divergentes** dos 8 da [Triagem (59)](./59-bubble-triagem-painel-operador-status-servico.md) e a **segunda secção `EXPEDIÇÃO` na mesma página** (não documentada antes — botão `LIBERAR` por linha + `STATUS MISSÃO NOTA` + deadlock `QTDE ESTOQUE = 0`) ficam em [67-bubble-galpao-lane-painel-controle-liberar-funil-status.md](./67-bubble-galpao-lane-painel-controle-liberar-funil-status.md).

---

## 1. Anexo A — **INDICADORES DE STATUS GERAL** (+ produção e mapa)

**Print:** [`../imagens/capturas-bubble/32-bubble-painel-indicadores-status-geral-producao.png`](../imagens/capturas-bubble/32-bubble-painel-indicadores-status-geral-producao.png)

- **INDICADORES DE STATUS GERAL:** cartões por macro-etapa (**Planejamento**, **Repanol** com mais de um contador, **Entrada de Coleta**, **Produção**, **Pesagem**, **Estoque**, **Costureira**, **Expedição**, **Finalizado**). Cada cartão mostra **quantos** registos ou operações estão naquela fase (ex.: alguém contabilizou na triagem; outro movimento na costureira — o painel resume **onde está o volume**).
- **INDICADORES DE PRODUÇÃO:** métricas complementares (ex.: pacotes / quilos realizados).
- **Mapa:** contexto geográfico (no Bubble, Google Maps).

**Requisito 3.0:** o perfil **galpão** deve ter um **dashboard** equivalente (contagens por etapa), alimentado pelas **mesmas** regras que determinam o status na tabela. O **administrador** deve poder ver uma **vista mais ampla** (todas as filiais / todos os galpões ou agregação global — detalhe de escopo a fechar com produto).

---

## 2. Anexo B — **Tabela** com coluna **Status**

**Print:** [`../imagens/capturas-bubble/33-bubble-tabela-coleta-status-repanol.png`](../imagens/capturas-bubble/33-bubble-tabela-coleta-status-repanol.png)

- Colunas observadas: **ID**, **Data**, **Nº Nota Fiscal**, **Empresa**, **Valor**, **Galpão**, **Peso NF**, **Peso Atual**, **Status**.
- Exemplo: linha **ID 43** com **Status** textual **Repanol** (e não apenas “Planejamento”), ou seja, a coluna **reflete a fase corrente** do ciclo.

**Requisito 3.0:** manter (ou introduzir) lista tabular com **Status** legível e **sincronizado** com o painel; filtros por status; linha clicável para detalhe / processo por lote quando aplicável (paridade [12](./12-bubble-lane-calendario-e-painel-galpao-coleta.md) §2.3).

---

## 3. Síncrono: painel ↔ tabela

| Onde | O que mostra | Fonte de verdade |
|------|----------------|------------------|
| Painel | Contagem por etapa (vários cartões) | Agregação `COUNT` / somatórios por `status` (ou campo de pipeline equivalente) |
| Tabela | **Status** por linha | Mesmo enum / máquina de estados da coleta (ou entidade ligada) |

Se o painel mostrar **N** em “Planejamento” e a tabela disser **Repanol** para a mesma coleta, há **bug de produto**. O 3.0 deve expor **uma** API (ou vista materializada) que o dashboard e a lista consomem.

---

## 4. O que já existe no código Tecnopano 3.0 (referência)

- **Dashboard galpão:** `client/src/pages/dashboard/DashboardGalpao.tsx` — KPIs e pipeline; **não** replica ainda todos os cartões do Bubble (Planejamento vs Repanol duplo, etc.).
- **Tabela de coletas:** `client/src/pages/coleta/ColetaList.tsx` — coluna **Status** com badges a partir de `status` da API.
- **Menu:** o item **Coleta** no topo da sidebar foi alinhado ao Bubble para o perfil **galpão** (acesso directo à tabela, como a Michele); o **Dashboard** continua em **/** para o painel.

Próximos passos de implementação sugeridos: mapear rótulos Bubble (**Planejamento Coleta**, **Entrada de Coleta**, **Repanol**, …) para valores de `status` / `statusServico` na API; expandir `DashboardGalpao` com cartões espelhando o anexo A; vista admin agregada em `DashboardAdmin` ou rota dedicada.
