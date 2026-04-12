# Coleta — visibilidade Michele / lane vs motorista (gap Bubble, melhoria 3.0)

**Prints**

- Formulário preenchido antes de salvar: [`10-cadastro-coleta-preenchido-michele-lane.png`](../imagens/capturas-bubble/10-cadastro-coleta-preenchido-michele-lane.png)
- **Tabela após salvar** (mesma sessão): [`11-coleta-bubble-tabela-apos-salvar.png`](../imagens/capturas-bubble/11-coleta-bubble-tabela-apos-salvar.png)

**Origem:** formulário **CADASTRO COLETA** (ver [07-bubble-cadastro-coleta-modal.md](./07-bubble-cadastro-coleta-modal.md)), preenchido conforme operação real + captura (anexos).

---

## 1. Exemplo registado no print (dados do anexo)

| Campo | Valor observado |
|-------|-----------------|
| **Data inserção coleta** | `15/04/26` · `12:30` |
| **Data/hora previsão de chegada** | `21/04/26` · `12:28` |
| **CNPJ** | `00886257000273` |
| **Nome da empresa** | `ATMOSFERA GESTAO E HIGIENIZACAO DE` *(texto visível no campo; pode estar truncado na UI)* |
| **Nome fantasia** | `ATMOSFERA - SP - DIADEMA` |
| **Observação** | `TESTE` |

Fluxo no cabeçalho do modal: **ESCRITÓRIO → MOTORISTA → GALPÃO** — o produto **assume** o motorista no meio do processo, mas a **visibilidade na app Bubble** não acompanha esse papel.

### 1.1 Tabela **Coleta** depois de gravar (evidência Bubble)

No print da lista, o registo correspondente ao formulário da §1 aparece na **primeira linha** (realce **amarelo** no Bubble — típico de linha recente ou foco):

| Coluna | Valor (ID **42**) |
|--------|-------------------|
| **ID** | 42 |
| **Data** | `15/04/26` · `12:30` *(data/hora exibidas como na lista; alinhado à “data inserção” do cadastro)* |
| **Empresa** | `ATMOSFERA - SP - DIADEMA` *(padrão **Nome fantasia - UF - Cidade** na coluna)* |
| **Observação** | `TESTE` |
| **Status** | **Planejamento Coleta** |

Outras linhas no mesmo print ilustram variações: status **Produção** (ex.: ID 40), mesmo padrão de **Empresa** (`ATMOSFERA - MG - BELO HORIZONTE`, `SAUIPE - BA`, etc.), coluna **ID** com ícone de código de barras no cabeçalho, filtros no topo (datas 11/04/2026, ID, Empresa) e botão **CADASTRAR**.

**Para o 3.0:** mapear o status inicial **Planejamento Coleta** para o estado interno equivalente (ex.: `agendado` / `pendente` + rótulo amigável) e manter a **lista** visível para Michele/lane **e** para motorista, conforme §2–3.

---

## 2. Comportamento AS-IS no Bubble (legado)

Após **Salvar**, o mesmo registo de coleta:

- **Aparece na tabela da Michele** (vista/menu coleta — escritório).
- **Aparece para a lane** no **calendário** de planejamento **e** na **tabela** do painel galpão, com coluna **Status** (ex.: **Planejamento Coleta**) — detalhe e prints: [12-bubble-lane-calendario-e-painel-galpao-coleta.md](./12-bubble-lane-calendario-e-painel-galpao-coleta.md).

**Não foi incluído no Bubble:** uma vista equivalente para o **motorista** ver essas coletas (pedidos agendados / a executar), embora na prática seja **ele** quem, na maior parte dos casos (~90%), **vai buscar** a matéria-prima — ver [02-fluxo-coleta-mp-motorista.md](./02-fluxo-coleta-mp-motorista.md).

**Conclusão de produto:** o legado **deixa o motorista fora** da “fonte da verdade” digital para coletas pendentes/agendadas; o risco é depender de **comunicação paralela** (papel, WhatsApp, lane) para o motorista saber **o quê**, **onde** e **quando** buscar.

---

## 3. Direção Tecnopano 3.0 (fazer melhor que o Bubble)

**Requisito explícito:** o **motorista** deve **também** ver as coletas relevantes (no mínimo as que estão **pendentes / agendadas / em rota**), alinhado ao fluxo ESCRITÓRIO → **MOTORISTA** → GALPÃO.

**Situação atual no código (referência):** o painel [`MotoristaList`](../../client/src/pages/motorista/MotoristaList.tsx) já consome **`GET /api/coletas`** e lista tarefas com status `pendente`, `agendado`, `em_rota` na secção **“Coleta de Matéria-Prima”** — isto é **intencionalmente** um passo à frente do Bubble descrito acima, sujeito a refinamento (filtros por motorista, notificações, estados finos, permissões).

**Próximos refinamentos típicos** (quando o produto fechar escopo):

- Atribuição **qual** motorista (ou “pool” de todos verem até atribuir).
- Sincronização com **mudança de status** (ex.: `em_rota`, `recebido`) e com a **lane/galpão**.
- Paridade com **datas/horas** do cadastro (previsão de chegada com hora, como no Bubble).

---

## 4. Ligações

- Modal e campos: [07](./07-bubble-cadastro-coleta-modal.md)  
- Papel motorista e automação: [02](./02-fluxo-coleta-mp-motorista.md)  
- Início Michele: [03](./03-inicio-pedido-coleta-michele.md)  
- Módulo coleta no 3.0: [05](./05-modulo-coleta-inicio-3.0.md)
