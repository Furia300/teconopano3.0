import { supabase } from "../supabase";

const SEPARACAO_SELECT = `
  id,
  coletaId:coleta_id,
  qrCodeId:qr_code_id,
  tipoMaterial:tipo_material,
  cor,
  peso,
  destino,
  colaborador,
  galpao,
  data,
  createdAt:created_at
`.trim();

export interface SeparacaoInput {
  coletaId: string;
  qrCodeId?: string;
  tipoMaterial: string;
  cor?: string;
  peso: number;
  destino: string;
  colaborador?: string;
  galpao?: string;
}

export async function listSeparacoes() {
  const { data, error } = await supabase
    .from("separacoes")
    .select(SEPARACAO_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listSeparacoesByColeta(coletaId: string) {
  const { data, error } = await supabase
    .from("separacoes")
    .select(SEPARACAO_SELECT)
    .eq("coleta_id", coletaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createSeparacao(input: SeparacaoInput) {
  const { data, error } = await supabase
    .from("separacoes")
    .insert({
      coleta_id: input.coletaId,
      qr_code_id: input.qrCodeId || null,
      tipo_material: input.tipoMaterial,
      cor: input.cor || null,
      peso: input.peso,
      destino: input.destino,
      colaborador: input.colaborador || null,
      galpao: input.galpao || null,
      data: new Date().toISOString(),
    })
    .select(SEPARACAO_SELECT)
    .single();
  if (error) throw error;
  return data;
}
