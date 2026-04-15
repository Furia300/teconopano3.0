import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== ENUMS ====================

export const perfilEnum = pgEnum("perfil", [
  "administrador",
  "galpao",
  "emissao_nf",
  "financeiro",
  "expedicao",
  "rh",
  "producao",
  "separacao",
  "motorista",
  "costureira",
]);

export const statusColetaEnum = pgEnum("status_coleta", [
  "pendente",
  "agendado",
  "em_rota",
  "recebido",
  "em_separacao",
  "separado",
  "em_producao",
  "finalizado",
  "cancelado",
]);

export const statusExpedicaoEnum = pgEnum("status_expedicao", [
  "pendente",
  "reservado",
  "separado",
  "aguardando_financeiro",
  "aguardando_nf",
  "pronto_entrega",
  "em_rota",
  "entregue",
  "cancelado",
]);

export const statusFinanceiroEnum = pgEnum("status_financeiro", [
  "pendente_aprovacao",
  "aprovado",
  "rejeitado",
]);

export const statusNotaEnum = pgEnum("status_nota", [
  "pendente_emissao",
  "emitida",
  "cancelada",
]);

export const unidadeSaidaEnum = pgEnum("unidade_saida", ["kilo", "unidade", "pacote"]);

export const destinoSeparacaoEnum = pgEnum("destino_separacao", [
  "producao",
  "repanol",
  "costureira",
  "doacao",
  "descarte",
]);

// ==================== USERS ====================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nome: text("nome").notNull(),
  email: text("email"),
  cargo: text("cargo"),
  departamento: text("departamento"),
  matricula: text("matricula"),
  whatsapp: text("whatsapp"),
  foto: text("foto"),
  perfil: perfilEnum("perfil").notNull().default("galpao"),
  acesso: boolean("acesso").default(true),
  podeGerenciarUsuarios: boolean("pode_gerenciar_usuarios").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ==================== FORNECEDORES ====================

