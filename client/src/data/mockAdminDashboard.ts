/**
 * Dados mock — visão Super Admin (acesso total).
 * Baseado no schema real do Bubble.io (banco_de_dados_completo.md).
 * Fluxo: Coleta → Separação → Produção / Repanol / Costureira → Estoque → Expedição
 * 4 Galpões: Oceânica, Vicente, Nova Mirim, Goiânia
 * 22 Rotas de expedição: A-S + Spot + Retire Aqui + VLI
 */

export interface AdminDashboardSnapshot {
  coletas: Array<{
    id: number;
    status: string;
    fornecedor?: string;
    galpao?: string;
    pesoTotalNF?: number;
    pesoTotalAtual?: number;
    notaFiscal?: string;
    dataChegada?: string;
  }>;
  separacoes: Array<{
    id: number;
    status?: string;
    tipoMaterial?: string;
    cor?: string;
    peso?: number;
    galpao?: string;
    colaborador?: string;
  }>;
  producoes: Array<{
    id: number;
    status: string;
    sala?: string;
    tipoMaterial?: string;
    kilo?: number;
    galpao?: string;
  }>;
  repanol: Array<{
    id: number;
    status: string;
    tipoMaterial?: string;
    pesoManchadoEnvio?: number;
    pesoMolhadoEnvio?: number;
    pesoTingidoEnvio?: number;
    empresa?: string;
    galpao?: string;
  }>;
  costureira: Array<{
    id: number;
    status: string;
    costureira?: string;
    tipoMaterial?: string;
    qtdsSaidaKG?: number;
    qtdsRetornoKG?: number;
    residuos?: number;
    galpao?: string;
  }>;
  estoque: Array<{
    id: number;
    kilo: number;
    material?: string;
    cor?: string;
    galpao?: string;
    status?: string;
    unidade?: number;
    medida?: string;
  }>;
  expedicoes: Array<{
    id: number;
    statusFinanceiro: string;
    statusNota: string;
    statusEntrega: string;
    cliente?: string;
    rota?: string;
    prioridade?: string;
    kilo?: number;
    galpao?: string;
  }>;
  colaboradores: Array<{
    id: number;
    nome: string;
    departamento?: string;
    cargo?: string;
    galpao?: string;
    status?: number;
  }>;
  clientes: Array<{
    id: number;
    razaoSocial?: string;
    nomeFantasia?: string;
    cidade?: string;
  }>;
  fornecedores: Array<{
    id: number;
    nomeFantasia?: string;
    razaoSocial?: string;
    statusServico?: string;
  }>;
  produtos: Array<{
    id: number;
    descricao?: string;
    tipoMaterial?: string;
    cor?: string;
    medida?: string;
  }>;
}

