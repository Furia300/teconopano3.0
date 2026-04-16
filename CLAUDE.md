# Tecnopano 3.0 — Instruções para IA

## Stack
- React 19 + Express 5 + Drizzle ORM + Tailwind 4 + shadcn/ui
- Wouter (router), Sonner (toasts), Framer Motion (animações)
- `@paper-design/shaders-react` (WebGL shaders)

## Comandos
- **API + front ao mesmo tempo (recomendado):** `npm run dev:full` — sobe **api** (porta 3001) e **web** Vite (porta 3002) num único terminal (usa `concurrently`).
- **Só backend:** `npm run dev` (Express em `http://localhost:3001`)
- **Só frontend:** `npm run dev:client` (Vite em `http://localhost:3002`, proxy `/api` → 3001)
- **Build:** `npm run build`

---

## PADRÃO OBRIGATÓRIO — Login

O login usa **MeshGradient WebGL** do `@paper-design/shaders-react`. **NUNCA recriar do zero.**

Arquivo: `client/src/pages/auth/Login.tsx` + `Login.css`

### Componentes do login:
- **Fundo:** `<MeshGradient colors={['#000000','#1a1a1a','#333333','#ffffff']} speed={1.0} backgroundColor="#000000" />` dentro de `.login-bg-effect`
- **Card:** glassmorphism (`backdrop-filter: blur(20px)`, `rgba(26,26,26,0.6)`, borda `rgba(255,255,255,0.1)`)
- **Logo (TRAVADO — não alterar sem ordem explícita do utilizador):**
  - **Sempre** usar `src="/src/assets/logo-dark-full.png"` em `Login.tsx` (PNG, decisão do repositório).
  - **Nunca** trocar por `logo-light-full.png`, `logo-login-dark.jpeg`, `logo.png` ou outro ficheiro sem pedido explícito.
  - Regra espelhada em `.cursor/rules/login-logo-travado.mdc` e em `.cursorrules`.
- **Campos:** email com validação (check verde CheckCircle2), senha com toggle olho (Eye/EyeOff)
- **Opções:** checkbox "Lembrar-me" + link "Esqueceu a senha?"
- **Botão:** gradiente `#FF073A → #B20028`, seta animada (svg arrow), shimmer no hover
- **Subtítulo / footer:** texto de marca alinhado ao código actual (ex.: "Tecnopano 2.0 · Sistema de Gestão Industrial" / "Sistema seguro · Tecnopano 2.0") — **não mudar a versão** sem ordem do utilizador.
- **CSS:** arquivo separado `Login.css`, variáveis `--accent: #FF073A`, responsivo mobile-first

### Origem:
Copiado do repo `github.com/agencianookweb-hash/Tecnopano` → `client/src/pages/auth/Login.tsx`

---

## PADRÃO OBRIGATÓRIO — Sidebar

A sidebar usa **ícones neumorphic quadrados com shimmer sweep**. **NUNCA recriar do zero.**

Arquivo: `client/src/components/layout/Sidebar.tsx`

### Características visuais obrigatórias:
- **Ícones:** dentro de quadrados neumorphic (36×36px, borderRadius 10)
- **Sombras dark:** `4px 4px 8px #0a0a0a, -4px -4px 8px #2a2a2a`
- **Hover:** gradiente `#FF073A → #B20028` no quadrado + sombra glow vermelha
- **Shimmer sweep:** animação CSS `shimmerSweep` (translateX -100% → 100%) no hover e ativo
- **Borda:** `#3f3f46` normal → `rgba(255,7,58,0.4)` no hover
- **Labels:** font-size 13, peso 400/500, cor `#a1a1aa` → `#fafafa`
- **Submenus:** framer-motion AnimatePresence, chevron animado
- **Badges:** pill vermelho com shadow-red-500/40
- **Fundo:** `#1a1a1a`, bordas `rgba(255,255,255,0.06)`
- **Logout:** texto `#52525b`, hover `#FF073A`

### Origem:
Baseado no `SidebarC.tsx` do prototype-c em `github.com/agencianookweb-hash/Tecnopano`

---

## Paleta de Cores
- Primary Red: `#FF073A` / `#ed1b24`
- Dark Red: `#B20028`
- Dark Blue: `#001443`
- Background: `#0a0a0a` (login), `#1a1a1a` (sidebar)
- Text: `#fafafa` (ativo), `#a1a1aa` (normal), `#52525b` (muted)

## Regras Gerais
- Login e Sidebar são dark mode SEMPRE — nunca usar tema light neles
- Sidebar preservada do prototype-c — não alterar o design visual
- Login preservado do repo original — não alterar o design visual
- **Logo do login:** TRAVADA — ver secção acima; não mudar `src` da imagem nem substituir o asset sem ordem explícita do utilizador
- Se precisar alterar, partir do arquivo existente, NUNCA recriar
