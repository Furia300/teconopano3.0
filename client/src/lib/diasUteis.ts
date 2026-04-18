/**
 * Calendário de dias úteis brasileiro.
 * Pula sábados, domingos e feriados nacionais + pontos facultativos comuns.
 *
 * Feriados calculados: Páscoa (móvel) → Carnaval, Sexta-feira Santa, Corpus Christi.
 * Feriados fixos: Confraternização, Tiradentes, Trabalho, Independência, N.S.Aparecida,
 *                 Finados, Proclamação da República, Natal.
 */

/** Calcula Páscoa pelo algoritmo de Meeus/Jones/Butcher */
function calcularPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes, dia);
}

/** Retorna Set de strings "YYYY-MM-DD" com todos os feriados do ano */
function feriadosBrasileiros(ano: number): Set<string> {
  const feriados = new Set<string>();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const addDias = (base: Date, dias: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + dias);
    return d;
  };

  // Feriados fixos
  feriados.add(`${ano}-01-01`); // Confraternização Universal
  feriados.add(`${ano}-04-21`); // Tiradentes
  feriados.add(`${ano}-05-01`); // Dia do Trabalho
  feriados.add(`${ano}-09-07`); // Independência do Brasil
  feriados.add(`${ano}-10-12`); // Nossa Senhora Aparecida
  feriados.add(`${ano}-11-02`); // Finados
  feriados.add(`${ano}-11-15`); // Proclamação da República
  feriados.add(`${ano}-12-25`); // Natal

  // Feriados móveis (baseados na Páscoa)
  const pascoa = calcularPascoa(ano);
  feriados.add(fmt(addDias(pascoa, -48))); // Segunda de Carnaval
  feriados.add(fmt(addDias(pascoa, -47))); // Terça de Carnaval
  feriados.add(fmt(addDias(pascoa, -46))); // Quarta de Cinzas (ponto facultativo, mas muitas empresas param)
  feriados.add(fmt(addDias(pascoa, -2)));  // Sexta-feira Santa
  feriados.add(fmt(pascoa));               // Páscoa (domingo)
  feriados.add(fmt(addDias(pascoa, 60)));  // Corpus Christi

  return feriados;
}

// Cache de feriados por ano
const _cache: Record<number, Set<string>> = {};
function getFeriados(ano: number): Set<string> {
  if (!_cache[ano]) _cache[ano] = feriadosBrasileiros(ano);
  return _cache[ano];
}

/** Verifica se uma data é dia útil (não é sábado, domingo ou feriado) */
export function isDiaUtil(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false; // domingo ou sábado
  return !getFeriados(d.getFullYear()).has(dateStr);
}

/** Verifica se é feriado */
export function isFeriado(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  return getFeriados(d.getFullYear()).has(dateStr);
}

/** Verifica se é fim de semana */
export function isFimDeSemana(dateStr: string): boolean {
  const dow = new Date(dateStr + "T12:00:00").getDay();
  return dow === 0 || dow === 6;
}

/** Retorna o nome do feriado (se for) */
export function nomeFeriado(dateStr: string): string | null {
  const ano = parseInt(dateStr.slice(0, 4));
  const pascoa = calcularPascoa(ano);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const addDias = (base: Date, dias: number) => { const d = new Date(base); d.setDate(d.getDate() + dias); return d; };

  const map: Record<string, string> = {
    [`${ano}-01-01`]: "Confraternização Universal",
    [`${ano}-04-21`]: "Tiradentes",
    [`${ano}-05-01`]: "Dia do Trabalho",
    [`${ano}-09-07`]: "Independência do Brasil",
    [`${ano}-10-12`]: "N.S. Aparecida",
    [`${ano}-11-02`]: "Finados",
    [`${ano}-11-15`]: "Proclamação da República",
    [`${ano}-12-25`]: "Natal",
    [fmt(addDias(pascoa, -48))]: "Carnaval",
    [fmt(addDias(pascoa, -47))]: "Carnaval",
    [fmt(addDias(pascoa, -46))]: "Quarta de Cinzas",
    [fmt(addDias(pascoa, -2))]: "Sexta-feira Santa",
    [fmt(pascoa)]: "Páscoa",
    [fmt(addDias(pascoa, 60))]: "Corpus Christi",
  };
  return map[dateStr] || null;
}

/**
 * Avança N dias úteis a partir de uma data.
 * Se a data base não for dia útil, avança para o próximo dia útil primeiro.
 */
export function avancarDiasUteis(dateStr: string, diasUteis: number): string {
  const d = new Date(dateStr + "T12:00:00");
  let count = 0;
  while (count < diasUteis) {
    d.setDate(d.getDate() + 1);
    const ds = d.toISOString().slice(0, 10);
    if (isDiaUtil(ds)) count++;
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Próximo dia útil a partir de uma data (inclusive).
 */
export function proximoDiaUtil(dateStr: string): string {
  let d = new Date(dateStr + "T12:00:00");
  let ds = d.toISOString().slice(0, 10);
  while (!isDiaUtil(ds)) {
    d.setDate(d.getDate() + 1);
    ds = d.toISOString().slice(0, 10);
  }
  return ds;
}

/**
 * Gera N datas recorrentes em dias úteis.
 * @param tipo - "3-dias" | "semanal" | "quinzenal" | "mensal"
 * @param dataBase - data inicial (YYYY-MM-DD)
 * @param count - número de ocorrências a gerar
 */
export function gerarDatasRecorrentesDiasUteis(
  tipo: string,
  dataBase: string,
  count = 8,
): string[] {
  if (!dataBase || !tipo) return [];

  const intervalDias =
    tipo === "3-dias" ? 3 :
    tipo === "semanal" ? 7 :
    tipo === "quinzenal" ? 15 :
    tipo === "mensal" ? 30 : 0;

  if (intervalDias === 0) return [];

  const datas: string[] = [];
  let current = proximoDiaUtil(dataBase);
  datas.push(current);

  for (let i = 1; i < count; i++) {
    // Avança os dias do intervalo
    const d = new Date(current + "T12:00:00");
    d.setDate(d.getDate() + intervalDias);
    let next = d.toISOString().slice(0, 10);
    // Se cair em fds/feriado, avança para o próximo dia útil
    next = proximoDiaUtil(next);
    datas.push(next);
    current = next;
  }

  return datas;
}
