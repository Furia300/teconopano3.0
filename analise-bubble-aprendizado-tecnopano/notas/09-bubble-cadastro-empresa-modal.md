# Bubble — Cadastrar empresa (popup sobre **EMPRESAS**)

**Print (modal aninhado aberto):** [`../imagens/capturas-bubble/09-bubble-cadastro-empresa-modal.png`](../imagens/capturas-bubble/09-bubble-cadastro-empresa-modal.png)

## 1. Como se chega aqui (fluxo)

1. **Coleta** → **CADASTRAR** → modal **CADASTRO COLETA** (ver [07-bubble-cadastro-coleta-modal.md](./07-bubble-cadastro-coleta-modal.md)).
2. Clicar numa **lupa** (CNPJ, Nome da empresa ou Nome fantasia) → popup **EMPRESAS** (ver §2.1 da nota 07).
3. Clicar em **CADASTRAR EMPRESA +** → abre **outro** popup por cima, com título **CADASTRO** (empresa nova).

Na captura, o popup **EMPRESAS** continua visível por baixo (filtros + tabela + paginação), com o formulário **CADASTRO** centrado à frente.

### 1.1 Regra de negócio — empresa ainda não está no banco

Se a **empresa/fornecedor não existir** na base, **não** é obrigatório parar o fluxo: quem estiver a montar o pedido pode **criar o cadastro** antes de seguir.

**Quem pode cadastrar** (regra informada pelo time):

- **Michele** — no contexto do pedido de coleta, via **CADASTRAR EMPRESA +** no popup **EMPRESAS** (sem depender de um módulo separado “Fornecedores” no menu dela, se assim estiver desenhado).
- **TI** ou **Administrador** — também podem fazer esse cadastro (no mesmo fluxo ou por outras entradas do sistema, conforme permissões).

No **Tecnopano 3.0**, esta regra implica: o perfil **michele** precisa de permissão para **criar fornecedor/empresa** pelo menos **no contexto do pedido de coleta** (lookup + “nova empresa”), alinhado ao Bubble.

## 2. Modal **CADASTRO** (empresa)

**Cabeçalho:** barra escura com título **CADASTRO** e **X** para fechar.

**Campos (com ícones à esquerda de cada input):**

| Rótulo Bubble | Observação |
|---------------|------------|
| **CNPJ** | Identificação fiscal |
| **NOME DA EMPRESA** | Razão social / nome cadastral |
| **NOME FANTASIA** | Nome comercial |
| **CONTATO** | Telefone (ícone estilo WhatsApp no Bubble) |
| **EMAIL DO CLIENTE** | E-mail de contato |
| **ENDEREÇO DA EMPRESA** | Endereço (ícone de pin / localização) |

**Rodapé:**

- **Fechar** (cinza)
- **Salvar** (verde)

## 3. Contexto técnico (debugger)

Na barra do Bubble, o dropdown de inspeção pode apontar para elementos como **Fornecedores** / popups da mesma família — confirma que o cadastro está ligado ao mesmo tipo de dados usado na coleta (empresa/fornecedor).

## 4. Paridade Tecnopano 3.0

O 3.0 hoje trata fornecedor sobretudo via **lista** em `/api/fornecedores` e select no `NovaColetaDialog`. Para espelhar o Bubble, falta um fluxo **criar fornecedor/empresa** a partir do pedido de coleta (modal ou rota dedicada) com estes campos e `POST` correspondente — com **autorização** para **Michele**, **TI** e **admin** conforme a regra acima (§1.1).
