import type { Express, Request, Response } from "express";
import { fetchPessoas, fetchDepartamentos, isRHiDConfigured } from "./rhid";

// In-memory storage (will be replaced with DB later)
let coletas: any[] = [
  {
    id: "1",
    numero: 248,
    fornecedorId: "f1",
    nomeFantasia: "ATMOSFERA GESTÃO",
    razaoSocial: "Atmosfera Gestão e Serviços Ltda",
    cnpjFornecedor: "12.345.678/0001-90",
    notaFiscal: "NF-001234",
    pesoTotalNF: 555,
    pesoTotalAtual: 550,
    dataPedido: "2026-04-01T10:00:00Z",
    dataChegada: "2026-04-03T08:30:00Z",
    galpao: "Vicente",
    status: "recebido",
    statusServico: "Em andamento",
    observacao: "",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "2",
    numero: 247,
    fornecedorId: "f2",
    nomeFantasia: "SUL AMERICANA",
    razaoSocial: "Sul Americana Têxtil Ltda",
    cnpjFornecedor: "98.765.432/0001-10",
    notaFiscal: "NF-005678",
    pesoTotalNF: 300,
    pesoTotalAtual: 295,
    dataPedido: "2026-03-28T14:00:00Z",
    dataChegada: "2026-03-30T09:00:00Z",
    galpao: "Vicente",
    status: "em_separacao",
    statusServico: "Em andamento",
    observacao: "Material misto",
    createdAt: "2026-03-28T14:00:00Z",
  },
  {
    id: "3",
    numero: 246,
    fornecedorId: "f3",
    nomeFantasia: "HOTEL MAJESTIC",
    razaoSocial: "Hotel Majestic S.A.",
    cnpjFornecedor: "11.222.333/0001-44",
    notaFiscal: "NF-009012",
    pesoTotalNF: 420,
    pesoTotalAtual: 418,
    dataPedido: "2026-03-25T11:00:00Z",
    dataChegada: "2026-03-27T07:45:00Z",
    galpao: "Vicente",
    status: "em_producao",
    statusServico: "Em andamento",
    observacao: "",
    createdAt: "2026-03-25T11:00:00Z",
  },
  {
    id: "4",
    numero: 245,
    fornecedorId: "f4",
    nomeFantasia: "VLI LOGÍSTICA",
    razaoSocial: "VLI Multimodal S.A.",
    cnpjFornecedor: "55.666.777/0001-88",
    notaFiscal: "NF-003456",
    pesoTotalNF: 800,
    pesoTotalAtual: 790,
    dataPedido: "2026-03-20T09:00:00Z",
    dataChegada: "2026-03-22T10:00:00Z",
    galpao: "Vicente",
    status: "finalizado",
    statusServico: "Concluído",
    observacao: "Lote grande - VLI exclusivo",
    createdAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "5",
    numero: 249,
    fornecedorId: "f5",
    nomeFantasia: "REDE ACCOR",
    razaoSocial: "Accor Hospitality Brasil Ltda",
    cnpjFornecedor: "33.444.555/0001-22",
    notaFiscal: "",
    pesoTotalNF: 0,
    pesoTotalAtual: 0,
    dataPedido: "2026-04-05T08:00:00Z",
    dataChegada: null,
    galpao: "Vicente",
    status: "pendente",
    statusServico: "Aguardando",
    observacao: "Coleta agendada para amanhã",
    createdAt: "2026-04-05T08:00:00Z",
  },
];

let fornecedores: any[] = [
  { id: "f1", nome: "ATMOSFERA GESTÃO", razaoSocial: "Atmosfera Gestão e Serviços Ltda", cnpj: "12.345.678/0001-90", contato: "(13) 3333-1111", email: "contato@atmosfera.com", ativo: true },
  { id: "f2", nome: "SUL AMERICANA", razaoSocial: "Sul Americana Têxtil Ltda", cnpj: "98.765.432/0001-10", contato: "(11) 4444-2222", email: "contato@sulamericana.com", ativo: true },
  { id: "f3", nome: "HOTEL MAJESTIC", razaoSocial: "Hotel Majestic S.A.", cnpj: "11.222.333/0001-44", contato: "(13) 5555-3333", email: "compras@majestic.com", ativo: true },
  { id: "f4", nome: "VLI LOGÍSTICA", razaoSocial: "VLI Multimodal S.A.", cnpj: "55.666.777/0001-88", contato: "(31) 6666-4444", email: "suprimentos@vli.com", ativo: true },
  { id: "f5", nome: "REDE ACCOR", razaoSocial: "Accor Hospitality Brasil Ltda", cnpj: "33.444.555/0001-22", contato: "(11) 7777-5555", email: "compras@accor.com", ativo: true },
];

