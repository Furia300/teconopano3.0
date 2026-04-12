# **Produção diária** em papel — o que as salas registam hoje (fora do Bubble)

**Fonte:** folha escaneada `documentos/producao-sala-folha-diaria.pdf` (cópia no repositório do PDF original em *Downloads*: `produçao SALA.pdf`). Digitalização **Epson Scan 2**, 1 página A4, março de 2026.

**Âmbito:** descrever o **AS-IS manual** para o Tecnopano 3.0 **automatizar** o mesmo nível de informação (incluindo **duplas**), já que no Bubble **não** fazem este registo por falta de automação — no galpão **continuam no papel**.

**Relação:** salas físicas — [42-galpao-novo-nomenclatura-salas-anexos.md](./42-galpao-novo-nomenclatura-salas-anexos.md); gamificação individual a partir de eventos por colaborador/sala — [41-tecnopano-30-producao-salas-gamificacao-rh.md](./41-tecnopano-30-producao-salas-gamificacao-rh.md).

---

## 1. Título e propósito da folha

- Título visível: **PRODUÇÃO DIÁRIA**.
- Margem com anotação **INCOMPLETA(S)** — o processo manual **falha** ou fica por terminar; reforça a necessidade de **validação** e **campos obrigatórios** no 3.0.

---

## 2. Colunas da grelha (o que registam)

| Coluna | Conteúdo | Observação para o 3.0 |
|--------|----------|------------------------|
| **DATA** | Dia do trabalho (ex.: 02/03 a 06/03 no exemplar) | Evento datado; fecho diário. |
| **NOME / DUPLA** | Identificação dos colaboradores, **quase sempre em par** (ex.: *GLINS / KAUAN*, *EDELSON / LUIZ*) | Para gamificação **individual**, cada linha deve poder **desdobrar** ou **partilhar** métricas entre os dois elementos da dupla (regra de negócio a fechar com o dono). |
| **SALA** | Identificador numérico da sala (ex.: **04**, **05**) no papel | Mapear para `salaId` alinhado às placas **CORTE 01**, **FAIXA**, etc. na nota 42 (pode haver vários códigos internos vs placa). |
| **MATERIAL** | Descrição livre / códigos: *BR CASAL*, *CASAL RUA*, *CINZA G*, *SEPAROU*, *CZ RUA*, *C2 P / C2 M / C2 PP*, *A9 (35 pcs)*, *AZUL RUA*, *MICROFIBRA*, … | Padronizar com **catálogo** (tipo, tamanho, cor, unidade); ligar a **MP / separação** quando aplicável. |
| **HORÁRIO** | Intervalo de tempo da tarefa (ex.: 8:10–10:55, 10:55–13:40) | Permite calcular **duração** e produtividade; no 3.0: `inicio` + `fim` ou cronómetro por tarefa. |
| **ASS** | **Assinatura** (rubrica) dos colaboradores | Paridade com requisito de **assinatura** já mencionado no fluxo costureira (nota 35). |
| **ENCARREGADO** | Quem valida a linha — no exemplo quase sempre **Wagner** | Perfil de **supervisão** / encarregado de turno; trilho de auditoria. |

---

## 3. O que isto implica (Bubble vs papel vs 3.0)

| Onde | Situação |
|------|-----------|
| **Bubble** | **Não** reproduzem este registo diário — não está automatizado para o ritmo do galpão. |
| **Papel** | É aqui que o **controlo real** de produção por sala e por dupla acontece hoje. |
| **Tecnopano 3.0** | Deve **capturar os mesmos dados** (e melhorar: menos incompletos, **QR**, ligação a **RH**, **sala** logada, **material** de BD). |

---

## 4. Duplas e automação

- A folha foi desenhada para **dupla** na coluna **NOME / DUPLA**; o produto 3.0 precisa de:
  1. **Registo rápido** no posto (tablet / totem / telemóvel) com **sala** + **dois colaboradores** pré-seleccionados ou scan de crachá;
  2. **Regra clara** de como contar para **meta individual** quando os dois estão na mesma linha;
  3. **Assinatura** digital ou confirmação com PIN + **encarregado** (papel de Wagner).

---

## 5. Ficheiro no repositório

- PDF: [`../documentos/producao-sala-folha-diaria.pdf`](../documentos/producao-sala-folha-diaria.pdf)

*(OCR automático da digitalização é ruidoso; a estrutura desta nota baseia-se na leitura visual da página.)*
