# Perfis — menu: Administrador vs Michele (Bubble / operação)

**Fonte:** regra informada pelo time.

## Administrador

- Vê **o painel completo** (todas as áreas / módulos que o sistema oferece para gestão).
- Pode **cadastrar empresa/fornecedor** quando não existir na base (em paralelo à Michele e à **TI** — ver [09](./09-bubble-cadastro-empresa-modal.md) §1.1).

## TI (informática / suporte)

- Pode **cadastrar empresa/fornecedor** quando o registo ainda não existe (mesma regra que Michele e admin no fluxo de coleta — [09](./09-bubble-cadastro-empresa-modal.md) §1.1). O recorte de **menu** pode coincidir com o admin ou ser intermédio — **confirmar com o time** no desenho do 3.0.

## Michele (colaboradora — pedido de coleta / escritório expedição)

**Ela só deve ver estes módulos** (equivalente no Bubble ao menu restrito):

| # | Módulo (nome operacional) | Observação |
|---|---------------------------|------------|
| 1 | **Coleta** | Início do fluxo — pedido/agendamento de coleta (ver [03](./03-inicio-pedido-coleta-michele.md)). Inclui **cadastro de empresa/fornecedor em falta** via lookup + “cadastrar empresa” no Bubble ([09](./09-bubble-cadastro-empresa-modal.md) §1.1) — não exige menu separado **Fornecedores**. |
| 2 | **Expedição** | Acompanhamento / pedidos de expedição (sem necessariamente ver tudo que o admin vê em outros blocos). |
| 3 | **Estoque** | Visão lista / gestão de estoque conforme permissão. |
| 4 | **Motorista** | Visão ligada a rotas / motorista Tecnopano. |
| 5 | **Card** | **Estoque em card** — visão em cartões (diferente da lista; no Bubble é item de menu próprio). |
| 6 | **Produtos** | Cadastro / consulta de produtos. |
| 7 | **Clientes** | Cadastro / consulta de clientes. |

**Explicitamente fora do escopo da Michele** (fica só para admin ou outros perfis): exemplos típicos — **Dashboard geral**, **Produção / Separação / Repanol / Costureira**, **Financeiro / Emissão NF**, **RH**, **Configurações / Usuários**, **Fornecedores** *(não citado na lista dela; tratar como **não visível** até o time dizer o contrário)*, **Automático**, etc.

---

## Tecnopano 3.0 — situação atual (`client/src/lib/appMenu.ts`)

- O menu usa `perfis` em cada item; **`administrador`** e **`super_admin`** veem **tudo** (`filterMenuByPerfil`).
- **Não existe** ainda um perfil dedicado tipo `michele` com o recorte exato acima.
- Rotas existentes úteis para ela: `/coleta`, `/expedicao`, `/estoque`, `/motorista`, `/produtos`, `/clientes`.
- **“Estoque em card”:** no repo **não há** rota separada documentada (só `/estoque` com `EstoqueList`); pode ser **nova tela**, **aba** dentro de Estoque, ou **dashboard widget** — **definir no desenho do 3.0** para paridade com o Bubble.

---

## Próximos passos (produto)

1. Criar perfil **`michele`** (ou nome oficial) no **auth** e no **menu**, espelhando a tabela acima.
2. **Fornecedores no menu:** a Michele pode não ter o módulo **Fornecedores** no menu e ainda assim **criar empresa** no fluxo de **Coleta** (lookup + cadastro inline). **TI** e **admin** mantêm capacidade equivalente (e possivelmente outras entradas). Ver [09](./09-bubble-cadastro-empresa-modal.md) §1.1.
3. Mapear no Bubble **nomes exatos dos itens de menu** e prints para anexar em `imagens/`.

---

## Ligação com outras notas

- Papel da Michele no início do fluxo: [03-inicio-pedido-coleta-michele.md](./03-inicio-pedido-coleta-michele.md)
