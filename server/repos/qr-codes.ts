import { supabase } from "../supabase";

const QR_SELECT = `
  id,
  codigo,
  tipo,
  coletaId:coleta_id,
  fornecedorId:fornecedor_id,
  tipoMaterial:tipo_material,
  cor,
  pesoInicial:peso_inicial,
  status,
  createdAt:created_at
`.trim();

export interface QrCodeInput {
  tipo?: string;
  coletaId?: string;
  fornecedorId?: string;
  tipoMaterial?: string;
  cor?: string;
  pesoInicial?: number;
}

function generateCodigo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TN-${ts}-${rand}`;
}

export async function listQrCodes() {
  const { data, error } = await supabase
    .from("qr_codes")
    .select(QR_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listQrCodesByColeta(coletaId: string) {
  const { data, error } = await supabase
    .from("qr_codes")
    .select(QR_SELECT)
    .eq("coleta_id", coletaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createQrCode(input: QrCodeInput) {
  const { data, error } = await supabase
    .from("qr_codes")
    .insert({
      codigo: generateCodigo(),
      tipo: input.tipo || "trouxa",
      coleta_id: input.coletaId || null,
      fornecedor_id: input.fornecedorId || null,
      tipo_material: input.tipoMaterial || null,
      cor: input.cor || null,
      peso_inicial: input.pesoInicial || null,
    })
    .select(QR_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function scanQrCode(codigo: string) {
  const { data, error } = await supabase
    .from("qr_codes")
    .select(`
      ${QR_SELECT},
      coleta:coletas(numero, nome_fantasia, cnpj_fornecedor)
    `)
    .eq("codigo", codigo)
    .single();
  if (error) throw error;
  return data;
}
