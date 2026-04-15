import type { Express, Request, Response } from "express";
import {
  syncAll, syncOne, getSyncStatus, startPolling, stopPolling,
} from "./bubble-sync";
import {
  listUsers, getUser, createUser, updateUser, deactivateUser,
  reactivateUser, changePassword, verifyPassword, getAdminWhatsappNumbers,
} from "./repos/user-management";
import {
  listPermissions, getGrantedResources, grantPermission,
  revokePermission, setPermissions,
} from "./repos/permissions";
import {
  createAccessRequest, listPendingRequests, listAllRequests,
  approveRequest, denyRequest,
} from "./repos/access-requests";
import { logAudit, listAuditLogs } from "./repos/audit-log";
import { notifyAdmins, sendWhatsApp } from "./whatsapp";
import { supabase } from "./supabase";
import {
  fetchPessoas, fetchDepartamentos, isRHiDConfigured,
  criarPessoaRHiD, atualizarPessoaRHiD, deletarPessoaRHiD,
  criarDepartamentoRHiD,
} from "./rhid";
import {
  listColetas as dbListColetas,
  getColeta as dbGetColeta,
  createColeta as dbCreateColeta,
  updateColeta as dbUpdateColeta,
  deleteColeta as dbDeleteColeta,
} from "./repos/coletas";
import {
  listFornecedores as dbListFornecedores,
  createFornecedor as dbCreateFornecedor,
  updateFornecedor as dbUpdateFornecedor,
  deleteFornecedor as dbDeleteFornecedor,
} from "./repos/fornecedores";
import {
  listClientes as dbListClientes,
  getCliente as dbGetCliente,
  createCliente as dbCreateCliente,
  updateCliente as dbUpdateCliente,
  deleteCliente as dbDeleteCliente,
} from "./repos/clientes";
import {
  listProdutos as dbListProdutos,
  getProduto as dbGetProduto,
  createProduto as dbCreateProduto,
  updateProduto as dbUpdateProduto,
  deleteProduto as dbDeleteProduto,
} from "./repos/produtos";
import {
  listMotoristas as dbListMotoristas,
  getMotorista as dbGetMotorista,
  createMotorista as dbCreateMotorista,
  updateMotorista as dbUpdateMotorista,
  deleteMotorista as dbDeleteMotorista,
} from "./repos/motoristas";
import {
  listEstoque as dbListEstoque,
  getEstoque as dbGetEstoque,
  createEstoque as dbCreateEstoque,
  updateEstoque as dbUpdateEstoque,
  deleteEstoque as dbDeleteEstoque,
} from "./repos/estoque";
import {
  listExpedicoes as dbListExpedicoes,
  getExpedicao as dbGetExpedicao,
  createExpedicao as dbCreateExpedicao,
  updateExpedicao as dbUpdateExpedicao,
  deleteExpedicao as dbDeleteExpedicao,
  getDisponibilidade as dbGetDisponibilidade,
} from "./repos/expedicoes";

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

let producaoDiariaList: any[] = [
  { id: "pd1", data: "2026-04-05", nomeDupla: "GLINS/KAYAN", sala: "O4", material: "BR CASAL", horarioInicio: "08:40", horarioFim: "10:55", status: "completa", assinatura: "Kayan", encarregado: "Nodin", observacao: "", createdAt: "2026-04-05T08:40:00Z" },
  { id: "pd2", data: "2026-04-05", nomeDupla: "GLINS/KAYAN", sala: "O4", material: "CASAL RVA", horarioInicio: "11:10", horarioFim: "12:30", status: "completa", assinatura: "Kayan", encarregado: "Nodin", observacao: "", createdAt: "2026-04-05T11:10:00Z" },
  { id: "pd3", data: "2026-04-05", nomeDupla: "GLINS/KAYAN", sala: "O4", material: "C2 RVA", horarioInicio: "13:40", horarioFim: "16:00", status: "completa", assinatura: "Kayan", encarregado: "Nodin", observacao: "", createdAt: "2026-04-05T13:40:00Z" },
  { id: "pd4", data: "2026-04-05", nomeDupla: "EDISON/LUI", sala: "O5", material: "KING", horarioInicio: "08:30", horarioFim: "11:00", status: "completa", assinatura: "Edison", encarregado: "Nodin", observacao: "", createdAt: "2026-04-05T08:30:00Z" },
  { id: "pd5", data: "2026-04-05", nomeDupla: "EDISON/LUI", sala: "O5", material: "MICROFIBRA", horarioInicio: "11:15", horarioFim: null, status: "incompleta", assinatura: "Edison", encarregado: "Nodin", observacao: "Material insuficiente", createdAt: "2026-04-05T11:15:00Z" },
  { id: "pd6", data: "2026-04-05", nomeDupla: "EDISON/LUI", sala: "COBERTÓRIO", material: "LAMBRELA", horarioInicio: "13:30", horarioFim: "15:45", status: "completa", assinatura: "Edison", encarregado: "Nodin", observacao: "", createdAt: "2026-04-05T13:30:00Z" },
  { id: "pd7", data: "2026-04-04", nomeDupla: "MARCOS/ANA", sala: "O3", material: "C2 LISA", horarioInicio: "08:00", horarioFim: "10:30", status: "completa", assinatura: "Marcos", encarregado: "Nodin", observacao: "", createdAt: "2026-04-04T08:00:00Z" },
  { id: "pd8", data: "2026-04-04", nomeDupla: "MARCOS/ANA", sala: "O3", material: "CASAL EUA", horarioInicio: "10:45", horarioFim: "12:15", status: "completa", assinatura: "Marcos", encarregado: "Nodin", observacao: "", createdAt: "2026-04-04T10:45:00Z" },
];

