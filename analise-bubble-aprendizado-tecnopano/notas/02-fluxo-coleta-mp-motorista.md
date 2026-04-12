# Fluxo — pedido / agendamento de coleta e busca de matéria-prima

**Fonte:** regra de negócio informada pelo time (Tecnopano).

Este documento guarda **como é hoje no Bubble (antes)** e **para onde o 3.0 deve ir** — não é especificação final de produto.

---

## AS-IS — como funciona hoje no Bubble (legado, manual)

**Visibilidade da coleta após o cadastro:** no Bubble, o registo aparece para **Michele** e para a **lane**; **não** há inclusão equivalente para o **motorista** ver a mesma fila no sistema — ver [10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md](./10-coleta-visibilidade-michele-lane-vs-motorista-bubble.md). O Tecnopano 3.0 deve **corrigir** essa lacuna.

**Ordem típica no fluxo atual:**

1. A **lane do galpão** **recebe** a informação / demanda relacionada à coleta (no contexto do painel que visualiza chegada de MP / tabela Expedição).
2. A lane **imprime** (papel / comprovante / ordem — depende do que o Bubble dispara na prática).
3. Só então o **motorista** **vai** buscar a matéria-prima.

**Avaliação do time:** esse jeito **não é o correto** para o processo desejado — depende de passos **manuais** (receber → imprimir → liberar ida) e **deve ser substituído por automação** no Tecnopano novo.

*Motivos típicos para mudar:* fila humana, atraso entre “impresso” e “motorista saiu”, risco de esquecimento, falta de rastreio em tempo real, e trabalho duplicado com o que já está digital no agendamento (Michele).

---

## TO-BE — direção Tecnopano 3.0 (automatizado)

Objetivo: **reduzir ou eliminar** o gatilho manual “lane imprimiu → motorista pode ir”, passando a:

- **Disparos automáticos** quando a coleta estiver agendada/aprovada (ex.: motorista notificado no app / fila de rotas sem depender de impressão na lane).
- **Estado único da verdade** no sistema (sem depender de papel como condição para sair).
- **Rastreabilidade:** quem busca, quando saiu, quando chegou — ligado ao pedido da Michele e ao galpão.

*(Detalhes de UX e integrações ficam para especificação técnica; aqui só fica o **recado de negócio**: **antes = manual na lane + impressão**; **depois = automatizado**.)*

---

## Papéis

| Papel | Nome / função | O que faz |
|-------|----------------|-----------|
| **Colaboradora (agenda coleta)** | **Michele** *(grafia no sistema pode variar, ex.: “Mecihele”)* | Faz o **pedido da coleta** e **agenda** para a matéria-prima **chegar** no fluxo operacional. |
| **Motorista** | Motorista **próprio da Tecnopano** | Em **~90% dos casos** é **ele** quem **vai buscar** a matéria-prima (retirada no fornecedor / ponto acordado). |

## Fluxo resumido

1. **Início:** [03-inicio-pedido-coleta-michele.md](./03-inicio-pedido-coleta-michele.md) — **Michele** faz o **pedido da coleta** e agenda a expectativa de chegada da MP.
2. Na maior parte dos cenários (**~90%**), o **motorista Tecnopano** executa o deslocamento e **busca** a MP.
3. O restante (~10%) pode ser outro arranjo (fornecedor entrega, terceiro, cliente traz, etc.) — **confirmar no Bubble** se há flag ou tipo de “quem retira”.

## Implicações para o Tecnopano 3.0

- **Coleta:** campos ou estados que liguem **quem agendou** (usuário / perfil escritório) e **quem busca** (motorista interno vs exceção).
- **Motorista:** telas tipo `MotoristaList` / rota devem refletir que a **coleta agendada** costuma ser **“ida buscar MP”**, não só “entrega final”.
- **Galpão:** o painel feio da tabela Expedição / chegada de MP é a **visão downstream** depois que a MP está no jogo logístico; o gatilho começa no **agendamento pela Michele**.
- **Não replicar o AS-IS:** evitar que o 3.0 **dependa** de “lane recebeu → imprimiu → motorista foi”; priorizar **workflow automático** alinhado à seção **TO-BE** acima.

## Pendências (validar no Bubble / operação)

- Nome exato do usuário/cargo no app e se há **lista fixa** de motoristas.
- Como os **10%** restantes aparecem na UI (outro transportador, entrega FOB, etc.).
