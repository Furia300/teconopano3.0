# Protocolo — cada página Bubble: nota + print

Regra para documentação contínua do app Bubble → Tecnopano 3.0.

## Âmbito (alinhamento com o time)

**Por defeito:** esta pasta `analise-bubble-aprendizado-tecnopano/` serve para **guardar contexto** (prints, notas, requisitos) para **alinhamento posterior** com o Tecnopano 3.0. **Não** implica implementação na app 3.0 até o time decidir explicitamente passar da análise ao desenvolvimento. Quando uma nota disser “requisitos 3.0” ou “TO-BE”, trata-se de **especificação**, não de tarefa concluída no código.

## Para cada nova tela / estado visível

1. **Print (PNG)**  
   - Pasta: `imagens/capturas-bubble/`  
   - Nome: `NN-descricao-curta.png` onde **NN** é o próximo número do `notas/00-indice.md` (ou o mesmo número da nota associada).  
   - Ex.: `06-coleta-bubble-expedicao.png`  
   - Preferir **full page** quando couber no MCP (`browser_take_screenshot` + `fullPage: true`).  
   - O MCP pode gravar primeiro em `/tmp/cursor/screenshots/…` — **copiar** o ficheiro para `imagens/capturas-bubble/` no repo.

2. **Nota (Markdown)** em `notas/`  
   - Ficheiro: `NN-titulo.md` ou atualizar nota existente da mesma página.  
   - Incluir sempre: **URL** (com query), **título visível**, **menu ativo**, **filtros/campos**, **tabelas e colunas**, **botões principais**, **observações** (perfil de utilizador se visível).  
   - **Primeira linha ou secção “Print”** com link relativo para o PNG em `../imagens/capturas-bubble/…`.

3. **Índice**  
   - Atualizar `notas/00-indice.md` com linha: número, ficheiro do print, link da nota.

## Fluxo com o utilizador

- O utilizador navega no Bubble (browser do Cursor) e escreve **“pronto”** quando a página está estável.  
- O agente: `browser_tabs` → identificar guia `operation.app.br` → `browser_snapshot` + `browser_take_screenshot` → copiar PNG para o repo → criar/atualizar nota → índice.

## Duas entradas para a mesma lógica

Se uma funcionalidade existir em **dois menus** (ex.: Coleta pela lane e pela Michele), são **duas capturas** e **duas notas** (ou uma nota com secção “Entrada A” / “Entrada B” e dois prints).