let nextProducaoDiariaId = 9;
let nextColetaId = 6;
let nextColetaNumero = 250;
let nextSeparacaoId = 12;
let nextProducaoId = 8;
let nextRepanolId = 4;
let nextCostureiraId = 5;
let nextEstoqueId = 6;
let nextExpedicaoId = 6;

/** Sessão em memória (dev) — substituir por cookie/session + DB. */
type AuthSessionUser = { id: string; username: string; nome: string; perfil: string };

const PERFIL_LOGIN_VALUES = new Set([
  "administrador",
  "super_admin",
  "galpao",
  "emissao_nf",
  "financeiro",
  "expedicao",
  "rh",
  "producao",
  "separacao",
  "motorista",
  "costureira",
  "michele",
]);

const DEFAULT_AUTH: AuthSessionUser = {
  id: "1",
  username: "admin",
  nome: "Admin",
  perfil: "administrador",
};

let authSession: AuthSessionUser = { ...DEFAULT_AUTH };

function resolvePerfilFromLogin(email: string, perfilOverride: unknown): string {
  if (typeof perfilOverride === "string") {
    const o = perfilOverride.trim().toLowerCase();
    if (PERFIL_LOGIN_VALUES.has(o)) return o;
  }
  const local = (email.split("@")[0] || "").trim().toLowerCase();
  if (local === "admin") return "administrador";
  if (PERFIL_LOGIN_VALUES.has(local)) return local;
  return "administrador";
}

