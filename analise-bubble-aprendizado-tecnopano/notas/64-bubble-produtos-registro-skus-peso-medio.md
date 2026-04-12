# Bubble — **Produtos** (`REGISTRO DE PRODUTOS`) — catálogo de SKUs com peso médio

**Print:** [`../imagens/capturas-bubble/64-bubble-produtos-registro-skus-peso-medio.png`](../imagens/capturas-bubble/64-bubble-produtos-registro-skus-peso-medio.png)

**Origem (MCP):** menu **Produtos** → URL `https://operation.app.br/version-test/produtos?debug_mode=true` → título da página **`REGISTRO DE PRODUTOS`** (com label do modal `CADASTRO PRODUTOS` no rodapé).

---

## 1. Layout AS-IS

### 1.1 Filtros

| Campo | Tipo |
|-------|------|
| **CÓDIGO PRODUTO** | combobox autocomplete |
| **TIPO MATERIAL** | input search (textbox) |
| **ACABAMENTO** | input search (textbox) |

Botão de topo: **CADASTRAR PRODUTO** (abre o modal `CADASTRO PRODUTOS`).

### 1.2 Tabela

Colunas: `ID` · `TIPO MATERIAL` · `ACABAMENTO` · `COR` · `MEDIDA` · `PESO MÉDIO` · `AÇÕES` (2 botões — provavelmente Editar / Apagar).

Paginação: `< 1 / Pág. 16 >` → **~150–160 produtos** no catálogo.

### 1.3 Linhas observadas (página 1, 10 linhas)

| ID | Tipo Material | Acabamento | Cor | Medida | Peso Médio (kg) |
|----|---------------|------------|-----|--------|-----------------|
| **184** | Avental | Corte-Reto | Verde | **P** | 1 |
| **184** | Avental | Corte-Reto | Verde | **M** | 1 |
| **184** | Avental | Corte-Reto | Verde | **G** | 1 |
| **184** | Avental | Corte-Reto | Verde | **GG** | 1 |
| 178 | GSY | Overlock | Branco | 30x30 Cm | 2,9 |
| 169 | TNT | Corte-Reto | Branco | 30x30 Cm | 2 |
| 168 | **Retalho Gru** | Corte-Reto | Variado | 40x70 Cm | 1 |
| 165 | **Gaiola** | **Ferro** | Dourada | 1.80x0.50 Cm | 4,5 |
| 164 | **Gaiola** | Ferro | Cinza | 1.00x1.70 Cm | 8,2 |
| 163 | **BR** | Overlock | Branco | 30x40 Cm | 2,1 |

### 1.4 Achados estruturais (importantíssimos para o modelo de dados do 3.0)

1. **`ID 184` repete 4 vezes** (P, M, G, GG do mesmo Avental Verde Corte-Reto). **Conclusão:** o `ID` mostrado **NÃO** é PK da linha — é o **código do modelo base do produto** (`Produto.codigo`), e cada linha é uma **variante por medida**. O modelo é:

   ```
   Produto (id: 184, nome: Avental, acabamento: Corte-Reto, cor: Verde)
     ├── ProdutoVariante (medida: P,  pesoMedio: 1)
     ├── ProdutoVariante (medida: M,  pesoMedio: 1)
     ├── ProdutoVariante (medida: G,  pesoMedio: 1)
     └── ProdutoVariante (medida: GG, pesoMedio: 1)
   ```

   No 3.0 isto é **explícito** com `produtos` + `produtos_variantes`, e a UI mostra agrupado.

2. **Catálogo é maior do que parece pelos dropdowns vistos antes:**
   - **Tipos de material** vistos só aqui: `Retalho Gru`, `Gaiola`, `BR`, `GSY`, `TNT` — somando aos da nota [38 §1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#1-abrir-o-micro-popup-cadastro-produção) (`A2`, `Avental`, `Barreira De Contenção`) já vamos em **8 tipos**.
   - **`Gaiola`** com acabamento `Ferro` e cor `Dourada`/`Cinza`: indica que o catálogo **mistura matéria-prima/contentores** com produtos finais. Confirma a ambiguidade já notada em [42 anexo 1 (MP/contentores)](./42-galpao-novo-nomenclatura-salas-anexos.md). No 3.0 estes deveriam ser **entidades distintas** (`produto` vs `contentor` vs `materia_prima`).

3. **`PESO MÉDIO`** é a chave para o cálculo automático que falta na linha de produção:
   - Avental Verde G → 1 kg/un
   - GSY Branco 30×30 → 2,9 kg/un
   - Gaiola Dourada → 4,5 kg/un
   - Permite **converter unidade ↔ kilo** quando o pedido vem numa unidade e a produção mede na outra ([38 §2.1](./38-bubble-cadastro-producao-material-separado-cascata-qr-to-be.md#21-unidade-por-peça-vs-por-kilo)).
   - Decimal com **vírgula** (`2,9`, `4,5`) — locale pt-BR. No 3.0 guardar como `number` e formatar na UI.

4. **Acabamento `Ferro` para Gaiola** = bug semântico: gaiola não tem “acabamento”, é uma estrutura. Mostra que o esquema do Bubble **força** todos os produtos a terem todos os campos, mesmo quando não fazem sentido. **Lição para o 3.0:** campos opcionais por **categoria** de produto (`tipo_produto`), com schema diferente por categoria.

---

## 2. Tecnopano 3.0 — direcção

| Tema | Bubble (AS-IS) | 3.0 (TO-BE) |
|------|----------------|-------------|
| **Modelo de dados** | Linha = SKU; mesmo ID repete por medida | Tabelas separadas: `produtos` (modelo base) + `produtos_variantes` (medida + peso médio + sku único). |
| **Campos forçados** | `Acabamento = Ferro` para Gaiola (sem sentido) | Campos opcionais por categoria; `tipo_produto` define o schema (ex.: `pano`, `contentor`, `embalagem`). |
| **Catálogo** | ~150 SKUs em 16 páginas com paginação simples | Lista virtualizada + busca fuzzy + agrupamento por modelo base. |
| **Peso médio** | Texto pt-BR (`2,9`) | `number`, sempre kg, formatação UI separada. |
| **Sincronização com dropdowns** | Tipos de produção (8) ≠ tipos de estoque (2) ≠ tipos do catálogo (8+) | **Uma só fonte** (`produtos.tipo_material`); todos os dropdowns puxam daqui. |
| **`CADASTRAR PRODUTO`** | Modal `CADASTRO PRODUTOS` (não aberto nesta sessão) | Formulário tipado com validação cliente + servidor. |

---

## 3. Pendente

- [ ] Abrir o modal **`CADASTRAR PRODUTO`** numa próxima sessão MCP para ver os campos do form (provavelmente: tipo, acabamento, cor, medida, peso médio + algo mais como código de barras/QR).
- [ ] Confirmar o **número total de produtos** (16 páginas × ~10 linhas = 150–160) e ver se os dropdowns de Estoque/Card/Triagem deviam ter mais opções.
- [ ] **Gaiola, BR, Retalho Gru** — confirmar com utilizador se são produtos finais ou MP/contentores misturados no catálogo (e se devem migrar para uma tabela separada no 3.0).
