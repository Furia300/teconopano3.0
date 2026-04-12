# Tecnopano 3.0 — **Salas de produção**, **pares**, **gamificação individual** e **RH**

**Âmbito:** requisito de produto / operação do **galpão novo** — documentação para alinhamento **posterior** com o time e com a implementação no 3.0. **Sem** desenvolvimento de código nesta fase.

> **Requisitos críticos adicionais do utilizador (sessão 2026-04-11)** — ver [69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md](./69-requisitos-criticos-user-estoque-reservado-dashboard-periodicidade-api-ia.md):
>
> - **R1** — confirma que a mudança para o **galpão maior** já aconteceu e agora há **espaço físico para estoque real** (antes não tinha)
> - **R2** — stock disponível ≠ reservado (Michele só pede ao galpão produzir o que falta)
> - **R4** — dashboard com **periodicidade de cliente** + **recorrência programada por 1 ano** (semanal, 3/15 dias, mensal)
> - **R5** — **API IA** já contratada para Michele/Financeiro/Admin com tools que mexem no sistema

**Relação:** produção por material e fluxo Bubble legado — [38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md); colaboradores — módulo **RH** / `Funcionários` no 3.0 quando a API estiver online.

**Placas, fotos e anexos (mapa completo):** [42-galpao-novo-nomenclatura-salas-anexos.md](./42-galpao-novo-nomenclatura-salas-anexos.md).

---

## 1. Galpão novo — várias **salas** com **nomenclatura**

- A zona de **produção** física divide-se em **várias salas**; cada sala tem **nome / código** na placa — ver tabela e imagens na nota **[42](./42-galpao-novo-nomenclatura-salas-anexos.md)** (anexos 1–12).

---

## 2. Forma de trabalho — **duplas** ou **individual**

- Colaboradores podem actuar **em par** ou **sozinhos** consoante a tarefa ou a sala.
- O dono do galpão pretende, contudo, **gamificação ao nível individual**: contagem / meta de **produção por pessoa** ao longo do mês, com **prémio por colaborador** no fecho do período — mesmo quando o trabalho foi feito **em dupla**.

**Implicação de produto (a fechar com o dono):** definir regra de **atribuição** quando há par (ex.: 50/50 na peça, divisão por tempo de sessão, “quem registou” vs “quem estava logado na sala”, ou pontos iguais automáticos). O sistema deve **registar evidência** (sessão, sala, eventos de produção) para suportar qualquer regra escolhida.

---

## 3. **RH** e dados de colaboradores

- Fonte de verdade dos **dados dos colaboradores** virá do **RH**, via **API integrada** quando o serviço estiver **online**.
- O 3.0 deve poder **sincronizar** identidade (nome, matrícula, equipa, etc.) sem duplicar cadastro manual crítico no galpão.

---

## 4. **Login por sala** e identificação automática

- Cada vez que um colaborador **entra numa sala**, faz **login** (ou check-in) **naquela sala** no sistema.
- O 3.0 deve **identificar automaticamente**:
  1. **Qual colaborador** (sessão autenticada + vínculo RH);
  2. **Em que sala** está;
  3. **O que está a produzir** (ligação ao registo de produção / ordem / material em curso — alinhar com o modelo de [38](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md) e com o que ainda vier sobre “como põem os números de produção”).

Com estes três eixos, o motor de **contagem** alimenta métricas mensais e a **gamificação individual**.

---

## 5. O que falta documentar (próximos passos)

- [x] **Como registam hoje** a produção por sala (papel): folha **PRODUÇÃO DIÁRIA** — [54-producao-diaria-folha-manual-salas-duplas.md](./54-producao-diaria-folha-manual-salas-duplas.md) + PDF em `documentos/producao-sala-folha-diaria.pdf`.
- [ ] **Imagens** adicionais se houver variantes da folha (outras salas / turnos).
- [ ] Regra explícita de **prémio / pontuação** em **dupla** vs **solo** (negócio + RH).

---

## 6. **Dashboards** — produção **e** costureira (galpão, admin, colaboradores)

Requisito explícito para o **Tecnopano 3.0** (além do registo em formulários / modais):

1. **Produção** — vista **dashboard** (KPIs, filas, pendentes, por sala, por turno) acessível a:
   - **Galpão** (supervisão operacional);
   - **Administrador** (vista mais ampla / multi-galpão se aplicável);
   - **Colaboradores** (o que lhes compete: metas, fila de trabalho, histórico recente — detalhe de UX a fechar).
2. **Costureira** (fluxo envio/retorno e pedidos) — **dashboard próprio** com o mesmo princípio de **visibilidade** para galpão, admin e quem executa o trabalho (paridade com [35-bubble-costureira-tabela-resumo-vs-popup-motorista.md](./35-bubble-costureira-tabela-resumo-vs-popup-motorista.md)).
3. **Separar na UX** o **painel** (leitura / acompanhamento) da **entrada de dados** pontuais — ex.: bloco **DESCARTE** (Resíduos → Renova, Renova Separação / Produção, Resíduos Costureira) continua como **formulário** de lançamento; o **dashboard** agrega o estado sem obrigar a passar sempre pelo ecrã de descarte.

**Print de contexto (Bubble — produção pendente + DESCARTE, fullPage MCP):** [`../imagens/capturas-bubble/56-bubble-producao-descarte-renova-contexto-dashboard.png`](../imagens/capturas-bubble/56-bubble-producao-descarte-renova-contexto-dashboard.png)

---

## 7. Resumo em uma frase

**Sala com nome + sessão do colaborador na sala + produção associada → métricas individuais mensais + integração RH; duplas permitidas mas gamificação e prémio pensados ao nível de cada pessoa; dashboards de produção e de costureira para galpão, admin e colaboradores.**
