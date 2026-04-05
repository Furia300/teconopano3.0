// Proxy para API RHiD ControlID
// Docs: https://www.rhid.com.br/v2/swagger.svc/index.html

const RHID_BASE_URL = process.env.RHID_API_URL || "https://www.rhid.com.br/v2/swagger.svc";

interface RHiDLoginResult {
  accessToken: string;
  listCustomer: { id: number; domain: string; name: string }[];
  expiredPassword: boolean;
  code: number;
  error: string;
}

interface RHiDPerson {
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

interface RHiDDepartment {
  id: number;
  name: string;
  idCompany: number;
  companyName: string;
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

  if (!res.ok) {
    throw new Error(`RHiD login failed: ${res.status}`);
  }

  const data: RHiDLoginResult = await res.json();
  if (data.error) {
    throw new Error(`RHiD login error: ${data.error}`);
  }

  cachedToken = data.accessToken;
  tokenExpiry = Date.now() + 3600000; // 1 hour cache
  return cachedToken;
}

async function rhidGet<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${RHID_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // If 401, clear token and retry once
    if (res.status === 401) {
      cachedToken = null;
      const newToken = await getToken();
      const retry = await fetch(`${RHID_BASE_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!retry.ok) throw new Error(`RHiD API error: ${retry.status}`);
      return retry.json();
    }
    throw new Error(`RHiD API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchPessoas(): Promise<RHiDPerson[]> {
  try {
    const data = await rhidGet<{ records: RHiDPerson[] }>("/person");
    return data.records || [];
  } catch (error) {
    console.error("Erro ao buscar pessoas do RHiD:", error);
    return [];
  }
}

export async function fetchDepartamentos(): Promise<RHiDDepartment[]> {
  try {
    const data = await rhidGet<{ records: RHiDDepartment[] }>("/department");
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

export function isRHiDConfigured(): boolean {
  return !!(process.env.RHID_EMAIL && process.env.RHID_PASSWORD);
}
