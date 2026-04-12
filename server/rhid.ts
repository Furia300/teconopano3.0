// Proxy para API RHiD ControlID - Sincronização Bidirecional
// Docs: https://www.rhid.com.br/v2/swagger.svc/index.html

const RHID_BASE_URL = process.env.RHID_API_URL || "https://www.rhid.com.br/v2/swagger.svc";

export interface RHiDLoginResult {
  accessToken: string;
  listCustomer: { id: number; domain: string; name: string }[];
  expiredPassword: boolean;
  code: number;
  error: string;
}

export interface RHiDPerson {
  id: number;
  cpf: number;
  pis: number;
  name: string;
  registration: string;
  idDepartment: number;
  idCompany: number;
  rfid: number;
  barCode: number;
  code: number;
  isAdmin: boolean;
  status: number;
}

export interface RHiDDepartment {
  id: number;
  name: string;
  idCompany: number;
  companyName: string;
  folha: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.RHID_EMAIL;
  const password = process.env.RHID_PASSWORD;
  const domain = process.env.RHID_DOMAIN;

  if (!email || !password) {
    throw new Error("RHID_EMAIL e RHID_PASSWORD não configurados");
  }

  const res = await fetch(`${RHID_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, domain }),
  });

  if (!res.ok) throw new Error(`RHiD login failed: ${res.status}`);

  const data: RHiDLoginResult = await res.json();
  if (data.error) throw new Error(`RHiD login error: ${data.error}`);

  cachedToken = data.accessToken;
  tokenExpiry = Date.now() + 3600000; // 1h cache
  return cachedToken;
}

async function rhidRequest<T>(method: string, path: string, body?: any): Promise<T> {
  const token = await getToken();

  const doRequest = async (authToken: string) => {
    const opts: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(`${RHID_BASE_URL}${path}`, opts);
  };

  let res = await doRequest(token);

  // Retry on 401
  if (res.status === 401) {
    cachedToken = null;
    const newToken = await getToken();
    res = await doRequest(newToken);
  }

  if (!res.ok) throw new Error(`RHiD ${method} ${path}: ${res.status}`);
  return res.json();
}

// ==================== LEITURA ====================

export async function fetchPessoas(): Promise<RHiDPerson[]> {
  try {
    // A API RHiD v2 exige paginação (?start=N&length=N) e max 100 por request.
    // Faz requests sequenciais até totalRecords ser atingido.
    const PAGE_SIZE = 100;
    let all: RHiDPerson[] = [];
    for (let start = 0; ; start += PAGE_SIZE) {
      const data = await rhidRequest<{ records: RHiDPerson[]; totalRecords?: number }>(
        "GET",
        `/person?start=${start}&length=${PAGE_SIZE}`,
      );
      const records = data.records || [];
      all = all.concat(records);
      if (records.length < PAGE_SIZE) break; // última página
    }
    return all;
  } catch (error) {
    console.error("Erro ao buscar pessoas do RHiD:", error);
    return [];
  }
}

export async function fetchDepartamentos(): Promise<RHiDDepartment[]> {
  try {
    const data = await rhidRequest<{ records: RHiDDepartment[] }>("GET", "/department?start=0&length=100");
    return data.records || [];
  } catch (error) {
    console.error("Erro ao buscar departamentos do RHiD:", error);
    return [];
  }
}

export async function fetchPessoaPorCPF(cpf: string): Promise<RHiDPerson | null> {
  try {
    const pessoas = await fetchPessoas();
    const cpfNum = Number(cpf.replace(/\D/g, ""));
    return pessoas.find((p) => p.cpf === cpfNum) || null;
  } catch {
    return null;
  }
}

// ==================== ESCRITA (Tecnopano → RHiD) ====================

export async function criarPessoaRHiD(pessoa: {
  name: string;
  cpf: string;
  registration?: string;
  idDepartment?: number;
  idCompany?: number;
}): Promise<RHiDPerson | null> {
  try {
    const payload = [{
      name: pessoa.name,
      cpf: Number(pessoa.cpf.replace(/\D/g, "")),
      registration: pessoa.registration || "",
      idDepartment: pessoa.idDepartment || 0,
      idCompany: pessoa.idCompany || 0,
      status: 1,
    }];
    const result = await rhidRequest<any>("POST", "/person", payload);
    return result;
  } catch (error) {
    console.error("Erro ao criar pessoa no RHiD:", error);
    return null;
  }
}

export async function atualizarPessoaRHiD(pessoa: {
  id: number;
  name: string;
  cpf: string;
  registration?: string;
  idDepartment?: number;
  status?: number;
}): Promise<RHiDPerson | null> {
  try {
    const payload = {
      id: pessoa.id,
      name: pessoa.name,
      cpf: Number(pessoa.cpf.replace(/\D/g, "")),
      registration: pessoa.registration || "",
      idDepartment: pessoa.idDepartment || 0,
      status: pessoa.status ?? 1,
    };
    const result = await rhidRequest<any>("PUT", "/person", payload);
    return result;
  } catch (error) {
    console.error("Erro ao atualizar pessoa no RHiD:", error);
    return null;
  }
}

export async function deletarPessoaRHiD(id: number): Promise<boolean> {
  try {
    await rhidRequest<any>("DELETE", `/person/${id}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar pessoa no RHiD:", error);
    return false;
  }
}

// ==================== DEPARTAMENTOS ESCRITA ====================

export async function criarDepartamentoRHiD(depto: {
  name: string;
  idCompany?: number;
}): Promise<RHiDDepartment | null> {
  try {
    const payload = [{ name: depto.name, idCompany: depto.idCompany || 0 }];
    const result = await rhidRequest<any>("POST", "/department", payload);
    return result;
  } catch (error) {
    console.error("Erro ao criar departamento no RHiD:", error);
    return null;
  }
}

// ==================== STATUS ====================

export function isRHiDConfigured(): boolean {
  return !!(process.env.RHID_EMAIL && process.env.RHID_PASSWORD);
}