export function registerRoutes(app: Express) {
  // ==================== AUTH ====================
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    const emailStr = String(email).trim().toLowerCase();

    try {
      // Buscar usuário no Supabase
      const { data: user } = await supabase
        .from("users")
        .select("id, username, nome, password, perfil, acesso")
        .or(`username.eq.${emailStr},email.eq.${emailStr}`)
        .limit(1)
        .single();

      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }
      if (!user.acesso) {
        return res.status(403).json({ message: "Acesso desativado. Contate o administrador." });
      }
      if (user.password !== password) {
        return res.status(401).json({ message: "Senha incorreta" });
      }

      authSession = {
        id: user.id,
        username: user.username,
        nome: user.nome,
        perfil: user.perfil,
      };

      await logAudit({ userId: user.id, userName: user.nome, action: "login" });
      res.json({ user: authSession });
    } catch {
      // Fallback: modo dev (aceita qualquer credencial)
      const perfil = resolvePerfilFromLogin(emailStr, req.body.perfil);
      const rawLocal = emailStr.split("@")[0] || "utilizador";
      const nome = rawLocal.charAt(0).toUpperCase() + rawLocal.slice(1).toLowerCase();
      authSession = { id: "dev-1", username: emailStr, nome, perfil };
      res.json({ user: authSession });
    }
  });

  // ── Registro (auto-cadastro, precisa aprovação do admin) ──
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { nome, email, password, cargo } = req.body;
    if (!nome || !email || !password) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
    }

    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .or(`username.eq.${email},email.eq.${email}`)
        .limit(1)
        .single();

      if (existing) {
        return res.status(409).json({ message: "Este email já está cadastrado" });
      }

      // Criar usuário inativo (precisa aprovação)
      const { data: user, error } = await supabase
        .from("users")
        .insert({
          username: email.trim().toLowerCase(),
          password,
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          cargo: cargo || null,
          perfil: "galpao",
          acesso: false, // Inativo até admin aprovar
        })
        .select("id, nome, email")
        .single();

      if (error) throw error;

      await logAudit({ userId: user.id, userName: user.nome, action: "user_create", details: { selfRegistration: true } });

      // Notificar admins
      const adminPhones = await getAdminWhatsappNumbers();
      if (adminPhones.length > 0) {
        const msg = `👤 *Novo Cadastro*\n\n${nome} (${email}) se cadastrou e aguarda aprovação.\n\nAcesse Administração para liberar.`;
        notifyAdmins(adminPhones, msg).catch(() => {});
      }

      res.status(201).json({ message: "Cadastro realizado! Aguarde aprovação do administrador.", user });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao cadastrar" });
    }
  });

  // ── Definir senha via token (link de convite) ──
  app.post("/api/auth/set-password", async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token e senha são obrigatórios" });
    }

    try {
      // Token = base64(userId:timestamp)
      const decoded = Buffer.from(token, "base64").toString();
      const [userId] = decoded.split(":");

      if (!userId) return res.status(400).json({ message: "Token inválido" });

      const { data: user } = await supabase
        .from("users")
        .select("id, nome")
        .eq("id", userId)
        .single();

      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

      await changePassword(userId, password);
      await logAudit({ userId, userName: user.nome, action: "password_change", details: { viaInviteLink: true } });

      res.json({ message: "Senha definida com sucesso! Faça login." });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Gerar link de convite (admin envia para o user) ──
  app.post("/api/admin/users/:id/invite-link", async (req: Request, res: Response) => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("id, nome, email")
        .eq("id", req.params.id)
        .single();

      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

      // Gerar token simples (base64 do userId + timestamp)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
      const link = `${req.protocol}://${req.get("host")}/definir-senha?token=${token}`;

      await logAudit({ action: "password_reset", resource: user.id, details: { inviteLinkGenerated: true, email: user.email } });

      res.json({ link, token, email: user.email, nome: user.nome });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    authSession = { ...DEFAULT_AUTH };
    res.json({ ok: true });
  });

  // Retorna utilizador da sessão + permissões
  app.get("/api/auth/me", async (_req: Request, res: Response) => {
    try {
      const perms = authSession.id ? await getGrantedResources(authSession.id) : [];
      res.json({ ...authSession, permissions: perms });
    } catch {
      res.json({ ...authSession, permissions: [] });
    }
  });

  // ==================== COLETAS (Supabase) ====================
  app.get("/api/coletas", async (_req: Request, res: Response) => {
    try {
      res.json(await dbListColetas());
    } catch (err) {
      console.error("[GET /api/coletas]", err);
      res.status(500).json({ message: "Erro ao listar coletas" });
    }
  });

  app.get("/api/coletas/:id", async (req: Request, res: Response) => {
    try {
      const coleta = await dbGetColeta(req.params.id);
      if (!coleta) return res.status(404).json({ message: "Coleta não encontrada" });
      res.json(coleta);
    } catch (err) {
      console.error("[GET /api/coletas/:id]", err);
      res.status(404).json({ message: "Coleta não encontrada" });
    }
  });

  app.post("/api/coletas", async (req: Request, res: Response) => {
    try {
      // Resolver dados do fornecedor se vier só o id
      const fornecedoresList = await dbListFornecedores();
      const fornecedor = fornecedoresList.find((f) => f.id === req.body.fornecedorId);
      const nova = await dbCreateColeta({
        fornecedorId: req.body.fornecedorId,
        nomeFantasia: fornecedor?.nome || req.body.nomeFantasia,
        razaoSocial: (fornecedor as { razaoSocial?: string } | undefined)?.razaoSocial,
        cnpjFornecedor: fornecedor?.cnpj,
        notaFiscal: req.body.notaFiscal,
        pesoTotalNF: Number(req.body.pesoTotalNF) || 0,
        dataChegada: req.body.dataChegada,
        galpao: req.body.galpao,
        observacao: req.body.observacao,
        recorrencia: req.body.recorrencia || null,
      });
      res.status(201).json(nova);
    } catch (err) {
      console.error("[POST /api/coletas]", err);
      res.status(500).json({ message: "Erro ao cadastrar coleta" });
    }
  });

  app.put("/api/coletas/:id", async (req: Request, res: Response) => {
    try {
      const updated = await dbUpdateColeta(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      console.error("[PUT /api/coletas/:id]", err);
      res.status(404).json({ message: "Coleta não encontrada" });
    }
  });

  app.delete("/api/coletas/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbDeleteColeta(req.params.id));
    } catch (err) {
      console.error("[DELETE /api/coletas/:id]", err);
      res.status(500).json({ message: "Erro ao excluir coleta" });
    }
  });

  // ==================== FORNECEDORES (Supabase) ====================
  app.get("/api/fornecedores", async (_req: Request, res: Response) => {
    try {
      res.json(await dbListFornecedores());
    } catch (err) {
      console.error("[GET /api/fornecedores]", err);
      res.status(500).json({ message: "Erro ao listar fornecedores" });
    }
  });

  app.post("/api/fornecedores", async (req: Request, res: Response) => {
    try {
      res.status(201).json(await dbCreateFornecedor(req.body));
    } catch (err) {
      console.error("[POST /api/fornecedores]", err);
      res.status(500).json({ message: "Erro ao cadastrar fornecedor" });
    }
  });

  app.put("/api/fornecedores/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbUpdateFornecedor(req.params.id, req.body));
    } catch (err) {
      console.error("[PUT /api/fornecedores/:id]", err);
      res.status(404).json({ message: "Fornecedor não encontrado" });
    }
  });

  app.delete("/api/fornecedores/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbDeleteFornecedor(req.params.id));
    } catch (err) {
      console.error("[DELETE /api/fornecedores/:id]", err);
      res.status(500).json({ message: "Erro ao excluir fornecedor" });
    }
  });

  // ==================== PRODUTOS (Supabase) ====================
  app.get("/api/produtos", async (_req: Request, res: Response) => {
    try {
      res.json(await dbListProdutos());
    } catch (err) {
      console.error("[GET /api/produtos]", err);
      res.status(500).json({ message: "Erro ao listar produtos" });
    }
  });

  app.get("/api/produtos/:id", async (req: Request, res: Response) => {
    try {
      const p = await dbGetProduto(req.params.id);
      if (!p) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(p);
    } catch (err) {
      console.error("[GET /api/produtos/:id]", err);
      res.status(404).json({ message: "Produto não encontrado" });
    }
  });

  app.post("/api/produtos", async (req: Request, res: Response) => {
    try {
      res.status(201).json(await dbCreateProduto(req.body));
    } catch (err) {
      console.error("[POST /api/produtos]", err);
      res.status(500).json({ message: "Erro ao cadastrar produto" });
    }
  });

  app.put("/api/produtos/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbUpdateProduto(req.params.id, req.body));
    } catch (err) {
      console.error("[PUT /api/produtos/:id]", err);
      res.status(404).json({ message: "Produto não encontrado" });
    }
  });

  app.delete("/api/produtos/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbDeleteProduto(req.params.id));
    } catch (err) {
      console.error("[DELETE /api/produtos/:id]", err);
      res.status(500).json({ message: "Erro ao inativar produto" });
    }
  });

  // ==================== MOTORISTAS (Supabase) ====================
  app.get("/api/motoristas", async (_req: Request, res: Response) => {
    try {
      res.json(await dbListMotoristas());
    } catch (err) {
      console.error("[GET /api/motoristas]", err);
      res.status(500).json({ message: "Erro ao listar motoristas" });
    }
  });

  app.get("/api/motoristas/:id", async (req: Request, res: Response) => {
    try {
      const m = await dbGetMotorista(req.params.id);
      if (!m) return res.status(404).json({ message: "Motorista não encontrado" });
      res.json(m);
    } catch (err) {
      console.error("[GET /api/motoristas/:id]", err);
      res.status(404).json({ message: "Motorista não encontrado" });
    }
  });

  app.post("/api/motoristas", async (req: Request, res: Response) => {
    try {
      res.status(201).json(await dbCreateMotorista(req.body));
    } catch (err) {
      console.error("[POST /api/motoristas]", err);
      res.status(500).json({ message: "Erro ao cadastrar motorista" });
    }
  });

  app.put("/api/motoristas/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbUpdateMotorista(req.params.id, req.body));
    } catch (err) {
      console.error("[PUT /api/motoristas/:id]", err);
      res.status(404).json({ message: "Motorista não encontrado" });
    }
  });

  app.delete("/api/motoristas/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbDeleteMotorista(req.params.id));
    } catch (err) {
      console.error("[DELETE /api/motoristas/:id]", err);
      res.status(500).json({ message: "Erro ao inativar motorista" });
    }
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
  /** Contagens leves para badge/polling — evita serializar a lista completa. */
  app.get("/api/producoes/counts", (_req: Request, res: Response) => {
    let pendente = 0;
    for (let i = 0; i < producoes.length; i++) {
      if (producoes[i].statusEstoque === "pendente") pendente++;
    }
    res.json({ pendente, total: producoes.length });
  });

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

  // ==================== CLIENTES (Supabase) ====================
  app.get("/api/clientes", async (_req: Request, res: Response) => {
    try {
      res.json(await dbListClientes());
    } catch (err) {
      console.error("[GET /api/clientes]", err);
      res.status(500).json({ message: "Erro ao listar clientes" });
    }
  });

  app.get("/api/clientes/:id", async (req: Request, res: Response) => {
    try {
      const c = await dbGetCliente(req.params.id);
      if (!c) return res.status(404).json({ message: "Cliente não encontrado" });
      res.json(c);
    } catch (err) {
      console.error("[GET /api/clientes/:id]", err);
      res.status(404).json({ message: "Cliente não encontrado" });
    }
  });

  app.post("/api/clientes", async (req: Request, res: Response) => {
    try {
      res.status(201).json(await dbCreateCliente(req.body));
    } catch (err) {
      console.error("[POST /api/clientes]", err);
      res.status(500).json({ message: "Erro ao cadastrar cliente" });
    }
  });

  app.put("/api/clientes/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbUpdateCliente(req.params.id, req.body));
    } catch (err) {
      console.error("[PUT /api/clientes/:id]", err);
      res.status(404).json({ message: "Cliente não encontrado" });
    }
  });

  app.delete("/api/clientes/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbDeleteCliente(req.params.id));
    } catch (err) {
      console.error("[DELETE /api/clientes/:id]", err);
      res.status(500).json({ message: "Erro ao inativar cliente" });
    }
  });

  // ==================== EXPEDICOES ====================
  // ==================== EXPEDIÇÕES / PEDIDOS (Supabase) ====================
  app.get("/api/expedicoes", async (_req: Request, res: Response) => {
    try {
      res.json(await dbListExpedicoes());
    } catch (err) {
      console.error("[GET /api/expedicoes]", err);
      res.status(500).json({ message: "Erro ao listar pedidos" });
    }
  });

  app.get("/api/expedicoes/:id", async (req: Request, res: Response) => {
    try {
      const e = await dbGetExpedicao(req.params.id);
      if (!e) return res.status(404).json({ message: "Pedido não encontrado" });
      res.json(e);
    } catch (err) {
      console.error("[GET /api/expedicoes/:id]", err);
      res.status(404).json({ message: "Pedido não encontrado" });
    }
  });

  app.post("/api/expedicoes", async (req: Request, res: Response) => {
    try {
      res.status(201).json(await dbCreateExpedicao(req.body));
    } catch (err) {
      console.error("[POST /api/expedicoes]", err);
      res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });

  app.put("/api/expedicoes/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbUpdateExpedicao(req.params.id, req.body));
    } catch (err) {
      console.error("[PUT /api/expedicoes/:id]", err);
      res.status(404).json({ message: "Pedido não encontrado" });
    }
  });

  app.delete("/api/expedicoes/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbDeleteExpedicao(req.params.id));
    } catch (err) {
      console.error("[DELETE /api/expedicoes/:id]", err);
      res.status(500).json({ message: "Erro ao excluir pedido" });
    }
  });

  // Cadeia de aprovação
  app.put("/api/expedicoes/:id/aprovar-financeiro", async (req: Request, res: Response) => {
    try {
      res.json(
        await dbUpdateExpedicao(req.params.id, {
          statusFinanceiro: "aprovado",
          statusEntrega: "aguardando_nf",
        }),
      );
    } catch (err) {
      console.error("[PUT aprovar-financeiro]", err);
      res.status(500).json({ message: "Erro ao aprovar" });
    }
  });

  app.put("/api/expedicoes/:id/rejeitar-financeiro", async (req: Request, res: Response) => {
    try {
      res.json(
        await dbUpdateExpedicao(req.params.id, {
          statusFinanceiro: "rejeitado",
        }),
      );
    } catch (err) {
      console.error("[PUT rejeitar-financeiro]", err);
      res.status(500).json({ message: "Erro ao rejeitar" });
    }
  });

  app.put("/api/expedicoes/:id/emitir-nf", async (req: Request, res: Response) => {
    try {
      const notaFiscal = `NF-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
      res.json(
        await dbUpdateExpedicao(req.params.id, {
          statusNota: "emitida",
          notaFiscal,
          statusEntrega: "pronto_entrega",
          dataEmissaoNota: new Date().toISOString(),
        }),
      );
    } catch (err) {
      console.error("[PUT emitir-nf]", err);
      res.status(500).json({ message: "Erro ao emitir NF" });
    }
  });

  app.put("/api/expedicoes/:id/entregar", async (req: Request, res: Response) => {
    try {
      res.json(await dbUpdateExpedicao(req.params.id, { statusEntrega: "entregue" }));
    } catch (err) {
      console.error("[PUT entregar]", err);
      res.status(500).json({ message: "Erro ao marcar entregue" });
    }
  });

  /**
   * REGRA R2 — disponibilidade de stock
   * GET /api/expedicoes/disponibilidade?produtoId=…&galpao=…
   * Retorna { kiloTotal, unidadeTotal, reservado, unidadeDisponivel }
   */
  app.get("/api/expedicoes/disponibilidade", async (req: Request, res: Response) => {
    try {
      const { produtoId, galpao } = req.query;
      if (!produtoId || typeof produtoId !== "string") {
        return res.status(400).json({ message: "produtoId obrigatório" });
      }
      const r = await dbGetDisponibilidade(produtoId, typeof galpao === "string" ? galpao : undefined);
      res.json(r);
    } catch (err) {
      console.error("[GET disponibilidade]", err);
      res.status(500).json({ message: "Erro ao calcular disponibilidade" });
    }
  });

  // ==================== ESTOQUE (Supabase) ====================
  app.get("/api/estoque", async (_req: Request, res: Response) => {
    try {
      res.json(await dbListEstoque());
    } catch (err) {
      console.error("[GET /api/estoque]", err);
      res.status(500).json({ message: "Erro ao listar estoque" });
    }
  });

  app.get("/api/estoque/:id", async (req: Request, res: Response) => {
    try {
      const e = await dbGetEstoque(req.params.id);
      if (!e) return res.status(404).json({ message: "Item não encontrado" });
      res.json(e);
    } catch (err) {
      console.error("[GET /api/estoque/:id]", err);
      res.status(404).json({ message: "Item não encontrado" });
    }
  });

  app.post("/api/estoque", async (req: Request, res: Response) => {
    try {
      res.status(201).json(await dbCreateEstoque(req.body));
    } catch (err) {
      console.error("[POST /api/estoque]", err);
      res.status(500).json({ message: "Erro ao criar item de estoque" });
    }
  });

  app.put("/api/estoque/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbUpdateEstoque(req.params.id, req.body));
    } catch (err) {
      console.error("[PUT /api/estoque/:id]", err);
      res.status(404).json({ message: "Item não encontrado" });
    }
  });

  app.delete("/api/estoque/:id", async (req: Request, res: Response) => {
    try {
      res.json(await dbDeleteEstoque(req.params.id));
    } catch (err) {
      console.error("[DELETE /api/estoque/:id]", err);
      res.status(500).json({ message: "Erro ao remover item de estoque" });
    }
  });

  // ==================== COLABORADORES (Sync Bidirecional RHiD ↔ Tecnopano) ====================

  // Fallback local
  let colaboradoresLocal: any[] = [
    { id: 1, cpf: "11111111111", name: "José da Silva", registration: "M001", departamento: "Motorista", idDepartment: 0, status: 1, fonte: "local" },
    { id: 2, cpf: "22222222222", name: "Carlos Santos", registration: "M002", departamento: "Motorista", idDepartment: 0, status: 1, fonte: "local" },
    { id: 3, cpf: "33333333333", name: "Maria Silva", registration: "C001", departamento: "Costura", idDepartment: 0, status: 1, fonte: "local" },
    { id: 4, cpf: "44444444444", name: "Lucas Oliveira", registration: "G001", departamento: "Galpão", idDepartment: 0, status: 1, fonte: "local" },
    { id: 5, cpf: "55555555555", name: "Ana Santos", registration: "C002", departamento: "Costura", idDepartment: 0, status: 1, fonte: "local" },
    { id: 6, cpf: "66666666666", name: "Rafael Lima", registration: "G002", departamento: "Galpão", idDepartment: 0, status: 1, fonte: "local" },
    { id: 7, cpf: "77777777777", name: "Marcos Souza", registration: "G003", departamento: "Galpão", idDepartment: 0, status: 1, fonte: "local" },
    { id: 8, cpf: "88888888888", name: "Pedro Costa", registration: "G004", departamento: "Galpão", idDepartment: 0, status: 1, fonte: "local" },
  ];

  let departamentosLocal: any[] = [
    { id: 1, name: "Motorista" },
    { id: 2, name: "Galpão" },
    { id: 3, name: "Costura" },
    { id: 4, name: "Expedição" },
    { id: 5, name: "Escritório" },
    { id: 6, name: "Financeiro" },
    { id: 7, name: "Administração" },
  ];

  // GET todos colaboradores
  app.get("/api/colaboradores", async (_req: Request, res: Response) => {
    if (isRHiDConfigured()) {
      try {
        const [pessoas, departamentos] = await Promise.all([fetchPessoas(), fetchDepartamentos()]);
        const deptMap = new Map(departamentos.map((d) => [d.id, d.name]));
        const colaboradores = pessoas.map((p) => ({
          id: p.id, cpf: String(p.cpf).padStart(11, "0"), name: p.name,
          registration: p.registration, departamento: deptMap.get(p.idDepartment) || "",
          idDepartment: p.idDepartment, status: p.status, fonte: "rhid" as const,
        }));
        return res.json({ fonte: "rhid", colaboradores });
      } catch (error) {
        console.error("RHiD falhou, usando fallback:", error);
      }
    }
    res.json({ fonte: "local", colaboradores: colaboradoresLocal });
  });

  // GET por departamento
  app.get("/api/colaboradores/departamento/:depto", async (req: Request, res: Response) => {
    const deptoRaw = req.params.depto;
    const depto = (typeof deptoRaw === "string" ? deptoRaw : deptoRaw?.[0] ?? "").toLowerCase();
    if (isRHiDConfigured()) {
      try {
        const [pessoas, departamentos] = await Promise.all([fetchPessoas(), fetchDepartamentos()]);
        const deptIds = departamentos.filter((d) => d.name.toLowerCase().includes(depto)).map((d) => d.id);
        return res.json(pessoas.filter((p) => deptIds.includes(p.idDepartment)).map((p) => ({
          id: p.id, cpf: String(p.cpf).padStart(11, "0"), name: p.name,
          registration: p.registration, fonte: "rhid",
        })));
      } catch { /* fallback */ }
    }
    res.json(colaboradoresLocal.filter((c) => c.departamento.toLowerCase().includes(depto)));
  });

  // POST criar colaborador → Tecnopano + RHiD
  app.post("/api/colaboradores", async (req: Request, res: Response) => {
    const { name, cpf, registration, departamento, idDepartment } = req.body;

    // Salva local sempre
    const novo: any = {
      id: Date.now(), cpf: (cpf || "").replace(/\D/g, ""), name: name || "",
      registration: registration || "", departamento: departamento || "",
      idDepartment: idDepartment || 0, status: 1, fonte: "local",
    };
    colaboradoresLocal.push(novo);

    // Tenta enviar para RHiD também
    if (isRHiDConfigured()) {
      try {
        const rhidResult = await criarPessoaRHiD({
          name, cpf: (cpf || "").replace(/\D/g, ""),
          registration, idDepartment: idDepartment || undefined,
        });
        if (rhidResult) {
          novo.fonte = "rhid+local";
          novo.rhidSync = true;
        }
      } catch (error) {
        console.error("Falha ao sincronizar com RHiD (salvo apenas local):", error);
        novo.rhidSync = false;
      }
    }

    res.status(201).json(novo);
  });

  // PUT atualizar colaborador → Tecnopano + RHiD
  app.put("/api/colaboradores/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, cpf, registration, departamento, idDepartment, status } = req.body;

    // Atualiza local
    const idx = colaboradoresLocal.findIndex((c) => c.id === id);
    if (idx !== -1) {
      colaboradoresLocal[idx] = { ...colaboradoresLocal[idx], name, cpf: (cpf || "").replace(/\D/g, ""), registration, departamento, idDepartment, status };
    }

    // Sincroniza com RHiD
    let rhidSync = false;
    if (isRHiDConfigured()) {
      try {
        await atualizarPessoaRHiD({ id, name, cpf: (cpf || "").replace(/\D/g, ""), registration, idDepartment, status });
        rhidSync = true;
      } catch (error) {
        console.error("Falha ao sincronizar atualização com RHiD:", error);
      }
    }

    res.json({ ...(colaboradoresLocal[idx] || req.body), id, rhidSync });
  });

  // DELETE colaborador → Tecnopano + RHiD
  app.delete("/api/colaboradores/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    colaboradoresLocal = colaboradoresLocal.filter((c) => c.id !== id);

    if (isRHiDConfigured()) {
      try { await deletarPessoaRHiD(id); } catch { }
    }

    res.json({ ok: true });
  });

  // GET departamentos
  app.get("/api/departamentos", async (_req: Request, res: Response) => {
    if (isRHiDConfigured()) {
      try {
        const deptos = await fetchDepartamentos();
        return res.json({ fonte: "rhid", departamentos: deptos });
      } catch { }
    }
    res.json({ fonte: "local", departamentos: departamentosLocal });
  });

  // POST criar departamento → Tecnopano + RHiD
  app.post("/api/departamentos", async (req: Request, res: Response) => {
    const { name } = req.body;
    const novo = { id: Date.now(), name };
    departamentosLocal.push(novo);

    if (isRHiDConfigured()) {
      try { await criarDepartamentoRHiD({ name }); } catch { }
    }

    res.status(201).json(novo);
  });

  // GET status integração
  app.get("/api/colaboradores/status", (_req: Request, res: Response) => {
    res.json({
      rhidConfigurado: isRHiDConfigured(),
      rhidUrl: process.env.RHID_API_URL || "https://www.rhid.com.br/v2/swagger.svc",
      totalLocal: colaboradoresLocal.length,
      totalDepartamentos: departamentosLocal.length,
    });
  });

  // ==================== PRODUÇÃO DIÁRIA ====================
  app.get("/api/producao-diaria", (_req: Request, res: Response) => {
    res.json(producaoDiariaList);
  });

  app.post("/api/producao-diaria", (req: Request, res: Response) => {
    const item = {
      id: `pd${nextProducaoDiariaId++}`,
      data: req.body.data,
      nomeDupla: req.body.nomeDupla,
      sala: req.body.sala,
      material: req.body.material,
      horarioInicio: req.body.horarioInicio,
      horarioFim: req.body.horarioFim || null,
      status: req.body.status || "completa",
      assinatura: req.body.assinatura || "",
      encarregado: req.body.encarregado || "",
      observacao: req.body.observacao || "",
      createdAt: new Date().toISOString(),
    };
    producaoDiariaList.unshift(item);
    res.status(201).json(item);
  });

  app.delete("/api/producao-diaria/:id", (req: Request, res: Response) => {
    const idx = producaoDiariaList.findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Não encontrado" });
    producaoDiariaList.splice(idx, 1);
    res.json({ ok: true });
  });

  // ==================== ADMIN: USERS ====================

  app.get("/api/admin/users", async (_req: Request, res: Response) => {
    try {
      const data = await listUsers(true);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await getUser(req.params.id);
      const perms = await getGrantedResources(req.params.id);
      res.json({ ...user, permissions: perms });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const user = await createUser(req.body);
      await logAudit({ action: "user_create", resource: user.id, details: { nome: user.nome, perfil: user.perfil } });
      res.status(201).json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await updateUser(req.params.id, req.body);
      await logAudit({ action: "user_edit", resource: req.params.id, details: req.body });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      await deactivateUser(req.params.id);
      await logAudit({ action: "user_deactivate", resource: req.params.id });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/users/:id/reactivate", async (req: Request, res: Response) => {
    try {
      await reactivateUser(req.params.id);
      await logAudit({ action: "user_reactivate", resource: req.params.id });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/users/:id/reset-password", async (req: Request, res: Response) => {
    try {
      const newPass = req.body.password || "Tecnopano@2026";
      await changePassword(req.params.id, newPass);
      await logAudit({ action: "password_reset", resource: req.params.id });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== ADMIN: PERMISSIONS ====================

  app.get("/api/admin/permissions/:userId", async (req: Request, res: Response) => {
    try {
      const perms = await getGrantedResources(req.params.userId);
      res.json(perms);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/permissions/:userId", async (req: Request, res: Response) => {
    try {
      const { resources, grantedBy } = req.body;
      const result = await setPermissions(req.params.userId, resources, grantedBy);
      await logAudit({
        action: "permission_bulk_update",
        resource: req.params.userId,
        details: { resources },
        userName: grantedBy,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== ACCESS REQUESTS ====================

  app.post("/api/access-requests", async (req: Request, res: Response) => {
    try {
      const { userId, resource, motivo, userName } = req.body;
      const request = await createAccessRequest(userId, resource, motivo);
      await logAudit({ userId, userName, action: "access_request", resource, details: { motivo } });

      // Notificar admins via WhatsApp
      const adminPhones = await getAdminWhatsappNumbers();
      if (adminPhones.length > 0) {
        const msg = `🔐 *Solicitação de Acesso*\n\n👤 ${userName || "Usuário"}\n📄 Recurso: ${resource}\n💬 Motivo: ${motivo}\n\nAcesse o sistema para aprovar/negar.`;
        notifyAdmins(adminPhones, msg).catch(() => {});
      }

      res.status(201).json(request);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/access-requests", async (_req: Request, res: Response) => {
    try {
      const data = await listAllRequests();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/access-requests/pending", async (_req: Request, res: Response) => {
    try {
      const data = await listPendingRequests();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/access-requests/:id/approve", async (req: Request, res: Response) => {
    try {
      const result = await approveRequest(req.params.id, req.body.respondedBy);
      // Grant permission automatically
      if (result.userId && result.resource) {
        await grantPermission(result.userId, result.resource, req.body.respondedBy);
        await logAudit({
          userId: req.body.respondedBy,
          action: "access_approve",
          resource: result.resource,
          details: { requestId: req.params.id, targetUser: result.userId },
        });
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/access-requests/:id/deny", async (req: Request, res: Response) => {
    try {
      const result = await denyRequest(req.params.id, req.body.respondedBy, req.body.motivo);
      await logAudit({
        userId: req.body.respondedBy,
        action: "access_deny",
        resource: result.resource,
        details: { requestId: req.params.id, motivo: req.body.motivo },
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== AUDIT LOG ====================

  app.get("/api/admin/audit-log", async (req: Request, res: Response) => {
    try {
      const { userId, action, limit, offset } = req.query;
      const result = await listAuditLogs({
        userId: userId as string,
        action: action as string,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== AUTH: SELF-SERVICE ====================

  app.put("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      if (!userId || !newPassword) return res.status(400).json({ message: "Dados incompletos" });
      if (currentPassword) {
        const valid = await verifyPassword(userId, currentPassword);
        if (!valid) return res.status(403).json({ message: "Senha atual incorreta" });
      }
      await changePassword(userId, newPassword);
      await logAudit({ userId, action: "password_change" });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/auth/profile", async (req: Request, res: Response) => {
    try {
      const { userId, ...patch } = req.body;
      if (!userId) return res.status(400).json({ message: "userId obrigatório" });
      // Only allow self-service fields
      const allowed = { nome: patch.nome, whatsapp: patch.whatsapp, foto: patch.foto };
      const user = await updateUser(userId, allowed);
      await logAudit({ userId, action: "profile_update", details: allowed });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== WHATSAPP (Evolution API) ====================

  let whatsappConnected = false;
  let whatsappPhone: string | null = null;

  app.get("/api/admin/whatsapp/status", (_req: Request, res: Response) => {
    const configured = !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_TOKEN);
    res.json({
      configured,
      connected: whatsappConnected,
      instance: "tecnopano",
      qrCode: null, // Será preenchido pela Evolution API
      phone: whatsappPhone,
      error: configured ? null : "Evolution API não configurada (será ativada no deploy)",
    });
  });

  app.post("/api/admin/whatsapp/connect", async (_req: Request, res: Response) => {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_TOKEN;

    if (!apiUrl || !token) {
      return res.json({
        message: "Evolution API será configurada no deploy da VPS. Por enquanto, pendências aparecem no badge do menu Administração.",
        configured: false,
      });
    }

    try {
      // Criar instância na Evolution API
      const createRes = await fetch(`${apiUrl}/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: token },
        body: JSON.stringify({ instanceName: "tecnopano", qrcode: true }),
      });
      const data = await createRes.json();
      const qr = data?.qrcode?.base64 || null;

      res.json({ message: "Instância criada", qrCode: qr, instance: "tecnopano" });
    } catch (err: any) {
      res.json({ message: "Evolution API não disponível. Será configurada no deploy.", error: err.message });
    }
  });

  app.post("/api/admin/whatsapp/disconnect", async (_req: Request, res: Response) => {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_TOKEN;

    if (apiUrl && token) {
      try {
        await fetch(`${apiUrl}/instance/logout/tecnopano`, {
          method: "DELETE",
          headers: { apikey: token },
        });
      } catch { /* ignore */ }
    }

    whatsappConnected = false;
    whatsappPhone = null;
    res.json({ ok: true, message: "Desconectado" });
  });

  app.post("/api/admin/whatsapp/test", async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Número obrigatório" });

    try {
      const sent = await sendWhatsApp(phone, "✅ *Teste Tecnopano 3.0*\n\nNotificações do sistema estão funcionando!");
      if (sent) {
        res.json({ ok: true, message: "Mensagem enviada" });
      } else {
        res.json({ ok: false, message: "Falha ao enviar (verifique os logs do servidor)" });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==================== BUBBLE SYNC ====================

  /** Status do sync */
  app.get("/api/bubble/status", (_req: Request, res: Response) => {
    res.json(getSyncStatus());
  });

  /** Sync completo (últimos 3 meses ou desde uma data) */
  app.post("/api/bubble/sync", async (req: Request, res: Response) => {
    try {
      const sinceParam = req.body?.since;
      const since = sinceParam
        ? new Date(sinceParam)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 3 meses
      const result = await syncAll(since);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /** Sync de uma tabela específica */
  app.post("/api/bubble/sync/:tabela", async (req: Request, res: Response) => {
    try {
      const sinceParam = req.body?.since;
      const since = sinceParam
        ? new Date(sinceParam)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const result = await syncOne(req.params.tabela, since);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /** Iniciar/parar polling automático */
  app.post("/api/bubble/polling/start", (_req: Request, res: Response) => {
    startPolling();
    res.json({ message: "Polling iniciado", ...getSyncStatus() });
  });

  app.post("/api/bubble/polling/stop", (_req: Request, res: Response) => {
    stopPolling();
    res.json({ message: "Polling parado", ...getSyncStatus() });
  });

  // ==================== HEALTH ====================
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
