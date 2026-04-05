import type { Express, Request, Response } from "express";

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

let nextColetaId = 6;
let nextColetaNumero = 250;
let nextSeparacaoId = 12;

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

  // ==================== HEALTH ====================
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
