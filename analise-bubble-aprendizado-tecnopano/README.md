# Análise Bubble → aprendizado para o Tecnopano 3.0

Esta pasta guarda **tudo que for extraído** de um app **Bubble.io** de referência: telas, fluxos, dados, regras e decisões de UX — para **alinhar ou evoluir** o sistema Tecnopano (React + Express deste repositório).

## O que fazer no Bubble (captura)

Para cada tela ou fluxo importante:

1. **Screenshot** da interface (estado completo, com menus se forem relevantes).
2. **Nome da página** / tipo de elemento (repeating group, popup, etc.), se aparecer no editor.
3. **Ação do usuário** (ex.: “cadastra coleta”, “filtra por galpão”).
4. **Campos visíveis** (rótulos, tipos: texto, número, data, dropdown).
5. **Comportamentos** (validações, mensagens, redirecionamentos) — anote o que notar na tela.

Coloque as imagens em `imagens/` com nome claro, por exemplo:

- `01-login.png`
- `02-dashboard-admin.png`
- `03-lista-coletas.png`

## O que é gerado aqui (texto)

Na pasta `notas/`, cada análise vira um arquivo em Markdown com:

- **Contexto** (qual imagem / fluxo).
- **Elementos de UI** (componentes equivalentes no Tecnopano, quando fizer sentido).
- **Modelo de dados implícito** (tabelas/campos que o Bubble parece usar).
- **Regras de negócio** inferidas.
- **Sugestões para o Tecnopano 3.0** (API, telas, validações).

## Índice das notas

Ver `notas/00-indice.md` — lista links para cada nota à medida que forem criadas.

## Automação Python (cliques + screenshots)

Na pasta `automacao/` há um script **Playwright** que abre o navegador, executa cliques conforme um JSON e salva PNGs em `imagens/`.

**Se `python3 -m venv` falhar** (falta `python3.12-venv`), use a pasta local `.deps`:

```bash
cd analise-bubble-aprendizado-tecnopano/automacao
./instalar-deps.sh
./run.sh --steps steps.smoke.json --headless   # teste rápido → gera imagens/smoke-test.png
cp steps.example.json meu_fluxo.json            # edite URL e seletores
./run.sh --steps meu_fluxo.json --profile
```

**Com venv (preferível se existir):**

```bash
cd analise-bubble-aprendizado-tecnopano/automacao
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && playwright install chromium
python bubble_captura.py --steps meu_fluxo.json --profile
```

`--profile` mantém sessão (útil para **fazer login uma vez** no Bubble e repetir capturas). Seletores: `text=...`, `css=...`, `#id` — [documentação Playwright](https://playwright.dev/python/docs/selectors).

## Repositório alvo

Código do produto: raiz do repo `tecnopano-3.0` (React `client/`, API `server/`).