let separacoes: any[] = [
  { id: "s1", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", tipoMaterial: "TOALHA", cor: "Branco", peso: 120, destino: "producao", colaborador: "Carlos", data: "2026-04-03T09:00:00Z" },
  { id: "s2", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", tipoMaterial: "LENÇOL", cor: "Branco", peso: 200, destino: "producao", colaborador: "Carlos", data: "2026-04-03T09:15:00Z" },
  { id: "s3", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", tipoMaterial: "FRONHA", cor: "Escuro", peso: 80, destino: "repanol", colaborador: "Carlos", data: "2026-04-03T09:30:00Z" },
  { id: "s4", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", tipoMaterial: "EDREDON", cor: "Colorido", peso: 150, destino: "producao", colaborador: "Carlos", data: "2026-04-03T09:45:00Z" },
  { id: "s5", coletaId: "2", coletaNumero: 247, fornecedor: "SUL AMERICANA", tipoMaterial: "MALHA", cor: "Azul", peso: 100, destino: "producao", colaborador: "João", data: "2026-03-31T10:00:00Z" },
  { id: "s6", coletaId: "2", coletaNumero: 247, fornecedor: "SUL AMERICANA", tipoMaterial: "GSY", cor: "Variado", peso: 95, destino: "costureira", colaborador: "João", data: "2026-03-31T10:20:00Z" },
  { id: "s7", coletaId: "2", coletaNumero: 247, fornecedor: "SUL AMERICANA", tipoMaterial: "TNT", cor: "Preto", peso: 55, destino: "repanol", colaborador: "João", data: "2026-03-31T10:40:00Z" },
  { id: "s8", coletaId: "3", coletaNumero: 246, fornecedor: "HOTEL MAJESTIC", tipoMaterial: "TOALHA", cor: "Branco", peso: 250, destino: "producao", colaborador: "Maria", data: "2026-03-28T08:00:00Z" },
  { id: "s9", coletaId: "3", coletaNumero: 246, fornecedor: "HOTEL MAJESTIC", tipoMaterial: "ENXOVAL", cor: "Branco", peso: 168, destino: "producao", colaborador: "Maria", data: "2026-03-28T08:30:00Z" },
  { id: "s10", coletaId: "4", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", tipoMaterial: "ESTOPA", cor: "Escuro", peso: 400, destino: "producao", colaborador: "Pedro", data: "2026-03-23T07:00:00Z" },
  { id: "s11", coletaId: "4", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", tipoMaterial: "GRU", cor: "Variado", peso: 390, destino: "producao", colaborador: "Pedro", data: "2026-03-23T07:30:00Z" },
];

let producoes: any[] = [
  { id: "p1", coletaId: "3", coletaNumero: 246, fornecedor: "HOTEL MAJESTIC", sala: "CORTE 01", tipoMaterial: "TOALHA", cor: "Branco", acabamento: "Corte-Reto", medida: "30x30 Cm", kilo: 120, pesoMedio: 0.5, qtdePacote: 240, unidadeSaida: "unidade", statusEstoque: "em_estoque", operador: "Lucas", dataCriacao: "2026-03-29T08:00:00Z" },
  { id: "p2", coletaId: "3", coletaNumero: 246, fornecedor: "HOTEL MAJESTIC", sala: "CORTE 03", tipoMaterial: "ENXOVAL", cor: "Branco", acabamento: "Overlock", medida: "50x50 Cm", kilo: 80, pesoMedio: 0.8, qtdePacote: 100, unidadeSaida: "unidade", statusEstoque: "em_estoque", operador: "Lucas", dataCriacao: "2026-03-29T09:30:00Z" },
  { id: "p3", coletaId: "4", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", sala: "CORTE VLI", tipoMaterial: "ESTOPA", cor: "Escuro", acabamento: "Sem Acabamento", medida: "", kilo: 400, pesoMedio: 0, qtdePacote: 0, unidadeSaida: "kilo", statusEstoque: "em_estoque", operador: "Rafael", dataCriacao: "2026-03-24T07:00:00Z" },
  { id: "p4", coletaId: "4", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", sala: "FAIXA", tipoMaterial: "GRU", cor: "Variado", acabamento: "Corte-Reto", medida: "", kilo: 350, pesoMedio: 0, qtdePacote: 0, unidadeSaida: "kilo", statusEstoque: "pendente", operador: "Rafael", dataCriacao: "2026-03-24T08:00:00Z" },
  { id: "p5", coletaId: "2", coletaNumero: 247, fornecedor: "SUL AMERICANA", sala: "CORTE 02", tipoMaterial: "MALHA", cor: "Azul", acabamento: "Zig-Zag", medida: "40x40 Cm", kilo: 95, pesoMedio: 0.4, qtdePacote: 237, unidadeSaida: "unidade", statusEstoque: "pendente", operador: "Ana", dataCriacao: "2026-04-01T10:00:00Z" },
  { id: "p6", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", sala: "CORTE 04", tipoMaterial: "LENÇOL", cor: "Branco", acabamento: "Overlock", medida: "60x80 Cm", kilo: 180, pesoMedio: 1.2, qtdePacote: 150, unidadeSaida: "unidade", statusEstoque: "pendente", operador: "Marcos", dataCriacao: "2026-04-04T14:00:00Z" },
  { id: "p7", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", sala: "CORTE 05", tipoMaterial: "EDREDON", cor: "Colorido", acabamento: "Sem Acabamento", medida: "", kilo: 130, pesoMedio: 0, qtdePacote: 0, unidadeSaida: "kilo", statusEstoque: "pendente", operador: "Marcos", dataCriacao: "2026-04-04T15:00:00Z" },
];

let repanolList: any[] = [
  { id: "r1", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", empresaFornecedor: "Lavanderia SP", tipoMaterial: "FRONHA", dataEnvio: "2026-04-04T08:00:00Z", dataRetorno: null, pesoManchadoEnvio: 30, pesoMolhadoEnvio: 25, pesoTingidoEnvio: 25, pesoManchadoRetorno: 0, pesoMolhadoRetorno: 0, pesoTingidoRetorno: 0, repanolResiduo: 0, status: "enviado" },
  { id: "r2", coletaId: "2", coletaNumero: 247, fornecedor: "SUL AMERICANA", empresaFornecedor: "Lavanderia SP", tipoMaterial: "TNT", dataEnvio: "2026-04-01T09:00:00Z", dataRetorno: "2026-04-03T14:00:00Z", pesoManchadoEnvio: 20, pesoMolhadoEnvio: 15, pesoTingidoEnvio: 20, pesoManchadoRetorno: 18, pesoMolhadoRetorno: 14, pesoTingidoRetorno: 19, repanolResiduo: 4, status: "retornado" },
  { id: "r3", coletaId: "4", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", empresaFornecedor: "TingeBem Ltda", tipoMaterial: "ESTOPA", dataEnvio: "2026-03-23T10:00:00Z", dataRetorno: "2026-03-26T11:00:00Z", pesoManchadoEnvio: 50, pesoMolhadoEnvio: 40, pesoTingidoEnvio: 60, pesoManchadoRetorno: 48, pesoMolhadoRetorno: 38, pesoTingidoRetorno: 57, repanolResiduo: 7, status: "retornado" },
];

let costureiraList: any[] = [
  { id: "c1", coletaId: "1", coletaNumero: 248, fornecedor: "ATMOSFERA GESTÃO", costureira: "Maria Silva (CLT)", tipoMaterial: "TOALHA", tipoMedida: "30x30 Cm", status: "enviado", dataEnvio: "2026-04-04T10:00:00Z", dataRetorno: null, motoristaEnvio: "José", motoristaRetorno: "", qtdsSaidaKg: 60, qtdsRetornoKg: 0, qtdsPacotesRetorno: 0, totalDifKg: 0, residuos: 0, assCostEntrega: "signed", assMotEntrega: "signed", assCostDevolucao: null, assMotDevolucao: null, galpaoEnvio: "Vicente", observacao: "" },
  { id: "c2", coletaId: "3", coletaNumero: 246, fornecedor: "HOTEL MAJESTIC", costureira: "Ana Santos", tipoMaterial: "LENÇOL", tipoMedida: "60x80 Cm", status: "retornado", dataEnvio: "2026-03-28T09:00:00Z", dataRetorno: "2026-03-31T15:00:00Z", motoristaEnvio: "José", motoristaRetorno: "Carlos", qtdsSaidaKg: 80, qtdsRetornoKg: 76, qtdsPacotesRetorno: 95, totalDifKg: 4, residuos: 4, assCostEntrega: "signed", assMotEntrega: "signed", assCostDevolucao: "signed", assMotDevolucao: "signed", galpaoEnvio: "Vicente", observacao: "" },
  { id: "c3", coletaId: "4", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", costureira: "Joana Costa", tipoMaterial: "ESTOPA", tipoMedida: "20x20 Cm", status: "retornado", dataEnvio: "2026-03-23T11:00:00Z", dataRetorno: "2026-03-26T16:00:00Z", motoristaEnvio: "Carlos", motoristaRetorno: "José", qtdsSaidaKg: 120, qtdsRetornoKg: 115, qtdsPacotesRetorno: 575, totalDifKg: 5, residuos: 5, assCostEntrega: "signed", assMotEntrega: "signed", assCostDevolucao: "signed", assMotDevolucao: "signed", galpaoEnvio: "Vicente", observacao: "Lote grande" },
  { id: "c4", coletaId: "2", coletaNumero: 247, fornecedor: "SUL AMERICANA", costureira: "Lucia Oliveira", tipoMaterial: "GSY", tipoMedida: "40x40 Cm", status: "enviado", dataEnvio: "2026-04-02T08:00:00Z", dataRetorno: null, motoristaEnvio: "Carlos", motoristaRetorno: "", qtdsSaidaKg: 45, qtdsRetornoKg: 0, qtdsPacotesRetorno: 0, totalDifKg: 0, residuos: 0, assCostEntrega: "signed", assMotEntrega: null, assCostDevolucao: null, assMotDevolucao: null, galpaoEnvio: "Vicente", observacao: "" },
];

let estoqueList: any[] = [
  { id: "e1", coletaNumero: 246, fornecedor: "HOTEL MAJESTIC", descricaoProduto: "TOALHA Branco 30x30 Cm Corte-Reto", tipoMaterial: "TOALHA", cor: "Branco", medida: "30x30 Cm", acabamento: "Corte-Reto", kilo: 120, unidade: 240, pesoMedioPct: 0.5, unidadeMedida: "Pacote/Kilo", qtdeReservadaPacote: 50, galpao: "Vicente", status: "Disponivel", statusMaterial: "", data: "2026-03-30T10:00:00Z" },
  { id: "e2", coletaNumero: 246, fornecedor: "HOTEL MAJESTIC", descricaoProduto: "ENXOVAL Branco 50x50 Cm Overlock", tipoMaterial: "ENXOVAL", cor: "Branco", medida: "50x50 Cm", acabamento: "Overlock", kilo: 80, unidade: 100, pesoMedioPct: 0.8, unidadeMedida: "Pacote/Kilo", qtdeReservadaPacote: 0, galpao: "Vicente", status: "Disponivel", statusMaterial: "", data: "2026-03-30T11:00:00Z" },
  { id: "e3", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", descricaoProduto: "ESTOPA Escuro", tipoMaterial: "ESTOPA", cor: "Escuro", medida: "", acabamento: "Sem Acabamento", kilo: 400, unidade: 0, pesoMedioPct: 0, unidadeMedida: "Kilo", qtdeReservadaPacote: 0, galpao: "Vicente", status: "Disponivel", statusMaterial: "", data: "2026-03-25T09:00:00Z" },
  { id: "e4", coletaNumero: 245, fornecedor: "VLI LOGÍSTICA", descricaoProduto: "GRU Variado", tipoMaterial: "GRU", cor: "Variado", medida: "", acabamento: "Corte-Reto", kilo: 350, unidade: 0, pesoMedioPct: 0, unidadeMedida: "Kilo", qtdeReservadaPacote: 0, galpao: "Vicente", status: "Pendente", statusMaterial: "", data: "2026-03-25T10:00:00Z" },
  { id: "e5", coletaNumero: 247, fornecedor: "SUL AMERICANA", descricaoProduto: "MALHA Azul 40x40 Cm Zig-Zag", tipoMaterial: "MALHA", cor: "Azul", medida: "40x40 Cm", acabamento: "Zig-Zag", kilo: 95, unidade: 237, pesoMedioPct: 0.4, unidadeMedida: "Pacote/Kilo", qtdeReservadaPacote: 100, galpao: "Vicente", status: "Reservado", statusMaterial: "", data: "2026-04-02T12:00:00Z" },
];

let clientesList: any[] = [
  { id: "cl1", nome: "INDÚSTRIA MEGA STEEL", cnpj: "11.111.111/0001-01", contato: "(11) 3000-1000", email: "compras@megasteel.com" },
  { id: "cl2", nome: "OFICINA RÁPIDA AUTO", cnpj: "22.222.222/0001-02", contato: "(13) 3000-2000", email: "contato@rapidaauto.com" },
  { id: "cl3", nome: "LIMPEZA TOTAL LTDA", cnpj: "33.333.333/0001-03", contato: "(11) 3000-3000", email: "pedidos@limpezatotal.com" },
  { id: "cl4", nome: "PETROBRÁS - CUBATÃO", cnpj: "44.444.444/0001-04", contato: "(13) 3000-4000", email: "suprimentos@petrobras.com" },
  { id: "cl5", nome: "PORTO DE SANTOS SA", cnpj: "55.555.555/0001-05", contato: "(13) 3000-5000", email: "compras@portosantos.com" },
];

let expedicoesList: any[] = [
  { id: "ex1", clienteId: "cl1", nomeFantasia: "INDÚSTRIA MEGA STEEL", razaoSocial: "Mega Steel Ind. Ltda", cnpj: "11.111.111/0001-01", contato: "(11) 3000-1000", email: "compras@megasteel.com", endereco: "Rua Industrial, 500 - Cubatão/SP", descricaoProduto: "TOALHA Branco 30x30 Cm", tipoMaterial: "TOALHA", cor: "Branco", medida: "30x30 Cm", kilo: 50, kiloSolicitada: 50, unidade: 100, qtdePedido: 100, unidadeMedida: "Pacote / Kilo", statusPedido: "", statusEntrega: "aguardando_financeiro", statusFinanceiro: "pendente_aprovacao", statusNota: "pendente_emissao", statusMaterial: "", galpao: "Vicente", rota: "Rota Fixa", prioridade: "Normal", periodicidade: "Quinzenal", notaFiscal: "", observacaoEscritorio: "Cliente recorrente", observacaoGalpao: "", createdAt: "2026-04-04T09:00:00Z" },
  { id: "ex2", clienteId: "cl4", nomeFantasia: "PETROBRÁS - CUBATÃO", razaoSocial: "Petróleo Brasileiro SA", cnpj: "44.444.444/0001-04", contato: "(13) 3000-4000", email: "suprimentos@petrobras.com", endereco: "Rod. Cônego Domênico, 1000 - Cubatão/SP", descricaoProduto: "ESTOPA Escuro", tipoMaterial: "ESTOPA", cor: "Escuro", medida: "", kilo: 200, kiloSolicitada: 200, unidade: 0, qtdePedido: 0, unidadeMedida: "Kilo", statusPedido: "", statusEntrega: "aguardando_nf", statusFinanceiro: "aprovado", statusNota: "pendente_emissao", statusMaterial: "", galpao: "Vicente", rota: "Spot", prioridade: "Urgente", periodicidade: "", notaFiscal: "", observacaoEscritorio: "Pedido urgente - Petrobrás", observacaoGalpao: "Material já separado no galpão", createdAt: "2026-04-03T14:00:00Z" },
  { id: "ex3", clienteId: "cl2", nomeFantasia: "OFICINA RÁPIDA AUTO", razaoSocial: "Rápida Auto Serviços Ltda", cnpj: "22.222.222/0001-02", contato: "(13) 3000-2000", email: "contato@rapidaauto.com", endereco: "Av. Ana Costa, 300 - Santos/SP", descricaoProduto: "MALHA Azul 40x40 Cm", tipoMaterial: "MALHA", cor: "Azul", medida: "40x40 Cm", kilo: 30, kiloSolicitada: 30, unidade: 75, qtdePedido: 75, unidadeMedida: "Pacote / Kilo", statusPedido: "", statusEntrega: "pronto_entrega", statusFinanceiro: "aprovado", statusNota: "emitida", statusMaterial: "", galpao: "Vicente", rota: "Rota Fixa", prioridade: "Normal", periodicidade: "Semanal", notaFiscal: "NF-2026-0078", observacaoEscritorio: "", observacaoGalpao: "", createdAt: "2026-04-01T10:00:00Z" },
  { id: "ex4", clienteId: "cl5", nomeFantasia: "PORTO DE SANTOS SA", razaoSocial: "Santos Port Authority SA", cnpj: "55.555.555/0001-05", contato: "(13) 3000-5000", email: "compras@portosantos.com", endereco: "Av. Portuária, 1 - Santos/SP", descricaoProduto: "GRU Variado", tipoMaterial: "GRU", cor: "Variado", medida: "", kilo: 150, kiloSolicitada: 150, unidade: 0, qtdePedido: 0, unidadeMedida: "Kilo", statusPedido: "", statusEntrega: "entregue", statusFinanceiro: "aprovado", statusNota: "emitida", statusMaterial: "", galpao: "Vicente", rota: "Spot", prioridade: "Normal", periodicidade: "", notaFiscal: "NF-2026-0065", observacaoEscritorio: "", observacaoGalpao: "Entregue em 02/04", createdAt: "2026-03-28T08:00:00Z" },
  { id: "ex5", clienteId: "cl3", nomeFantasia: "LIMPEZA TOTAL LTDA", razaoSocial: "Limpeza Total Serviços Ltda", cnpj: "33.333.333/0001-03", contato: "(11) 3000-3000", email: "pedidos@limpezatotal.com", endereco: "Rua Limpeza, 100 - São Vicente/SP", descricaoProduto: "ENXOVAL Branco 50x50 Cm", tipoMaterial: "ENXOVAL", cor: "Branco", medida: "50x50 Cm", kilo: 40, kiloSolicitada: 40, unidade: 50, qtdePedido: 50, unidadeMedida: "Pacote / Kilo", statusPedido: "", statusEntrega: "pendente", statusFinanceiro: "pendente_aprovacao", statusNota: "pendente_emissao", statusMaterial: "", galpao: "Vicente", rota: "Retire Aqui", prioridade: "Baixa", periodicidade: "Mensal", notaFiscal: "", observacaoEscritorio: "Cliente retira no galpão", observacaoGalpao: "", createdAt: "2026-04-05T07:00:00Z" },
];

let nextColetaId = 6;
let nextColetaNumero = 250;
let nextSeparacaoId = 12;
let nextProducaoId = 8;
let nextRepanolId = 4;
let nextCostureiraId = 5;
let nextEstoqueId = 6;
let nextExpedicaoId = 6;

export function registerRoutes(app: Express) {
  // ==================== AUTH ====================
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email && password) {
      res.json({
        user: { id: "1", username: email, nome: "Admin", perfil: "administrador" },
      });
    } else {
      res.status(401).json({ message: "Credenciais inválidas" });
    }
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // ==================== COLETAS ====================
  app.get("/api/coletas", (_req: Request, res: Response) => {
    res.json(coletas);
  });

  app.get("/api/coletas/:id", (req: Request, res: Response) => {
    const coleta = coletas.find((c) => c.id === req.params.id);
    if (!coleta) return res.status(404).json({ message: "Coleta não encontrada" });
    res.json(coleta);
  });

  app.post("/api/coletas", (req: Request, res: Response) => {
    const fornecedor = fornecedores.find((f) => f.id === req.body.fornecedorId);
    const nova = {
      id: String(nextColetaId++),
      numero: nextColetaNumero++,
      fornecedorId: req.body.fornecedorId,
      nomeFantasia: fornecedor?.nome || req.body.nomeFantasia || "",
      razaoSocial: fornecedor?.razaoSocial || "",
      cnpjFornecedor: fornecedor?.cnpj || "",
      notaFiscal: req.body.notaFiscal || "",
      pesoTotalNF: Number(req.body.pesoTotalNF) || 0,
      pesoTotalAtual: Number(req.body.pesoTotalNF) || 0,
      dataPedido: new Date().toISOString(),
      dataChegada: req.body.dataChegada || null,
      galpao: req.body.galpao || "Vicente",
      status: req.body.dataChegada ? "recebido" : "pendente",
      statusServico: req.body.dataChegada ? "Em andamento" : "Aguardando",
      observacao: req.body.observacao || "",
      createdAt: new Date().toISOString(),
    };
    coletas.unshift(nova);
    res.status(201).json(nova);
  });

  app.put("/api/coletas/:id", (req: Request, res: Response) => {
    const idx = coletas.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Coleta não encontrada" });
    coletas[idx] = { ...coletas[idx], ...req.body };
    res.json(coletas[idx]);
  });

  app.delete("/api/coletas/:id", (req: Request, res: Response) => {
    coletas = coletas.filter((c) => c.id !== req.params.id);
    res.json({ ok: true });
  });

  // ==================== FORNECEDORES ====================
  app.get("/api/fornecedores", (_req: Request, res: Response) => {
    res.json(fornecedores);
  });

  // ==================== SEPARACOES ====================
  app.get("/api/separacoes", (_req: Request, res: Response) => {
    res.json(separacoes);
  });

  app.get("/api/separacoes/coleta/:coletaId", (req: Request, res: Response) => {
    const filtered = separacoes.filter((s) => s.coletaId === req.params.coletaId);
    res.json(filtered);
  });

  app.post("/api/separacoes", (req: Request, res: Response) => {
    const coleta = coletas.find((c) => c.id === req.body.coletaId);
    if (!coleta) return res.status(404).json({ message: "Coleta não encontrada" });

    // Update coleta status
    if (coleta.status === "recebido") {
      coleta.status = "em_separacao";
    }

    const nova = {
      id: `s${nextSeparacaoId++}`,
      coletaId: req.body.coletaId,
      coletaNumero: coleta.numero,
      fornecedor: coleta.nomeFantasia,
      tipoMaterial: req.body.tipoMaterial,
      cor: req.body.cor || "",
      peso: Number(req.body.peso) || 0,
      destino: req.body.destino || "producao",
      colaborador: req.body.colaborador || "",
      data: new Date().toISOString(),
    };
    separacoes.push(nova);
    res.status(201).json(nova);
  });

  // ==================== COSTUREIRA ====================
  app.get("/api/costureira", (_req: Request, res: Response) => {
    res.json(costureiraList);
  });

  app.post("/api/costureira", (req: Request, res: Response) => {
    const coleta = coletas.find((c) => c.id === req.body.coletaId);
    if (!coleta) return res.status(404).json({ message: "Coleta não encontrada" });

    const novo = {
      id: `c${nextCostureiraId++}`,
      coletaId: req.body.coletaId,
      coletaNumero: coleta.numero,
      fornecedor: coleta.nomeFantasia,
      costureira: req.body.costureira,
      tipoMaterial: req.body.tipoMaterial || "",
      tipoMedida: req.body.tipoMedida || "",
      status: "enviado",
      dataEnvio: new Date().toISOString(),
      dataRetorno: null,
      motoristaEnvio: req.body.motoristaEnvio || "",
      motoristaRetorno: "",
      qtdsSaidaKg: Number(req.body.qtdsSaidaKg) || 0,
      qtdsRetornoKg: 0,
      qtdsPacotesRetorno: 0,
      totalDifKg: 0,
      residuos: 0,
      assCostEntrega: null,
      assMotEntrega: null,
      assCostDevolucao: null,
      assMotDevolucao: null,
      galpaoEnvio: req.body.galpaoEnvio || "Vicente",
      observacao: req.body.observacao || "",
    };
    costureiraList.push(novo);
    res.status(201).json(novo);
  });

  app.put("/api/costureira/:id/retorno", (req: Request, res: Response) => {
    const idx = costureiraList.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Envio não encontrado" });

    costureiraList[idx] = {
      ...costureiraList[idx],
      status: "retornado",
      dataRetorno: new Date().toISOString(),
      motoristaRetorno: req.body.motoristaRetorno || "",
      qtdsRetornoKg: Number(req.body.qtdsRetornoKg) || 0,
      qtdsPacotesRetorno: Number(req.body.qtdsPacotesRetorno) || 0,
      totalDifKg: Number(req.body.totalDifKg) || 0,
      residuos: Number(req.body.residuos) || 0,
      assCostDevolucao: "signed",
      assMotDevolucao: "signed",
    };
    res.json(costureiraList[idx]);
  });

  // ==================== REPANOL ====================
  app.get("/api/repanol", (_req: Request, res: Response) => {
    res.json(repanolList);
  });

  app.post("/api/repanol", (req: Request, res: Response) => {
    const coleta = coletas.find((c) => c.id === req.body.coletaId);
    if (!coleta) return res.status(404).json({ message: "Coleta não encontrada" });

    const novo = {
      id: `r${nextRepanolId++}`,
      coletaId: req.body.coletaId,
      coletaNumero: coleta.numero,
      fornecedor: coleta.nomeFantasia,
      empresaFornecedor: req.body.empresaFornecedor || "",
      tipoMaterial: req.body.tipoMaterial || "",
      dataEnvio: new Date().toISOString(),
      dataRetorno: null,
      pesoManchadoEnvio: Number(req.body.pesoManchadoEnvio) || 0,
      pesoMolhadoEnvio: Number(req.body.pesoMolhadoEnvio) || 0,
      pesoTingidoEnvio: Number(req.body.pesoTingidoEnvio) || 0,
      pesoManchadoRetorno: 0,
      pesoMolhadoRetorno: 0,
      pesoTingidoRetorno: 0,
      repanolResiduo: 0,
      status: "enviado",
    };
    repanolList.push(novo);
    res.status(201).json(novo);
  });

  app.put("/api/repanol/:id/retorno", (req: Request, res: Response) => {
    const idx = repanolList.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Repanol não encontrado" });

    repanolList[idx] = {
      ...repanolList[idx],
      dataRetorno: new Date().toISOString(),
      pesoManchadoRetorno: Number(req.body.pesoManchadoRetorno) || 0,
      pesoMolhadoRetorno: Number(req.body.pesoMolhadoRetorno) || 0,
      pesoTingidoRetorno: Number(req.body.pesoTingidoRetorno) || 0,
      repanolResiduo: Number(req.body.repanolResiduo) || 0,
      status: "retornado",
    };
    res.json(repanolList[idx]);
  });

  // ==================== PRODUCOES ====================
  app.get("/api/producoes", (_req: Request, res: Response) => {
    res.json(producoes);
  });

  app.post("/api/producoes", (req: Request, res: Response) => {
    const coleta = coletas.find((c) => c.id === req.body.coletaId);
    if (!coleta) return res.status(404).json({ message: "Coleta não encontrada" });

    if (coleta.status === "em_separacao" || coleta.status === "separado") {
      coleta.status = "em_producao";
    }

    const nova = {
      id: `p${nextProducaoId++}`,
      coletaId: req.body.coletaId,
      coletaNumero: coleta.numero,
      fornecedor: coleta.nomeFantasia,
      sala: req.body.sala,
      tipoMaterial: req.body.tipoMaterial,
      cor: req.body.cor || "",
      acabamento: req.body.acabamento || "",
      medida: req.body.medida || "",
      kilo: Number(req.body.kilo) || 0,
      pesoMedio: Number(req.body.pesoMedio) || 0,
      qtdePacote: Number(req.body.qtdePacote) || 0,
      unidadeSaida: req.body.unidadeSaida || "unidade",
      statusEstoque: "pendente",
      operador: req.body.operador || "",
      dataCriacao: new Date().toISOString(),
    };
    producoes.push(nova);
    res.status(201).json(nova);
  });

  // ==================== CLIENTES ====================
  app.get("/api/clientes", (_req: Request, res: Response) => {
    res.json(clientesList);
  });

  // ==================== EXPEDICOES ====================
  app.get("/api/expedicoes", (_req: Request, res: Response) => {
    res.json(expedicoesList);
  });

  app.post("/api/expedicoes", (req: Request, res: Response) => {
    const cliente = clientesList.find((c) => c.id === req.body.clienteId);
    const estoqueItem = estoqueList.find((e) => e.id === req.body.estoqueId);
    if (!cliente || !estoqueItem) return res.status(404).json({ message: "Cliente ou estoque não encontrado" });

    const nova = {
      id: `ex${nextExpedicaoId++}`,
      clienteId: cliente.id,
      nomeFantasia: cliente.nome,
      razaoSocial: cliente.nome,
      cnpj: cliente.cnpj,
      contato: cliente.contato,
      email: cliente.email,
      endereco: "",
      descricaoProduto: estoqueItem.descricaoProduto,
      tipoMaterial: estoqueItem.tipoMaterial,
      cor: estoqueItem.cor,
      medida: estoqueItem.medida,
      kilo: estoqueItem.kilo,
      kiloSolicitada: Number(req.body.qtdeSolicitada) || estoqueItem.kilo,
      unidade: estoqueItem.unidade,
      qtdePedido: Number(req.body.qtdeSolicitada) || estoqueItem.unidade,
      unidadeMedida: estoqueItem.unidadeMedida,
      statusPedido: "",
      statusEntrega: "aguardando_financeiro",
      statusFinanceiro: "pendente_aprovacao",
      statusNota: "pendente_emissao",
      statusMaterial: "",
      galpao: "Vicente",
      rota: req.body.rota || "",
      prioridade: req.body.prioridade || "Normal",
      periodicidade: "",
      notaFiscal: "",
      observacaoEscritorio: req.body.observacaoEscritorio || "",
      observacaoGalpao: "",
      createdAt: new Date().toISOString(),
    };
    expedicoesList.push(nova);
    res.status(201).json(nova);
  });

  // Cadeia de aprovação
  app.put("/api/expedicoes/:id/aprovar-financeiro", (req: Request, res: Response) => {
    const idx = expedicoesList.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Não encontrado" });
    expedicoesList[idx].statusFinanceiro = "aprovado";
    expedicoesList[idx].statusEntrega = "aguardando_nf";
    res.json(expedicoesList[idx]);
  });

  app.put("/api/expedicoes/:id/emitir-nf", (req: Request, res: Response) => {
    const idx = expedicoesList.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Não encontrado" });
    expedicoesList[idx].statusNota = "emitida";
    expedicoesList[idx].notaFiscal = `NF-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    expedicoesList[idx].statusEntrega = "pronto_entrega";
    res.json(expedicoesList[idx]);
  });

  app.put("/api/expedicoes/:id/entregar", (req: Request, res: Response) => {
    const idx = expedicoesList.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Não encontrado" });
    expedicoesList[idx].statusEntrega = "entregue";
    res.json(expedicoesList[idx]);
  });

  // ==================== ESTOQUE ====================
  app.get("/api/estoque", (_req: Request, res: Response) => {
    res.json(estoqueList);
  });

  app.post("/api/estoque", (req: Request, res: Response) => {
    const prod = producoes.find((p) => p.id === req.body.producaoId);
    if (!prod) return res.status(404).json({ message: "Produção não encontrada" });

    // Mark production as in estoque
    prod.statusEstoque = "em_estoque";

    const novo = {
      id: `e${nextEstoqueId++}`,
      coletaNumero: prod.coletaNumero,
      fornecedor: prod.fornecedor,
      descricaoProduto: req.body.descricaoProduto || `${prod.tipoMaterial} ${prod.cor}`,
      tipoMaterial: prod.tipoMaterial,
      cor: prod.cor,
      medida: prod.medida,
      acabamento: prod.acabamento,
      kilo: prod.kilo,
      unidade: prod.qtdePacote || 0,
      pesoMedioPct: prod.pesoMedio || 0,
      unidadeMedida: prod.unidadeSaida === "kilo" ? "Kilo" : "Pacote/Kilo",
      qtdeReservadaPacote: 0,
      galpao: req.body.galpao || "Vicente",
      status: "Disponivel",
      statusMaterial: "",
      data: new Date().toISOString(),
      observacao: req.body.observacao || "",
    };
    estoqueList.push(novo);
    res.status(201).json(novo);
  });

  // ==================== COLABORADORES (RHiD + fallback local) ====================

  // Fallback local - usado quando API RHiD não está configurada/disponível
  let colaboradoresLocal: any[] = [
    { id: 1, cpf: "11111111111", name: "José da Silva", registration: "M001", departamento: "Motorista", status: 1, fonte: "local" },
    { id: 2, cpf: "22222222222", name: "Carlos Santos", registration: "M002", departamento: "Motorista", status: 1, fonte: "local" },
    { id: 3, cpf: "33333333333", name: "Maria Silva", registration: "C001", departamento: "Costura", status: 1, fonte: "local" },
    { id: 4, cpf: "44444444444", name: "Lucas Oliveira", registration: "G001", departamento: "Galpão", status: 1, fonte: "local" },
    { id: 5, cpf: "55555555555", name: "Ana Santos", registration: "C002", departamento: "Costura", status: 1, fonte: "local" },
    { id: 6, cpf: "66666666666", name: "Rafael Lima", registration: "G002", departamento: "Galpão", status: 1, fonte: "local" },
    { id: 7, cpf: "77777777777", name: "Marcos Souza", registration: "G003", departamento: "Galpão", status: 1, fonte: "local" },
    { id: 8, cpf: "88888888888", name: "Pedro Costa", registration: "G004", departamento: "Galpão", status: 1, fonte: "local" },
  ];

  // GET colaboradores - tenta RHiD primeiro, fallback local
  app.get("/api/colaboradores", async (_req: Request, res: Response) => {
    if (isRHiDConfigured()) {
      try {
        const [pessoas, departamentos] = await Promise.all([
          fetchPessoas(),
          fetchDepartamentos(),
        ]);

        const deptMap = new Map(departamentos.map((d) => [d.id, d.name]));

        const colaboradores = pessoas.map((p) => ({
          id: p.id,
          cpf: String(p.cpf).padStart(11, "0"),
          name: p.name,
          registration: p.registration,
          departamento: deptMap.get(p.idDepartment) || "",
          status: p.status,
          fonte: "rhid",
        }));

        return res.json({ fonte: "rhid", colaboradores });
      } catch (error) {
        console.error("RHiD falhou, usando fallback local:", error);
      }
    }

    // Fallback local
    res.json({ fonte: "local", colaboradores: colaboradoresLocal });
  });

  // GET colaboradores filtrados por departamento (motoristas, galpão, etc.)
  app.get("/api/colaboradores/departamento/:depto", async (req: Request, res: Response) => {
    const depto = req.params.depto.toLowerCase();

    if (isRHiDConfigured()) {
      try {
        const [pessoas, departamentos] = await Promise.all([
          fetchPessoas(),
          fetchDepartamentos(),
        ]);

        const deptIds = departamentos
          .filter((d) => d.name.toLowerCase().includes(depto))
          .map((d) => d.id);

        const filtered = pessoas
          .filter((p) => deptIds.includes(p.idDepartment))
          .map((p) => ({
            id: p.id,
            cpf: String(p.cpf).padStart(11, "0"),
            name: p.name,
            registration: p.registration,
            fonte: "rhid",
          }));

        return res.json(filtered);
      } catch {
        // fallback
      }
    }

    const filtered = colaboradoresLocal.filter((c) =>
      c.departamento.toLowerCase().includes(depto)
    );
    res.json(filtered);
  });

  // POST cadastro manual (fallback)
  app.post("/api/colaboradores", (req: Request, res: Response) => {
    const novo = {
      id: Date.now(),
      cpf: req.body.cpf || "",
      name: req.body.name || "",
      registration: req.body.registration || "",
      departamento: req.body.departamento || "",
      status: 1,
      fonte: "local",
    };
    colaboradoresLocal.push(novo);
    res.status(201).json(novo);
  });

  // GET status da integração RHiD
  app.get("/api/colaboradores/status", (_req: Request, res: Response) => {
    res.json({
      rhidConfigurado: isRHiDConfigured(),
      rhidUrl: process.env.RHID_API_URL || "https://www.rhid.com.br/v2/swagger.svc",
      totalLocal: colaboradoresLocal.length,
    });
  });

  // ==================== HEALTH ====================
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