export const fornecedores = pgTable("fornecedores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  nome: text("nome").notNull(),
  razaoSocial: text("razao_social"),
  cnpj: text("cnpj"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  contato: text("contato"),
  email: text("email"),
  statusServico: text("status_servico"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFornecedorSchema = createInsertSchema(fornecedores).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFornecedor = z.infer<typeof insertFornecedorSchema>;
export type Fornecedor = typeof fornecedores.$inferSelect;

// ==================== CLIENTES ====================

export const clientes = pgTable("clientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  codigoLegado: text("codigo_legado"),
  nomeFantasia: text("nome_fantasia").notNull(),
  razaoSocial: text("razao_social"),
  cnpj: text("cnpj"),
  endereco: text("endereco"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  contato: text("contato"),
  email: text("email"),
  observacao: text("observacao"),
  dataRetirada: timestamp("data_retirada"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClienteSchema = createInsertSchema(clientes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type Cliente = typeof clientes.$inferSelect;

// ==================== PRODUTOS ====================

export const produtos = pgTable("produtos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  descricao: text("descricao").notNull(),
  tipoMaterial: text("tipo_material").notNull(),
  cor: text("cor"),
  medida: text("medida"),
  acabamento: text("acabamento"),
  pesoMedio: decimal("peso_medio", { precision: 10, scale: 2 }),
  unidadeMedida: text("unidade_medida").default("Pacote/Kilo"),
  foto: text("foto"),
  notaFiscal: text("nota_fiscal"),
  observacao: text("observacao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProdutoSchema = createInsertSchema(produtos).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduto = z.infer<typeof insertProdutoSchema>;
export type Produto = typeof produtos.$inferSelect;

// ==================== FUNCIONARIOS ====================

export const funcionarios = pgTable("funcionarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  nome: text("nome").notNull(),
  cargo: text("cargo"),
  matricula: text("matricula"),
  galpao: text("galpao"),
  whatsapp: text("whatsapp"),
  foto: text("foto"),
  dataAdmissao: timestamp("data_admissao"),
  observacao: text("observacao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFuncionarioSchema = createInsertSchema(funcionarios).omit({ id: true, createdAt: true });
export type InsertFuncionario = z.infer<typeof insertFuncionarioSchema>;
export type Funcionario = typeof funcionarios.$inferSelect;

// ==================== QR CODES ====================

export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  codigo: text("codigo").notNull().unique(),
  tipo: text("tipo").notNull(), // trouxa, gaiola, fardo
  coletaId: varchar("coleta_id").references(() => coletas.id),
  fornecedorId: varchar("fornecedor_id").references(() => fornecedores.id),
  tipoMaterial: text("tipo_material"),
  cor: text("cor"),
  pesoInicial: decimal("peso_inicial", { precision: 10, scale: 2 }),
  status: text("status").default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({ id: true, createdAt: true });
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type QrCode = typeof qrCodes.$inferSelect;

// ==================== COLETAS (= Pedido_Tecnopano) ====================

export const coletas = pgTable("coletas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  numero: integer("numero").notNull(),
  fornecedorId: varchar("fornecedor_id").references(() => fornecedores.id),
  nomeFantasia: text("nome_fantasia"),
  razaoSocial: text("razao_social"),
  cnpjFornecedor: text("cnpj_fornecedor"),
  notaFiscal: text("nota_fiscal"),
  pesoTotalNF: decimal("peso_total_nf", { precision: 10, scale: 2 }),
  pesoTotalAtual: decimal("peso_total_atual", { precision: 10, scale: 2 }),
  dataPedido: timestamp("data_pedido").defaultNow(),
  dataChegada: timestamp("data_chegada"),
  endereco: text("endereco"),
  galpao: text("galpao"),
  status: statusColetaEnum("status").default("pendente"),
  statusServico: text("status_servico"),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  observacao: text("observacao"),
  recorrencia: text("recorrencia"),
  // Pesos separação
  pesoManchadoSeparacao: decimal("peso_manchado_separacao", { precision: 10, scale: 2 }),
  pesoRenovaSeparacao: decimal("peso_renova_separacao", { precision: 10, scale: 2 }),
  totalKgSeparacao: decimal("total_kg_separacao", { precision: 10, scale: 2 }),
  diferencaKgSeparacao: decimal("diferenca_kg_separacao", { precision: 10, scale: 2 }),
  // Pesos repanol envio
  pesoEnvioManchado: decimal("peso_envio_manchado", { precision: 10, scale: 2 }),
  pesoEnvioMolhado: decimal("peso_envio_molhado", { precision: 10, scale: 2 }),
  pesoEnvioTingido: decimal("peso_envio_tingido", { precision: 10, scale: 2 }),
  dataEnvioRepanol: timestamp("data_envio_repanol"),
  // Pesos repanol retorno
  pesoManchadoRetorno: decimal("peso_manchado_retorno", { precision: 10, scale: 2 }),
  pesoMolhadoRetorno: decimal("peso_molhado_retorno", { precision: 10, scale: 2 }),
  pesoTingidoRetorno: decimal("peso_tingido_retorno", { precision: 10, scale: 2 }),
  dataRetornoRepanol: timestamp("data_retorno_repanol"),
  // Produção
  dataInicioProducao: timestamp("data_inicio_producao"),
  colaboradorProducao: text("colaborador_producao"),
  pesoRenovaProducao: decimal("peso_renova_producao", { precision: 10, scale: 2 }),
  pesoRenovaPausa: decimal("peso_renova_pausa", { precision: 10, scale: 2 }),
  pesoResiduosCostureira: decimal("peso_residuos_costureira", { precision: 10, scale: 2 }),
  totalNfDifKg: decimal("total_nf_dif_kg", { precision: 10, scale: 2 }),
  // Audit
  userAtualizacaoId: varchar("user_atualizacao_id").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertColetaSchema = createInsertSchema(coletas).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertColeta = z.infer<typeof insertColetaSchema>;
export type Coleta = typeof coletas.$inferSelect;

// ==================== SEPARACOES ====================

export const separacoes = pgTable("separacoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  coletaId: varchar("coleta_id").references(() => coletas.id),
  qrCodeId: varchar("qr_code_id").references(() => qrCodes.id),
  tipoMaterial: text("tipo_material"),
  cor: text("cor"),
  peso: decimal("peso", { precision: 10, scale: 2 }),
  destino: destinoSeparacaoEnum("destino"),
  colaborador: text("colaborador"),
  galpao: text("galpao"),
  data: timestamp("data").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSeparacaoSchema = createInsertSchema(separacoes).omit({ id: true, createdAt: true });
export type InsertSeparacao = z.infer<typeof insertSeparacaoSchema>;
export type Separacao = typeof separacoes.$inferSelect;

// ==================== REPANOL ====================

export const repanol = pgTable("repanol", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  coletaId: varchar("coleta_id").references(() => coletas.id),
  separacaoId: varchar("separacao_id").references(() => separacoes.id),
  empresaFornecedor: text("empresa_fornecedor"),
  tipoMaterial: text("tipo_material"),
  galpao: text("galpao"),
  // Envio
  dataEnvio: timestamp("data_envio"),
  pesoManchadoEnvio: decimal("peso_manchado_envio", { precision: 10, scale: 2 }),
  pesoMolhadoEnvio: decimal("peso_molhado_envio", { precision: 10, scale: 2 }),
  pesoTingidoEnvio: decimal("peso_tingido_envio", { precision: 10, scale: 2 }),
  // Retorno
  dataRetorno: timestamp("data_retorno"),
  pesoManchadoRetorno: decimal("peso_manchado_retorno", { precision: 10, scale: 2 }),
  pesoMolhadoRetorno: decimal("peso_molhado_retorno", { precision: 10, scale: 2 }),
  pesoTingidoRetorno: decimal("peso_tingido_retorno", { precision: 10, scale: 2 }),
  repanolResiduo: decimal("repanol_residuo", { precision: 10, scale: 2 }),
  status: text("status").default("pendente"),
  statusServico: text("status_servico"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRepanolSchema = createInsertSchema(repanol).omit({ id: true, createdAt: true });
export type InsertRepanol = z.infer<typeof insertRepanolSchema>;
export type Repanol = typeof repanol.$inferSelect;

// ==================== PRODUCOES ====================

export const producoes = pgTable("producoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  coletaId: varchar("coleta_id").references(() => coletas.id),
  qrCodeId: varchar("qr_code_id").references(() => qrCodes.id),
  sala: text("sala"), // CORTE 01, CORTE 02, FAIXA, etc.
  tipoMaterial: text("tipo_material"),
  cor: text("cor"),
  acabamento: text("acabamento"),
  medida: text("medida"),
  novaDescricao: text("nova_descricao"),
  kilo: decimal("kilo", { precision: 10, scale: 2 }),
  pesoMedio: decimal("peso_medio", { precision: 10, scale: 2 }),
  qtdePacote: integer("qtde_pacote"),
  unidadeMedida: text("unidade_medida").default("Pacote/Kilo"),
  unidadeSaida: unidadeSaidaEnum("unidade_saida"),
  statusEstoque: text("status_estoque").default("pendente"),
  deletado: boolean("deletado").default(false),
  operadorId: varchar("operador_id").references(() => users.id),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProducaoSchema = createInsertSchema(producoes).omit({ id: true, createdAt: true });
export type InsertProducao = z.infer<typeof insertProducaoSchema>;
export type Producao = typeof producoes.$inferSelect;

// ==================== COSTUREIRA ENVIOS ====================

export const costureiraEnvios = pgTable("costureira_envios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  coletaId: varchar("coleta_id").references(() => coletas.id),
  costureira: text("costureira"),
  tipoMaterial: text("tipo_material"),
  tipoMedida: text("tipo_medida"),
  status: text("status").default("pendente"),
  // Envio
  dataEnvio: timestamp("data_envio"),
  galpaoEnvio: text("galpao_envio"),
  motoristaEnvioId: varchar("motorista_envio_id").references(() => funcionarios.id),
  qtdsSaidaKg: decimal("qtds_saida_kg", { precision: 10, scale: 2 }),
  assCostEntrega: text("ass_cost_entrega"), // URL da imagem assinatura
  assMotEntrega: text("ass_mot_entrega"),
  // Retorno
  dataRetorno: timestamp("data_retorno"),
  dataProducao: timestamp("data_producao"),
  galpaoRetorno: text("galpao_retorno"),
  motoristaRetornoId: varchar("motorista_retorno_id").references(() => funcionarios.id),
  qtdsRetornoKg: decimal("qtds_retorno_kg", { precision: 10, scale: 2 }),
  qtdsPacotesRetorno: integer("qtds_pacotes_retorno"),
  assCostDevolucao: text("ass_cost_devolucao"),
  assMotDevolucao: text("ass_mot_devolucao"),
  // Diferença
  totalDifKg: decimal("total_dif_kg", { precision: 10, scale: 2 }),
  residuos: decimal("residuos", { precision: 10, scale: 2 }),
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCostureiraEnvioSchema = createInsertSchema(costureiraEnvios).omit({ id: true, createdAt: true });
export type InsertCostureiraEnvio = z.infer<typeof insertCostureiraEnvioSchema>;
export type CostureiraEnvio = typeof costureiraEnvios.$inferSelect;

// ==================== ESTOQUE ====================

export const estoque = pgTable("estoque", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  coletaId: varchar("coleta_id").references(() => coletas.id),
  producaoId: varchar("producao_id").references(() => producoes.id),
  produtoId: varchar("produto_id").references(() => produtos.id),
  qrCodeId: varchar("qr_code_id").references(() => qrCodes.id),
  descricaoProduto: text("descricao_produto"),
  novaDescricao: text("nova_descricao"),
  tipoMaterial: text("tipo_material"),
  cor: text("cor"),
  medida: text("medida"),
  acabamento: text("acabamento"),
  kilo: decimal("kilo", { precision: 10, scale: 2 }),
  unidade: integer("unidade"),
  pesoMedioPct: decimal("peso_medio_pct", { precision: 10, scale: 2 }),
  unidadeMedida: text("unidade_medida"),
  qtdeReservadaPacote: integer("qtde_reservada_pacote").default(0),
  galpao: text("galpao"),
  notaFiscal: text("nota_fiscal"),
  nomeFantasia: text("nome_fantasia"),
  razaoSocial: text("razao_social"),
  cnpj: text("cnpj"),
  idCliente: text("id_cliente"),
  status: text("status").default("Pendente"),
  statusMaterial: text("status_material"),
  statusServico: text("status_servico"),
  observacao: text("observacao"),
  data: timestamp("data").defaultNow(),
  dataRetirada: timestamp("data_retirada"),
  usuarioId: varchar("usuario_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEstoqueSchema = createInsertSchema(estoque).omit({ id: true, createdAt: true });
export type InsertEstoque = z.infer<typeof insertEstoqueSchema>;
export type Estoque = typeof estoque.$inferSelect;

// ==================== EXPEDICOES ====================

export const expedicoes = pgTable("expedicoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bubbleId: text("bubble_id").unique(),
  clienteId: varchar("cliente_id").references(() => clientes.id),
  estoqueOrigemId: varchar("estoque_origem_id").references(() => estoque.id),
  produtoId: varchar("produto_id").references(() => produtos.id),
  // Cliente info
  nomeFantasia: text("nome_fantasia"),
  razaoSocial: text("razao_social"),
  cnpj: text("cnpj"),
  contato: text("contato"),
  email: text("email"),
  endereco: text("endereco"),
  // Produto info
  descricaoProduto: text("descricao_produto"),
  tipoMaterial: text("tipo_material"),
  cor: text("cor"),
  medida: text("medida"),
  acabamento: text("acabamento"),
  estilo: text("estilo"),
  unidadeMedida: text("unidade_medida").default("Pacote / Kilo"),
  // Quantidades
  kilo: decimal("kilo", { precision: 10, scale: 2 }),
  kiloSolicitada: decimal("kilo_solicitada", { precision: 10, scale: 2 }),
  unidade: integer("unidade"),
  qtdePedido: integer("qtde_pedido"),
  qtdeEstoque: integer("qtde_estoque"),
  qtdePctSolicitada: integer("qtde_pct_solicitada"),
  pesoMedioTara: decimal("peso_medio_tara", { precision: 10, scale: 2 }),
  // Status (cadeia de aprovação)
  statusPedido: text("status_pedido"),
  statusEntrega: statusExpedicaoEnum("status_entrega").default("pendente"),
  statusFinanceiro: statusFinanceiroEnum("status_financeiro").default("pendente_aprovacao"),
  statusNota: statusNotaEnum("status_nota").default("pendente_emissao"),
  statusMaterial: text("status_material"),
  // Logística
  galpao: text("galpao"),
  rota: text("rota"),
  prioridade: text("prioridade"),
  periodicidade: text("periodicidade"),
  notaFiscal: text("nota_fiscal"),
  dataEmissaoNota: timestamp("data_emissao_nota"),
  dataEntrega: timestamp("data_entrega"),
  // Observações
  observacaoEscritorio: text("observacao_escritorio"),
  observacaoGalpao: text("observacao_galpao"),
  usuarioId: varchar("usuario_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExpedicaoSchema = createInsertSchema(expedicoes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExpedicao = z.infer<typeof insertExpedicaoSchema>;
export type Expedicao = typeof expedicoes.$inferSelect;

// ==================== PRODUÇÃO DIÁRIA (substitui folha papel) ====================

export const statusProducaoDiariaEnum = pgEnum("status_producao_diaria", [
  "completa",
  "incompleta",
]);

export const producaoDiaria = pgTable("producao_diaria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  data: timestamp("data").notNull(),
  nomeDupla: text("nome_dupla").notNull(), // ex: "GLINS/KAYAN", "EDISON/LUI"
  sala: text("sala").notNull(), // ex: "O4", "O5", "COBERTÓRIO"
  material: text("material").notNull(), // ex: "BR CASAL", "C2 RVA", "KING"
  horarioInicio: text("horario_inicio").notNull(), // ex: "08:40"
  horarioFim: text("horario_fim"), // ex: "10:55" — null se incompleta
  status: statusProducaoDiariaEnum("status").default("completa"),
  assinatura: text("assinatura"), // nome de quem assina
  encarregado: text("encarregado"), // nome do encarregado que valida
  observacao: text("observacao"),
  operadorId: varchar("operador_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProducaoDiariaSchema = createInsertSchema(producaoDiaria).omit({ id: true, createdAt: true });
export type InsertProducaoDiaria = z.infer<typeof insertProducaoDiariaSchema>;
export type ProducaoDiaria = typeof producaoDiaria.$inferSelect;

// ==================== PERMISSÕES ====================

export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  resource: text("resource").notNull(), // href do menu: /coleta, /financeiro, etc.
  granted: boolean("granted").default(true),
  grantedBy: varchar("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export type Permission = typeof permissions.$inferSelect;

// ==================== SOLICITAÇÕES DE ACESSO ====================

export const statusSolicitacaoEnum = pgEnum("status_solicitacao", [
  "pendente",
  "aprovado",
  "negado",
]);

export const accessRequests = pgTable("access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  resource: text("resource").notNull(),
  motivo: text("motivo").notNull(),
  status: statusSolicitacaoEnum("status").default("pendente"),
  respondedBy: varchar("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  motivoResposta: text("motivo_resposta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AccessRequest = typeof accessRequests.$inferSelect;

// ==================== LOG DE AUDITORIA ====================

export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  userName: text("user_name"),
  action: text("action").notNull(), // login, logout, permission_grant, access_request, etc.
  resource: text("resource"),
  details: text("details"), // JSON stringified
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuditLog = typeof auditLog.$inferSelect;

// ==================== SESSÕES ATIVAS ====================

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});