export const MOCK_ADMIN_DASHBOARD: AdminDashboardSnapshot = {
  coletas: [
    { id: 1001, status: "pendente", fornecedor: "Têxtil Norte Ltda", galpao: "Oceânica", pesoTotalNF: 2450, pesoTotalAtual: 0, notaFiscal: "NF-48721", dataChegada: "2026-04-07" },
    { id: 1002, status: "pendente", fornecedor: "Malhas Sul S.A.", galpao: "Vicente", pesoTotalNF: 1800, pesoTotalAtual: 0, notaFiscal: "NF-48722", dataChegada: "2026-04-07" },
    { id: 1003, status: "agendado", fornecedor: "Corttex Industria", galpao: "Nova Mirim", pesoTotalNF: 3200, pesoTotalAtual: 0, notaFiscal: "NF-48715", dataChegada: "2026-04-08" },
    { id: 1004, status: "agendado", fornecedor: "Fios Leste ME", galpao: "Goiânia", pesoTotalNF: 980, pesoTotalAtual: 0, notaFiscal: "NF-48710", dataChegada: "2026-04-08" },
    { id: 1005, status: "recebido", fornecedor: "Grupo Fibratex", galpao: "Oceânica", pesoTotalNF: 4100, pesoTotalAtual: 4085, notaFiscal: "NF-48690", dataChegada: "2026-04-05" },
    { id: 1006, status: "em_separacao", fornecedor: "Malhas Sul S.A.", galpao: "Vicente", pesoTotalNF: 2750, pesoTotalAtual: 2720, notaFiscal: "NF-48685", dataChegada: "2026-04-04" },
    { id: 1007, status: "em_separacao", fornecedor: "Têxtil Norte Ltda", galpao: "Oceânica", pesoTotalNF: 1600, pesoTotalAtual: 1590, notaFiscal: "NF-48680", dataChegada: "2026-04-03" },
    { id: 1008, status: "em_producao", fornecedor: "Corttex Industria", galpao: "Nova Mirim", pesoTotalNF: 5200, pesoTotalAtual: 5180, notaFiscal: "NF-48660", dataChegada: "2026-04-01" },
    { id: 1009, status: "em_producao", fornecedor: "Fios Leste ME", galpao: "Oceânica", pesoTotalNF: 3400, pesoTotalAtual: 3380, notaFiscal: "NF-48655", dataChegada: "2026-03-31" },
    { id: 1010, status: "em_producao", fornecedor: "Grupo Fibratex", galpao: "Vicente", pesoTotalNF: 2900, pesoTotalAtual: 2870, notaFiscal: "NF-48650", dataChegada: "2026-03-30" },
    { id: 1011, status: "concluido", fornecedor: "Têxtil Norte Ltda", galpao: "Oceânica", pesoTotalNF: 4800, pesoTotalAtual: 4760, notaFiscal: "NF-48620", dataChegada: "2026-03-25" },
    { id: 1012, status: "concluido", fornecedor: "Malhas Sul S.A.", galpao: "Vicente", pesoTotalNF: 3100, pesoTotalAtual: 3075, notaFiscal: "NF-48615", dataChegada: "2026-03-24" },
    { id: 1013, status: "concluido", fornecedor: "Corttex Industria", galpao: "Nova Mirim", pesoTotalNF: 2200, pesoTotalAtual: 2185, notaFiscal: "NF-48610", dataChegada: "2026-03-22" },
    { id: 1014, status: "concluido", fornecedor: "Fios Leste ME", galpao: "Goiânia", pesoTotalNF: 1500, pesoTotalAtual: 1490, notaFiscal: "NF-48605", dataChegada: "2026-03-20" },
  ],

  separacoes: [
    { id: 2001, tipoMaterial: "TNT", cor: "Branco", peso: 420, galpao: "Oceânica", colaborador: "Carlos Souza" },
    { id: 2002, tipoMaterial: "TOALHA", cor: "Azul", peso: 380, galpao: "Oceânica", colaborador: "Carlos Souza" },
    { id: 2003, tipoMaterial: "UNIFORME", cor: "Cinza", peso: 650, galpao: "Vicente", colaborador: "Roberto Alves" },
    { id: 2004, tipoMaterial: "ESTOPA", cor: "Natural", peso: 290, galpao: "Vicente", colaborador: "Roberto Alves" },
    { id: 2005, tipoMaterial: "MALHA", cor: "Preto", peso: 510, galpao: "Nova Mirim", colaborador: "José Lima" },
    { id: 2006, tipoMaterial: "FRONHA", cor: "Branco", peso: 180, galpao: "Oceânica", colaborador: "Carlos Souza" },
    { id: 2007, tipoMaterial: "GSY", cor: "Verde", peso: 340, galpao: "Oceânica", colaborador: "Ana Costa" },
    { id: 2008, tipoMaterial: "AVENTAL", cor: "Azul", peso: 220, galpao: "Vicente", colaborador: "Roberto Alves" },
    { id: 2009, tipoMaterial: "MANTA ABSORÇÃO", cor: "Natural", peso: 780, galpao: "Nova Mirim", colaborador: "José Lima" },
    { id: 2010, tipoMaterial: "LISTRADO", cor: "Multi", peso: 460, galpao: "Goiânia", colaborador: "Paulo Neto" },
    { id: 2011, status: "em_andamento", tipoMaterial: "PASTELÃO", cor: "Branco", peso: 550, galpao: "Oceânica", colaborador: "Carlos Souza" },
    { id: 2012, status: "em_andamento", tipoMaterial: "FITILHO", cor: "Vermelho", peso: 310, galpao: "Vicente", colaborador: "Roberto Alves" },
  ],

  producoes: [
    { id: 3001, status: "ativa", sala: "Sala 1", tipoMaterial: "TNT", kilo: 420, galpao: "Oceânica" },
    { id: 3002, status: "ativa", sala: "Sala 2", tipoMaterial: "TOALHA", kilo: 380, galpao: "Oceânica" },
    { id: 3003, status: "ativa", sala: "Sala 1", tipoMaterial: "UNIFORME", kilo: 650, galpao: "Vicente" },
    { id: 3004, status: "pausada", sala: "Sala 3", tipoMaterial: "MALHA", kilo: 510, galpao: "Nova Mirim" },
    { id: 3005, status: "ativa", sala: "Sala 2", tipoMaterial: "GSY", kilo: 340, galpao: "Oceânica" },
    { id: 3006, status: "concluida", sala: "Sala 1", tipoMaterial: "ESTOPA", kilo: 290, galpao: "Vicente" },
    { id: 3007, status: "concluida", sala: "Sala 2", tipoMaterial: "FRONHA", kilo: 180, galpao: "Oceânica" },
    { id: 3008, status: "concluida", sala: "Sala 1", tipoMaterial: "AVENTAL", kilo: 220, galpao: "Vicente" },
  ],

  repanol: [
    { id: 4001, status: "enviado", tipoMaterial: "UNIFORME", pesoManchadoEnvio: 320, pesoMolhadoEnvio: 180, pesoTingidoEnvio: 150, empresa: "Repanol Santos", galpao: "Oceânica" },
    { id: 4002, status: "enviado", tipoMaterial: "TOALHA", pesoManchadoEnvio: 250, pesoMolhadoEnvio: 130, pesoTingidoEnvio: 0, empresa: "Repanol Santos", galpao: "Vicente" },
    { id: 4003, status: "enviado", tipoMaterial: "MALHA", pesoManchadoEnvio: 180, pesoMolhadoEnvio: 90, pesoTingidoEnvio: 60, empresa: "Repanol Cubatão", galpao: "Nova Mirim" },
    { id: 4004, status: "retornado", tipoMaterial: "ESTOPA", pesoManchadoEnvio: 200, pesoMolhadoEnvio: 100, pesoTingidoEnvio: 80, empresa: "Repanol Santos", galpao: "Oceânica" },
    { id: 4005, status: "retornado", tipoMaterial: "GSY", pesoManchadoEnvio: 150, pesoMolhadoEnvio: 70, pesoTingidoEnvio: 40, empresa: "Repanol Cubatão", galpao: "Vicente" },
  ],

  costureira: [
    { id: 5001, status: "enviado", costureira: "Maria Aparecida", tipoMaterial: "UNIFORME", qtdsSaidaKG: 180, qtdsRetornoKG: 0, residuos: 0, galpao: "Oceânica" },
    { id: 5002, status: "enviado", costureira: "Joana Santos", tipoMaterial: "AVENTAL", qtdsSaidaKG: 120, qtdsRetornoKG: 0, residuos: 0, galpao: "Vicente" },
    { id: 5003, status: "recebido", costureira: "Maria Aparecida", tipoMaterial: "TOALHA", qtdsSaidaKG: 250, qtdsRetornoKG: 240, residuos: 10, galpao: "Oceânica" },
    { id: 5004, status: "recebido", costureira: "Rosa Lima", tipoMaterial: "FRONHA", qtdsSaidaKG: 90, qtdsRetornoKG: 88, residuos: 2, galpao: "Nova Mirim" },
  ],

  estoque: [
    { id: 6001, kilo: 4200, material: "TNT", cor: "Branco", galpao: "Oceânica", status: "Disponível", unidade: 140, medida: "30x30" },
    { id: 6002, kilo: 3100, material: "TOALHA", cor: "Azul", galpao: "Oceânica", status: "Disponível", unidade: 95, medida: "40x40" },
    { id: 6003, kilo: 890, material: "UNIFORME", cor: "Cinza", galpao: "Vicente", status: "Disponível", unidade: 45, medida: "P/M/G" },
    { id: 6004, kilo: 2400, material: "ESTOPA", cor: "Natural", galpao: "Vicente", status: "Disponível", unidade: 80, medida: "30x40" },
    { id: 6005, kilo: 1650, material: "MALHA", cor: "Preto", galpao: "Nova Mirim", status: "Disponível", unidade: 55, medida: "40x50" },
    { id: 6006, kilo: 760, material: "FRONHA", cor: "Branco", galpao: "Oceânica", status: "Reservado", unidade: 38, medida: "50x70" },
    { id: 6007, kilo: 1200, material: "GSY", cor: "Verde", galpao: "Oceânica", status: "Disponível", unidade: 60, medida: "33x33" },
    { id: 6008, kilo: 950, material: "AVENTAL", cor: "Azul", galpao: "Vicente", status: "Disponível", unidade: 48, medida: "P/M/G/GG" },
    { id: 6009, kilo: 580, material: "MANTA ABSORÇÃO", cor: "Natural", galpao: "Nova Mirim", status: "Disponível", unidade: 20, medida: "40x50" },
    { id: 6010, kilo: 340, material: "LISTRADO", cor: "Multi", galpao: "Goiânia", status: "Disponível", unidade: 17, medida: "30x30" },
    { id: 6011, kilo: 1800, material: "PASTELÃO", cor: "Branco", galpao: "Oceânica", status: "Disponível", unidade: 72, medida: "40x40" },
    { id: 6012, kilo: 420, material: "FITILHO", cor: "Vermelho", galpao: "Vicente", status: "Reservado", unidade: 21, medida: "30x30" },
  ],

  expedicoes: [
    { id: 7001, statusFinanceiro: "pendente_aprovacao", statusNota: "pendente_emissao", statusEntrega: "pendente", cliente: "Magazine ABC Ltda", rota: "A", prioridade: "Alta", kilo: 850, galpao: "Oceânica" },
    { id: 7002, statusFinanceiro: "pendente_aprovacao", statusNota: "pendente_emissao", statusEntrega: "pendente", cliente: "Rede XYZ S.A.", rota: "B", prioridade: "Normal", kilo: 620, galpao: "Oceânica" },
    { id: 7003, statusFinanceiro: "pendente_aprovacao", statusNota: "pendente_emissao", statusEntrega: "pendente", cliente: "Hotel Santista", rota: "C", prioridade: "Alta", kilo: 1200, galpao: "Vicente" },
    { id: 7004, statusFinanceiro: "aprovado", statusNota: "pendente_emissao", statusEntrega: "pendente", cliente: "Loja Sul ME", rota: "D", prioridade: "Normal", kilo: 450, galpao: "Oceânica" },
    { id: 7005, statusFinanceiro: "aprovado", statusNota: "pendente_emissao", statusEntrega: "pendente", cliente: "Indústria Têxtil SP", rota: "E", prioridade: "Normal", kilo: 780, galpao: "Nova Mirim" },
    { id: 7006, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "pendente", cliente: "Atacado Central", rota: "F", prioridade: "Alta", kilo: 1500, galpao: "Oceânica" },
    { id: 7007, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "em_rota", cliente: "Varejo Oeste", rota: "G", prioridade: "Normal", kilo: 920, galpao: "Vicente" },
    { id: 7008, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "em_rota", cliente: "Lavanderia Express", rota: "H", prioridade: "Normal", kilo: 380, galpao: "Oceânica" },
    { id: 7009, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "entregue", cliente: "E-commerce TN", rota: "Spot", prioridade: "Normal", kilo: 560, galpao: "Oceânica" },
    { id: 7010, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "entregue", cliente: "Hospital Santos", rota: "A", prioridade: "Alta", kilo: 2100, galpao: "Vicente" },
    { id: 7011, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "entregue", cliente: "Clínica Vida", rota: "B", prioridade: "Normal", kilo: 340, galpao: "Oceânica" },
    { id: 7012, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "entregue", cliente: "Restaurante Mar", rota: "VLI", prioridade: "Normal", kilo: 280, galpao: "Nova Mirim" },
    { id: 7013, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "entregue", cliente: "Pousada Litoral", rota: "C", prioridade: "Normal", kilo: 190, galpao: "Goiânia" },
    { id: 7014, statusFinanceiro: "aprovado", statusNota: "emitida", statusEntrega: "entregue", cliente: "Rede Hoteleira SP", rota: "D", prioridade: "Alta", kilo: 3200, galpao: "Oceânica" },
  ],

  colaboradores: [
    { id: 1, nome: "Maria Silva", departamento: "Produção", cargo: "Operadora", galpao: "Oceânica", status: 1 },
    { id: 2, nome: "João Santos", departamento: "Expedição", cargo: "Separador", galpao: "Oceânica", status: 1 },
    { id: 3, nome: "Ana Costa", departamento: "RH", cargo: "Analista", galpao: "Oceânica", status: 1 },
    { id: 4, nome: "Pedro Lima", departamento: "Galpão", cargo: "Encarregado", galpao: "Vicente", status: 1 },
    { id: 5, nome: "Carlos Souza", departamento: "Separação", cargo: "Operador", galpao: "Oceânica", status: 1 },
    { id: 6, nome: "Roberto Alves", departamento: "Separação", cargo: "Operador", galpao: "Vicente", status: 1 },
    { id: 7, nome: "José Lima", departamento: "Produção", cargo: "Operador", galpao: "Nova Mirim", status: 1 },
    { id: 8, nome: "Paulo Neto", departamento: "Produção", cargo: "Operador", galpao: "Goiânia", status: 1 },
    { id: 9, nome: "Fernanda Reis", departamento: "Financeiro", cargo: "Analista", galpao: "Oceânica", status: 1 },
    { id: 10, nome: "Lucas Oliveira", departamento: "Expedição", cargo: "Motorista", galpao: "Oceânica", status: 1 },
    { id: 11, nome: "Marcos Pereira", departamento: "Expedição", cargo: "Motorista", galpao: "Vicente", status: 1 },
    { id: 12, nome: "Ricardo Santos", departamento: "Galpão", cargo: "Encarregado", galpao: "Nova Mirim", status: 0 },
  ],

  clientes: [
    { id: 1, razaoSocial: "Magazine ABC Ltda", nomeFantasia: "Magazine ABC", cidade: "Santos" },
    { id: 2, razaoSocial: "Rede XYZ S.A.", nomeFantasia: "Rede XYZ", cidade: "São Vicente" },
    { id: 3, razaoSocial: "Loja Sul ME", nomeFantasia: "Loja Sul", cidade: "Praia Grande" },
    { id: 4, razaoSocial: "Atacado Central Ltda", nomeFantasia: "Atacado Central", cidade: "Cubatão" },
    { id: 5, razaoSocial: "Varejo Oeste S.A.", nomeFantasia: "Varejo Oeste", cidade: "Guarujá" },
    { id: 6, razaoSocial: "E-commerce TN Ltda", nomeFantasia: "E-commerce TN", cidade: "Santos" },
    { id: 7, razaoSocial: "Hospital Santos S.A.", nomeFantasia: "Hospital Santos", cidade: "Santos" },
    { id: 8, razaoSocial: "Clínica Vida Ltda", nomeFantasia: "Clínica Vida", cidade: "São Vicente" },
    { id: 9, razaoSocial: "Hotel Santista Ltda", nomeFantasia: "Hotel Santista", cidade: "Santos" },
    { id: 10, razaoSocial: "Restaurante Mar ME", nomeFantasia: "Restaurante Mar", cidade: "Guarujá" },
    { id: 11, razaoSocial: "Pousada Litoral ME", nomeFantasia: "Pousada Litoral", cidade: "Bertioga" },
    { id: 12, razaoSocial: "Rede Hoteleira SP S.A.", nomeFantasia: "Rede Hoteleira SP", cidade: "São Paulo" },
    { id: 13, razaoSocial: "Lavanderia Express Ltda", nomeFantasia: "Lavanderia Express", cidade: "Santos" },
    { id: 14, razaoSocial: "Indústria Têxtil SP Ltda", nomeFantasia: "Indústria Têxtil SP", cidade: "São Paulo" },
  ],

  fornecedores: [
    { id: 1, nomeFantasia: "Têxtil Norte", razaoSocial: "Têxtil Norte Ltda", statusServico: "Ativo" },
    { id: 2, nomeFantasia: "Malhas Sul", razaoSocial: "Malhas Sul S.A.", statusServico: "Ativo" },
    { id: 3, nomeFantasia: "Corttex", razaoSocial: "Corttex Industria Ltda", statusServico: "Ativo" },
    { id: 4, nomeFantasia: "Fios Leste", razaoSocial: "Fios Leste ME", statusServico: "Ativo" },
    { id: 5, nomeFantasia: "Grupo Fibratex", razaoSocial: "Grupo Fibratex S.A.", statusServico: "Ativo" },
  ],

  produtos: [
    { id: 1, descricao: "Pano TNT Branco 30x30", tipoMaterial: "TNT", cor: "Branco", medida: "30x30" },
    { id: 2, descricao: "Toalha Industrial Azul 40x40", tipoMaterial: "TOALHA", cor: "Azul", medida: "40x40" },
    { id: 3, descricao: "Uniforme Cinza P/M/G", tipoMaterial: "UNIFORME", cor: "Cinza", medida: "P/M/G" },
    { id: 4, descricao: "Estopa Natural 30x40", tipoMaterial: "ESTOPA", cor: "Natural", medida: "30x40" },
    { id: 5, descricao: "Malha Preta 40x50", tipoMaterial: "MALHA", cor: "Preto", medida: "40x50" },
    { id: 6, descricao: "Fronha Branca 50x70", tipoMaterial: "FRONHA", cor: "Branco", medida: "50x70" },
    { id: 7, descricao: "GSY Verde 33x33", tipoMaterial: "GSY", cor: "Verde", medida: "33x33" },
    { id: 8, descricao: "Avental Azul P/M/G/GG", tipoMaterial: "AVENTAL", cor: "Azul", medida: "P/M/G/GG" },
  ],
};
