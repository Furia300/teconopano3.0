# QR Codes para Demo — Tecnopano 3.0

## Como usar

1. Abra `http://localhost:3002/producao`
2. Clique **"Iniciar Atividade"** (botão verde)
3. Cole um código abaixo no campo
4. Clique **Buscar**
5. Selecione a sala (CORTE 01, 02, 03, 04, 05, CORTE VLI ou FAIXA)
6. Clique **"Iniciar Produção"**
7. Para finalizar: clique o botão na tabela → peso produzido + pacotes

## Códigos (copie e cole)

```
TN-MO0R3N70-N2SY
```
BR · Branco · 150kg · Fornecedor: RESITEC AMBIENTAL

```
TN-MO0R3NRW-I58M
```
GR · Cinza · 200kg · Fornecedor: RESITEC AMBIENTAL

```
TN-MO0R3O85-RHI9
```
TOALHA · Branco · 100kg · Fornecedor: RESITEC AMBIENTAL

```
TN-MO0MYNSW-KKJU
```
TOALHA · Branco · 120kg · Fornecedor: ATMOSFERA GESTÃO

```
TN-MO0NJ5GT-6FEL
```
GR · Branco · 300kg

```
TN-MO0Q1VSZ-JEK7
```
ESTOPA · Escuro · 150kg

```
TN-MO0Q1UYY-PIDW
```
TOALHA · Branco · 200kg

## Roteiro completo da apresentação

### 1. Triagem (`/separacao`)
- Clique Eye numa coleta → pesagem + criar lotes com QR

### 2. Produção (`/producao`)
- "Iniciar Atividade" → cola QR → seleciona sala → iniciar → finalizar

### 3. Produção Diária (`/producao-diaria`)
- Visualização por dia dos registros de produção

### 4. Dashboards
- `/dashboard-coleta` — Dashboard Coleta
- `/dashboard-expedicao` — Dashboard Expedição
- `/dashboard-financeiro` — Dashboard Financeiro
- `/dashboard-rh` — Dashboard RH
- `/gamificacao` — Gamificação (ranking colaboradores)
- `/rendimento` — Rendimento por fornecedor

### 5. Motorista (`/motorista`)
- Tabela integrada de tarefas (coleta + expedição + costureira + repanol)

## Iniciar o sistema

```bash
cd "/home/almirante/Área de trabalho/tecnopano/teconopano3.0"
npx tsx server/index.ts &
npx vite --host &
```

Backend: http://localhost:3001
Frontend: http://localhost:3002
