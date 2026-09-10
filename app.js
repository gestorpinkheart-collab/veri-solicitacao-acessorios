const DATASETS = {
  appMeta: {
    version: "2026.09.04.3",
    rows: [],
  },
  cadastro: {
    version: "prg-cadastro-2026-06-03",
    rows: window.CADASTRO_REAL_DATA || [],
  },
  separacaoProdutos: {
    version: "separacao-produtos-2026-07-31",
    rows: window.SEPARACAO_PRODUTOS_REAL_DATA || [],
  },
  iqSemiacabado: {
    version: "prg-iq-semiacabado-2026-06-03",
    rows: window.IQ_SEMIACABADO_REAL_DATA || [],
  },
  tratamento: {
    version: "prg-tratamento-superficie-2026-06-03",
    rows: window.TRATAMENTO_SUPERFICIE_REAL_DATA || [],
  },
  preElos: {
    version: "pre-elos-conta-corrente-2026-07-12",
    rows: window.PRE_ELOS_REAL_DATA || [],
  },
  galvanoplastia: {
    version: "galvanoplastia-2026-06-22",
    rows: window.GALVANOPLASTIA_REAL_DATA || [],
  },
  posBanho: {
    version: "prg-pos-banho-2026-06-04",
    rows: window.POS_BANHO_REAL_DATA || [],
  },
  retrabalho: {
    version: "galvano-retrabalho-2026-07-27",
    rows: window.GALVANO_RETRABALHO_REAL_DATA || [],
  },
  produtosConta: {
    version: "produtos-conta-corrente-2026-07-22",
    rows: [],
  },
  iqProdutosConta: {
    version: "iq-produtos-conta-corrente-2026-08-06",
    rows: [],
  },
  tratamentoConta: {
    version: "tratamento-conta-corrente-2026-07-22",
    rows: [],
  },
  posBanhoConta: {
    version: "pos-banho-conta-corrente-2026-07-22",
    rows: [],
  },
  currentAccountClosings: {
    version: "conta-corrente-fechamentos-2026-07-23",
    rows: [],
  },
  ecoat: {
    version: "ecoat-conta-corrente-2026-07-12",
    rows: window.ECOAT_REAL_DATA || [],
  },
  ecoatProducao: {
    version: "ecoat-producao-2026-07-28",
    rows: window.ECOAT_PRODUCAO_REAL_DATA || [],
  },
  etiquetagem: {
    version: "prg-etiquetagem-2026-06-04",
    rows: window.ETIQUETAGEM_REAL_DATA || [],
  },
  etiquetagemConta: {
    version: "etiquetagem-conta-corrente-2026-07-13",
    rows: window.ETIQUETAGEM_CONTA_REAL_DATA || [],
  },
  colagemConta: {
    version: "colagem-conta-corrente-2026-07-24-carga-inicial",
    rows: window.COLAGEM_CONTA_REAL_DATA || [],
  },
  colagem: {
    version: "pgr-colagem-2026-06-04",
    rows: window.COLAGEM_REAL_DATA || [],
  },
  absenteismo: {
    version: "absenteismo-2026-06-17",
    rows: window.ABSENTEISMO_REAL_DATA || [],
  },
  colaboradores: {
    version: "colaboradores-2026-06-18",
    rows: window.COLABORADORES_REAL_DATA || [],
  },
  custosSetores: {
    version: "custos-setores-2026-06-26",
    rows: window.CUSTOS_SETORES_REAL_DATA || [],
  },
  prestadoresServicos: {
    version: "prestadores-servicos-2026-07-01",
    rows: window.PRESTADORES_SERVICOS_REAL_DATA || [],
  },
  terceirosGalvano: {
    version: "terceiros-galvano-2026-09-02",
    rows: window.TERCEIROS_GALVANO_REAL_DATA || [],
  },
  operationalFlow: {
    version: "fluxo-operacional-2026-07-07",
    rows: [],
  },
  weeklyClosings: {
    version: "fechamento-semanal-2026-08-30",
    rows: window.WEEKLY_CLOSINGS_REAL_DATA || [],
  },
};

const TERCEIROS_GALVANO_SERVICE_PRICES = {
  ACESSORIOS: 0.02,
  ANEL: 0.023,
  ARTICULADO: 0.023,
  "ENGARDENAÇÃO": 0.023,
  ENGARDENACAO: 0.023,
  PINGENTE: 0.023,
  TARRAXA: 0.041,
  "TARRAXA 1": 0.018,
};

const TERCEIROS_GALVANO_SLA_DAYS = {
  ACESSORIOS: 4,
  ANEL: 4,
  ARTICULADO: 4,
  "ENGARDENAÇÃO": 4,
  ENGARDENACAO: 4,
  PINGENTE: 4,
  TARRAXA: 4,
  "TARRAXA 1": 3,
};

function normalizeTerceirosGalvanoProvider(value) {
  const text = String(value || "").trim().toUpperCase();
  if (text.includes("JOSIANE")) return "Josiane";
  if (text.includes("JOSEANA")) return "Joseana";
  if (text.includes("TAMIRES")) return "Tamires";
  if (text.includes("LUANA")) return "Luana";
  return String(value || "").trim();
}

function normalizeTerceirosGalvanoService(value) {
  const text = String(value || "").trim().toUpperCase();
  if (text.includes("ENGARDENA")) return "ENGARDENAÇÃO";
  return text;
}

function normalizeTerceirosGalvanoBath(value) {
  const text = String(value || "").trim().toUpperCase();
  if (text.includes("RODIO") || text.includes("RÓDIO")) return "RÓDIO";
  if (text.includes("OURO")) return "OURO";
  return String(value || "").trim();
}

function terceirosGalvanoLeadTime(start, end) {
  const startKey = businessDateKey(start);
  const endKey = businessDateKey(end);
  if (!startKey || !endKey) return "";
  const startDate = new Date(`${startKey}T12:00:00`);
  const endDate = new Date(`${endKey}T12:00:00`);
  return Math.round((endDate - startDate) / 86400000);
}

function addDaysToBusinessDate(value, days) {
  const key = businessDateKey(value);
  if (!key) return "";
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + numberValue(days));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function simpleHash(value) {
  return String(value || "").split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function terceirosGalvanoOrderNumber(row, data) {
  if (row.osNumero) return row.osNumero;
  const year = (businessDateKey(data) || localDateKey()).slice(0, 4);
  const source = `${row.id || ""}|${data || ""}|${row.prestador || ""}|${row.codigo || ""}|${row.qtd || ""}|${row.pesoInicial || ""}`;
  const suffix = String(Math.abs(simpleHash(source)) % 100000).padStart(5, "0");
  return `SE-GAL-${year}-${suffix}`;
}

function terceirosGalvanoExpectedReturn(data, tipoServico, explicitDate = "") {
  const informed = businessDateKey(explicitDate);
  if (informed) return informed;
  const normalizedService = normalizeTerceirosGalvanoService(tipoServico);
  return addDaysToBusinessDate(data, TERCEIROS_GALVANO_SLA_DAYS[normalizedService] || 4);
}

function terceirosGalvanoStatus(dataPrevista, dataRetorno) {
  if (businessDateKey(dataRetorno)) return "Concluído";
  const expected = businessDateKey(dataPrevista);
  if (expected && expected < localDateKey()) return "Atrasado";
  return "Em andamento";
}

function terceirosGalvanoTarrachaWeight(size, quantity) {
  const factor = { P: 0.01, M: 0.15, G: 0.23 }[String(size || "").toUpperCase()] || 0;
  return factor * numberValue(quantity);
}

const PROCESS_CONFIGS = {
  cadastro: {
    id: "cadastro",
    name: "Cadastro",
    hidden: true,
    archived: true,
    source: "Prg. Cadastro.xlsx",
    sheetName: "Cadastro - 1",
    restoreLabel: "Restaurar dados Cadastro",
    exportName: "cadastro-operacional.csv",
    totalLabel: "Total de peças cadastradas",
    totalKey: "qtdServicos",
    defaultValues: { custoMdoDia: 125.11 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "listaTecnica", label: "Lista Técnica Gerada", type: "number", step: "1" },
      { key: "ordemProdução", label: "Ordem Produção Gerada", type: "number", step: "1" },
      { key: "sku", label: "SKU Gerada", type: "number", step: "1" },
      { key: "colaboradores", label: "Qtd. Colaboradores", type: "number", step: "1", required: true },
      { key: "tipoServico", label: "Tipo Serviço", type: "select", options: ["", "Banho", "Castroagem", "Envio p/ montagem", "Revisão de Semiacabado"] },
      { key: "meta", label: "Meta", type: "number", step: "1" },
      { key: "custoMdoDia", label: "Média Custo MDO/Dia", type: "number", step: "0.01" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "listaTecnica", label: "Lista Técnica Gerada", numeric: true },
      { key: "ordemProdução", label: "Ordem Produção Gerada", numeric: true },
      { key: "sku", label: "SKU Gerada", numeric: true },
      { key: "qtdServicos", label: "Qtd. serviços cadastrados", numeric: true },
      { key: "colaboradores", label: "Qtd. Colaboradores", numeric: true },
      { key: "produçãoColaborador", label: "Produção Colaborador", numeric: true, decimals: 1 },
      { key: "tipoServico", label: "Tipo Serviço" },
      { key: "meta", label: "Meta", numeric: true },
      { key: "percentualMeta", label: "% Meta", percent: true },
      { key: "produçãoHora", label: "Produção/H", numeric: true, decimals: 1 },
      { key: "custoMdoDia", label: "Média Custo MDO/Dia", currency: true },
      { key: "custoDiaTrabalhado", label: "Custo MDO dia trabalhado", currency: true },
      { key: "custoProdução", label: "Custo/Produção", currency: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const qtdServicos = numberValue(row.listaTecnica) + numberValue(row.ordemProdução) + numberValue(row.sku);
      return {
        ...calculateCommon(row, { total: qtdServicos }),
        qtdServicos,
      };
    },
  },
  separacaoProdutos: {
    id: "separacaoProdutos",
    name: "Separação/Produtos",
    source: "Separação Produtos.xlsx",
    sheetName: "Controle Diário",
    restoreLabel: "Restaurar dados Separação/Produtos",
    exportName: "separacao-produtos-operacional.csv",
    totalLabel: "Total de peças separadas",
    totalKey: "qtdPecas",
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdPecas", label: "Qtd. Peças", type: "number", step: "1", required: true },
      { key: "qtdTags", label: "Qtd. Tags", type: "number", step: "1" },
      { key: "colaboradores", label: "Qtd. Colaboradores", type: "number", step: "1", required: true },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "ano", label: "Ano", numeric: true },
      { key: "qtdPecas", label: "Qtd. Peças", numeric: true },
      { key: "qtdTags", label: "Qtd. Tags", numeric: true },
      { key: "colaboradores", label: "Qtd. Colaboradores", numeric: true },
      { key: "produçãoColaborador", label: "Produção/Colaborador", numeric: true, decimals: 1 },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const qtdPecas = numberValue(row.qtdPecas || row.qtdPeças);
      const qtdTags = numberValue(row.qtdTags);
      return {
        ...calculateCommon(row, { total: qtdTags }),
        qtdPecas,
        qtdTags,
        ano: numberValue(row.ano) || Number(String(row.data || "").slice(0, 4)) || "",
      };
    },
  },
  iqSemiacabado: {
    id: "iqSemiacabado",
    name: "IQ Produtos",
    source: "Prg. IQ Semiacabado.xlsx",
    sheetName: "IQ Produtos - 3",
    restoreLabel: "Restaurar dados IQ",
    exportName: "iq-semiacabado-operacional.csv",
    totalLabel: "Total de peças analisadas/separadas",
    totalKey: "qtdProduzida",
    defaultValues: { meta: 5800, custoMdoDia: 324 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdProduzida", label: "Qtd. produzida (peças)", type: "number", step: "1" },
      { key: "qtdTags", label: "Qtd. Tags", type: "number", step: "1", required: true },
      { key: "colaboradores", label: "Qtd. Colaboradores", type: "number", step: "1", required: true },
      { key: "meta", label: "Meta", type: "number", step: "1" },
      { key: "custoMdoDia", label: "Custo MDO/Dia", type: "number", step: "0.01" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "qtdProduzida", label: "Qtd. produzida (peças)", numeric: true },
      { key: "qtdTags", label: "Qtd. Tags", numeric: true },
      { key: "colaboradores", label: "Qtd. Colaboradores", numeric: true },
      { key: "produçãoColaborador", label: "Produção Colaborador", numeric: true, decimals: 1 },
      { key: "meta", label: "Meta", numeric: true },
      { key: "percentualMeta", label: "% Meta", percent: true },
      { key: "produçãoHora", label: "Produção/H", numeric: true, decimals: 1 },
      { key: "custoMdoDia", label: "Custo MDO/Dia", currency: true },
      { key: "custoDiaTrabalhado", label: "Custo MDO dia trabalhado", currency: true },
      { key: "custoProdução", label: "Custo/Produção", currency: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      return calculateCommon(row, { total: numberValue(row.qtdTags) });
    },
  },
  tratamento: {
    id: "tratamento",
    name: "Tratamento de Superfície",
    source: "Prg. TS.xlsx",
    sheetName: "Tratamento de Superfície - 4",
    restoreLabel: "Restaurar dados TS",
    exportName: "tratamento-superficie-operacional.csv",
    totalLabel: "Total de peças",
    totalKey: "qtdPeças",
    defaultValues: { colaboradores: 1, custoMdoDia: 145.51 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdPeças", label: "Qtd. de Peças", type: "number", step: "1" },
      { key: "qtdTags", label: "Qtd. Tags", type: "number", step: "1", required: true },
      { key: "qtdGramas", label: "Qtd. Grama (g)", type: "number", step: "0.01" },
      { key: "tipoServico", label: "Tipo do Serviço", type: "select", options: ["", "Limpeza", "Turbopolimento", "Lixa", "Outro"] },
      { key: "colaboradores", label: "Qtd. Colaborador", type: "number", step: "1", required: true },
      { key: "custoMdoDia", label: "Média Custo MDO/Dia", type: "number", step: "0.01" },
      { key: "meta", label: "Meta", type: "number", step: "1" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "qtdPeças", label: "Qtd. de Peças", numeric: true },
      { key: "qtdTags", label: "Qtd. Tags", numeric: true },
      { key: "qtdGramas", label: "Qtd. Grama (g)", numeric: true, decimals: 2 },
      { key: "tipoServico", label: "Tipo do Serviço" },
      { key: "colaboradores", label: "Qtd. Colaborador", numeric: true },
      { key: "produçãoHora", label: "Produção por hora/homem", numeric: true, decimals: 1 },
      { key: "custoMdoDia", label: "Média Custo MDO/Dia", currency: true },
      { key: "custoDiaTrabalhado", label: "Custo MDO dia trabalhado", currency: true },
      { key: "custoProdução", label: "Custo/Produção", currency: true },
      { key: "meta", label: "Meta", numeric: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      return calculateCommon(row, { total: numberValue(row.qtdTags) });
    },
  },
  produtosConta: {
    id: "produtosConta",
    name: "Separação/Produto",
    source: "Conta corrente operacional de Separação/Produto",
    sheetName: "Separação/Produto CC",
    restoreLabel: "Restaurar conta corrente Separação/Produto",
    exportName: "separacao-produto-conta-corrente.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    hidden: true,
    operationalOnly: true,
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "hora", label: "Hora", type: "time" },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada do Almoxarifado", "Liberado para Tratamento de Superfície", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "hora", label: "Hora" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsSaida", label: "Saída", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada do Almoxarifado", "Entrada de Produtos", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsSaida = ["Liberado para Tratamento de Superfície", "Ajuste de Saída"].includes(tipo) ? qtdTags : 0;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
      };
    },
  },
  iqProdutosConta: {
    id: "iqProdutosConta",
    name: "IQ Produtos",
    source: "Conta corrente operacional de IQ Produtos",
    sheetName: "IQ Produtos CC",
    restoreLabel: "Restaurar conta corrente IQ Produtos",
    exportName: "iq-produtos-conta-corrente.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    hidden: true,
    operationalOnly: true,
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "hora", label: "Hora", type: "time" },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada de Tratamento de Superfície", "Liberado para Pré-Elos", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "hora", label: "Hora" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsSaida", label: "Saída", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada de Tratamento de Superfície", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsSaida = ["Liberado para Pré-Elos", "Ajuste de Saída"].includes(tipo) ? qtdTags : 0;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
      };
    },
  },
  tratamentoConta: {
    id: "tratamentoConta",
    name: "Tratamento de Superfície",
    source: "Conta corrente operacional de Tratamento de Superfície",
    sheetName: "Tratamento CC",
    restoreLabel: "Restaurar conta corrente Tratamento",
    exportName: "tratamento-conta-corrente.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    hidden: true,
    operationalOnly: true,
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "hora", label: "Hora", type: "time" },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada de Separação/Produto", "Liberado para Pré-Elos", "Liberado para IQ Produtos", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "hora", label: "Hora" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsSaida", label: "Saída", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada de Separação/Produto", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsSaida = ["Liberado para Pré-Elos", "Liberado para IQ Produtos", "Ajuste de Saída"].includes(tipo) ? qtdTags : 0;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
      };
    },
  },
  preElos: {
    id: "preElos",
    name: "Pré-Elos",
    source: "Conta corrente operacional de Pré-Elos",
    sheetName: "Pré-Elos",
    restoreLabel: "Restaurar dados Pré-Elos",
    exportName: "pre-elos-operacional.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada do IQ Produtos", "Liberado para Pós-Banho", "Liberado para E-coat", "Enviado para Terceiro", "Retorno de Terceiro", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "terceiro", label: "Fornecedor/serviço terceiro (se houver)", type: "text", help: "Use somente quando o movimento envolver envio ou retorno de terceiro." },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsParaPosBanho", label: "Saída Pós-Banho", numeric: true },
      { key: "tagsParaEcoat", label: "Saída E-coat", numeric: true },
      { key: "tagsEnviadasTerceiro", label: "Enviado terceiro", numeric: true },
      { key: "tagsRetornoTerceiro", label: "Retorno terceiro", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "saldoTerceiroTags", label: "Saldo em terceiro", numeric: true },
      { key: "terceiro", label: "Terceiro" },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada do IQ Produtos", "Entrada do Tratamento", "Retorno de Terceiro", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsParaPosBanho = ["Liberado para Pós-Banho", "Liberado para Galvanoplastia"].includes(tipo) ? qtdTags : 0;
      const tagsParaEcoat = tipo === "Liberado para E-coat" ? qtdTags : 0;
      const tagsEnviadasTerceiro = tipo === "Enviado para Terceiro" ? qtdTags : 0;
      const tagsRetornoTerceiro = tipo === "Retorno de Terceiro" ? qtdTags : 0;
      const tagsAjusteSaida = tipo === "Ajuste de Saída" ? qtdTags : 0;
      const tagsSaida = tagsParaPosBanho + tagsParaEcoat + tagsEnviadasTerceiro + tagsAjusteSaida;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsParaPosBanho,
        tagsParaEcoat,
        tagsEnviadasTerceiro,
        tagsRetornoTerceiro,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
        terceiroDeltaTags: tagsEnviadasTerceiro - tagsRetornoTerceiro,
      };
    },
  },
  galvanoplastia: {
    id: "galvanoplastia",
    name: "Galvanoplastia",
    source: "Prg. Galvanoplastia.xlsx",
    sheetName: "Galvanoplastia - 5",
    restoreLabel: "Restaurar dados Galvano",
    exportName: "galvanoplastia-operacional.csv",
    totalLabel: "Total Au Quebec + E-coat + Rh (g)",
    totalKey: "kgTotal",
    defaultValues: { colaboradores: 7, milesimo: 2, mediaCustoMdoDia: 1373.75, meta: 20000 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdPeças", label: "Qtd. Peças", type: "number", step: "1" },
      { key: "qtdTags", label: "Qtd. Tags", type: "number", step: "1", required: true },
      { key: "colaboradores", label: "Total Colaborador", type: "number", step: "1", required: true },
      { key: "ouroQuebec", label: "Banho Ouro Quebec (g)", type: "number", step: "0.01" },
      { key: "rodio", label: "Banho Ródio (g)", type: "number", step: "0.01" },
      { key: "cataforetico", label: "Banho E-coat (g)", type: "number", step: "0.01" },
      { key: "acessoriosGramas", label: "Acessórios (g)", type: "number", step: "0.01" },
      { key: "acessoriosPecas", label: "Acessórios Qtd. Peças", type: "number", step: "1" },
      { key: "milesimo", label: "Milésimo", type: "number", step: "0.5" },
      { key: "mediaCustoMdoDia", label: "Média Custo MDO/Dia", type: "number", step: "0.01" },
      { key: "meta", label: "Meta", type: "number", step: "1" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "qtdPeças", label: "Qtd. Peças", numeric: true },
      { key: "qtdTags", label: "Qtd. Tags", numeric: true },
      { key: "colaboradores", label: "Total Colaborador", numeric: true },
      { key: "produçãoColaborador", label: "Produção/Colaborador", numeric: true, decimals: 2 },
      { key: "ouroQuebec", label: "Banho Ouro Quebec (g)", numeric: true, decimals: 2 },
      { key: "rodio", label: "Banho Ródio (g)", numeric: true, decimals: 2 },
      { key: "cataforetico", label: "Banho E-coat (g)", numeric: true, decimals: 2 },
      { key: "kgTotal", label: "Total Au Quebec + E-coat + Rh (g)", numeric: true, decimals: 2 },
      { key: "acessoriosGramas", label: "Acessórios (g)", numeric: true, decimals: 2 },
      { key: "acessoriosPecas", label: "Acessórios Qtd. Peças", numeric: true },
      { key: "milesimo", label: "Milésimo", numeric: true, decimals: 1 },
      { key: "formulaMm", label: "Fórmula mm", numeric: true, decimals: 4 },
      { key: "mlsEfetiva", label: "MLS Efetiva", percent: true },
      { key: "custoCataforetico", label: "Custo Banho E-coat", currency: true },
      { key: "custoOuro", label: "Custo Banho Padrão Ouro", currency: true },
      { key: "custoRodio", label: "Custo Banho Ródio", currency: true },
      { key: "custoPaladio", label: "Custo Banho Paládio", currency: true },
      { key: "custoTotalMetais", label: "Custo Total Metais (R$)", currency: true },
      { key: "mediaCustoMdoDia", label: "Média Custo MDO/Dia", currency: true },
      { key: "custoTotalMdo", label: "Custo Total + MDO", currency: true },
      { key: "meta", label: "Meta", numeric: true },
      { key: "percentualMeta", label: "% na Meta", percent: true },
      { key: "gramasHora", label: "g/h", numeric: true, decimals: 1 },
      { key: "custoHora", label: "Custo/h", currency: true },
      { key: "custoGrama", label: "Custo/g", currency: true },
      { key: "custoBanhoPeca", label: "Custo do Banho por Peça", currency: true },
      { key: "gramasPorPeca", label: "g por peça", numeric: true, decimals: 4 },
      { key: "custoMdoPorGrama", label: "Custo MDO por g", currency: true },
      { key: "percentualMdoTotal", label: "% MDO no Total", percent: true },
      { key: "produtividadeHoraHomem", label: "Produtividade Hora/Homem", numeric: true, decimals: 3 },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const ouroQuebec = numberValue(row.ouroQuebec);
      const rodio = numberValue(row.rodio);
      const cataforetico = numberValue(row.cataforetico);
      const kgTotal = ouroQuebec + rodio + cataforetico;
      const colaboradores = numberValue(row.colaboradores);
      const qtdPeças = numberValue(row.qtdPeças);
      const milesimo = numberValue(row.milesimo);
      const formulaMm = milesimo ? milesimo / 1000 : 0;
      const mlsEfetiva = calculateMlsEfetiva(milesimo);
      const custoCataforetico = cataforetico ? (cataforetico / 27.5 / 1000) * 350 : 0;
      const custoOuro = (ouroQuebec + cataforetico) * formulaMm * mlsEfetiva * 800;
      const custoRodio = (0.7 * 2500 / 1000) * rodio;
      const custoPaladio = (0.7 * 340 / 1000) * (ouroQuebec + rodio);
      const custoTotalMetais = custoCataforetico + custoOuro + custoRodio + custoPaladio;
      const mediaCustoMdoDia = numberValue(row.mediaCustoMdoDia);
      const custoTotalMdo = row.data ? custoTotalMetais + mediaCustoMdoDia : 0;
      const meta = numberValue(row.meta);
      return {
        ...row,
        ...getDateParts(row.data),
        kgTotal,
        produçãoColaborador: colaboradores ? numberValue(row.qtdTags) / colaboradores : 0,
        formulaMm,
        mlsEfetiva,
        custoCataforetico,
        custoOuro,
        custoRodio,
        custoPaladio,
        custoTotalMetais,
        custoTotalMdo,
        percentualMeta: meta ? kgTotal / meta : 0,
        gramasHora: kgTotal ? kgTotal / 7 : 0,
        custoHora: mediaCustoMdoDia / 7,
        custoGrama: kgTotal ? custoTotalMdo / kgTotal : 0,
        custoBanhoPeca: qtdPeças ? custoTotalMdo / qtdPeças : 0,
        gramasPorPeca: kgTotal ? qtdPeças / kgTotal : 0,
        custoMdoPorGrama: kgTotal ? mediaCustoMdoDia / kgTotal : 0,
        percentualMdoTotal: custoTotalMdo ? mediaCustoMdoDia / custoTotalMdo : 0,
        produtividadeHoraHomem: colaboradores ? numberValue(row.qtdTags) / (colaboradores * 7) : 0,
      };
    },
  },
  retrabalho: {
    id: "retrabalho",
    name: "Galvano Retrabalho",
    source: "Controle operacional de retrabalho da Galvanoplastia",
    sheetName: "Galvano Retrabalho",
    restoreLabel: "Restaurar dados Galvano Retrabalho",
    exportName: "galvano-retrabalho-operacional.csv",
    totalLabel: "Peso retrabalhado (g)",
    totalKey: "pesoFinal",
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "pesoFinal", label: "Peso (g)", type: "number", step: "0.01", required: true },
      { key: "qtdTags", label: "Tags (Qtd.)", type: "number", step: "1", required: true },
      { key: "qtdPeças", label: "Qtd. Peças", type: "number", step: "1" },
      { key: "tipoBanho", label: "Tipo do Banho", type: "select", options: ["", "Ouro Quebec", "Ouro E-coat", "Verniz E-Coat", "Ródio", "Ródio E-Coat", "Banho Prata"] },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoBanho", label: "Tipo do Banho" },
      { key: "pesoFinal", label: "Peso (g)", numeric: true, decimals: 2 },
      { key: "kgBanhado", label: "Kg banhado (g)", numeric: true, decimals: 2 },
      { key: "percentualReprovacao", label: "% Reprovação", percent: true },
      { key: "percentualQualidade", label: "% Qualidade", percent: true },
      { key: "qtdPeças", label: "Qtd. Peças", numeric: true },
      { key: "qtdTags", label: "Tags (Qtd.)", numeric: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const pesoFinal = numberValue(row.pesoFinal || row.peso);
      const kgBanhado = monthlyGalvanoplastiaBanhadoTotal(row.data);
      const percentualReprovacao = kgBanhado ? pesoFinal / kgBanhado : "";
      const percentualQualidade = kgBanhado ? 1 - percentualReprovacao : "";
      return {
        ...row,
        ...getDateParts(row.data),
        pesoFinal,
        qtdPeças: numberValue(row.qtdPeças || row.qtdPecas),
        qtdTags: numberValue(row.qtdTags || row.qtdTagsRetrabalhadas),
        tipoBanho: row.tipoBanho || row.tipoRetrabalho || "",
        kgBanhado,
        percentualReprovacao,
        percentualQualidade,
      };
    },
  },
  posBanho: {
    id: "posBanho",
    name: "Pós Banho",
    source: "Prg. Pós Banho.xlsx",
    sheetName: "Pos_Banho - 6",
    restoreLabel: "Restaurar dados Pós Banho",
    exportName: "pos-banho-operacional.csv",
    totalLabel: "Total de peças analisadas",
    totalKey: "qtdAnalisadas",
    defaultValues: { meta: 12727, custoMdoDia: 339.58 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdAnalisadas", label: "Qtd. Analisadas", type: "number", step: "1" },
      { key: "qtdTags", label: "Qtd. Tags", type: "number", step: "1", required: true },
      { key: "colaboradores", label: "Qtd. Colaborador", type: "number", step: "1", required: true },
      { key: "qtdApliqueRodio", label: "Qtd. Aplique de Ródio", type: "number", step: "1" },
      { key: "meta", label: "Meta", type: "number", step: "1" },
      { key: "custoMdoDia", label: "Custo MDO/Dia", type: "number", step: "0.01" },
      { key: "meta2", label: "Meta2", type: "number", step: "1" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "qtdAnalisadas", label: "Qtd. analisadas", numeric: true },
      { key: "qtdTags", label: "Qtd. Tags", numeric: true },
      { key: "qtdApliqueRodio", label: "Qtd. Aplique de Ródio", numeric: true },
      { key: "meta", label: "Meta", numeric: true },
      { key: "percentualMeta", label: "% Meta", percent: true },
      { key: "colaboradores", label: "Qtd. Colaborador", numeric: true },
      { key: "produçãoColaborador", label: "Produção Colaborador", numeric: true, decimals: 1 },
      { key: "produçãoHora", label: "Produção por hora/homem", numeric: true, decimals: 1 },
      { key: "custoMdoDia", label: "Custo MDO/Dia", currency: true },
      { key: "custoDiaTrabalhado", label: "Custo MDO dia trabalhado", currency: true },
      { key: "custoProdução", label: "Custo/Produção", currency: true },
      { key: "meta2", label: "Meta2", numeric: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const qtdAnalisadas = numberValue(row.qtdAnalisadas);
      const common = calculateCommon(row, { total: numberValue(row.qtdTags) });
      return {
        ...common,
        qtdApliqueRodio: numberValue(row.qtdApliqueRodio),
        tagsRodio: numberValue(row.tagsRodio),
        tagsQuebec: numberValue(row.tagsQuebec),
        tagsEcoat: numberValue(row.tagsEcoat),
      };
    },
  },
  posBanhoConta: {
    id: "posBanhoConta",
    name: "Pós-Banho",
    source: "Conta corrente operacional de Pós-Banho",
    sheetName: "Pós-Banho CC",
    restoreLabel: "Restaurar conta corrente Pós-Banho",
    exportName: "pos-banho-conta-corrente.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    hidden: true,
    operationalOnly: true,
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "hora", label: "Hora", type: "time" },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada do Pré-Elos", "Entrada do E-coat", "Liberado para Etiquetagem", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "hora", label: "Hora" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsLiberadasEtiquetagem", label: "Saída Etiquetagem", numeric: true },
      { key: "tagsLiberadasEcoat", label: "Saída E-coat", numeric: true },
      { key: "tagsSaida", label: "Saída total", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada do Pré-Elos", "Entrada do E-coat", "Entrada da Galvanoplastia", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsLiberadasEtiquetagem = tipo === "Liberado para Etiquetagem" ? qtdTags : 0;
      const tagsLiberadasEcoat = tipo === "Liberado para E-coat" ? qtdTags : 0;
      const tagsAjusteSaida = tipo === "Ajuste de Saída" ? qtdTags : 0;
      const tagsSaida = tagsLiberadasEtiquetagem + tagsLiberadasEcoat + tagsAjusteSaida;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsLiberadasEtiquetagem,
        tagsLiberadasEcoat,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
      };
    },
  },
  ecoat: {
    id: "ecoat",
    name: "E-coat",
    source: "Conta corrente operacional de E-coat",
    sheetName: "E-coat",
    restoreLabel: "Restaurar dados E-coat",
    exportName: "ecoat-operacional.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    hidden: true,
    operationalOnly: true,
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada do Pré-Elos", "Liberado para Pós-Banho", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsLiberadasPosBanho", label: "Liberado Pós-Banho", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada do Pré-Elos", "Entrada do Pós-Banho", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsLiberadasPosBanho = ["Liberado para Pós-Banho", "Liberado para Etiquetagem"].includes(tipo) ? qtdTags : 0;
      const tagsAjusteSaida = tipo === "Ajuste de Saída" ? qtdTags : 0;
      const tagsSaida = tagsLiberadasPosBanho + tagsAjusteSaida;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsLiberadasPosBanho,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
      };
    },
  },
  ecoatProducao: {
    id: "ecoatProducao",
    name: "E-coat",
    source: "Base de produção diária E-coat",
    sheetName: "E-coat Produção",
    restoreLabel: "Restaurar dados E-coat",
    exportName: "ecoat-producao.csv",
    totalLabel: "Total de peso (g)",
    totalKey: "pesoGramas",
    defaultValues: { colaboradores: 2, metaCestos: 10 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdPeças", label: "Qtd. Peças", type: "number", step: "1" },
      { key: "pesoGramas", label: "Qtd. Peso (g)", type: "number", step: "0.01" },
      { key: "qtdCestos", label: "Qtd. de Cestos", type: "number", step: "1" },
      { key: "qtdTags", label: "Qtd. Tags", type: "number", step: "1" },
      { key: "colaboradores", label: "Qtd. Colaboradores", type: "number", step: "1", required: true },
      { key: "metaCestos", label: "Meta de Cestos", type: "number", step: "1" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "qtdPeças", label: "Qtd. Peças", numeric: true },
      { key: "pesoGramas", label: "Qtd. Peso (g)", numeric: true, decimals: 2 },
      { key: "qtdCestos", label: "Qtd. de Cestos", numeric: true },
      { key: "qtdTags", label: "Qtd. Tags", numeric: true },
      { key: "colaboradores", label: "Qtd. Colaboradores", numeric: true },
      { key: "totalPecasMdo", label: "Total Pç/MDO", numeric: true, decimals: 1 },
      { key: "metaCestos", label: "Meta de Cestos", numeric: true },
      { key: "percentualMeta", label: "% Meta", percent: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const qtdPeças = numberValue(row.qtdPeças ?? row.qtdPecas);
      const pesoGramas = numberValue(row.pesoGramas);
      const qtdCestos = numberValue(row.qtdCestos);
      const qtdTags = numberValue(row.qtdTags);
      const colaboradores = numberValue(row.colaboradores);
      const metaCestos = numberValue(row.metaCestos) || 10;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdPecas: qtdPeças,
        pesoGramas,
        qtdCestos,
        qtdTags,
        colaboradores,
        totalPecasMdo: colaboradores ? qtdTags / colaboradores : numberValue(row.totalPecasMdo),
        produçãoColaborador: colaboradores ? qtdTags / colaboradores : 0,
        produçãoHora: colaboradores ? qtdTags / (colaboradores * 7) : 0,
        metaCestos,
        percentualMeta: metaCestos ? qtdCestos / metaCestos : 0,
      };
    },
  },
  etiquetagem: {
    id: "etiquetagem",
    name: "Etiquetagem",
    source: "Prg. Etiquetagem.xlsx",
    sheetName: "Etiquetagem - 7",
    restoreLabel: "Restaurar dados Etiquetagem",
    exportName: "etiquetagem-operacional.csv",
    totalLabel: "Total de TAGs produzidas",
    totalKey: "tagsProduzidas",
    defaultValues: { meta: 5000, custoMdoDia: 439.79 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdPeças", label: "Qtd. Peças", type: "number", step: "1" },
      { key: "tagsProduzidas", label: "Qtd. Tags Produzidas", type: "number", step: "1" },
      { key: "colaboradores", label: "Qtd. Colaboradores", type: "number", step: "1", required: true },
      { key: "meta", label: "Meta/Dia", type: "number", step: "1" },
      { key: "custoMdoDia", label: "Custo MDO/Dia", type: "number", step: "0.01" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "qtdPeças", label: "Qtd. Peças", numeric: true },
      { key: "tagsProduzidas", label: "Qtd. tags produzidas", numeric: true },
      { key: "colaboradores", label: "Qtd. Colaboradores", numeric: true },
      { key: "produçãoColaborador", label: "Produção/Colaborador", numeric: true, decimals: 1 },
      { key: "meta", label: "Meta/Dia", numeric: true },
      { key: "percentualMeta", label: "% Meta", percent: true },
      { key: "produçãoHora", label: "Produção por hora/homem", numeric: true, decimals: 1 },
      { key: "custoMdoDia", label: "Custo MDO/Dia", currency: true },
      { key: "custoDiaTrabalhado", label: "Custo MDO dia trabalhado", currency: true },
      { key: "custoProdução", label: "Custo/Produção", currency: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      return calculateCommon(row, { total: numberValue(row.tagsProduzidas) });
    },
  },
  etiquetagemConta: {
    id: "etiquetagemConta",
    name: "Etiquetagem - Conta Corrente",
    source: "Conta corrente operacional de Etiquetagem",
    sheetName: "Etiquetagem CC",
    restoreLabel: "Restaurar conta corrente Etiquetagem",
    exportName: "etiquetagem-conta-corrente.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    hidden: true,
    operationalOnly: true,
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "hora", label: "Hora", type: "time" },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada do Pós-Banho", "Liberado para Colagem", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "hora", label: "Hora" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsSaida", label: "Saída", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada do Pós-Banho", "Entrada do E-coat", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsSaida = ["Liberado para Colagem", "Ajuste de Saída"].includes(tipo) ? qtdTags : 0;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
      };
    },
  },
  colagemConta: {
    id: "colagemConta",
    name: "Serial/Colagem - Conta Corrente",
    source: "Conta corrente operacional de Serial/Colagem",
    sheetName: "Serial Colagem CC",
    restoreLabel: "Restaurar conta corrente Serial/Colagem",
    exportName: "serial-colagem-conta-corrente.csv",
    totalLabel: "Tags movimentadas",
    totalKey: "qtdTags",
    hidden: true,
    operationalOnly: true,
    currentAccountLedger: true,
    hidePreview: true,
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "hora", label: "Hora", type: "time" },
      { key: "tipoMovimento", label: "O que aconteceu com o saldo", type: "select", required: true, options: ["", "Entrada da Etiquetagem", "Tags Expedidas", "Ajuste de Entrada", "Ajuste de Saída"] },
      { key: "qtdPeças", label: "Quantidade de peças (opcional)", type: "number", step: "1" },
      { key: "qtdTags", label: "Quantidade de tags movimentadas", type: "number", step: "1", required: true },
      { key: "referencia", label: "Lote, OP ou detalhe do movimento", type: "text", help: "Campo opcional para rastrear a passagem sem interferir no saldo." },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "hora", label: "Hora" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "tipoMovimento", label: "Movimento" },
      { key: "qtdPeças", label: "Qtd. peças", numeric: true },
      { key: "qtdTags", label: "Qtd. tags", numeric: true },
      { key: "tagsEntrada", label: "Entrada", numeric: true },
      { key: "tagsExpedidas", label: "Tags Expedidas", numeric: true },
      { key: "tagsSaida", label: "Saída", numeric: true },
      { key: "saldoDisponivelTags", label: "Saldo disponível", numeric: true },
      { key: "referencia", label: "Referência" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const tipo = row.tipoMovimento || "";
      const qtdTags = numberValue(row.qtdTags);
      const qtdPeças = numberValue(row.qtdPeças);
      const tagsEntrada = ["Entrada da Etiquetagem", "Ajuste de Entrada"].includes(tipo) ? qtdTags : 0;
      const tagsExpedidas = tipo === "Tags Expedidas" ? qtdTags : 0;
      const tagsAjusteSaida = tipo === "Ajuste de Saída" ? qtdTags : 0;
      const tagsSaida = tagsExpedidas + tagsAjusteSaida;
      return {
        ...row,
        ...getDateParts(row.data),
        qtdPeças,
        qtdTags,
        referencia: row.referencia || row.origemDestino || "",
        tagsEntrada,
        tagsExpedidas,
        tagsSaida,
        saldoDeltaTags: tagsEntrada - tagsSaida,
      };
    },
  },
  colagem: {
    id: "colagem",
    name: "Colagem",
    source: "Pgr. Colagem.xlsx",
    sheetName: "Colagem - 8",
    restoreLabel: "Restaurar dados Colagem",
    exportName: "colagem-operacional.csv",
    totalLabel: "Total da Produção Serial/Colagem",
    totalKey: "tagsPreco",
    defaultValues: { meta: 5000, custoMdoDia: 319.65 },
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "qtdPeças", label: "Total de peças", type: "number", step: "1", aliases: ["Qtd. Peças", "Qtd Pecas", "Quantidade de peças", "Quantidade de pecas"] },
      { key: "tagsPreco", label: "Produção Serial/Colagem", type: "number", step: "1", aliases: ["Qtd. de Tags Preço", "Qtd. de Tags_Preço", "Qtd de Tags Preco", "Total de Tags Precificadas", "Tags Preço", "Tags Preco", "tagsPrecificadas"] },
      { key: "tagsCampinas", label: "Tags Expedidas", type: "number", step: "1", aliases: ["Tags Enviadas Campinas", "Tags Enviadas CPQ", "Tags Enviadas", "Tags Expedidas", "tagsEnviadas"] },
      { key: "colaboradores", label: "Qtd. Colaboradores", type: "number", step: "1", required: true },
      { key: "meta", label: "Meta/Dia", type: "number", step: "1" },
      { key: "custoMdoDia", label: "Média Custo MDO/Dia", type: "number", step: "0.01" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "semana", label: "Semana" },
      { key: "mes", label: "Mês" },
      { key: "qtdPeças", label: "Total de peças", numeric: true },
      { key: "tagsPreco", label: "Produção Serial/Colagem", numeric: true },
      { key: "tagsCampinas", label: "Tags Expedidas", numeric: true },
      { key: "colaboradores", label: "Qtd. Colaboradores", numeric: true },
      { key: "produçãoColaborador", label: "Produção/Colaborador", numeric: true, decimals: 1 },
      { key: "meta", label: "Meta/Dia", numeric: true },
      { key: "percentualMeta", label: "% Meta", percent: true },
      { key: "produçãoHora", label: "Produção por hora/homem", numeric: true, decimals: 1 },
      { key: "custoMdoDia", label: "Média Custo MDO/Dia", currency: true },
      { key: "custoDiaTrabalhado", label: "Custo MDO dia trabalhado", currency: true },
      { key: "custoProdução", label: "Custo/Produção", currency: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const normalizedRow = {
        ...row,
        qtdPeças: numberValue(row.qtdPeças ?? row.qtdPecas),
      };
      const common = calculateCommon(normalizedRow, { total: getRowCampinasTags(normalizedRow) });
      const meta = numberValue(row.meta);
      return {
        ...common,
        percentualMeta: meta ? numberValue(row.tagsCampinas) / meta : 0,
      };
    },
  },
  absenteismo: {
    id: "absenteismo",
    name: "Absenteísmo",
    source: "Absenteísmo.xlsx",
    sheetName: "Absenteísmo",
    restoreLabel: "Restaurar dados Absenteísmo",
    exportName: "absenteismo-operacional.csv",
    totalLabel: "Total de ausências",
    totalKey: "ausencias",
    indicator: true,
    masterOnly: true,
    group: "Gestão",
    tone: "management",
    defaultValues: {},
    fields: [
      { key: "data", label: "Data", type: "date", required: true },
      { key: "colaborador", label: "Colaborador", type: "text", required: true, full: true },
      { key: "setor", label: "Setor", type: "text", required: true },
      { key: "tipoAusencia", label: "Tipo Ausência", type: "select", options: ["", "Injustificada", "Justificada", "Atestado", "Folga (Day off)", "Afastamento"] },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "data", label: "Data" },
      { key: "diaSemana", label: "Dia Semana" },
      { key: "mes", label: "Mês" },
      { key: "colaborador", label: "Colaborador" },
      { key: "setor", label: "Setor" },
      { key: "tipoAusencia", label: "Tipo Ausência" },
      { key: "ausencias", label: "Ausências", numeric: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const dateParts = getDateParts(row.data);
      return {
        ...row,
        diaSemana: row.diaSemana || dateParts.diaSemana,
        mes: row.mes || dateParts.mes,
        ausencias: row.tipoAusencia ? 1 : 0,
        meta: numberValue(row.meta) || 0.03,
      };
    },
  },
  colaboradores: {
    id: "colaboradores",
    name: "Colaboradores",
    source: "Base interna de pessoas",
    sheetName: "Colaboradores",
    restoreLabel: "Restaurar base de colaboradores",
    exportName: "colaboradores.csv",
    totalLabel: "Colaboradores ativos",
    totalKey: "ativo",
    indicator: true,
    masterOnly: true,
    group: "Gestão",
    tone: "management",
    defaultValues: { status: "Ativo" },
    fields: [
      { key: "nomeCompleto", label: "Nome Completo", type: "text", required: true, full: true },
      { key: "setor", label: "Setor Atual", type: "text", required: true },
      { key: "setorPrimario", label: "Setor primário", type: "select", options: ["", "Produtos", "Galvanoplastia", "Etiquetagem", "Serial/Colagem", "Fundição", "Gestão Geral", "Manutenção/Conservação", "Produção"] },
      { key: "setorSecundario", label: "Setor secundário / subsetor", type: "select", options: ["", "Separação/Produtos", "IQ Produtos", "Tratamento de Superfície", "Pré-Elos", "Galvanoplastia", "Galvano Retrabalho", "E-coat", "Pós Banho", "Etiquetagem", "Colagem"] },
      { key: "setorAnterior", label: "Setor Anterior/Remanejamento", type: "text" },
      { key: "salarioMensal", label: "Salário mensal (R$)", type: "number", step: "0.01" },
      { key: "admissao", label: "Admissão", type: "date", required: true },
      { key: "status", label: "Status", type: "select", options: ["Ativo", "Demitido", "Inativo"] },
      { key: "dataInativacao", label: "Data Inativação", type: "date" },
      { key: "motivoInativacao", label: "Motivo Inativação", type: "text", full: true },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "nomeCompleto", label: "Nome Completo" },
      { key: "setor", label: "Setor Atual" },
      { key: "setorPrimario", label: "Setor primário" },
      { key: "setorSecundario", label: "Setor secundário" },
      { key: "setorAnterior", label: "Setor Anterior" },
      { key: "salarioMensal", label: "Salário mensal", currency: true },
      { key: "admissao", label: "Admissão" },
      { key: "tempoCasa", label: "Tempo Casa" },
      { key: "status", label: "Status" },
      { key: "dataInativacao", label: "Data Inativação" },
      { key: "motivoInativacao", label: "Motivo Inativação" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "" },
    ],
    calculate(row) {
      const status = row.status || "Ativo";
      return {
        ...row,
        setorPrimario: canonicalSectorName(row.setorPrimario || row.setor),
        setorSecundario: row.setorSecundario || row.subsetor || "",
        salarioMensal: numberValue(row.salarioMensal),
        status,
        ativo: status === "Ativo" ? 1 : 0,
        tempoCasa: formatTenure(row.admissao, row.dataInativacao),
      };
    },
  },
  experienceFeedbacks: {
    id: "experienceFeedbacks",
    name: "Feedbacks de Experiência",
    indicator: true,
    hidden: true,
    archived: true,
    hidden: true,
    masterOnly: true,
    fields: [],
    columns: [],
    calculate(row) {
      return row;
    },
  },
  custosSetores: {
    id: "custosSetores",
    name: "Custos",
    source: "Custos calculados a partir dos colaboradores ativos",
    sheetName: "Custos",
    restoreLabel: "Restaurar custos iniciais",
    exportName: "custos-setores.csv",
    totalLabel: "Custo mensal vigente",
    totalKey: "custoMensal",
    indicator: true,
    inlineIndicator: true,
    hidePreview: true,
    masterOnly: true,
    group: "Gestão",
    tone: "management",
    defaultValues: {},
    fields: [
      { key: "setor", label: "Setor", type: "select", required: true, options: [""] },
      { key: "vigenciaInicio", label: "Válido a partir de", type: "date", required: true },
      { key: "custoMensal", label: "Custo mensal do setor (R$)", type: "number", step: "0.01" },
      { key: "custoMdoDia", label: "Custo MDO por dia (R$)", type: "number", step: "0.01" },
      { key: "metaDiaria", label: "Meta diária", type: "number", step: "1" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "setor", label: "Setor" },
      { key: "vigenciaInicio", label: "Vigência" },
      { key: "colaboradores", label: "Qtd. de colaboradores", numeric: true },
      { key: "custoMensal", label: "Custo mensal", currency: true },
      { key: "custoMdoDia", label: "Custo MDO/dia", currency: true },
      { key: "metaDiaria", label: "Meta diária", numeric: true },
      { key: "custoPorColaborador", label: "Custo por colaborador", currency: true },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "Ações" },
    ],
    calculate(row) {
      const colaboradores = sectorCostCollaboratorCount(row.setor);
      const colaboradoresComSalario = sectorCostPaidCollaboratorCount(row.setor);
      const salarioTotal = sectorSalaryTotal(row.setor);
      const custoMensal = salarioTotal;
      return {
        ...row,
        colaboradores,
        colaboradoresComSalario,
        salarioTotal,
        custoMensal,
        custoMdoDia: numberValue(row.custoMdoDia),
        metaDiaria: numberValue(row.metaDiaria),
        custoPorColaborador: colaboradoresComSalario ? custoMensal / colaboradoresComSalario : 0,
      };
    },
  },
  prestadoresServicos: {
    id: "prestadoresServicos",
    name: "Prestadores de Serviços",
    source: "Fechamentos mensais de prestadores - 2026",
    sheetName: "Fechamento mensal",
    exportName: "fechamento-prestadores.csv",
    totalLabel: "Total a depositar",
    totalKey: "valorDeposito",
    indicator: true,
    inlineIndicator: true,
    masterOnly: true,
    tone: "management",
    fields: [
      { key: "competencia", label: "Competência", type: "month", required: true },
      { key: "prestador", label: "Prestador", type: "text", required: true },
      { key: "servico", label: "Serviço prestado", type: "text", required: true },
      { key: "responsavel", label: "Responsável interno", type: "text", required: true },
      { key: "setor", label: "Setor", type: "text", required: true },
      { key: "quantidade", label: "Quantidade", type: "number", step: "0.01", required: true },
      { key: "valorTotal", label: "Valor calculado (R$)", type: "number", step: "0.01", required: true },
      { key: "valorDeposito", label: "Valor a depositar (R$)", type: "number", step: "0.01", required: true },
      { key: "favorecido", label: "Favorecido", type: "text", full: true },
      { key: "banco", label: "Banco", type: "text" },
      { key: "agencia", label: "Agência", type: "text" },
      { key: "operacao", label: "Operação", type: "text" },
      { key: "conta", label: "Conta", type: "text" },
      { key: "tipoConta", label: "Tipo de conta", type: "text" },
      { key: "cpf", label: "CPF", type: "text" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "competencia", label: "Competência" },
      { key: "prestador", label: "Prestador" },
      { key: "servico", label: "Serviço" },
      { key: "responsavel", label: "Responsável" },
      { key: "setor", label: "Setor" },
      { key: "quantidade", label: "Quantidade", numeric: true },
      { key: "valorTotal", label: "Valor calculado", currency: true },
      { key: "valorDeposito", label: "A depositar", currency: true },
      { key: "custoUnitario", label: "Custo unitário", currency: true },
      { key: "actions", label: "Ações" },
    ],
    calculate(row) {
      const quantidade = numberValue(row.quantidade);
      const valorTotal = numberValue(row.valorTotal);
      const valorDeposito = numberValue(row.valorDeposito) || Math.ceil(valorTotal);
      return {
        ...row,
        quantidade,
        valorTotal,
        valorDeposito,
        custoUnitario: quantidade ? valorDeposito / quantidade : 0,
      };
    },
  },
  terceirosGalvano: {
    id: "terceirosGalvano",
    name: "Serv. Externo Galvano",
    group: "Serviços Externos",
    source: "Fornecedores Galvano (teste).xlsx",
    sheetName: "Teste Controle Forn.",
    restoreLabel: "Restaurar dados Terceiros Galvano",
    exportName: "terceiros-galvano.csv",
    totalLabel: "Valor total",
    totalKey: "valorTotal",
    indicator: true,
    inlineIndicator: true,
    tone: "management",
    fields: [
      { key: "data", label: "Data de envio", type: "date", required: true },
      { key: "prestador", label: "Prestador", type: "select", options: ["", "Joseana", "Josiane", "Luana", "Tamires"], required: true },
      { key: "banho", label: "Banho", type: "select", options: ["", "OURO", "RÓDIO"], required: true },
      { key: "codigo", label: "Código", type: "text", required: true },
      { key: "produto", label: "Produto", type: "text", full: true },
      { key: "qtd", label: "Qtd.", type: "number", step: "1", required: true },
      { key: "tamanhoTarracha", label: "Tamanho da tarracha", type: "select", options: ["N/A", "P", "M", "G"] },
      { key: "tipoServico", label: "Tipo de serviço", type: "select", options: ["", "ACESSORIOS", "ANEL", "ARTICULADO", "ENGARDENAÇÃO", "PINGENTE", "TARRAXA", "TARRAXA 1"], required: true },
      { key: "pesoInicial", label: "Peso inicial", type: "number", step: "0.01" },
      { key: "dataPrevista", label: "Previsão de retorno", type: "date", help: "Opcional. Se ficar vazio, o sistema calcula pelo SLA do serviço." },
      { key: "dataRetorno", label: "Data do retorno", type: "date" },
      { key: "pesoFinal", label: "Peso final", type: "number", step: "0.01" },
      { key: "observacoes", label: "Observações", type: "textarea", full: true },
    ],
    columns: [
      { key: "osNumero", label: "OS" },
      { key: "data", label: "Data" },
      { key: "prestador", label: "Prestador" },
      { key: "banho", label: "Banho" },
      { key: "codigo", label: "Código" },
      { key: "qtd", label: "Qtd.", numeric: true },
      { key: "tipoServico", label: "Tipo de Serviço" },
      { key: "pesoInicial", label: "Peso Inicial", numeric: true, decimals: 2 },
      { key: "dataPrevista", label: "Previsão Retorno" },
      { key: "dataRetorno", label: "Data Retorno" },
      { key: "pesoFinal", label: "Peso Final", numeric: true, decimals: 2 },
      { key: "leadTime", label: "Lead Time", numeric: true },
      { key: "status", label: "Status" },
      { key: "observacoes", label: "Observações" },
      { key: "actions", label: "Ações" },
    ],
    calculate(row) {
      const data = businessDateKey(row.data);
      const prestador = normalizeTerceirosGalvanoProvider(row.prestador);
      const banho = normalizeTerceirosGalvanoBath(row.banho);
      const tipoServico = normalizeTerceirosGalvanoService(row.tipoServico);
      const quantidade = numberValue(row.qtd);
      const valorUnitario = TERCEIROS_GALVANO_SERVICE_PRICES[tipoServico] || numberValue(row.valorUnitario);
      const valorTotal = valorUnitario * quantidade;
      const tamanhoTarracha = row.tamanhoTarracha || "N/A";
      const pesoTarrachas = terceirosGalvanoTarrachaWeight(tamanhoTarracha, quantidade);
      const dataRetorno = businessDateKey(row.dataRetorno);
      const dataPrevista = terceirosGalvanoExpectedReturn(data, tipoServico, row.dataPrevista);
      const pesoFinalInformado = row.pesoFinal !== "" && row.pesoFinal !== null && row.pesoFinal !== undefined;
      const pesoFinal = pesoFinalInformado ? numberValue(row.pesoFinal) : "";
      const leadTime = terceirosGalvanoLeadTime(data, dataRetorno);
      const pesoFiosCobre = pesoFinalInformado ? pesoFinal - pesoTarrachas - numberValue(row.pesoInicial) : "";
      const osNumero = terceirosGalvanoOrderNumber(row, data);
      return {
        ...row,
        osNumero,
        data,
        competencia: row.competencia || data.slice(0, 7),
        mes: row.mes || getDateParts(data).mes,
        prestador,
        banho,
        tipoServico,
        qtd: quantidade,
        tamanhoTarracha,
        valorUnitario,
        valorTotal,
        pesoInicial: numberValue(row.pesoInicial),
        dataPrevista,
        dataRetorno,
        pesoFinal,
        leadTime,
        pesoTarrachas,
        pesoFiosCobre,
        status: terceirosGalvanoStatus(dataPrevista, dataRetorno),
      };
    },
  },
};

PROCESS_CONFIGS.operationalFlow = {
  id: "operationalFlow",
  name: "Fluxo Operacional",
  indicator: true,
  hidden: true,
  fields: [],
  columns: [],
  calculate(row) {
    return row;
  },
};

PROCESS_CONFIGS.weeklyClosings = {
  id: "weeklyClosings",
  name: "Fechamento Semanal",
  indicator: true,
  hidden: true,
  fields: [],
  columns: [],
  calculate(row) {
    return row;
  },
};

const CURRENT_ACCOUNT_PROCESS_IDS = ["produtosConta", "iqProdutosConta", "tratamentoConta", "preElos", "posBanhoConta", "ecoat", "etiquetagemConta", "colagemConta"];
const CURRENT_ACCOUNT_ACCESS_PROCESS = {
  produtosConta: ["separacaoProdutos"],
  iqProdutosConta: ["iqSemiacabado"],
  tratamentoConta: ["tratamento"],
  preElos: ["terceirosGalvano", "preElos"],
  posBanhoConta: ["posBanho"],
  ecoat: ["ecoatProducao"],
  etiquetagemConta: ["etiquetagem"],
  colagemConta: ["colagem"],
};
const CURRENT_ACCOUNT_LABELS = {
  produtosConta: "Separação/Produto",
  iqProdutosConta: "IQ Produtos",
  tratamentoConta: "Tratamento de Superfície",
  posBanhoConta: "Pós-Banho",
  etiquetagemConta: "Etiquetagem",
  colagemConta: "Serial/Colagem",
};
const CURRENT_ACCOUNT_ACCESS_LABELS = {
  separacaoProdutos: "Separação/Produto",
  iqSemiacabado: "IQ Produtos",
  tratamento: "Tratamento de Superfície",
  terceirosGalvano: "Pré-Elos",
  preElos: "Pré-Elos",
  posBanho: "Pós-Banho",
  ecoatProducao: "E-coat",
  etiquetagem: "Etiquetagem",
  colagem: "Serial/Colagem",
};
const CURRENT_ACCOUNT_CLOSING_CONFIG = {
  id: "currentAccountClosings",
  name: "Fechamentos da Conta Corrente",
};

const processBlocks = [
  { id: "profile", name: "Meu Perfil", profile: true, group: "Conta" },
  { id: "launchMonitor", name: "Lançamentos de Produção", launchMonitor: true, group: "Gestão", tone: "management", masterOnly: true },
  { id: "productionManagement", name: "Gestão de Produção", productionManagement: true, group: "Gestão", tone: "management", masterOnly: true },
  { id: "weeklyClosing", name: "Fechamento Semanal", weeklyClosing: true, group: "Gestão", tone: "management" },
  { id: "accessManagement", name: "Gestão de Acessos", accessManagement: true, group: "Gestão", tone: "management", masterOnly: true },
  { id: "operationalFlow", name: "Fluxo Operacional", operationalFlow: true, group: "Gestão", tone: "management", masterOnly: true },
  { id: "currentAccount", name: "Conta Corrente", currentAccount: true, group: "Gestão", tone: "management" },
  { id: "diagnostics", name: "Diagnóstico do Sistema", diagnostics: true, group: "Gestão", tone: "management", masterOnly: true },
  PROCESS_CONFIGS.prestadoresServicos,
  PROCESS_CONFIGS.custosSetores,
  { id: "launch", name: "Lançamentos", launch: true, group: "Gestão", tone: "management" },
  { id: "inputLogs", name: "Logs", logs: true, group: "Gestão", tone: "management" },
  PROCESS_CONFIGS.cadastro,
  { id: "almoxarifado", name: "Almoxarifado", ready: false, group: "Pendentes" },
  PROCESS_CONFIGS.produtosConta,
  PROCESS_CONFIGS.separacaoProdutos,
  PROCESS_CONFIGS.tratamento,
  PROCESS_CONFIGS.iqSemiacabado,
  PROCESS_CONFIGS.iqProdutosConta,
  PROCESS_CONFIGS.terceirosGalvano,
  { id: "servicoExternoPosBanho", name: "Serv. Externo Pós Banho", ready: false, group: "Serviços Externos", tone: "management" },
  PROCESS_CONFIGS.galvanoplastia,
  PROCESS_CONFIGS.retrabalho,
  PROCESS_CONFIGS.ecoat,
  PROCESS_CONFIGS.ecoatProducao,
  PROCESS_CONFIGS.posBanho,
  PROCESS_CONFIGS.etiquetagem,
  PROCESS_CONFIGS.etiquetagemConta,
  PROCESS_CONFIGS.colagem,
  { id: "assistencia", name: "Assistência Técnica", ready: false, group: "Pendentes" },
  PROCESS_CONFIGS.colaboradores,
  PROCESS_CONFIGS.absenteismo,
];

const ACCESS_SECTOR_SEEDS = [
  { code: "prestadoresServicos", name: "Prestadores de Serviços", group_name: "Gestão", sort_order: 12 },
  { code: "launchMonitor", name: "Lançamentos de Produção", group_name: "Gestão", sort_order: 5 },
  { code: "productionManagement", name: "Gestão de Produção", group_name: "Gestão", sort_order: 8 },
  { code: "weeklyClosing", name: "Fechamento Semanal", group_name: "Gestão", sort_order: 10 },
  { code: "custosSetores", name: "Custos", group_name: "Gestão", sort_order: 15 },
  { code: "launch", name: "Lançamentos", group_name: "Gestão", sort_order: 20 },
  { code: "currentAccount", name: "Conta Corrente", group_name: "Gestão", sort_order: 28 },
  { code: "diagnostics", name: "Diagnóstico do Sistema", group_name: "Gestão", sort_order: 29 },
  { code: "inputLogs", name: "Logs", group_name: "Gestão", sort_order: 30 },
  { code: "cadastro", name: "Cadastro", group_name: "Produção", sort_order: 100 },
  { code: "separacaoProdutos", name: "Separação/Produtos", group_name: "Produção", sort_order: 105 },
  { code: "tratamento", name: "Tratamento de Superfície", group_name: "Produção", sort_order: 110 },
  { code: "iqSemiacabado", name: "IQ Produtos", group_name: "Produção", sort_order: 115 },
  { code: "preElos", name: "Pré-Elos", group_name: "Produção", sort_order: 120 },
  { code: "terceirosGalvano", name: "Serv. Externo Galvano", group_name: "Serviços Externos", sort_order: 400 },
  { code: "servicoExternoPosBanho", name: "Serv. Externo Pós Banho", group_name: "Serviços Externos", sort_order: 405 },
  { code: "galvanoplastia", name: "Galvanoplastia", group_name: "Produção", sort_order: 125 },
  { code: "retrabalho", name: "Retrabalhos Galvano", group_name: "Produção", sort_order: 130 },
  { code: "produtosConta", name: "Separação/Produtos Conta Corrente", group_name: "Produção", sort_order: 131 },
  { code: "ecoat", name: "E-coat", group_name: "Produção", sort_order: 135 },
  { code: "ecoatProducao", name: "E-coat", group_name: "Produção", sort_order: 136 },
  { code: "posBanho", name: "Pós Banho", group_name: "Produção", sort_order: 140 },
  { code: "etiquetagem", name: "Etiquetagem", group_name: "Produção", sort_order: 145 },
  { code: "colagem", name: "Colagem", group_name: "Produção", sort_order: 150 },
  { code: "absenteismo", name: "Absenteísmo", group_name: "Gestão", sort_order: 300 },
  { code: "colaboradores", name: "Colaboradores", group_name: "Gestão", sort_order: 310 },
];

const INTERNAL_ACCESS_SECTOR_CODES = new Set(["dashboard", "produtosConta", "iqProdutosConta", "tratamentoConta", "preElos", "posBanhoConta", "ecoat", "etiquetagemConta", "colagemConta"]);

const CANONICAL_SECTORS = [
  "Galvanoplastia",
  "Produtos",
  "Fundição",
  "Gestão Geral",
  "Etiquetagem",
  "Serial/Colagem",
  "Manutenção/Conservação",
  "Produção",
];

const SECTOR_NAME_ALIASES = {
  "galvano": "Galvanoplastia",
  "galvanoplastia[": "Galvanoplastia",
  "iq produtos": "Produtos",
  "semiacabado": "Produtos",
  "qualidade/produtos": "Produtos",
  "colagem": "Serial/Colagem",
  "colagem/serial": "Serial/Colagem",
  "cadastro": "Produção",
  "tratamento de superficie": "Produção",
  "pos banho": "Produção",
  "e-coat": "Produção",
  "ecoat": "Produção",
  "pre elos": "Produção",
  "pre-elos": "Produção",
  "montagem": "Produção",
  "conservacao/reparo": "Manutenção/Conservação",
  "operacoes (manutencao)": "Manutenção/Conservação",
  "manutencao": "Manutenção/Conservação",
  "manutencao/conservacao": "Manutenção/Conservação",
};

const PROCESS_POLICY_SECTORS = {
  cadastro: "Produção",
  separacaoProdutos: "Produtos",
  produtosConta: "Produtos",
  iqSemiacabado: "Produtos",
  iqProdutosConta: "Produtos",
  tratamento: "Galvanoplastia",
  tratamentoConta: "Galvanoplastia",
  preElos: "Galvanoplastia",
  galvanoplastia: "Galvanoplastia",
  retrabalho: "Galvanoplastia",
  posBanho: "Galvanoplastia",
  posBanhoConta: "Galvanoplastia",
  ecoat: "Galvanoplastia",
  ecoatProducao: "Galvanoplastia",
  etiquetagem: "Etiquetagem",
  etiquetagemConta: "Etiquetagem",
  colagem: "Serial/Colagem",
  colagemConta: "Serial/Colagem",
};

const COST_CENTER_PROCESS_GROUPS = {
  "Produtos": ["separacaoProdutos", "iqSemiacabado"],
  "Galvanoplastia": ["tratamento", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho"],
  "Etiquetagem": ["etiquetagem"],
  "Serial/Colagem": ["colagem"],
};

const PRODUCTION_MANAGEMENT_SUBSECTORS = [
  { processId: "separacaoProdutos", primary: "Produtos", label: "Separação/Produtos" },
  { processId: "iqSemiacabado", primary: "Produtos", label: "IQ Produtos" },
  { processId: "tratamento", primary: "Galvanoplastia", label: "Tratamento de Superfície" },
  { processId: "preElos", primary: "Galvanoplastia", label: "Pré-Elos" },
  { processId: "galvanoplastia", primary: "Galvanoplastia", label: "Banho padrão Galvano" },
  { processId: "retrabalho", primary: "Galvanoplastia", label: "Galvano Retrabalho" },
  { processId: "ecoatProducao", primary: "Galvanoplastia", label: "E-coat" },
  { processId: "posBanho", primary: "Galvanoplastia", label: "Pós Banho" },
  { processId: "etiquetagem", primary: "Etiquetagem", label: "Etiquetagem" },
  { processId: "colagem", primary: "Serial/Colagem", label: "Colagem" },
];

const DEFAULT_MASTER_ACCOUNT = {
  user: "master",
  password: "master123",
  mustChangePassword: true,
};

const state = {
  activeProcessId: "cadastro",
  launchProcessId: null,
  launchFormOpen: false,
  currentAccountFormOpen: false,
  editingRow: null,
  editReturnProcessId: "",
  dashboardView: "summary",
  masterUnlocked: false,
  masterLoginVerified: false,
  authSession: null,
  authProfile: null,
  authRoleCode: "",
  lastAuthProfileRefreshAt: 0,
  inactivityTimer: null,
  sessionExpiredByInactivity: false,
  localPrototypeMode: false,
  accessUsers: [],
  accessRoles: [],
  accessSectors: [],
  accessRows: [],
  pendingAccessRows: {},
  selectedAccessUserId: "",
  editingAccessUserId: "",
  absencePeriod: "all",
  executiveWeek: "",
  operationalFlowWeek: "",
  operationalFlowDraft: {},
  currentAccountProcessId: "preElos",
  liveSyncTimer: null,
  syncStatus: "idle",
  syncMessage: "Aguardando sincronização",
  lastSyncAt: "",
  lastSyncError: "",
  diagnosticsLoading: false,
  diagnosticsRemote: { operational: [], trusted: [], error: "", loadedAt: "" },
  suppressFormPreserveOnce: false,
  expandedSectorCostRows: new Set(),
  tablePeriods: {},
  tablePages: {},
  tablePageSize: 50,
  tableSorts: {},
  rows: {
    cadastro: loadRows("cadastro"),
    separacaoProdutos: loadRows("separacaoProdutos"),
    iqSemiacabado: loadRows("iqSemiacabado"),
    tratamento: loadRows("tratamento"),
    produtosConta: loadRows("produtosConta"),
    iqProdutosConta: loadRows("iqProdutosConta"),
    tratamentoConta: loadRows("tratamentoConta"),
    preElos: loadRows("preElos"),
    galvanoplastia: loadRows("galvanoplastia"),
    retrabalho: loadRows("retrabalho"),
    posBanho: loadRows("posBanho"),
    posBanhoConta: loadRows("posBanhoConta"),
    currentAccountClosings: loadRows("currentAccountClosings"),
    ecoat: loadRows("ecoat"),
    ecoatProducao: loadRows("ecoatProducao"),
    etiquetagem: loadRows("etiquetagem"),
    etiquetagemConta: loadRows("etiquetagemConta"),
    colagemConta: loadRows("colagemConta"),
    colagem: loadRows("colagem"),
    absenteismo: loadRows("absenteismo"),
    colaboradores: normalizeCollaboratorBase(loadRows("colaboradores")),
    experienceFeedbacks: loadRows("experienceFeedbacks"),
    custosSetores: loadRows("custosSetores"),
    prestadoresServicos: loadRows("prestadoresServicos"),
    terceirosGalvano: loadRows("terceirosGalvano"),
    operationalFlow: loadRows("operationalFlow"),
    weeklyClosings: loadRows("weeklyClosings"),
  },
  inputLogs: loadInputLogs(),
  trustedLogs: [],
  trustedLogsLoaded: false,
  supabaseSyncing: false,
  readAlertKeys: loadReadAlertKeys(),
  monthlyClosings: loadMonthlyClosings(),
  executiveTagGoal: loadExecutiveTagGoal(),
  factoryDashboardHours: loadFactoryDashboardHours(),
  tagConversionFactors: loadTagConversionFactors(),
  masterAccount: loadMasterAccount(),
  calculatedCache: {},
  monthTotalCache: {},
};

ensureSeedRows("colagemConta");
ensureSeedRows("terceirosGalvano");

if (localStorage.getItem("ph-sidebar-collapsed") === "true") {
  document.querySelector(".app-shell").classList.add("sidebar-collapsed");
}

window.PHAccess = {
  isMaster: () => state.masterUnlocked,
  actor: () => currentActorStamp(),
};

const AUTH_PROFILE_CACHE_KEY = "ph-auth-profile-cache";
const ACTIVE_PROCESS_SESSION_KEY = "ph-active-process";
const LAST_ACTIVITY_SESSION_KEY = "ph-last-activity";
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

state.rows.colaboradores = normalizeCollaboratorBase(state.rows.colaboradores);
state.rows.absenteismo = normalizeSectorReferences(state.rows.absenteismo);
state.rows.galvanoplastia = normalizeGalvanoplastiaBase(state.rows.galvanoplastia);
state.rows.colagem = normalizeColagemBase(state.rows.colagem);
state.rows.custosSetores = normalizeSectorCostBase(state.rows.custosSetores);

const form = document.querySelector("#processForm");
const formFields = document.querySelector("#formFields");
const searchInput = document.querySelector("#tableSearch");
const MONTHS = [
  ["01", "JAN"],
  ["02", "FEV"],
  ["03", "MAR"],
  ["04", "ABR"],
  ["05", "MAI"],
  ["06", "JUN"],
  ["07", "JUL"],
  ["08", "AGO"],
  ["09", "SET"],
  ["10", "OUT"],
  ["11", "NOV"],
  ["12", "DEZ"],
];
function configFor(processId = state.activeProcessId) {
  return PROCESS_CONFIGS[processId];
}

function formConfig() {
  return configFor(state.launchProcessId);
}

function isProtectedField(field) {
  const key = field.key.toLowerCase();
  return key.includes("custo") || key.startsWith("meta") || key.includes("mdo");
}

function isLaunchField(field) {
  return !field.key.toLowerCase().startsWith("meta");
}

function isRequiredLaunchInput(config, field) {
  if (!config || config.indicator) return Boolean(field.required);
  if (isProtectedField(field)) return false;
  const fields = config.fields.filter(isLaunchField);
  const collaboratorIndex = fields.findIndex((item) => item.key === "colaboradores");
  const fieldIndex = fields.findIndex((item) => item.key === field.key);
  if (fieldIndex < 0) return Boolean(field.required);
  if (collaboratorIndex >= 0) return fieldIndex <= collaboratorIndex;
  return Boolean(field.required);
}

function importableFields(config) {
  return (config?.fields || []).filter(isLaunchField);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function collaboratorOptions() {
  const registeredCollaborators = (state.rows.colaboradores || [])
    .filter(isActiveCollaborator)
    .map((row) => row.nomeCompleto);
  const accessCollaborators = (state.accessUsers || [])
    .filter((user) => String(user.status || "active") === "active")
    .map((user) => user.full_name || user.name || "")
    .filter(Boolean);
  return uniqueSorted([...registeredCollaborators, ...accessCollaborators]);
}

function sectorOptions() {
  return [...CANONICAL_SECTORS];
}

const SECTOR_COST_GROUPS = {
  "Galvanoplastia": ["galvanoplastia", "galvano"],
  "Produtos": ["produtos", "iq produtos", "semiacabado", "qualidade/produtos"],
  "Fundição": ["fundicao"],
  "Gestão Geral": ["gestao geral"],
  "Etiquetagem": ["etiquetagem"],
  "Serial/Colagem": ["serial/colagem", "colagem/serial", "colagem", "serial"],
  "Manutenção/Conservação": ["manutencao/conservacao", "manutencao", "conservacao/reparo", "operacoes (manutencao)"],
  "Produção": ["producao", "cadastro", "tratamento de superficie", "pos banho", "pre elos", "pre-elos", "e-coat", "ecoat", "montagem"],
};

function normalizedSectorName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function canonicalSectorName(value) {
  const normalized = normalizedSectorName(value);
  if (!normalized) return "";
  if (SECTOR_NAME_ALIASES[normalized]) return SECTOR_NAME_ALIASES[normalized];
  return CANONICAL_SECTORS.find((sector) => normalizedSectorName(sector) === normalized) || String(value).trim();
}

function repairMojibake(value) {
  const text = String(value || "");
  if (!/[ÃÂ]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from([...text].map((char) => char.charCodeAt(0)));
    const repaired = new TextDecoder("utf-8").decode(bytes);
    return repaired.includes("�") ? text : repaired;
  } catch {
    return text;
  }
}

function sectorCostAliases(costCenter) {
  const configured = SECTOR_COST_GROUPS[costCenter];
  return configured || [normalizedSectorName(costCenter)];
}

function sectorCostCollaboratorCount(costCenter) {
  const aliases = new Set(sectorCostAliases(costCenter).map(normalizedSectorName));
  return sectorCostCollaborators(costCenter).length;
}

function sectorCostPaidCollaboratorCount(costCenter) {
  return sectorCostCollaborators(costCenter).filter((person) => numberValue(person.salarioMensal) > 0).length;
}

function sectorCostCollaborators(costCenter) {
  const aliases = new Set(sectorCostAliases(costCenter).map(normalizedSectorName));
  return (state.rows.colaboradores || []).filter((row) => {
    return isActiveCollaborator(row) && aliases.has(normalizedSectorName(row.setor));
  }).sort((a, b) => String(a.nomeCompleto || "").localeCompare(String(b.nomeCompleto || ""), "pt-BR"));
}

function sectorSalaryTotal(costCenter) {
  return sectorCostCollaborators(costCenter).reduce((sum, person) => sum + numberValue(person.salarioMensal), 0);
}

function sectorCostExpansion(row, colspan) {
  const people = sectorCostCollaborators(row.setor);
  const list = people.map((person) => `
    <article>
      <strong>${escapeHtml(person.nomeCompleto || "-")}</strong>
      <span>${escapeHtml(canonicalSectorName(person.setor) || person.setor || "-")}</span>
      <small>Admissão: ${formatDate(person.admissao) || "-"}</small>
      <small>Salário: ${numberValue(person.salarioMensal) ? formatCurrency(person.salarioMensal) : "Não informado"}</small>
    </article>
  `).join("");
  return `
    <tr class="sector-cost-detail-row">
      <td colspan="${colspan}">
        <div class="sector-cost-detail">
          <div>
            <strong>${formatNumber(people.length)} colaboradores em ${escapeHtml(row.setor || "setor")}</strong>
            <small>Composição puxada do cadastro de colaboradores ativos.</small>
          </div>
          <div class="sector-cost-people">
            ${list || '<p class="empty-state">Nenhum colaborador ativo vinculado a este setor.</p>'}
          </div>
        </div>
      </td>
    </tr>
  `;
}

function refreshSectorCostOptions() {
  const field = PROCESS_CONFIGS.custosSetores?.fields.find((item) => item.key === "setor");
  if (!field) return;
  field.options = ["", ...sectorOptions()];
}

function processIdForPolicySector(sector) {
  const normalized = normalizedSectorName(canonicalSectorName(sector));
  return Object.entries(PROCESS_POLICY_SECTORS).find(([, name]) => normalizedSectorName(name) === normalized)?.[0] || "";
}

function policyRowsForProcess(processId) {
  const sector = PROCESS_POLICY_SECTORS[processId];
  if (!sector) return [];
  const normalizedSector = normalizedSectorName(sector);
  return (state.rows.custosSetores || []).filter((row) =>
    normalizedSectorName(canonicalSectorName(row.setor)) === normalizedSector
  );
}

function sectorPolicyFor(processId, dateValue) {
  const date = businessDateKey(dateValue) || localDateKey();
  return policyRowsForProcess(processId)
    .filter((row) => !row.vigenciaInicio || businessDateKey(row.vigenciaInicio) <= date)
    .sort((a, b) => {
      const dateOrder = businessDateKey(b.vigenciaInicio).localeCompare(businessDateKey(a.vigenciaInicio));
      return dateOrder || String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    })[0] || null;
}

function fieldDatalist(field) {
  return "";
}

function controlledFieldOptions(config, field) {
  if (field.key === "colaborador") return ["", ...collaboratorOptions()];
  if (config.id !== "custosSetores" && (field.key === "setor" || field.key === "setorAnterior")) {
    return ["", ...sectorOptions()];
  }
  return null;
}

function renderDatalist(id, values) {
  return `<datalist id="${id}">${values.map((value) => `<option value="${value}"></option>`).join("")}</datalist>`;
}

function processInitials(name) {
  return name
    .split(/\s|\/|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function processIcon(process) {
  const icons = {
    dashboard: '<svg viewBox="0 0 24 24"><path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M10 19v-5h4v5"/></svg>',
    accessManagement: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11l2 2 4-4"/></svg>',
    custosSetores: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M16 8.5c-.7-.7-1.8-1.1-3-1.1-1.7 0-3 1-3 2.3 0 3.5 6 1.5 6 5 0 1.3-1.3 2.3-3 2.3-1.2 0-2.4-.4-3.2-1.2"/><path d="M12 5.5v13"/></svg>',
    prestadoresServicos: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg>',
    terceirosGalvano: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M6 7v10a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7"/><path d="M9 4v3"/><path d="M15 4v3"/><path d="M8 13h8"/><path d="M12 10v6"/></svg>',
    launchMonitor: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-5 3 3 5-7"/><path d="M17 7h2v2"/></svg>',
    operationalFlow: '<svg viewBox="0 0 24 24"><path d="M4 6h6"/><path d="m8 3 3 3-3 3"/><path d="M14 6h3a3 3 0 0 1 3 3v2"/><path d="M20 15v2a3 3 0 0 1-3 3h-3"/><path d="m16 17-3 3 3 3"/><path d="M10 20H7a3 3 0 0 1-3-3v-2"/></svg>',
    currentAccount: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/><path d="M8 4v16"/><path d="M16 4v16"/></svg>',
    launch: '<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    inputLogs: '<svg viewBox="0 0 24 24"><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/></svg>',
    absenteismo: '<svg viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10l-1 9a4 4 0 0 1-8 0Z"/><path d="M7 7H4a4 4 0 0 0 4 4"/><path d="M17 7h3a4 4 0 0 1-4 4"/></svg>',
    colaboradores: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    cadastro: '<svg viewBox="0 0 24 24"><path d="M8 7h8"/><path d="M8 12h8"/><path d="M8 17h5"/><rect x="5" y="4" width="14" height="16" rx="2"/></svg>',
    separacaoProdutos: '<svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="M8 9h8"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>',
    iqSemiacabado: '<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v5l-4 8a4 4 0 0 0 3.6 5h4.8a4 4 0 0 0 3.6-5l-4-8V3"/><path d="M8 15h8"/></svg>',
    produtosConta: '<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v5l-4 8a4 4 0 0 0 3.6 5h4.8a4 4 0 0 0 3.6-5l-4-8V3"/><path d="M8 15h8"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/></svg>',
    tratamento: '<svg viewBox="0 0 24 24"><path d="M4 15c3-5 7-8 13-9"/><path d="M14 4l4 2-2 4"/><path d="M5 19h14"/></svg>',
    tratamentoConta: '<svg viewBox="0 0 24 24"><path d="M4 15c3-5 7-8 13-9"/><path d="M14 4l4 2-2 4"/><path d="M5 19h14"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/></svg>',
    preElos: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M7 8h4v8H7z"/><path d="M13 8h4v8h-4z"/><path d="m19 12 2 2-2 2"/><path d="m5 12-2-2 2-2"/></svg>',
    galvanoplastia: '<svg viewBox="0 0 24 24"><path d="M5 8h14"/><path d="M7 8v9a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8"/><path d="M9 5V3"/><path d="M15 5V3"/></svg>',
    posBanho: '<svg viewBox="0 0 24 24"><path d="M7 6h10"/><path d="M8 6l1 13h6l1-13"/><path d="M10 12h4"/></svg>',
    posBanhoConta: '<svg viewBox="0 0 24 24"><path d="M7 6h10"/><path d="M8 6l1 13h6l1-13"/><path d="M10 12h4"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/></svg>',
    ecoat: '<svg viewBox="0 0 24 24"><path d="M6 5h12"/><path d="M8 5v5l-2 3a5 5 0 0 0 4.2 8h3.6A5 5 0 0 0 18 13l-2-3V5"/><path d="M9 14h6"/><path d="M10 18h4"/></svg>',
    ecoatProducao: '<svg viewBox="0 0 24 24"><path d="M6 5h12"/><path d="M8 5v5l-2 3a5 5 0 0 0 4.2 8h3.6A5 5 0 0 0 18 13l-2-3V5"/><path d="M9 14h6"/><path d="M10 18h4"/></svg>',
    etiquetagem: '<svg viewBox="0 0 24 24"><path d="M4 6v6l8 8 8-8-8-8H6a2 2 0 0 0-2 2Z"/><path d="M9 8h.01"/></svg>',
    etiquetagemConta: '<svg viewBox="0 0 24 24"><path d="M4 6v6l8 8 8-8-8-8H6a2 2 0 0 0-2 2Z"/><path d="M9 8h.01"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/></svg>',
    colagem: '<svg viewBox="0 0 24 24"><path d="M8.5 12.5 6 15a4 4 0 0 0 5.7 5.7l2.5-2.5"/><path d="m15.5 11.5 2.5-2.5A4 4 0 1 0 12.3 3.3L9.8 5.8"/><path d="m9 15 6-6"/></svg>',
    colagemConta: '<svg viewBox="0 0 24 24"><path d="M8.5 12.5 6 15a4 4 0 0 0 5.7 5.7l2.5-2.5"/><path d="m15.5 11.5 2.5-2.5A4 4 0 1 0 12.3 3.3L9.8 5.8"/><path d="m9 15 6-6"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/></svg>',
  };
  if (icons[process.id]) return icons[process.id];
  return '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8"/><path d="M8 15h8"/></svg>';
}

function launchSectorIcon(id) {
  const paths = {
    cadastro: '<path d="M8 7h8"/><path d="M8 12h8"/><path d="M8 17h5"/><rect x="5" y="4" width="14" height="16" rx="2"/>',
    separacaoProdutos: '<path d="M5 5h14v14H5z"/><path d="M8 9h8"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    iqSemiacabado: '<path d="M9 3h6"/><path d="M10 3v5l-4 8a4 4 0 0 0 3.6 5h4.8a4 4 0 0 0 3.6-5l-4-8V3"/><path d="M8 15h8"/>',
    produtosConta: '<path d="M9 3h6"/><path d="M10 3v5l-4 8a4 4 0 0 0 3.6 5h4.8a4 4 0 0 0 3.6-5l-4-8V3"/><path d="M8 15h8"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/>',
    tratamento: '<path d="M4 15c3-5 7-8 13-9"/><path d="M14 4l4 2-2 4"/><path d="M5 19h14"/><path d="M8 17h1"/><path d="M12 17h1"/><path d="M16 17h1"/>',
    tratamentoConta: '<path d="M4 15c3-5 7-8 13-9"/><path d="M14 4l4 2-2 4"/><path d="M5 19h14"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/>',
    preElos: '<path d="M5 12h14"/><path d="M7 8h4v8H7z"/><path d="M13 8h4v8h-4z"/><path d="m19 12 2 2-2 2"/><path d="m5 12-2-2 2-2"/>',
    galvanoplastia: '<path d="M5 8h14"/><path d="M7 8v9a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8"/><path d="M9 5V3"/><path d="M15 5V3"/><path d="M9 14h6"/>',
    posBanho: '<path d="M7 6h10"/><path d="M8 6l1 13h6l1-13"/><path d="M10 10h4"/><path d="M10 14h4"/>',
    posBanhoConta: '<path d="M7 6h10"/><path d="M8 6l1 13h6l1-13"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/>',
    ecoat: '<path d="M6 5h12"/><path d="M8 5v5l-2 3a5 5 0 0 0 4.2 8h3.6A5 5 0 0 0 18 13l-2-3V5"/><path d="M9 14h6"/><path d="M10 18h4"/>',
    ecoatProducao: '<path d="M6 5h12"/><path d="M8 5v5l-2 3a5 5 0 0 0 4.2 8h3.6A5 5 0 0 0 18 13l-2-3V5"/><path d="M9 14h6"/><path d="M10 18h4"/>',
    etiquetagem: '<path d="M4 6v6l8 8 8-8-8-8H6a2 2 0 0 0-2 2Z"/><path d="M9 8h.01"/>',
    etiquetagemConta: '<path d="M4 6v6l8 8 8-8-8-8H6a2 2 0 0 0-2 2Z"/><path d="M9 8h.01"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/>',
    colagem: '<path d="M8.5 12.5 6 15a4 4 0 0 0 5.7 5.7l2.5-2.5"/><path d="m15.5 11.5 2.5-2.5A4 4 0 1 0 12.3 3.3L9.8 5.8"/><path d="m9 15 6-6"/>',
    colagemConta: '<path d="M8.5 12.5 6 15a4 4 0 0 0 5.7 5.7l2.5-2.5"/><path d="m15.5 11.5 2.5-2.5A4 4 0 1 0 12.3 3.3L9.8 5.8"/><path d="m9 15 6-6"/><path d="M15 15h5"/><path d="m18 12 3 3-3 3"/>',
  };
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      ${paths[id] || '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>'}
    </svg>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const BUTTON_ICON_PATHS = {
  add: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  cancel: '<path d="m18 6-12 12"/><path d="m6 6 12 12"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  clear: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
  delete: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  export: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  import: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M3 12A9 9 0 0 1 18.5 5.8"/><path d="M3 18v-5h5"/><path d="M21 6v5h-5"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
  view: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
};

const BUTTON_ICON_RULES = [
  { icon: "save", test: /^(salvar|atualizar perfil|salvar perfil|salvar altera|salvar par|salvar movimento|salvar saldo|salvar fechamento|confirmar)/i },
  { icon: "refresh", test: /^(atualizar|restaurar|sincronizar|recarregar)/i },
  { icon: "add", test: /^(novo|nova|incluir|adicionar|registrar|criar)/i },
  { icon: "edit", test: /^(editar|alterar)/i },
  { icon: "delete", test: /^(excluir|limpar|remover|apagar)/i },
  { icon: "back", test: /^(voltar|retornar)/i },
  { icon: "import", test: /^(importar|subir)/i },
  { icon: "export", test: /^(exportar|baixar|download)/i },
  { icon: "view", test: /^(visualizar|ver|consultar)/i },
  { icon: "login", test: /^(entrar|login)/i },
  { icon: "logout", test: /^(sair)/i },
  { icon: "cancel", test: /^(cancelar|fechar)/i },
  { icon: "chevronLeft", test: /^(anterior)$/i },
  { icon: "chevronRight", test: /^(próxima|proxima)$/i },
];

function buttonIconSvg(name) {
  const path = BUTTON_ICON_PATHS[name] || BUTTON_ICON_PATHS.check;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
}

function iconNameForButtonLabel(label) {
  const text = String(label || "").trim();
  return BUTTON_ICON_RULES.find((rule) => rule.test.test(text))?.icon || "";
}

function shouldSkipButtonIcon(button) {
  if (!button || button.dataset.iconEnhanced === "true") return true;
  if (button.classList.contains("icon-action")) return true;
  if (button.classList.contains("table-sort-button")) return true;
  if (button.classList.contains("sector-expand-button")) return true;
  if (button.closest(".dashboard-mode-switch")) return true;
  if (button.closest(".selected-collaborators")) return true;
  if (button.closest(".profile-menu")) return true;
  const text = (button.textContent || "").replace(/\s+/g, " ").trim();
  return !text || text.length > 48 || /^[×…⋯+\-]$/.test(text);
}

function enhanceButtonIcon(button) {
  if (shouldSkipButtonIcon(button)) return;
  const label = (button.textContent || "").replace(/\s+/g, " ").trim();
  const iconName = iconNameForButtonLabel(label);
  if (!iconName) return;
  button.dataset.iconEnhanced = "true";
  button.dataset.iconLabel = label;
  if (!button.getAttribute("aria-label")) button.setAttribute("aria-label", label);
  if (!button.getAttribute("title")) button.setAttribute("title", label);
  button.innerHTML = `<span class="button-icon">${buttonIconSvg(iconName)}</span><span class="button-label">${escapeHtml(label)}</span>`;
}

function enhanceButtonsIn(root = document) {
  root.querySelectorAll?.("button").forEach(enhanceButtonIcon);
}

function initButtonIconEnhancer() {
  enhanceButtonsIn(document);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches?.("button")) enhanceButtonIcon(node);
        enhanceButtonsIn(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function localDateKey(date = new Date()) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function businessDateKey(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return localDateKey(value);
  const text = String(value || "").trim();
  if (!text) return "";
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return localDateKey(parsed);
  return text;
}

function formatBusinessDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDate(localDateKey(value));
  const text = String(value || "").trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return formatDate(`${iso[1]}-${iso[2]}-${iso[3]}`);
  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) return `${br[1].padStart(2, "0")}/${br[2].padStart(2, "0")}/${br[3]}`;
  const key = businessDateKey(value);
  return key.includes("-") ? formatDate(key) : key;
}

function rowInputDate(row) {
  return row.importedAt || row.createdAt || row.updatedAt || "";
}

function latestProcessRow(config) {
  return [...(state.rows[config.id] || [])].sort((a, b) => {
    const aKey = businessDateKey(a.data) || rowInputDate(a) || "";
    const bKey = businessDateKey(b.data) || rowInputDate(b) || "";
    return String(bKey).localeCompare(String(aKey));
  })[0];
}

function rowActivityDate(row) {
  return row.updatedAt || row.createdAt || row.importedAt || row.syncedAt || "";
}

function launchMonitorEntries(config) {
  const rows = (state.rows[config.id] || []).map((row) => {
    const activityAt = rowActivityDate(row);
    return {
      competenceDate: businessDateKey(row.data) || businessDateKey(row.competenceDate) || localDateKey(activityAt),
      activityAt,
      source: "record",
    };
  });
  const logs = state.inputLogs
    .filter((log) => log.processId === config.id)
    .filter((log) => ["lancamento_criado", "lancamento_editado"].includes(log.type))
    .map((log) => {
      const row = log.details?.row || {};
      return {
        competenceDate: businessDateKey(row.data) || businessDateKey(row.competenceDate) || localDateKey(log.createdAt),
        activityAt: log.createdAt || "",
        source: "log",
      };
    });
  return [...rows, ...logs]
    .filter((entry) => entry.competenceDate || entry.activityAt)
    .sort((a, b) => {
      const dateCompare = String(b.competenceDate || "").localeCompare(String(a.competenceDate || ""));
      if (dateCompare) return dateCompare;
      return String(b.activityAt || "").localeCompare(String(a.activityAt || ""));
    });
}

function launchMonitorDetailLines(entry) {
  if (!entry) return ["Nenhum registro encontrado"];
  const lines = [];
  if (entry.competenceDate) lines.push(`Última data registrada: ${formatBusinessDate(entry.competenceDate)}`);
  if (entry.activityAt) lines.push(`Última gravação: ${formatDateTime(entry.activityAt)}`);
  return lines.length ? lines : ["Nenhum registro encontrado"];
}

function launchInputStatus(config) {
  const today = localDateKey();
  const entries = launchMonitorEntries(config);
  const todaysEntry = entries.find((entry) => entry.competenceDate === today);

  if (todaysEntry) {
    return {
      className: "has-current-input",
      label: "Sim - registro hoje",
      detailLines: launchMonitorDetailLines(todaysEntry),
    };
  }

  const latest = entries[0];
  if (latest) {
    return {
      className: "has-stale-input",
      label: "Não - pendente hoje",
      detailLines: launchMonitorDetailLines(latest),
    };
  }

  return {
    className: "has-no-input",
    label: "Sem histórico",
    detailLines: ["Nenhum registro encontrado"],
  };
}

function normalizeCollaboratorBase(rows) {
  const consolidated = new Map();
  (rows || []).forEach((row) => {
    const nomeCompleto = repairMojibake(row.nomeCompleto).replace(/\s+/g, " ").trim();
    if (!nomeCompleto) return;
    const normalized = {
      ...row,
      nomeCompleto,
      setor: canonicalSectorName(repairMojibake(row.setor)),
      setorPrimario: canonicalSectorName(repairMojibake(row.setorPrimario || row.setor)),
      setorSecundario: repairMojibake(row.setorSecundario || row.subsetor),
      setorAnterior: canonicalSectorName(repairMojibake(row.setorAnterior)),
      motivoInativacao: repairMojibake(row.motivoInativacao),
      observacoes: repairMojibake(row.observacoes),
    };
    const candidate = nomeCompleto === "Thamires Marques Land Graf Gomes"
      ? { ...normalized, setor: "Serial/Colagem", setorAnterior: "", observacoes: "" }
      : normalized;
    const key = normalizedSectorName(nomeCompleto);
    const current = consolidated.get(key);
    if (!current) {
      consolidated.set(key, candidate);
      return;
    }
    const currentTime = Date.parse(current.updatedAt || current.createdAt || "") || 0;
    const candidateTime = Date.parse(candidate.updatedAt || candidate.createdAt || "") || 0;
    if (candidateTime >= currentTime) consolidated.set(key, candidate);
  });
  return [...consolidated.values()];
}

function isActiveCollaborator(row) {
  return (row?.status || "Ativo") === "Ativo";
}

function normalizeSectorReferences(rows) {
  return (rows || []).map((row) => ({
    ...row,
    setor: canonicalSectorName(row.setor),
    setorAnterior: canonicalSectorName(row.setorAnterior),
  }));
}

function normalizeEtiquetagemRow(row) {
  if (!row || typeof row !== "object") return row;
  const normalized = { ...row };
  if (normalized.qtdPeças === undefined && normalized.qtdPecas !== undefined) {
    normalized.qtdPeças = normalized.qtdPecas;
  }
  delete normalized.qtdPecas;
  return normalized;
}

function normalizeColagemBase(rows) {
  return (rows || []).map((row) => {
    if (row.qtdPeças !== undefined || row.qtdPecas === undefined) return row;
    const normalized = { ...row, qtdPeças: row.qtdPecas };
    delete normalized.qtdPecas;
    return normalized;
  });
}

function applyColagemJuneJulyUpdate() {
  const updateKey = "ph-colagem-jun-jul-2026-update-v1";
  if (localStorage.getItem(updateKey) === "done") return;
  const sourceRows = normalizeColagemBase(DATASETS.colagem.rows || [])
    .filter((row) => businessDateKey(row.data) >= "2026-06-04");
  if (!sourceRows.length) return;

  const sourceDates = new Set(sourceRows.map((row) => businessDateKey(row.data)));
  const currentRows = normalizeColagemBase(state.rows.colagem || []);
  const firstExistingByDate = new Map();
  currentRows.forEach((row) => {
    const dateKey = businessDateKey(row.data);
    if (dateKey && !firstExistingByDate.has(dateKey)) firstExistingByDate.set(dateKey, row);
  });

  const untouchedRows = currentRows.filter((row) => !sourceDates.has(businessDateKey(row.data)));
  const now = new Date().toISOString();
  const mergedRows = sourceRows.map((row) => {
    const existing = firstExistingByDate.get(businessDateKey(row.data));
    return {
      ...(existing || {}),
      ...row,
      id: existing?.id || crypto.randomUUID(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
  });
  const nextRows = [...untouchedRows, ...mergedRows].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const currentSignature = JSON.stringify(currentRows.map((row) => [row.data, row.qtdPeças, row.tagsPreco, row.tagsCampinas]));
  const nextSignature = JSON.stringify(nextRows.map((row) => [row.data, row.qtdPeças, row.tagsPreco, row.tagsCampinas]));
  if (currentSignature === nextSignature) {
    localStorage.setItem(updateKey, "done");
    return;
  }
  state.rows.colagem = nextRows;
  saveRows("colagem", state.rows.colagem);
  localStorage.setItem(updateKey, "done");
}

function normalizeGalvanoplastiaBase(rows) {
  return (rows || []).map((row) => {
    const legacyMilesimo = row.milesimoCataferico;
    const milesimo = String(row.milesimo ?? "").trim() !== "" ? row.milesimo : legacyMilesimo;
    const acessoriosGramas = String(row.acessoriosGramas ?? "").trim() !== ""
      ? row.acessoriosGramas
      : row.soAcessorios;
    const normalized = {
      ...row,
      milesimo,
      acessoriosGramas,
      acessoriosPecas: row.acessoriosPecas ?? "",
    };
    delete normalized.milesimoCataferico;
    delete normalized.soAcessorios;
    return normalized;
  });
}

function normalizeSectorCostBase(rows) {
  return (rows || []).map((row) => {
    const normalized = {
      ...row,
      setor: canonicalSectorName(row.setor),
      vigenciaInicio: businessDateKey(row.vigenciaInicio || row.data) || "2026-05-01",
      processId: row.processId || "",
      custoMensal: numberValue(row.custoMensal),
      custoMdoDia: numberValue(row.custoMdoDia),
      metaDiaria: numberValue(row.metaDiaria ?? row.meta),
    };
    delete normalized.competencia;
    delete normalized.data;
    delete normalized.meta;
    return normalized;
  });
}

function ensureSectorPolicyRows(rows) {
  const normalized = normalizeSectorCostBase(rows);
  const preserved = normalized.filter((row) =>
    row.observacoes !== "Valores migrados dos formulários operacionais" || row.updatedAt
  );
  CANONICAL_SECTORS.forEach((setor) => {
    const currentPolicy = preserved.find((row) =>
      normalizedSectorName(row.setor) === normalizedSectorName(setor)
      && businessDateKey(row.vigenciaInicio) >= "2026-06-27"
    );
    if (currentPolicy) return;
    const legacy = normalized
      .filter((row) => normalizedSectorName(row.setor) === normalizedSectorName(setor))
      .sort((a, b) => businessDateKey(b.vigenciaInicio).localeCompare(businessDateKey(a.vigenciaInicio)))[0];
    const processId = Object.entries(PROCESS_POLICY_SECTORS).find(([, name]) => name === setor)?.[0] || "";
    const config = PROCESS_CONFIGS[processId];
    preserved.push({
      id: crypto.randomUUID(),
      processId,
      setor,
      vigenciaInicio: "2026-06-27",
      custoMensal: numberValue(legacy?.custoMensal),
      custoMdoDia: numberValue(config?.defaultValues?.custoMdoDia ?? config?.defaultValues?.mediaCustoMdoDia),
      metaDiaria: numberValue(config?.defaultValues?.meta),
      observacoes: "Valores migrados dos formulários operacionais",
      createdAt: new Date().toISOString(),
    });
  });
  return preserved;
}

function applyEtiquetagemJuneUpdate() {
  const updateKey = "ph-etiquetagem-jun-2026-update-v1";
  const sourceRows = (DATASETS.etiquetagem.rows || [])
    .map(normalizeEtiquetagemRow)
    .filter((row) => businessDateKey(row.data).startsWith("2026-06"));
  if (!sourceRows.length) return;

  const sourceDates = new Set(sourceRows.map((row) => businessDateKey(row.data)));
  const currentRows = (state.rows.etiquetagem || []).map(normalizeEtiquetagemRow);
  const firstExistingByDate = new Map();
  currentRows.forEach((row) => {
    const dateKey = businessDateKey(row.data);
    if (dateKey && !firstExistingByDate.has(dateKey)) firstExistingByDate.set(dateKey, row);
  });

  const untouchedRows = currentRows.filter((row) => {
    const dateKey = businessDateKey(row.data);
    return !(dateKey.startsWith("2026-06") && sourceDates.has(dateKey));
  });
  const now = new Date().toISOString();
  const juneRows = sourceRows.map((row) => {
    const dateKey = businessDateKey(row.data);
    const existing = firstExistingByDate.get(dateKey);
    return {
      ...(existing || {}),
      ...row,
      id: existing?.id || crypto.randomUUID(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
  });
  const mergedRows = [...untouchedRows, ...juneRows].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const shouldSave = localStorage.getItem(updateKey) !== "done"
    || JSON.stringify(currentRows.map((row) => [row.data, row.qtdPeças, row.tagsProduzidas]))
      !== JSON.stringify(mergedRows.map((row) => [row.data, row.qtdPeças, row.tagsProduzidas]));
  if (!shouldSave) return;
  state.rows.etiquetagem = mergedRows;
  saveRows("etiquetagem", state.rows.etiquetagem);
  localStorage.setItem(updateKey, "done");
}

function currentUserAccessRows() {
  return state.authProfile?.accessRows || [];
}

function currentUserSectors() {
  return state.authProfile?.sectors || [];
}

function accessForProcessId(processId) {
  const sector = currentUserSectors().find((item) => item.code === processId);
  if (!sector) return null;
  return currentUserAccessRows().find((row) => row.sector_id === sector.id) || null;
}

function isCurrentAccountProcessId(processId) {
  return CURRENT_ACCOUNT_PROCESS_IDS.includes(processId);
}

function currentAccountAccessProcessIds(configOrId) {
  const id = typeof configOrId === "string" ? configOrId : configOrId?.id;
  const mapped = CURRENT_ACCOUNT_ACCESS_PROCESS[id] || id;
  return Array.isArray(mapped) ? mapped : [mapped];
}

function accessForAnyProcessId(processIds) {
  return processIds.map((processId) => accessForProcessId(processId)).find(Boolean) || null;
}

function mergeAccessRows(rows) {
  const validRows = rows.filter(Boolean);
  if (!validRows.length) return null;
  return validRows.reduce((merged, row) => ({
    sector_id: merged.sector_id || row.sector_id,
    can_view: Boolean(merged.can_view || row.can_view),
    can_create: Boolean(merged.can_create || row.can_create),
    can_edit: Boolean(merged.can_edit || row.can_edit),
    can_delete: Boolean(merged.can_delete || row.can_delete),
    can_export: Boolean(merged.can_export || row.can_export),
    can_import: Boolean(merged.can_import || row.can_import),
  }), {});
}

function effectiveAccessForProcessId(processId) {
  if (isCurrentAccountProcessId(processId)) {
    return mergeAccessRows([
      accessForProcessId("currentAccount"),
      ...currentAccountAccessProcessIds(processId).map((mappedProcessId) => accessForProcessId(mappedProcessId)),
    ]);
  }
  return accessForProcessId(processId);
}

function canViewProcess(processId) {
  const config = configFor(processId);
  if (config?.hidden || config?.archived) return false;
  if (state.masterUnlocked) return true;
  return Boolean(effectiveAccessForProcessId(processId)?.can_view);
}

function canCreateProcess(processId) {
  const config = configFor(processId);
  if (config?.hidden || config?.archived) return false;
  if (state.masterUnlocked) return true;
  if (config?.operationalOnly && !isCurrentAccountProcessId(processId)) return false;
  return Boolean(effectiveAccessForProcessId(processId)?.can_create);
}

function canEditProcess(processId) {
  const config = configFor(processId);
  if (config?.hidden || config?.archived) return false;
  if (state.masterUnlocked) return true;
  return Boolean(effectiveAccessForProcessId(processId)?.can_edit);
}

function canDeleteProcess(processId) {
  const config = configFor(processId);
  if (config?.hidden || config?.archived) return false;
  if (state.masterUnlocked) return true;
  return Boolean(effectiveAccessForProcessId(processId)?.can_delete);
}

function canWriteCurrentAccountConfig(config) {
  if (state.masterUnlocked) return true;
  if (!config || !isCurrentAccountProcessId(config.id)) return false;
  const access = effectiveAccessForProcessId(config.id);
  return Boolean(access?.can_create || access?.can_edit);
}

function canExportCurrentAccountConfig(config) {
  if (state.masterUnlocked) return true;
  if (!config || !isCurrentAccountProcessId(config.id)) return false;
  return Boolean(effectiveAccessForProcessId(config.id)?.can_export);
}

function canImportCurrentAccountConfig(config) {
  if (state.masterUnlocked) return true;
  if (!config || !isCurrentAccountProcessId(config.id)) return false;
  return Boolean(effectiveAccessForProcessId(config.id)?.can_import);
}

function canClearCurrentAccountConfig(config) {
  if (state.masterUnlocked) return true;
  return false;
}

function canUseCurrentAccount() {
  if (state.masterUnlocked) return true;
  if (accessForProcessId("currentAccount")?.can_view) return true;
  return CURRENT_ACCOUNT_PROCESS_IDS.some((processId) => {
    const access = effectiveAccessForProcessId(processId);
    return access?.can_view || access?.can_create || access?.can_edit;
  });
}

function currentActorStamp() {
  const profile = state.authProfile || {};
  return {
    profileId: profile.id || "",
    name: profile.full_name || (state.masterUnlocked ? "Gestor Master" : "Colaborador"),
    email: profile.email || "",
    role: profile.role?.name || (state.masterUnlocked ? "Master" : "Colaborador"),
  };
}

function rowOwnedByCurrentUser(row) {
  if (!state.authProfile) return false;
  if (row.createdByProfileId) return row.createdByProfileId === state.authProfile.id;
  if (row.createdByEmail) return row.createdByEmail === state.authProfile.email;
  return Boolean(row.createdAt);
}

function canAccessProcess(process) {
  if (!process) return false;
  if (process.archived || process.hidden) return false;
  if (process.currentAccount) return canUseCurrentAccount();
  if (process.weeklyClosing) {
    return state.masterUnlocked
      || canViewProcess("weeklyClosing")
      || canCreateProcess("weeklyClosing")
      || weeklyClosingConfigs().length > 0;
  }
  if (process.launch) return !state.masterUnlocked && implementedConfigs().some((config) => canCreateProcess(config.id));
  if (state.masterUnlocked) return true;
  if (process.profile) return Boolean(state.authSession);
  if (process.masterOnly) return state.masterUnlocked;
  if (configFor(process.id) && !configFor(process.id).indicator) return false;
  return canViewProcess(process.id);
}

function visibleProcessBlocks() {
  return processBlocks.filter((process) => !process.profile).filter(canAccessProcess);
}

const DataRepository = {
  knownProcess(processId) {
    return Boolean(processId && (DATASETS[processId] || PROCESS_CONFIGS[processId] || processId === "experienceFeedbacks"));
  },
  assertProcess(processId, action = "acessar") {
    if (!this.knownProcess(processId)) {
      throw new Error(`Contrato de dados inválido ao ${action}: ${processId || "processo não informado"}.`);
    }
  },
  loadRows(processId) {
    this.assertProcess(processId, "carregar");
    return window.PHStorage.loadRows(processId, DATASETS[processId]);
  },
  saveRows(processId, rows) {
    this.assertProcess(processId, "salvar");
    if (!Array.isArray(rows)) {
      throw new Error(`Contrato de dados inválido ao salvar ${processId}: linhas devem ser uma lista.`);
    }
    window.PHStorage.saveRows(processId, rows);
    invalidateProcessCache(processId);
  },
  restoreRows(processId) {
    this.assertProcess(processId, "restaurar");
    const dataset = DATASETS[processId];
    if (!dataset) throw new Error(`Não existe base de restauração para ${processId}.`);
    return window.PHStorage.restoreDatasetRows(processId, dataset);
  },
};

function loadRows(processId) {
  return window.PHStorage.loadRows(processId, DATASETS[processId]);
}

function saveRows(processId, rows) {
  DataRepository.saveRows(processId, rows);
}

function ensureSeedRows(processId) {
  if (supabaseEnabled()) return;
  const datasetRows = DATASETS[processId]?.rows || [];
  const seededRows = datasetRows.filter((row) => row.id);
  if (!seededRows.length) return;
  const currentRows = state.rows[processId] || [];
  const currentIds = new Set(currentRows.map((row) => row.id).filter(Boolean));
  const missingRows = seededRows.filter((row) => !currentIds.has(row.id));
  if (!missingRows.length) return;
  state.rows[processId] = [...currentRows, ...missingRows];
  saveRows(processId, state.rows[processId]);
}

function invalidateProcessCache(processId) {
  if (!state.calculatedCache) return;
  delete state.calculatedCache[processId];
  if (["colaboradores", "custosSetores"].includes(processId)) {
    delete state.calculatedCache.custosSetores;
    delete state.calculatedCache.colaboradores;
  }
  Object.keys(state.monthTotalCache || {}).forEach((key) => {
    if (key.startsWith(`${processId}|`)) delete state.monthTotalCache[key];
  });
  if (["colaboradores", "custosSetores"].includes(processId)) {
    state.monthTotalCache = {};
  }
}

function renderOperationalDependents() {
  if (state.activeProcessId === "dashboard") renderDashboard();
  if (state.activeProcessId === "operationalFlow") renderOperationalFlow();
  if (state.activeProcessId === "currentAccount" && !activeFormHasUnsavedData()) renderCurrentAccount();
  if (state.activeProcessId === "weeklyClosing") renderWeeklyClosing();
  if (state.activeProcessId === "launchMonitor") renderLaunchMonitor();
  if (["colaboradores", "custosSetores"].includes(state.activeProcessId) && !activeFormHasUnsavedData()) renderProcess();
  if (state.masterUnlocked) renderSidebarAlerts();
}

function startLiveSync() {
  if (state.liveSyncTimer || !supabaseEnabled()) return;
  state.liveSyncTimer = setInterval(() => {
    if (document.hidden || !state.authSession?.access_token) return;
    if (activeFormHasUnsavedData()) return;
    syncFromSupabase().catch((error) => {
      console.warn("Sincronização automática não concluída:", error);
    });
  }, 60000);
}

async function refreshDataManually() {
  if (activeFormHasUnsavedData()) {
    setSyncStatus("idle", "Há formulário preenchido. Salve ou limpe antes de atualizar.");
    return;
  }
  try {
    await syncFromSupabase();
  } catch (error) {
    console.warn("Atualização manual não concluída:", error);
  }
}

function stopLiveSync() {
  if (state.liveSyncTimer) clearInterval(state.liveSyncTimer);
  state.liveSyncTimer = null;
}

function loadInputLogs() {
  const logs = window.PHAudit?.retainedLogs
    ? window.PHAudit.retainedLogs(window.PHStorage.loadInputLogs())
    : window.PHStorage.loadInputLogs();
  window.PHStorage.saveInputLogs(logs);
  return logs;
}

function saveInputLogs() {
  window.PHStorage.saveInputLogs(state.inputLogs);
}

function loadMonthlyClosings() {
  return window.PHStorage.loadMonthlyClosings();
}

function saveMonthlyClosings() {
  window.PHStorage.saveMonthlyClosings(state.monthlyClosings);
}

function loadExecutiveTagGoal() {
  const value = Number(localStorage.getItem("ph-executive-tag-goal"));
  return Number.isFinite(value) && value > 0 ? value : 85000;
}

function saveExecutiveTagGoal(value) {
  const roundedValue = Math.max(1, Math.round(numberValue(value)));
  state.executiveTagGoal = roundedValue;
  localStorage.setItem("ph-executive-tag-goal", String(roundedValue));
}

function loadFactoryDashboardHours() {
  try {
    const saved = JSON.parse(localStorage.getItem("ph-factory-dashboard-hours") || "{}");
    return {
      extraHours: Math.max(0, numberValue(saved.extraHours)),
      people: typeof saved.people === "string" ? saved.people : "",
    };
  } catch {
    return { extraHours: 0, people: "" };
  }
}

function saveFactoryDashboardHours(value) {
  state.factoryDashboardHours = {
    extraHours: Math.max(0, numberValue(value?.extraHours)),
    people: String(value?.people || "").trim(),
  };
  localStorage.setItem("ph-factory-dashboard-hours", JSON.stringify(state.factoryDashboardHours));
}

async function persistSettingValue(key, value) {
  if (!state.authSession?.access_token || !state.authProfile?.id) return false;
  await window.PHSupabase.auth.upsert(window.PHSupabase.tables.settings, {
    key,
    value,
    updated_by: state.authProfile.id,
    updated_at: new Date().toISOString(),
  }, "key", state.authSession);
  return true;
}

async function persistFactoryDashboardSettings() {
  const persisted = await Promise.all([
    persistSettingValue("executive_tag_goal", state.executiveTagGoal),
    persistSettingValue("factory_dashboard_hours", state.factoryDashboardHours),
  ]);
  return persisted.some(Boolean);
}

function parseFactoryExtraPeople(value = state.factoryDashboardHours?.people) {
  return uniqueSorted(String(value || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean));
}

function setFactoryExtraPeopleInput(names) {
  const input = document.querySelector("#factoryTvExtraPeopleInput");
  if (input) input.value = uniqueSorted(names).join("; ");
}

function renderFactoryExtraPeoplePicker() {
  const options = collaboratorOptions();
  const optionSet = new Set(options.map(normalizedSectorName));
  const selected = parseFactoryExtraPeople(document.querySelector("#factoryTvExtraPeopleInput")?.value || state.factoryDashboardHours?.people)
    .filter((name) => !options.length || optionSet.has(normalizedSectorName(name)));

  const datalist = document.querySelector("#factoryTvCollaboratorOptions");
  if (datalist) {
    datalist.innerHTML = options.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
  }

  setFactoryExtraPeopleInput(selected);
  const target = document.querySelector("#factoryTvSelectedCollaborators");
  if (!target) return;
  target.innerHTML = selected.length
    ? selected.map((name) => `
      <span class="person-chip">
        ${escapeHtml(name)}
        <button type="button" data-remove-extra-person="${escapeHtml(name)}" aria-label="Remover ${escapeHtml(name)}">×</button>
      </span>
    `).join("")
    : `<span class="muted-chip">Nenhum selecionado</span>`;
}

function loadTagConversionFactors() {
  const defaults = {
    iqSemiacabado: 1,
    tratamento: 1,
    galvanoplastia: 1,
    posBanho: 1,
  };
  try {
    const saved = JSON.parse(localStorage.getItem("ph-tag-conversion-factors") || "{}");
    Object.keys(defaults).forEach((key) => {
      const value = Number(saved[key]);
      if (Number.isFinite(value) && value > 0) defaults[key] = value;
    });
  } catch {
    // Mantém os fatores iniciais quando a configuração local estiver inválida.
  }
  return defaults;
}

function saveTagConversionFactors() {
  localStorage.setItem("ph-tag-conversion-factors", JSON.stringify(state.tagConversionFactors));
  if (state.authSession?.access_token && state.authProfile?.id) {
    window.PHSupabase.auth.upsert(window.PHSupabase.tables.settings, {
      key: "tag_conversion_factors",
      value: state.tagConversionFactors,
      updated_by: state.authProfile.id,
      updated_at: new Date().toISOString(),
    }, "key", state.authSession).catch((error) => {
      console.warn("Não foi possível sincronizar os fatores de tags:", error);
    });
  }
}

async function syncTagConversionFactorsFromSupabase() {
  if (!state.authSession?.access_token) return;
  const rows = await window.PHSupabase.auth.select(
    window.PHSupabase.tables.settings,
    "?select=value&key=eq.tag_conversion_factors&limit=1",
    state.authSession
  );
  const remote = rows[0]?.value;
  if (!remote || typeof remote !== "object") return;
  Object.keys(state.tagConversionFactors).forEach((key) => {
    const value = Number(remote[key]);
    if (Number.isFinite(value) && value > 0) state.tagConversionFactors[key] = value;
  });
  localStorage.setItem("ph-tag-conversion-factors", JSON.stringify(state.tagConversionFactors));
  if (state.activeProcessId === "dashboard") renderExecutiveWeeklyTagFlow();
}

async function syncFactoryDashboardSettingsFromSupabase() {
  if (!state.authSession?.access_token) return;
  const rows = await window.PHSupabase.auth.select(
    window.PHSupabase.tables.settings,
    "?select=key,value&key=in.(executive_tag_goal,factory_dashboard_hours)",
    state.authSession
  );
  rows.forEach((row) => {
    if (row.key === "executive_tag_goal") {
      const rawValue = row.value && typeof row.value === "object" ? row.value.value : row.value;
      const value = Math.round(numberValue(rawValue));
      if (Number.isFinite(value) && value > 0) saveExecutiveTagGoal(value);
    }
    if (row.key === "factory_dashboard_hours" && row.value && typeof row.value === "object") {
      saveFactoryDashboardHours(row.value);
    }
  });
  if (state.activeProcessId === "dashboard") renderDashboard();
}

function loadMasterAccount() {
  return window.PHStorage.loadMasterAccount(DEFAULT_MASTER_ACCOUNT);
}

function saveMasterAccount() {
  window.PHStorage.saveMasterAccount(state.masterAccount);
}

function loadReadAlertKeys() {
  try {
    return new Set(JSON.parse(localStorage.getItem("ph-read-alerts-v1") || "[]"));
  } catch {
    return new Set();
  }
}

function saveReadAlertKeys() {
  localStorage.setItem("ph-read-alerts-v1", JSON.stringify([...state.readAlertKeys]));
}

function supabaseEnabled() {
  return window.PHSupabase.enabled();
}

function appVersionLabel() {
  return DATASETS.appMeta?.version || "dev";
}

function syncStatusLabel(status = state.syncStatus) {
  if (status === "syncing") return "Sincronizando";
  if (status === "ok") return "Atualizado";
  if (status === "error") return "Erro de sync";
  if (status === "offline") return "Offline";
  return "Pendente";
}

function setSyncStatus(status, message = "") {
  state.syncStatus = status;
  state.syncMessage = message || syncStatusLabel(status);
  if (status === "ok") {
    state.lastSyncAt = new Date().toISOString();
    state.lastSyncError = "";
  }
  if (status === "error") state.lastSyncError = message || "Erro de sincronização";
  renderSyncStatus();
}

function renderSyncStatus() {
  const version = document.querySelector("#appVersionLabel");
  if (version) version.textContent = `v${appVersionLabel()}`;
  const button = document.querySelector("#syncStatusButton");
  const status = document.querySelector("#connectionStatus");
  const text = document.querySelector("#syncStatusText");
  const detail = document.querySelector("#syncStatusDetail");
  if (button) {
    button.dataset.syncStatus = state.syncStatus;
    button.disabled = state.syncStatus === "syncing";
  }
  if (status) status.dataset.syncStatus = state.syncStatus;
  if (text) text.textContent = syncStatusLabel();
  if (detail) {
    const last = state.lastSyncAt ? `Última: ${formatDateTime(state.lastSyncAt)}` : state.syncMessage;
    detail.textContent = state.syncStatus === "ok" ? last : state.syncMessage;
  }
}

function diagnosticConfigs() {
  const relevantIds = new Set([
    "separacaoProdutos",
    "produtosConta",
    "tratamento",
    "iqProdutosConta",
    "preElos",
    "galvanoplastia",
    "retrabalho",
    "posBanho",
    "posBanhoConta",
    "ecoat",
    "ecoatProducao",
    "etiquetagem",
    "etiquetagemConta",
    "colagem",
    "absenteismo",
    "colaboradores",
    "custosSetores",
    "prestadoresServicos",
  ]);
  return implementedConfigs()
    .filter((config) => relevantIds.has(config.id) || (state.rows[config.id] || []).length)
    .filter((config) => !config.archived);
}

function diagnosticRowDate(row) {
  return businessDateKey(row?.data || row?.competenceDate || row?.vigenciaInicio || row?.updatedAt || row?.createdAt) || "";
}

function latestDiagnosticDate(rows = []) {
  return rows
    .map(diagnosticRowDate)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0] || "";
}

function remoteDiagnosticGroups() {
  const operational = new Map();
  const trusted = new Map();
  (state.diagnosticsRemote.operational || []).forEach((record) => {
    if (!record.process_id) return;
    if (!operational.has(record.process_id)) operational.set(record.process_id, []);
    operational.get(record.process_id).push(record);
  });
  (state.diagnosticsRemote.trusted || []).forEach((record) => {
    if (!record.process_code) return;
    if (!trusted.has(record.process_code)) trusted.set(record.process_code, []);
    trusted.get(record.process_code).push(record);
  });
  return { operational, trusted };
}

async function loadDiagnosticRemoteRecords() {
  if (!supabaseEnabled()) {
    return { operational: [], trusted: [], error: "Supabase não configurado", loadedAt: new Date().toISOString() };
  }
  const operationalQuery = "?select=record_id,process_id,updated_at,deleted_at&deleted_at=is.null";
  const operational = state.authSession?.access_token
    ? await window.PHSupabase.auth.selectStrict(window.PHSupabase.tables.operationalRecords, operationalQuery, state.authSession)
    : await window.PHSupabase.select(window.PHSupabase.tables.operationalRecords, operationalQuery);
  let trusted = [];
  if (state.authSession?.access_token) {
    try {
      trusted = await window.PHSupabase.auth.selectStrict(
        window.PHSupabase.tables.productionEntries,
        "?select=id,process_code,competence_date,updated_at,status",
        state.authSession
      );
    } catch (error) {
      return { operational, trusted: [], error: error.message || "Falha ao ler ph_production_entries", loadedAt: new Date().toISOString() };
    }
  }
  return { operational, trusted, error: "", loadedAt: new Date().toISOString() };
}

function buildDiagnosticRows() {
  const { operational, trusted } = remoteDiagnosticGroups();
  return diagnosticConfigs().map((config) => {
    const localRows = state.rows[config.id] || [];
    const officialRows = officialRowsForConfig(config, localRows);
    const operationalRows = operational.get(config.id) || [];
    const trustedRows = trusted.get(config.id) || [];
    const remoteIds = new Set([
      ...operationalRows.map((record) => record.record_id),
      ...trustedRows.filter((record) => record.status !== "voided").map((record) => record.id),
    ].filter(Boolean));
    const localOnly = remoteIds.size
      ? localRows.filter((row) => row.id && !remoteIds.has(row.id)).length
      : 0;
    const visibleTrusted = trustedRows.filter((record) => record.status !== "voided").length;
    return {
      id: config.id,
      name: config.name,
      local: localRows.length,
      official: officialRows.length,
      operational: operationalRows.length,
      trusted: visibleTrusted,
      localOnly,
      latest: latestDiagnosticDate(localRows),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function renderDiagnostics() {
  const area = document.querySelector("#diagnosticsArea");
  if (!area || area.hidden) return;
  const rows = buildDiagnosticRows();
  const localTotal = rows.reduce((sum, row) => sum + row.local, 0);
  const officialTotal = rows.reduce((sum, row) => sum + row.official, 0);
  const remoteOperational = state.diagnosticsRemote.operational?.length || 0;
  const remoteTrusted = state.diagnosticsRemote.trusted?.filter((record) => record.status !== "voided").length || 0;
  const localOnly = rows.reduce((sum, row) => sum + row.localOnly, 0);
  const summary = document.querySelector("#diagnosticsSummary");
  if (summary) {
    summary.innerHTML = `
      <article><span>Versão publicada</span><strong>v${escapeHtml(appVersionLabel())}</strong><small>Confirme se todos os perfis veem a mesma versão.</small></article>
      <article><span>Status de sincronização</span><strong>${escapeHtml(syncStatusLabel())}</strong><small>${escapeHtml(state.lastSyncAt ? formatDateTime(state.lastSyncAt) : state.syncMessage)}</small></article>
      <article class="${state.lastSyncError || state.diagnosticsRemote.error ? "diagnostic-warn" : "diagnostic-ok"}"><span>Último alerta</span><strong>${state.lastSyncError || state.diagnosticsRemote.error ? "Verificar" : "Sem erro"}</strong><small>${escapeHtml(state.lastSyncError || state.diagnosticsRemote.error || "Leitura concluída sem falha registrada.")}</small></article>
      <article><span>Registros locais</span><strong>${formatNumber(localTotal)}</strong><small>Base carregada neste navegador.</small></article>
      <article class="diagnostic-ok"><span>Oficiais em cálculo</span><strong>${formatNumber(officialTotal)}</strong><small>Somente estes alimentam dashboards e saldos.</small></article>
      <article><span>Espelho operacional</span><strong>${formatNumber(remoteOperational)}</strong><small>Registros visíveis em ph_operational_records.</small></article>
      <article><span>Base autenticada</span><strong>${formatNumber(remoteTrusted)}</strong><small>Registros visíveis em ph_production_entries.</small></article>
      <article class="${localOnly ? "diagnostic-warn" : "diagnostic-ok"}"><span>Locais sem espelho visível</span><strong>${formatNumber(localOnly)}</strong><small>${localOnly ? "Pode indicar pendência de sincronização ou permissão." : "Nenhum desvio encontrado na comparação por ID."}</small></article>
      <article><span>Permissões carregadas</span><strong>${formatNumber(state.accessRows.length)}</strong><small>${formatNumber(state.accessSectors.length)} menus/setores configurados.</small></article>
    `;
  }
  const body = document.querySelector("#diagnosticsTableBody");
  if (body) {
    body.innerHTML = rows.map((row) => `
      <tr class="${row.localOnly ? "diagnostic-table-warn" : ""}">
        <td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.id)}</small></td>
        <td>${formatNumber(row.local)}</td>
        <td>${formatNumber(row.official)}</td>
        <td>${formatNumber(row.operational)}</td>
        <td>${formatNumber(row.trusted)}</td>
        <td>${formatNumber(row.localOnly)}</td>
        <td>${row.latest ? formatDate(row.latest) : "--"}</td>
      </tr>
    `).join("");
  }
  const issues = document.querySelector("#diagnosticsIssues");
  if (issues) {
    const messages = [];
    if (state.diagnosticsLoading) messages.push("Atualizando diagnóstico...");
    if (state.lastSyncError) messages.push(`Sync: ${state.lastSyncError}`);
    if (state.diagnosticsRemote.error) messages.push(`Supabase: ${state.diagnosticsRemote.error}`);
    if (localOnly) messages.push(`${formatNumber(localOnly)} registros existem localmente, mas não aparecem no espelho remoto visível para este perfil. Eles ficam fora dos cálculos oficiais até serem sincronizados ou saneados.`);
    if (!messages.length) messages.push("Nenhum bloqueio detectado na leitura atual. Use este painel após salvar registros ou alterar permissões.");
    issues.innerHTML = messages.map((message) => `<li>${escapeHtml(message)}</li>`).join("");
  }
}

async function refreshDiagnostics() {
  state.diagnosticsLoading = true;
  renderDiagnostics();
  try {
    await syncFromSupabase();
    state.diagnosticsRemote = await loadDiagnosticRemoteRecords();
    if (state.diagnosticsRemote.error) {
      setSyncStatus("error", state.diagnosticsRemote.error);
    } else {
      setSyncStatus("ok", "Diagnóstico atualizado");
    }
  } catch (error) {
    state.diagnosticsRemote = {
      ...(state.diagnosticsRemote || {}),
      error: error.message || "Falha ao atualizar diagnóstico",
      loadedAt: new Date().toISOString(),
    };
    setSyncStatus("error", state.diagnosticsRemote.error);
  } finally {
    state.diagnosticsLoading = false;
    renderDiagnostics();
  }
}

function isSupabaseMasterRole(roleCode) {
  return ["master", "technical_admin"].includes(roleCode);
}

function canPersistManagerValidation() {
  return Boolean(state.authSession?.access_token && state.authProfile?.id && isSupabaseMasterRole(state.authRoleCode));
}

function canUseAuthoritativeProductionSync() {
  return Boolean(state.authSession?.access_token && state.authProfile?.id);
}

async function persistManagerValidationDecision(config, row, decision, note) {
  if (!trustedProductionConfig(config)) {
    await persistOperationalRecord(config, row);
    return row;
  }
  if (!window.PHSupabase.auth.rpc) {
    await persistTrustedProductionEntry(config, row);
    return row;
  }
  try {
    return await window.PHSupabase.auth.rpc("ph_decide_zero_validation", {
      entry_id: row.id,
      decision,
      decision_note: note,
      entry_payload: row,
    }, state.authSession);
  } catch (error) {
    if (/function|schema cache|ph_decide_zero_validation|404|not found/i.test(error.message || "")) {
      throw new Error("A função de validação gerencial ainda não está instalada no Supabase. Execute o arquivo supabase-validacao-master.sql e tente novamente.");
    }
    throw error;
  }
}

async function loadAuthProfile(session) {
  if (!session?.access_token) return null;
  const authUser = session.user || {};
  const authUserId = authUser.id || "";
  const authEmail = String(authUser.email || "").toLowerCase();
  const knownMasterEmails = ["gestorpinkheart@gmail.com", "gestorpinkheart+master@gmail.com"];
  const profiles = await window.PHSupabase.auth.select(
    window.PHSupabase.tables.profiles,
    `?select=*&id=eq.${authUserId}&limit=1`,
    session
  );
  let profile = profiles[0] || null;
  if (!profile && authEmail) {
    const profilesByEmail = await window.PHSupabase.auth.select(
      window.PHSupabase.tables.profiles,
      `?select=*&email=eq.${encodeURIComponent(authEmail)}&limit=1`,
      session
    );
    profile = profilesByEmail[0] || null;
  }
  if (!profile && knownMasterEmails.includes(authEmail)) {
    const masterRoles = await window.PHSupabase.auth.select(
      window.PHSupabase.tables.roles,
      "?select=id,code,name&code=eq.master&limit=1",
      session
    );
    const masterRole = masterRoles[0] || null;
    if (masterRole) {
      const repaired = await window.PHSupabase.auth.upsert(window.PHSupabase.tables.profiles, {
        id: authUserId,
        full_name: "Gestor Master",
        email: authEmail,
        role_id: masterRole.id,
        main_sector_id: null,
        status: "active",
        must_change_password: false,
        updated_at: new Date().toISOString(),
      }, "id", session);
      profile = repaired[0] || null;
    }
  }
  if (!profile) return null;
  if (authEmail && profile.email !== authEmail) {
    profile = { ...profile, email: authEmail };
  }
  const roles = await window.PHSupabase.auth.select(
    window.PHSupabase.tables.roles,
    `?select=code,name&id=eq.${profile.role_id}&limit=1`,
    session
  );
  const resolvedRole = roles[0] || (knownMasterEmails.includes(authEmail)
    ? { code: "master", name: "Master" }
    : null);
  const [sectors, accessRows] = await Promise.all([
    window.PHSupabase.auth.select(
      window.PHSupabase.tables.sectors,
      "?select=id,code,name,group_name,is_active,sort_order&order=sort_order.asc",
      session
    ),
    window.PHSupabase.auth.select(
      window.PHSupabase.tables.userSectorAccess,
      `?select=*&user_id=eq.${profile.id}`,
      session
    ),
  ]);
  return {
    ...profile,
    role: resolvedRole,
    accessRows,
    sectors,
  };
}

function showAuthGate(message = "") {
  const gate = document.querySelector("#authGate");
  const shell = document.querySelector(".app-shell");
  const splash = document.querySelector("#bootSplash");
  if (splash) splash.hidden = true;
  if (gate) gate.hidden = false;
  if (shell) shell.hidden = true;
  const authMessage = document.querySelector("#authMessage");
  if (authMessage) authMessage.textContent = message;
}

function showAppShell() {
  const gate = document.querySelector("#authGate");
  const shell = document.querySelector(".app-shell");
  const splash = document.querySelector("#bootSplash");
  if (splash) splash.hidden = true;
  if (gate) gate.hidden = true;
  if (shell) shell.hidden = false;
}

function renderAuthenticatedShell() {
  showAppShell();
  renderAccessState();
  renderProcessNav();
  const rememberedProcess = sessionStorage.getItem(ACTIVE_PROCESS_SESSION_KEY) || "";
  const rememberedTarget = rememberedProcess === "dashboard" ? "" : rememberedProcess;
  const initialProcess = rememberedTarget && canAccessProcess(processBlocks.find((item) => item.id === rememberedTarget))
    ? rememberedTarget
    : state.masterUnlocked
      ? "launchMonitor"
    : canAccessProcess(processBlocks.find((item) => item.launch))
      ? "launch"
      : visibleProcessBlocks()[0]?.id;
  setActiveProcess(initialProcess || "launch");
  registerUserActivity();
  syncTagConversionFactorsFromSupabase();
  syncFactoryDashboardSettingsFromSupabase();
  startLiveSync();
}

function applyAuthProfile(profile, session, options = {}) {
  state.authSession = session;
  state.authProfile = profile;
  state.authRoleCode = profile?.role?.code || "";
  state.masterUnlocked = isSupabaseMasterRole(state.authRoleCode);
  state.lastAuthProfileRefreshAt = Date.now();
  state.sessionExpiredByInactivity = false;
  localStorage.setItem(AUTH_PROFILE_CACHE_KEY, JSON.stringify(profile));
  if (!options.deferRender) renderAuthenticatedShell();
}

async function refreshAuthProfileAccess({ force = false } = {}) {
  if (!state.authSession?.access_token) return false;
  if (!force && Date.now() - numberValue(state.lastAuthProfileRefreshAt) < 60000) return false;
  try {
    const profile = await loadAuthProfile(state.authSession);
    if (!profile?.role?.code || profile.status !== "active") return false;
    const previousAccess = JSON.stringify({
      role: state.authRoleCode,
      sectors: (state.authProfile?.sectors || []).map((sector) => [sector.id, sector.code]),
      access: (state.authProfile?.accessRows || []).map((row) => [row.sector_id, row.can_view, row.can_create, row.can_edit, row.can_delete, row.can_export, row.can_import]),
    });
    state.authProfile = profile;
    state.authRoleCode = profile.role?.code || "";
    state.masterUnlocked = isSupabaseMasterRole(state.authRoleCode);
    state.lastAuthProfileRefreshAt = Date.now();
    localStorage.setItem(AUTH_PROFILE_CACHE_KEY, JSON.stringify(profile));
    const nextAccess = JSON.stringify({
      role: state.authRoleCode,
      sectors: (profile.sectors || []).map((sector) => [sector.id, sector.code]),
      access: (profile.accessRows || []).map((row) => [row.sector_id, row.can_view, row.can_create, row.can_edit, row.can_delete, row.can_export, row.can_import]),
    });
    return previousAccess !== nextAccess;
  } catch (error) {
    console.warn("Atualização de permissões não concluída:", error);
    return false;
  }
}

function lastActivityAt() {
  return Number(sessionStorage.getItem(LAST_ACTIVITY_SESSION_KEY) || 0);
}

function stopInactivityWatch() {
  if (state.inactivityTimer) clearTimeout(state.inactivityTimer);
  state.inactivityTimer = null;
}

function registerUserActivity() {
  if (!state.authSession) return;
  sessionStorage.setItem(LAST_ACTIVITY_SESSION_KEY, String(Date.now()));
  stopInactivityWatch();
  state.inactivityTimer = setTimeout(expireSessionForInactivity, INACTIVITY_LIMIT_MS);
}

async function expireSessionForInactivity() {
  if (!state.authSession) return;
  const elapsed = Date.now() - lastActivityAt();
  if (elapsed < INACTIVITY_LIMIT_MS) {
    stopInactivityWatch();
    state.inactivityTimer = setTimeout(expireSessionForInactivity, INACTIVITY_LIMIT_MS - elapsed);
    return;
  }
  state.sessionExpiredByInactivity = true;
  await signOutSupabaseAuth();
  showAuthGate("Sessão encerrada após 30 minutos de inatividade. Entre novamente.");
}

async function restoreAuthSession() {
  const session = await window.PHSupabase.auth.getValidSession();
  if (!session?.access_token) return false;
  const lastActivity = lastActivityAt();
  if (lastActivity && Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
    window.PHSupabase.auth.saveSession(null);
    sessionStorage.removeItem(LAST_ACTIVITY_SESSION_KEY);
    state.sessionExpiredByInactivity = true;
    return false;
  }
  let profile = await loadAuthProfile(session);
  if (!profile) {
    try {
      const cached = JSON.parse(localStorage.getItem(AUTH_PROFILE_CACHE_KEY) || "null");
      const sessionUserId = session.user?.id || "";
      const sessionEmail = String(session.user?.email || "").toLowerCase();
      const cacheMatches = cached && (
        (sessionUserId && cached.id === sessionUserId)
        || (sessionEmail && String(cached.email || "").toLowerCase() === sessionEmail)
      );
      if (cacheMatches) profile = cached;
    } catch {
      profile = null;
    }
  }
  if (!profile?.role?.code || profile.status !== "active") return false;
  applyAuthProfile(profile, session, { deferRender: true });
  return true;
}

async function signInWithSupabaseAuth(email, password) {
  const authEmail = accessEmailFromLogin(email) || email;
  const session = await window.PHSupabase.auth.signInWithPassword(authEmail, password);
  const profile = await loadAuthProfile(session);
  if (!profile) {
    await window.PHSupabase.auth.signOut();
    throw new Error("Login válido, mas perfil operacional não encontrado.");
  }
  if (profile.status !== "active") {
    await window.PHSupabase.auth.signOut();
    throw new Error("Usuário inativo. Procure o Gestor Master.");
  }
  if (!profile.role?.code) {
    await window.PHSupabase.auth.signOut();
    throw new Error("Perfil encontrado, mas o papel de acesso não foi carregado. Procure o Gestor Master.");
  }
  applyAuthProfile(profile, session, { deferRender: true });
}

async function signOutSupabaseAuth() {
  stopInactivityWatch();
  stopLiveSync();
  await window.PHSupabase.auth.signOut();
  state.authSession = null;
  state.authProfile = null;
  state.authRoleCode = "";
  state.masterUnlocked = false;
  state.launchProcessId = null;
  localStorage.removeItem(AUTH_PROFILE_CACHE_KEY);
  sessionStorage.removeItem(ACTIVE_PROCESS_SESSION_KEY);
  sessionStorage.removeItem(LAST_ACTIVITY_SESSION_KEY);
  showAuthGate("");
}

function profileInitials(name = "") {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "--";
}

function renderProfile() {
  const profile = state.authProfile || {};
  const role = profile.role?.name || (state.masterUnlocked ? "Master" : "Colaborador");
  const name = profile.full_name || role;
  const email = state.authSession?.user?.email || profile.email || "";
  document.querySelector("#profileAvatar").textContent = profileInitials(name);
  document.querySelector("#profileDisplayName").textContent = name;
  document.querySelector("#profileDisplayEmail").textContent = email || "--";
  document.querySelector("#profileEmail").value = email;
  document.querySelector("#profileFullName").value = profile.full_name || "";
  document.querySelector("#profileRole").value = role;
  document.querySelector("#profileSaveStatus").textContent = "";
  document.querySelector("#passwordSaveStatus").textContent = "";
  document.querySelector("#profileNewPassword").value = "";
  document.querySelector("#profileConfirmPassword").value = "";
}

async function saveOwnProfile(event) {
  event.preventDefault();
  if (!state.authSession || !state.authProfile) return;
  const status = document.querySelector("#profileSaveStatus");
  const fullName = document.querySelector("#profileFullName").value.trim();
  if (!fullName) {
    status.textContent = "Informe o nome completo.";
    return;
  }
  status.textContent = "Salvando...";
  try {
    const lockedEmail = state.authSession?.user?.email || state.authProfile.email || "";
    const payload = {
      id: state.authProfile.id,
      full_name: fullName,
      email: lockedEmail,
      role_id: state.authProfile.role_id,
      main_sector_id: state.authProfile.main_sector_id,
      status: state.authProfile.status || "active",
      must_change_password: Boolean(state.authProfile.must_change_password),
      updated_at: new Date().toISOString(),
    };
    const saved = await window.PHSupabase.auth.upsert(window.PHSupabase.tables.profiles, payload, "id", state.authSession);
    state.authProfile = {
      ...state.authProfile,
      ...(saved[0] || payload),
      email: lockedEmail,
      role: state.authProfile.role,
      sectors: state.authProfile.sectors,
      accessRows: state.authProfile.accessRows,
    };
    renderAccessState();
    renderProfile();
    status.textContent = "Perfil atualizado.";
  } catch (error) {
    status.textContent = error.message || "Não foi possível salvar.";
  }
}

async function changeOwnPassword(event) {
  event.preventDefault();
  if (!state.authSession || !state.authProfile) return;
  const status = document.querySelector("#passwordSaveStatus");
  const password = document.querySelector("#profileNewPassword").value;
  const confirm = document.querySelector("#profileConfirmPassword").value;
  if (password.length < 6) {
    status.textContent = "A senha precisa ter pelo menos 6 caracteres.";
    return;
  }
  if (password !== confirm) {
    status.textContent = "A confirmação não confere.";
    return;
  }
  status.textContent = "Alterando senha...";
  try {
    await window.PHSupabase.auth.updateUser({ password }, state.authSession);
    await window.PHSupabase.auth.upsert(window.PHSupabase.tables.profiles, {
      id: state.authProfile.id,
      full_name: state.authProfile.full_name,
      email: state.authProfile.email,
      role_id: state.authProfile.role_id,
      main_sector_id: state.authProfile.main_sector_id,
      status: state.authProfile.status || "active",
      must_change_password: false,
      updated_at: new Date().toISOString(),
    }, "id", state.authSession);
    state.authProfile.must_change_password = false;
    document.querySelector("#profileNewPassword").value = "";
    document.querySelector("#profileConfirmPassword").value = "";
    status.textContent = "Senha alterada com sucesso.";
  } catch (error) {
    status.textContent = error.message || "Não foi possível alterar a senha.";
  }
}

async function supabaseUpsert(table, payload, conflictColumns) {
  return window.PHSupabase.upsert(table, payload, conflictColumns);
}

function supabaseOperationalPayload(config, row) {
  return {
    record_id: row.id,
    process_id: config.id,
    process_name: config.name,
    payload: row,
    created_by_profile: state.masterUnlocked ? "Gestor Master" : "Usuário comum",
    updated_at: new Date().toISOString(),
  };
}

function trustedProductionConfig(config) {
  return Boolean(config && [
    "iqSemiacabado", "tratamento", "galvanoplastia",
    "posBanho", "etiquetagem", "colagem",
  ].includes(config.id));
}

function shouldPersistOperationalRecordStrictly(config) {
  if (!config || trustedProductionConfig(config)) return false;
  return Boolean(state.authSession?.access_token);
}

function trustedSectorForProcess(processId) {
  const directSector = (state.authProfile?.sectors || []).find((sector) => sector.code === processId);
  if (directSector) return directSector;
  return (state.accessSectors || []).find((sector) => sector.code === processId) || null;
}

async function persistTrustedProductionEntry(config, row) {
  if (!trustedProductionConfig(config)) return null;
  if (!state.authSession?.access_token || !state.authProfile?.id) {
    throw new Error("Sessão autenticada não encontrada. Entre novamente antes de salvar.");
  }
  const sector = trustedSectorForProcess(config.id);
  if (!sector?.id) throw new Error(`Setor ${config.name} não encontrado na base de acessos.`);
  const competenceDate = businessDateKey(row.data);
  if (!competenceDate) throw new Error("Data de competência inválida.");
  const existing = await window.PHSupabase.auth.selectStrict(
    window.PHSupabase.tables.productionEntries,
    `?select=id,created_by&id=eq.${row.id}&limit=1`,
    state.authSession
  );
  const currentEntry = existing[0] || null;
  const payload = {
    id: row.id,
    sector_id: sector.id,
    process_code: config.id,
    competence_date: competenceDate,
    payload: row,
    status: "submitted",
    created_by: currentEntry?.created_by || state.authProfile.id,
    updated_by: state.authProfile.id,
  };
  try {
    const saved = await window.PHSupabase.auth.upsert(
      window.PHSupabase.tables.productionEntries,
      payload,
      "id",
      state.authSession
    );
    return saved[0] || payload;
  } catch (error) {
    if (/duplicate|unique|ph_production_entries_one_daily_entry/i.test(error.message || "")) {
      throw new Error(`Este registro já existe em ${config.name}. Atualize a tela antes de continuar.`);
    }
    if (/row-level security|violates row-level security|rls/i.test(error.message || "")) {
      throw new Error(`Sem permissão para gravar em ${config.name}. Verifique Criar/Editar na Gestão de Acessos e execute o arquivo supabase-rls-hotfix-fase3-5-permissoes-centralizadas.sql no Supabase.`);
    }
    throw error;
  }
}

async function voidTrustedProductionEntry(config, row) {
  if (!trustedProductionConfig(config)) return;
  const sector = trustedSectorForProcess(config.id);
  if (!sector?.id || !state.authProfile?.id) throw new Error("Setor ou usuário autenticado não encontrado.");
  const existing = await window.PHSupabase.auth.selectStrict(
    window.PHSupabase.tables.productionEntries,
    `?select=id,created_by&id=eq.${row.id}&limit=1`,
    state.authSession
  );
  await window.PHSupabase.auth.upsert(window.PHSupabase.tables.productionEntries, {
    id: row.id,
    sector_id: sector.id,
    process_code: config.id,
    competence_date: businessDateKey(row.data),
    payload: row,
    status: "voided",
    created_by: existing[0]?.created_by || state.authProfile.id,
    updated_by: state.authProfile.id,
  }, "id", state.authSession);
}

async function persistOperationalRecord(config, row) {
  if (!row?.id) return;
  const payload = supabaseOperationalPayload(config, row);
  if (state.authSession?.access_token) {
    return window.PHSupabase.auth.upsert(window.PHSupabase.tables.operationalRecords, payload, "record_id", state.authSession);
  }
  if (!state.localPrototypeMode) {
    throw new Error("Sessão autenticada não encontrada. Entre novamente antes de salvar.");
  }
  return supabaseUpsert(window.PHSupabase.tables.operationalRecords, payload, "record_id");
}

async function persistOperationalRecordStrict(config, row) {
  if (!row?.id) return;
  if (!state.authSession?.access_token) {
    throw new Error("Sessão autenticada não encontrada. Entre novamente antes de salvar este movimento.");
  }
  const payload = supabaseOperationalPayload(config, row);
  try {
    return await window.PHSupabase.auth.upsert(window.PHSupabase.tables.operationalRecords, payload, "record_id", state.authSession);
  } catch (error) {
    if (/row-level security|violates row-level security|rls/i.test(error.message || "")) {
      throw new Error(`Sem permissão para gravar em ${config.name}. Execute o arquivo supabase-rls-hotfix-fase3-5-permissoes-centralizadas.sql no Supabase e confirme Criar/Editar no setor real vinculado.`);
    }
    throw error;
  }
}

async function persistCurrentAccountClosingRecord(row) {
  if (!row?.id || !row.processId) return;
  const processConfig = configFor(row.processId);
  if (!processConfig) throw new Error(`Conta corrente ${row.processId} não encontrada.`);
  const payload = {
    record_id: row.id,
    process_id: row.processId,
    process_name: row.processName || currentAccountLabel(processConfig),
    payload: row,
    created_by_profile: state.masterUnlocked ? "Gestor Master" : "Usuário comum",
    updated_at: new Date().toISOString(),
  };
  if (!state.authSession?.access_token) {
    throw new Error("Sessão autenticada não encontrada. Entre novamente antes de salvar o fechamento.");
  }
  try {
    return await window.PHSupabase.auth.upsert(window.PHSupabase.tables.operationalRecords, payload, "record_id", state.authSession);
  } catch (error) {
    if (/row-level security|violates row-level security|rls/i.test(error.message || "")) {
      throw new Error(`Sem permissão para gravar fechamento de ${currentAccountLabel(processConfig)}. Confirme Criar/Editar na Conta Corrente deste setor e execute o hotfix fase 3.8 no Supabase.`);
    }
    throw error;
  }
}

async function deleteOperationalRecord(config, row) {
  if (!row?.id) return;
  const payload = {
    record_id: row.id,
    process_id: config.id,
    process_name: config.name,
    payload: row,
    created_by_profile: state.masterUnlocked ? "Gestor Master" : "Usuário comum",
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (state.authSession?.access_token) {
    return window.PHSupabase.auth.upsert(window.PHSupabase.tables.operationalRecords, payload, "record_id", state.authSession);
  }
  if (!state.localPrototypeMode) {
    throw new Error("Sessão autenticada não encontrada. Entre novamente antes de excluir.");
  }
  return supabaseUpsert(window.PHSupabase.tables.operationalRecords, payload, "record_id");
}

async function deleteOperationalRecordsByProcess(config, keepIds = new Set()) {
  if (!config?.id || !state.authSession?.access_token) return;
  const remoteRows = await window.PHSupabase.auth.selectStrict(
    window.PHSupabase.tables.operationalRecords,
    `?select=record_id,process_id,process_name,payload,created_by_profile&process_id=eq.${encodeURIComponent(config.id)}&deleted_at=is.null`,
    state.authSession
  );
  const rowsToDelete = remoteRows.filter((record) => !keepIds.has(record.record_id));
  if (!rowsToDelete.length) return;
  const now = new Date().toISOString();
  await Promise.all(rowsToDelete.map((record) => window.PHSupabase.auth.upsert(window.PHSupabase.tables.operationalRecords, {
    record_id: record.record_id,
    process_id: record.process_id || config.id,
    process_name: record.process_name || config.name,
    payload: record.payload || {},
    created_by_profile: record.created_by_profile || (state.masterUnlocked ? "Gestor Master" : "Usuário comum"),
    deleted_at: now,
    updated_at: now,
  }, "record_id", state.authSession)));
}

async function deleteOperationalRecordsByProcessPeriods(config, periods = new Set(), keepIds = new Set()) {
  if (!config?.id || !periods.size || !state.authSession?.access_token) return;
  const remoteRows = await window.PHSupabase.auth.selectStrict(
    window.PHSupabase.tables.operationalRecords,
    `?select=record_id,process_id,process_name,payload,created_by_profile&process_id=eq.${encodeURIComponent(config.id)}&deleted_at=is.null`,
    state.authSession
  );
  const rowsToDelete = remoteRows.filter((record) => {
    const period = String(record.payload?.competencia || record.payload?.data || "").slice(0, 7);
    return periods.has(period) && !keepIds.has(record.record_id);
  });
  if (!rowsToDelete.length) return;
  const now = new Date().toISOString();
  await Promise.all(rowsToDelete.map((record) => window.PHSupabase.auth.upsert(window.PHSupabase.tables.operationalRecords, {
    record_id: record.record_id,
    process_id: record.process_id || config.id,
    process_name: record.process_name || config.name,
    payload: record.payload || {},
    created_by_profile: record.created_by_profile || "Sistema",
    deleted_at: now,
    updated_at: now,
  }, "record_id", state.authSession)));
}

function stableTextHash(value) {
  let hash = 2166136261;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function stableImportRowKey(config, row) {
  const ordered = {};
  Object.keys(row || {}).sort().forEach((key) => {
    const value = row[key];
    ordered[key] = value === null || value === undefined ? "" : String(value).trim();
  });
  return `${config.id}|${JSON.stringify(ordered)}`;
}

function stableImportRecordId(config, row, occurrenceMap) {
  const key = stableImportRowKey(config, row);
  const occurrence = (occurrenceMap.get(key) || 0) + 1;
  occurrenceMap.set(key, occurrence);
  return `import:${config.id}:${stableTextHash(`${key}|${occurrence}`)}`;
}

function numberValue(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value, decimals = 0) {
  return numberValue(value).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCurrency(value) {
  return numberValue(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPercent(value) {
  return value ? `${formatNumber(value * 100, 1)}%` : "";
}

function average(rows, selector) {
  const values = rows.map(selector).map(numberValue).filter((value) => value !== 0);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function formatDate(value) {
  if (!value) return "";
  const key = businessDateKey(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return String(value || "");
  const [year, month, day] = key.split("-");
  return `${day}/${month}/${year}`;
}

function getDateParts(value) {
  const key = businessDateKey(value);
  if (!key) return { diaSemana: "", semana: "", mes: "" };
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { diaSemana: "", semana: "", mes: "" };
  const diaSemana = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase();
  const mes = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
  const day = date.getDate();
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const semana = weekend ? "" : `Semana ${Math.floor((day - 1) / 7) + 1}`;
  return { diaSemana, semana, mes };
}

function formatTenure(startDate, endDate = "") {
  if (!startDate) return "";
  const start = new Date(`${startDate}T12:00:00`);
  const end = endDate ? new Date(`${endDate}T12:00:00`) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return "";
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
}

function calculateMlsEfetiva(milesimo) {
  const mls = numberValue(milesimo);
  return mls ? ((mls * 0.75) + 0.25) / mls : 0;
}

function calculateCommon(row, { total }) {
  const colaboradores = numberValue(row.colaboradores);
  const meta = numberValue(row.meta);
  const custoMdoDia = numberValue(row.custoMdoDia);
  const custoDiaTrabalhado = custoMdoDia * colaboradores;
  return {
    ...row,
    ...getDateParts(row.data),
    produçãoColaborador: colaboradores ? total / colaboradores : 0,
    percentualMeta: meta ? total / meta : 0,
    produçãoHora: colaboradores ? total / (colaboradores * 7) : 0,
    custoDiaTrabalhado,
    custoProdução: total ? custoDiaTrabalhado / total : 0,
  };
}

function calculatePreElosRows(sourceRows) {
  let saldoDisponivelTags = 0;
  let saldoTerceiroTags = 0;
  return sourceRows
    .map((row) => PROCESS_CONFIGS.preElos.calculate(row))
    .sort((a, b) => {
      if (!a.data && b.data) return 1;
      if (a.data && !b.data) return -1;
      const dateOrder = (a.data || "").localeCompare(b.data || "");
      if (dateOrder) return dateOrder;
      return String(a.createdAt || a.id || "").localeCompare(String(b.createdAt || b.id || ""));
    })
    .map((row) => {
      saldoDisponivelTags += numberValue(row.saldoDeltaTags);
      saldoTerceiroTags += numberValue(row.terceiroDeltaTags);
      return {
        ...row,
        saldoDisponivelTags,
        saldoTerceiroTags,
      };
    });
}

function calculateEcoatRows(sourceRows) {
  let saldoDisponivelTags = 0;
  return sourceRows
    .map((row) => PROCESS_CONFIGS.ecoat.calculate(row))
    .sort((a, b) => {
      if (!a.data && b.data) return 1;
      if (a.data && !b.data) return -1;
      const dateOrder = (a.data || "").localeCompare(b.data || "");
      if (dateOrder) return dateOrder;
      return String(a.createdAt || a.id || "").localeCompare(String(b.createdAt || b.id || ""));
    })
    .map((row) => {
      saldoDisponivelTags += numberValue(row.saldoDeltaTags);
      return {
        ...row,
        saldoDisponivelTags,
      };
    });
}

function calculateEtiquetagemContaRows(sourceRows) {
  return calculateCurrentAccountRows(sourceRows, PROCESS_CONFIGS.etiquetagemConta);
}

function calculateCurrentAccountRows(sourceRows, config) {
  let saldoDisponivelTags = 0;
  return sourceRows
    .map((row) => config.calculate(row))
    .sort((a, b) => {
      if (!a.data && b.data) return 1;
      if (a.data && !b.data) return -1;
      const dateOrder = (a.data || "").localeCompare(b.data || "");
      if (dateOrder) return dateOrder;
      const timeOrder = String(a.hora || "").localeCompare(String(b.hora || ""));
      if (timeOrder) return timeOrder;
      return String(a.createdAt || a.id || "").localeCompare(String(b.createdAt || b.id || ""));
    })
    .map((row) => {
      saldoDisponivelTags += numberValue(row.saldoDeltaTags);
      return {
        ...row,
        saldoDisponivelTags,
      };
    });
}

function shouldUseOfficialRowsOnly() {
  return Boolean(supabaseEnabled() && state.authSession?.access_token && !state.localPrototypeMode);
}

function requiresCentralWrite(config) {
  return Boolean(config && supabaseEnabled() && !state.localPrototypeMode);
}

function canWriteCentralData(config) {
  return Boolean(!requiresCentralWrite(config) || state.authSession?.access_token);
}

function syncedSourceForConfig(config) {
  return trustedProductionConfig(config) ? "trusted_production_entries" : "legacy_operational_records";
}

function markRowAsSynced(config, row, source = syncedSourceForConfig(config)) {
  if (!row) return row;
  row.syncSource = source;
  row.syncStatus = "synced";
  row.syncedAt = new Date().toISOString();
  return row;
}

function isCurrentAccountClosingPayload(payload) {
  return Boolean(payload?.processId && CURRENT_ACCOUNT_PROCESS_IDS.includes(payload.processId) && ["initial", "weekly"].includes(payload.kind));
}

function isOfficialRow(row) {
  return Boolean(row?.syncSource || row?.syncStatus === "synced" || row?.syncedAt);
}

function hasStoredValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function shouldPreserveLocalRowsWithoutRemote(config) {
  return Boolean(config?.indicator || ["custosSetores", "experienceFeedbacks"].includes(config?.id));
}

function mergeRemoteRowWithLocal(localRow = {}, remoteRow = {}) {
  const merged = { ...remoteRow };
  Object.entries(localRow || {}).forEach(([key, value]) => {
    if (["syncSource", "syncStatus", "syncedAt", "syncActorProfile"].includes(key)) return;
    if (!hasStoredValue(merged[key]) && hasStoredValue(value)) merged[key] = value;
  });
  return merged;
}

function officialRowsForConfig(config, rows = []) {
  return rows;
}

function calculatedRows(processId = state.activeProcessId) {
  const config = configFor(processId);
  if (!config) return [];
  const sourceRows = officialRowsForConfig(config, state.rows[processId] || []);
  const cache = state.calculatedCache[processId];
  if (processId !== "custosSetores" && cache && cache.sourceRows === sourceRows && cache.length === sourceRows.length) return cache.rows;
  const rows = processId === "preElos"
    ? calculatePreElosRows(sourceRows)
    : processId === "ecoat"
      ? calculateEcoatRows(sourceRows)
    : processId === "etiquetagemConta"
      ? calculateEtiquetagemContaRows(sourceRows)
    : config.currentAccountLedger
      ? calculateCurrentAccountRows(sourceRows, config)
    : sourceRows
      .map((row) => config.calculate(row))
      .sort((a, b) => {
        if (!a.data && b.data) return 1;
        if (a.data && !b.data) return -1;
        return (a.data || "").localeCompare(b.data || "");
      });
  state.calculatedCache[processId] = { sourceRows, length: sourceRows.length, rows };
  return rows;
}

function renderProcessNav() {
  const visibleBlocks = visibleProcessBlocks();
  const alertCounts = unreadAlertCountsByProcess();
  const groups = [
    ["Módulos", visibleBlocks.filter((process) => process.group === "Gestão")],
    ["Serviços Externos", visibleBlocks.filter((process) => process.group === "Serviços Externos")],
    ["Processos", visibleBlocks.filter((process) => !process.group && process.ready !== false)],
    ["Config.", visibleBlocks.filter((process) => process.group === "Pendentes")],
  ].filter(([, items]) => items.length);
  document.querySelector("#processNav").innerHTML = groups.map(([label, items]) => `
    <div class="process-group ${processNavGroupOpen(label, items) ? "open" : "collapsed"}">
      <button class="process-group-label" data-process-group-toggle="${escapeHtml(label)}" type="button" aria-expanded="${processNavGroupOpen(label, items) ? "true" : "false"}">
        <span>${label}</span>
      </button>
      <div class="process-group-items" ${processNavGroupOpen(label, items) ? "" : "hidden"}>
        ${items.map((process) => `
        <button class="process-item ${process.tone === "management" ? "management" : ""} ${process.id === state.activeProcessId ? "active" : ""} ${alertCounts.has(process.id) ? "has-alert" : ""}" data-process="${process.id}" data-short="${processInitials(process.name).slice(0, 2)}" type="button" title="${process.name}">
          <i>${processIcon(process)}</i>
          <span>${process.name}</span>
          ${alertCounts.has(process.id) ? `<b class="process-alert-dot">${formatNumber(alertCounts.get(process.id))}</b>` : ""}
        </button>
        `).join("")}
      </div>
    </div>
  `).join("");
  renderAccessState();
}

function processNavGroupKey(label) {
  return `ph-process-group-${label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`;
}

function processNavGroupOpen(label, items = []) {
  if (items.some((process) => process.id === state.activeProcessId)) return true;
  const saved = localStorage.getItem(processNavGroupKey(label));
  if (saved !== null) return saved !== "false";
  return label !== "Config.";
}

function toggleProcessNavGroup(label) {
  const group = [...document.querySelectorAll(".process-group")]
    .find((item) => item.querySelector("[data-process-group-toggle]")?.dataset.processGroupToggle === label);
  const isOpen = group?.classList.contains("open");
  localStorage.setItem(processNavGroupKey(label), isOpen ? "false" : "true");
  renderProcessNav();
}

function isTagReleaseField(field) {
  return ["tagsLiberadas", "tagsRodio", "tagsQuebec", "tagsEcoat"].includes(field?.key);
}

function prioritizeLaunchFormFields(fields) {
  const observationIndex = fields.findIndex((field) => field.key === "observacoes");
  if (observationIndex < 0) return fields;
  const tagFields = fields.filter(isTagReleaseField);
  if (!tagFields.length) return fields;
  const regularFields = fields.filter((field) => !isTagReleaseField(field) && field.key !== "observacoes");
  return [...regularFields, ...tagFields, fields[observationIndex]];
}

function formLabelClass(field) {
  return [
    field.full || isTagReleaseField(field) ? "full" : "",
    isTagReleaseField(field) ? "tag-release-field" : "",
  ].filter(Boolean).join(" ");
}

function formFieldHint(field) {
  if (isTagReleaseField(field)) {
    return `<small class="field-priority-hint">Campo-chave obrigatório para movimentar o fluxo do setor</small>`;
  }
  return field.help ? `<small class="field-help">${escapeHtml(field.help)}</small>` : "";
}

function currentFormValues(config) {
  const activeConfig = formConfig();
  const form = document.querySelector("#processForm");
  if (!form || activeConfig?.id !== config.id) return {};
  return Object.fromEntries([...form.querySelectorAll("[data-field]")].map((element) => [
    element.dataset.field,
    element.value,
  ]));
}

function renderForm(config) {
  if (config.id === "custosSetores") refreshSectorCostOptions();
  const editing = state.editingRow?.processId === config.id
    ? state.rows[config.id].find((row) => row.id === state.editingRow.rowId)
    : null;
  const preservedValues = editing || state.suppressFormPreserveOnce ? {} : currentFormValues(config);
  state.suppressFormPreserveOnce = false;
  const currentAccountMode = state.activeProcessId === "currentAccount";
  const formName = currentAccountMode ? currentAccountLabel(config) : config.name;
  document.querySelector("#formTitle").textContent = formName;
  document.querySelector("#submitButton").textContent = currentAccountMode
    ? editing ? "Atualizar movimento" : "Salvar movimento"
    : editing ? `Atualizar ${config.name}` : `Salvar em ${config.name}`;
  document.querySelector(".form-panel .panel-label").textContent = currentAccountMode
    ? editing ? "Editar movimento" : "Novo movimento"
    : editing ? "Editar registro" : config.indicator ? "Novo cadastro" : "Novo lançamento";
  const cancelButton = document.querySelector("#cancelFormButton");
  if (cancelButton) cancelButton.hidden = !config.indicator;
  const errorMessage = document.querySelector("#formErrorMessage");
  if (errorMessage) errorMessage.textContent = "";
  const datalistMap = {
    collaboratorOptions: collaboratorOptions(),
    sectorOptions: sectorOptions(),
  };
  const baseVisibleFields = config.indicator
    ? config.fields
    : config.fields.filter((field) => !isProtectedField(field));
  const visibleFields = prioritizeLaunchFormFields(
    currentAccountMode
      ? baseVisibleFields.filter((field) => !["hora", "qtdPeças", "referencia"].includes(field.key))
      : baseVisibleFields
  );
  const historyNotice = config.id === "custosSetores"
    ? `<div class="policy-history-notice full"><strong>Histórico protegido</strong><span>Novos valores valem somente da data de vigência em diante. Lançamentos anteriores não serão recalculados.</span></div>`
    : "";
  formFields.innerHTML = historyNotice + visibleFields.map((field) => {
    const protectedField = isProtectedField(field);
    const mandatoryField = isRequiredLaunchInput(config, field);
    const value = protectedField && !state.masterUnlocked
      ? 0
      : editing?.[field.key] ?? preservedValues[field.key] ?? "";
    if (protectedField && !state.masterUnlocked) {
      return `<input id="field-${field.key}" name="${field.key}" data-field="${field.key}" type="hidden" value="${value}">`;
    }
    const common = `id="field-${field.key}" name="${field.key}" data-field="${field.key}" ${mandatoryField ? "required" : ""}`;
    const className = formLabelClass(field);
    const hint = formFieldHint(field);
    const controlledOptions = controlledFieldOptions(config, field);
    if (controlledOptions) {
      const options = controlledOptions.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option || "Selecione")}</option>`).join("");
      return `<label class="${className}"><span>${field.label}</span>${hint}<select ${common}>${options}</select></label>`;
    }
    if (field.type === "select") {
      const options = field.options.map((option) => `<option value="${option}">${option || "Selecione"}</option>`).join("");
      return `<label class="${className}"><span>${field.label}</span>${hint}<select ${common}>${options}</select></label>`;
    }
    if (field.type === "textarea") {
      return `<label class="${className}"><span>${field.label}</span>${hint}<textarea ${common} rows="3">${value}</textarea></label>`;
    }
    const listId = fieldDatalist(field);
    const listAttr = listId ? ` list="${listId}"` : "";
    const numericAttrs = field.type === "number" ? ` min="0" step="${field.step || "1"}"` : "";
    const dateAttrs = config.id === "custosSetores" && field.key === "vigenciaInicio" ? ` min="${localDateKey()}"` : "";
    return `<label class="${className}"><span>${field.label}</span>${hint}<input ${common} type="${field.type}"${numericAttrs}${dateAttrs}${listAttr} value="${value}"></label>`;
  }).join("") + Object.entries(datalistMap).map(([id, values]) => renderDatalist(id, values)).join("");
  visibleFields.forEach((field) => {
    const element = document.querySelector(`#field-${field.key}`);
    if (!element) return;
    const value = editing?.[field.key] ?? preservedValues[field.key] ?? "";
    if (value !== undefined && value !== null && value !== "") element.value = value;
  });
  if (editing) {
    visibleFields.forEach((field) => {
      const element = document.querySelector(`#field-${field.key}`);
      if (element && editing[field.key] !== undefined) element.value = editing[field.key];
    });
    if (config.id === "custosSetores" && businessDateKey(editing.vigenciaInicio) < localDateKey()) {
      document.querySelector("#field-vigenciaInicio").value = localDateKey();
    }
  }
  const dateField = document.querySelector("#field-data");
  if (dateField && !editing && !preservedValues.data) dateField.valueAsDate = new Date();
  const policyDateField = document.querySelector("#field-vigenciaInicio");
  if (policyDateField && !editing) policyDateField.value = localDateKey();
  document.querySelector(".form-preview").hidden = !state.masterUnlocked || Boolean(config.hidePreview);
}

function launchHistoryColumns(config) {
  return operationalTableColumns(config);
}

function formatLaunchHistoryCell(row, column, config) {
  if (column.key === "actions") {
    return canEditRow(config, row)
      ? `<button class="edit-row" data-edit="${row.id}" type="button">Editar</button>`
      : `<span class="locked-edit">Bloqueado</span>`;
  }
  if (column.key === "data") return formatDate(row.data);
  if (column.key === "mes") return row.mes || getDateParts(row.data).mes || "";
  if (column.percent) return formatPercent(row[column.key]);
  if (column.currency) return row[column.key] ? formatCurrency(row[column.key]) : "";
  if (column.numeric) return row[column.key] ? formatNumber(row[column.key], column.decimals || 0) : "";
  return row[column.key] || "";
}

function renderLaunchHistory(config) {
  const panel = document.querySelector("#launchHistoryPanel");
  if (!panel) return;
  const showHistory = Boolean(config && !state.masterUnlocked && !config.indicator);
  panel.hidden = !showHistory;
  if (!showHistory) return;
  const exportButton = document.querySelector("#exportLaunchHistoryButton");
  if (exportButton) exportButton.hidden = !canExportProcess(config.id);

  const columns = launchHistoryColumns(config);
  const rows = calculatedRows(config.id).slice().sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  document.querySelector("#launchHistoryTitle").textContent = `${config.name} - registros realizados`;
  document.querySelector("#launchHistoryHead").innerHTML = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
  document.querySelector("#launchHistoryBody").innerHTML = rows.length ? rows.map((row) => `
    <tr>${columns.map((column) => `<td>${formatLaunchHistoryCell(row, column, config)}</td>`).join("")}</tr>
  `).join("") : `<tr><td class="empty-state" colspan="${columns.length}">Nenhum lançamento registrado neste setor.</td></tr>`;
  refreshTableTopScrollbars();
}

function placeLaunchFormInline(inline) {
  const shell = document.querySelector("#launchFormShell");
  if (!shell) return;
  if (inline) {
    const mount = document.querySelector("#inlineLaunchMount");
    if (mount && shell.parentElement !== mount) mount.appendChild(shell);
    return;
  }
  const picker = document.querySelector("#launchSectorPicker");
  if (picker && shell.parentElement !== document.querySelector("#launchArea")) {
    picker.insertAdjacentElement("afterend", shell);
  }
}

function renderInlineLaunchForm(config) {
  const mount = document.querySelector("#inlineLaunchMount");
  if (!mount) return;
  const shouldShow = Boolean(state.masterUnlocked && config && state.launchProcessId === config.id);
  mount.hidden = !shouldShow;
  if (!shouldShow) return;
  placeLaunchFormInline(true);
  document.querySelector("#launchFormShell").hidden = false;
  document.querySelector("#launchSelectedTitle").textContent = config.name;
  const openButton = document.querySelector("#openLaunchFormButton");
  if (openButton) openButton.hidden = true;
  const backButton = document.querySelector("#changeLaunchSectorButton");
  backButton.hidden = false;
  backButton.textContent = "← Voltar ao monitoramento";
  document.querySelector(".form-panel").hidden = false;
  document.querySelector(".form-panel .panel-label").textContent = state.editingRow ? "Editar registro" : "Novo lançamento";
  renderForm(config);
  updatePreview();
  renderLaunchHistory(config);
}

function renderLaunch() {
  placeLaunchFormInline(false);
  const config = formConfig();
  const launchConfigs = implementedConfigs().filter((item) => !item.indicator && canCreateProcess(item.id));
  const launchTitle = config?.id === "absenteismo"
    ? "Registro de ausência"
    : config?.id === "colaboradores"
      ? "Cadastro de colaborador"
      : "Registro diário dos setores";
  document.querySelector(".launch-toolbar h3").textContent = launchTitle;
  document.querySelector("#launchSectorPicker").hidden = !!config;
  document.querySelector("#launchFormShell").hidden = !config;
  const formPanel = document.querySelector(".form-panel");
  const openButton = document.querySelector("#openLaunchFormButton");
  const historyPanel = document.querySelector("#launchHistoryPanel");
  if (historyPanel && !config) historyPanel.hidden = true;
  document.querySelector("#launchSectorPicker").innerHTML = launchConfigs.map((item, index) => {
    const inputStatus = launchInputStatus(item);
    return `
    <button class="launch-sector-card tone-${(index % 7) + 1} ${inputStatus.className}" data-launch-process="${item.id}" type="button" aria-label="Abrir lançamento de ${escapeHtml(item.name)}">
      <i>${launchSectorIcon(item.id)}</i>
      <span>${escapeHtml(item.name)}</span>
      <small class="launch-sector-status">${escapeHtml(inputStatus.label)}</small>
      <em>${escapeHtml(inputStatus.detail)}</em>
    </button>
  `;
  }).join("");
  if (!config) {
    document.querySelector("#productionSnapshot").hidden = true;
    if (formPanel) formPanel.hidden = true;
    if (openButton) openButton.hidden = true;
    return;
  }
  renderProductionSnapshot(config);
  document.querySelector("#launchSelectedTitle").textContent = config.name;
  const showForm = Boolean(state.launchFormOpen || state.editingRow?.processId === config.id);
  if (formPanel) formPanel.hidden = !showForm;
  if (openButton) {
    openButton.hidden = Boolean(config.indicator && showForm);
    openButton.textContent = config.indicator ? "Novo cadastro" : "Novo lançamento";
  }
  if (showForm) {
    renderForm(config);
    updatePreview();
  }
  document.querySelector(".form-panel .panel-label").textContent = state.editingRow ? "Editar registro" : config.indicator ? "Novo cadastro" : "Novo lançamento";
  const backButton = document.querySelector("#changeLaunchSectorButton");
  backButton.hidden = Boolean(config.indicator);
  backButton.textContent = state.masterUnlocked ? "← Voltar ao monitoramento" : "← Voltar aos setores";
  renderLaunchHistory(config);
  renderAccessState();
}

function currentAccountConfigs() {
  return CURRENT_ACCOUNT_PROCESS_IDS
    .map((id) => configFor(id))
    .filter(Boolean)
    .filter((config) => {
      if (state.masterUnlocked) return true;
      const access = effectiveAccessForProcessId(config.id);
      return access?.can_view || access?.can_create || access?.can_edit;
    });
}

function currentAccountSelectedConfig() {
  const configs = currentAccountConfigs();
  if (!configs.some((config) => config.id === state.currentAccountProcessId)) {
    state.currentAccountProcessId = configs[0]?.id || "";
  }
  return configFor(state.currentAccountProcessId);
}

function currentAccountLabel(config) {
  return CURRENT_ACCOUNT_LABELS[config?.id] || config?.name || "";
}

function currentAccountClosingRows(configId) {
  return officialRowsForConfig(CURRENT_ACCOUNT_CLOSING_CONFIG, state.rows.currentAccountClosings || [])
    .filter((row) => row.processId === configId)
    .filter((row) => row.kind !== "initial")
    .sort((a, b) => String(a.weekEnd || "").localeCompare(String(b.weekEnd || "")));
}

function currentAccountLatestClosing(configId) {
  return currentAccountClosingRows(configId).slice().reverse().find((row) => row.saldoFisico !== "" && row.saldoFisico !== undefined && row.saldoFisico !== null) || null;
}

function currentAccountOpeningBalance(config) {
  const initial = officialRowsForConfig(CURRENT_ACCOUNT_CLOSING_CONFIG, state.rows.currentAccountClosings || [])
    .find((row) => row.processId === config.id && row.kind === "initial");
  return numberValue(initial?.saldoInicial);
}

function currentAccountImportedOpeningSuggestion(config) {
  const sourceRows = (state.rows[config.id] || [])
    .filter((row) => row.saldoDisponivelTags !== "" && row.saldoDisponivelTags !== undefined && row.saldoDisponivelTags !== null)
    .map((row) => config.calculate(row))
    .sort((a, b) => {
      const dateOrder = String(a.data || "").localeCompare(String(b.data || ""));
      if (dateOrder) return dateOrder;
      const timeOrder = String(a.hora || "").localeCompare(String(b.hora || ""));
      if (timeOrder) return timeOrder;
      return String(a.createdAt || a.id || "").localeCompare(String(b.createdAt || b.id || ""));
    });
  if (!sourceRows.length) return null;
  let delta = 0;
  let suggestion = null;
  sourceRows.forEach((row) => {
    delta += numberValue(row.tagsEntrada) - numberValue(row.tagsSaida);
    const importedBalance = numberValue(row.saldoDisponivelTags);
    suggestion = {
      saldoInicial: importedBalance - delta,
      saldoImportado: importedBalance,
      data: row.data,
    };
  });
  return suggestion;
}

function currentAccountWeekEnd(referenceKey = localDateKey()) {
  const key = businessDateKey(referenceKey);
  const start = weekStartKey(key);
  if (!start) return "";
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return addDaysKey(start, 4);
  const weekday = date.getDay();
  if (weekday === 0 || weekday >= 5) return addDaysKey(start, 4);
  return addDaysKey(start, -3);
}

function currentAccountWeekStartFromEnd(weekEnd) {
  return addDaysKey(weekEnd, -4);
}

function operationalWeekStartAfterClosing(weekEnd) {
  return addDaysKey(weekEnd, 3);
}

function syncOperationalFlowOpeningFromCurrentAccountClosing(config, closingRecord) {
  const stageId = CURRENT_ACCOUNT_OPERATIONAL_STAGE_MAP[config?.id];
  const saldoFisico = closingRecord?.saldoFisico;
  if (!stageId || saldoFisico === "" || saldoFisico === undefined || saldoFisico === null) return null;
  const nextWeekStart = operationalWeekStartAfterClosing(closingRecord.weekEnd);
  if (!nextWeekStart) return null;
  const existing = operationalFlowRecord(nextWeekStart);
  const now = new Date().toISOString();
  const actor = currentActorStamp();
  const record = {
    ...existing,
    id: existing.id || crypto.randomUUID(),
    weekStart: nextWeekStart,
    weekEnd: addDaysKey(nextWeekStart, 4),
    manual: existing.manual || {},
    manualDaily: existing.manualDaily || {},
    planning: {
      ...(existing.planning || {}),
      [stageId]: {
        ...((existing.planning || {})[stageId] || {}),
        opening: numberValue(saldoFisico),
      },
    },
    status: existing.status || "open",
    createdAt: existing.createdAt || now,
    updatedAt: now,
    updatedByProfileId: actor.profileId,
    updatedByName: actor.name,
  };
  const rows = state.rows.operationalFlow || [];
  const index = rows.findIndex((row) => row.weekStart === nextWeekStart);
  state.rows.operationalFlow = index >= 0
    ? rows.map((row, rowIndex) => rowIndex === index ? record : row)
    : [...rows, record];
  saveRows("operationalFlow", state.rows.operationalFlow);
  return record;
}

function currentAccountWeekRows(config, weekEnd = currentAccountWeekEnd()) {
  const start = currentAccountWeekStartFromEnd(weekEnd);
  return calculatedRows(config.id).filter((row) => {
    const date = businessDateKey(row.data);
    return date && date >= start && date <= weekEnd;
  });
}

function currentAccountLedgerRows(config) {
  let saldo = currentAccountOpeningBalance(config);
  const closings = currentAccountClosingRows(config.id)
    .filter((row) => row.saldoFisico !== "" && row.saldoFisico !== undefined && row.saldoFisico !== null);
  const rows = calculatedRows(config.id);
  return rows.map((row, index) => {
    saldo += numberValue(row.tagsEntrada) - numberValue(row.tagsSaida);
    const date = businessDateKey(row.data);
    const nextDate = businessDateKey(rows[index + 1]?.data);
    const closing = nextDate !== date ? closings.find((item) => item.weekEnd === date) : null;
    if (closing) saldo = numberValue(closing.saldoFisico);
    return {
      ...row,
      saldoDisponivelTags: saldo,
    };
  });
}

function currentAccountWeeklyTotals(config, weekEnd = currentAccountWeekEnd()) {
  const previousClosing = currentAccountClosingRows(config.id)
    .filter((row) => row.weekEnd < weekEnd && row.saldoFisico !== "" && row.saldoFisico !== undefined && row.saldoFisico !== null)
    .slice()
    .reverse()[0] || null;
  const opening = previousClosing ? numberValue(previousClosing.saldoFisico) : currentAccountOpeningBalance(config);
  const rows = currentAccountWeekRows(config, weekEnd);
  const entrada = rows.reduce((sum, row) => sum + numberValue(row.tagsEntrada), 0);
  const saida = rows.reduce((sum, row) => sum + numberValue(row.tagsSaida), 0);
  const saldoCalculado = opening + entrada - saida;
  const closing = currentAccountClosingRows(config.id).find((row) => row.weekEnd === weekEnd) || null;
  const hasPhysical = closing?.saldoFisico !== "" && closing?.saldoFisico !== undefined && closing?.saldoFisico !== null;
  const saldoFisico = hasPhysical ? numberValue(closing.saldoFisico) : "";
  const diferenca = hasPhysical ? saldoFisico - saldoCalculado : "";
  const confiabilidade = hasPhysical
    ? saldoFisico ? Math.max(0, 1 - Math.abs(numberValue(diferenca) / saldoFisico)) : diferenca === 0 ? 1 : 0
    : "";
  return { weekEnd, opening, rows, entrada, saida, saldoCalculado, saldoFisico, diferenca, confiabilidade, closing };
}

function currentAccountTotals(config) {
  const rows = currentAccountLedgerRows(config);
  const latestClosing = currentAccountLatestClosing(config.id);
  const opening = latestClosing ? numberValue(latestClosing.saldoFisico) : currentAccountOpeningBalance(config);
  const rowsAfterOpening = latestClosing
    ? rows.filter((row) => businessDateKey(row.data) > latestClosing.weekEnd)
    : rows;
  const entrada = rowsAfterOpening.reduce((sum, row) => sum + numberValue(row.tagsEntrada), 0);
  const saida = rowsAfterOpening.reduce((sum, row) => sum + numberValue(row.tagsSaida), 0);
  const saldo = opening + entrada - saida;
  const terceiro = config.id === "preElos" && rows.length ? numberValue(rows[rows.length - 1].saldoTerceiroTags) : 0;
  const ultimo = rows.slice().reverse().find((row) => row.data)?.data || "";
  return { rows, opening, entrada, saida, saldo, terceiro, ultimo };
}

function currentAccountHistoryColumns(config) {
  return [
    { key: "data", label: "Data" },
    { key: "tipoMovimento", label: "Tipo da movimentação" },
    { key: "tagsEntrada", label: "Entrada", numeric: true },
    { key: "tagsSaida", label: "Saída", numeric: true },
    { key: "saldoDisponivelTags", label: "Saldo", numeric: true },
    { key: "observacoes", label: "Observação" },
    { key: "actions", label: "" },
  ];
}

function canDeleteCurrentAccountRow(config, row) {
  return canDeleteRow(config, row);
}

function formatCurrentAccountCell(row, column) {
  if (column.key === "actions") {
    const config = currentAccountSelectedConfig();
    const viewButton = `<button class="icon-action view-row" data-current-account-view="${row.id}" type="button" aria-label="Visualizar" title="Visualizar">${rowActionIcon("view")}</button>`;
    const editButton = canEditRow(config, row)
      ? `<button class="icon-action edit-row" data-current-account-edit="${row.id}" type="button" aria-label="Editar" title="Editar">${rowActionIcon("edit")}</button>`
      : "";
    const deleteButton = canDeleteCurrentAccountRow(config, row)
      ? `<button class="icon-action delete-row" data-current-account-delete="${row.id}" type="button" aria-label="Excluir" title="Excluir">${rowActionIcon("delete")}</button>`
      : "";
    return `<div class="row-actions">${viewButton}${editButton}${deleteButton}</div>`;
  }
  if (column.key === "data") return formatDate(row.data);
  if (column.key === "hora") return row.hora || "";
  if (column.numeric) return row[column.key] !== "" && row[column.key] !== undefined && row[column.key] !== null ? formatNumber(row[column.key]) : "";
  return escapeHtml(row[column.key] || "");
}

function openCurrentAccountRecordView(rowId) {
  const config = currentAccountSelectedConfig();
  const dialog = document.querySelector("#recordViewDialog");
  const content = document.querySelector("#recordViewContent");
  if (!config || !dialog || !content) return;
  const row = currentAccountLedgerRows(config).find((item) => item.id === rowId);
  if (!row) return;
  document.querySelector("#recordViewTitle").textContent = `Movimento - ${currentAccountLabel(config)}`;
  content.innerHTML = currentAccountHistoryColumns(config)
    .filter((column) => column.key !== "actions")
    .map((column) => {
      const value = formatCurrentAccountCell(row, column);
      return `<div><span>${escapeHtml(column.label)}</span><strong>${escapeHtml(String(value || "-"))}</strong></div>`;
    }).join("");
  dialog.showModal();
}

async function deleteCurrentAccountRecord(rowId) {
  const config = currentAccountSelectedConfig();
  if (!config) return;
  const removedRow = (state.rows[config.id] || []).find((row) => row.id === rowId);
  if (!removedRow || !canDeleteCurrentAccountRow(config, removedRow)) return;
  const reference = `${currentAccountLabel(config)} em ${formatDate(removedRow.data)}`;
  if (!confirmMasterDeletion(`movimento de ${reference}`)) return;
  try {
    await voidTrustedProductionEntry(config, removedRow);
    await deleteOperationalRecord(config, removedRow);
  } catch (error) {
    alert(error.message || "Não foi possível confirmar a exclusão no banco.");
    return;
  }
  state.rows[config.id] = state.rows[config.id].filter((row) => row.id !== rowId);
  saveRows(config.id, state.rows[config.id]);
  invalidateProcessCache(config.id);
  state.inputLogs = window.PHAudit.createEvent({
    type: "movimento_conta_corrente_excluido",
    processId: config.id,
    processName: currentAccountLabel(config),
    profile: state.masterUnlocked ? "Gestor Master" : "Colaborador",
    summary: `Movimento excluído da conta corrente de ${currentAccountLabel(config)}.`,
    details: { removedRow },
  });
  renderCurrentAccount();
  renderOperationalDependents();
}

async function clearCurrentAccountTable() {
  const config = currentAccountSelectedConfig();
  if (!config || !state.masterUnlocked) {
    alert("A limpeza total da tabela é restrita ao Master.");
    return;
  }
  if (!canClearCurrentAccountConfig(config)) {
    alert("Você não tem permissão para limpar esta tabela.");
    return;
  }
  if (!state.authSession?.access_token) {
    alert("Sessão autenticada não encontrada. Entre novamente antes de limpar a tabela.");
    return;
  }
  const rows = currentAccountLedgerRows(config);
  if (!rows.length) {
    alert("Não há movimentos para limpar nesta conta corrente.");
    return;
  }
  const label = currentAccountLabel(config);
  if (!confirm(`Confirma a limpeza de ${rows.length} movimento(s) da conta corrente de ${label}? Esta ação afeta o banco de dados.`)) return;
  const typed = prompt(`Para confirmar a limpeza definitiva da tabela de ${label}, digite LIMPAR.`);
  if (typed !== "LIMPAR") return;
  const previousRows = [...(state.rows[config.id] || [])];
  try {
    await deleteOperationalRecordsByProcess(config, new Set());
  } catch (error) {
    alert(error.message || "Não foi possível limpar os movimentos no banco.");
    return;
  }
  state.rows[config.id] = [];
  saveRows(config.id, state.rows[config.id]);
  invalidateProcessCache(config.id);
  state.inputLogs = window.PHAudit.createEvent({
    type: "conta_corrente_limpa",
    processId: config.id,
    processName: label,
    profile: state.masterUnlocked ? "Gestor Master" : "Colaborador",
    summary: `Conta corrente de ${label} limpa.`,
    details: { removedRows: previousRows.length },
  });
  renderCurrentAccount();
  renderOperationalDependents();
}

function renderCurrentAccountClosing(config) {
  const weekInput = document.querySelector("#currentAccountWeekEnd");
  const initialInput = document.querySelector("#currentAccountInitialBalance");
  const physicalInput = document.querySelector("#currentAccountPhysicalBalance");
  if (!weekInput || !initialInput || !physicalInput) return;
  const weekEnd = weekInput.value || currentAccountWeekEnd();
  weekInput.value = weekEnd;
  const weekly = currentAccountWeeklyTotals(config, weekEnd);
  const importedSuggestion = currentAccountImportedOpeningSuggestion(config);
  initialInput.value = currentAccountOpeningBalance(config) || "";
  physicalInput.value = weekly.saldoFisico !== "" ? weekly.saldoFisico : "";
  document.querySelector("#currentAccountWeekEntries").textContent = formatNumber(weekly.entrada);
  document.querySelector("#currentAccountWeekOutputs").textContent = formatNumber(weekly.saida);
  document.querySelector("#currentAccountCalculatedBalance").textContent = formatNumber(weekly.saldoCalculado);
  document.querySelector("#currentAccountBalanceDiff").textContent = weekly.diferenca === "" ? "--" : formatNumber(weekly.diferenca);
  document.querySelector("#currentAccountReliability").textContent = weekly.confiabilidade === "" ? "--" : formatPercent(weekly.confiabilidade);
  const importedHint = document.querySelector("#currentAccountImportedBalanceHint");
  if (importedHint) {
    importedHint.textContent = importedSuggestion
      ? `Saldo importado mais recente: ${formatNumber(importedSuggestion.saldoImportado)} em ${formatDate(importedSuggestion.data)}. Saldo base sugerido: ${formatNumber(importedSuggestion.saldoInicial)}.`
      : "Sem saldo importado para sugerir base. Informe manualmente o saldo inicial conferido.";
  }
  const importButton = document.querySelector("#applyImportedCurrentAccountBalanceButton");
  if (importButton) importButton.disabled = !importedSuggestion;
}

function updateCurrentAccountClosingPreview() {
  const config = currentAccountSelectedConfig();
  if (!config) return;
  const weekEnd = document.querySelector("#currentAccountWeekEnd")?.value || currentAccountWeekEnd();
  const physicalInput = document.querySelector("#currentAccountPhysicalBalance");
  const weekly = currentAccountWeeklyTotals(config, weekEnd);
  const physicalRaw = physicalInput?.value;
  const hasPhysical = physicalRaw !== "" && physicalRaw !== undefined && physicalRaw !== null;
  const physical = hasPhysical ? numberValue(physicalRaw) : weekly.saldoCalculado;
  const diff = hasPhysical ? physical - weekly.saldoCalculado : 0;
  const reliability = hasPhysical
    ? physical ? Math.max(0, 1 - Math.abs(numberValue(diff) / physical)) : diff === 0 ? 1 : 0
    : 1;
  document.querySelector("#currentAccountBalanceDiff").textContent = formatNumber(diff);
  document.querySelector("#currentAccountReliability").textContent = hasPhysical ? formatPercent(reliability) : "Automático";
}

function applyImportedCurrentAccountBalance() {
  const config = currentAccountSelectedConfig();
  if (!config) return;
  const suggestion = currentAccountImportedOpeningSuggestion(config);
  const input = document.querySelector("#currentAccountInitialBalance");
  const message = document.querySelector("#currentAccountClosingMessage");
  if (!suggestion || !input) {
    if (message) message.textContent = "Não existe saldo importado disponível para sugerir o saldo base.";
    return;
  }
  input.value = Math.round(numberValue(suggestion.saldoInicial));
  if (message) {
    message.textContent = `Saldo base sugerido aplicado: ${formatNumber(input.value)} tags. Clique em Salvar saldo base para gravar.`;
  }
  updateCurrentAccountClosingPreview();
}

async function saveCurrentAccountClosing() {
  const config = currentAccountSelectedConfig();
  if (!config) return;
  const previousClosings = [...(state.rows.currentAccountClosings || [])];
  const previousOperationalFlowRows = [...(state.rows.operationalFlow || [])];
  const initialBalance = numberValue(document.querySelector("#currentAccountInitialBalance")?.value);
  const weekEnd = document.querySelector("#currentAccountWeekEnd")?.value || currentAccountWeekEnd();
  const physicalRaw = document.querySelector("#currentAccountPhysicalBalance")?.value;
  const physicalFilled = String(physicalRaw ?? "").trim() !== "";
  const weekly = currentAccountWeeklyTotals(config, weekEnd);
  const previousClosing = currentAccountClosingRows(config.id)
    .filter((row) => row.weekEnd < weekEnd && row.saldoFisico !== "" && row.saldoFisico !== undefined && row.saldoFisico !== null)
    .slice()
    .reverse()[0] || null;
  const effectiveOpening = previousClosing ? numberValue(previousClosing.saldoFisico) : initialBalance;
  const effectiveCalculated = effectiveOpening + weekly.entrada - weekly.saida;
  const closingPhysicalBalance = physicalFilled ? numberValue(physicalRaw) : effectiveCalculated;
  const closingDiff = closingPhysicalBalance - effectiveCalculated;
  const closingReliability = physicalFilled
    ? closingPhysicalBalance ? Math.max(0, 1 - Math.abs(closingDiff / closingPhysicalBalance)) : closingDiff === 0 ? 1 : 0
    : 1;
  const now = new Date().toISOString();
  const actor = currentActorStamp();
  const initialRecord = {
    id: `initial:${config.id}`,
    kind: "initial",
    processId: config.id,
    saldoInicial: initialBalance,
    updatedAt: now,
    updatedByProfileId: actor.profileId,
    updatedByName: actor.name,
  };
  const closingRecord = {
    id: weekly.closing?.id || `closing:${config.id}:${weekEnd}`,
    kind: "weekly",
    processId: config.id,
    processName: currentAccountLabel(config),
    weekStart: currentAccountWeekStartFromEnd(weekEnd),
    weekEnd,
    saldoInicial: effectiveOpening,
    entradas: weekly.entrada,
    saidas: weekly.saida,
    saldoCalculado: effectiveCalculated,
    saldoFisico: closingPhysicalBalance,
    saldoFechamento: closingPhysicalBalance,
    fechamentoAutomatico: !physicalFilled,
    diferenca: closingDiff,
    confiabilidade: closingReliability,
    updatedAt: now,
    updatedByProfileId: actor.profileId,
    updatedByName: actor.name,
  };
  const others = (state.rows.currentAccountClosings || []).filter((row) =>
    !(row.processId === config.id && row.kind === "initial")
    && !(row.processId === config.id && row.kind !== "initial" && row.weekEnd === weekEnd)
  );
  state.rows.currentAccountClosings = [...others, initialRecord, closingRecord];
  saveRows("currentAccountClosings", state.rows.currentAccountClosings);
  const message = document.querySelector("#currentAccountClosingMessage");
  try {
    if (message) message.textContent = "Sincronizando fechamento na base...";
    await persistCurrentAccountClosingRecord(initialRecord);
    markRowAsSynced(CURRENT_ACCOUNT_CLOSING_CONFIG, initialRecord, "legacy_operational_records");
    await persistCurrentAccountClosingRecord(closingRecord);
    markRowAsSynced(CURRENT_ACCOUNT_CLOSING_CONFIG, closingRecord, "legacy_operational_records");
    const syncedFlowRecord = syncOperationalFlowOpeningFromCurrentAccountClosing(config, closingRecord);
    if (syncedFlowRecord) {
      await persistOperationalRecord(PROCESS_CONFIGS.operationalFlow, syncedFlowRecord);
      markRowAsSynced(PROCESS_CONFIGS.operationalFlow, syncedFlowRecord, "legacy_operational_records");
    }
  } catch (error) {
    state.rows.currentAccountClosings = previousClosings;
    state.rows.operationalFlow = previousOperationalFlowRows;
    saveRows("currentAccountClosings", state.rows.currentAccountClosings);
    saveRows("operationalFlow", state.rows.operationalFlow);
    if (message) message.textContent = error.message || "Fechamento não sincronizado. Atualize a tela e tente novamente.";
    renderCurrentAccount();
    return;
  }
  saveRows("currentAccountClosings", state.rows.currentAccountClosings);
  saveRows("operationalFlow", state.rows.operationalFlow);
  if (message) message.textContent = `Fechamento de ${currentAccountLabel(config)} salvo para ${formatDate(weekEnd)}.`;
  renderCurrentAccount();
  renderOperationalDependents();
}

async function saveCurrentAccountBaseBalance() {
  const config = currentAccountSelectedConfig();
  if (!config) return;
  const previousClosings = [...(state.rows.currentAccountClosings || [])];
  const initialBalance = numberValue(document.querySelector("#currentAccountInitialBalance")?.value);
  const now = new Date().toISOString();
  const actor = currentActorStamp();
  const initialRecord = {
    id: `initial:${config.id}`,
    kind: "initial",
    processId: config.id,
    processName: currentAccountLabel(config),
    saldoInicial: initialBalance,
    updatedAt: now,
    updatedByProfileId: actor.profileId,
    updatedByName: actor.name,
  };
  const others = (state.rows.currentAccountClosings || []).filter((row) =>
    !(row.processId === config.id && row.kind === "initial")
  );
  state.rows.currentAccountClosings = [...others, initialRecord];
  saveRows("currentAccountClosings", state.rows.currentAccountClosings);
  const message = document.querySelector("#currentAccountClosingMessage");
  try {
    if (message) message.textContent = "Sincronizando saldo base na base...";
    await persistCurrentAccountClosingRecord(initialRecord);
    markRowAsSynced(CURRENT_ACCOUNT_CLOSING_CONFIG, initialRecord, "legacy_operational_records");
  } catch (error) {
    state.rows.currentAccountClosings = previousClosings;
    saveRows("currentAccountClosings", state.rows.currentAccountClosings);
    if (message) message.textContent = error.message || "Saldo base não sincronizado. Atualize a tela e tente novamente.";
    renderCurrentAccount();
    return;
  }
  saveRows("currentAccountClosings", state.rows.currentAccountClosings);
  if (message) message.textContent = `Saldo base de ${currentAccountLabel(config)} salvo: ${formatNumber(initialBalance)} tags.`;
  renderCurrentAccount();
  renderOperationalDependents();
}

function renderCurrentAccount() {
  const configs = currentAccountConfigs();
  const config = currentAccountSelectedConfig();
  if (!config) return;
  state.launchProcessId = config.id;
  const list = document.querySelector("#currentAccountSectorList");
  if (list) {
    const layout = document.querySelector(".current-account-layout");
    if (layout) layout.dataset.sectorCount = String(configs.length);
    list.innerHTML = configs.map((item) => {
      const totals = currentAccountTotals(item);
      const active = item.id === config.id ? "active" : "";
      const status = totals.saldo < 0 ? "Saldo negativo" : totals.rows.length ? "Saldo atualizado" : "Sem movimentos";
      return `
        <button class="current-account-sector ${active}" data-current-account-sector="${item.id}" type="button">
          <i>${launchSectorIcon(item.id)}</i>
          <span>${escapeHtml(currentAccountLabel(item))}</span>
          <strong>${formatNumber(totals.saldo)} tags</strong>
          <small>${status}</small>
        </button>
      `;
    }).join("");
  }

  const totals = currentAccountTotals(config);
  const sectorLabel = currentAccountLabel(config);
  const canWrite = canWriteCurrentAccountConfig(config);
  document.querySelector("#currentAccountSummary").innerHTML = `
    <article><span>Setor</span><strong>${escapeHtml(sectorLabel)}</strong><small>Conta corrente em tags</small></article>
    <article><span>Saldo base</span><strong>${formatNumber(totals.opening)}</strong><small>Saldo inicial ou último fechamento físico</small></article>
    <article class="flow-ok"><span>Entradas após base</span><strong>${formatNumber(totals.entrada)}</strong><small>Tags que entraram após a base</small></article>
    <article><span>Saídas após base</span><strong>${formatNumber(totals.saida)}</strong><small>Tags consumidas ou liberadas após a base</small></article>
    <article class="current-account-balance-card ${totals.saldo < 0 ? "flow-alert" : "flow-ok"}"><span>Saldo atual</span><strong>${formatNumber(totals.saldo)}</strong><small>${totals.ultimo ? `Último movimento em ${formatDate(totals.ultimo)}` : "Ainda sem movimento"}</small></article>
    ${config.id === "preElos" ? `<article><span>Saldo em terceiro</span><strong>${formatNumber(totals.terceiro)}</strong><small>Enviado menos retorno de terceiro</small></article>` : ""}
  `;
  renderCurrentAccountClosing(config);
  const closingButton = document.querySelector("#saveCurrentAccountClosingButton");
  if (closingButton) closingButton.hidden = !canWrite;
  const baseButton = document.querySelector("#saveCurrentAccountBaseButton");
  if (baseButton) baseButton.hidden = !canWrite;
  const importedBalanceButton = document.querySelector("#applyImportedCurrentAccountBalanceButton");
  if (importedBalanceButton) importedBalanceButton.hidden = !canWrite;

  const shell = document.querySelector("#launchFormShell");
  const mount = document.querySelector("#currentAccountFormMount");
  if (shell && mount && shell.parentElement !== mount) mount.appendChild(shell);
  document.querySelector("#launchFormShell").hidden = !canWrite;
  document.querySelector("#launchSelectedTitle").textContent = sectorLabel;
  const openButton = document.querySelector("#openLaunchFormButton");
  if (openButton) {
    openButton.hidden = !canWrite;
    openButton.textContent = "Novo movimento";
  }
  document.querySelector("#changeLaunchSectorButton").hidden = true;
  const formPanel = document.querySelector(".form-panel");
  const showForm = Boolean(canWrite && (state.currentAccountFormOpen || state.editingRow?.processId === config.id));
  if (formPanel) formPanel.hidden = !showForm;
  document.querySelector(".form-panel .panel-label").textContent = state.editingRow ? "Editar movimento" : "Novo movimento";
  if (showForm) {
    renderForm(config);
    updatePreview();
  }
  const embeddedHistory = document.querySelector("#launchHistoryPanel");
  if (embeddedHistory) embeddedHistory.hidden = true;

  const columns = currentAccountHistoryColumns(config);
  const exportButton = document.querySelector("#exportCurrentAccountButton");
  const importButton = document.querySelector("#importCurrentAccountButton");
  const clearButton = document.querySelector("#clearCurrentAccountButton");
  if (exportButton) exportButton.hidden = !canExportCurrentAccountConfig(config);
  if (importButton) importButton.hidden = !canImportCurrentAccountConfig(config);
  if (clearButton) clearButton.hidden = !canClearCurrentAccountConfig(config);
  const rows = totals.rows.slice().sort((a, b) => {
    const dateOrder = String(b.data || "").localeCompare(String(a.data || ""));
    if (dateOrder) return dateOrder;
    const timeOrder = String(b.hora || "").localeCompare(String(a.hora || ""));
    if (timeOrder) return timeOrder;
    return String(b.createdAt || b.id || "").localeCompare(String(a.createdAt || a.id || ""));
  });
  document.querySelector("#currentAccountHistoryTitle").textContent = `${sectorLabel} - movimentos realizados`;
  document.querySelector("#currentAccountHistoryHead").innerHTML = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
  document.querySelector("#currentAccountHistoryBody").innerHTML = rows.length
    ? rows.map((row) => `<tr>${columns.map((column) => `<td>${formatCurrentAccountCell(row, column)}</td>`).join("")}</tr>`).join("")
    : `<tr><td class="empty-state" colspan="${columns.length}">Nenhum movimento registrado nesta conta corrente.</td></tr>`;
  refreshTableTopScrollbars();
}

function launchFormHasData() {
  if (state.editingRow) return true;
  const form = document.querySelector("#processForm");
  if (!form) return false;
  return [...form.querySelectorAll("input, select, textarea")].some((element) => {
    if (element.type === "hidden" || element.disabled) return false;
    if (element.dataset.field === "data") {
      const value = businessDateKey(element.value);
      return Boolean(value && value !== localDateKey());
    }
    return String(element.value || "").trim() !== "";
  });
}

function activeFormHasUnsavedData() {
  const form = document.querySelector("#processForm");
  if (!form) return false;
  const formContextActive = state.activeProcessId === "launch"
    || state.activeProcessId === "currentAccount"
    || Boolean(state.launchProcessId)
    || Boolean(state.editingRow);
  return formContextActive && launchFormHasData();
}

function leaveLaunchForm() {
  if (launchFormHasData() && !confirm("Existem dados preenchidos que ainda não foram salvos. Deseja sair deste formulário?")) return;
  state.editingRow = null;
  state.editReturnProcessId = "";
  state.launchProcessId = null;
  state.launchFormOpen = false;
  state.currentAccountFormOpen = false;
  if (state.masterUnlocked) {
    setActiveProcess("launchMonitor");
    return;
  }
  setActiveProcess("launch");
  renderLaunch();
}

function launchMonitorConfigs() {
  return implementedConfigs().filter((config) => !config.indicator && !config.hidden && !config.archived);
}

function renderLaunchMonitor() {
  const configs = launchMonitorConfigs();
  const statuses = configs.map((config) => ({ config, status: launchInputStatus(config) }));
  const current = statuses.filter((item) => item.status.className === "has-current-input").length;
  const stale = statuses.filter((item) => item.status.className === "has-stale-input").length;
  const empty = statuses.filter((item) => item.status.className === "has-no-input").length;
  document.querySelector("#launchMonitorSummary").innerHTML = `
    <article><span>Setores acompanhados</span><strong>${formatNumber(configs.length)}</strong></article>
    <article class="monitor-ok"><span>Com registro hoje</span><strong>${formatNumber(current)}</strong></article>
    <article class="monitor-pending"><span>Sem registro hoje</span><strong>${formatNumber(stale)}</strong></article>
    <article><span>Sem histórico</span><strong>${formatNumber(empty)}</strong></article>
  `;
  document.querySelector("#launchMonitorUpdatedAt").textContent = `Atualizado em ${formatDateTime(new Date().toISOString())}`;
  document.querySelector("#launchMonitorCards").innerHTML = statuses.map(({ config, status }, index) => `
    <button class="launch-sector-card monitor-card tone-${(index % 7) + 1} ${status.className}" data-monitor-process="${config.id}" type="button" aria-label="Consultar histórico de ${escapeHtml(config.name)}">
      <i>${launchSectorIcon(config.id)}</i>
      <span>${escapeHtml(config.name)}</span>
      <small class="launch-sector-status">${escapeHtml(status.label)}</small>
      ${(status.detailLines || [status.detail]).filter(Boolean).map((line) => `<em>${escapeHtml(line)}</em>`).join("")}
      <b>Consultar histórico</b>
    </button>
  `).join("");
}

async function refreshLaunchMonitor() {
  const button = document.querySelector("#refreshLaunchMonitorButton");
  if (button) {
    button.disabled = true;
    button.textContent = "Sincronizando...";
  }
  await syncFromSupabase();
  renderLaunchMonitor();
  if (button) {
    button.disabled = false;
    button.textContent = "Atualizar status";
  }
}

function setMonthlyCloseHidden(hidden) {
  const area = document.querySelector("#monthlyCloseArea");
  if (area) area.hidden = hidden;
}

function setProcessActions(config) {
  const seedButton = document.querySelector("#seedButton");
  const exportButton = document.querySelector("#exportButton");
  const templateButton = document.querySelector("#templateButton");
  const importButton = document.querySelector("#importButton");
  const saveSectorCostsButton = document.querySelector("#saveSectorCostsButton");
  const isSectorCosts = config?.id === "custosSetores";
  const canSaveCurrentTable = Boolean(config?.id && state.rows[config.id] && canEditProcess(config.id));
  if (seedButton) seedButton.hidden = true;
  if (exportButton) {
    exportButton.hidden = !canExportProcess(config?.id);
    exportButton.textContent = config?.id === "prestadoresServicos" ? "Exportar CSV" : "Exportar Excel";
  }
  if (templateButton) templateButton.hidden = isSectorCosts || !canImportProcess(config?.id);
  if (importButton) importButton.hidden = isSectorCosts || !canImportProcess(config?.id);
  if (saveSectorCostsButton) {
    saveSectorCostsButton.hidden = !canSaveCurrentTable;
    saveSectorCostsButton.textContent = "Salvar tudo";
    saveSectorCostsButton.title = "Salvar todas as alterações da tabela atual";
  }
}

function setSpecialProcessActions(kind) {
  setProcessActions(null);
  const saveButton = document.querySelector("#saveSectorCostsButton");
  if (!saveButton) return;
  let allowed = false;
  if (kind === "currentAccount") {
    const config = currentAccountSelectedConfig();
    allowed = Boolean(config && canWriteCurrentAccountConfig(config));
  } else if (kind === "operationalFlow") {
    allowed = canEditProcess("operationalFlow");
  }
  saveButton.hidden = !allowed;
  saveButton.disabled = false;
  saveButton.textContent = "Salvar tudo";
  saveButton.title = kind === "currentAccount"
    ? "Salvar alterações da Conta Corrente atual"
    : "Salvar alterações do Fluxo Operacional";
}

async function saveAllSectorCosts() {
  const config = configFor("custosSetores");
  const button = document.querySelector("#saveSectorCostsButton");
  if (!config) return false;
  if (!canEditProcess("custosSetores")) {
    showSystemToast("Seu perfil não tem permissão para salvar custos.", "error");
    return false;
  }
  const previousRows = (state.rows.custosSetores || []).slice();
  const rows = normalizeSectorCostBase(currentSectorPolicyRows().map((row) => ({
    ...row,
    id: row.id || crypto.randomUUID(),
    custoMensal: numberValue(row.custoMensal),
    custoMdoDia: numberValue(row.custoMdoDia),
    metaDiaria: numberValue(row.metaDiaria),
  })));
  if (!rows.length) {
    showSystemToast("Não há registros de custos para salvar.", "info");
    return false;
  }
  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Salvando...";
    }
    state.rows.custosSetores = rows;
    saveRows("custosSetores", rows);
    invalidateProcessCache("custosSetores");
    if (state.authSession?.access_token) {
      for (const row of rows) {
        await persistOperationalRecordStrict(config, row);
      }
    }
    renderOperationalDependents();
    if (state.activeProcessId === "custosSetores") renderProcess();
    const message = persistedStatusMessage("Custos salvos");
    showSystemToast(message, state.authSession?.access_token ? "success" : "info");
    return true;
  } catch (error) {
    state.rows.custosSetores = previousRows;
    saveRows("custosSetores", previousRows);
    invalidateProcessCache("custosSetores");
    if (state.activeProcessId === "custosSetores") renderProcess();
    showSystemToast(error.message || "Não foi possível salvar custos no banco.", "error");
    return false;
  } finally {
    const currentButton = document.querySelector("#saveSectorCostsButton");
    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent = "Salvar tudo";
    }
  }
}

async function saveAllCurrentAccountScreen() {
  const config = currentAccountSelectedConfig();
  const button = document.querySelector("#saveSectorCostsButton");
  if (!config) return false;
  if (!canWriteCurrentAccountConfig(config)) {
    showSystemToast(`Seu perfil não tem permissão para salvar ${currentAccountLabel(config)}.`, "error");
    return false;
  }
  const rows = state.rows[config.id] || [];
  const closings = (state.rows.currentAccountClosings || []).filter((row) => row.processId === config.id);
  if (!rows.length && !closings.length) {
    showSystemToast(`Não há alterações em ${currentAccountLabel(config)} para salvar.`, "info");
    return false;
  }
  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Salvando...";
    }
    saveRows(config.id, rows);
    saveRows("currentAccountClosings", state.rows.currentAccountClosings || []);
    invalidateProcessCache(config.id);
    if (state.authSession?.access_token) {
      await persistAllRowsForConfig(config, rows);
      saveRows(config.id, rows);
      for (const closing of closings) {
        await persistCurrentAccountClosingRecord(closing);
        markRowAsSynced(CURRENT_ACCOUNT_CLOSING_CONFIG, closing, "legacy_operational_records");
      }
    }
    saveRows("currentAccountClosings", state.rows.currentAccountClosings || []);
    renderOperationalDependents();
    renderCurrentAccount();
    showSystemToast(persistedStatusMessage(`${currentAccountLabel(config)} salvo`), state.authSession?.access_token ? "success" : "info");
    return true;
  } catch (error) {
    showSystemToast(error.message || `Não foi possível salvar ${currentAccountLabel(config)}.`, "error");
    return false;
  } finally {
    const currentButton = document.querySelector("#saveSectorCostsButton");
    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent = "Salvar tudo";
    }
  }
}

async function saveAllOperationalFlowScreen() {
  const button = document.querySelector("#saveSectorCostsButton");
  if (!canEditProcess("operationalFlow")) {
    showSystemToast("Seu perfil não tem permissão para salvar o Fluxo Operacional.", "error");
    return false;
  }
  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Salvando...";
    }
    await saveOperationalFlow();
    showSystemToast("Fluxo Operacional salvo.", "success");
    return true;
  } catch (error) {
    showSystemToast(error.message || "Não foi possível salvar o Fluxo Operacional.", "error");
    return false;
  } finally {
    const currentButton = document.querySelector("#saveSectorCostsButton");
    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent = "Salvar tudo";
    }
  }
}

async function persistAllRowsForConfig(config, rows) {
  for (const row of rows) {
    if (trustedProductionConfig(config)) {
      await persistTrustedProductionEntry(config, row);
      markRowAsSynced(config, row, "trusted_production_entries");
    } else if (config.currentAccountLedger || config.operationalOnly || shouldPersistOperationalRecordStrictly(config)) {
      await persistOperationalRecordStrict(config, row);
      markRowAsSynced(config, row, "legacy_operational_records");
    } else {
      await persistOperationalRecord(config, row);
      markRowAsSynced(config, row, "legacy_operational_records");
    }
  }
}

async function saveAllCurrentProcessRows() {
  if (state.activeProcessId === "currentAccount") return saveAllCurrentAccountScreen();
  if (state.activeProcessId === "operationalFlow") return saveAllOperationalFlowScreen();
  const config = configFor();
  const button = document.querySelector("#saveSectorCostsButton");
  if (!config?.id) return false;
  if (config.id === "custosSetores") return saveAllSectorCosts();
  if (!canWriteCentralData(config)) {
    showSystemToast("Entre com usuário autenticado antes de salvar. Gravação local não sincroniza com os colaboradores.", "error");
    return false;
  }
  if (!canEditProcess(config.id)) {
    showSystemToast(`Seu perfil não tem permissão para salvar ${config.name}.`, "error");
    return false;
  }
  const rows = state.rows[config.id] || [];
  if (!rows.length) {
    showSystemToast(`Não há registros em ${config.name} para salvar.`, "info");
    return false;
  }
  const previousRows = rows.slice();
  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Salvando...";
    }
    saveRows(config.id, rows);
    invalidateProcessCache(config.id);
    if (state.authSession?.access_token) {
      await persistAllRowsForConfig(config, rows);
      saveRows(config.id, rows);
    }
    renderOperationalDependents();
    renderProcess();
    showSystemToast(persistedStatusMessage(`${config.name} salvo`), state.authSession?.access_token ? "success" : "info");
    return true;
  } catch (error) {
    state.rows[config.id] = previousRows;
    saveRows(config.id, previousRows);
    invalidateProcessCache(config.id);
    renderProcess();
    showSystemToast(error.message || `Não foi possível salvar ${config.name}.`, "error");
    return false;
  } finally {
    const currentButton = document.querySelector("#saveSectorCostsButton");
    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent = "Salvar tudo";
    }
  }
}

function canExportProcess(processId) {
  if (!processId || !configFor(processId)) return false;
  if (state.masterUnlocked) return true;
  return Boolean(accessForProcessId(processId)?.can_export);
}

function canImportProcess(processId) {
  if (!processId || !configFor(processId)) return false;
  if (state.masterUnlocked) return true;
  return Boolean(accessForProcessId(processId)?.can_import);
}

function updateProcessBackButton(process) {
  const button = document.querySelector("#processBackButton");
  if (!button) return;
  const hide = !process || process.dashboard || process.profile;
  button.hidden = hide;
  button.textContent = process?.launch ? "Voltar" : "Voltar à visão";
}

function goBackFromProcess() {
  const process = processBlocks.find((item) => item.id === state.activeProcessId);
  if (process?.launch && state.launchProcessId) {
    leaveLaunchForm();
    return;
  }
  setActiveProcess(state.masterUnlocked ? "launchMonitor" : "launch");
}

function setActiveProcess(processId) {
  if (processId === "dashboard") processId = state.masterUnlocked ? "launchMonitor" : "launch";
  let process = processBlocks.find((item) => item.id === processId) || visibleProcessBlocks()[0];
  if (!canAccessProcess(process)) process = visibleProcessBlocks()[0];
  if (!state.masterUnlocked && configFor(process?.id) && !configFor(process.id).indicator) {
    process = processBlocks.find((item) => item.launch);
  }
  if (!process) {
    showAuthGate("Perfil sem permissões liberadas. Procure o Gestor Master.");
    return;
  }
  state.activeProcessId = process.id;
  sessionStorage.setItem(ACTIVE_PROCESS_SESSION_KEY, process.id);
  document.querySelector(".app-shell").dataset.process = process.id;
  updateProcessBackButton(process);
  const config = configFor(process.id);
  document.querySelector("#absenteeismAnalytics").hidden = true;
  document.querySelector("#peopleAnalytics").hidden = true;
  document.querySelector("#providersAnalytics").hidden = true;
  document.querySelector("#accessManagementArea").hidden = true;
  document.querySelector("#profileArea").hidden = true;
  document.querySelector("#productionManagementArea").hidden = true;
  document.querySelector("#launchMonitorArea").hidden = true;
  document.querySelector("#operationalFlowArea").hidden = true;
  document.querySelector("#currentAccountArea").hidden = true;
  document.querySelector("#weeklyClosingArea").hidden = true;
  document.querySelector("#diagnosticsArea").hidden = true;
  document.querySelector("#productionSnapshot").hidden = true;
  if (process.profile) {
    document.querySelector("#processTitle").textContent = "Meu Perfil";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = false;
    document.querySelector("#productionManagementArea").hidden = true;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderProfile();
    return;
  }
  if (process.dashboard) {
    document.querySelector("#processTitle").textContent = "Visão da Fábrica";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = false;
    document.querySelector("#productionManagementArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderDashboard();
    syncFromSupabase().catch((error) => {
      console.warn("Sincronização da Visão da Fábrica não concluída:", error);
    });
    return;
  }
  if (process.accessManagement) {
    document.querySelector("#processTitle").textContent = "Gestão de Acessos";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = false;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    refreshAccessManagement();
    return;
  }
  if (process.launchMonitor) {
    document.querySelector("#processTitle").textContent = "Lançamentos de Produção";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    document.querySelector("#launchMonitorArea").hidden = false;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderLaunchMonitor();
    refreshLaunchMonitor();
    return;
  }
  if (process.productionManagement) {
    document.querySelector("#processTitle").textContent = "Gestão de Produção";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = false;
    document.querySelector("#launchMonitorArea").hidden = true;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderProductionManagement();
    syncFromSupabase().then(renderProductionManagement).catch((error) => {
      console.warn("Sincronização da Gestão de Produção não concluída:", error);
    });
    return;
  }
  if (process.operationalFlow) {
    document.querySelector("#processTitle").textContent = "Fluxo Operacional";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    document.querySelector("#operationalFlowArea").hidden = false;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setSpecialProcessActions("operationalFlow");
    renderProcessNav();
    renderOperationalFlow();
    syncFromSupabase().catch((error) => {
      console.warn("Sincronização do Fluxo Operacional não concluída:", error);
    });
    return;
  }
  if (process.currentAccount) {
    document.querySelector("#processTitle").textContent = "Conta Corrente";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = false;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setSpecialProcessActions("currentAccount");
    renderProcessNav();
    renderCurrentAccount();
    syncFromSupabase().catch((error) => {
      console.warn("Sincronização da Conta Corrente não concluída:", error);
    });
    return;
  }
  if (process.weeklyClosing) {
    document.querySelector("#processTitle").textContent = "Fechamento Semanal";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    document.querySelector("#launchMonitorArea").hidden = true;
    document.querySelector("#operationalFlowArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#weeklyClosingArea").hidden = false;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderWeeklyClosing();
    syncFromSupabase().then(renderWeeklyClosing).catch((error) => {
      console.warn("Sincronização do Fechamento Semanal não concluída:", error);
    });
    return;
  }
  if (process.diagnostics) {
    document.querySelector("#processTitle").textContent = "Diagnóstico do Sistema";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    document.querySelector("#diagnosticsArea").hidden = false;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderDiagnostics();
    refreshDiagnostics();
    return;
  }
  if (process.launch) {
    document.querySelector("#processTitle").textContent = "Lançamentos";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = false;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderLaunch();
    syncFromSupabase().catch((error) => {
      console.warn("Sincronização dos Lançamentos não concluída:", error);
    });
    return;
  }
  if (process.logs) {
    document.querySelector("#processTitle").textContent = "Logs";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = false;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    setMonthlyCloseHidden(true);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderLogs();
    refreshTrustedLogs();
    return;
  }
  if (process.monthlyClose) {
    document.querySelector("#processTitle").textContent = "Fechamento do Mês";
    document.querySelector("#sourceLabel").textContent = "";
    document.querySelector("#processSummary").hidden = true;
    document.querySelector("#activeWorkArea").hidden = true;
    document.querySelector("#launchArea").hidden = true;
    document.querySelector("#logsArea").hidden = true;
    document.querySelector("#currentAccountArea").hidden = true;
    document.querySelector("#accessManagementArea").hidden = true;
    document.querySelector("#profileArea").hidden = true;
    document.querySelector("#productionManagementArea").hidden = true;
    setMonthlyCloseHidden(false);
    document.querySelector("#placeholderArea").hidden = true;
    document.querySelector("#dashboardArea").hidden = true;
    setProcessActions(null);
    renderProcessNav();
    renderMonthlyClose();
    return;
  }
  document.querySelector("#processTitle").textContent = process.name;
  document.querySelector("#sourceLabel").textContent = "";
  document.querySelector("#processSummary").hidden = !config || !config.indicator;
  document.querySelector("#activeWorkArea").hidden = !config;
  document.querySelector("#launchArea").hidden = true;
  document.querySelector("#logsArea").hidden = true;
  document.querySelector("#currentAccountArea").hidden = true;
  document.querySelector("#accessManagementArea").hidden = true;
  document.querySelector("#profileArea").hidden = true;
  document.querySelector("#productionManagementArea").hidden = true;
  setMonthlyCloseHidden(true);
  document.querySelector("#placeholderArea").hidden = !!config;
  document.querySelector("#dashboardArea").hidden = true;
  document.querySelector("#placeholderTitle").textContent = process.name;
  setProcessActions(config);
  if (config) {
    searchInput.placeholder = `Buscar na tabela ${config.name}...`;
    renderNewRecordButton(config);
    renderProcess();
  }
  renderProcessNav();
}

function renderNewRecordButton(config) {
  const button = document.querySelector("#newRecordButton");
  if (!button) return;
  const canCreateFromProcess = canCreateProcess(config.id) && (config.indicator || !config.pending);
  button.hidden = !canCreateFromProcess;
  button.textContent = `Incluir novo`;
}

function availableTablePeriods(config) {
  const months = new Map();
  calculatedRows(config.id).forEach((row) => {
    const key = String(row.competencia || businessDateKey(row.data).slice(0, 7));
    if (!key || key.length !== 7) return;
    months.set(key, monthLabel(key));
  });
  return [...months.entries()].sort(([a], [b]) => b.localeCompare(a));
}

function defaultTablePeriod(config) {
  const periods = availableTablePeriods(config);
  const currentMonth = localDateKey().slice(0, 7);
  if (periods.some(([value]) => value === currentMonth)) return currentMonth;
  return periods[0]?.[0] || "all";
}

function renderTablePeriodFilter(config) {
  const select = document.querySelector("#tablePeriodFilter");
  if (!select) return;
  const wrapper = document.querySelector(".table-period-filter");
  const withoutPeriod = config.id === "custosSetores" || config.id === "colaboradores";
  if (wrapper) wrapper.hidden = withoutPeriod;
  if (withoutPeriod) {
    select.innerHTML = `<option value="all">Todos</option>`;
    select.value = "all";
    state.tablePeriods[config.id] = "all";
    return;
  }
  const periods = availableTablePeriods(config);
  const saved = state.tablePeriods[config.id];
  const current = saved || defaultTablePeriod(config);
  select.innerHTML = `<option value="all">Histórico geral</option>${periods.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
  select.value = [...select.options].some((option) => option.value === current) ? current : "all";
  state.tablePeriods[config.id] = select.value;
}

function ensureCollaboratorStatusFilter() {
  const toolbar = document.querySelector(".table-actions");
  if (!toolbar || document.querySelector("#collaboratorStatusFilter")) return;
  toolbar.insertAdjacentHTML("afterbegin", `
    <label class="table-status-filter" hidden>
      Status
      <select id="collaboratorStatusFilter">
        <option value="active">Ativos</option>
        <option value="dismissed">Demitidos</option>
        <option value="inactive">Inativos</option>
        <option value="all">Todos</option>
      </select>
    </label>
  `);
  document.querySelector("#collaboratorStatusFilter")?.addEventListener("change", () => renderTable(PROCESS_CONFIGS.colaboradores));
}

function renderCollaboratorStatusFilter(config) {
  ensureCollaboratorStatusFilter();
  const wrapper = document.querySelector(".table-status-filter");
  if (!wrapper) return;
  wrapper.hidden = config.id !== "colaboradores";
}

function openIndicatorForm(configId, rowId = "") {
  const config = configFor(configId);
  if (!config?.indicator) return;
  state.launchProcessId = config.id;
  state.launchFormOpen = true;
  state.editingRow = rowId ? { processId: config.id, rowId } : null;
  state.editReturnProcessId = "";
  setActiveProcess(config.id);
  if (config.inlineIndicator && state.masterUnlocked) {
    renderProcess();
    document.querySelector("#inlineLaunchMount")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  document.querySelector("#activeWorkArea").hidden = true;
  document.querySelector("#launchArea").hidden = false;
  renderLaunch();
  document.querySelector("#launchFormShell")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function operationalTableColumns(config) {
  if (config.indicator) return config.columns;
  const visibleKeys = new Set([
    "diaSemana",
    "semana",
    "mes",
    "actions",
    ...config.fields.filter((field) => !isProtectedField(field)).map((field) => field.key),
  ]);
  return config.columns.filter((column) => visibleKeys.has(column.key));
}

function renderTableHeader(config) {
  const columns = operationalTableColumns(config);
  const sort = state.tableSorts[config.id] || {};
  document.querySelector("#tableHead").innerHTML = columns.map((column) => {
    if (column.key === "actions") return `<th>${escapeHtml(column.label || "")}</th>`;
    const active = sort.key === column.key;
    const direction = active ? sort.direction : "";
    const ariaSort = active ? (direction === "asc" ? "ascending" : "descending") : "none";
    const icon = active ? (direction === "asc" ? "↑" : "↓") : "↕";
    return `
      <th aria-sort="${ariaSort}">
        <button class="table-sort-button ${active ? "active" : ""}" type="button" data-table-sort="${escapeHtml(column.key)}">
          <span>${escapeHtml(column.label)}</span>
          <i aria-hidden="true">${icon}</i>
        </button>
      </th>
    `;
  }).join("");
}

function tableSortValue(row, column) {
  const value = row[column.key];
  if (column.numeric || column.currency || column.percent) return numberValue(value);
  if (column.key === "data" || column.key === "vigenciaInicio") return businessDateKey(value);
  return String(value ?? "").toLocaleLowerCase("pt-BR");
}

function sortTableRows(rows, columns, config) {
  const sort = state.tableSorts[config.id];
  if (!sort?.key) return rows;
  const column = columns.find((item) => item.key === sort.key);
  if (!column) return rows;
  const direction = sort.direction === "desc" ? -1 : 1;
  return rows.slice().sort((a, b) => {
    const left = tableSortValue(a, column);
    const right = tableSortValue(b, column);
    if (typeof left === "number" || typeof right === "number") return (numberValue(left) - numberValue(right)) * direction;
    return String(left).localeCompare(String(right), "pt-BR", { numeric: true, sensitivity: "base" }) * direction;
  });
}

function canEditRow(config, row) {
  if (!config || !row) return false;
  if (state.masterUnlocked) return true;
  if (isCurrentAccountProcessId(config.id)) {
    if (!canEditProcess(config.id)) return false;
    if (!rowOwnedByCurrentUser(row)) return false;
    return businessDateKey(row.data || rowInputDate(row)) === localDateKey();
  }
  if (!canEditProcess(config.id)) return false;
  if (!rowOwnedByCurrentUser(row)) return false;
  return businessDateKey(row.data || rowInputDate(row)) === localDateKey();
}

function canDeleteRow(config, row) {
  if (!config || !row) return false;
  if (!state.masterUnlocked) return false;
  if (config?.id === "custosSetores") {
    return businessDateKey(row?.vigenciaInicio) > localDateKey();
  }
  return true;
}

function confirmMasterDeletion(label) {
  if (!state.masterUnlocked) {
    alert("Exclusão de registros é restrita ao Gestor Master.");
    return false;
  }
  if (!confirm(`Confirma a exclusão de ${label}? Esta ação afeta a base operacional.`)) return false;
  const typed = prompt(`Para confirmar definitivamente, digite EXCLUIR.`);
  return typed === "EXCLUIR";
}

function formatCell(row, column, tableConfig = configFor()) {
  if (column.key === "actions") {
    const config = tableConfig;
    const viewButton = `<button class="icon-action view-row" data-view="${row.id}" type="button" aria-label="Visualizar" title="Visualizar">${rowActionIcon("view")}</button>`;
    const printButton = config?.id === "terceirosGalvano"
      ? `<button class="icon-action print-row" data-print-os="${row.id}" type="button" aria-label="Imprimir OS" title="Imprimir OS">${rowActionIcon("print")}</button>`
      : "";
    const editButton = canEditRow(config, row)
      ? `<button class="icon-action edit-row" data-edit="${row.id}" type="button" aria-label="Editar" title="Editar">${rowActionIcon("edit")}</button>`
      : "";
    const deleteButton = canDeleteRow(config, row)
      ? `<button class="icon-action delete-row" data-delete="${row.id}" type="button" aria-label="Excluir" title="Excluir">${rowActionIcon("delete")}</button>`
      : "";
    return `<div class="row-actions">${viewButton}${printButton}${editButton}${deleteButton}</div>`;
  }
  if (tableConfig?.id === "custosSetores" && column.key === "setor") {
    const expanded = state.expandedSectorCostRows.has(row.id);
    return `
      <button class="sector-expand-button" data-sector-expand="${row.id}" type="button" aria-expanded="${expanded}" title="Ver colaboradores do setor">
        <span>${expanded ? "▾" : "▸"}</span>
        <strong>${escapeHtml(row.setor || "-")}</strong>
      </button>
    `;
  }
  if (column.key === "competencia") return row.competencia ? monthLabel(row.competencia) : "";
  if (column.key === "data") return formatDate(row.data);
  if (column.key === "dataPrevista") return formatDate(row.dataPrevista);
  if (column.key === "dataRetorno") return formatDate(row.dataRetorno);
  if (column.key === "vigenciaInicio") return formatDate(row.vigenciaInicio);
  if (tableConfig?.id === "terceirosGalvano" && column.key === "leadTime") {
    return row.leadTime !== "" && row.leadTime !== undefined && row.leadTime !== null ? `${formatNumber(row.leadTime)} dias` : "";
  }
  if (tableConfig?.id === "terceirosGalvano" && column.key === "status") {
    const status = row.status || "Em andamento";
    const tone = status === "Concluído" ? "ok" : status === "Atrasado" ? "danger" : "pending";
    return `<span class="status-pill ${tone}">${escapeHtml(status)}</span>`;
  }
  if (column.percent) return formatPercent(row[column.key]);
  if (column.currency) return row[column.key] ? formatCurrency(row[column.key]) : "";
  if (column.numeric) return row[column.key] ? formatNumber(row[column.key], column.decimals || 0) : "";
  return row[column.key] || "";
}

function rowActionIcon(action) {
  if (action === "print") return '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>';
  if (action === "edit") return '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  if (action === "delete") return '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>';
  return '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
}

function openRecordView(rowId) {
  const config = configFor();
  const dialog = document.querySelector("#recordViewDialog");
  const content = document.querySelector("#recordViewContent");
  if (!config || !dialog || !content) return;
  const row = calculatedRows(config.id).find((item) => item.id === rowId);
  if (!row) return;
  document.querySelector("#recordViewTitle").textContent = config.id === "colaboradores" ? row.nomeCompleto : `Detalhes de ${config.name}`;
  content.innerHTML = operationalTableColumns(config).filter((column) => column.key !== "actions").map((column) => {
    const field = config.fields.find((item) => item.key === column.key);
    const value = field?.type === "date" ? formatDate(row[column.key]) : formatCell(row, column, config);
    return `<div><span>${escapeHtml(column.label)}</span><strong>${escapeHtml(String(value || "-"))}</strong></div>`;
  }).join("");
  dialog.showModal();
}

function printTerceirosGalvanoOrder(rowId) {
  const config = PROCESS_CONFIGS.terceirosGalvano;
  const selectedRow = calculatedRows(config.id).find((item) => item.id === rowId);
  if (!selectedRow) return;
  const orderRows = calculatedRows(config.id)
    .filter((row) => row.osNumero === selectedRow.osNumero)
    .sort((a, b) => String(a.codigo || "").localeCompare(String(b.codigo || ""), "pt-BR", { numeric: true }));
  const printWindow = window.open("", "_blank", "width=900,height=760");
  if (!printWindow) {
    alert("O navegador bloqueou a impressão. Libere pop-ups para imprimir a Ordem de Serviço.");
    return;
  }
  const rowsHtml = orderRows.map((row) => `
    <tr>
      <td>${escapeHtml(row.codigo || "-")}</td>
      <td>${escapeHtml(row.banho || "-")}</td>
      <td>${escapeHtml(row.tipoServico || "-")}</td>
      <td>${formatNumber(row.qtd)}</td>
      <td>${row.pesoInicial ? `${formatNumber(row.pesoInicial, 2)} g` : "-"}</td>
      <td>${formatDate(row.dataPrevista) || "-"}</td>
      <td>${escapeHtml(row.observacoes || "")}</td>
    </tr>
  `).join("");
  printWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Ordem de Serviço ${escapeHtml(selectedRow.osNumero)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 28px; color: #12352e; font-family: Arial, sans-serif; }
          header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #2f7a67; padding-bottom: 18px; }
          h1 { margin: 0 0 6px; font-size: 24px; }
          h2 { margin: 24px 0 12px; font-size: 15px; letter-spacing: .08em; text-transform: uppercase; }
          .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; }
          .meta div { border: 1px solid #cbded7; border-radius: 8px; padding: 10px; }
          span { display: block; color: #61766f; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
          strong { display: block; margin-top: 4px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #dbe8e3; padding: 10px 8px; text-align: left; vertical-align: top; }
          th { background: #eef6f2; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
          footer { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          footer div { border-top: 1px solid #78958b; padding-top: 8px; text-align: center; color: #61766f; }
          @media print { body { padding: 18px; } button { display: none; } }
        </style>
      </head>
      <body>
        <header>
          <div>
            <h1>Ordem de Serviço</h1>
            <span>Serviço Externo Galvano</span>
          </div>
          <strong>${escapeHtml(selectedRow.osNumero)}</strong>
        </header>
        <section class="meta">
          <div><span>Prestador</span><strong>${escapeHtml(selectedRow.prestador || "-")}</strong></div>
          <div><span>Setor responsável</span><strong>Galvanoplastia</strong></div>
          <div><span>Data de envio</span><strong>${formatDate(selectedRow.data)}</strong></div>
          <div><span>Previsão de retorno</span><strong>${formatDate(selectedRow.dataPrevista) || "-"}</strong></div>
        </section>
        <h2>Itens enviados</h2>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Banho</th>
              <th>Serviço</th>
              <th>Qtd.</th>
              <th>Peso enviado</th>
              <th>Previsão</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <footer>
          <div>Responsável pelo envio</div>
          <div>Prestador</div>
        </footer>
        <script>window.print();<\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function tablePeriodRows(config) {
  if (config.id === "custosSetores") {
    return currentSectorPolicyRows().slice().sort((a, b) =>
      businessDateKey(b.vigenciaInicio).localeCompare(businessDateKey(a.vigenciaInicio))
      || String(a.setor || "").localeCompare(String(b.setor || ""), "pt-BR")
    );
  }
  if (config.id === "colaboradores") {
    const statusFilter = document.querySelector("#collaboratorStatusFilter")?.value || "active";
    return calculatedRows("colaboradores").filter((row) => {
      const status = row.status || "Ativo";
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return status === "Ativo";
      if (statusFilter === "dismissed") return status === "Demitido";
      if (statusFilter === "inactive") return status === "Inativo";
      return true;
    });
  }
  const period = document.querySelector("#tablePeriodFilter")?.value || state.tablePeriods[config.id] || "all";
  return calculatedRows(config.id)
    .filter((row) => period === "all" || String(row.competencia || businessDateKey(row.data)).startsWith(period));
}

function renderTable(config) {
  renderCollaboratorStatusFilter(config);
  const columns = operationalTableColumns(config);
  const rows = visibleTableRows(config, columns);
  const pageRows = paginatedTableRows(config, rows);
  document.querySelector("#tableBody").innerHTML = pageRows.length ? pageRows.map((row) => {
    const baseRow = `<tr>${columns.map((column) => `<td>${formatCell(row, column, config)}</td>`).join("")}</tr>`;
    const expanded = config.id === "custosSetores" && state.expandedSectorCostRows.has(row.id);
    return `${baseRow}${expanded ? sectorCostExpansion(row, columns.length) : ""}`;
  }).join("") : `<tr><td class="empty-state" colspan="${columns.length}">Nenhum lançamento em ${config.name}.</td></tr>`;
  renderTablePagination(config, rows.length);
  refreshTableTopScrollbars();
}

const WEEKLY_CLOSING_PROCESS_IDS = [
  "separacaoProdutos",
  "tratamento",
  "iqSemiacabado",
  "preElos",
  "galvanoplastia",
  "retrabalho",
  "ecoatProducao",
  "posBanho",
  "etiquetagem",
  "colagem",
];

function weeklyClosingConfigs() {
  const configs = WEEKLY_CLOSING_PROCESS_IDS.map(configFor).filter(Boolean);
  if (state.masterUnlocked) return configs;
  return configs.filter((config) => canViewProcess(config.id) || canCreateProcess(config.id));
}

function weeklyClosingStart() {
  const input = document.querySelector("#weeklyClosingDate");
  const key = weekStartKey(input?.value || localDateKey());
  if (input && input.value !== key) input.value = key;
  return key;
}

function weeklyClosingEnd(startKey = weeklyClosingStart()) {
  return addDaysKey(startKey, 4);
}

function weeklyClosingRowsForWeek(startKey = weeklyClosingStart()) {
  return calculatedRows("weeklyClosings")
    .filter((row) => row.weekStart === startKey)
    .sort((a, b) => String(a.sectorName || "").localeCompare(String(b.sectorName || "")));
}

function weeklyClosingSelectedConfig() {
  const configs = weeklyClosingConfigs();
  const select = document.querySelector("#weeklyClosingSector");
  if (!configs.length) return null;
  if (!configs.some((config) => config.id === select?.value)) {
    if (select) select.value = configs[0].id;
  }
  return configs.find((config) => config.id === select?.value) || configs[0];
}

function weeklyClosingRecordId(processId, startKey) {
  return `weeklyClosing:${processId}:${startKey}`;
}

function weeklyClosingRecord(processId, startKey = weeklyClosingStart()) {
  const id = weeklyClosingRecordId(processId, startKey);
  return (state.rows.weeklyClosings || []).find((row) => row.id === id) || null;
}

function weeklyClosingStatusLabel(status) {
  return {
    draft: "Rascunho",
    sent: "Enviado",
    reviewed: "Revisado",
    revision_requested: "Correção",
  }[status] || "Pendente";
}

function weeklyClosingStats(config, startKey = weeklyClosingStart()) {
  const days = new Set(businessWeekDays(startKey));
  const productionRows = calculatedRows(config.id).filter((row) => days.has(businessDateKey(row.data)));
  const tags = productionRows.reduce((sum, row) => sum + managementTagProduction(row, config), 0);
  const pieces = productionRows.reduce((sum, row) => sum + getRowPiecesTotal(row, config), 0);
  const collaboratorSum = productionRows.reduce((sum, row) => sum + numberValue(row.colaboradores), 0);
  const absences = calculatedRows("absenteismo").filter((row) => {
    const date = businessDateKey(row.data);
    if (!days.has(date)) return false;
    const rowSector = normalizedSectorName(canonicalSectorName(row.setor || row.setorPrimario || ""));
    const policySector = normalizedSectorName(policySectorForProcess(config));
    return rowSector === policySector || normalizedSectorName(config.name) === normalizedSectorName(row.setor || "");
  });
  return {
    tags,
    pieces,
    rows: productionRows.length,
    collaboratorsAverage: productionRows.length ? collaboratorSum / productionRows.length : 0,
    absences: absences.length,
  };
}

function weeklyClosingBuildRecord(status) {
  const startKey = weeklyClosingStart();
  const config = weeklyClosingSelectedConfig();
  if (!config) return null;
  const existing = weeklyClosingRecord(config.id, startKey);
  const actor = currentActorStamp();
  return {
    ...(existing || {}),
    id: weeklyClosingRecordId(config.id, startKey),
    processId: config.id,
    sectorName: config.name,
    weekStart: startKey,
    weekEnd: weeklyClosingEnd(startKey),
    results: document.querySelector("#weeklyClosingResults")?.value.trim() || "",
    bottlenecks: document.querySelector("#weeklyClosingBottlenecks")?.value.trim() || "",
    actionsTaken: document.querySelector("#weeklyClosingActionsTaken")?.value.trim() || "",
    supportNeeded: document.querySelector("#weeklyClosingSupportNeeded")?.value.trim() || "",
    status,
    createdByProfileId: existing?.createdByProfileId || actor.profileId,
    createdByName: existing?.createdByName || actor.name,
    createdByEmail: existing?.createdByEmail || actor.email,
    createdAt: existing?.createdAt || new Date().toISOString(),
    submittedAt: status === "sent" ? new Date().toISOString() : existing?.submittedAt || "",
    updatedAt: new Date().toISOString(),
    updatedByName: actor.name,
  };
}

async function saveWeeklyClosing(status = "draft") {
  const record = weeklyClosingBuildRecord(status);
  if (!record) return false;
  if (!record.results && !record.bottlenecks && !record.actionsTaken && !record.supportNeeded) {
    document.querySelector("#weeklyClosingMessage").textContent = "Preencha pelo menos um campo antes de salvar.";
    return false;
  }
  const previousRows = [...(state.rows.weeklyClosings || [])];
  const nextRows = previousRows.filter((row) => row.id !== record.id);
  state.rows.weeklyClosings = [...nextRows, record];
  saveRows("weeklyClosings", state.rows.weeklyClosings);
  try {
    await persistOperationalRecordStrict(PROCESS_CONFIGS.weeklyClosings, markRowAsSynced(PROCESS_CONFIGS.weeklyClosings, record));
    saveRows("weeklyClosings", state.rows.weeklyClosings);
    document.querySelector("#weeklyClosingMessage").textContent = status === "sent" ? "Fechamento enviado." : "Rascunho salvo.";
    renderWeeklyClosing();
    setSyncStatus("ok", "Fechamento sincronizado");
    return true;
  } catch (error) {
    state.rows.weeklyClosings = previousRows;
    saveRows("weeklyClosings", previousRows);
    document.querySelector("#weeklyClosingMessage").textContent = error.message || "Não foi possível salvar.";
    setSyncStatus("error", "Falha ao salvar fechamento");
    return false;
  }
}

function fillWeeklyClosingForm(record) {
  document.querySelector("#weeklyClosingResults").value = record?.results || "";
  document.querySelector("#weeklyClosingBottlenecks").value = record?.bottlenecks || "";
  document.querySelector("#weeklyClosingActionsTaken").value = record?.actionsTaken || "";
  document.querySelector("#weeklyClosingSupportNeeded").value = record?.supportNeeded || "";
}

function renderWeeklyClosing() {
  const area = document.querySelector("#weeklyClosingArea");
  if (!area) return;
  const configs = weeklyClosingConfigs();
  const sectorSelect = document.querySelector("#weeklyClosingSector");
  const startKey = weeklyClosingStart();
  const statusFilterWrap = document.querySelector("#weeklyClosingStatusFilterWrap");
  if (sectorSelect) {
    const previous = sectorSelect.value;
    sectorSelect.innerHTML = configs.map((config) => `<option value="${config.id}">${escapeHtml(config.name)}</option>`).join("");
    sectorSelect.value = configs.some((config) => config.id === previous) ? previous : configs[0]?.id || "";
  }
  if (statusFilterWrap) statusFilterWrap.hidden = !state.masterUnlocked;
  const config = weeklyClosingSelectedConfig();
  const record = config ? weeklyClosingRecord(config.id, startKey) : null;
  const stats = config ? weeklyClosingStats(config, startKey) : { tags: 0, pieces: 0, collaboratorsAverage: 0, absences: 0 };
  document.querySelector("#weeklyClosingFormTitle").textContent = config ? `${config.name} · ${weekRangeLabel(startKey)}` : "Sem setor liberado";
  document.querySelector("#weeklyClosingFormLabel").textContent = state.masterUnlocked ? "Master" : "Colaborador";
  document.querySelector("#weeklyClosingRecordStatus").textContent = weeklyClosingStatusLabel(record?.status);
  document.querySelector("#weeklyClosingKpis").innerHTML = state.masterUnlocked
    ? weeklyClosingMasterKpis(startKey)
    : weeklyClosingCollaboratorKpis(stats, record);
  fillWeeklyClosingForm(record);
  renderWeeklyClosingMasterPanel(startKey);
}

function weeklyClosingCollaboratorKpis(stats, record) {
  return `
    <article><span>Tags</span><strong>${formatNumber(stats.tags)}</strong></article>
    <article><span>Peças</span><strong>${formatNumber(stats.pieces)}</strong></article>
    <article><span>Ausências</span><strong>${formatNumber(stats.absences)}</strong></article>
    <article><span>Status</span><strong>${escapeHtml(weeklyClosingStatusLabel(record?.status))}</strong></article>
  `;
}

function weeklyClosingMasterKpis(startKey) {
  const configs = weeklyClosingConfigs();
  const records = weeklyClosingRowsForWeek(startKey);
  const sent = records.filter((row) => ["sent", "reviewed"].includes(row.status)).length;
  const reviewed = records.filter((row) => row.status === "reviewed").length;
  const pending = Math.max(configs.length - sent, 0);
  const last = records.map((row) => row.updatedAt).filter(Boolean).sort().at(-1);
  return `
    <article><span>Setores</span><strong>${formatNumber(configs.length)}</strong></article>
    <article><span>Enviados</span><strong>${formatNumber(sent)}</strong></article>
    <article><span>Pendentes</span><strong>${formatNumber(pending)}</strong></article>
    <article><span>Revisados</span><strong>${formatNumber(reviewed)}</strong></article>
    <article><span>Última atualização</span><strong>${last ? formatDateTime(last) : "--"}</strong></article>
  `;
}

function renderWeeklyClosingMasterPanel(startKey = weeklyClosingStart()) {
  const panel = document.querySelector("#weeklyClosingMasterPanel");
  if (!panel) return;
  panel.hidden = !state.masterUnlocked;
  if (!state.masterUnlocked) return;
  const selectedStatus = document.querySelector("#weeklyClosingStatusFilter")?.value || "all";
  const recordsByProcess = new Map(weeklyClosingRowsForWeek(startKey).map((row) => [row.processId, row]));
  const rows = weeklyClosingConfigs()
    .map((config) => ({ config, record: recordsByProcess.get(config.id) }))
    .filter((item) => selectedStatus === "all" || (item.record?.status || "pending") === selectedStatus);
  document.querySelector("#weeklyClosingList").innerHTML = rows.map(({ config, record }) => `
    <button class="weekly-closing-row ${config.id === weeklyClosingSelectedConfig()?.id ? "active" : ""}" data-weekly-sector="${config.id}" type="button">
      <span><strong>${escapeHtml(config.name)}</strong><small>${escapeHtml(record?.createdByName || "Sem envio")}</small></span>
      <em>${escapeHtml(weeklyClosingStatusLabel(record?.status))}</em>
    </button>
  `).join("") || `<p class="empty-state">Nenhum setor neste filtro.</p>`;
}

function generateWeeklyClosingSummary() {
  const startKey = weeklyClosingStart();
  const records = weeklyClosingRowsForWeek(startKey).filter((row) => ["sent", "reviewed"].includes(row.status));
  const lines = [`Fechamento da semana ${weekRangeLabel(startKey)}.`];
  records.forEach((row) => {
    const parts = [row.results, row.bottlenecks && `Gargalos: ${row.bottlenecks}`, row.actionsTaken && `Ações: ${row.actionsTaken}`, row.supportNeeded && `Apoio: ${row.supportNeeded}`]
      .filter(Boolean);
    if (parts.length) lines.push(`${row.sectorName}: ${parts.join(" ")}`);
  });
  const pending = weeklyClosingConfigs()
    .filter((config) => !records.some((row) => row.processId === config.id))
    .map((config) => config.name);
  if (pending.length) lines.push(`Pendentes: ${pending.join(", ")}.`);
  document.querySelector("#weeklyClosingExecutiveSummary").value = lines.join("\n\n");
}

async function updateWeeklyClosingStatus(status) {
  const config = weeklyClosingSelectedConfig();
  const startKey = weeklyClosingStart();
  const existing = config ? weeklyClosingRecord(config.id, startKey) : null;
  if (!existing) {
    showSystemToast("Selecione um fechamento enviado antes de alterar o status.", "info");
    return;
  }
  const previousRows = [...(state.rows.weeklyClosings || [])];
  const actor = currentActorStamp();
  const updated = {
    ...existing,
    status,
    reviewedAt: status === "reviewed" ? new Date().toISOString() : existing.reviewedAt || "",
    updatedAt: new Date().toISOString(),
    updatedByName: actor.name,
  };
  state.rows.weeklyClosings = previousRows.map((row) => row.id === updated.id ? updated : row);
  saveRows("weeklyClosings", state.rows.weeklyClosings);
  try {
    await persistOperationalRecordStrict(PROCESS_CONFIGS.weeklyClosings, markRowAsSynced(PROCESS_CONFIGS.weeklyClosings, updated));
    renderWeeklyClosing();
    showSystemToast("Status atualizado.", "success");
  } catch (error) {
    state.rows.weeklyClosings = previousRows;
    saveRows("weeklyClosings", previousRows);
    showSystemToast(error.message || "Não foi possível atualizar o status.", "error");
  }
}

function paginatedTableRows(config, rows) {
  const totalPages = Math.max(1, Math.ceil(rows.length / state.tablePageSize));
  const current = Math.min(Math.max(1, state.tablePages[config.id] || 1), totalPages);
  state.tablePages[config.id] = current;
  const start = (current - 1) * state.tablePageSize;
  return rows.slice(start, start + state.tablePageSize);
}

function ensureTablePagination() {
  const panel = document.querySelector(".table-panel");
  if (!panel) return null;
  let pagination = document.querySelector("#tablePagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "tablePagination";
    pagination.className = "table-pagination";
    panel.appendChild(pagination);
  }
  return pagination;
}

function renderTablePagination(config, totalRows) {
  const pagination = ensureTablePagination();
  if (!pagination) return;
  const totalPages = Math.max(1, Math.ceil(totalRows / state.tablePageSize));
  const current = state.tablePages[config.id] || 1;
  const start = totalRows ? (current - 1) * state.tablePageSize + 1 : 0;
  const end = Math.min(totalRows, current * state.tablePageSize);
  pagination.hidden = totalRows <= state.tablePageSize;
  pagination.innerHTML = `
    <span>${formatNumber(start)}-${formatNumber(end)} de ${formatNumber(totalRows)} registros</span>
    <div>
      <button type="button" data-table-page="prev" ${current <= 1 ? "disabled" : ""}>Anterior</button>
      <strong>${formatNumber(current)} / ${formatNumber(totalPages)}</strong>
      <button type="button" data-table-page="next" ${current >= totalPages ? "disabled" : ""}>Próxima</button>
    </div>
  `;
}

function refreshTableTopScrollbars() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".dashboard-table-wrap, .table-wrap").forEach((wrapper) => {
      if (wrapper.closest("[hidden]")) return;
      let top = wrapper.previousElementSibling;
      if (!top?.classList?.contains("table-scrollbar-top")) {
        top = document.createElement("div");
        top.className = "table-scrollbar-top";
        top.innerHTML = "<div></div>";
        wrapper.insertAdjacentElement("beforebegin", top);
        let syncing = false;
        top.addEventListener("scroll", () => {
          if (syncing) return;
          syncing = true;
          wrapper.scrollLeft = top.scrollLeft;
          syncing = false;
        });
        wrapper.addEventListener("scroll", () => {
          if (syncing) return;
          syncing = true;
          top.scrollLeft = wrapper.scrollLeft;
          syncing = false;
        });
      }
      const spacer = top.firstElementChild;
      const table = wrapper.querySelector("table");
      if (spacer && table) spacer.style.width = `${table.scrollWidth}px`;
      top.scrollLeft = wrapper.scrollLeft;
      top.hidden = !table || table.scrollWidth <= wrapper.clientWidth + 2;
    });
  });
}

function visibleTableRows(config, columns = operationalTableColumns(config)) {
  const term = searchInput.value.trim().toLowerCase();
  return sortTableRows(
    tablePeriodRows(config).filter((row) => JSON.stringify(row).toLowerCase().includes(term)),
    columns,
    config
  );
}

function renderSectorCostsSummary() {
  const rows = currentSectorPolicyRows();
  const totalCost = rows.reduce((sum, row) => sum + numberValue(row.custoMensal), 0);
  const linkedCenters = new Set(rows.map((row) => row.setor).filter(Boolean));
  const linkedPeople = [...linkedCenters].reduce((sum, center) => sum + sectorCostCollaboratorCount(center), 0);
  const linkedPaidPeople = [...linkedCenters].reduce((sum, center) => sum + sectorCostPaidCollaboratorCount(center), 0);
  const salaryCost = [...linkedCenters].reduce((sum, center) => sum + sectorSalaryTotal(center), 0);
  const highest = rows.slice().sort((a, b) => numberValue(b.custoMensal) - numberValue(a.custoMensal))[0];

  document.querySelector("#kpiTotalLabel").textContent = salaryCost ? "Custo mensal por salários" : "Custo mensal vigente";
  document.querySelector("#kpiCollaboratorsLabel").textContent = "Colaboradores vinculados";
  document.querySelector("#kpiPerPersonLabel").textContent = salaryCost ? "Salário médio" : "Custo médio por colaborador";
  document.querySelector("#kpiProductionHourLabel").textContent = "Setores configurados";
  document.querySelector("#kpiMdoDayLabel").textContent = "Maior custo vigente";
  document.querySelector("#kpiWorkedDayCostLabel").textContent = "Média por setor";
  document.querySelector("#kpiTotal").textContent = formatCurrency(totalCost);
  document.querySelector("#kpiCollaborators").textContent = formatNumber(linkedPeople);
  document.querySelector("#kpiPerPerson").textContent = formatCurrency(linkedPaidPeople ? totalCost / linkedPaidPeople : 0);
  document.querySelector("#kpiProductionHour").textContent = formatNumber(linkedCenters.size);
  document.querySelector("#kpiMdoDay").textContent = highest ? `${highest.setor}: ${formatCurrency(highest.custoMensal)}` : "--";
  document.querySelector("#kpiWorkedDayCost").textContent = formatCurrency(rows.length ? totalCost / rows.length : 0);
}

function currentSectorPolicyRows(referenceDate = localDateKey()) {
  const groups = new Map();
  calculatedRows("custosSetores")
    .filter((row) => businessDateKey(row.vigenciaInicio) <= referenceDate)
    .forEach((row) => {
      const key = `sector:${normalizedSectorName(canonicalSectorName(row.setor))}`;
      const current = groups.get(key);
      if (!current || businessDateKey(row.vigenciaInicio) > businessDateKey(current.vigenciaInicio)) groups.set(key, row);
    });
  return [...groups.values()];
}

function policySectorForProcess(config) {
  if (!config) return "";
  return PROCESS_POLICY_SECTORS[config.id] || canonicalSectorName(config.name);
}

function currentSectorPolicyForProcess(config, referenceDate = localDateKey()) {
  const sector = policySectorForProcess(config);
  if (!sector) return null;
  const normalized = normalizedSectorName(canonicalSectorName(sector));
  return currentSectorPolicyRows(referenceDate).find((row) =>
    normalizedSectorName(canonicalSectorName(row.setor)) === normalized
  ) || null;
}

function sectorMonthlyLaborCost(config, referenceDate = localDateKey()) {
  const sector = policySectorForProcess(config);
  const salaryTotal = sector ? sectorSalaryTotal(sector) : 0;
  if (salaryTotal) return salaryTotal;
  const policy = currentSectorPolicyForProcess(config, referenceDate);
  return numberValue(policy?.custoMensal);
}

function sectorActiveCollaborators(config) {
  const sector = policySectorForProcess(config);
  return sector ? sectorCostCollaboratorCount(sector) : 0;
}

function managementTagProduction(row, config) {
  if (!config) return 0;
  if (config.id === "colagem" || config.id === "colagemConta") {
    return numberValue(row.tagsCampinas || row.tagsExpedidas || row.tagsEnviadas);
  }
  return numberValue(row.qtdTags || row.tagsProduzidas || row.tagsEntrada || row.tagsSaida);
}

function monthlyGalvanoplastiaBanhadoTotal(dateValue) {
  const month = businessDateKey(dateValue).slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) return 0;
  return calculatedRows("galvanoplastia")
    .filter((row) => businessDateKey(row.data).startsWith(month))
    .reduce((sum, row) => sum + numberValue(row.kgTotal), 0);
}

function productionPeriodForRows(config, rows) {
  const selected = document.querySelector("#tablePeriodFilter")?.value || state.tablePeriods[config?.id] || "all";
  if (selected && selected !== "all") return selected;
  const months = uniqueSorted((rows || [])
    .map((row) => businessDateKey(row.data).slice(0, 7))
    .filter((key) => /^\d{4}-\d{2}$/.test(key)));
  return months.length === 1 ? months[0] : "all";
}

function costCenterProduction(config, period = "all") {
  const sector = policySectorForProcess(config);
  const processIds = COST_CENTER_PROCESS_GROUPS[sector] || [config?.id].filter(Boolean);
  return processIds.reduce((sum, processId) => {
    const processConfig = configFor(processId);
    if (!processConfig) return sum;
    return sum + calculatedRows(processId)
      .filter((row) => period === "all" || businessDateKey(row.data).startsWith(period))
      .reduce((total, row) => total + managementTagProduction(row, processConfig), 0);
  }, 0);
}

function managementProductionSummary(config, rows) {
  const costCenter = policySectorForProcess(config);
  const period = productionPeriodForRows(config, rows);
  const production = rows.reduce((sum, row) => sum + managementTagProduction(row, config), 0);
  const rowCollaborators = rows.reduce((sum, row) => sum + numberValue(row.colaboradores), 0);
  const activeCollaborators = sectorActiveCollaborators(config);
  const averageCollaborators = rows.length && rowCollaborators
    ? rowCollaborators / rows.length
    : activeCollaborators;
  const laborCost = sectorMonthlyLaborCost(config, rows.map((row) => businessDateKey(row.data)).sort().at(-1) || localDateKey());
  const centerProduction = costCenterProduction(config, period);
  const hoursBase = rows.reduce((sum, row) => sum + numberValue(row.colaboradores), 0) || (averageCollaborators * Math.max(rows.length, 1));
  return {
    costCenter,
    production,
    centerProduction,
    averageCollaborators,
    activeCollaborators,
    laborCost,
    productionPerCollaborator: averageCollaborators ? production / averageCollaborators : 0,
    productionPerHour: hoursBase ? production / (hoursBase * 7) : 0,
    laborCostPerCollaborator: activeCollaborators ? laborCost / activeCollaborators : 0,
    costPerProduction: centerProduction ? laborCost / centerProduction : 0,
  };
}

function registeredCollaboratorCostSummary(config, rows) {
  const management = managementProductionSummary(config, rows);
  const registeredRows = rows.filter((row) => numberValue(row.colaboradores) > 0);
  const registeredAverage = registeredRows.length
    ? registeredRows.reduce((sum, row) => sum + numberValue(row.colaboradores), 0) / registeredRows.length
    : 0;
  const averageCostPerCollaborator = management.activeCollaborators
    ? management.laborCost / management.activeCollaborators
    : 0;
  const registeredLaborCost = registeredAverage * averageCostPerCollaborator;
  return {
    ...management,
    registeredAverage,
    averageCostPerCollaborator,
    registeredLaborCost,
    registeredCostPerProduction: management.production ? registeredLaborCost / management.production : 0,
  };
}

function productionManagementPeriods() {
  const months = new Map();
  PRODUCTION_MANAGEMENT_SUBSECTORS.forEach((item) => {
    calculatedRows(item.processId).forEach((row) => {
      const key = businessDateKey(row.data).slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(key)) months.set(key, monthLabel(key));
    });
  });
  return [...months.entries()].sort(([a], [b]) => b.localeCompare(a));
}

function renderProductionManagementPeriodOptions() {
  const select = document.querySelector("#productionManagementPeriod");
  if (!select) return;
  const periods = productionManagementPeriods();
  const currentMonth = localDateKey().slice(0, 7);
  const current = select.value || (periods.some(([key]) => key === currentMonth) ? currentMonth : periods[0]?.[0] || "all");
  select.innerHTML = `<option value="all">Histórico geral</option>${periods.map(([key, label]) => `<option value="${key}">${label}</option>`).join("")}`;
  select.value = [...select.options].some((option) => option.value === current) ? current : "all";
}

function rowsForManagementProcess(processId, period) {
  return calculatedRows(processId).filter((row) => period === "all" || businessDateKey(row.data).startsWith(period));
}

function managementMonthCount(period, processIds) {
  if (period !== "all") return 1;
  const months = new Set();
  processIds.forEach((processId) => {
    calculatedRows(processId).forEach((row) => {
      const key = businessDateKey(row.data).slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(key)) months.add(key);
    });
  });
  return Math.max(months.size, 1);
}

function primaryCollaborators(primary) {
  const normalizedPrimary = normalizedSectorName(primary);
  return calculatedRows("colaboradores").filter((person) => {
    if (!isActiveCollaborator(person)) return false;
    const personPrimary = canonicalSectorName(person.setorPrimario || person.setor);
    return normalizedSectorName(personPrimary) === normalizedPrimary;
  });
}

function subsectorCollaborators(subsector) {
  const normalizedLabel = normalizedSectorName(subsector.label);
  const processName = normalizedSectorName(configFor(subsector.processId)?.name);
  return calculatedRows("colaboradores").filter((person) => {
    if (!isActiveCollaborator(person)) return false;
    const secondary = normalizedSectorName(person.setorSecundario || person.subsetor);
    if (secondary && (secondary === normalizedLabel || secondary === processName)) return true;
    const current = normalizedSectorName(person.setor);
    return current === normalizedLabel || current === processName;
  });
}

function absencesForPrimary(primary, period) {
  const normalizedPrimary = normalizedSectorName(primary);
  return calculatedRows("absenteismo").filter((row) => {
    if (period !== "all" && !businessDateKey(row.data).startsWith(period)) return false;
    const sector = canonicalSectorName(row.setor);
    return normalizedSectorName(sector) === normalizedPrimary;
  }).length;
}

function buildProductionManagementSubsector(item, period) {
  const config = configFor(item.processId);
  const rows = rowsForManagementProcess(item.processId, period);
  const production = rows.reduce((sum, row) => sum + managementTagProduction(row, config), 0);
  const registeredRows = rows.filter((row) => numberValue(row.colaboradores) > 0);
  const registeredPeople = registeredRows.length
    ? registeredRows.reduce((sum, row) => sum + numberValue(row.colaboradores), 0) / registeredRows.length
    : 0;
  const people = subsectorCollaborators(item);
  const monthCount = managementMonthCount(period, [item.processId]);
  const directSalaryCost = people.reduce((sum, person) => sum + numberValue(person.salarioMensal), 0) * monthCount;
  const primaryMonthlyCost = sectorMonthlyLaborCost(config);
  const primaryPeople = primaryCollaborators(item.primary).length;
  const averageCostPerPerson = primaryPeople ? primaryMonthlyCost / primaryPeople : 0;
  const pointedCost = registeredPeople && averageCostPerPerson ? registeredPeople * averageCostPerPerson * monthCount : 0;
  const laborCost = directSalaryCost || pointedCost;
  return {
    ...item,
    config,
    rows,
    production,
    pieces: rows.reduce((sum, row) => sum + getRowPiecesTotal(row, config), 0),
    peopleCount: people.length || registeredPeople,
    registeredPeople,
    laborCost,
    costPerTag: production ? laborCost / production : 0,
    costSource: directSalaryCost ? "Cadastro do subsetor" : pointedCost ? "Apontamento diário" : "Sem custo",
  };
}

function buildProductionManagementPrimary(primary, period) {
  const processIds = COST_CENTER_PROCESS_GROUPS[primary] || [];
  const config = configFor(processIds[0]);
  const monthCount = managementMonthCount(period, processIds);
  const production = processIds.reduce((sum, processId) => {
    const processConfig = configFor(processId);
    return sum + rowsForManagementProcess(processId, period)
      .reduce((total, row) => total + managementTagProduction(row, processConfig), 0);
  }, 0);
  const people = primaryCollaborators(primary);
  const laborCost = sectorMonthlyLaborCost(config) * monthCount;
  const absences = absencesForPrimary(primary, period);
  const absenceBase = people.length * Math.max(monthCount, 1) * 22;
  return {
    primary,
    processIds,
    production,
    peopleCount: people.length,
    laborCost,
    costPerTag: production ? laborCost / production : 0,
    tagsPerPerson: people.length ? production / people.length : 0,
    absences,
    absenceRate: absenceBase ? absences / absenceBase : 0,
  };
}

function selectedProductionManagementRows() {
  const period = document.querySelector("#productionManagementPeriod")?.value || "all";
  const scope = document.querySelector("#productionManagementScope")?.value || "all";
  const primaries = Object.keys(COST_CENTER_PROCESS_GROUPS).filter((primary) => scope === "all" || primary === scope);
  const primaryRows = primaries.map((primary) => buildProductionManagementPrimary(primary, period));
  const subsectorRows = PRODUCTION_MANAGEMENT_SUBSECTORS
    .filter((item) => scope === "all" || item.primary === scope)
    .map((item) => buildProductionManagementSubsector(item, period));
  return { period, scope, primaryRows, subsectorRows };
}

function renderProductionManagement() {
  const area = document.querySelector("#productionManagementArea");
  if (!area) return;
  renderProductionManagementPeriodOptions();
  const { primaryRows, subsectorRows } = selectedProductionManagementRows();
  const totalProduction = primaryRows.reduce((sum, row) => sum + row.production, 0);
  const totalCost = primaryRows.reduce((sum, row) => sum + row.laborCost, 0);
  const totalPeople = primaryRows.reduce((sum, row) => sum + row.peopleCount, 0);
  const totalAbsences = primaryRows.reduce((sum, row) => sum + row.absences, 0);
  const absenceBase = primaryRows.reduce((sum, row) => sum + (row.peopleCount * 22), 0);
  const kpis = [
    ["Produção em tags", formatNumber(totalProduction), "Qtd. Tags; Colagem usa Tags Expedidas"],
    ["Custo MDO período", totalCost ? formatCurrency(totalCost) : "Custo não informado", "colaboradores ativos e guia Custos"],
    ["Custo/tag geral", totalProduction && totalCost ? formatCurrency(totalCost / totalProduction) : "--", "custo MDO / produção em tags"],
    ["Produção por colaborador", totalPeople ? formatNumber(totalProduction / totalPeople, 1) : "--", "tags / colaboradores ativos"],
    ["Absenteísmo", absenceBase ? `${formatNumber((totalAbsences / absenceBase) * 100, 1)}%` : "--", "faltas / base ativa estimada"],
  ];
  document.querySelector("#productionManagementKpis").innerHTML = kpis.map(([label, value, help]) => `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(help)}</small>
    </article>
  `).join("");

  const rankedCostTag = primaryRows.filter((row) => row.costPerTag).slice().sort((a, b) => a.costPerTag - b.costPerTag);
  const rankedCost = primaryRows.slice().sort((a, b) => b.laborCost - a.laborCost);
  const rankedVolume = primaryRows.slice().sort((a, b) => b.production - a.production);
  const insights = [
    ["Centro mais eficiente", rankedCostTag[0] ? `${rankedCostTag[0].primary} · ${formatCurrency(rankedCostTag[0].costPerTag)}` : "--", "menor custo por tag"],
    ["Maior peso no custo", rankedCost[0] ? `${rankedCost[0].primary} · ${formatCurrency(rankedCost[0].laborCost)}` : "--", "maior custo MDO"],
    ["Maior volume operacional", rankedVolume[0] ? `${rankedVolume[0].primary} · ${formatNumber(rankedVolume[0].production)}` : "--", "maior produção em tags"],
  ];
  document.querySelector("#productionManagementInsights").innerHTML = insights.map(([label, value, help]) => `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(help)}</small>
    </article>
  `).join("");

  const maxPrimary = Math.max(...primaryRows.map((row) => row.production), 1);
  document.querySelector("#productionManagementSectors").innerHTML = primaryRows.map((row) => `
    <article class="production-management-sector">
      <div>
        <strong>${escapeHtml(row.primary)}</strong>
        <span>${formatNumber(row.peopleCount)} colaboradores ativos</span>
      </div>
      <div class="production-management-meter">
        <span>${formatNumber(row.production)} tags</span>
        <i><b style="--w:${row.production ? Math.max(3, (row.production / maxPrimary) * 100) : 0}%"></b></i>
      </div>
      <div><span>Custo MDO</span><strong>${row.laborCost ? formatCurrency(row.laborCost) : "--"}</strong></div>
      <div><span>Custo/tag</span><strong>${row.costPerTag ? formatCurrency(row.costPerTag) : "--"}</strong></div>
      <div><span>Tags/colab.</span><strong>${row.tagsPerPerson ? formatNumber(row.tagsPerPerson, 1) : "--"}</strong></div>
      <div><span>Absenteísmo</span><strong>${formatNumber(row.absenceRate * 100, 1)}%</strong></div>
    </article>
  `).join("") || `<div class="empty-state">Sem dados para o período selecionado.</div>`;

  const maxAbsence = Math.max(...primaryRows.map((row) => row.absences), 1);
  document.querySelector("#productionManagementAbsence").innerHTML = primaryRows.map((row) => `
    <div>
      <strong>${formatNumber(row.absences)}</strong>
      <i style="--h:${row.absences ? Math.max(4, (row.absences / maxAbsence) * 100) : 2}%"></i>
      <span>${escapeHtml(row.primary)}</span>
    </div>
  `).join("") || `<div class="empty-state">Sem absenteísmo no período.</div>`;

  document.querySelector("#productionManagementSubsectors").innerHTML = subsectorRows.map((row) => `
    <article class="production-management-subsector">
      <div>
        <strong>${escapeHtml(row.label)}</strong>
        <span>${escapeHtml(row.primary)} · ${escapeHtml(row.costSource)}</span>
      </div>
      <div><span>Produção</span><strong>${formatNumber(row.production)}</strong></div>
      <div><span>Colab.</span><strong>${row.peopleCount ? formatNumber(row.peopleCount, 1) : "--"}</strong></div>
      <div><span>Custo MDO</span><strong>${row.laborCost ? formatCurrency(row.laborCost) : "--"}</strong></div>
      <div><span>Custo/tag</span><strong>${row.costPerTag ? formatCurrency(row.costPerTag) : "--"}</strong></div>
    </article>
  `).join("") || `<div class="empty-state">Sem subsetores para o filtro selecionado.</div>`;
}

function ensureSupplementalSummaryCards() {
  const summary = document.querySelector("#processSummary");
  if (!summary || document.querySelector("#kpiSupplementalOne")) return;
  summary.insertAdjacentHTML("beforeend", `
    <article class="summary-supplemental" hidden>
      <span id="kpiSupplementalOneLabel"></span>
      <strong id="kpiSupplementalOne">0</strong>
    </article>
    <article class="summary-supplemental" hidden>
      <span id="kpiSupplementalTwoLabel"></span>
      <strong id="kpiSupplementalTwo">0</strong>
    </article>
  `);
}

function configureSummaryCards({ supplemental = false, hideSeventh = false } = {}) {
  ensureSupplementalSummaryCards();
  document.querySelectorAll("#processSummary .summary-supplemental").forEach((card) => {
    card.hidden = !supplemental;
  });
  const baseCards = document.querySelectorAll("#processSummary > article:not(.summary-supplemental)");
  baseCards.forEach((card) => { card.hidden = false; });
  if (baseCards[6]) baseCards[6].hidden = hideSeventh;
}

function setFinancialSummaryCardsHidden(hidden) {
  const baseCards = document.querySelectorAll("#processSummary > article:not(.summary-supplemental)");
  [5, 6].forEach((index) => {
    if (baseCards[index]) baseCards[index].hidden = hidden;
  });
}

function renderColagemSummary() {
  const rows = tablePeriodRows(PROCESS_CONFIGS.colagem);
  const totals = processFlowTotals(PROCESS_CONFIGS.colagem, rows);
  const totalTagsPrice = rows.reduce((sum, row) => sum + numberValue(row.tagsPreco), 0);
  const totalTagsCampinas = rows.reduce((sum, row) => sum + getRowCampinasTags(row), 0);
  const management = managementProductionSummary(PROCESS_CONFIGS.colagem, rows);

  document.querySelector("#kpiTotalLabel").textContent = "Total de peças";
  document.querySelector("#kpiCollaboratorsLabel").textContent = "Produção Serial/Colagem";
  document.querySelector("#kpiPerPersonLabel").textContent = "Tags Expedidas";
  document.querySelector("#kpiProductionHourLabel").textContent = "Produção por colaborador";
  document.querySelector("#kpiMdoDayLabel").textContent = "Produção por hora/homem";
  document.querySelector("#kpiWorkedDayCostLabel").textContent = `Custo MDO ${management.costCenter || "setor"}`;
  document.querySelector("#kpiCostProductionLabel").textContent = "Custo/tag expedida";
  document.querySelector("#kpiTotal").textContent = formatNumber(totals.piecesReceived);
  document.querySelector("#kpiCollaborators").textContent = formatNumber(totalTagsPrice);
  document.querySelector("#kpiPerPerson").textContent = formatNumber(totalTagsCampinas);
  document.querySelector("#kpiProductionHour").textContent = management.productionPerCollaborator ? formatNumber(management.productionPerCollaborator, 1) : "--";
  document.querySelector("#kpiMdoDay").textContent = management.productionPerHour ? formatNumber(management.productionPerHour, 1) : "--";
  document.querySelector("#kpiWorkedDayCost").textContent = management.laborCost ? formatCurrency(management.laborCost) : "Custo não informado";
  document.querySelector("#kpiCostProduction").textContent = management.costPerProduction ? formatCurrency(management.costPerProduction) : "--";
  setFinancialSummaryCardsHidden(!state.masterUnlocked);
}

function providerMonthRows(period = "") {
  const selected = period || state.tablePeriods.prestadoresServicos || defaultTablePeriod(PROCESS_CONFIGS.prestadoresServicos);
  return calculatedRows("prestadoresServicos").filter((row) => selected === "all" || row.competencia === selected);
}

function providerMonthlyTotals() {
  const totals = new Map();
  calculatedRows("prestadoresServicos").forEach((row) => {
    if (!row.competencia) return;
    totals.set(row.competencia, (totals.get(row.competencia) || 0) + numberValue(row.valorDeposito));
  });
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function renderProvidersSummary() {
  const selected = state.tablePeriods.prestadoresServicos || defaultTablePeriod(PROCESS_CONFIGS.prestadoresServicos);
  const rows = providerMonthRows(selected);
  const deposit = rows.reduce((sum, row) => sum + numberValue(row.valorDeposito), 0);
  const calculated = rows.reduce((sum, row) => sum + numberValue(row.valorTotal), 0);
  const quantity = rows.reduce((sum, row) => sum + numberValue(row.quantidade), 0);
  const providers = new Set(rows.map((row) => row.prestador).filter(Boolean));
  const services = new Set(rows.map((row) => row.servico).filter(Boolean));
  const months = providerMonthlyTotals();
  const selectedIndex = months.findIndex(([month]) => month === selected);
  const previousTotal = selectedIndex > 0 ? months[selectedIndex - 1][1] : 0;
  const change = previousTotal ? (deposit - previousTotal) / previousTotal : 0;

  document.querySelector("#kpiTotalLabel").textContent = selected === "all" ? "Total depositado" : "Total a depositar";
  document.querySelector("#kpiCollaboratorsLabel").textContent = "Valor calculado";
  document.querySelector("#kpiPerPersonLabel").textContent = "Prestadores ativos";
  document.querySelector("#kpiProductionHourLabel").textContent = "Volume de serviços";
  document.querySelector("#kpiMdoDayLabel").textContent = "Quantidade processada";
  document.querySelector("#kpiWorkedDayCostLabel").textContent = "Custo médio por unidade";
  document.querySelector("#kpiCostProductionLabel").textContent = "Variação mensal";
  document.querySelector("#kpiTotal").textContent = formatCurrency(deposit);
  document.querySelector("#kpiCollaborators").textContent = formatCurrency(calculated);
  document.querySelector("#kpiPerPerson").textContent = formatNumber(providers.size);
  document.querySelector("#kpiProductionHour").textContent = formatNumber(services.size);
  document.querySelector("#kpiMdoDay").textContent = formatNumber(quantity);
  document.querySelector("#kpiWorkedDayCost").textContent = formatCurrency(quantity ? deposit / quantity : 0);
  document.querySelector("#kpiCostProduction").textContent = selected === "all" || !previousTotal ? "--" : `${change >= 0 ? "+" : ""}${formatPercent(change)}`;
}

function terceirosGalvanoPeriodRows(period = "") {
  const selected = period || state.tablePeriods.terceirosGalvano || defaultTablePeriod(PROCESS_CONFIGS.terceirosGalvano);
  return calculatedRows("terceirosGalvano").filter((row) => selected === "all" || row.competencia === selected);
}

function renderTerceirosGalvanoSummary() {
  const selected = state.tablePeriods.terceirosGalvano || defaultTablePeriod(PROCESS_CONFIGS.terceirosGalvano);
  const rows = terceirosGalvanoPeriodRows(selected);
  const quantity = rows.reduce((sum, row) => sum + numberValue(row.qtd), 0);
  const value = rows.reduce((sum, row) => sum + numberValue(row.valorTotal), 0);
  const providers = new Set(rows.map((row) => row.prestador).filter(Boolean));
  const open = rows.filter((row) => row.status !== "Concluído").length;
  const overdue = rows.filter((row) => row.status === "Atrasado").length;
  const returned = rows.filter((row) => row.status === "Concluído").length;
  const lead = average(rows, (row) => row.leadTime);
  const copperWeight = rows.reduce((sum, row) => sum + numberValue(row.pesoFiosCobre), 0);

  document.querySelector("#kpiTotalLabel").textContent = "Qtd. enviada";
  document.querySelector("#kpiCollaboratorsLabel").textContent = "Em andamento";
  document.querySelector("#kpiPerPersonLabel").textContent = "Atrasados";
  document.querySelector("#kpiProductionHourLabel").textContent = "Concluídos";
  document.querySelector("#kpiMdoDayLabel").textContent = "Prestadores";
  document.querySelector("#kpiWorkedDayCostLabel").textContent = "Lead time médio";
  document.querySelector("#kpiCostProductionLabel").textContent = "Peso fios/cobre";
  document.querySelector("#kpiTotal").textContent = formatNumber(quantity);
  document.querySelector("#kpiCollaborators").textContent = formatNumber(open);
  document.querySelector("#kpiPerPerson").textContent = formatNumber(overdue);
  document.querySelector("#kpiProductionHour").textContent = formatNumber(returned);
  document.querySelector("#kpiMdoDay").textContent = formatNumber(providers.size);
  document.querySelector("#kpiWorkedDayCost").textContent = lead ? `${formatNumber(lead, 1)} dias` : "--";
  document.querySelector("#kpiCostProduction").textContent = `${formatNumber(copperWeight, 2)} g`;
}

function terceirosGalvanoOverdueRows() {
  return calculatedRows("terceirosGalvano")
    .filter((row) => row.status === "Atrasado")
    .sort((a, b) => businessDateKey(a.dataPrevista).localeCompare(businessDateKey(b.dataPrevista)));
}

function renderExternalServicesAlerts(config) {
  const area = document.querySelector("#externalServicesAlerts");
  if (!area) return;
  if (config?.id !== "terceirosGalvano") {
    area.hidden = true;
    area.innerHTML = "";
    return;
  }
  const rows = terceirosGalvanoOverdueRows();
  area.hidden = false;
  area.innerHTML = `
    <div class="external-alert-heading">
      <div>
        <span class="panel-label">Acompanhamento de SLA</span>
        <h3>Serviços em atraso</h3>
      </div>
      <strong>${formatNumber(rows.length)}</strong>
    </div>
    ${rows.length ? `
      <div class="external-alert-grid">
        ${rows.slice(0, 6).map((row) => {
          const daysLate = terceirosGalvanoLeadTime(row.dataPrevista, localDateKey());
          return `
            <article>
              <span>${escapeHtml(row.prestador || "-")}</span>
              <strong>${escapeHtml(row.codigo || "-")}</strong>
              <small>${escapeHtml(row.banho || "-")} · ${escapeHtml(row.tipoServico || "-")}</small>
              <b>${formatNumber(Math.max(0, numberValue(daysLate)))} dias</b>
              <em>Previsto: ${formatDate(row.dataPrevista)}</em>
            </article>
          `;
        }).join("")}
      </div>
    ` : `<p class="empty-state">Nenhum serviço externo vencido no momento.</p>`}
  `;
}

function renderProvidersAnalytics() {
  const area = document.querySelector("#providersAnalytics");
  if (!area) return;
  const months = providerMonthlyTotals();
  const selected = state.tablePeriods.prestadoresServicos || defaultTablePeriod(PROCESS_CONFIGS.prestadoresServicos);
  const max = Math.max(...months.map(([, total]) => total), 1);
  document.querySelector("#providersMonthlyChart").innerHTML = months.map(([month, total], index) => {
    const previous = index ? months[index - 1][1] : 0;
    const change = previous ? (total - previous) / previous : 0;
    return `<div class="provider-month-column ${selected === month ? "selected" : ""}" title="${monthLabel(month)}: ${formatCurrency(total)}">
      <strong>${formatCurrency(total)}</strong>
      <div class="provider-column-track"><span style="height:${Math.max((total / max) * 100, 3)}%"></span></div>
      <b>${monthLabel(month)}</b>
      <small>${previous ? `${change >= 0 ? "+" : ""}${formatPercent(change)}` : "Base inicial"}</small>
    </div>`;
  }).join("");
  const rows = providerMonthRows(selected);
  const total = rows.reduce((sum, row) => sum + numberValue(row.valorDeposito), 0);
  const ranking = [...rows.reduce((map, row) => {
    map.set(row.prestador, (map.get(row.prestador) || 0) + numberValue(row.valorDeposito));
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  document.querySelector("#providersRanking").innerHTML = ranking.length ? ranking.map(([name, value]) => `
    <div><span>${escapeHtml(name)}</span><div><i style="width:${total ? (value / total) * 100 : 0}%"></i></div><strong>${formatCurrency(value)}</strong></div>
  `).join("") : `<p class="empty-state">Sem lançamentos para o período.</p>`;
}

function exportProviderClosing() {
  const period = state.tablePeriods.prestadoresServicos || defaultTablePeriod(PROCESS_CONFIGS.prestadoresServicos);
  if (period === "all") {
    alert("Selecione um mês para gerar o fechamento.");
    return;
  }
  const rows = providerMonthRows(period);
  if (!rows.length) {
    alert("Não há lançamentos para o mês selecionado.");
    return;
  }
  const headers = ["Competência", "Serviço", "Responsável", "Setor", "Prestador", "Quantidade", "Valor calculado", "A depositar", "Custo unitário", "Favorecido", "Banco", "Agência", "Operação", "Conta", "Tipo de conta", "CPF", "Observações"];
  const body = rows.map((row) => [row.competencia, row.servico, row.responsavel, row.setor, row.prestador, row.quantidade, row.valorTotal, row.valorDeposito, row.custoUnitario, row.favorecido, row.banco, row.agencia, row.operacao, row.conta, row.tipoConta, row.cpf, row.observacoes]);
  const quantity = rows.reduce((sum, row) => sum + numberValue(row.quantidade), 0);
  const calculated = rows.reduce((sum, row) => sum + numberValue(row.valorTotal), 0);
  const deposit = rows.reduce((sum, row) => sum + numberValue(row.valorDeposito), 0);
  body.push(["TOTAL", "", "", "", "", quantity, calculated, deposit, quantity ? deposit / quantity : 0]);
  const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = "\ufeff" + [headers, ...body].map((row) => row.map(quote).join(";")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `fechamento-prestadores-${period}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderSummary(config) {
  configureSummaryCards();
  if (config.id === "absenteismo") {
    renderAbsenteeismSummary();
    return;
  }
  if (config.id === "colaboradores") {
    renderPeopleSummary();
    return;
  }
  if (config.id === "custosSetores") {
    configureSummaryCards({ hideSeventh: true });
    renderSectorCostsSummary();
    return;
  }
  if (config.id === "prestadoresServicos") {
    renderProvidersSummary();
    return;
  }
  if (config.id === "terceirosGalvano") {
    renderTerceirosGalvanoSummary();
    return;
  }
  if (config.id === "colagem") {
    configureSummaryCards();
    renderColagemSummary();
    return;
  }
  const rows = tablePeriodRows(config);
  const totals = processFlowTotals(config, rows);
  const management = managementProductionSummary(config, rows);
  document.querySelector("#kpiTotalLabel").textContent = "Total de peças";
  document.querySelector("#kpiCollaboratorsLabel").textContent = "Produção em tags";
  document.querySelector("#kpiPerPersonLabel").textContent = "Média colaboradores";
  document.querySelector("#kpiProductionHourLabel").textContent = "Produção por colaborador";
  document.querySelector("#kpiMdoDayLabel").textContent = "Produção por hora/homem";
  document.querySelector("#kpiWorkedDayCostLabel").textContent = `Custo MDO ${management.costCenter || "setor"}`;
  document.querySelector("#kpiCostProductionLabel").textContent = "Custo/tag centro";
  document.querySelector("#kpiTotal").textContent = formatNumber(totals.piecesReceived);
  document.querySelector("#kpiCollaborators").textContent = formatNumber(management.production);
  document.querySelector("#kpiPerPerson").textContent = management.averageCollaborators ? formatNumber(management.averageCollaborators, 1) : "--";
  document.querySelector("#kpiProductionHour").textContent = management.productionPerCollaborator ? formatNumber(management.productionPerCollaborator, 1) : "--";
  document.querySelector("#kpiMdoDay").textContent = management.productionPerHour ? formatNumber(management.productionPerHour, 1) : "--";
  document.querySelector("#kpiWorkedDayCost").textContent = management.laborCost ? formatCurrency(management.laborCost) : "Custo não informado";
  document.querySelector("#kpiCostProduction").textContent = management.costPerProduction ? formatCurrency(management.costPerProduction) : "--";
  setFinancialSummaryCardsHidden(!state.masterUnlocked);
}

function countBy(rows, selector) {
  const map = new Map();
  rows.forEach((row) => {
    const key = selector(row) || "Não informado";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function absenteeismMonthlyRows() {
  const rows = calculatedRows("absenteismo");
  const counts = new Map();
  rows.forEach((row) => {
    const key = businessDateKey(row.data).slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const base = window.ABSENTEISMO_MONTHLY_BASE || [];
  const keys = new Set([...counts.keys(), ...base.filter((item) => item.qtdeMes || item.faltasReal).map((item) => item.monthKey)]);
  return [...keys].sort().map((monthKey) => {
    const reference = base.find((item) => item.monthKey === monthKey) || {};
    const absences = counts.get(monthKey) || numberValue(reference.faltasReal);
    const available = absenteeismAvailableBase(monthKey, reference);
    const rate = available ? absences / available : 0;
    return {
      monthKey,
      absences,
      available,
      meta: numberValue(reference.meta) || 0.03,
      rate,
    };
  });
}

function businessDaysElapsedInMonth(monthKey) {
  const todayKey = localDateKey();
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return 0;
  const lastDay = monthKey === todayKey.slice(0, 7)
    ? Number(todayKey.slice(8, 10))
    : new Date(year, month, 0).getDate();
  let count = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month - 1, day, 12);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

function absenteeismAvailableBase(monthKey, reference = {}) {
  const configured = numberValue(reference.qtdeMes);
  if (configured) return configured;
  if (monthKey !== localDateKey().slice(0, 7)) return 0;
  const activePeople = calculatedRows("colaboradores").filter(isActiveCollaborator).length;
  return activePeople * businessDaysElapsedInMonth(monthKey);
}

function absenteeismPeriodOptions() {
  return absenteeismMonthlyRows().filter((item) => item.available || item.absences);
}

function selectedAbsencePeriod() {
  const value = document.querySelector("#absencePeriodFilter")?.value || state.absencePeriod || "all";
  return value;
}

function absenceRowsForPeriod() {
  const period = selectedAbsencePeriod();
  const rows = calculatedRows("absenteismo");
  if (period === "all") return rows;
  return rows.filter((row) => businessDateKey(row.data).startsWith(period));
}

function absenceMonthlyForPeriod() {
  const period = selectedAbsencePeriod();
  const monthly = absenteeismPeriodOptions();
  if (period === "all") return monthly;
  return monthly.filter((item) => item.monthKey === period);
}

function renderAbsenteeismFilters() {
  const select = document.querySelector("#absencePeriodFilter");
  if (!select) return;
  const current = state.absencePeriod || select.value || "all";
  const options = absenteeismPeriodOptions();
  select.innerHTML = `<option value="all">Geral do ano</option>${options.map((item) => `<option value="${item.monthKey}">${monthLabel(item.monthKey)}</option>`).join("")}`;
  select.value = [...select.options].some((option) => option.value === current) ? current : "all";
  state.absencePeriod = select.value;
}

function renderAbsenteeismSummary() {
  const rows = absenceRowsForPeriod();
  const monthly = absenceMonthlyForPeriod();
  const totalAbsences = rows.reduce((sum, row) => sum + numberValue(row.ausencias), 0);
  const totalAvailable = monthly.reduce((sum, item) => sum + item.available, 0);
  const rate = totalAvailable ? totalAbsences / totalAvailable : 0;
  const meta = average(monthly, (item) => item.meta) || 0.03;
  const topSector = countBy(rows, (row) => row.setor)[0];
  const topType = countBy(rows, (row) => row.tipoAusencia)[0];

  document.querySelector("#kpiTotalLabel").textContent = "Total de ausências";
  document.querySelector("#kpiCollaboratorsLabel").textContent = "Colaboradores impactados";
  document.querySelector("#kpiPerPersonLabel").textContent = "Setores impactados";
  document.querySelector("#kpiProductionHourLabel").textContent = "Taxa de absenteísmo";
  document.querySelector("#kpiMdoDayLabel").textContent = "Meta";
  document.querySelector("#kpiWorkedDayCostLabel").textContent = "Setor crítico";
  document.querySelector("#kpiCostProductionLabel").textContent = "Tipo principal";
  document.querySelector("#kpiTotal").textContent = formatNumber(totalAbsences);
  document.querySelector("#kpiCollaborators").textContent = formatNumber(new Set(rows.map((row) => row.colaborador).filter(Boolean)).size);
  document.querySelector("#kpiPerPerson").textContent = formatNumber(new Set(rows.map((row) => row.setor).filter(Boolean)).size);
  document.querySelector("#kpiProductionHour").textContent = formatPercent(rate);
  document.querySelector("#kpiMdoDay").textContent = formatPercent(meta);
  document.querySelector("#kpiWorkedDayCost").textContent = topSector ? `${topSector[0]} (${topSector[1]})` : "--";
  document.querySelector("#kpiCostProduction").textContent = topType ? `${topType[0]} (${topType[1]})` : "--";
}

function renderAbsenteeismAnalytics() {
  renderAbsenteeismFilters();
  const newRecordButton = document.querySelector("#absenceNewRecordButton");
  if (newRecordButton) newRecordButton.hidden = !canCreateProcess("absenteismo");
  const rows = absenceRowsForPeriod();
  const monthly = absenteeismPeriodOptions();
  const maxRate = Math.max(...monthly.map((item) => Math.max(item.rate, item.meta)), 0.03);
  document.querySelector("#absenceMonthChart").innerHTML = monthly.map((item) => {
    const height = Math.max(8, (item.rate / maxRate) * 170);
    const metaHeight = Math.max(4, (item.meta / maxRate) * 170);
    const tooltip = `${monthLabel(item.monthKey)}: ${formatPercent(item.rate)} | ${formatNumber(item.absences)} faltas | meta ${formatPercent(item.meta)}`;
    return `
      <div class="absence-month-card ${item.rate > item.meta ? "over-meta" : ""}" title="${tooltip}">
        <div class="absence-rate">${formatPercent(item.rate)}</div>
        <div class="absence-column-shell">
          <i style="bottom:${metaHeight}px"></i>
          <div style="height:${height}px"></div>
        </div>
        <strong>${monthLabel(item.monthKey)}</strong>
        <small>${formatNumber(item.absences)} faltas</small>
        <em>Meta ${formatPercent(item.meta)}</em>
      </div>
    `;
  }).join("") || `<div class="empty-state">Sem ausências registradas.</div>`;

  renderAbsenceDonut("#absenceSectorBars", countBy(rows, (row) => row.setor), "ausências");
  renderAbsenceLine("#absenceTypeBars", countBy(rows, (row) => row.tipoAusencia), "registros");
}

function renderAbsenceBars(selector, entries) {
  const target = document.querySelector(selector);
  if (!target) return;
  const max = Math.max(...entries.map(([, value]) => value), 1);
  target.innerHTML = entries.map(([label, value]) => {
    const width = Math.max(4, (value / max) * 100);
    return `
      <div class="analytics-bar-row" title="${label}: ${formatNumber(value)}">
        <span>${label}</span>
        <div class="analytics-track absence"><div style="width:${width}%"></div></div>
        <strong>${formatNumber(value)}</strong>
      </div>
    `;
  }).join("") || `<div class="empty-state">Sem dados.</div>`;
}

function renderAbsenceVerticalBars(selector, entries, unitLabel = "registros") {
  const target = document.querySelector(selector);
  if (!target) return;
  const visibleEntries = entries.slice(0, 8);
  const max = Math.max(...visibleEntries.map(([, value]) => value), 1);
  target.innerHTML = visibleEntries.map(([label, value]) => {
    const height = Math.max(10, (value / max) * 170);
    return `
      <div class="absence-vertical-item" title="${label}: ${formatNumber(value)} ${unitLabel}">
        <strong>${formatNumber(value)}</strong>
        <div class="absence-vertical-shell"><span style="height:${height}px"></span></div>
        <em>${escapeHtml(label)}</em>
      </div>
    `;
  }).join("") || `<div class="empty-state">Sem dados para o período.</div>`;
}

function renderAbsenceDonut(selector, entries, unitLabel = "registros") {
  const target = document.querySelector(selector);
  if (!target) return;
  const visibleEntries = entries.slice(0, 6);
  const total = visibleEntries.reduce((sum, [, value]) => sum + numberValue(value), 0);
  if (!total) {
    target.innerHTML = `<div class="empty-state">Sem dados para o período.</div>`;
    return;
  }
  let cursor = 0;
  const colors = ["#2f9e73", "#127a80", "#e0a72e", "#d7655f", "#6b8f7b", "#9ab7ad"];
  const segments = visibleEntries.map(([, value], index) => {
    const start = cursor;
    const end = cursor + (numberValue(value) / total) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  }).join(", ");
  target.innerHTML = `
    <div class="absence-donut-wrap">
      <div class="absence-donut" title="Total: ${formatNumber(total)} ${unitLabel}" style="background: conic-gradient(${segments})"><span>${formatNumber(total)}</span></div>
      <div class="absence-donut-legend">
        ${visibleEntries.map(([label, value], index) => {
          const share = total ? numberValue(value) / total : 0;
          const tooltip = `${label}: ${formatNumber(value)} ${unitLabel} | ${formatPercent(share)} do total`;
          return `
            <div title="${escapeHtml(tooltip)}"><i style="background:${colors[index % colors.length]}"></i><span>${escapeHtml(label)}</span><strong>${formatNumber(value)} ${unitLabel} · ${formatPercent(share)}</strong></div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderAbsenceLine(selector, entries, unitLabel = "registros") {
  const target = document.querySelector(selector);
  if (!target) return;
  const visibleEntries = entries.slice(0, 8);
  const max = Math.max(...visibleEntries.map(([, value]) => value), 1);
  const total = visibleEntries.reduce((sum, [, value]) => sum + numberValue(value), 0);
  target.innerHTML = visibleEntries.length ? `
    <div class="absence-line-list">
      ${visibleEntries.map(([label, value], index) => {
        const width = Math.max(8, (numberValue(value) / max) * 100);
        const share = total ? numberValue(value) / total : 0;
        const tooltip = `${label}: ${formatNumber(value)} ${unitLabel} | ${formatPercent(share)} do total`;
        return `
          <div class="absence-line-row" title="${escapeHtml(tooltip)}">
            <span>${escapeHtml(label)}</span>
            <div><i style="width:${width}%"></i></div>
            <strong>${formatNumber(value)} <small>${formatPercent(share)}</small></strong>
          </div>
        `;
      }).join("")}
    </div>
  ` : `<div class="empty-state">Sem dados para o período.</div>`;
}

function tenureBucket(row) {
  if (!row.admissao) return "Sem admissão";
  const start = new Date(`${row.admissao}T12:00:00`);
  const end = row.dataInativacao ? new Date(`${row.dataInativacao}T12:00:00`) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 6) return "Até 6 meses";
  if (months < 12) return "6 a 12 meses";
  if (months < 24) return "1 a 2 anos";
  if (months < 48) return "2 a 4 anos";
  return "Acima de 4 anos";
}

function peopleRows() {
  return calculatedRows("colaboradores");
}

function activePeopleRows() {
  return peopleRows().filter(isActiveCollaborator);
}

function renderPeopleSummary() {
  const rows = peopleRows();
  const activeRows = activePeopleRows();
  const dismissedRows = rows.filter((row) => row.status === "Demitido");
  const sectors = new Set(activeRows.map((row) => row.setor).filter(Boolean));
  const cards = document.querySelectorAll("#processSummary > article:not(.summary-supplemental)");
  cards.forEach((card, index) => { card.hidden = index > 2; });

  document.querySelector("#kpiTotalLabel").textContent = "Colaboradores ativos";
  document.querySelector("#kpiCollaboratorsLabel").textContent = "Total de setores";
  document.querySelector("#kpiPerPersonLabel").textContent = "Demitidos no histórico";
  document.querySelector("#kpiTotal").textContent = formatNumber(activeRows.length);
  document.querySelector("#kpiCollaborators").textContent = formatNumber(sectors.size);
  document.querySelector("#kpiPerPerson").textContent = formatNumber(dismissedRows.length);
}

function experienceMilestoneDate(row, days) {
  const admission = businessDateKey(row.admissao);
  if (!admission) return null;
  const milestone = new Date(`${admission}T12:00:00`);
  if (Number.isNaN(milestone.getTime())) return null;
  milestone.setDate(milestone.getDate() + days);
  return milestone;
}

function collaboratorExperienceAgeDays(row) {
  const admission = businessDateKey(row.admissao);
  if (!admission) return null;
  const admissionDate = new Date(`${admission}T12:00:00`);
  const today = new Date(`${localDateKey()}T12:00:00`);
  if (Number.isNaN(admissionDate.getTime())) return null;
  return Math.floor((today - admissionDate) / 86400000);
}

function experienceFeedbackFor(collaboratorId, milestone) {
  const collaborator = peopleRows().find((row) => row.id === collaboratorId);
  const collaboratorName = normalizedSectorName(collaborator?.nomeCompleto || "");
  return (state.rows.experienceFeedbacks || []).find((item) => {
    if (numberValue(item.milestone) !== milestone) return false;
    if (item.collaboratorId === collaboratorId) return true;
    return collaboratorName && normalizedSectorName(item.collaboratorName || "") === collaboratorName;
  }) || null;
}

function experienceCandidates(rows = activePeopleRows()) {
  return rows.map((row) => ({
    row,
    ageDays: collaboratorExperienceAgeDays(row),
    day30: experienceMilestoneDate(row, 30),
    day60: experienceMilestoneDate(row, 60),
    feedback30: experienceFeedbackFor(row.id, 30),
    feedback60: experienceFeedbackFor(row.id, 60),
  })).filter((item) => item.day30 && item.day60 && (item.ageDays <= 60 || item.feedback30 || item.feedback60))
    .sort((a, b) => a.day60 - b.day60);
}

function feedbackCompleted(feedback) {
  return feedback?.status === "Sim";
}

function experienceDueMeta(date) {
  const today = new Date(`${localDateKey()}T12:00:00`);
  const days = Math.ceil((date - today) / 86400000);
  if (days < 0) return { className: "overdue", label: `${Math.abs(days)} dias em atraso` };
  if (days <= 7) return { className: "urgent", label: days === 0 ? "Vence hoje" : `Vence em ${days} dias` };
  return { className: "upcoming", label: `Vence em ${days} dias` };
}

function experienceFeedbackTiming(due, feedbackDate) {
  const completed = feedbackDate ? new Date(`${businessDateKey(feedbackDate)}T12:00:00`) : null;
  if (!due || !completed || Number.isNaN(completed.getTime())) return { className: "neutral", label: "Prazo não calculado" };
  const days = Math.round((completed - due) / 86400000);
  if (days > 0) return { className: "overdue", label: `${days} ${days === 1 ? "dia" : "dias"} após o prazo` };
  if (days < 0) return { className: "early", label: `${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"} antes do prazo` };
  return { className: "ontime", label: "Realizado no prazo" };
}

function feedbackActionButton(action, collaboratorId, milestone, label) {
  const icons = {
    view: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    delete: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5"/></svg>',
  };
  const dangerClass = action === "delete" ? " delete-row" : "";
  return `<button class="icon-action${dangerClass}" type="button" data-feedback-action="${action}" data-collaborator-id="${collaboratorId}" data-milestone="${milestone}" aria-label="${label}" title="${label}">${icons[action]}</button>`;
}

function feedbackRecordActions(collaboratorId, milestone) {
  const deleteButton = state.masterUnlocked
    ? feedbackActionButton("delete", collaboratorId, milestone, "Excluir feedback")
    : "";
  return `<div class="experience-card-actions">
    ${feedbackActionButton("view", collaboratorId, milestone, "Visualizar feedback")}
    ${feedbackActionButton("edit", collaboratorId, milestone, "Editar feedback")}
    ${deleteButton}
  </div>`;
}

async function handleExperienceFeedbackAction(button) {
  if (!button) return;
  const collaboratorId = button.dataset.collaboratorId;
  const milestone = numberValue(button.dataset.milestone);
  const action = button.dataset.feedbackAction;
  if (action === "delete") {
    await deleteExperienceFeedback(collaboratorId, milestone);
    return;
  }
  openExperienceFeedback(collaboratorId, milestone, action === "view" ? "view" : "edit");
}

function pendingExperienceMilestones() {
  const today = new Date(`${localDateKey()}T12:00:00`);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + 30);
  return experienceCandidates().flatMap((item) => [
    { ...item, milestone: 30, due: item.day30, feedback: item.feedback30 },
    { ...item, milestone: 60, due: item.day60, feedback: item.feedback60 },
  ]).filter((item) => !feedbackCompleted(item.feedback) && item.ageDays <= 60 && item.due <= limit)
    .sort((a, b) => a.due - b.due);
}

function experienceOverviewItems() {
  return experienceCandidates().flatMap((item) => [
    { ...item, milestone: 30, due: item.day30, feedback: item.feedback30 },
    { ...item, milestone: 60, due: item.day60, feedback: item.feedback60 },
  ]).filter((item) => item.ageDays <= 60 || feedbackCompleted(item.feedback))
    .sort((a, b) => {
      const doneA = feedbackCompleted(a.feedback) ? 1 : 0;
      const doneB = feedbackCompleted(b.feedback) ? 1 : 0;
      if (doneA !== doneB) return doneA - doneB;
      return a.due - b.due;
    });
}

function renderPeopleAnalytics() {
  const activeRows = activePeopleRows();
  renderAbsenceVerticalBars("#peopleSectorBars", countBy(activeRows, (row) => row.setor), "colaboradores");
  const items = experienceOverviewItems();
  const target = document.querySelector("#peopleExperienceList");
  if (!target) return;
  const board = document.querySelector(".experience-board-panel");
  if (board) board.hidden = true;
  target.innerHTML = items.length ? items.map((item) => {
    const dueMeta = experienceDueMeta(item.due);
    const done = feedbackCompleted(item.feedback);
    const action = done
      ? `${feedbackActionButton("view", item.row.id, item.milestone, "Visualizar feedback")}<span class="experience-ok">OK</span>`
      : `<button class="primary-button compact" type="button" data-feedback-action="register" data-collaborator-id="${item.row.id}" data-milestone="${item.milestone}">Registrar</button>`;
    const statusLabel = done ? `Registrado em ${formatDate(item.feedback.feedbackDate)}` : dueMeta.label;
    return `
      <div class="experience-list-item">
        <div class="experience-list-main"><strong>${escapeHtml(item.row.nomeCompleto)}</strong><small>${escapeHtml(item.row.setor || "Sem setor")} · Feedback ${item.milestone} dias</small></div>
        <span class="experience-list-status ${done ? "completed" : dueMeta.className}"><b>${statusLabel}</b>${item.due.toLocaleDateString("pt-BR")}</span>
        <div class="experience-list-actions">${action}</div>
      </div>
    `;
  }).join("") : `<div class="empty-state">Nenhum colaborador ativo dentro do ciclo de experiência.</div>`;
}

function experienceCard(item, milestone, feedback, completed = false) {
  const due = milestone === 30 ? item.day30 : item.day60;
  const dueMeta = experienceDueMeta(due);
  const status = feedback?.status || "Pendente";
  const timing = feedbackCompleted(feedback) ? experienceFeedbackTiming(due, feedback.feedbackDate) : null;
  const action = feedback
    ? feedbackRecordActions(item.row.id, milestone)
    : `<button class="ghost-button compact" type="button" data-feedback-action="register" data-collaborator-id="${item.row.id}" data-milestone="${milestone}">Registrar</button>`;
  return `
    <article class="experience-card ${completed ? "completed" : dueMeta.className}">
      <div class="experience-card-head"><span>${escapeHtml(item.row.setor || "Sem setor")}</span><b>${milestone} dias</b></div>
      <h4>${escapeHtml(item.row.nomeCompleto)}</h4>
      <p>${due.toLocaleDateString("pt-BR")} · ${completed ? "Concluído com sucesso" : dueMeta.label}</p>
      ${feedbackCompleted(feedback) ? `<p class="feedback-completion"><strong>Realizado em ${formatDate(feedback.feedbackDate)}</strong><span class="${timing.className}">${timing.label}</span></p>` : ""}
      <div class="experience-card-foot">
        <small class="feedback-status status-${normalizedSectorName(status).replaceAll(" ", "-")}">${escapeHtml(status)}</small>
        ${action}
      </div>
    </article>
  `;
}

function experienceWaitingCard(item) {
  const feedback30 = item.feedback30;
  const feedback60 = item.feedback60;
  const timing30 = experienceFeedbackTiming(item.day30, feedback30?.feedbackDate);
  const due60 = experienceDueMeta(item.day60);
  const today = new Date(`${localDateKey()}T12:00:00`);
  const canRegister60 = item.day60 <= today;
  const currentFeedback = feedback60 || feedback30;
  const currentMilestone = feedback60 ? 60 : 30;
  const status = feedback60?.status || "30 dias realizado";
  const nextAction = !feedback60 && canRegister60
    ? `<button class="primary-button compact" type="button" data-feedback-action="register" data-collaborator-id="${item.row.id}" data-milestone="60">Registrar 60 dias</button>`
    : "";
  return `
    <article class="experience-card awaiting-closing ${due60.className}">
      <div class="experience-card-head"><span>${escapeHtml(item.row.setor || "Sem setor")}</span><b>30 dias concluído</b></div>
      <h4>${escapeHtml(item.row.nomeCompleto)}</h4>
      <p class="feedback-completion"><strong>Realizado em ${formatDate(feedback30.feedbackDate)}</strong><span class="${timing30.className}">${timing30.label}</span></p>
      <div class="experience-next-step"><small>Próximo feedback</small><strong>60 dias · ${item.day60.toLocaleDateString("pt-BR")}</strong><span class="${due60.className}">${due60.label}</span></div>
      ${feedback60 ? `<p class="feedback-retry-note">Registro de 60 dias: ${escapeHtml(feedback60.status || "Pendente")}</p>` : ""}
      <div class="experience-card-foot">
        <small class="feedback-status status-${normalizedSectorName(status).replaceAll(" ", "-")}">${escapeHtml(status)}</small>
        <div class="experience-card-action-row">${feedbackRecordActions(item.row.id, currentMilestone)}${nextAction}</div>
      </div>
    </article>
  `;
}

function renderExperienceKanban() {
  const target = document.querySelector("#experienceKanban");
  if (!target) return;
  const columns = { 30: [], 60: [], completed: [] };
  experienceCandidates().forEach((item) => {
    const done30 = feedbackCompleted(item.feedback30);
    const done60 = feedbackCompleted(item.feedback60);
    if (!done30) columns[30].push(experienceCard(item, 30, item.feedback30));
    else if (!done60) columns[60].push(experienceWaitingCard(item));
    else columns.completed.push(experienceCard(item, 60, item.feedback60, true));
  });
  const column = (title, subtitle, items, tone) => `
    <section class="experience-column tone-${tone}">
      <header><div><strong>${title}</strong><small>${subtitle}</small></div><i>${items.length}</i></header>
      <div>${items.join("") || '<p class="empty-state">Nenhum colaborador nesta etapa.</p>'}</div>
    </section>
  `;
  target.innerHTML = [
    column("Feedback 30 dias", "Primeira conversa", columns[30], "30"),
    column("Feedback 60 dias", "Conversa de fechamento", columns[60], "60"),
    column("Concluídos", "Ciclo registrado", columns.completed, "done"),
  ].join("");
}

function openExperienceFeedback(collaboratorId, milestone, mode = "edit") {
  const collaborator = peopleRows().find((row) => row.id === collaboratorId);
  const dialog = document.querySelector("#experienceFeedbackDialog");
  if (!collaborator || !dialog) return;
  const existing = experienceFeedbackFor(collaboratorId, milestone);
  const due = experienceMilestoneDate(collaborator, milestone);
  document.querySelector("#experienceFeedbackCollaboratorId").value = collaboratorId;
  document.querySelector("#experienceFeedbackMilestone").value = String(milestone);
  document.querySelector("#experienceFeedbackCollaborator").value = collaborator.nomeCompleto;
  document.querySelector("#experienceFeedbackMilestoneLabel").value = `${milestone} dias · previsto para ${due?.toLocaleDateString("pt-BR") || "--"}`;
  document.querySelector("#experienceFeedbackStatus").value = existing?.status || "";
  document.querySelector("#experienceFeedbackDate").value = existing?.feedbackDate || "";
  document.querySelector("#experienceFeedbackResponsible").value = existing?.responsible || currentActorStamp().name || "";
  document.querySelector("#experienceFeedbackNotes").value = existing?.notes || "";
  document.querySelector("#experienceFeedbackMessage").textContent = "";
  const viewOnly = mode === "view";
  ["experienceFeedbackStatus", "experienceFeedbackDate", "experienceFeedbackResponsible", "experienceFeedbackNotes"].forEach((id) => {
    document.querySelector(`#${id}`).disabled = viewOnly;
  });
  document.querySelector("#saveExperienceFeedbackButton").hidden = viewOnly;
  document.querySelector("#cancelExperienceFeedbackButton").textContent = viewOnly ? "Fechar" : "Cancelar";
  document.querySelector("#experienceFeedbackTitle").textContent = `${viewOnly ? "Visualizar" : existing ? "Editar" : "Registrar"} feedback · ${milestone} dias`;
  dialog.showModal();
}

function closeExperienceFeedback() {
  document.querySelector("#experienceFeedbackDialog")?.close();
}

async function deleteExperienceFeedback(collaboratorId, milestone) {
  const existing = experienceFeedbackFor(collaboratorId, milestone);
  if (!existing) return;
  if (!confirmMasterDeletion(`feedback de ${milestone} dias de ${existing.collaboratorName}`)) return;
  const previousFeedbacks = [...(state.rows.experienceFeedbacks || [])];
  state.rows.experienceFeedbacks = state.rows.experienceFeedbacks.filter((item) => item.id !== existing.id);
  saveRows("experienceFeedbacks", state.rows.experienceFeedbacks);
  try {
    await deleteOperationalRecord(PROCESS_CONFIGS.experienceFeedbacks, existing);
  } catch (error) {
    state.rows.experienceFeedbacks = previousFeedbacks;
    saveRows("experienceFeedbacks", state.rows.experienceFeedbacks);
    showSystemToast(error.message || "Não foi possível excluir o feedback no banco.", "error");
    return;
  }
  state.inputLogs = window.PHAudit.createEvent({
    type: "feedback_experiencia_excluido",
    processId: "colaboradores",
    processName: "Colaboradores",
    profile: "Gestor Master",
    summary: `${existing.collaboratorName}: feedback de ${milestone} dias excluído.`,
    details: { removedFeedback: existing },
  });
  renderPeopleSummary();
  renderPeopleAnalytics();
  try {
    renderSidebarAlerts();
  } catch (error) {
    console.warn("Os alertas laterais não puderam ser atualizados:", error);
  }
}

async function saveExperienceFeedback(event) {
  event.preventDefault();
  const collaboratorId = document.querySelector("#experienceFeedbackCollaboratorId").value;
  const milestone = numberValue(document.querySelector("#experienceFeedbackMilestone").value);
  const status = document.querySelector("#experienceFeedbackStatus").value;
  const feedbackDate = document.querySelector("#experienceFeedbackDate").value;
  const responsible = document.querySelector("#experienceFeedbackResponsible").value.trim();
  const notes = document.querySelector("#experienceFeedbackNotes").value.trim();
  const message = document.querySelector("#experienceFeedbackMessage");
  if (!status) {
    message.textContent = "Informe se o feedback foi realizado.";
    return;
  }
  if (status === "Sim" && (!feedbackDate || !responsible)) {
    message.textContent = "Para concluir, informe a data da conversa e o responsável.";
    return;
  }
  const collaborator = peopleRows().find((row) => row.id === collaboratorId);
  if (!collaborator) {
    message.textContent = "Colaborador não encontrado.";
    return;
  }
  const existing = experienceFeedbackFor(collaboratorId, milestone);
  const previousFeedbacks = [...(state.rows.experienceFeedbacks || [])];
  const actor = currentActorStamp();
  const now = new Date().toISOString();
  const record = {
    ...(existing || {}),
    id: existing?.id || crypto.randomUUID(),
    collaboratorId,
    collaboratorName: collaborator.nomeCompleto,
    sector: collaborator.setor,
    milestone,
    scheduledDate: localDateKey(experienceMilestoneDate(collaborator, milestone)),
    status,
    feedbackDate: status === "Sim" ? feedbackDate : "",
    responsible,
    notes,
    updatedAt: now,
    updatedByName: actor.name,
    createdAt: existing?.createdAt || now,
  };
  state.rows.experienceFeedbacks = existing
    ? state.rows.experienceFeedbacks.map((item) => item.id === existing.id ? record : item)
    : [...(state.rows.experienceFeedbacks || []), record];
  saveRows("experienceFeedbacks", state.rows.experienceFeedbacks);
  try {
    await persistOperationalRecordStrict(PROCESS_CONFIGS.experienceFeedbacks, record);
    markRowAsSynced(PROCESS_CONFIGS.experienceFeedbacks, record, "legacy_operational_records");
    saveRows("experienceFeedbacks", state.rows.experienceFeedbacks);
  } catch (error) {
    state.rows.experienceFeedbacks = previousFeedbacks;
    saveRows("experienceFeedbacks", state.rows.experienceFeedbacks);
    message.textContent = error.message || "Não foi possível sincronizar o feedback no banco.";
    return;
  }
  state.inputLogs = window.PHAudit.createEvent({
    type: "feedback_experiencia",
    processId: "colaboradores",
    processName: "Colaboradores",
    profile: "Gestor Master",
    summary: `${collaborator.nomeCompleto}: feedback de ${milestone} dias - ${status}.`,
    details: { record },
  });
  closeExperienceFeedback();
  renderPeopleSummary();
  renderPeopleAnalytics();
  renderSidebarAlerts();
}

function productionSnapshotPeriods(config) {
  const months = new Map();
  calculatedRows(config.id).forEach((row) => {
    const key = businessDateKey(row.data).slice(0, 7);
    if (key.length === 7) months.set(key, monthLabel(key));
  });
  return [...months.entries()].sort(([a], [b]) => b.localeCompare(a));
}

const GRAM_PRODUCTION_PROCESS_IDS = new Set(["preElos", "tratamento", "galvanoplastia", "ecoatProducao"]);
const BASKET_PRODUCTION_PROCESS_IDS = new Set(["ecoatProducao"]);

function productionSnapshotCards(config, totals, rows) {
  const management = managementProductionSummary(config, rows);
  const productionLabel = config.id === "colagem" ? "Tags Expedidas" : "Produção em tags";
  const costLabel = config.id === "colagem" ? "Custo/tag expedida" : "Custo/tag centro";
  const cards = [
    {
      label: "Total de peças",
      value: formatNumber(totals.totalPieces),
      help: "Quantidade de peças registrada no período.",
    },
    {
      label: productionLabel,
      value: formatNumber(management.production),
      help: config.id === "colagem" ? "Soma do campo Tags Expedidas." : "Soma do campo Qtd. Tags.",
    },
    {
      label: "Média colaboradores",
      value: management.averageCollaborators ? formatNumber(management.averageCollaborators, 1) : "--",
      help: "Colaboradores ativos do setor ou média dos lançamentos.",
    },
    {
      label: "Produção por colaborador",
      value: management.productionPerCollaborator ? formatNumber(management.productionPerCollaborator, 1) : "--",
      help: "Produção em tags dividida pela média de colaboradores.",
    },
    {
      label: "Produção hora/homem",
      value: management.productionPerHour ? formatNumber(management.productionPerHour, 1) : "--",
      help: "Base de 7 horas por colaborador informado no lançamento.",
    },
    {
      label: "Custo MDO mensal",
      value: management.laborCost ? formatCurrency(management.laborCost) : "Custo não informado",
      help: `Centro de custo: ${management.costCenter || config.name}.`,
    },
    {
      label: costLabel,
      value: management.costPerProduction ? formatCurrency(management.costPerProduction) : "--",
      help: `Custo dividido por ${formatNumber(management.centerProduction)} tags do centro.`,
    },
  ];
  return state.masterUnlocked ? cards : cards.slice(0, 5);
}

function renderRegisteredCostSnapshot(config, rows) {
  const target = document.querySelector("#productionRegisteredCost");
  if (!target) return;
  if (!state.masterUnlocked) {
    target.hidden = true;
    target.innerHTML = "";
    return;
  }
  target.hidden = false;
  const summary = registeredCollaboratorCostSummary(config, rows);
  target.innerHTML = `
    <div class="registered-cost-heading">
      <span class="panel-label">Leitura pelo apontamento</span>
      <strong>Colaboradores registrados no lançamento</strong>
      <small>Visão complementar: usa a quantidade de colaboradores digitada no setor, sem alterar o custo/tag consolidado do centro.</small>
    </div>
    <div class="registered-cost-grid">
      <article>
        <span>Colaboradores apontados</span>
        <strong>${summary.registeredAverage ? formatNumber(summary.registeredAverage, 1) : "--"}</strong>
        <small>Média dos lançamentos do período.</small>
      </article>
      <article>
        <span>Custo médio por colaborador</span>
        <strong>${summary.averageCostPerCollaborator ? formatCurrency(summary.averageCostPerCollaborator) : "Custo não informado"}</strong>
        <small>${escapeHtml(summary.costCenter || config.name)}: custo MDO dividido por ativos.</small>
      </article>
      <article>
        <span>Custo MDO apontado</span>
        <strong>${summary.registeredLaborCost ? formatCurrency(summary.registeredLaborCost) : "--"}</strong>
        <small>Custo médio por colaborador x colaboradores apontados.</small>
      </article>
      <article>
        <span>Custo/tag apontado</span>
        <strong>${summary.registeredCostPerProduction ? formatCurrency(summary.registeredCostPerProduction) : "--"}</strong>
        <small>Usa ${formatNumber(summary.production)} tags do setor no período.</small>
      </article>
    </div>
  `;
}

function renderProductionSnapshot(config) {
  const area = document.querySelector("#productionSnapshot");
  const select = document.querySelector("#productionSnapshotPeriod");
  const cardsArea = document.querySelector("#productionSnapshotCards");
  if (!area || !select || !config || config.indicator || config.hidden || config.archived || config.operationalOnly) {
    if (area) area.hidden = true;
    return;
  }
  const periods = productionSnapshotPeriods(config);
  const currentMonth = localDateKey().slice(0, 7);
  const previousProcess = area.dataset.processId;
  const requested = previousProcess === config.id ? select.value : "";
  const selected = periods.some(([key]) => key === requested)
    || requested === "all" ? requested
    : periods.some(([key]) => key === currentMonth) ? currentMonth : periods[0]?.[0] || "all";
  select.innerHTML = `<option value="all">Histórico geral</option>${periods.map(([key, label]) => `<option value="${key}">${label}</option>`).join("")}`;
  select.value = selected;
  area.dataset.processId = config.id;
  const rows = calculatedRows(config.id).filter((row) => selected === "all" || businessDateKey(row.data).startsWith(selected));
  const totals = processSnapshotTotals(config, rows);
  document.querySelector("#productionSnapshotTitle").textContent = config.name;
  if (cardsArea) {
    cardsArea.innerHTML = productionSnapshotCards(config, totals, rows).map((card, index, cards) => `
      <article class="${index === cards.length - 1 ? "accent" : ""}">
        <span>${card.label}</span>
        <strong>${card.value}</strong>
        <small>${card.help}</small>
      </article>
    `).join("");
  }
  renderRegisteredCostSnapshot(config, rows);
  area.hidden = false;
}

function renderProcess() {
  const config = configFor();
  if (!config) return;
  document.querySelector("#tableTitle").textContent = config.name;
  renderTableHeader(config);
  renderTablePeriodFilter(config);
  if (config.id === "absenteismo") renderAbsenteeismFilters();
  if (config.indicator) renderSummary(config);
  renderExternalServicesAlerts(config);
  renderTable(config);
  renderInlineLaunchForm(config);
  document.querySelector("#absenteeismAnalytics").hidden = config.id !== "absenteismo";
  if (config.id === "absenteismo") renderAbsenteeismAnalytics();
  document.querySelector("#peopleAnalytics").hidden = config.id !== "colaboradores";
  if (config.id === "colaboradores") renderPeopleAnalytics();
  document.querySelector("#providersAnalytics").hidden = config.id !== "prestadoresServicos";
  if (config.id === "prestadoresServicos") renderProvidersAnalytics();
  renderProductionSnapshot(config);
}

function implementedConfigs() {
  return Object.values(PROCESS_CONFIGS);
}

function productionConfigs() {
  return implementedConfigs().filter((config) => !config.indicator && !config.hidden && !config.archived && !config.operationalOnly);
}

function dashboardConfigs() {
  return productionConfigs().filter((config) => config.id !== "cadastro");
}

function dashboardRows(config) {
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const sector = document.querySelector("#dashboardSector")?.value || "all";
  if (sector !== "all" && config.id !== sector) return [];
  return calculatedRows(config.id).filter((row) => {
    if (period === "all") return true;
    return businessDateKey(row.data).startsWith(period);
  });
}

function getRowTotal(row, config) {
  return numberValue(row[config.totalKey]);
}

function getRowPiecesTotal(row, config) {
  if (config.currentAccountLedger) return numberValue(row.qtdPeças);
  if (config.id === "galvanoplastia") return numberValue(row.qtdPeças);
  if (config.id === "preElos") return numberValue(row.qtdPeças);
  if (config.id === "ecoat") return numberValue(row.qtdPeças);
  if (config.id === "ecoatProducao") return numberValue(row.qtdPeças || row.qtdPecas);
  if (config.id === "etiquetagemConta") return numberValue(row.qtdPeças);
  if (config.id === "etiquetagem") return numberValue(row.qtdPeças);
  if (config.id === "colagem") return numberValue(row.qtdPeças);
  return getRowTotal(row, config);
}

function dashboardMetricUnit(config) {
  if (!config || config.indicator) return "";
  return "Tags";
}

function getDashboardPrimaryTotal(row, config) {
  return getDashboardTagTotal(row, config);
}

function dashboardPrimaryMetric(item) {
  return item.tags;
}

function selectedDashboardPeriod() {
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  return period === "all" ? null : period;
}

function dashboardMonthTotal(config, monthKey, selector) {
  const cacheKey = `${config.id}|${monthKey}|${selector.name || "selector"}`;
  if (state.monthTotalCache[cacheKey] !== undefined) return state.monthTotalCache[cacheKey];
  const total = calculatedRows(config.id)
    .filter((row) => businessDateKey(row.data).startsWith(monthKey))
    .reduce((sum, row) => sum + selector(row, config), 0);
  state.monthTotalCache[cacheKey] = total;
  return total;
}

function periodRows(config, period = selectedDashboardPeriod()) {
  return calculatedRows(config.id).filter((row) => !period || businessDateKey(row.data).startsWith(period));
}

function dashboardYearMonths(period) {
  const year = period ? period.slice(0, 4) : String(new Date().getFullYear());
  return MONTHS.map(([month, label]) => ({ key: `${year}-${month}`, label }));
}

function projectedNextMonth(config, period, selector) {
  if (!period) return 0;
  const [year, month] = period.split("-").map(Number);
  const monthKeys = [1, 2, 3].map((offset) => {
    const date = new Date(year, month - 1 - offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
  const values = monthKeys
    .map((monthKey) => dashboardMonthTotal(config, monthKey, selector))
    .filter((value) => value > 0);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : dashboardMonthTotal(config, period, selector);
}

function getRowCost(row) {
  return numberValue(row.custoTotalMdo || row.custoDiaTrabalhado || row.mediaCustoMdoDia);
}

function getRowMdoCost(row) {
  return numberValue(row.custoDiaTrabalhado || row.mediaCustoMdoDia || row.custoMdoDia);
}

function getRowMdoAverage(row) {
  return numberValue(row.mediaCustoMdoDia || row.custoMdoDia || row.custoDiaTrabalhado);
}

function sectorMdoAverage(rows) {
  return average(rows, getRowMdoAverage);
}

function getRowTagsTotal(row, config) {
  if (config.currentAccountLedger) return numberValue(row.tagsEntrada || row.qtdTags);
  if (config.id === "preElos") return numberValue(row.tagsEntrada || row.qtdTags);
  if (config.id === "ecoat") return numberValue(row.tagsEntrada || row.qtdTags);
  if (config.id === "ecoatProducao") return numberValue(row.qtdTags);
  if (config.id === "etiquetagemConta") return numberValue(row.tagsEntrada || row.qtdTags);
  if (config.id === "etiquetagem") return numberValue(row.tagsProduzidas);
  if (config.id === "colagem") return numberValue(row.tagsPreco || row.tagsPrecificadas);
  return numberValue(row.qtdTags);
}

function getRowReleasedTags(row, config) {
  if (config.currentAccountLedger) return numberValue(row.tagsSaida);
  if (config.id === "preElos") return numberValue(row.tagsSaida);
  if (config.id === "ecoat") return numberValue(row.tagsSaida);
  if (config.id === "etiquetagemConta") return numberValue(row.tagsSaida);
  if (["iqSemiacabado", "tratamento", "galvanoplastia"].includes(config.id)) return numberValue(row.tagsLiberadas);
  if (config.id === "posBanho") {
    return numberValue(row.tagsRodio) + numberValue(row.tagsQuebec) + numberValue(row.tagsEcoat);
  }
  if (config.id === "etiquetagem") return numberValue(row.tagsProduzidas);
  if (config.id === "colagem") return numberValue(row.tagsCampinas || row.tagsEnviadas);
  return numberValue(row.tagsLiberadas || row.qtdTags);
}

function getRowCampinasTags(row) {
  return numberValue(row.tagsCampinas || row.tagsEnviadas);
}

function getDashboardTagTotal(row, config) {
  if (!config) return 0;
  if (config.id === "colagem") return getRowCampinasTags(row);
  return managementTagProduction(row, config);
}

function getRowReceivedPieces(row, config) {
  if (config.currentAccountLedger) return numberValue(row.qtdPeças);
  if (config.id === "preElos") return numberValue(row.qtdPeças);
  if (config.id === "ecoat") return numberValue(row.qtdPeças);
  if (config.id === "etiquetagemConta") return numberValue(row.qtdPeças);
  if (config.id === "galvanoplastia") return numberValue(row.qtdPeças);
  return getRowPiecesTotal(row, config);
}

function getRowReleasedPieces(row, config) {
  if (config.currentAccountLedger) return numberValue(row.qtdPeças);
  if (config.id === "preElos") return numberValue(row.qtdPeças);
  if (config.id === "ecoat") return numberValue(row.qtdPeças);
  if (config.id === "etiquetagemConta") return numberValue(row.qtdPeças);
  if (config.id === "galvanoplastia") return numberValue(row.qtdPeças);
  return getRowPiecesTotal(row, config);
}

function processFlowTotals(config, rows) {
  return rows.reduce((totals, row) => ({
    piecesReceived: totals.piecesReceived + getRowReceivedPieces(row, config),
    piecesReleased: totals.piecesReleased + getRowReleasedPieces(row, config),
    tagsReceived: totals.tagsReceived + getRowTagsTotal(row, config),
    tagsReleased: totals.tagsReleased + getRowReleasedTags(row, config),
  }), { piecesReceived: 0, piecesReleased: 0, tagsReceived: 0, tagsReleased: 0 });
}

function getRowBathGrams(row, config) {
  if (config.id === "ecoatProducao") return numberValue(row.pesoGramas);
  if (config.id === "galvanoplastia") return numberValue(row.kgTotal || row.totalBanhado || row.totalBanhadoGramas);
  return numberValue(row.pesoGramas || row.kgTotal || row.totalBanhado || row.totalBanhadoGramas || row.banhoTotal);
}

function getRowBasketTotal(row) {
  return numberValue(row.qtdCestos || row.totalCestos || row.cestos);
}

function processSnapshotTotals(config, rows) {
  const flow = processFlowTotals(config, rows);
  return {
    totalPieces: Math.max(flow.piecesReceived, flow.piecesReleased),
    totalTags: Math.max(flow.tagsReceived, flow.tagsReleased),
    totalBath: rows.reduce((sum, row) => sum + getRowBathGrams(row, config), 0),
    totalBaskets: rows.reduce((sum, row) => sum + getRowBasketTotal(row), 0),
    averageProduction: average(rows, (row) => numberValue(row.produçãoColaborador || row.totalPecasMdo || row.produçãoMdo || row.produtividadeMdo)),
  };
}

function getRowPeople(row) {
  return numberValue(row.colaboradores);
}

function getRowProductivity(row) {
  return numberValue(row.produçãoHora || row.gramasHora || row.produtividadeHoraHomem);
}

function buildSectorMetric(config, rows) {
  const pieces = rows.reduce((sum, row) => sum + getRowPiecesTotal(row, config), 0);
  const tags = rows.reduce((sum, row) => sum + getDashboardTagTotal(row, config), 0);
  const flow = processFlowTotals(config, rows);
  const total = rows.reduce((sum, row) => sum + getRowTotal(row, config), 0);
  const productionUnits = tags;
  return { config, rows, total, pieces, tags, productionUnits, flow };
}

function dashboardSectorMetrics() {
  return dashboardConfigs().map((config) => {
    const rows = dashboardRows(config);
    return buildSectorMetric(config, rows);
  }).filter((item) => item.rows.length);
}

function executiveFactoryMetrics() {
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const sector = document.querySelector("#dashboardSector")?.value || "all";
  const availabilityStart = "2026-06";
  if (period !== "all" && period < availabilityStart) return [];
  return order.filter((id) => sector === "all" || id === sector).map((id) => {
    const config = configFor(id);
    const rows = calculatedRows(config.id).filter((row) => {
      const month = businessDateKey(row.data).slice(0, 7);
      if (!month || month < availabilityStart) return false;
      return period === "all" || month === period;
    });
    return buildSectorMetric(config, rows);
  });
}

function availableDashboardPeriods() {
  const months = new Map();
  dashboardConfigs().forEach((config) => {
    calculatedRows(config.id).forEach((row) => {
      const key = businessDateKey(row.data).slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(key)) return;
      months.set(key, monthLabel(key));
    });
  });
  return [...months.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
}

function renderDashboardPeriodOptions() {
  const select = document.querySelector("#dashboardPeriod");
  if (!select) return;
  const periods = availableDashboardPeriods();
  const currentMonth = localDateKey().slice(0, 7);
  const fallbackPeriod = periods.some(([value]) => value === currentMonth)
    ? currentMonth
    : periods.at(-1)?.[0] || "all";
  const current = select.value || fallbackPeriod;
  const options = periods.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  select.innerHTML = `<option value="all">Histórico geral</option>${options}`;
  select.value = [...select.options].some((option) => option.value === current) ? current : "all";
}

function renderDashboardSectorOptions() {
  const select = document.querySelector("#dashboardSector");
  if (!select) return;
  const current = select.value || "all";
  select.innerHTML = `<option value="all">Todos os setores</option>${dashboardConfigs().map((config) => `<option value="${config.id}">${config.name}</option>`).join("")}`;
  select.value = [...select.options].some((option) => option.value === current) ? current : "all";
}

function renderDashboard() {
  renderDashboardPeriodOptions();
  renderDashboardSectorOptions();
  const metrics = dashboardSectorMetrics();
  const totalProduction = metrics.reduce((sum, item) => sum + item.flow.piecesReceived, 0);
  const releasedPieces = metrics.reduce((sum, item) => sum + item.flow.piecesReleased, 0);
  const totalTags = metrics.reduce((sum, item) => sum + item.flow.tagsReceived, 0);
  const releasedTags = metrics.reduce((sum, item) => sum + item.flow.tagsReleased, 0);
  const deltas = dashboardDeltas({ totalProduction });
  const dashTotalProduction = document.querySelector("#dashTotalProduction");
  if (dashTotalProduction) dashTotalProduction.textContent = formatNumber(totalProduction);
  const dashReleasedPieces = document.querySelector("#dashReleasedPieces");
  if (dashReleasedPieces) dashReleasedPieces.textContent = formatNumber(releasedPieces);
  const dashTotalTags = document.querySelector("#dashTotalTags");
  if (dashTotalTags) dashTotalTags.textContent = formatNumber(totalTags);
  const dashReleasedTags = document.querySelector("#dashReleasedTags");
  if (dashReleasedTags) dashReleasedTags.textContent = formatNumber(releasedTags);
  const dashTotalProductionDelta = document.querySelector("#dashTotalProductionDelta");
  if (dashTotalProductionDelta) dashTotalProductionDelta.textContent = formatDelta(deltas.totalProduction, false);
  renderDashboardSectorBars(metrics, totalProduction);
  renderDashboardMonthlyChart();
  renderVisualManagement(metrics);
  const executiveMetrics = executiveFactoryMetrics();
  const selectedPeriod = document.querySelector("#dashboardPeriod")?.value || "all";
  const finalColagemTags = colagemExecutiveTags(selectedPeriod);
  renderExecutiveSummary(executiveMetrics, finalColagemTags);
  renderFactoryOperationDashboard(executiveMetrics, finalColagemTags);
  renderDashboardSummaryTable(metrics);
  renderDashboardView();
}

function renderDashboardView() {
  const selectedSector = document.querySelector("#dashboardSector")?.value || "all";
  const availableModes = new Set([...document.querySelectorAll("[data-dashboard-mode]")].map((button) => button.dataset.dashboardMode));
  if (!availableModes.has(state.dashboardView)) state.dashboardView = availableModes.has("summary") ? "summary" : [...availableModes][0] || "summary";
  document.querySelectorAll("[data-dashboard-view]").forEach((section) => {
    const wrongView = section.dataset.dashboardView !== state.dashboardView;
    const factoryOnly = section.classList.contains("factory-only") && selectedSector !== "all";
    section.hidden = wrongView || factoryOnly;
  });
  document.querySelectorAll("[data-dashboard-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dashboardMode === state.dashboardView);
  });
  const metricControl = document.querySelector("#dashboardMetric")?.closest("label");
  if (metricControl) metricControl.hidden = state.dashboardView !== "production";
}

function previousMonth(period) {
  if (!period || period === "all") return null;
  const [year, month] = period.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function productionRowsHaveData(rows) {
  return (rows || []).some((row) => (
    numberValue(row.total) > 0
    || numberValue(row.tags) > 0
    || numberValue(row.piecesReceived) > 0
    || numberValue(row.tagsReceived) > 0
    || numberValue(row.piecesReleased) > 0
    || numberValue(row.tagsReleased) > 0
  ));
}

function dashboardMetricsFor(period) {
  const sector = document.querySelector("#dashboardSector")?.value || "all";
  const metrics = dashboardConfigs().map((config) => {
    if (sector !== "all" && config.id !== sector) return null;
    const rows = calculatedRows(config.id).filter((row) => businessDateKey(row.data).startsWith(period));
    const flow = processFlowTotals(config, rows);
    const tags = rows.reduce((sum, row) => sum + getDashboardTagTotal(row, config), 0);
    return { total: tags, tags, rows, flow };
  }).filter((item) => item && item.rows.length);
  const totalProduction = metrics.reduce((sum, item) => sum + item.total, 0);
  return { totalProduction };
}

function dashboardDeltas(current) {
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const previous = previousMonth(period);
  if (!previous) return {};
  const prev = dashboardMetricsFor(previous);
  return {
    totalProduction: percentChange(current.totalProduction, prev.totalProduction),
  };
}

function percentChange(current, previous) {
  if (!previous) return null;
  return (current - previous) / previous;
}

function formatDelta(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "Variação: --";
  const sign = value > 0 ? "+" : "";
  return `Vs mês anterior: ${sign}${formatNumber(value * 100, 1)}%`;
}

function factoryVisualMetric(item) {
  if (!item) return null;
  const { config, rows } = item;
  if (config.id === "separacaoProdutos") {
    return { ...item, label: "Separação/Produtos", unit: "Tags", value: item.tags };
  }
  if (config.id === "iqSemiacabado") {
    return { ...item, label: "IQ Produtos", unit: "Tags", value: item.tags };
  }
  if (config.id === "tratamento") {
    return { ...item, label: "Tratamento de Superfície", unit: "Tags", value: item.tags };
  }
  if (config.id === "preElos") {
    return { ...item, label: "Pré-Elos", unit: "Tags", value: item.tags };
  }
  if (config.id === "ecoatProducao") {
    return { ...item, label: "E-coat", unit: "Tags", value: item.tags };
  }
  if (config.id === "galvanoplastia") {
    return { ...item, label: "Galvanoplastia", unit: "Tags", value: item.tags };
  }
  if (config.id === "retrabalho") {
    return { ...item, label: "Retrabalhos Galvano", unit: "Tags", value: item.tags };
  }
  if (config.id === "posBanho") {
    return { ...item, label: "Pós Banho", unit: "Tags", value: item.tags };
  }
  if (config.id === "etiquetagem") {
    return { ...item, label: "Etiquetagem", unit: "Tags", value: item.tags };
  }
  if (config.id === "colagem") {
    return { ...item, label: "Produção Serial/Colagem", unit: "Tags", value: item.tags };
  }
  return null;
}

function factoryVisualMetrics(metrics) {
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  const byId = new Map(metrics.map((item) => [item.config.id, item]));
  return order
    .map((id) => factoryVisualMetric(byId.get(id)))
    .filter(Boolean);
}

function renderDashboardSectorBars(metrics, totalProduction) {
  const target = document.querySelector("#dashboardSectorBars");
  if (!target) return;
  const selectedSector = document.querySelector("#dashboardSector")?.value || "all";
  if (selectedSector !== "all") {
    renderSelectedSectorYearHistory(configFor(selectedSector));
    return;
  }
  const factoryChartLabel = document.querySelector("#factoryChartLabel");
  if (factoryChartLabel) factoryChartLabel.textContent = "Produção total por setor";
  const factoryChartTitle = document.querySelector("#factoryChartTitle");
  if (factoryChartTitle) factoryChartTitle.textContent = "Comparativo visual da fábrica";
  target.classList.remove("sector-year-history");
  const visualMetrics = factoryVisualMetrics(metrics);
  const visualTotal = visualMetrics.reduce((sum, item) => sum + item.value, 0);
  const maxTotal = Math.max(...visualMetrics.map((item) => item.value), 1);
  const rows = visualMetrics
    .map((item) => {
      const width = Math.max(3, (item.value / maxTotal) * 100);
      const share = visualTotal ? item.value / visualTotal : 0;
      const tooltip = `${item.label}: ${formatNumber(item.value)} ${item.unit} | ${formatPercent(share)} do volume exibido`;
      return `
        <article class="sector-flow-card" title="${tooltip}">
          <div>
            <span>${escapeHtml(item.label)}</span>
            <small>${formatNumber(item.rows.length)} registros</small>
          </div>
          <strong>${formatNumber(item.value)} <small>${escapeHtml(item.unit)}</small></strong>
          <div class="sector-flow-track"><i style="width:${width}%"></i></div>
          <footer><span>${formatPercent(share)} do volume</span><em>${formatNumber(item.tags || 0)} tags</em></footer>
        </article>
      `;
    }).join("");
  target.innerHTML = rows || `<div class="empty-state">Sem produção no período.</div>`;
}

function renderSelectedSectorYearHistory(config) {
  const target = document.querySelector("#dashboardSectorBars");
  if (!target || !config) return;
  const selectedPeriod = document.querySelector("#dashboardPeriod")?.value || "all";
  const availableYears = calculatedRows(config.id)
    .map((row) => businessDateKey(row.data).slice(0, 4))
    .filter((year) => /^\d{4}$/.test(year));
  const currentYear = String(new Date().getFullYear());
  const year = selectedPeriod !== "all"
    ? selectedPeriod.slice(0, 4)
    : availableYears.includes(currentYear) ? currentYear : availableYears.sort().at(-1) || currentYear;
  const isCurrentYear = year === currentYear;
  const lastMonth = isCurrentYear ? new Date().getMonth() + 1 : 12;
  const rows = calculatedRows(config.id).filter((row) => businessDateKey(row.data).startsWith(`${year}-`));
  const months = Array.from({ length: lastMonth }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const key = `${year}-${month}`;
    const monthRows = rows.filter((row) => businessDateKey(row.data).startsWith(key));
    return {
      key,
      value: monthRows.reduce((sum, row) => sum + getDashboardPrimaryTotal(row, config), 0),
      pieces: monthRows.reduce((sum, row) => sum + getRowPiecesTotal(row, config), 0),
      pricedTags: config.id === "colagem"
        ? monthRows.reduce((sum, row) => sum + numberValue(row.tagsPreco || row.tagsPrecificadas), 0)
        : 0,
      entries: monthRows.length,
    };
  });
  const max = Math.max(...months.map((item) => item.value), 1);
  document.querySelector("#factoryChartLabel").textContent = "Histórico anual do setor";
  document.querySelector("#factoryChartTitle").textContent = config.id === "colagem"
    ? `${config.name} - tags produzidas mês a mês em ${year}`
    : `${config.name} - produção mês a mês em ${year}`;
  target.classList.add("sector-year-history");
  const monthCards = months.map((item, index) => {
    const previous = index ? months[index - 1].value : 0;
    const change = previous ? (item.value - previous) / previous : null;
    const height = item.value ? Math.max(12, (item.value / max) * 210) : 4;
    const unit = dashboardMetricUnit(config);
    const colagemDetail = config.id === "colagem"
      ? `<small class="annual-history-detail">${formatNumber(item.pieces)} peças · ${formatNumber(item.pricedTags)} precificadas</small>`
      : "";
    return `
      <article class="annual-history-month" title="${monthLabel(item.key)}: ${formatNumber(item.value)} ${unit} em ${item.entries} lançamento(s)${config.id === "colagem" ? `; ${formatNumber(item.pieces)} peças; ${formatNumber(item.pricedTags)} tags precificadas` : ""}">
        <strong>${formatNumber(item.value)}</strong>
        <div class="annual-history-plot"><i style="height:${height}px"></i></div>
        <span>${monthLabel(item.key)}</span>
        <small class="${change === null ? "neutral" : change >= 0 ? "positive" : "negative"}">${change === null ? "Base" : `${change >= 0 ? "+" : ""}${formatNumber(change * 100, 1)}%`}</small>
        ${colagemDetail}
      </article>
    `;
  }).join("");
  const minimumWidth = Math.max(760, months.length * 132);
  target.innerHTML = `
    <div class="annual-history-grid" style="grid-template-columns:repeat(${months.length}, minmax(104px, 1fr)); min-width:${minimumWidth}px">
      ${monthCards}
    </div>
  `;
}

function executiveMetricValue(item) {
  if (item.config.id === "preElos" || item.config.id === "ecoatProducao" || item.config.id === "etiquetagem" || item.config.id === "colagem") return item.tags;
  if (item.config.id === "galvanoplastia") return getRowTotal({ [item.config.totalKey]: item.total }, item.config);
  return item.pieces;
}

function executiveMetricUnit(item) {
  if (item.config.id === "preElos" || item.config.id === "ecoatProducao" || item.config.id === "etiquetagem" || item.config.id === "colagem") return "Tags";
  if (item.config.id === "galvanoplastia") return "g";
  return "Pçs";
}

function executiveFlowOrder(metrics) {
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  const byId = new Map(metrics.map((item) => [item.config.id, item]));
  return order.map((id) => byId.get(id)).filter(Boolean);
}

function weekStartKey(value) {
  const key = businessDateKey(value);
  if (!key) return "";
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return localDateKey(date);
}

function weekRangeLabel(startKey) {
  if (!startKey) return "Sem semana";
  const start = new Date(`${startKey}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  const startLabel = start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  const endLabel = end.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  return `${startLabel} a ${endLabel}`;
}

function addDaysKey(startKey, days) {
  const date = new Date(`${startKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function businessWeekDays(startKey) {
  return [0, 1, 2, 3, 4].map((offset) => addDaysKey(startKey, offset)).filter(Boolean);
}

function weekdayLabel(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${weekday} ${day}`;
}

function nextBusinessWeekStart(fromKey = localDateKey()) {
  const currentStart = weekStartKey(fromKey);
  return addDaysKey(currentStart, 7);
}

function isMondayToFriday(startKey, endKey) {
  if (!startKey || !endKey) return false;
  const start = new Date(`${startKey}T12:00:00`);
  const end = new Date(`${endKey}T12:00:00`);
  return start.getDay() === 1 && end.getDay() === 5 && addDaysKey(startKey, 4) === endKey;
}

const OPERATIONAL_FLOW_STAGES = [
  { id: "iq", name: "Separação Produtos" },
  { id: "tratamento", name: "Tratamento de Superfície" },
  { id: "iqProdutos", name: "IQ Produtos" },
  { id: "preElos", name: "Pré-Elos" },
  { id: "galvano", name: "Galvanoplastia" },
  { id: "ecoat", name: "E-coat" },
  { id: "posBanho", name: "Pós-Banho" },
  { id: "etiquetagem", name: "Etiquetagem" },
  { id: "colagem", name: "Colagem" },
];

const OPERATIONAL_MANUAL_FIELDS = [
  { key: "weekProjected", stageId: "colagem", label: "Projetado da semana", hint: "Meta planejada para saída final em tags", frequency: "weekly" },
  { key: "nextWeekForecast", stageId: "colagem", label: "Previsão próxima semana", hint: "Volume previsto para planejar cobertura", frequency: "weekly" },
];

const OPERATIONAL_PROJECTION_FIELD_KEYS = new Set(["weekProjected", "nextWeekForecast"]);
const OPERATIONAL_MANUAL_STAGE_IDS = new Set([]);

const OPERATIONAL_CURRENT_ACCOUNT_STAGE_MAP = {
  iq: "produtosConta",
  tratamento: "tratamentoConta",
  preElos: "preElos",
  posBanho: "posBanhoConta",
  ecoat: "ecoat",
  etiquetagem: "etiquetagemConta",
  colagem: "colagemConta",
};

const CURRENT_ACCOUNT_OPERATIONAL_STAGE_MAP = Object.fromEntries(
  Object.entries(OPERATIONAL_CURRENT_ACCOUNT_STAGE_MAP).map(([stageId, processId]) => [processId, stageId])
);

function operationalStageSource(stageId) {
  return OPERATIONAL_MANUAL_STAGE_IDS.has(stageId) ? "manual" : "auto";
}

function operationalFlowWeeks() {
  const weeks = new Set();
  (state.rows.operationalFlow || []).forEach((row) => row.weekStart && weeks.add(row.weekStart));
  if (!weeks.size) weeks.add(nextBusinessWeekStart());
  return [...weeks].filter(Boolean).sort().reverse();
}

function operationalFlowRecord(weekStart = state.operationalFlowWeek) {
  return (state.rows.operationalFlow || []).find((row) => row.weekStart === weekStart) || {
    weekStart,
    manual: {},
    manualDaily: {},
    planning: {},
  };
}

function operationalFlowDraft(weekStart = state.operationalFlowWeek) {
  if (!weekStart) return { manual: {}, manualDaily: {}, planning: {} };
  if (!state.operationalFlowDraft[weekStart]) {
    state.operationalFlowDraft[weekStart] = { manual: {}, manualDaily: {}, planning: {} };
  }
  return state.operationalFlowDraft[weekStart];
}

function mergeOperationalPlanning(saved = {}, draft = {}) {
  const merged = { ...saved };
  Object.entries(draft || {}).forEach(([stageId, values]) => {
    merged[stageId] = { ...(merged[stageId] || {}), ...(values || {}) };
  });
  return merged;
}

function mergeOperationalDaily(saved = {}, draft = {}) {
  const merged = { ...saved };
  Object.entries(draft || {}).forEach(([fieldKey, days]) => {
    merged[fieldKey] = { ...(merged[fieldKey] || {}), ...(days || {}) };
  });
  return merged;
}

function applyOperationalDraft(record, weekStart = state.operationalFlowWeek) {
  const draft = operationalFlowDraft(weekStart);
  return {
    ...record,
    manual: { ...(record.manual || {}), ...(draft.manual || {}) },
    manualDaily: mergeOperationalDaily(record.manualDaily, draft.manualDaily),
    planning: mergeOperationalPlanning(record.planning, draft.planning),
  };
}

function inputValue(value) {
  return value === undefined || value === null ? "" : String(value);
}

function manualTotalFor(record, fieldKey) {
  const field = OPERATIONAL_MANUAL_FIELDS.find((item) => item.key === fieldKey);
  if (field?.frequency === "weekly") return numberValue(record.manual?.[fieldKey]);
  const daily = record.manualDaily?.[fieldKey] || {};
  const dailyTotal = Object.values(daily).reduce((sum, value) => sum + numberValue(value), 0);
  return dailyTotal || numberValue(record.manual?.[fieldKey]);
}

function weeklyRowsFor(processId, weekStart) {
  return calculatedRows(processId).filter((row) => weekStartKey(row.data) === weekStart);
}

function weeklyFieldTotal(processId, weekStart, preferredKeys) {
  return weeklyRowsFor(processId, weekStart).reduce((sum, row) => {
    const key = preferredKeys.find((candidate) => String(row[candidate] ?? "").trim() !== "");
    return sum + (key ? numberValue(row[key]) : 0);
  }, 0);
}

function weeklyCurrentAccountTotal(processId, weekStart, keys) {
  const rows = weeklyRowsFor(processId, weekStart);
  return {
    rows,
    total: rows.reduce((sum, row) => sum + keys.reduce((rowSum, key) => rowSum + numberValue(row[key]), 0), 0),
  };
}

function operationalCurrentAccountStageTotals(stageId, weekStart, fallbackOpening = 0) {
  const processId = OPERATIONAL_CURRENT_ACCOUNT_STAGE_MAP[stageId];
  const config = processId ? configFor(processId) : null;
  if (!config) return null;
  const weekEnd = addDaysKey(weekStart, 4);
  const rows = currentAccountWeekRows(config, weekEnd);
  const entrada = rows.reduce((sum, row) => sum + numberValue(row.tagsEntrada), 0);
  const saida = rows.reduce((sum, row) => sum + numberValue(row.tagsSaida), 0);
  const previousClosing = currentAccountClosingRows(config.id)
    .filter((row) => row.weekEnd < weekEnd && row.saldoFisico !== "" && row.saldoFisico !== undefined && row.saldoFisico !== null)
    .slice()
    .reverse()[0] || null;
  const hasInitial = (state.rows.currentAccountClosings || []).some((row) => row.processId === config.id && row.kind === "initial");
  const opening = previousClosing
    ? numberValue(previousClosing.saldoFisico)
    : hasInitial
      ? currentAccountOpeningBalance(config)
      : numberValue(fallbackOpening);
  return {
    processId,
    rows,
    opening,
    received: entrada,
    released: saida,
    balance: opening + entrada - saida,
  };
}

function operationalFlowModel(weekStart = state.operationalFlowWeek) {
  const record = applyOperationalDraft(operationalFlowRecord(weekStart), weekStart);
  const manual = {
    ...(record.manual || {}),
    ...Object.fromEntries(OPERATIONAL_MANUAL_FIELDS.map((field) => [field.key, manualTotalFor(record, field.key)])),
  };
  const manualDaily = record.manualDaily || {};
  const planning = record.planning || {};
  const accountStages = Object.fromEntries(OPERATIONAL_FLOW_STAGES.map((stage) => [
    stage.id,
    operationalCurrentAccountStageTotals(stage.id, weekStart, planning[stage.id]?.opening),
  ]));
  const iqAccount = weeklyCurrentAccountTotal("produtosConta", weekStart, ["tagsSaida"]);
  const iqAccountEntries = weeklyCurrentAccountTotal("produtosConta", weekStart, ["tagsEntrada"]);
  const treatmentAccount = weeklyCurrentAccountTotal("tratamentoConta", weekStart, ["tagsSaida"]);
  const posBanhoAccountEtiquetagem = weeklyCurrentAccountTotal("posBanhoConta", weekStart, ["tagsLiberadasEtiquetagem"]);
  const posBanhoAccountEcoat = weeklyCurrentAccountTotal("posBanhoConta", weekStart, ["tagsLiberadasEcoat"]);
  const posBanhoAccountTotal = weeklyCurrentAccountTotal("posBanhoConta", weekStart, ["tagsSaida"]);
  const separacaoReleased = iqAccount.rows.length ? iqAccount.total : 0;
  const iqProductsReleased = weeklyFieldTotal("iqSemiacabado", weekStart, ["qtdTags", "tagsLiberadas", "qtdProduzida"]);
  const treatmentReleased = treatmentAccount.rows.length ? treatmentAccount.total : weeklyFieldTotal("tratamento", weekStart, ["tagsLiberadas"]);
  const galvanoReleased = weeklyFieldTotal("galvanoplastia", weekStart, ["tagsLiberadas"]);
  const postRodio = posBanhoAccountEtiquetagem.rows.length ? posBanhoAccountEtiquetagem.total : weeklyFieldTotal("posBanho", weekStart, ["tagsRodio"]);
  const postQuebec = posBanhoAccountEtiquetagem.rows.length ? 0 : weeklyFieldTotal("posBanho", weekStart, ["tagsQuebec"]);
  const postEcoat = posBanhoAccountEcoat.rows.length ? posBanhoAccountEcoat.total : weeklyFieldTotal("posBanho", weekStart, ["tagsEcoat"]);
  const legacyPostTags = posBanhoAccountTotal.rows.length || postRodio + postQuebec + postEcoat
    ? 0
    : weeklyFieldTotal("posBanho", weekStart, ["qtdTags"]);
  const directTags = postRodio + postQuebec + legacyPostTags;
  const postReleased = directTags + postEcoat;
  const etiquetteReleased = weeklyFieldTotal("etiquetagem", weekStart, ["tagsProduzidas", "qtdTags"]);
  const colagemReleased = weeklyFieldTotal("colagem", weekStart, ["tagsCampinas", "tagsEnviadas", "qtdTags"]);
  const montageReleased = numberValue(manual.montagemTags);
  const foundryReleased = numberValue(manual.fundicaoTags);
  const preElosRows = weeklyRowsFor("preElos", weekStart);
  const preElosToPosBanho = preElosRows.reduce((sum, row) => sum + numberValue(row.tagsParaPosBanho), 0);
  const preElosToEcoat = preElosRows.reduce((sum, row) => sum + numberValue(row.tagsParaEcoat), 0);
  const preElosThirdParty = preElosRows.reduce((sum, row) => sum + numberValue(row.tagsEnviadasTerceiro), 0);
  const preElosThirdReturn = preElosRows.reduce((sum, row) => sum + numberValue(row.tagsRetornoTerceiro), 0);
  const preElosLegacyToPosBanho = preElosRows.length ? 0 : numberValue(manual.preElosPulmaoTags);
  const preElosLegacyThirdParty = preElosRows.length ? 0 : numberValue(manual.preElosServicoExternoTags);
  const preElosReleased = preElosToPosBanho + preElosToEcoat + preElosThirdParty + preElosLegacyToPosBanho + preElosLegacyThirdParty;
  const preElosPosBanhoInput = preElosToPosBanho + preElosLegacyToPosBanho;
  const preElosEcoatInput = preElosToEcoat;
  const ecoatRows = weeklyRowsFor("ecoat", weekStart);
  const ecoatFormEntry = ecoatRows.reduce((sum, row) => sum + numberValue(row.tagsEntrada), 0);
  const ecoatToPosBanho = ecoatRows.reduce((sum, row) => sum + numberValue(row.tagsLiberadasPosBanho || row.tagsLiberadasEtiquetagem), 0);
  const ecoatFormOutput = ecoatRows.reduce((sum, row) => sum + numberValue(row.tagsSaida), 0);
  const ecoatLegacyReleased = ecoatRows.length ? 0 : numberValue(manual.ecoatLiberadasTags);
  const ecoatReceived = ecoatFormEntry || preElosEcoatInput;
  const ecoatReleased = ecoatFormOutput + ecoatLegacyReleased;
  const ecoatPosBanhoInput = ecoatToPosBanho + ecoatLegacyReleased;
  const values = {
    fundicao: { received: numberValue(manual.fundicaoTags), released: foundryReleased },
    iq: accountStages.iq || { received: iqAccountEntries.rows.length ? iqAccountEntries.total : 0, released: separacaoReleased },
    tratamento: accountStages.tratamento || { received: separacaoReleased, released: treatmentReleased },
    iqProdutos: { received: treatmentReleased, released: iqProductsReleased },
    preElos: accountStages.preElos || { received: iqProductsReleased + preElosThirdReturn, released: preElosReleased },
    galvano: { received: 0, released: galvanoReleased },
    posBanho: accountStages.posBanho || { received: galvanoReleased + preElosPosBanhoInput + ecoatPosBanhoInput, released: postReleased },
    ecoat: accountStages.ecoat || { received: ecoatReceived, released: ecoatReleased },
    etiquetagem: accountStages.etiquetagem || { received: directTags, released: etiquetteReleased },
    colagem: accountStages.colagem || { received: etiquetteReleased, released: colagemReleased },
  };
  const stages = OPERATIONAL_FLOW_STAGES.map((stage) => {
    const stagePlanning = planning[stage.id] || {};
    const accountStage = accountStages[stage.id];
    const opening = accountStage ? accountStage.opening : numberValue(stagePlanning.opening);
    const target = numberValue(stagePlanning.target);
    const stageValues = values[stage.id] || { received: 0, released: 0 };
    const received = stageValues.received;
    const released = stageValues.released;
    const balance = accountStage ? accountStage.balance : stage.referenceOnly ? opening : opening + received - released;
    const attainment = stage.referenceOnly ? null : target ? released / target : null;
    return { ...stage, opening, target, received, released, balance, attainment, note: stagePlanning.note || "", accountSynced: Boolean(accountStage) };
  });
  const routedTotal = preElosPosBanhoInput + preElosEcoatInput;
  return {
    record,
    manual,
    manualDaily,
    stages,
    split: {
      rodio: postRodio,
      quebec: postQuebec + legacyPostTags,
      ecoat: preElosEcoatInput,
      ecoatReturn: ecoatPosBanhoInput,
      direct: directTags,
      preElosPosBanho: preElosPosBanhoInput,
      directPct: routedTotal ? preElosPosBanhoInput / routedTotal : 0,
      ecoatPct: routedTotal ? preElosEcoatInput / routedTotal : 0,
    },
  };
}

function operationalStageStatus(stage) {
  if (stage.balance < 0) return "critical";
  if (stage.attainment === null) return "neutral";
  if (stage.attainment >= 1) return "good";
  if (stage.attainment >= 0.85) return "warning";
  return "critical";
}

function operationalProjectedStages(stages) {
  const byId = new Map(stages.map((stage) => [stage.id, stage]));
  const targetFor = (id) => numberValue(byId.get(id)?.target);
  const projectedReceived = {
    fundicao: 0,
    iq: targetFor("fundicao"),
    tratamento: targetFor("iq"),
    preElos: targetFor("tratamento"),
    iqProdutos: targetFor("tratamento"),
    galvano: targetFor("preElos"),
    ecoat: 0,
    posBanho: targetFor("galvano"),
    etiquetagem: targetFor("posBanho") + targetFor("ecoat"),
    colagem: targetFor("etiquetagem"),
  };
  return stages.map((stage) => {
    const received = numberValue(projectedReceived[stage.id]);
    const released = stage.referenceOnly ? 0 : numberValue(stage.target);
    return {
      ...stage,
      received,
      released,
      balance: stage.referenceOnly ? stage.opening : stage.opening + received - released,
      attainment: null,
    };
  });
}

function operationalBoard(stages) {
  const maxReleased = Math.max(1, ...stages.map((stage) => numberValue(stage.released)));
  return `
    <div class="flow-board-track">
      ${stages.map((stage, index) => {
        const source = operationalStageSource(stage.id);
        const fill = Math.min(100, Math.max(4, (numberValue(stage.released) / maxReleased) * 100));
        const status = operationalStageStatus(stage);
        return `
          <article class="flow-board-card ${status} ${source} ${stage.referenceOnly ? "stock" : ""}">
            <div class="flow-stage-top">
              <small>${index + 1}</small>
              <b>${stage.referenceOnly ? "Estoque" : stage.accountSynced ? "Conta corrente" : source === "manual" ? "Manual" : "Automático"}</b>
            </div>
            <h4>${escapeHtml(stage.name)}</h4>
            <div class="flow-stage-meter"><i style="height:${fill}%"></i></div>
            <div class="flow-stage-numbers">
              <span>Entrada <strong>${formatNumber(stage.received)}</strong></span>
              <span>Saída <strong>${formatNumber(stage.released)}</strong></span>
              <span>Saldo <strong>${formatNumber(stage.balance)}</strong></span>
            </div>
            ${stage.target ? `<em>Meta ${formatNumber(stage.target)} · ${formatNumber(Math.min(1, numberValue(stage.attainment || 0)) * 100, 1)}%</em>` : `<em>${stage.referenceOnly ? "Referência de cobertura" : "Sem meta definida"}</em>`}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function operationalBalanceVisual(stages) {
  const maxValue = Math.max(
    1,
    ...stages.flatMap((stage) => [stage.received, stage.released, Math.abs(stage.balance)])
  );
  const highestStock = [...stages].sort((a, b) => b.balance - a.balance)[0];
  const biggestShortage = [...stages].sort((a, b) => a.balance - b.balance)[0];
  const balanced = [...stages]
    .filter((stage) => stage.released > 0 || stage.received > 0)
    .sort((a, b) => Math.abs(a.balance) - Math.abs(b.balance))[0];
  const widthFor = (value) => `${Math.max(3, Math.min(100, (Math.abs(numberValue(value)) / maxValue) * 100))}%`;
  return `
    <section class="flow-balance-head">
      <div>
        <span class="panel-label">Leitura visual dos saldos</span>
        <h3>Entrada x saída x saldo por setor</h3>
        <small>Usa os mesmos dados do fluxo: entrada recebida, saída liberada e saldo final da semana.</small>
      </div>
      <div class="flow-balance-insights">
        <article><span>Maior saldo parado</span><strong>${escapeHtml(highestStock?.name || "--")}</strong><small>${formatNumber(Math.max(0, highestStock?.balance || 0))} tags</small></article>
        <article class="${biggestShortage?.balance < 0 ? "critical" : ""}"><span>Maior falta</span><strong>${escapeHtml(biggestShortage?.balance < 0 ? biggestShortage.name : "--")}</strong><small>${biggestShortage?.balance < 0 ? formatNumber(biggestShortage.balance) : "Sem falta"}</small></article>
        <article><span>Mais equilibrado</span><strong>${escapeHtml(balanced?.name || "--")}</strong><small>Saldo ${formatNumber(balanced?.balance || 0)}</small></article>
      </div>
    </section>
    <div class="flow-balance-grid">
      ${stages.map((stage) => {
        const status = stage.balance < 0 ? "negative" : stage.balance > 0 ? "positive" : "zero";
        return `
          <article class="flow-balance-card ${status}">
            <div class="flow-balance-title">
              <strong>${escapeHtml(stage.name)}</strong>
              <span>${stage.balance < 0 ? "Falta" : stage.balance > 0 ? "Saldo" : "Zerado"}</span>
            </div>
            <div class="flow-balance-bars">
              <label><span>Entrada</span><i><b class="in" style="width:${widthFor(stage.received)}"></b></i><strong>${formatNumber(stage.received)}</strong></label>
              <label><span>Saída</span><i><b class="out" style="width:${widthFor(stage.released)}"></b></i><strong>${formatNumber(stage.released)}</strong></label>
              <label><span>Saldo</span><i><b class="balance" style="width:${widthFor(stage.balance)}"></b></i><strong>${formatNumber(stage.balance)}</strong></label>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function operationalTwoWeekForecast(stages) {
  const forecastStages = stages
    .filter((stage) => !stage.referenceOnly)
    .map((stage) => {
      const weeklyNeed = numberValue(stage.target) || numberValue(stage.released);
      const twoWeekNeed = weeklyNeed * 2;
      const coverageWeeks = weeklyNeed ? numberValue(stage.balance) / weeklyNeed : 0;
      const shortage = twoWeekNeed - numberValue(stage.balance);
      return { ...stage, weeklyNeed, twoWeekNeed, coverageWeeks, shortage };
    })
    .filter((stage) => stage.weeklyNeed > 0);
  const risks = forecastStages.filter((stage) => stage.shortage > 0);
  return `
    <section class="flow-forecast-panel">
      <div>
        <span class="panel-label">Previsibilidade</span>
        <h3>Cobertura estimada para as próximas 2 semanas</h3>
        <small>Compara saldo atual do setor com 2 vezes a meta semanal. Quando não há meta, usa a saída realizada da semana como referência.</small>
      </div>
      <div class="flow-forecast-grid">
        ${forecastStages.map((stage) => {
          const status = stage.shortage <= 0 ? "ok" : stage.coverageWeeks >= 1 ? "warning" : "critical";
          return `
            <article class="${status}">
              <span>${escapeHtml(stage.name)}</span>
              <strong>${stage.shortage <= 0 ? "Cobre 2 semanas" : `Faltam ${formatNumber(stage.shortage)}`}</strong>
              <small>Saldo ${formatNumber(stage.balance)} · necessidade ${formatNumber(stage.twoWeekNeed)} · ${formatNumber(Math.max(0, stage.coverageWeeks), 1)} sem.</small>
            </article>
          `;
        }).join("") || `<article><span>Sem meta</span><strong>Informe metas semanais</strong><small>A previsão depende da meta ou saída realizada.</small></article>`}
      </div>
      <p>${risks.length ? `${risks.length} setor(es) precisam de atenção para sustentar as próximas 2 semanas.` : "Todos os setores com referência possuem saldo suficiente para 2 semanas."}</p>
    </section>
  `;
}

function operationalFlowExecutiveMetrics(model, stages) {
  const finalStage = stages.find((stage) => stage.id === "colagem") || null;
  const projected = numberValue(model.manual.weekProjected) || numberValue(finalStage?.target) || 0;
  const realized = numberValue(finalStage?.released);
  const attainment = projected ? realized / projected : 0;
  const missing = Math.max(0, projected - realized);
  const nextForecast = numberValue(model.manual.nextWeekForecast) || projected || realized;
  const accountableStages = stages.filter((stage) => !stage.referenceOnly);
  const belowTargets = accountableStages
    .filter((stage) => numberValue(stage.target) > 0 && numberValue(stage.released) < numberValue(stage.target))
    .sort((a, b) => (numberValue(a.released) / Math.max(1, numberValue(a.target))) - (numberValue(b.released) / Math.max(1, numberValue(b.target))));
  const largestBalance = [...accountableStages].sort((a, b) => numberValue(b.balance) - numberValue(a.balance))[0] || null;
  const nextGap = Math.max(0, nextForecast - realized);
  return { finalStage, projected, realized, attainment, missing, nextForecast, nextGap, belowTargets, largestBalance };
}

function operationalFlowPerformance(model, stages, metrics) {
  const target = Math.max(1, metrics.projected);
  const realizedPct = Math.min(100, (metrics.realized / target) * 100);
  const below = metrics.belowTargets.slice(0, 6);
  return `
    <article class="flow-progress-card">
      <div>
        <span>Projetado</span>
        <strong>${formatNumber(metrics.projected)}</strong>
        <small>tags planejadas para a semana</small>
      </div>
      <div>
        <span>Realizado</span>
        <strong>${formatNumber(metrics.realized)}</strong>
        <small>saída final da Colagem/Campinas</small>
      </div>
      <div class="flow-progress-track">
        <i style="width:${realizedPct}%"></i>
      </div>
      <p>${formatNumber(metrics.attainment * 100, 1)}% atingido · faltam ${formatNumber(metrics.missing)} tags</p>
    </article>
    <article class="flow-target-card">
      <div>
        <span class="panel-label">Setores abaixo da meta</span>
        <h4>${below.length ? `${below.length} ponto(s) para tratar` : "Sem desvio crítico"}</h4>
      </div>
      <div class="flow-target-bars">
        ${below.length ? below.map((stage) => {
          const pct = numberValue(stage.target) ? numberValue(stage.released) / numberValue(stage.target) : 0;
          return `
            <label>
              <span>${escapeHtml(stage.name)}</span>
              <i><b style="width:${Math.max(3, Math.min(100, pct * 100))}%"></b></i>
              <strong>${formatNumber(pct * 100, 1)}%</strong>
            </label>
          `;
        }).join("") : `<p>Todos os setores com meta registrada estão dentro ou acima do planejado.</p>`}
      </div>
    </article>
  `;
}

function operationalFlowHealth(model, stages, metrics) {
  const critical = metrics.belowTargets.map((stage) => stage.name).join(", ");
  return `
    <article><span>Maior saldo em processo</span><strong>${formatNumber(Math.max(0, metrics.largestBalance?.balance || 0))}</strong><small>${escapeHtml(metrics.largestBalance?.name || "--")}</small></article>
    <article class="${metrics.belowTargets.length ? "flow-alert" : "flow-ok"}"><span>Etapas abaixo da meta</span><strong>${metrics.belowTargets.length}</strong><small>${critical || "Nenhuma etapa sinalizada"}</small></article>
    <article><span>Rota E-coat</span><strong>${formatNumber(model.split.ecoatPct * 100, 1)}%</strong><small>Pré-Elos destinado ao E-coat</small></article>
    <article><span>Previsão próxima</span><strong>${formatNumber(metrics.nextForecast)}</strong><small>${metrics.nextGap ? `${formatNumber(metrics.nextGap)} acima do realizado` : "base atual suficiente"}</small></article>
  `;
}

function operationalFlowForecast(model, metrics) {
  return `
    <article><span>Realizado atual</span><strong>${formatNumber(metrics.realized)}</strong><small>Base: Colagem/Campinas</small></article>
    <article><span>Base sugerida</span><strong>${formatNumber(metrics.projected || metrics.realized)}</strong><small>Use como referência para a semana</small></article>
    <article><span>Previsão próxima semana</span><strong>${formatNumber(metrics.nextForecast)}</strong><small>Campo editável abaixo</small></article>
    <article class="${metrics.nextGap ? "flow-alert" : "flow-ok"}"><span>Gap projetado</span><strong>${formatNumber(metrics.nextGap)}</strong><small>previsão menos realizado atual</small></article>
  `;
}

function operationalFlowProjectionInputs(model, metrics) {
  return `
    <label>
      <span>Projetado da semana atual</span>
      <input type="number" min="0" step="1" data-flow-manual-week="weekProjected" value="${metrics.projected || ""}" placeholder="0" />
    </label>
    <label>
      <span>Previsão próxima semana</span>
      <input type="number" min="0" step="1" data-flow-manual-week="nextWeekForecast" value="${metrics.nextForecast || ""}" placeholder="0" />
    </label>
  `;
}

function renderOperationalFlow() {
  const weekSelect = document.querySelector("#operationalFlowWeek");
  if (!weekSelect) return;
  const weeks = operationalFlowWeeks();
  if (!weeks.includes(state.operationalFlowWeek)) state.operationalFlowWeek = weeks[0];
  weekSelect.innerHTML = weeks.map((week) => `<option value="${week}">${weekRangeLabel(week)}</option>`).join("");
  weekSelect.value = state.operationalFlowWeek;
  const model = operationalFlowModel();
  const flowStages = model.stages;
  const productionStages = flowStages.filter((stage) => !stage.referenceOnly);
  const metrics = operationalFlowExecutiveMetrics(model, flowStages);
  const weekDays = businessWeekDays(state.operationalFlowWeek);
  document.querySelector("#operationalFlowSummary").innerHTML = `
    <article><span>Projetado da semana</span><strong>${formatNumber(metrics.projected)}</strong><small>meta definida para saída final</small></article>
    <article><span>Realizado</span><strong>${formatNumber(metrics.realized)}</strong><small>tags enviadas pela Colagem/Campinas</small></article>
    <article class="${metrics.attainment >= 1 ? "flow-ok" : "flow-alert"}"><span>Atingimento</span><strong>${formatNumber(metrics.attainment * 100, 1)}%</strong><small>realizado dividido pelo projetado</small></article>
    <article class="${metrics.missing > 0 ? "flow-alert" : "flow-ok"}"><span>Falta para meta</span><strong>${formatNumber(metrics.missing)}</strong><small>tags para fechar 100%</small></article>
  `;
  document.querySelector("#operationalFlowPerformance").innerHTML = operationalFlowPerformance(model, productionStages, metrics);
  document.querySelector("#operationalFlowBoard").innerHTML = operationalBoard(flowStages);
  document.querySelector("#operationalFlowHealth").innerHTML = operationalFlowHealth(model, productionStages, metrics);
  document.querySelector("#operationalFlowForecast").innerHTML = operationalFlowForecast(model, metrics);
  document.querySelector("#operationalFlowProjection").innerHTML = operationalFlowProjectionInputs(model, metrics);
  document.querySelector("#operationalFlowSources").innerHTML = `
    <span><i class="manual"></i>Manual</span>
    <span><i class="manual daily"></i>Conta corrente</span>
    <span><i class="auto"></i>Automático</span>
  `;
  document.querySelector("#operationalFlowManual").innerHTML = flowStages
    .map((stage) => {
      const source = operationalStageSource(stage.id);
      const fields = OPERATIONAL_MANUAL_FIELDS.filter((field) => field.stageId === stage.id && !OPERATIONAL_PROJECTION_FIELD_KEYS.has(field.key));
      const syncedSummary = stage.accountSynced ? `
        <div class="flow-synced-summary">
          <article><span>Entrada</span><strong>${formatNumber(stage.received)}</strong></article>
          <article><span>Saída</span><strong>${formatNumber(stage.released)}</strong></article>
          <article><span>Saldo</span><strong>${formatNumber(stage.balance)}</strong></article>
        </div>
      ` : "";
      const openingField = stage.accountSynced ? "" : `
        <label>
          <span>Saldo inicial</span>
          <input type="number" min="0" step="1" data-flow-opening="${stage.id}" value="${inputValue((model.record.planning || {})[stage.id]?.opening ?? stage.opening)}" placeholder="0" />
        </label>
      `;
      const targetField = stage.referenceOnly ? "" : `
        <label>
          <span>Meta da semana</span>
          <input type="number" min="0" step="1" data-flow-target="${stage.id}" value="${inputValue((model.record.planning || {})[stage.id]?.target ?? stage.target)}" placeholder="0" />
        </label>
      `;
      return `
        <article class="flow-manual-card ${operationalStageStatus(stage)} ${stage.referenceOnly ? "reference" : source}">
          <div class="flow-manual-card-head">
            <div>
              <strong>${escapeHtml(stage.name)}</strong>
              <small>${stage.referenceOnly ? "Estoque referência" : stage.accountSynced ? "Sincronizado com Conta Corrente" : source === "manual" ? "Setor manual" : "Setor automático"}</small>
            </div>
            <span>Saldo final: ${formatNumber(stage.balance)}</span>
          </div>
          ${syncedSummary}
          ${openingField}
          ${targetField}
          ${source === "manual"
            ? fields.map((field) => field.frequency === "weekly" ? `
              <label class="flow-manual-input weekly">
                <span>${escapeHtml(field.label)}</span>
                <input type="number" min="0" step="1" data-flow-manual-week="${field.key}" value="${inputValue(model.record.manual?.[field.key] ?? model.manual[field.key])}" placeholder="0" />
                <small>${escapeHtml(field.hint)}</small>
              </label>
            ` : `
              <div class="flow-manual-input daily">
                <div>
                  <span>${escapeHtml(field.label)}</span>
                  <strong>Total ${formatNumber(numberValue(model.manual[field.key]))}</strong>
                </div>
                <div class="flow-daily-grid">
                  ${weekDays.map((dayKey) => `
                    <label>
                      <span>${escapeHtml(weekdayLabel(dayKey))}</span>
                      <input type="number" min="0" step="1" data-flow-manual-day="${field.key}" data-flow-day="${dayKey}" value="${inputValue(model.manualDaily?.[field.key]?.[dayKey])}" placeholder="0" />
                    </label>
                  `).join("")}
                </div>
                <small>${escapeHtml(field.hint)}</small>
              </div>
            `).join("")
            : `<div class="flow-auto-output"><span>Produção realizada</span><strong>${formatNumber(stage.released)}</strong><small>${stage.accountSynced ? "Calculada pela conta corrente do setor" : "Calculada automaticamente pelos formulários diários"}</small></div>`}
        </article>
      `;
    }).join("");
  document.querySelector("#operationalFlowPlanning").innerHTML = `
    <div class="flow-plan-row flow-plan-header"><span>Etapa</span><span>Saldo inicial</span><span>Meta semanal</span><span>Realizado</span><span>Saldo final</span><span>Observação / decisão</span></div>
    ${model.stages.map((stage) => `
      <div class="flow-plan-row ${operationalStageStatus(stage)}">
        <strong>${escapeHtml(stage.name)}</strong>
        <span>${formatNumber(stage.opening)}</span>
        <span>${stage.referenceOnly ? "Referência" : formatNumber(stage.target)}</span>
        <span>${stage.referenceOnly ? "Não compõe fluxo" : `${formatNumber(stage.released)}${stage.attainment === null ? "" : ` · ${formatNumber(stage.attainment * 100, 1)}%`}`}</span>
        <span>${formatNumber(stage.balance)}</span>
        <input type="text" data-flow-note="${stage.id}" value="${escapeHtml(inputValue((model.record.planning || {})[stage.id]?.note ?? stage.note))}" placeholder="Motivo do desvio ou decisão da semana" />
      </div>
    `).join("")}
  `;
}

function storeOperationalFlowDraftInput(input) {
  const weekStart = state.operationalFlowWeek;
  if (!weekStart || !input) return;
  const draft = operationalFlowDraft(weekStart);
  if (input.dataset.flowManualWeek) {
    draft.manual[input.dataset.flowManualWeek] = input.value;
    return;
  }
  if (input.dataset.flowManualDay) {
    const fieldKey = input.dataset.flowManualDay;
    const dayKey = input.dataset.flowDay;
    if (!fieldKey || !dayKey) return;
    if (!draft.manualDaily[fieldKey]) draft.manualDaily[fieldKey] = {};
    draft.manualDaily[fieldKey][dayKey] = input.value;
    return;
  }
  if (input.dataset.flowOpening) {
    const stageId = input.dataset.flowOpening;
    if (!draft.planning[stageId]) draft.planning[stageId] = {};
    draft.planning[stageId].opening = input.value;
    return;
  }
  if (input.dataset.flowTarget) {
    const stageId = input.dataset.flowTarget;
    if (!draft.planning[stageId]) draft.planning[stageId] = {};
    draft.planning[stageId].target = input.value;
    return;
  }
  if (input.dataset.flowNote) {
    const stageId = input.dataset.flowNote;
    if (!draft.planning[stageId]) draft.planning[stageId] = {};
    draft.planning[stageId].note = input.value;
  }
}

async function saveOperationalFlow() {
  const weekStart = state.operationalFlowWeek;
  if (!weekStart) return;
  const previous = operationalFlowRecord(weekStart);
  const manual = {};
  const manualDaily = {};
  document.querySelectorAll("[data-flow-manual-week]").forEach((input) => {
    manual[input.dataset.flowManualWeek] = numberValue(input.value);
  });
  document.querySelectorAll("[data-flow-manual-day]").forEach((input) => {
    const fieldKey = input.dataset.flowManualDay;
    const dayKey = input.dataset.flowDay;
    if (!fieldKey || !dayKey) return;
    if (!manualDaily[fieldKey]) manualDaily[fieldKey] = {};
    manualDaily[fieldKey][dayKey] = numberValue(input.value);
  });
  OPERATIONAL_MANUAL_FIELDS.forEach((field) => {
    if (field.frequency === "daily") {
      manual[field.key] = Object.values(manualDaily[field.key] || {}).reduce((sum, value) => sum + numberValue(value), 0);
    } else if (!(field.key in manual)) {
      manual[field.key] = numberValue(previous.manual?.[field.key]);
    }
  });
  const planning = {};
  OPERATIONAL_FLOW_STAGES.forEach((stage) => {
    planning[stage.id] = {
      opening: numberValue(document.querySelector(`[data-flow-opening="${stage.id}"]`)?.value),
      target: numberValue(document.querySelector(`[data-flow-target="${stage.id}"]`)?.value),
      note: document.querySelector(`[data-flow-note="${stage.id}"]`)?.value.trim() || "",
    };
  });
  const actor = currentActorStamp();
  const record = {
    ...previous,
    id: previous.id || crypto.randomUUID(),
    weekStart,
    manual,
    manualDaily,
    planning,
    updatedAt: new Date().toISOString(),
    updatedByProfileId: actor.profileId,
    updatedByName: actor.name,
  };
  const index = (state.rows.operationalFlow || []).findIndex((row) => row.weekStart === weekStart);
  state.rows.operationalFlow = index >= 0
    ? state.rows.operationalFlow.map((row, rowIndex) => rowIndex === index ? record : row)
    : [...(state.rows.operationalFlow || []), { ...record, createdAt: record.updatedAt }];
  delete state.operationalFlowDraft[weekStart];
  saveRows("operationalFlow", state.rows.operationalFlow);
  const message = document.querySelector("#operationalFlowMessage");
  try {
    await persistOperationalRecord(PROCESS_CONFIGS.operationalFlow, record);
    if (message) message.textContent = `Semana ${weekRangeLabel(weekStart)} salva e sincronizada.`;
  } catch (error) {
    if (message) message.textContent = "Semana salva neste dispositivo, mas ainda não sincronizada com o Supabase.";
  }
  renderOperationalFlow();
}

function setOperationalWeekCreatorDefaults() {
  const startInput = document.querySelector("#operationalWeekStart");
  const endInput = document.querySelector("#operationalWeekEnd");
  const defaultStart = nextBusinessWeekStart();
  if (startInput) startInput.value = defaultStart;
  if (endInput) endInput.value = addDaysKey(defaultStart, 4);
}

function createOperationalWeek() {
  const startInput = document.querySelector("#operationalWeekStart");
  const endInput = document.querySelector("#operationalWeekEnd");
  const message = document.querySelector("#operationalFlowMessage");
  const startKey = startInput?.value || "";
  const endKey = endInput?.value || "";
  if (!isMondayToFriday(startKey, endKey)) {
    if (message) message.textContent = "Escolha uma semana completa: início na segunda-feira e fim na sexta-feira.";
    return;
  }
  const actor = currentActorStamp();
  const existing = (state.rows.operationalFlow || []).some((row) => row.weekStart === startKey);
  if (!existing) {
    const createdAt = new Date().toISOString();
    state.rows.operationalFlow = [...(state.rows.operationalFlow || []), {
      id: crypto.randomUUID(),
      weekStart: startKey,
      weekEnd: endKey,
      manual: {},
      manualDaily: {},
      planning: {},
      status: "open",
      createdAt,
      updatedAt: createdAt,
      updatedByProfileId: actor.profileId,
      updatedByName: actor.name,
    }];
    saveRows("operationalFlow", state.rows.operationalFlow);
  }
  state.operationalFlowWeek = startKey;
  document.querySelector("#operationalWeekCreator").hidden = true;
  if (message) message.textContent = existing
    ? `Semana ${weekRangeLabel(startKey)} já existia e foi aberta.`
    : `Semana ${weekRangeLabel(startKey)} criada. Lance os saldos iniciais e a produção manual diária.`;
  renderOperationalFlow();
}

function weeklyFlowItems() {
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const sector = document.querySelector("#dashboardSector")?.value || "all";
  return order.filter((id) => sector === "all" || id === sector).map((id) => {
    const config = configFor(id);
    const rows = calculatedRows(config.id).filter((row) => period === "all" || businessDateKey(row.data).startsWith(period));
    return { config, rows };
  });
}

function renderExecutiveWeekOptions(items) {
  const select = document.querySelector("#executiveWeekFilter");
  if (!select) return "";
  const weeks = uniqueSorted(items.flatMap((item) => item.rows.map((row) => weekStartKey(row.data)))).sort().reverse();
  const currentWeek = weekStartKey(localDateKey());
  const selected = weeks.includes(state.executiveWeek)
    ? state.executiveWeek
    : weeks.includes(currentWeek) ? currentWeek : weeks[0] || "";
  state.executiveWeek = selected;
  select.innerHTML = weeks.length
    ? weeks.map((week) => `<option value="${week}">${weekRangeLabel(week)}</option>`).join("")
    : `<option value="">Sem dados semanais</option>`;
  select.value = selected;
  return selected;
}

function weeklyTagMetric(item, selectedWeek) {
  const rows = item.rows.filter((row) => weekStartKey(row.data) === selectedWeek);
  const recordedTags = rows.reduce((sum, row) => sum + getDashboardTagTotal(row, item.config), 0);
  return {
    ...item,
    rows,
    actualTags: true,
    mixedTags: false,
    sourceValue: recordedTags,
    recordedTags,
    legacyPieces: 0,
    factor: 1,
    tags: recordedTags,
  };
}

function renderTagConversionControls() {
  const target = document.querySelector("#tagConversionControls");
  if (!target) return;
  target.innerHTML = `<span>Sem conversão automática: esta visão usa somente Qtd. Tags registrada; na Colagem usa Tags Expedidas.</span>`;
}

function renderExecutiveWeeklyTagFlow() {
  const target = document.querySelector("#executiveFlowChart");
  if (!target) return;
  const items = weeklyFlowItems();
  const selectedWeek = renderExecutiveWeekOptions(items);
  const metrics = items.map((item) => weeklyTagMetric(item, selectedWeek));
  target.innerHTML = selectedWeek ? metrics.map((item, index) => {
    const previous = metrics[index - 1];
    const balance = previous ? item.tags - previous.tags : 0;
    const balanceLabel = previous
      ? `${balance >= 0 ? "+" : ""}${formatNumber(balance)} versus etapa anterior`
      : "Entrada da semana";
    const sourceLabel = item.config.id === "colagem" ? "Tags Expedidas" : "Qtd. Tags registrada";
    const measurementLabel = "Real";
    return `
      <article class="weekly-tag-node ${item.actualTags ? "actual" : "estimated"}" title="${escapeHtml(item.config.name)}: ${formatNumber(item.tags)} tags">
        <div class="weekly-tag-node-head">
          <i>${index + 1}</i>
          <span>${measurementLabel}</span>
        </div>
        <h4>${escapeHtml(item.config.name)}</h4>
        <strong>${formatNumber(item.tags)} <small>tags</small></strong>
        <p>${sourceLabel}</p>
        <em class="${balance < 0 ? "negative" : balance > 0 ? "positive" : "neutral"}">${balanceLabel}</em>
      </article>
    `;
  }).join("") : `<div class="empty-state">Sem dados para formar o fluxo semanal.</div>`;
  renderTagConversionControls();
}

function rowsInDashboardPeriod(config, period) {
  return calculatedRows(config.id).filter((row) => {
    const month = businessDateKey(row.data).slice(0, 7);
    if (!month) return false;
    return period === "all" || month === period;
  });
}

function colagemExecutiveTags(period) {
  const colagemRows = rowsInDashboardPeriod(configFor("colagem"), period);
  return colagemRows.reduce((sum, row) => sum + getRowCampinasTags(row), 0);
}

function colagemExecutivePieces(period) {
  return rowsInDashboardPeriod(configFor("colagem"), period)
    .reduce((sum, row) => sum + getRowPiecesTotal(row, configFor("colagem")), 0);
}

function executiveMonthlyTagMetrics() {
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const sector = document.querySelector("#dashboardSector")?.value || "all";
  const availabilityStart = "2026-06";
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  if (period !== "all" && period < availabilityStart) return [];
  return order.filter((id) => sector === "all" || id === sector).map((id) => {
    const config = configFor(id);
    const rows = calculatedRows(id).filter((row) => {
      const month = businessDateKey(row.data).slice(0, 7);
      if (!month || month < availabilityStart) return false;
      return period === "all" || month === period;
    });
    const tags = rows.reduce((sum, row) => sum + getDashboardTagTotal(row, config), 0);
    const pieces = config.id === "colagem"
      ? colagemExecutivePieces(period)
      : rows.reduce((sum, row) => sum + getRowPiecesTotal(row, config), 0);
    return {
      config,
      rows,
      tags,
      pieces,
    };
  });
}

function executiveAnnualYear() {
  const selectedPeriod = document.querySelector("#dashboardPeriod")?.value || "all";
  if (selectedPeriod !== "all") return selectedPeriod.slice(0, 4);
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  const years = order
    .flatMap((id) => calculatedRows(id).map((row) => businessDateKey(row.data).slice(0, 4)))
    .filter((year) => /^\d{4}$/.test(year))
    .sort();
  const currentYear = String(new Date().getFullYear());
  return years.includes(currentYear) ? currentYear : years.at(-1) || currentYear;
}

function executiveAnnualProductionRows(year) {
  const selectedSector = document.querySelector("#dashboardSector")?.value || "all";
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  return order
    .filter((id) => selectedSector === "all" || id === selectedSector)
    .map((id) => {
      const config = configFor(id);
      const rows = calculatedRows(id).filter((row) => businessDateKey(row.data).startsWith(`${year}-`));
      const visual = factoryVisualMetric(buildSectorMetric(config, rows));
      const recordedTags = rows.reduce((sum, row) => sum + getDashboardTagTotal(row, config), 0);
      const campinasTags = config.id === "colagem"
        ? rows.reduce((sum, row) => sum + getRowCampinasTags(row), 0)
        : null;
      const tagTotal = recordedTags || rows.length ? recordedTags : null;
      const months = dashboardYearMonths(`${year}-01`).map(({ key }) => {
        const monthRows = rows.filter((row) => businessDateKey(row.data).startsWith(key));
        const metric = factoryVisualMetric(buildSectorMetric(config, monthRows));
        const value = metric?.value || 0;
        const monthRecordedTags = monthRows.reduce((sum, row) => sum + getDashboardTagTotal(row, config), 0);
        return {
          key,
          value,
          tags: monthRecordedTags || monthRows.length ? monthRecordedTags : null,
          entries: monthRows.length,
        };
      });
      const activeMonths = months.filter((item) => item.entries || item.value);
      const bestMonth = [...months].sort((a, b) => b.value - a.value)[0];
      return {
        ...visual,
        rows,
        months,
        activeMonths,
        bestMonth,
        tagTotal,
        campinasTags,
        nativeTagSector: true,
        average: activeMonths.length ? visual.value / activeMonths.length : 0,
        averageTags: activeMonths.length && tagTotal !== null ? tagTotal / activeMonths.length : null,
      };
    })
    .filter(Boolean);
}

function renderExecutiveAnnualProduction() {
  const target = document.querySelector("#executiveAnnualProduction");
  if (!target) return;
  const year = executiveAnnualYear();
  const title = document.querySelector("#executiveAnnualTitle");
  const rows = executiveAnnualProductionRows(year);
  const maxByUnit = rows.reduce((map, item) => {
    map.set(item.unit, Math.max(map.get(item.unit) || 0, item.value));
    return map;
  }, new Map());
  if (title) title.textContent = `Consolidado de ${year}`;
  target.innerHTML = rows.length ? rows.map((item) => {
    const max = maxByUnit.get(item.unit) || 1;
    const width = item.value ? Math.max(4, (item.value / max) * 100) : 0;
    const lastMonth = item.months.filter((month) => month.entries || month.value).at(-1);
    const tagLabel = item.tagTotal === null ? "Sem tags registradas" : "Tags registradas";
    const monthMax = Math.max(...item.months.map((month) => month.value), 1);
    const monthlyBars = item.months.map((month) => {
      const monthWidth = month.value ? Math.max(5, (month.value / monthMax) * 100) : 0;
      const active = month.entries || month.value;
      const titleText = `${monthLabel(month.key)}: ${formatNumber(month.value)} ${item.unit}${month.tags !== null && month.tags !== undefined ? ` | ${formatNumber(month.tags)} tags` : ""}`;
      return `<i class="${active ? "active" : ""}" title="${escapeHtml(titleText)}" style="height:${monthWidth}%"></i>`;
    }).join("");
    return `
      <article class="executive-annual-card">
        <div class="executive-annual-card-head">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.unit)}</span>
        </div>
        <div class="executive-annual-total">${formatNumber(item.value)}</div>
        <div class="executive-annual-tags ${item.tagTotal === null ? "empty" : ""}">
          <strong>${item.tagTotal === null ? "--" : formatNumber(item.tagTotal)}</strong>
          <span>${escapeHtml(tagLabel)}</span>
        </div>
        <div class="executive-annual-track"><i style="width:${width}%"></i></div>
        <div class="executive-annual-months" aria-label="Histórico mensal de ${escapeHtml(item.label)}">${monthlyBars}</div>
        <dl>
          <div><dt>Melhor mês</dt><dd>${item.bestMonth?.value ? `${monthLabel(item.bestMonth.key)} · ${formatNumber(item.bestMonth.value)}` : "--"}</dd></div>
          <div><dt>Último mês</dt><dd>${lastMonth ? `${monthLabel(lastMonth.key)} · ${formatNumber(lastMonth.value)}` : "--"}</dd></div>
        </dl>
      </article>
    `;
  }).join("") : `<div class="empty-state">Sem produção anual para o filtro selecionado.</div>`;
}

function renderExecutiveSummary(metrics, totalTags) {
  const metricTarget = document.querySelector("#executiveMetricsBars");
  if (!metricTarget) return;

  const periodValue = document.querySelector("#dashboardPeriod")?.value || "all";
  const selectedSector = document.querySelector("#dashboardSector")?.value || "all";
  const metricRows = executiveMonthlyTagMetrics();
  const maxMetric = Math.max(...metricRows.map((item) => item.tags), 1);
  const lacksTagHistory = periodValue !== "all" && periodValue < "2026-06";
  const hasTagData = metricRows.some((item) => item.tags > 0);
  metricTarget.classList.toggle("executive-tags-empty", lacksTagHistory || !hasTagData);

  if (lacksTagHistory) {
    metricTarget.innerHTML = `
      <div class="tag-data-message">
        <strong>Histórico de tags ainda não disponível</strong>
        <span>O registro padronizado de tags por setor começou em junho de 2026. Selecione junho ou um mês posterior.</span>
      </div>
    `;
  } else if (!hasTagData) {
    metricTarget.innerHTML = `
      <div class="tag-data-message">
        <strong>Sem tags registradas neste período</strong>
        <span>Os valores aparecerão aqui assim que os lançamentos do mês forem sincronizados.</span>
      </div>
    `;
  } else {
    metricTarget.innerHTML = metricRows.filter((item) => item.tags > 0 || item.rows.length).map((item) => {
      const value = item.tags;
      const height = value ? Math.max(8, (value / maxMetric) * 100) : 2;
      const share = metricRows.reduce((sum, metric) => sum + metric.tags, 0)
        ? (value / metricRows.reduce((sum, metric) => sum + metric.tags, 0)) * 100
        : 0;
      return `
        <div class="bar" title="${item.config.name}: ${formatNumber(value)} tags · ${formatNumber(share, 1)}% do volume">
          <div class="bar-value">${formatNumber(value)}</div>
          <div class="bar-fill" style="--h:${height}%"></div>
          <div class="bar-label">${escapeHtml(item.config.name)}</div>
        </div>
      `;
    }).join("");
  }

  const selectedMetric = selectedSector === "all" ? metricRows.find((item) => item.config.id === "colagem") : metricRows[0];
  const periodKey = factoryDashboardPeriod(periodValue);
  const finalPeriod = periodValue === "all" ? "all" : periodKey;
  const processTagsTotal = metricRows.reduce((sum, item) => sum + numberValue(item.tags), 0);
  const finalColagemTags = selectedSector === "all" ? colagemExecutiveTags(finalPeriod) : selectedMetric?.tags || 0;
  const finalPieces = selectedSector === "all" ? colagemExecutivePieces(finalPeriod) : selectedMetric?.pieces || 0;
  const displayedTags = selectedSector === "all" ? processTagsTotal : selectedMetric?.tags || 0;
  const piecesCard = document.querySelector("#executiveTotalPieces")?.closest("article");
  const tagsCard = document.querySelector("#executiveTotalTags")?.closest("article");
  const hint = document.querySelector("#executiveSummaryHint");
  if (piecesCard) {
    piecesCard.querySelector("span").textContent = selectedSector === "all" ? "Peças finalizadas" : "Peças registradas";
    piecesCard.querySelector("small").textContent = selectedSector === "all" ? "Peças registradas na Colagem" : `Peças registradas em ${selectedMetric?.config.name || "setor"}`;
  }
  if (tagsCard) {
    tagsCard.querySelector("span").textContent = selectedSector === "all" ? "Produção em tags" : "Tags registradas";
    tagsCard.querySelector("small").textContent = selectedSector === "all" ? "Soma dos setores no período" : `Tags registradas em ${selectedMetric?.config.name || "setor"}`;
  }
  if (hint) {
    hint.textContent = selectedSector === "all"
      ? "Produção em tags mostra a soma dos setores. Produção real e meta mensal usam Colagem/Campinas."
      : "Leitura individual do setor selecionado no período.";
  }
  const tagGoal = Math.round(state.executiveTagGoal || 85000);
  const hit = tagGoal ? Math.min(finalColagemTags / tagGoal, 1) : 0;
  const missingPercent = Math.max(0, 1 - hit);
  const remaining = Math.max(0, Math.round(tagGoal - finalColagemTags));
  setText("#executiveTotalPieces", formatNumber(finalPieces));
  setText("#executiveTotalTags", formatNumber(displayedTags));
  const goalInput = document.querySelector("#executiveTagGoalInput");
  if (goalInput) goalInput.value = String(Math.round(tagGoal));
  const progress = document.querySelector("#executiveTagGoalProgress");
  if (progress) {
    progress.style.width = `${Math.min(hit * 100, 100)}%`;
    progress.style.setProperty("--w", `${Math.min(hit * 100, 100)}%`);
  }
  const period = selectedDashboardPeriod();
  const titlePeriod = period && period !== "all" ? monthLabel(period).toUpperCase() : "PERÍODO GERAL";
  setText("#executiveSummaryTitle", "Dashboard de Produção");
  setText("#executiveSummaryHint", selectedSector === "all"
    ? `${titlePeriod} · Gestão à vista da fábrica - modelo executivo`
    : `${titlePeriod} · ${selectedMetric?.config.name || "Setor"} - modelo executivo`);
  setText("#executiveMetricsTitle", selectedSector === "all"
    ? periodValue === "all" ? "Volume de tags por setor desde junho de 2026" : `Volume de tags por setor · ${monthLabel(periodValue)}`
    : `Volume de tags · ${selectedMetric?.config.name || "setor"}`);
  setText("#executiveGoalDelivered", formatNumber(finalColagemTags));
  setText("#executiveTagGoalHit", `${formatNumber(hit * 100, 2)}%`);
  setText("#executiveTagGoalMissingPercent", `${formatNumber(missingPercent * 100, 2)}%`);
  setText("#executiveTagGoalRemaining", formatNumber(remaining));
  renderExecutiveAnnualProduction();
  renderExecutivePeriodComparison();
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function dashboardRowsForProcess(processId, period = document.querySelector("#dashboardPeriod")?.value || "all") {
  const config = configFor(processId);
  if (!config) return [];
  return calculatedRows(processId).filter((row) => {
    const month = businessDateKey(row.data).slice(0, 7);
    if (!month) return false;
    return period === "all" || month === period;
  });
}

function factoryBathBreakdown(period = document.querySelector("#dashboardPeriod")?.value || "all") {
  const galvanoRows = dashboardRowsForProcess("galvanoplastia", period);
  const ecoatRows = dashboardRowsForProcess("ecoatProducao", period);
  const items = [
    {
      label: "E-coat",
      value: ecoatRows.reduce((sum, row) => sum + numberValue(row.pesoGramas), 0)
        + galvanoRows.reduce((sum, row) => sum + numberValue(row.cataforetico), 0),
    },
    { label: "Ródio", value: galvanoRows.reduce((sum, row) => sum + numberValue(row.rodio), 0) },
    { label: "Ouro Quebec", value: galvanoRows.reduce((sum, row) => sum + numberValue(row.ouroQuebec), 0) },
    { label: "Acessórios", value: galvanoRows.reduce((sum, row) => sum + numberValue(row.acessoriosGramas), 0) },
  ];
  return { items, total: items.reduce((sum, item) => sum + item.value, 0) };
}

function factoryRetrabalhoTags(period = document.querySelector("#dashboardPeriod")?.value || "all") {
  const config = configFor("retrabalho");
  if (!config) return 0;
  return dashboardRowsForProcess("retrabalho", period).reduce((sum, row) => sum + getRowTagsTotal(row, config), 0);
}

function factoryAbsenteeismSummary(period = document.querySelector("#dashboardPeriod")?.value || "all") {
  const rows = calculatedRows("absenteismo").filter((row) => {
    const month = businessDateKey(row.data).slice(0, 7);
    return month && (period === "all" || month === period);
  });
  const monthly = absenteeismMonthlyRows().filter((item) => period === "all" || item.monthKey === period);
  const absences = rows.reduce((sum, row) => sum + numberValue(row.ausencias), 0);
  const available = monthly.reduce((sum, item) => sum + numberValue(item.available), 0);
  const meta = average(monthly, (item) => item.meta) || 0.03;
  return { absences, available, meta, rate: available ? absences / available : 0 };
}

function hoursForWorkday(date) {
  const weekday = date.getDay();
  if (weekday >= 1 && weekday <= 4) return 10;
  if (weekday === 5) return 9;
  return 0;
}

function plannedHoursForDashboardPeriod(period = document.querySelector("#dashboardPeriod")?.value || "all") {
  const monthKey = period === "all" ? localDateKey().slice(0, 7) : period;
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return { days: 0, hours: 0 };
  const todayKey = localDateKey();
  const lastDay = monthKey === todayKey.slice(0, 7) ? Number(todayKey.slice(8, 10)) : new Date(year, month, 0).getDate();
  let days = 0;
  let hours = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month - 1, day, 12);
    const dayHours = hoursForWorkday(date);
    if (dayHours) {
      days += 1;
      hours += dayHours;
    }
  }
  return { days, hours };
}

function setFactoryGauge(selector, value) {
  const gauge = document.querySelector(selector);
  if (!gauge) return;
  const score = Math.max(0, Math.min(100, numberValue(value)));
  const angle = -55 + (score / 100) * 110;
  const dial = gauge.querySelector(".dial");
  const danger = dial?.classList.contains("danger");
  if (dial) {
    dial.innerHTML = `
      <svg viewBox="0 0 200 112" aria-hidden="true">
        <path d="M28 90 A72 72 0 0 1 172 90" fill="none" stroke="#dfe9e5" stroke-width="18" stroke-linecap="round"/>
        <path d="M28 90 A72 72 0 0 1 76 22" fill="none" stroke="#b9d7ce" stroke-width="18" stroke-linecap="round"/>
        <path d="M76 22 A72 72 0 0 1 128 22" fill="none" stroke="${danger ? "#d7a126" : "#74c8b7"}" stroke-width="18" stroke-linecap="round"/>
        <path d="M128 22 A72 72 0 0 1 172 90" fill="none" stroke="${danger ? "#c85b55" : "#2f8f74"}" stroke-width="18" stroke-linecap="round"/>
        <line class="needle" x1="100" y1="90" x2="100" y2="38" stroke="#102823" stroke-width="7" stroke-linecap="round" style="transform: rotate(${angle}deg)"/>
        <circle cx="100" cy="90" r="10" fill="#102823"/>
      </svg>
    `;
  }
  const valueElement = gauge.querySelector("strong");
  if (valueElement) valueElement.textContent = `${formatNumber(score, 1)}%`;
}

function factoryOperationalScores(metricRows, finalTags, goal) {
  const activeRows = metricRows.filter((item) => item.rows.length || item.tags > 0);
  const hit = goal ? Math.min((finalTags / goal) * 100, 100) : 0;
  const flow = metricRows.length ? (activeRows.length / metricRows.length) * 100 : 0;
  const quality = activeRows.length
    ? (activeRows.filter((item) => item.tags > 0 || item.pieces > 0 || item.total > 0).length / activeRows.length) * 100
    : 0;
  let risk = 0;
  const flowValues = metricRows.map((item) => ({ label: item.config.name, value: item.tags })).filter((item) => item.value > 0);
  for (let index = 1; index < flowValues.length; index += 1) {
    const previous = flowValues[index - 1].value;
    const current = flowValues[index].value;
    if (previous > 0 && current < previous) risk = Math.max(risk, ((previous - current) / previous) * 100);
  }
  return { hit, flow, quality, risk: Math.min(risk, 100) };
}

function factoryDashboardPeriod(period) {
  return period && period !== "all" ? period : localDateKey().slice(0, 7);
}

function periodDelta(current, previous) {
  if (!previous) return { text: "--", className: "neutral" };
  const delta = (current - previous) / previous;
  return {
    text: `${delta >= 0 ? "+" : ""}${formatNumber(delta * 100, 1)}%`,
    className: delta >= 0 ? "up" : "down",
  };
}

function applyDelta(selector, delta) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = delta.text;
  element.classList.remove("up", "down", "neutral");
  element.classList.add(delta.className);
}

function dashboardProductionRowsForPeriod(period, sector = document.querySelector("#dashboardSector")?.value || "all") {
  const order = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  return order
    .filter((id) => sector === "all" || id === sector)
    .map((id) => {
      const config = configFor(id);
      if (!config) return null;
      const rows = calculatedRows(id).filter((row) => businessDateKey(row.data).startsWith(period));
      const tags = rows.reduce((sum, row) => sum + getDashboardTagTotal(row, config), 0);
      const pieces = config.id === "colagem"
        ? colagemExecutivePieces(period)
        : rows.reduce((sum, row) => sum + getRowPiecesTotal(row, config), 0);
      return { config, rows, tags, pieces };
    })
    .filter(Boolean);
}

function currentAccountDashboardRows() {
  if (!Array.isArray(CURRENT_ACCOUNT_PROCESS_IDS)) return [];
  return CURRENT_ACCOUNT_PROCESS_IDS
    .map((id) => configFor(id))
    .filter(Boolean)
    .map((config) => {
      const totals = currentAccountTotals(config);
      return {
        label: currentAccountLabel(config),
        value: totals.saldo,
      };
    });
}

function dashboardLaunchAlerts() {
  const today = localDateKey();
  const watchedIds = ["separacaoProdutos", "tratamento", "iqSemiacabado", "galvanoplastia", "ecoatProducao", "posBanho", "etiquetagem", "colagem"];
  const pendingToday = watchedIds.filter((id) => {
    const rows = calculatedRows(id);
    return !rows.some((row) => businessDateKey(row.data) === today);
  }).length;
  const invalidRows = watchedIds.reduce((sum, id) => {
    const config = configFor(id);
    if (!config) return sum;
    return sum + calculatedRows(id).filter((row) => {
      const date = businessDateKey(row.data);
      return date && date.startsWith(factoryDashboardPeriod(document.querySelector("#dashboardPeriod")?.value || "all"))
        && !getDashboardTagTotal(row, config)
        && !getRowPiecesTotal(row, config);
    }).length;
  }, 0);
  const lowStock = currentAccountDashboardRows().filter((item) => item.value > 0 && item.value < 5000).length;
  return { pendingToday, invalidRows, lowStock };
}

function renderFactoryOperationDashboard(metricRows, finalColagemTags) {
  if (!document.querySelector(".factory-tv-dashboard")) return;
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const periodKey = factoryDashboardPeriod(period);
  const periodForTotals = period === "all" ? "all" : periodKey;
  const previousPeriod = previousMonth(periodKey);
  const goal = Math.max(1, Math.round(state.executiveTagGoal || 85000));
  const deliveredTags = colagemExecutiveTags(periodForTotals);
  const processTagsTotal = metricRows.reduce((sum, item) => sum + numberValue(item.tags), 0);
  const bath = factoryBathBreakdown(period);
  const previousBath = factoryBathBreakdown(previousPeriod);
  const retrabalho = factoryRetrabalhoTags(period);
  const absence = factoryAbsenteeismSummary(period);
  const hours = plannedHoursForDashboardPeriod(period);
  const extraHours = Math.max(0, numberValue(state.factoryDashboardHours?.extraHours));
  const extraPeople = String(state.factoryDashboardHours?.people || "").trim();
  const scores = factoryOperationalScores(metricRows, deliveredTags, goal);
  const bathMax = Math.max(...bath.items.map((item) => item.value), 1);
  const previousRows = dashboardProductionRowsForPeriod(previousPeriod);
  const previousProcessTags = previousRows.reduce((sum, item) => sum + numberValue(item.tags), 0);
  const previousPieces = colagemExecutivePieces(previousPeriod);
  const currentPieces = colagemExecutivePieces(periodForTotals);
  const reworkShare = deliveredTags ? (retrabalho / deliveredTags) * 100 : 0;
  const absenceStatus = absence.rate <= absence.meta ? "abaixo" : "acima";
  const hasProductionData = productionRowsHaveData(metricRows) || deliveredTags > 0 || currentPieces > 0 || bath.total > 0;

  setText("#factoryTvUpdatedAt", `Atualizado hoje, ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
  setText("#factoryTvBathWeight", `${formatNumber(bath.total, 0)} g`);
  setText("#factoryTvRework", formatNumber(retrabalho));
  setText("#factoryTvAbsence", `${formatNumber(absence.rate * 100, 1)}%`);
  setText("#factoryTvAbsenceStatus", absenceStatus);
  setText("#factoryTvGoalMini", `${formatNumber(scores.hit, 0)}%`);
  setText("#factoryTvProductionReal", formatNumber(deliveredTags));
  setText("#factoryTvMetaTotal", formatNumber(goal));
  setText("#factoryTvGoalLabel", formatNumber(goal));
  setText("#factoryTvReworkShare", `${formatNumber(reworkShare, 1)}%`);
  setText("#factoryTvWorkdays", formatNumber(hours.days));
  setText("#factoryTvPlannedHours", `${formatNumber(hours.hours, 0)}h`);
  setText("#factoryTvExtraHours", `${formatNumber(extraHours, 1)}h`);
  setText("#factoryTvWorkedHours", `${formatNumber(Math.max(0, hours.hours - absence.absences + extraHours), 1)}h`);
  const extraInput = document.querySelector("#factoryTvExtraHoursInput");
  if (extraInput) extraInput.value = extraHours ? String(extraHours) : "";
  const extraPeopleInput = document.querySelector("#factoryTvExtraPeopleInput");
  if (extraPeopleInput) extraPeopleInput.value = parseFactoryExtraPeople(extraPeople).join("; ");
  renderFactoryExtraPeoplePicker();

  applyDelta("#factoryTvTagsDelta", periodDelta(processTagsTotal, previousProcessTags));
  applyDelta("#factoryTvPiecesDelta", periodDelta(currentPieces, previousPieces));
  applyDelta("#factoryTvBathDelta", periodDelta(bath.total, previousBath.total));

  setFactoryGauge("#factoryTvGaugeHit", scores.hit);
  setFactoryGauge("#factoryTvGaugeFlow", scores.flow);
  setFactoryGauge("#factoryTvGaugeQuality", scores.quality);
  setFactoryGauge("#factoryTvGaugeRisk", scores.risk);

  const bathTarget = document.querySelector("#factoryTvBathRows");
  if (bathTarget) {
    bathTarget.innerHTML = bath.items.some((item) => item.value) ? bath.items.map((item) => {
      const width = item.value ? Math.max(2, (item.value / bathMax) * 100) : 1;
      const percent = bath.total ? (item.value / bath.total) * 100 : 0;
      return `
        <div class="bath-row" title="${escapeHtml(item.label)}: ${formatNumber(item.value, 0)} g · ${formatNumber(percent, 1)}% do total banhado">
          <strong>${escapeHtml(item.label)}</strong>
          <div class="bath-track"><div class="bath-fill" style="--w:${width}%"></div></div>
          <span class="bath-total">${formatNumber(item.value, 0)} g</span>
        </div>
      `;
    }).join("") : `<div class="empty-state">Sem volume de banho no período selecionado.</div>`;
  }

  const productionRows = dashboardProductionRowsForPeriod(periodKey);
  const productionMax = Math.max(...productionRows.map((item) => item.tags), 1);
  const monthTarget = document.querySelector("#factoryTvProductionMonthCards");
  if (monthTarget) {
    monthTarget.innerHTML = productionRows.map((item) => {
      const width = item.tags ? Math.max(3, (item.tags / productionMax) * 100) : 1;
      return `
        <div class="production-card" title="${escapeHtml(item.config.name)}: ${formatNumber(item.tags)} tags no mês">
          <strong>${escapeHtml(item.config.name)}</strong>
          <b>${formatNumber(item.tags)}</b>
          <small>registros de processo</small>
          <div class="production-meter"><span style="--w:${width}%"></span></div>
        </div>
      `;
    }).join("") || `<div class="empty-state">Sem produção registrada no mês.</div>`;
  }
  const emptyDashboardTarget = document.querySelector("#factoryTvDataMessage");
  if (emptyDashboardTarget) {
    emptyDashboardTarget.hidden = hasProductionData;
    emptyDashboardTarget.innerHTML = hasProductionData ? "" : `
      <strong>Sem dados produtivos carregados para este recorte.</strong>
      <span>Verifique se os registros do mês existem no Supabase e se a sincronização foi concluída. Dados digitados apenas em cache local não alimentam esta visão após limpar o navegador.</span>
    `;
  }

  const rankTarget = document.querySelector("#factoryTvRankRows");
  if (rankTarget) {
    const ranked = [...productionRows].sort((a, b) => b.tags - a.tags).slice(0, 3);
    rankTarget.innerHTML = ranked.map((item, index) => `
      <div class="rank-card" title="${escapeHtml(item.config.name)}: ${formatNumber(item.tags)} tags">
        <div class="medal">${index + 1}</div>
        <strong>${escapeHtml(item.config.name)}</strong>
        <small>${formatNumber(item.tags)} tags</small>
      </div>
    `).join("") || `<div class="empty-state">Sem ranking para o período.</div>`;
  }

  const stockRows = currentAccountDashboardRows();
  const stockTarget = document.querySelector("#factoryTvStockRows");
  if (stockTarget) {
    const stockMax = Math.max(...stockRows.map((item) => Math.abs(item.value)), 1);
    stockTarget.innerHTML = stockRows.map((item) => {
      const width = item.value ? Math.max(4, (Math.abs(item.value) / stockMax) * 100) : 1;
      return `
        <div class="hbar" title="${escapeHtml(item.label)}: ${formatNumber(item.value)} tags de saldo">
          <strong>${escapeHtml(item.label)}</strong>
          <div class="track"><span style="--w:${width}%"></span></div>
          <b>${formatNumber(item.value)}</b>
        </div>
      `;
    }).join("") || `<div class="empty-state">Sem saldo operacional disponível.</div>`;
  }

  const reworkTarget = document.querySelector("#factoryTvReworkRows");
  if (reworkTarget) {
    reworkTarget.innerHTML = `
      <div class="rework-row" title="Tags registradas no processo Retrabalhos Galvano">
        <div><strong>Retrabalhos Galvano</strong><span>retorno para novo banho ou ajuste</span></div>
        <div class="rework-value">${formatNumber(retrabalho)}</div>
      </div>
      <span class="badge-soft">Participação: ${formatNumber(reworkShare, 1)}% do volume final</span>
    `;
  }

  const alerts = dashboardLaunchAlerts();
  const alertTarget = document.querySelector("#factoryTvAlertRows");
  if (alertTarget) {
    alertTarget.innerHTML = `
      <div class="alert-item warning" title="Vem do monitoramento de lançamentos por setor.">
        <span class="flag"></span>
        <div><strong>Lançamento pendente</strong><span>setores sem input no dia</span></div>
        <b>${formatNumber(alerts.pendingToday)}</b>
      </div>
      <div class="alert-item danger" title="Registros do período sem peça nem tag informada.">
        <span class="flag"></span>
        <div><strong>Dado para validar</strong><span>registros sem volume produtivo</span></div>
        <b>${formatNumber(alerts.invalidRows)}</b>
      </div>
      <div class="alert-item" title="Saldos positivos abaixo de 5.000 tags.">
        <span class="flag"></span>
        <div><strong>Estoque em atenção</strong><span>saldo operacional baixo</span></div>
        <b>${formatNumber(alerts.lowStock)}</b>
      </div>
    `;
  }

  const absenceTarget = document.querySelector("#factoryTvAbsenceBars");
  if (absenceTarget) {
    const monthly = absenteeismMonthlyRows().slice(-6);
    const maxRate = Math.max(...monthly.map((item) => item.rate), 0.03);
    absenceTarget.innerHTML = monthly.map((item) => {
      const height = item.rate ? Math.max(5, (item.rate / maxRate) * 100) : 2;
      return `
        <div class="absence-bar" title="${monthLabel(item.monthKey)}: ${formatNumber(item.rate * 100, 1)}% · ${formatNumber(item.absences)} faltas">
          <div class="meta-line"></div>
          <strong>${formatNumber(item.rate * 100, 1)}%</strong>
          <div class="column" style="--h:${height}%"></div>
          <span>${monthLabel(item.monthKey).slice(0, 3)}</span>
        </div>
      `;
    }).join("") || `<div class="empty-state">Sem absenteísmo registrado.</div>`;
  }
}

function tagTotalForPeriod(config, period) {
  if (!config || !period || period < "2026-06") return 0;
  return calculatedRows(config.id)
    .filter((row) => businessDateKey(row.data).startsWith(period))
    .reduce((sum, row) => sum + getDashboardTagTotal(row, config), 0);
}

function renderExecutivePeriodComparison() {
  const target = document.querySelector("#executivePeriodComparison");
  const title = document.querySelector("#executiveComparisonTitle");
  const description = document.querySelector("#executiveComparisonDescription");
  if (!target || !title || !description) return;
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const sector = document.querySelector("#dashboardSector")?.value || "all";
  const configs = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"]
    .filter((id) => sector === "all" || id === sector)
    .map(configFor)
    .filter(Boolean);

  if (period !== "all" && period < "2026-06") {
    title.textContent = "Comparação indisponível";
    description.textContent = "O histórico padronizado de tags começa em junho de 2026.";
    target.innerHTML = `<div class="tag-data-message compact"><span>Não existem dois períodos comparáveis com tags padronizadas.</span></div>`;
    return;
  }

  const availableMonths = availableDashboardPeriods()
    .map(([key]) => key)
    .filter((key) => key >= "2026-06");
  const selectedMonths = period === "all"
    ? availableMonths.slice(-8)
    : availableMonths.filter((key) => key <= period).slice(-6);
  const rows = selectedMonths.map((key) => ({
    key,
    value: configs.reduce((sum, config) => sum + tagTotalForPeriod(config, key), 0),
  }));
  const max = Math.max(...rows.map((item) => item.value), 1);
  title.textContent = sector === "all" ? "Análise de produção - comparativo mensal" : `Análise mensal · ${configs[0]?.name || "Setor"}`;
  description.textContent = sector === "all"
    ? "Volume de tags dos registros do menu Processo, comparando mês a mês."
    : "Volume de tags do setor selecionado, comparando mês a mês.";
  target.innerHTML = rows.length ? rows.map((item, index) => {
    const previous = index ? rows[index - 1].value : 0;
    const delta = previous ? (item.value - previous) / previous : null;
    const width = item.value ? Math.max(2, (item.value / max) * 100) : 1;
    const deltaClass = delta === null ? "neutral" : delta >= 0 ? "up" : "down";
    const deltaText = delta === null ? "Base" : `${delta >= 0 ? "+" : ""}${formatNumber(delta * 100, 1)}%`;
    return `
      <div class="month-row" title="${monthLabel(item.key)}: ${formatNumber(item.value)} tags">
        <strong>${monthLabel(item.key)}</strong>
        <div class="month-track"><span class="month-fill" style="--w:${width}%"></span></div>
        <span class="month-value">${formatNumber(item.value)}</span>
        <span class="month-delta ${deltaClass}">${deltaText}</span>
      </div>
    `;
  }).join("") : `<div class="tag-data-message compact"><span>Sem períodos disponíveis para comparação.</span></div>`;
}

function renderDashboardMonthlyChart() {
  const months = new Map();
  const sector = document.querySelector("#dashboardSector")?.value || "all";
  const period = document.querySelector("#dashboardPeriod")?.value || "all";
  const config = sector === "all" ? configFor("colagem") : configFor(sector);
  if (!config || config.id === "cadastro") return;
  calculatedRows(config.id).forEach((row) => {
    const key = businessDateKey(row.data).slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) return;
    const value = getDashboardPrimaryTotal(row, config);
    months.set(key, (months.get(key) || 0) + value);
  });
  let entries = [...months.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (period !== "all") {
    const previous = previousMonth(period);
    entries = entries.filter(([key]) => key === period || key === previous);
  }
  const data = entries.map(([key, value]) => ({ key, value }));
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const metricLabel = config.id === "colagem"
    ? "Tags Expedidas"
    : config.id === "etiquetagem"
      ? "Tags produzidas"
      : "Qtd. Tags";
  const unit = dashboardMetricUnit(config);
  const title = document.querySelector("#dashboardEvolutionTitle");
  const description = document.querySelector("#dashboardEvolutionDescription");
  if (title) title.textContent = config.id === "colagem" ? "Evolução mensal - Tags Expedidas" : `Evolução mensal - ${config.name}`;
  if (description) description.textContent = `${metricLabel} (${unit})${sector === "all" ? " · expedição registrada pela Colagem" : ""}`;
  const variations = data.map((item, index) => index && data[index - 1].value
    ? (item.value - data[index - 1].value) / data[index - 1].value
    : null);
  const maxVariation = Math.max(...variations.filter((value) => value !== null).map((value) => Math.abs(value)), 0.01);
  const step = 134;
  const chartWidth = Math.max(data.length * step, 420);
  const linePoints = variations.map((variation, index) => {
    if (variation === null) return null;
    const x = 54 + (index * step);
    const y = 74 - ((variation / maxVariation) * 48);
    return { x, y, variation };
  }).filter(Boolean);
  const polyline = linePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const lineMarkup = linePoints.length ? `
    <svg class="monthly-variation-line" viewBox="0 0 ${chartWidth} 130" preserveAspectRatio="none" aria-label="Variação percentual entre os meses">
      <line class="variation-zero-line" x1="0" y1="74" x2="${chartWidth}" y2="74"></line>
      ${linePoints.length > 1 ? `<polyline points="${polyline}"></polyline>` : ""}
      ${linePoints.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5"></circle><text x="${point.x}" y="${Math.max(point.y - 10, 12)}">${point.variation >= 0 ? "+" : ""}${formatNumber(point.variation * 100, 1)}%</text>`).join("")}
    </svg>` : "";
  const barsMarkup = data.map((item, index) => {
    const height = Math.max(8, (item.value / maxValue) * 190);
    const value = formatNumber(item.value);
    const variation = variations[index];
    const tooltip = `${monthLabel(item.key)}: ${value} ${unit}${variation === null ? "" : ` | ${variation >= 0 ? "+" : ""}${formatNumber(variation * 100, 1)}% vs. mês anterior`}`;
    return `
      <div class="month-bar" title="${tooltip}">
        <div class="month-column" style="height:${height}px"></div>
        <strong>${value} <small>${unit}</small></strong>
        <span>${monthLabel(item.key)}</span>
        <em class="month-change ${variation === null ? "neutral" : variation >= 0 ? "positive" : "negative"}">${variation === null ? "Base" : `${variation >= 0 ? "+" : ""}${formatNumber(variation * 100, 1)}%`}</em>
      </div>
    `;
  }).join("");
  document.querySelector("#dashboardMonthChart").innerHTML = data.length
    ? `<div class="month-chart-stage" style="width:${chartWidth}px">${lineMarkup}<div class="month-chart-bars">${barsMarkup}</div></div>`
    : `<div class="empty-state">Sem dados mensais.</div>`;
}

function renderDashboardSummaryTable(metrics) {
  const rows = [...metrics]
    .sort((a, b) => dashboardPrimaryMetric(b) - dashboardPrimaryMetric(a))
    .map((item) => {
      return `
        <tr>
          <td>${item.config.name}</td>
          <td>${item.rows.length}</td>
          <td>${formatNumber(dashboardPrimaryMetric(item))}</td>
          <td>${dashboardMetricUnit(item.config)}</td>
        </tr>
      `;
    }).join("");
  document.querySelector("#dashboardSummaryTable").innerHTML = rows || `<tr><td class="empty-state" colspan="4">Sem dados no período.</td></tr>`;
}

function renderVisualManagement(metrics) {
  if (!document.querySelector("#factoryBottleneck")) return;
  const period = selectedDashboardPeriod();
  const sortedByProduction = [...metrics].sort((a, b) => dashboardPrimaryMetric(b) - dashboardPrimaryMetric(a));
  const chain = ["separacaoProdutos", "tratamento", "iqSemiacabado", "preElos", "galvanoplastia", "retrabalho", "ecoatProducao", "posBanho", "etiquetagem", "colagem"]
    .map((id) => {
      const config = configFor(id);
      const rows = periodRows(config, period);
      const production = rows.reduce((sum, row) => sum + getDashboardPrimaryTotal(row, config), 0);
      return { config, pieces: production };
    })
    .filter((item) => item.config && item.pieces);
  const bottlenecks = chain.slice(1).map((item, index) => {
    const previous = chain[index];
    const gap = previous ? previous.pieces - item.pieces : 0;
    const ratio = previous?.pieces ? gap / previous.pieces : 0;
    return { ...item, previous, gap, ratio };
  }).filter((item) => item.gap > 0).sort((a, b) => b.ratio - a.ratio);
  const bottleneck = bottlenecks[0];
  document.querySelector("#factoryBottleneck").textContent = bottleneck ? `${bottleneck.config.name} (${formatPercent(bottleneck.ratio)})` : "Sem gargalo";
  document.querySelector("#factoryBottleneckDetail").textContent = bottleneck
    ? `Queda de ${formatNumber(bottleneck.gap)} peças entre ${bottleneck.previous.config.name} e ${bottleneck.config.name}. O setor posterior recebeu menos volume que a etapa anterior.`
    : "Fluxo sem queda relevante no período.";
  document.querySelector("#factoryTopProduction").textContent = sortedByProduction[0]?.config.name || "--";
  document.querySelector("#factoryTopProductionDetail").textContent = sortedByProduction[0]
    ? `${formatNumber(dashboardPrimaryMetric(sortedByProduction[0]))} ${dashboardMetricUnit(sortedByProduction[0].config).toLowerCase()} no período`
    : "--";

  const galvano = configFor("galvanoplastia");
  const galvanoRows = periodRows(galvano, period);
  const galvanoPieces = galvanoRows.reduce((sum, row) => sum + numberValue(row.qtdPeças), 0);
  const galvanoKg = galvanoRows.reduce((sum, row) => sum + numberValue(row.kgTotal), 0);
  document.querySelector("#factoryGalvano").textContent = `${formatNumber(galvanoPieces)} pçs / ${formatNumber(galvanoKg, 1)} kg`;

  const etiqueta = configFor("etiquetagem");
  const etiquetaRows = periodRows(etiqueta, period);
  const etiquetaPieces = etiquetaRows.reduce((sum, row) => sum + numberValue(row.qtdPeças), 0);
  const etiquetaTags = etiquetaRows.reduce((sum, row) => sum + getRowTagsTotal(row, etiqueta), 0);
  document.querySelector("#factoryEtiquetagem").textContent = `${formatNumber(etiquetaPieces)} pçs / ${formatNumber(etiquetaTags)} tags produzidas`;

  const colagem = configFor("colagem");
  const colagemRows = periodRows(colagem, period);
  const colagemPieces = colagemRows.reduce((sum, row) => sum + numberValue(row.qtdPeças), 0);
  const colagemTags = colagemRows.reduce((sum, row) => sum + getRowTagsTotal(row, colagem), 0);
  const colagemCampinas = colagemRows.reduce((sum, row) => sum + getRowCampinasTags(row), 0);
  document.querySelector("#factoryColagem").textContent = `${formatNumber(colagemPieces)} pçs / ${formatNumber(colagemTags)} produção serial/colagem / ${formatNumber(colagemCampinas)} tags expedidas`;
}

function logInput(config, row) {
  const operationalFields = config.fields
    .filter((field) => !isProtectedField(field) && field.key !== "observacoes")
    .map((field) => `${field.label}: ${row[field.key] || 0}`);
  state.inputLogs = window.PHAudit.createEvent({
    type: "lancamento_criado",
    processId: config.id,
    processName: config.name,
    profile: state.masterUnlocked ? "Gestor Master" : "Colaborador",
    summary: operationalFields.join(" | "),
    details: { row },
  });
}

function renderLogFilters() {
  const select = document.querySelector("#logsSectorFilter");
  if (!select) return;
  const current = select.value || "all";
  select.innerHTML = `<option value="all">Todos os setores</option>${implementedConfigs().filter((config) => !config.hidden).map((config) => `<option value="${config.id}">${config.name}</option>`).join("")}`;
  select.value = [...select.options].some((option) => option.value === current) ? current : "all";
}

function renderLogs() {
  renderLogFilters();
  const sector = document.querySelector("#logsSectorFilter")?.value || "all";
  const sourceLogs = state.trustedLogsLoaded ? state.trustedLogs : state.inputLogs;
  const logs = sourceLogs.filter((log) => sector === "all" || log.processId === sector);
  const retentionLabel = document.querySelector("#logsRetentionLabel");
  if (retentionLabel) retentionLabel.textContent = state.trustedLogsLoaded
    ? `Auditoria consolidada | ${formatNumber(sourceLogs.length)} registros`
    : `Auditoria local provisória | ${formatNumber(sourceLogs.length)} registros`;
  document.querySelector("#inputLogsTable").innerHTML = logs.length ? logs.map((log) => `
    <tr>
      <td>${new Date(log.createdAt).toLocaleString("pt-BR")}</td>
      <td><strong>${escapeHtml(log.userName || "Não registrado")}</strong>${log.userEmail ? `<small>${escapeHtml(log.userEmail)}</small>` : ""}</td>
      <td>${escapeHtml(log.processName || "Sistema")}</td>
      <td>${escapeHtml(log.actionLabel || log.type || "Ação")}</td>
      <td>${escapeHtml(log.summary || "")}</td>
    </tr>
  `).join("") : `<tr><td class="empty-state" colspan="5">Nenhum input registrado.</td></tr>`;
}

function auditActionLabel(action) {
  const labels = {
    lancamento_criado: "Criação",
    lancamento_editado: "Edição",
    lancamento_excluido: "Exclusão",
  };
  return labels[action] || String(action || "Ação").replaceAll("_", " ");
}

function auditPayloadSummary(metadata = {}, fallback = "") {
  const row = metadata.after?.payload || metadata.after || {};
  const parts = [
    row.data ? `Data: ${formatBusinessDate(row.data)}` : "",
    row.qtdPeças !== undefined ? `Peças: ${formatNumber(row.qtdPeças)}` : "",
    row.qtdTags !== undefined ? `Tags: ${formatNumber(row.qtdTags)}` : "",
    row.tagsProduzidas !== undefined ? `Tags: ${formatNumber(row.tagsProduzidas)}` : "",
    row.tagsCampinas !== undefined ? `Tags Expedidas: ${formatNumber(row.tagsCampinas)}` : "",
  ].filter(Boolean);
  return parts.join(" | ") || fallback || "Registro operacional";
}

async function refreshTrustedLogs() {
  const button = document.querySelector("#refreshLogsButton");
  if (button) {
    button.disabled = true;
    button.textContent = "Atualizando...";
  }
  try {
    const [trusted, legacy, profiles] = await Promise.all([
      window.PHSupabase.auth.selectStrict(
        window.PHSupabase.tables.accessLogs,
        "?select=id,user_id,sector_id,entry_id,action,summary,metadata,created_at&order=created_at.desc&limit=1000",
        state.authSession
      ),
      window.PHSupabase.select(
        window.PHSupabase.tables.inputLogs,
        "?select=id,process_id,process_name,profile,summary,created_at&order=created_at.desc&limit=1000"
      ),
      window.PHSupabase.auth.selectStrict(
        window.PHSupabase.tables.profiles,
        "?select=id,full_name,email",
        state.authSession
      ),
    ]);
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    const sectorMap = new Map((state.authProfile?.sectors || []).map((sector) => [sector.id, sector]));
    const trustedRows = trusted.map((log) => {
      const profile = profileMap.get(log.user_id) || {};
      const sector = sectorMap.get(log.sector_id) || {};
      return {
        id: log.id,
        processId: sector.code || "sistema",
        processName: sector.name || log.summary || "Sistema",
        userName: profile.full_name || "Usuário não identificado",
        userEmail: profile.email || "",
        type: log.action,
        actionLabel: auditActionLabel(log.action),
        summary: auditPayloadSummary(log.metadata, log.summary),
        createdAt: log.created_at,
        trusted: true,
      };
    });
    const legacyRows = legacy.map((log) => ({
      id: log.id,
      processId: log.process_id,
      processName: log.process_name,
      userName: `${log.profile || "Não identificado"} (legado)`,
      userEmail: "",
      type: String(log.summary || "").match(/^\[([^\]]+)\]/)?.[1] || "acao_legada",
      actionLabel: auditActionLabel(String(log.summary || "").match(/^\[([^\]]+)\]/)?.[1]),
      summary: String(log.summary || "").replace(/^\[[^\]]+\]\s*/, ""),
      createdAt: log.created_at,
      trusted: false,
    }));
    state.trustedLogs = [...trustedRows, ...legacyRows]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    state.trustedLogsLoaded = true;
  } catch (error) {
    state.trustedLogsLoaded = false;
    const label = document.querySelector("#logsRetentionLabel");
    if (label) label.textContent = error.message || "Não foi possível carregar a auditoria consolidada.";
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Atualizar logs";
    }
    renderLogs();
  }
}

async function loadAccessManagementData() {
  if (!state.authSession?.access_token) {
    throw new Error("Sua sessão de acesso expirou. Entre novamente como Master para atualizar os dados.");
  }
  let [profiles, roles, sectors, accessRows] = await Promise.all([
    window.PHSupabase.auth.select(window.PHSupabase.tables.profiles, "?select=*&order=created_at.desc", state.authSession),
    window.PHSupabase.auth.select(window.PHSupabase.tables.roles, "?select=*&order=name.asc", state.authSession),
    window.PHSupabase.auth.select(window.PHSupabase.tables.sectors, "?select=*&order=sort_order.asc", state.authSession),
    window.PHSupabase.auth.select(window.PHSupabase.tables.userSectorAccess, "?select=*", state.authSession),
  ]);
  sectors = await ensureAccessSectorCatalog(sectors);
  sectors = sectors.filter((sector) => !INTERNAL_ACCESS_SECTOR_CODES.has(sector.code));
  accessRows = await ensureCurrentAdminSectorAccess(sectors, accessRows);
  state.accessUsers = profiles;
  state.accessRoles = roles;
  state.accessSectors = sectors;
  state.accessRows = accessRows;
  if (!state.selectedAccessUserId || !profiles.some((user) => user.id === state.selectedAccessUserId)) {
    state.selectedAccessUserId = profiles[0]?.id || "";
  }
}

function accessDataReady() {
  return Boolean(state.accessRoles.length && state.accessSectors.length);
}

function roleName(roleId) {
  return state.accessRoles.find((role) => role.id === roleId)?.name || "--";
}

function roleCode(roleId) {
  return state.accessRoles.find((role) => role.id === roleId)?.code || "";
}

function normalizeAccessLogin(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^[._-]+|[._-]+$/g, "");
}

function accessEmailFromLogin(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (text.includes("@")) return text;
  const normalized = normalizeAccessLogin(text);
  return normalized ? `${normalized}@controle-operacional-veri.com.br` : "";
}

function accessSectorChanged(current, seed) {
  if (!current) return true;
  return current.name !== seed.name
    || current.group_name !== seed.group_name
    || Number(current.sort_order) !== seed.sort_order
    || current.is_active !== true;
}

async function ensureAccessSectorCatalog(sectors) {
  if (!isSupabaseMasterRole(state.authRoleCode)) return sectors;
  const currentByCode = new Map(sectors.map((sector) => [sector.code, sector]));
  const payloads = ACCESS_SECTOR_SEEDS
    .filter((seed) => accessSectorChanged(currentByCode.get(seed.code), seed))
    .map((seed) => ({ ...seed, is_active: true }));
  if (!payloads.length) return sectors;
  await window.PHSupabase.auth.upsert(
    window.PHSupabase.tables.sectors,
    payloads,
    "code",
    state.authSession
  );
  return window.PHSupabase.auth.select(
    window.PHSupabase.tables.sectors,
    "?select=*&order=sort_order.asc",
    state.authSession
  );
}

async function ensureCurrentAdminSectorAccess(sectors, accessRows) {
  if (!state.authProfile?.id || !isSupabaseMasterRole(state.authRoleCode)) return accessRows;
  const currentBySector = new Map(accessRows
    .filter((row) => row.user_id === state.authProfile.id)
    .map((row) => [row.sector_id, row]));
  const payloads = sectors
    .filter((sector) => {
      const row = currentBySector.get(sector.id);
      return !row || !row.can_view || !row.can_create || !row.can_edit || !row.can_delete || !row.can_export || !row.can_import;
    })
    .map((sector) => ({
      user_id: state.authProfile.id,
      sector_id: sector.id,
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
      can_export: true,
      can_import: true,
    }));
  if (!payloads.length) return accessRows;
  await window.PHSupabase.auth.upsert(
    window.PHSupabase.tables.userSectorAccess,
    payloads,
    "user_id,sector_id",
    state.authSession
  );
  return window.PHSupabase.auth.select(window.PHSupabase.tables.userSectorAccess, "?select=*", state.authSession);
}

function updateAccessEmailPreview() {
  const preview = document.querySelector("#accessEmailPreview");
  const login = document.querySelector("#accessLogin")?.value || "";
  if (preview) preview.textContent = accessEmailFromLogin(login) || "--";
}

function resetAccessUserForm() {
  state.editingAccessUserId = "";
  const form = document.querySelector("#accessUserForm");
  if (!form) return;
  form.reset();
  document.querySelector("#accessAuthUid").disabled = false;
  document.querySelector("#accessTempPassword").disabled = false;
  document.querySelector("#accessUserFormStatus").textContent = "";
  updateAccessEmailPreview();
}

function fillAccessFormOptions() {
  const roleSelect = document.querySelector("#accessRoleSelect");
  const sectorSelect = document.querySelector("#accessMainSectorSelect");
  if (roleSelect) {
    if (state.accessRoles.length) {
      const collaboratorRole = state.accessRoles.find((role) => role.code === "collaborator") || state.accessRoles[0];
      roleSelect.disabled = false;
      roleSelect.innerHTML = state.accessRoles.map((role) => `<option value="${role.id}">${escapeHtml(role.name)}</option>`).join("");
      roleSelect.value = collaboratorRole?.id || "";
    } else {
      roleSelect.disabled = true;
      roleSelect.innerHTML = `<option value="">Perfis não carregados</option>`;
    }
  }
  if (sectorSelect) {
    if (state.accessSectors.length) {
      const productionSectors = state.accessSectors.filter((sector) => sector.group_name !== "Gestão" && sector.is_active);
      const options = productionSectors.length ? productionSectors : state.accessSectors;
      sectorSelect.disabled = false;
      sectorSelect.innerHTML = `<option value="">Sem setor principal</option>${options.map((sector) => `<option value="${sector.id}">${escapeHtml(sector.name)}</option>`).join("")}`;
    } else {
      sectorSelect.disabled = true;
      sectorSelect.innerHTML = `<option value="">Setores não carregados</option>`;
    }
  }
}

async function openAccessUserForm(userId = "") {
  const form = document.querySelector("#accessUserForm");
  if (!form) return;
  if (!accessDataReady()) {
    try {
      await loadAccessManagementData();
    } catch (error) {
      const refreshStatus = document.querySelector("#accessRefreshStatus");
      if (refreshStatus) refreshStatus.textContent = error.message || "Não foi possível carregar os dados de acesso.";
      return;
    }
  }
  fillAccessFormOptions();
  resetAccessUserForm();
  state.editingAccessUserId = userId;
  const title = document.querySelector("#accessUserFormTitle");
  if (title) title.textContent = userId ? "Editar acesso" : "Novo acesso";
  if (userId) {
    const user = state.accessUsers.find((item) => item.id === userId);
    if (user) {
      document.querySelector("#accessFullName").value = user.full_name || "";
      document.querySelector("#accessLogin").value = user.email || "";
      document.querySelector("#accessAuthUid").value = user.id || "";
      document.querySelector("#accessAuthUid").disabled = true;
      document.querySelector("#accessTempPassword").value = "";
      document.querySelector("#accessTempPassword").disabled = true;
      document.querySelector("#accessRoleSelect").value = user.role_id || "";
      document.querySelector("#accessMainSectorSelect").value = user.main_sector_id || "";
      document.querySelector("#accessStatusSelect").value = user.status || "active";
      updateAccessEmailPreview();
    }
  }
  form.hidden = false;
  const status = document.querySelector("#accessUserFormStatus");
  if (status && !accessDataReady()) {
    status.textContent = "Perfis e setores não carregaram. Clique em Atualizar ou entre novamente como Master.";
  }
  document.querySelector("#accessFullName")?.focus();
}

function closeAccessUserForm() {
  const form = document.querySelector("#accessUserForm");
  if (form) form.hidden = true;
  resetAccessUserForm();
  document.querySelector("#accessUsersTable")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderAccessManagement() {
  const usersTarget = document.querySelector("#accessUsersTable");
  const userSelect = document.querySelector("#accessUserSelect");
  const permissionsTarget = document.querySelector("#accessPermissionsTable");
  const groupFilter = document.querySelector("#accessGroupFilter");
  const summaryTarget = document.querySelector("#accessSummaryCards");
  if (!usersTarget || !userSelect || !permissionsTarget) return;
  fillAccessFormOptions();

  const activeUsers = state.accessUsers.filter((user) => user.status === "active").length;
  const visibleAccessSectors = state.accessSectors.filter((sector) => sector.code !== "custosSetores");
  const activeSectors = visibleAccessSectors.filter((sector) => sector.is_active).length;
  const enabledRows = state.accessRows.filter((row) => row.can_view || row.can_create || row.can_edit || row.can_delete || row.can_export || row.can_import).length;
  const createRows = state.accessRows.filter((row) => row.can_create).length;
  if (summaryTarget) {
    summaryTarget.innerHTML = `
      <article>
        <span>Usuários ativos</span>
        <strong>${formatNumber(activeUsers)}</strong>
      </article>
      <article>
        <span>Cards ativos</span>
        <strong>${formatNumber(activeSectors)}</strong>
      </article>
      <article>
        <span>Liberações</span>
        <strong>${formatNumber(enabledRows)}</strong>
      </article>
      <article>
        <span>Acesso a lançamento</span>
        <strong>${formatNumber(createRows)}</strong>
      </article>
    `;
  }

  usersTarget.innerHTML = state.accessUsers.length ? state.accessUsers.map((user) => `
    <tr>
      <td>${escapeHtml(user.full_name || "--")}</td>
      <td>${escapeHtml(user.email || "--")}</td>
      <td>${escapeHtml(roleName(user.role_id))}</td>
      <td><span class="status-pill ${user.status === "active" ? "ok" : "muted"}">${user.status === "active" ? "Ativo" : "Inativo"}</span></td>
      <td>
        <div class="row-actions compact-actions">
          <button class="access-edit-button" type="button" data-access-edit="${user.id}">Editar</button>
          <button class="access-edit-button" type="button" data-access-reset-password="${user.id}">Redefinir senha</button>
        </div>
      </td>
    </tr>
  `).join("") : `<tr><td class="empty-state" colspan="5">Nenhum usuário operacional encontrado.</td></tr>`;

  if (groupFilter) {
    const currentGroup = groupFilter.value || "all";
    const groups = uniqueSorted(visibleAccessSectors.map((sector) => sector.group_name || "Geral"));
    groupFilter.innerHTML = `<option value="all">Todos</option>${groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join("")}`;
    groupFilter.value = groups.includes(currentGroup) ? currentGroup : "all";
  }

  userSelect.innerHTML = state.accessUsers.map((user) => `
    <option value="${user.id}">${escapeHtml(user.full_name || user.email)} - ${escapeHtml(roleName(user.role_id))}</option>
  `).join("");
  userSelect.value = state.selectedAccessUserId;
  renderAccessPermissions();
}

function accessRowFor(userId, sectorId) {
  return state.accessRows.find((row) => row.user_id === userId && row.sector_id === sectorId) || {};
}

function currentAccountAssociationLabel(sectorCode) {
  return CURRENT_ACCOUNT_ACCESS_LABELS[sectorCode] || "";
}

function renderAccessPermissions() {
  const target = document.querySelector("#accessPermissionsTable");
  if (!target) return;
  const userId = state.selectedAccessUserId;
  updateAccessPermissionSaveState();
  if (!userId) {
    target.innerHTML = `<tr><td class="empty-state" colspan="7">Selecione um usuário para configurar.</td></tr>`;
    return;
  }
  const permissionKeys = ["can_view", "can_create", "can_edit", "can_delete", "can_export", "can_import"];
  const selectedGroup = document.querySelector("#accessGroupFilter")?.value || "all";
  const sectors = state.accessSectors
    .filter((sector) => sector.code !== "custosSetores")
    .filter((sector) => selectedGroup === "all" || (sector.group_name || "Geral") === selectedGroup);
  target.innerHTML = sectors.length ? sectors.map((sector) => {
    const access = accessRowFor(userId, sector.id);
    return `
      <tr>
        <td>
          <strong>${escapeHtml(sector.name)}</strong>
          <small>${escapeHtml(sector.group_name || "Geral")}</small>
          ${currentAccountAssociationLabel(sector.code) ? `<small>Conta corrente: ${escapeHtml(currentAccountAssociationLabel(sector.code))}</small>` : ""}
        </td>
        ${permissionKeys.map((key) => `
          <td>
            <input
              class="access-permission-check"
              type="checkbox"
              data-user-id="${userId}"
              data-sector-id="${sector.id}"
              data-permission="${key}"
              ${access[key] ? "checked" : ""}
            />
          </td>
        `).join("")}
      </tr>
    `;
  }).join("") : `<tr><td class="empty-state" colspan="7">Nenhum card/setor encontrado para este filtro.</td></tr>`;
  refreshTableTopScrollbars();
}

function accessPendingKey(userId, sectorId) {
  return `${userId}|${sectorId}`;
}

function upsertLocalAccessRow(next) {
  state.accessRows = state.accessRows
    .filter((row) => !(row.user_id === next.user_id && row.sector_id === next.sector_id))
    .concat(next);
}

function sameAccessPermissions(left = {}, right = {}) {
  return ["can_view", "can_create", "can_edit", "can_delete", "can_export", "can_import"]
    .every((key) => Boolean(left[key]) === Boolean(right[key]));
}

async function reloadAccessRowsFromDatabase() {
  const rows = await window.PHSupabase.auth.select(
    window.PHSupabase.tables.userSectorAccess,
    "?select=*",
    state.authSession
  );
  state.accessRows = Array.isArray(rows) ? rows : [];
  if (state.authProfile?.id) {
    state.authProfile.accessRows = state.accessRows.filter((row) => row.user_id === state.authProfile.id);
  }
  return state.accessRows;
}

function updateAccessPermissionSaveState(message = "") {
  const count = Object.keys(state.pendingAccessRows || {}).length;
  const button = document.querySelector("#saveAccessPermissionsButton");
  const status = document.querySelector("#accessSaveStatus");
  if (button) button.disabled = count === 0;
  if (status) status.textContent = message || (count ? `${count} alteração(ões) pendente(s). Clique em Salvar alterações.` : "");
}

function stageAccessPermission(input) {
  const userId = input.dataset.userId;
  const sectorId = input.dataset.sectorId;
  const permission = input.dataset.permission;
  const existing = accessRowFor(userId, sectorId);
  const next = {
    user_id: userId,
    sector_id: sectorId,
    can_view: Boolean(existing.can_view),
    can_create: Boolean(existing.can_create),
    can_edit: Boolean(existing.can_edit),
    can_delete: Boolean(existing.can_delete),
    can_export: Boolean(existing.can_export),
    can_import: Boolean(existing.can_import),
    [permission]: input.checked,
  };
  upsertLocalAccessRow(next);
  state.pendingAccessRows[accessPendingKey(userId, sectorId)] = next;
  const sector = state.accessSectors.find((item) => item.id === sectorId);
  const shouldEnsureCurrentAccount = input.checked
    && ["can_view", "can_create", "can_edit"].includes(permission)
    && currentAccountAssociationLabel(sector?.code);
  if (shouldEnsureCurrentAccount) {
    const currentAccountSector = state.accessSectors.find((item) => item.code === "currentAccount");
    if (currentAccountSector?.id && currentAccountSector.id !== sectorId) {
      const currentAccountAccess = accessRowFor(userId, currentAccountSector.id);
      const currentAccountPayload = {
        user_id: userId,
        sector_id: currentAccountSector.id,
        can_view: true,
        can_create: true,
        can_edit: Boolean(currentAccountAccess.can_edit || permission === "can_edit"),
        can_delete: Boolean(currentAccountAccess.can_delete),
        can_export: Boolean(currentAccountAccess.can_export),
        can_import: Boolean(currentAccountAccess.can_import),
      };
      upsertLocalAccessRow(currentAccountPayload);
      state.pendingAccessRows[accessPendingKey(userId, currentAccountSector.id)] = currentAccountPayload;
    }
  }
  updateAccessPermissionSaveState();
}

async function savePendingAccessPermissions() {
  const pending = Object.values(state.pendingAccessRows || {});
  if (!pending.length) return;
  const button = document.querySelector("#saveAccessPermissionsButton");
  if (button) button.disabled = true;
  updateAccessPermissionSaveState("Salvando alterações de acesso...");
  try {
    await window.PHSupabase.auth.upsert(
      window.PHSupabase.tables.userSectorAccess,
      pending,
      "user_id,sector_id",
      state.authSession
    );
    const reloadedRows = await reloadAccessRowsFromDatabase();
    const confirmedRows = pending.filter((expected) => {
      const savedRow = reloadedRows.find((row) =>
        row.user_id === expected.user_id && row.sector_id === expected.sector_id
      );
      return savedRow && sameAccessPermissions(savedRow, expected);
    });
    if (confirmedRows.length !== pending.length) {
      throw new Error(`Banco confirmou ${confirmedRows.length} de ${pending.length} alteração(ões). Atualize e confira o perfil antes de liberar o usuário.`);
    }
    state.pendingAccessRows = {};
    const savedAt = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const successMessage = `Permissões confirmadas no banco às ${savedAt}. ${confirmedRows.length} alteração(ões) validada(s). O colaborador deve atualizar a tela ou entrar novamente.`;
    updateAccessPermissionSaveState(successMessage);
    renderAccessManagement();
    updateAccessPermissionSaveState(successMessage);
  } catch (error) {
    updateAccessPermissionSaveState(`Erro ao salvar permissões: ${error.message || error}`);
    if (button) button.disabled = false;
    throw error;
  }
}

async function saveAccessUserProfile(event) {
  event.preventDefault();
  const status = document.querySelector("#accessUserFormStatus");
  const fullName = document.querySelector("#accessFullName").value.trim();
  const login = document.querySelector("#accessLogin").value.trim();
  const authUid = document.querySelector("#accessAuthUid").value.trim();
  const tempPassword = document.querySelector("#accessTempPassword")?.value || "";
  const roleId = document.querySelector("#accessRoleSelect").value;
  const mainSectorId = document.querySelector("#accessMainSectorSelect").value || null;
  const userStatus = document.querySelector("#accessStatusSelect").value || "active";
  const email = accessEmailFromLogin(login);
  if (!accessDataReady()) {
    if (status) status.textContent = "Não foi possível carregar perfis e setores. Clique em Atualizar ou faça login novamente como Master.";
    return;
  }
  if (!fullName || !login || !roleId || !email) {
    if (status) status.textContent = "Preencha nome, login e perfil.";
    return;
  }
  if (!state.editingAccessUserId && !authUid && tempPassword.length < 6) {
    if (status) status.textContent = "Informe uma senha provisória com pelo menos 6 caracteres ou cole um UID já criado.";
    return;
  }

  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Salvando...";
  }
  if (status) status.textContent = "Salvando perfil...";

  try {
    let profileId = state.editingAccessUserId || authUid;
    if (!profileId) {
      if (status) status.textContent = "Criando usuário no Supabase Auth...";
      const created = await window.PHSupabase.auth.createUserWithPassword(email, tempPassword, {
        full_name: fullName,
        role: roleName(roleId),
      });
      profileId = created?.user?.id || created?.id;
      if (!profileId) throw new Error("Usuário criado, mas o Supabase não retornou UID.");
      document.querySelector("#accessAuthUid").value = profileId;
    }

    const payload = {
      id: profileId,
      full_name: fullName,
      email,
      role_id: roleId,
      main_sector_id: mainSectorId,
      status: userStatus,
      must_change_password: true,
      updated_at: new Date().toISOString(),
    };
    const savedProfile = await window.PHSupabase.auth.upsert(
      window.PHSupabase.tables.profiles,
      payload,
      "id",
      state.authSession
    );

    profileId = savedProfile[0]?.id || payload.id;
    const selectedRoleCode = roleCode(roleId);
    const permissionPayloads = [];
    if (["master", "technical_admin"].includes(selectedRoleCode)) {
      state.accessSectors.forEach((sector) => {
        permissionPayloads.push({
          user_id: profileId,
          sector_id: sector.id,
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
          can_export: true,
          can_import: true,
        });
      });
    } else if (mainSectorId) {
      const mainSector = state.accessSectors.find((sector) => sector.id === mainSectorId);
      permissionPayloads.push({
        user_id: profileId,
        sector_id: mainSectorId,
        can_view: true,
        can_create: true,
        can_edit: selectedRoleCode === "area_manager",
        can_delete: false,
        can_export: selectedRoleCode === "area_manager",
        can_import: false,
      });
      if (currentAccountAssociationLabel(mainSector?.code)) {
        const currentAccountSector = state.accessSectors.find((sector) => sector.code === "currentAccount");
        if (currentAccountSector?.id && currentAccountSector.id !== mainSectorId) {
          permissionPayloads.push({
            user_id: profileId,
            sector_id: currentAccountSector.id,
            can_view: true,
            can_create: true,
            can_edit: selectedRoleCode === "area_manager",
            can_delete: false,
            can_export: false,
            can_import: false,
          });
        }
      }
    }

    if (permissionPayloads.length) {
      await window.PHSupabase.auth.upsert(
        window.PHSupabase.tables.userSectorAccess,
        permissionPayloads,
        "user_id,sector_id",
        state.authSession
      );
    }

    state.selectedAccessUserId = profileId;
    await loadAccessManagementData();
    renderAccessManagement();
    closeAccessUserForm();
    document.querySelector("#accessSaveStatus").textContent = "Perfil salvo. Revise as permissões liberadas.";
  } catch (error) {
    if (status) status.textContent = error.message || "Não foi possível salvar o perfil.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Salvar perfil";
    }
  }
}

async function resetAccessUserPassword(userId) {
  const status = document.querySelector("#accessRefreshStatus") || document.querySelector("#accessSaveStatus");
  const user = state.accessUsers.find((item) => item.id === userId);
  if (!user) return;
  if (!isSupabaseMasterRole(state.authRoleCode)) {
    if (status) status.textContent = "Somente Master/Admin autenticado pode redefinir senha de usuário.";
    return;
  }
  const password = prompt(`Nova senha provisória para ${user.full_name || user.email}.\n\nMínimo 6 caracteres. O usuário será obrigado a trocar no próximo acesso.`);
  if (password === null) return;
  if (String(password).length < 6) {
    if (status) status.textContent = "A senha provisória precisa ter pelo menos 6 caracteres.";
    return;
  }
  if (!confirm(`Confirmar redefinição de senha para ${user.full_name || user.email}?`)) return;
  if (status) status.textContent = "Redefinindo senha...";
  try {
    await window.PHSupabase.auth.rpc("ph_admin_reset_user_password", {
      target_user_id: user.id,
      new_password: password,
    }, state.authSession);
    await loadAccessManagementData();
    renderAccessManagement();
    if (status) status.textContent = `Senha provisória redefinida para ${user.full_name || user.email}.`;
  } catch (error) {
    const message = error.message || "Não foi possível redefinir a senha.";
    if (/function .*does not exist|ph_admin_reset_user_password/i.test(message)) {
      if (status) status.textContent = "Função de reset ainda não existe no Supabase. Execute o arquivo supabase-reset-senha-master.sql no SQL Editor.";
      return;
    }
    if (status) status.textContent = message;
  }
}

async function refreshAccessManagement() {
  const button = document.querySelector("#refreshAccessButton");
  const status = document.querySelector("#accessRefreshStatus");
  if (button) {
    button.disabled = true;
    button.textContent = "Atualizando...";
  }
  if (status) status.textContent = "";
  closeAccessUserForm();
  try {
    await loadAccessManagementData();
    renderAccessManagement();
    if (status) status.textContent = "Dados atualizados.";
  } catch (error) {
    renderAccessManagement();
    if (status) status.textContent = error.message || "Não foi possível atualizar os dados.";
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Atualizar dados";
    }
  }
}

function monthlyCloseRows(period) {
  return productionConfigs().map((config) => {
    const rows = periodRows(config, period);
    const production = rows.reduce((sum, row) => sum + getDashboardPrimaryTotal(row, config), 0);
    const cost = rows.reduce((sum, row) => sum + getRowCost(row), 0);
    const people = rows.reduce((sum, row) => sum + getRowPeople(row), 0);
    return {
      period,
      processId: config.id,
      processName: config.name,
      production,
      cost,
      costPerPerson: people ? cost / people : 0,
      costPerPiece: production ? cost / production : 0,
    };
  });
}

function closeSelectedMonth() {
  const period = selectedDashboardPeriod();
  if (!period) return;
  const closedAt = new Date().toISOString();
  const rows = monthlyCloseRows(period).map((row) => ({ ...row, id: crypto.randomUUID(), closedAt }));
  state.monthlyClosings = state.monthlyClosings.filter((row) => row.period !== period).concat(rows);
  saveMonthlyClosings();
  rows.forEach((row) => supabaseUpsert(window.PHSupabase.tables.monthlyClosings, row, "period,process_id")
    .catch((error) => console.warn("Fechamento não sincronizado:", error)));
  state.inputLogs = window.PHAudit.createEvent({
    type: "fechamento_mensal",
    processId: "sistema",
    processName: "Fechamento do Mês",
    profile: state.masterUnlocked ? "Gestor Master" : "Usuário comum",
    summary: `Fechamento realizado para ${monthLabel(period)} com ${rows.length} setores.`,
    details: { period, rows },
  });
  renderMonthlyClose();
}

function renderMonthlyClose() {
  const rows = [...state.monthlyClosings].sort((a, b) => b.period.localeCompare(a.period) || a.processName.localeCompare(b.processName));
  document.querySelector("#monthlyCloseTable").innerHTML = rows.length ? rows.map((row) => `
    <tr>
      <td>${monthLabel(row.period)}</td>
      <td>${row.processName}</td>
      <td>${formatNumber(row.production, row.processId === "galvanoplastia" ? 1 : 0)}</td>
      <td>${formatCurrency(row.cost)}</td>
      <td>${formatCurrency(row.costPerPerson)}</td>
      <td>${formatCurrency(row.costPerPiece)}</td>
      <td>${new Date(row.closedAt).toLocaleString("pt-BR")}</td>
    </tr>
  `).join("") : `<tr><td class="empty-state" colspan="7">Nenhum fechamento realizado.</td></tr>`;
}

function getFormRow() {
  const config = formConfig();
  if (!config) return {};
  const row = {};
  config.fields.forEach((field) => {
    const element = document.querySelector(`#field-${field.key}`);
    if (!element) return;
    row[field.key] = field.type === "number" ? numberValue(element.value) : element.value.trim();
  });
  return row;
}

function setFormStatus(message = "", type = "error") {
  const target = document.querySelector("#formErrorMessage");
  if (!target) return;
  target.textContent = message;
  target.classList.toggle("success", type === "success");
  target.classList.toggle("info", type === "info");
}

function setFormError(message = "") {
  setFormStatus(message, "error");
}

function persistedStatusMessage(prefix = "Salvo") {
  const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return state.authSession?.access_token
    ? `${prefix} no banco às ${time}.`
    : `${prefix} localmente às ${time}.`;
}

function showSystemToast(message, type = "success") {
  if (!message) return;
  let target = document.querySelector("#systemToast");
  if (!target) {
    target = document.createElement("div");
    target.id = "systemToast";
    target.setAttribute("role", "status");
    target.setAttribute("aria-live", "polite");
    document.body.appendChild(target);
  }
  target.textContent = message;
  target.className = `system-toast ${type}`;
  target.hidden = false;
  clearTimeout(window.systemToastTimer);
  window.systemToastTimer = setTimeout(() => {
    const current = document.querySelector("#systemToast");
    if (current) current.hidden = true;
  }, 5200);
}

function requiredLaunchFields(config) {
  return config.fields
    .filter(isLaunchField)
    .filter((field) => isRequiredLaunchInput(config, field))
    .filter((field) => document.querySelector(`#field-${field.key}`));
}

function zeroReviewFieldsFromForm(config) {
  if (!config || config.indicator) return [];
  return config.fields.filter((field) => {
    if (field.type !== "number" || isProtectedField(field) || field.key === "colaboradores") return false;
    const element = document.querySelector(`#field-${field.key}`);
    const raw = String(element?.value ?? "").trim();
    return raw !== "" && numberValue(raw) === 0;
  });
}

function validateFormRow(config) {
  const requiredFields = requiredLaunchFields(config);
  const missing = requiredFields.filter((field) => {
    const element = document.querySelector(`#field-${field.key}`);
    return !String(element?.value || "").trim();
  });
  if (missing.length) {
    setFormError(`Preencha os campos obrigatórios: ${missing.map((field) => field.label).join(", ")}.`);
    missing[0] && document.querySelector(`#field-${missing[0].key}`)?.focus();
    return false;
  }

  const negativeValue = requiredFields.find((field) => {
    if (field.type !== "number") return false;
    return numberValue(document.querySelector(`#field-${field.key}`)?.value) < 0;
  });
  if (negativeValue) {
    setFormError(`${negativeValue.label} não pode ser negativo.`);
    document.querySelector(`#field-${negativeValue.key}`)?.focus();
    return false;
  }

  const collaboratorField = requiredFields.find((field) => field.key === "colaboradores");
  if (collaboratorField && numberValue(document.querySelector("#field-colaboradores")?.value) <= 0) {
    setFormError(`${collaboratorField.label} deve ser maior que zero.`);
    document.querySelector("#field-colaboradores")?.focus();
    return false;
  }

  const zeroFields = zeroReviewFieldsFromForm(config);
  if (zeroFields.length) {
    const observations = document.querySelector("#field-observacoes")?.value.trim() || "";
    if (!observations) {
      setFormError(`Justifique em Observações por que ${zeroFields.map((field) => field.label).join(", ")} ficou com valor zero.`);
      document.querySelector("#field-observacoes")?.focus();
      return false;
    }
  }

  const integerQuantityKeys = new Set([
    "qtdPeças", "qtdProduzida", "qtdAnalisadas", "qtdTags",
    "tagsProduzidas", "tagsPreco", "tagsCampinas", "tagsLiberadas", "tagsRodio", "tagsQuebec", "tagsEcoat", "colaboradores",
    "acessoriosPecas", "qtdApliqueRodio",
  ]);
  const invalidInteger = config.fields.find((field) => {
    if (!integerQuantityKeys.has(field.key)) return false;
    const raw = document.querySelector(`#field-${field.key}`)?.value;
    if (raw === undefined || raw === "") return false;
    return !Number.isInteger(numberValue(raw));
  });
  if (invalidInteger) {
    setFormError(`${invalidInteger.label} aceita somente números inteiros, sem casas decimais.`);
    document.querySelector(`#field-${invalidInteger.key}`)?.focus();
    return false;
  }

  const invalidControlledField = config.fields.find((field) => {
    const options = controlledFieldOptions(config, field);
    if (!options) return false;
    const value = document.querySelector(`#field-${field.key}`)?.value || "";
    return value && !options.includes(value);
  });
  if (invalidControlledField) {
    setFormError(`Selecione ${invalidControlledField.label} utilizando somente a lista cadastrada.`);
    document.querySelector(`#field-${invalidControlledField.key}`)?.focus();
    return false;
  }

  if (config.id === "custosSetores") {
    const setor = document.querySelector("#field-setor")?.value || "";
    const custoMensal = numberValue(document.querySelector("#field-custoMensal")?.value);
    const custoMdoDia = numberValue(document.querySelector("#field-custoMdoDia")?.value);
    const metaDiaria = numberValue(document.querySelector("#field-metaDiaria")?.value);
    const vigenciaInicio = businessDateKey(document.querySelector("#field-vigenciaInicio")?.value);
    const editingId = state.editingRow?.processId === config.id ? state.editingRow.rowId : "";
    if (vigenciaInicio < localDateKey()) {
      setFormError("A vigência não pode começar no passado. Informe hoje ou uma data futura.");
      document.querySelector("#field-vigenciaInicio")?.focus();
      return false;
    }
    if (custoMensal <= 0 && custoMdoDia <= 0 && metaDiaria <= 0) {
      setFormError("Informe ao menos um valor: custo mensal, custo MDO/dia ou meta diária.");
      document.querySelector("#field-custoMensal")?.focus();
      return false;
    }
    const duplicate = (state.rows.custosSetores || []).some((row) =>
      row.id !== editingId
      && normalizedSectorName(canonicalSectorName(row.setor)) === normalizedSectorName(canonicalSectorName(setor))
      && businessDateKey(row.vigenciaInicio) === vigenciaInicio
    );
    if (duplicate) {
      setFormError(`Já existe uma versão de ${setor} com vigência em ${formatDate(vigenciaInicio)}.`);
      document.querySelector("#field-vigenciaInicio")?.focus();
      return false;
    }
  }

  if (config.id === "colaboradores") {
    const nome = document.querySelector("#field-nomeCompleto")?.value || "";
    const editingId = state.editingRow?.processId === config.id ? state.editingRow.rowId : "";
    const duplicate = (state.rows.colaboradores || []).some((row) =>
      row.id !== editingId && normalizedSectorName(row.nomeCompleto) === normalizedSectorName(nome)
    );
    if (duplicate) {
      setFormError(`O colaborador ${nome} já está cadastrado. Edite o cadastro existente.`);
      document.querySelector("#field-nomeCompleto")?.focus();
      return false;
    }
  }

  if (config.id === "absenteismo") {
    const data = businessDateKey(document.querySelector("#field-data")?.value || "");
    const colaborador = document.querySelector("#field-colaborador")?.value || "";
    const tipoAusencia = document.querySelector("#field-tipoAusencia")?.value || "";
    const editingId = state.editingRow?.processId === config.id ? state.editingRow.rowId : "";
    const duplicate = (state.rows.absenteismo || []).some((row) =>
      row.id !== editingId
      && businessDateKey(row.data) === data
      && normalizedSectorName(row.colaborador) === normalizedSectorName(colaborador)
      && normalizedSectorName(row.tipoAusencia) === normalizedSectorName(tipoAusencia)
    );
    if (duplicate) {
      setFormError(`Esta ausência de ${colaborador} em ${formatDate(data)} já foi registrada.`);
      document.querySelector("#field-colaborador")?.focus();
      return false;
    }
  }

  if (config.id === "prestadoresServicos") {
    const competencia = document.querySelector("#field-competencia")?.value || "";
    const prestador = document.querySelector("#field-prestador")?.value || "";
    const servico = document.querySelector("#field-servico")?.value || "";
    const editingId = state.editingRow?.processId === config.id ? state.editingRow.rowId : "";
    const duplicate = (state.rows.prestadoresServicos || []).some((row) =>
      row.id !== editingId
      && row.competencia === competencia
      && normalizedSectorName(row.prestador) === normalizedSectorName(prestador)
      && normalizedSectorName(row.servico) === normalizedSectorName(servico)
    );
    if (duplicate) {
      setFormError(`Já existe um lançamento de ${servico} para ${prestador} em ${monthLabel(competencia)}.`);
      document.querySelector("#field-prestador")?.focus();
      return false;
    }
  }

  if (config.id === "terceirosGalvano") {
    const data = businessDateKey(document.querySelector("#field-data")?.value || "");
    const tipoServico = normalizeTerceirosGalvanoService(document.querySelector("#field-tipoServico")?.value || "");
    const dataPrevista = terceirosGalvanoExpectedReturn(data, tipoServico, document.querySelector("#field-dataPrevista")?.value || "");
    const dataRetorno = businessDateKey(document.querySelector("#field-dataRetorno")?.value || "");
    const observacoes = String(document.querySelector("#field-observacoes")?.value || "").trim();
    if (terceirosGalvanoStatus(dataPrevista, dataRetorno) === "Atrasado" && !observacoes) {
      setFormError("Serviço externo em atraso precisa de justificativa no campo Observações.");
      document.querySelector("#field-observacoes")?.focus();
      return false;
    }
  }

  const allowsMultipleDailyMovements = config.currentAccountLedger || CURRENT_ACCOUNT_PROCESS_IDS.includes(config.id);
  if (!config.indicator && !config.operationalOnly && !allowsMultipleDailyMovements) {
    const dateValue = businessDateKey(document.querySelector("#field-data")?.value || "");
    const editingId = state.editingRow?.processId === config.id ? state.editingRow.rowId : "";
    const duplicate = (state.rows[config.id] || []).some((row) => row.id !== editingId && businessDateKey(row.data) === dateValue);
    if (duplicate) {
      setFormError(`Já existe um lançamento para ${formatDate(dateValue)} em ${config.name}. Edite o registro existente ou escolha outra data.`);
      document.querySelector("#field-data")?.focus();
      return false;
    }
  }

  setFormError("");
  return true;
}

function updatePreview() {
  const config = formConfig();
  if (!config) return;
  const calculated = config.calculate(getFormRow());
  const total = numberValue(calculated[config.totalKey]);
  document.querySelector("#previewTotal").textContent = formatNumber(total);
  document.querySelector("#previewPerPerson").textContent = formatNumber(calculated.produçãoColaborador, 1);
}

function clearForm() {
  const config = formConfig();
  if (!config) return;
  state.suppressFormPreserveOnce = true;
  if (config.indicator) {
    state.editingRow = null;
    renderForm(config);
    updatePreview();
    return;
  }
  state.editingRow = null;
  state.editReturnProcessId = "";
  renderForm(config);
  updatePreview();
}

function resetCurrentAccountFormAfterSave(savedDate = "") {
  const config = currentAccountSelectedConfig();
  if (!config) return;
  state.editingRow = null;
  state.editReturnProcessId = "";
  state.launchProcessId = config.id;
  state.suppressFormPreserveOnce = true;
  renderForm(config);
  const dateField = document.querySelector("#field-data");
  if (dateField && savedDate) dateField.value = businessDateKey(savedDate);
  updatePreview();
  setFormError("");
}

function cancelForm() {
  const config = formConfig();
  if (!config) return;
  state.editingRow = null;
  state.launchProcessId = null;
  state.editReturnProcessId = "";
  if (state.activeProcessId === "currentAccount") {
    state.launchProcessId = state.currentAccountProcessId;
    renderCurrentAccount();
    return;
  }
  setActiveProcess(config.id);
}

function syncSelectedCollaboratorSector() {
  const collaboratorField = document.querySelector("#field-colaborador");
  const sectorField = document.querySelector("#field-setor");
  if (!collaboratorField || !sectorField) return;
  const selectedName = collaboratorField.value;
  const collaborator = (state.rows.colaboradores || []).find((row) =>
    (row.status || "Ativo") === "Ativo" && row.nomeCompleto === selectedName
  );
  const sector = canonicalSectorName(collaborator?.setor);
  if (sector && [...sectorField.options].some((option) => option.value === sector)) {
    sectorField.value = sector;
  }
}

async function saveFormRow(row) {
  const config = formConfig();
  if (!config) return false;
  if (!canWriteCentralData(config)) {
    setFormError("Entre com usuário autenticado antes de salvar. Gravação local não é válida para produção.");
    return false;
  }
  if (CURRENT_ACCOUNT_PROCESS_IDS.includes(config.id) && !canWriteCurrentAccountConfig(config)) {
    setFormError("Seu perfil pode visualizar esta conta corrente, mas não tem permissão para lançar movimentos.");
    return false;
  }
  if (!validateFormRow(config)) return false;
  const zeroFields = zeroReviewFieldsFromForm(config);
  if (zeroFields.length && state.masterUnlocked) {
    const confirmed = confirm(`Confirmar lançamento com valor zero em: ${zeroFields.map((field) => field.label).join(", ")}?\n\nA justificativa ficará registrada como validada pelo Master.`);
    if (!confirmed) {
      setFormError("Lançamento não salvo. Revise os valores ou a justificativa.");
      return false;
    }
  }
  if (config.id === "custosSetores") {
    delete row.competencia;
    delete row.data;
    row.setor = canonicalSectorName(row.setor);
    row.processId = processIdForPolicySector(row.setor);
    const previousPolicy = row.processId ? sectorPolicyFor(row.processId, row.vigenciaInicio) : null;
    row.custoMensal = numberValue(row.custoMensal) || numberValue(previousPolicy?.custoMensal);
    row.custoMdoDia = numberValue(row.custoMdoDia) || numberValue(previousPolicy?.custoMdoDia);
    row.metaDiaria = numberValue(row.metaDiaria) || numberValue(previousPolicy?.metaDiaria);
  }
  const originalEditingRow = state.editingRow?.processId === config.id
    ? state.rows[config.id].find((item) => item.id === state.editingRow.rowId)
    : null;
  const historicalCostVersion = config.id === "custosSetores"
    && originalEditingRow
    && businessDateKey(originalEditingRow.vigenciaInicio) < localDateKey();
  const editing = Boolean(originalEditingRow && !historicalCostVersion);
  const actor = currentActorStamp();
  const now = new Date().toISOString();
  const validation = zeroFields.length
    ? state.masterUnlocked
      ? {
          validationStatus: "approved",
          validationReason: row.observacoes || "",
          validationZeroFields: zeroFields.map((field) => ({ key: field.key, label: field.label })),
          validatedAt: now,
          validatedByProfileId: actor.profileId,
          validatedByName: actor.name,
        }
      : {
          validationStatus: "pending",
          validationReason: row.observacoes || "",
          validationZeroFields: zeroFields.map((field) => ({ key: field.key, label: field.label })),
          validationRequestedAt: now,
          validationRequestedByProfileId: actor.profileId,
          validationRequestedByName: actor.name,
        }
    : { validationStatus: "approved" };
  const previousRows = state.rows[config.id].slice();
  let savedRow;
  if (editing) {
    state.rows[config.id] = state.rows[config.id].map((item) => {
      if (item.id !== state.editingRow.rowId) return item;
      savedRow = {
        ...item,
        ...row,
        ...validation,
        updatedAt: now,
        updatedByProfileId: actor.profileId,
        updatedByName: actor.name,
        updatedByEmail: actor.email,
        updatedByRole: actor.role,
      };
      return savedRow;
    });
  } else {
    savedRow = {
      id: crypto.randomUUID(),
      ...row,
      ...validation,
      createdAt: now,
      createdByProfileId: actor.profileId,
      createdByName: actor.name,
      createdByEmail: actor.email,
      createdByRole: actor.role,
    };
    state.rows[config.id].push(savedRow);
  }
  if (config.id === "custosSetores") {
    savedRow = normalizeSectorCostBase([savedRow])[0];
    state.rows[config.id] = state.rows[config.id].map((item) => item.id === savedRow.id ? savedRow : item);
  }
  try {
    if (trustedProductionConfig(config)) {
      setFormError("Confirmando lançamento no banco...");
      await persistTrustedProductionEntry(config, savedRow);
      markRowAsSynced(config, savedRow, "trusted_production_entries");
    } else if (config.currentAccountLedger || config.operationalOnly || config.indicator) {
      setFormError("Sincronizando movimento na base...");
      await persistOperationalRecordStrict(config, savedRow);
      markRowAsSynced(config, savedRow, "legacy_operational_records");
    } else if (shouldPersistOperationalRecordStrictly(config)) {
      setFormError("Confirmando registro no banco...");
      await persistOperationalRecordStrict(config, savedRow);
      markRowAsSynced(config, savedRow, "legacy_operational_records");
    } else {
      persistOperationalRecord(config, savedRow).catch((error) => {
        console.warn("Espelho legado não sincronizado:", error);
      });
    }
  } catch (error) {
    state.rows[config.id] = previousRows;
    saveRows(config.id, state.rows[config.id]);
    invalidateProcessCache(config.id);
    setFormError(error.message || "Movimento não sincronizado. Atualize a tela e tente novamente.");
    return false;
  }
  saveRows(config.id, state.rows[config.id]);
  invalidateProcessCache(config.id);
  if (!editing) {
    logInput(config, savedRow);
  } else {
    state.inputLogs = window.PHAudit.createEvent({
      type: "lancamento_editado",
      processId: config.id,
      processName: config.name,
      profile: state.masterUnlocked ? "Gestor Master" : "Colaborador",
      summary: `Registro atualizado em ${config.name}: ${row.nomeCompleto || row.colaborador || row.data || "sem identificador"}.`,
      details: { row: savedRow },
    });
  }
  if (state.masterUnlocked) renderSidebarAlerts();
  const successMessage = persistedStatusMessage(editing ? "Atualizado" : "Salvo");
  state.editingRow = null;
  state.launchFormOpen = false;
  state.currentAccountFormOpen = false;
  const returnProcessId = state.editReturnProcessId;
  state.editReturnProcessId = "";
  const inlineMasterForm = state.masterUnlocked && state.activeProcessId === config.id && state.launchProcessId === config.id;
  const currentAccountForm = state.activeProcessId === "currentAccount";
  if (currentAccountForm) {
    state.currentAccountProcessId = config.id;
    renderCurrentAccount();
  } else if (!inlineMasterForm) {
    renderLaunch();
  }
  setFormStatus(successMessage, state.authSession?.access_token ? "success" : "info");
  showSystemToast(successMessage, state.authSession?.access_token ? "success" : "info");
  setSyncStatus("ok", state.authSession?.access_token ? "Registro sincronizado" : "Registro salvo localmente");
  if (returnProcessId) {
    state.launchProcessId = null;
    setActiveProcess(returnProcessId);
    return;
  }
  if (config.indicator) {
    state.launchProcessId = null;
    setActiveProcess(config.id);
    return;
  }
  if (state.activeProcessId === config.id) renderProcess();
  if (state.activeProcessId === "dashboard") renderDashboard();
  renderOperationalDependents();
  return true;
}
function editCollaborator(rowId) {
  openIndicatorForm("colaboradores", rowId);
}

function editProcessRow(processId, rowId) {
  const config = configFor(processId);
  if (!config) return;
  if (config.indicator) {
    openIndicatorForm(processId, rowId);
    return;
  }
  const row = state.rows[config.id].find((item) => item.id === rowId);
  if (!canEditRow(config, row)) return;
  state.editReturnProcessId = state.masterUnlocked && state.activeProcessId === config.id ? "" : state.activeProcessId === config.id ? config.id : "";
  state.launchProcessId = config.id;
  state.editingRow = { processId: config.id, rowId };
  state.launchFormOpen = true;
  if (state.masterUnlocked && state.activeProcessId === config.id) {
    renderProcess();
    document.querySelector("#inlineLaunchMount")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  setActiveProcess("launch");
}

function restoreRealData() {
  const config = configFor();
  const dataset = DATASETS[config.id];
  state.rows[config.id] = DataRepository.restoreRows(config.id);
  if (config.id === "galvanoplastia") {
    state.rows[config.id] = normalizeGalvanoplastiaBase(state.rows[config.id]);
    saveRows(config.id, state.rows[config.id]);
  }
  if (config.id === "colagem") {
    state.rows[config.id] = normalizeColagemBase(state.rows[config.id]);
    saveRows(config.id, state.rows[config.id]);
  }
  invalidateProcessCache(config.id);
  state.inputLogs = window.PHAudit.createEvent({
    type: "dados_restaurados",
    processId: config.id,
    processName: config.name,
    profile: state.masterUnlocked ? "Gestor Master" : "Usuário comum",
    summary: `Base real restaurada com ${state.rows[config.id].length} registros.`,
    details: { source: config.source, datasetVersion: dataset.version },
  });
  renderProcess();
  if (state.activeProcessId === "dashboard") renderDashboard();
}

async function syncFromSupabase() {
  if (!supabaseEnabled()) {
    setSyncStatus("offline", "Supabase não configurado");
    return;
  }
  if (state.supabaseSyncing) return;
  state.supabaseSyncing = true;
  setSyncStatus("syncing", "Atualizando dados...");
  try {
    const preserveActiveForm = activeFormHasUnsavedData();
    const accessChanged = await refreshAuthProfileAccess();
    const trustedSyncAuthoritative = canUseAuthoritativeProductionSync();
    const operationalQuery = "?select=record_id,process_id,payload,created_by_profile,updated_at,deleted_at";
    const legacySourceRows = state.authSession?.access_token
      ? await window.PHSupabase.auth.selectStrict(window.PHSupabase.tables.operationalRecords, operationalQuery, state.authSession)
      : await window.PHSupabase.select(window.PHSupabase.tables.operationalRecords, operationalQuery);
    const deletedOperationalIdsByProcess = new Map();
    legacySourceRows.filter((record) => record.deleted_at).forEach((record) => {
      const key = record.process_id || "";
      if (!deletedOperationalIdsByProcess.has(key)) deletedOperationalIdsByProcess.set(key, new Set());
      deletedOperationalIdsByProcess.get(key).add(record.record_id);
    });
    const legacyRecords = legacySourceRows
      .filter((record) => !record.deleted_at)
      .map((record) => ({ ...record, sync_source: "legacy_operational_records" }));
    let trustedEntries = [];
    if (state.authSession?.access_token) {
      try {
        trustedEntries = await window.PHSupabase.auth.selectStrict(
          window.PHSupabase.tables.productionEntries,
          "?select=id,process_code,competence_date,payload,created_by,updated_by,updated_at,status",
          state.authSession
        );
      } catch (error) {
        console.warn("Base autenticada ainda não disponível:", error);
      }
    }
  const trustedRecords = trustedEntries.filter((entry) => entry.status === "submitted").map((entry) => ({
    record_id: entry.id,
    process_id: entry.process_code,
    payload: entry.payload,
    created_by_profile: entry.payload?.createdByRole || "Usuário autenticado",
    updated_at: entry.updated_at,
    sync_source: "trusted_production_entries",
  }));
  const recordsById = new Map();
  [...legacyRecords, ...trustedRecords].forEach((record) => recordsById.set(record.record_id, record));
  const records = [...recordsById.values()];
  const officialSync = shouldUseOfficialRowsOnly();
  if (!records.length) {
    if (accessChanged) renderProcessNav();
    setSyncStatus("ok", officialSync ? "Banco sem registros visíveis; dados locais preservados" : "Sem novos registros");
    return;
  }

  implementedConfigs().forEach((config) => {
    const remoteRows = records
      .filter((record) => record.process_id === config.id && record.payload)
      .filter((record) => !isCurrentAccountClosingPayload(record.payload))
      .map((record) => ({
        id: record.record_id || record.payload.id || crypto.randomUUID(),
        ...record.payload,
        syncActorProfile: record.created_by_profile || record.payload.createdByRole || "",
        syncSource: record.sync_source || "",
        updatedAt: record.updated_at || record.payload.updatedAt,
      }));
    const remoteIds = new Set(remoteRows.map((row) => row.id));
    const deletedOperationalIds = deletedOperationalIdsByProcess.get(config.id) || new Set();
    const localRows = state.rows[config.id] || [];
    const localRowsById = new Map(localRows.map((row) => [row.id, row]));
    const mergedRemoteRows = remoteRows.map((row) => mergeRemoteRowWithLocal(localRowsById.get(row.id), row));
    if (officialSync) {
      if (!remoteRows.length) {
        if (deletedOperationalIds.size) {
          state.rows[config.id] = localRows.filter((row) => !deletedOperationalIds.has(row.id));
          saveRows(config.id, state.rows[config.id]);
        }
        invalidateProcessCache(config.id);
        return;
      }
      const localRowsToKeep = localRows.filter((row) => {
        if (remoteIds.has(row.id) || deletedOperationalIds.has(row.id)) return false;
        if (!isOfficialRow(row)) return true;
        return shouldPreserveLocalRowsWithoutRemote(config);
      });
      state.rows[config.id] = [...localRowsToKeep, ...mergedRemoteRows];
      if (config.id === "galvanoplastia") state.rows[config.id] = normalizeGalvanoplastiaBase(state.rows[config.id]);
      if (config.id === "colagem") state.rows[config.id] = normalizeColagemBase(state.rows[config.id]);
      if (config.id === "colaboradores") state.rows[config.id] = normalizeCollaboratorBase(state.rows[config.id]);
      if (config.id === "absenteismo") state.rows[config.id] = normalizeSectorReferences(state.rows[config.id]);
      if (config.id === "custosSetores") state.rows[config.id] = normalizeSectorCostBase(state.rows[config.id]);
      saveRows(config.id, state.rows[config.id]);
      invalidateProcessCache(config.id);
      return;
    }
    if (!remoteRows.length) return;

    const remoteDates = trustedProductionConfig(config)
      ? new Set(remoteRows
        .filter((row) => row.syncSource === "legacy_operational_records" || trustedSyncAuthoritative)
        .map((row) => businessDateKey(row.data))
        .filter(Boolean))
      : new Set();
    const voidedIds = new Set(trustedEntries
      .filter((entry) => entry.process_code === config.id && entry.status === "voided")
      .map((entry) => entry.id));
    const voidedDates = new Set(trustedEntries
      .filter((entry) => entry.process_code === config.id && entry.status === "voided")
      .filter(() => trustedSyncAuthoritative)
      .map((entry) => businessDateKey(entry.competence_date))
      .filter(Boolean));
    state.rows[config.id] = [
      ...localRows.filter((row) => {
        if (remoteIds.has(row.id) || voidedIds.has(row.id) || deletedOperationalIds.has(row.id)) return false;
        if (!trustedProductionConfig(config)) return true;
        const date = businessDateKey(row.data);
        return !remoteDates.has(date) && !voidedDates.has(date);
      }),
      ...mergedRemoteRows,
    ];
    if (config.id === "galvanoplastia") state.rows[config.id] = normalizeGalvanoplastiaBase(state.rows[config.id]);
    if (config.id === "colagem") state.rows[config.id] = normalizeColagemBase(state.rows[config.id]);
    if (config.id === "colaboradores") state.rows[config.id] = normalizeCollaboratorBase(state.rows[config.id]);
    if (config.id === "absenteismo") state.rows[config.id] = normalizeSectorReferences(state.rows[config.id]);
    if (config.id === "custosSetores") state.rows[config.id] = normalizeSectorCostBase(state.rows[config.id]);
    saveRows(config.id, state.rows[config.id]);
    invalidateProcessCache(config.id);
  });

  const remoteClosingRows = records
    .filter((record) => record.payload && (
      record.process_id === CURRENT_ACCOUNT_CLOSING_CONFIG.id
      || isCurrentAccountClosingPayload(record.payload)
    ))
    .map((record) => ({
      id: record.record_id || record.payload.id || crypto.randomUUID(),
      ...record.payload,
      syncActorProfile: record.created_by_profile || record.payload.createdByRole || "",
      updatedAt: record.updated_at || record.payload.updatedAt,
      syncSource: record.sync_source || "legacy_operational_records",
    }));
  if (officialSync) {
    if (remoteClosingRows.length) {
      state.rows.currentAccountClosings = remoteClosingRows;
      saveRows("currentAccountClosings", state.rows.currentAccountClosings);
    }
  } else if (remoteClosingRows.length) {
    const remoteClosingIds = new Set(remoteClosingRows.map((row) => row.id));
    state.rows.currentAccountClosings = [
      ...(state.rows.currentAccountClosings || []).filter((row) => !remoteClosingIds.has(row.id)),
      ...remoteClosingRows,
    ];
    saveRows("currentAccountClosings", state.rows.currentAccountClosings);
  }

    if (accessChanged) renderProcessNav();
    if (!preserveActiveForm && configFor()) renderProcess();
    if (!preserveActiveForm) renderOperationalDependents();
    if (preserveActiveForm && state.masterUnlocked) renderSidebarAlerts();
    setSyncStatus("ok", "Dados atualizados");
  } catch (error) {
    setSyncStatus("error", error.message || "Falha ao sincronizar");
    throw error;
  } finally {
    state.supabaseSyncing = false;
    renderSyncStatus();
  }
}

function normalizeImportHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function csvEscape(value, delimiter = ";") {
  const text = String(value ?? "");
  const needsQuote = text.includes(delimiter) || text.includes('"') || text.includes("\n") || text.includes("\r");
  const escaped = text.replaceAll('"', '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

function downloadBlob(content, filename, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadTemplateCsv() {
  const config = configFor();
  if (!config) return;
  const fields = importableFields(config);
  const csv = `\ufeff${fields.map((field) => csvEscape(field.label)).join(";")}\r\n`;
  downloadBlob(csv, `template-${config.id}.csv`);
}

function detectCsvDelimiter(line) {
  const semicolonCount = (line.match(/;/g) || []).length;
  const commaCount = (line.match(/,/g) || []).length;
  return semicolonCount >= commaCount ? ";" : ",";
}

function parseCsvLine(line, delimiter) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

function parseCsv(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { headers: [], rows: [] };
  const delimiter = detectCsvDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);
  const rows = lines.slice(1).map((line) => parseCsvLine(line, delimiter));
  return { headers, rows };
}

function normalizeDateImport(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^\d{5}$/.test(text)) {
    const serial = Number(text);
    const date = new Date(Date.UTC(1899, 11, 30 + serial));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brDate) {
    const [, day, month, year] = brDate;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return text;
}

function parseImportNumber(value) {
  const text = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .trim();
  if (!text) return 0;
  if (text.includes(",") && text.includes(".")) {
    const parsed = Number(text.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (text.includes(",")) {
    const parsed = Number(text.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (/^-?\d{1,3}(\.\d{3})+$/.test(text)) {
    const parsed = Number(text.replace(/\./g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function importedValue(field, value) {
  if (field.type === "number") return parseImportNumber(value);
  if (field.type === "date") return normalizeDateImport(value);
  return String(value || "").trim();
}

function csvValueByHeader(headers, values, names) {
  const normalizedNames = names.map(normalizeImportHeader);
  const index = headers.findIndex((header) => normalizedNames.includes(normalizeImportHeader(header)));
  return index >= 0 ? values[index] : "";
}

function movementOption(config, candidates) {
  const options = (config.fields || []).find((field) => field.key === "tipoMovimento")?.options || [];
  const normalizedCandidates = candidates.map(normalizeImportHeader);
  return options.find((option) => normalizedCandidates.includes(normalizeImportHeader(option))) || "";
}

function normalizeImportedMovement(config, movement, entry, output) {
  const raw = String(movement || "").trim();
  const exact = movementOption(config, [raw]);
  if (exact) return exact;

  const normalized = normalizeImportHeader(raw);
  const movementMap = {
    colagemConta: {
      etiquetagemcolagem: "Entrada da Etiquetagem",
      colagemcampinas: "Tags Expedidas",
      expedicao: "Tags Expedidas",
      campinas: "Tags Expedidas",
    },
    etiquetagemConta: {
      posbanhoetiquetagem: "Entrada do Pós-Banho",
      etiquetagemcolagem: "Liberado para Colagem",
    },
    ecoat: {
      preelosecoat: "Entrada do Pré-Elos",
      ecoatposbanho: "Liberado para Pós-Banho",
    },
    posBanhoConta: {
      preelosposbanho: "Entrada do Pré-Elos",
      ecoatposbanho: "Entrada do E-coat",
      posbanhoetiquetagem: "Liberado para Etiquetagem",
    },
    preElos: {
      tratamentoPreElos: "Entrada do IQ Produtos",
      tratamento: "Entrada do IQ Produtos",
      tratamentosuperficie: "Entrada do IQ Produtos",
      tratamentosuperfície: "Entrada do IQ Produtos",
      produtos: "Entrada do IQ Produtos",
      iqprodutos: "Entrada do IQ Produtos",
      iqprodutospreelos: "Entrada do IQ Produtos",
      preelosposbanho: "Liberado para Pós-Banho",
      posbanho: "Liberado para Pós-Banho",
      pósbanho: "Liberado para Pós-Banho",
      preelosecoat: "Liberado para E-coat",
      ecoat: "Liberado para E-coat",
    },
    tratamentoConta: {
      separacaoprodutotratamento: "Entrada de Separação/Produto",
      tratamentopreelos: "Liberado para Pré-Elos",
      tratamentoqualidade: "Liberado para IQ Produtos",
    },
    produtosConta: {
      almoxarifadoprodutos: "Entrada do Almoxarifado",
      produtosseparacao: "Liberado para Tratamento de Superfície",
    },
    iqProdutosConta: {
      tratamentoqualidade: "Entrada de Tratamento de Superfície",
      qualidadepreelos: "Liberado para Pré-Elos",
      tratamentoiqprodutos: "Entrada de Tratamento de Superfície",
      iqprodutospreelos: "Liberado para Pré-Elos",
    },
  };
  const mapped = movementMap[config.id]?.[normalized];
  if (mapped) return movementOption(config, [mapped]) || mapped;

  if (entry > 0 && output <= 0) {
    return (config.fields || [])
      .find((field) => field.key === "tipoMovimento")?.options
      ?.find((option) => normalizeImportHeader(option).startsWith("entrada") && !normalizeImportHeader(option).includes("ajuste")) || "Ajuste de Entrada";
  }
  if (output > 0 && entry <= 0) {
    return (config.fields || [])
      .find((field) => field.key === "tipoMovimento")?.options
      ?.find((option) => {
        const key = normalizeImportHeader(option);
        return (key.startsWith("liberado") || key.includes("expedid")) && !key.includes("ajuste");
      }) || "Ajuste de Saída";
  }
  return raw;
}

function fillCurrentAccountReportFields(config, headers, values, row) {
  if (!(config.currentAccountLedger || config.operationalOnly)) return row;
  const movement = csvValueByHeader(headers, values, ["Tipo da movimentação", "Tipo", "Movimento"]);
  const entry = parseImportNumber(csvValueByHeader(headers, values, ["Entrada"]));
  const output = parseImportNumber(csvValueByHeader(headers, values, ["Saída", "Saida"]));
  const balance = parseImportNumber(csvValueByHeader(headers, values, ["Saldo"]));
  const observation = csvValueByHeader(headers, values, ["Observação", "Observacoes", "Observações", "Observacoes"]);

  if (!row.tipoMovimento) row.tipoMovimento = normalizeImportedMovement(config, movement, entry, output);
  if (!row.qtdTags && (entry || output)) row.qtdTags = entry || output;
  if (!row.saldoDisponivelTags && balance) row.saldoDisponivelTags = balance;
  if (!row.observacoes && observation) row.observacoes = String(observation).trim();
  return row;
}

function mapImportedRows(config, headers, rows) {
  const fields = importableFields(config);
  const fieldByHeader = new Map();
  fields.forEach((field) => {
    fieldByHeader.set(normalizeImportHeader(field.label), field);
    fieldByHeader.set(normalizeImportHeader(field.key), field);
    (field.aliases || []).forEach((alias) => {
      fieldByHeader.set(normalizeImportHeader(alias), field);
    });
  });

  const mappedHeaders = headers.map((header) => fieldByHeader.get(normalizeImportHeader(header)));
  return rows
    .map((values) => {
      const row = {};
      mappedHeaders.forEach((field, index) => {
        if (!field) return;
        row[field.key] = importedValue(field, values[index]);
      });
      return fillCurrentAccountReportFields(config, headers, values, row);
    })
    .filter((row) => Object.values(row).some((value) => value !== "" && value !== null && value !== undefined));
}

function validateImportedRows(config, rows) {
  const requiredFields = importableFields(config).filter((field) => field.required);
  const errors = [];
  rows.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (row[field.key] === "" || row[field.key] === null || row[field.key] === undefined) {
        errors.push(`Linha ${index + 2}: campo obrigatório "${field.label}" não preenchido.`);
      }
    });
  });
  return errors;
}

function recognizedImportHeaders(config, headers) {
  const fields = importableFields(config);
  const valid = new Set();
  fields.forEach((field) => {
    valid.add(normalizeImportHeader(field.label));
    valid.add(normalizeImportHeader(field.key));
    (field.aliases || []).forEach((alias) => valid.add(normalizeImportHeader(alias)));
  });
  return headers.filter((header) => valid.has(normalizeImportHeader(header)));
}

function importedCompetenceSet(rows) {
  const periods = new Set();
  rows.forEach((row) => {
    const period = String(row.competencia || row.data || "").slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(period)) periods.add(period);
  });
  return periods;
}

function stableImportedConfig(config) {
  return Boolean(config.currentAccountLedger || config.operationalOnly || config.id === "prestadoresServicos");
}

async function applyImportedRows(config, importedRows, mode) {
  if (!canWriteCentralData(config)) {
    throw new Error("Entre com usuário autenticado antes de importar. Importação local não sincroniza com os colaboradores.");
  }
  if (mode === "replace" && !confirmMasterDeletion(`registros atuais de ${config.name} antes da importação`)) {
    throw new Error("Importação cancelada. Nenhum registro foi substituído.");
  }
  const timestamp = new Date().toISOString();
  const previousRows = [...(state.rows[config.id] || [])];
  const stableIdImport = stableImportedConfig(config);
  const strictOperationalImport = Boolean(config.currentAccountLedger || config.operationalOnly);
  const importOccurrences = new Map();
  const normalizedRows = importedRows.map((row) => ({
    id: stableIdImport ? stableImportRecordId(config, row, importOccurrences) : crypto.randomUUID(),
    ...config.defaultValues,
    ...row,
    createdAt: timestamp,
    importedAt: timestamp,
  }));

  try {
    if (mode === "replace") {
      if (config.id === "prestadoresServicos") {
        const periods = importedCompetenceSet(normalizedRows);
        state.rows[config.id] = [
          ...(state.rows[config.id] || []).filter((row) => !periods.has(String(row.competencia || "").slice(0, 7))),
          ...normalizedRows,
        ];
      } else {
        state.rows[config.id] = normalizedRows;
      }
    } else {
      const importedIds = new Set(normalizedRows.map((row) => row.id));
      state.rows[config.id] = [
        ...(state.rows[config.id] || []).filter((row) => !importedIds.has(row.id)),
        ...normalizedRows,
      ];
    }
    if (config.id === "colagem") state.rows[config.id] = normalizeColagemBase(state.rows[config.id]);
    if (config.id === "galvanoplastia") state.rows[config.id] = normalizeGalvanoplastiaBase(state.rows[config.id]);
    if (config.id === "colaboradores") state.rows[config.id] = normalizeCollaboratorBase(state.rows[config.id]);
    if (config.id === "absenteismo") state.rows[config.id] = normalizeSectorReferences(state.rows[config.id]);
    if (config.id === "custosSetores") state.rows[config.id] = normalizeSectorCostBase(state.rows[config.id]);

    await Promise.all(normalizedRows.map(async (row) => {
      if (trustedProductionConfig(config)) {
        await persistTrustedProductionEntry(config, row);
        markRowAsSynced(config, row, "trusted_production_entries");
        return;
      }
      if (strictOperationalImport) {
        await persistOperationalRecordStrict(config, row);
      } else {
        await persistOperationalRecord(config, row);
      }
      markRowAsSynced(config, row, "legacy_operational_records");
    }));
    if (mode === "replace" && config.id === "prestadoresServicos") {
      await deleteOperationalRecordsByProcessPeriods(
        config,
        importedCompetenceSet(normalizedRows),
        new Set(normalizedRows.map((row) => row.id))
      );
    }
    if (mode === "replace" && strictOperationalImport && config.id !== "prestadoresServicos") {
      await deleteOperationalRecordsByProcess(config, new Set(normalizedRows.map((row) => row.id)));
    }
  } catch (error) {
    state.rows[config.id] = previousRows;
    saveRows(config.id, state.rows[config.id]);
    invalidateProcessCache(config.id);
    throw error;
  }
  saveRows(config.id, state.rows[config.id]);
  invalidateProcessCache(config.id);
  state.inputLogs = window.PHAudit.createEvent({
    type: "importacao_csv",
    processId: config.id,
    processName: config.name,
    profile: state.masterUnlocked ? "Gestor Master" : "Usuario comum",
    summary: `${normalizedRows.length} registros importados em ${config.name}.`,
    details: { mode, rows: normalizedRows.length },
  });

  if (state.activeProcessId === "currentAccount") {
    renderCurrentAccount();
    renderOperationalDependents();
  } else {
    renderProcess();
  }
  renderDashboard();
}

function importCsvFile(event) {
  const config = state.activeProcessId === "currentAccount" ? currentAccountSelectedConfig() : configFor();
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!config || !file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const { headers, rows } = parseCsv(reader.result);
    if (!headers.length || !rows.length) {
      alert("O arquivo precisa ter cabecalho e pelo menos uma linha de dados.");
      return;
    }
    const recognizedHeaders = recognizedImportHeaders(config, headers);
    if (!recognizedHeaders.length) {
      alert("Nenhum cabeçalho reconhecido. Baixe o template do módulo e tente novamente.");
      return;
    }
    const importedRows = mapImportedRows(config, headers, rows);
    if (!importedRows.length) {
      alert("Nenhuma coluna reconhecida para este setor. Baixe o template e tente novamente.");
      return;
    }
    const errors = validateImportedRows(config, importedRows);
    if (errors.length) {
      alert(`Corrija o arquivo antes de importar:\n\n${errors.slice(0, 8).join("\n")}`);
      return;
    }
    const periods = [...importedCompetenceSet(importedRows)].sort();
    const scopeText = periods.length ? `\nCompetências identificadas: ${periods.join(", ")}` : "";
    const replace = confirm(
      `Prévia da importação - ${config.name}\n\n` +
      `Linhas lidas: ${rows.length}\n` +
      `Registros válidos: ${importedRows.length}\n` +
      `Colunas reconhecidas: ${recognizedHeaders.join(", ")}${scopeText}\n\n` +
      `OK: substituir somente o período importado quando houver competência.\n` +
      `Cancelar: acrescentar/atualizar sem remover registros existentes.`
    );
    try {
      await applyImportedRows(config, importedRows, replace ? "replace" : "append");
      alert("Importação concluída e sincronizada com sucesso.");
    } catch (error) {
      alert(error.message || "Importação não sincronizada. Nenhum dado local foi mantido.");
    }
  };
  reader.onerror = () => alert("Nao foi possível ler o arquivo selecionado.");
  reader.readAsText(file, "utf-8");
}

function exportCsv() {
  const config = configFor();
  if (!config || !canExportProcess(config.id)) {
    alert("Seu perfil não tem permissão para exportar este relatório.");
    return;
  }
  const columns = operationalTableColumns(config).filter((column) => column.key !== "actions");
  const rows = visibleTableRows(config, columns);
  const header = columns.map((column) => column.label);
  const body = rows.map((row) => columns.map((column) => exportCellValue(row, column)));
  const csv = "\ufeff" + [header, ...body]
    .map((line) => line.map((value) => csvEscape(value, ";")).join(";"))
    .join("\r\n");
  const period = state.tablePeriods[config.id] || "all";
  const suffix = period === "all" ? "historico" : period;
  const filename = config.exportName.replace(/\.csv$/i, `-${suffix}.csv`);
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

function exportCellValue(row, column) {
  const value = row[column.key];
  if (column.key === "data") return formatDate(value);
  if (column.key === "vigenciaInicio") return formatDate(value);
  if (column.percent) return value ? `${formatNumber(numberValue(value) * 100, 1)}%` : "";
  if (column.currency) return value ? formatNumber(value, 2) : "";
  if (column.numeric) return value !== "" && value !== undefined && value !== null ? formatNumber(value, column.decimals || 0) : "";
  return value ?? "";
}

function downloadExcelCsv({ filename, columns, rows, valueFormatter }) {
  const header = columns.map((column) => column.label);
  const body = rows.map((row) => columns.map((column) => valueFormatter(row, column)));
  const csv = "\ufeff" + [header, ...body]
    .map((line) => line.map((value) => csvEscape(value, ";")).join(";"))
    .join("\r\n");
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

function exportLaunchHistoryCsv() {
  const config = formConfig();
  if (!config || !canExportProcess(config.id)) {
    alert("Seu perfil não tem permissão para exportar este relatório.");
    return;
  }
  const columns = launchHistoryColumns(config).filter((column) => column.key !== "actions");
  const rows = calculatedRows(config.id).slice().sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  downloadExcelCsv({
    filename: config.exportName.replace(/\.csv$/i, "-lancamentos.csv"),
    columns,
    rows,
    valueFormatter: (row, column) => {
      if (column.key === "data") return formatDate(row.data);
      if (column.key === "mes") return row.mes || getDateParts(row.data).mes || "";
      if (column.numeric) return row[column.key] !== "" && row[column.key] !== undefined && row[column.key] !== null ? formatNumber(row[column.key], column.decimals || 0) : "";
      return row[column.key] ?? "";
    },
  });
}

function exportCurrentAccountCsv() {
  const config = currentAccountSelectedConfig();
  if (!config || !canExportCurrentAccountConfig(config)) {
    alert("Seu perfil não tem permissão para exportar este relatório.");
    return;
  }
  const columns = currentAccountHistoryColumns(config).filter((column) => column.key !== "actions");
  const rows = currentAccountLedgerRows(config).slice().sort((a, b) => {
    const dateOrder = String(b.data || "").localeCompare(String(a.data || ""));
    if (dateOrder) return dateOrder;
    const timeOrder = String(b.hora || "").localeCompare(String(a.hora || ""));
    if (timeOrder) return timeOrder;
    return String(b.createdAt || b.id || "").localeCompare(String(a.createdAt || a.id || ""));
  });
  downloadExcelCsv({
    filename: `${config.exportName.replace(/\.csv$/i, "")}-historico.csv`,
    columns,
    rows,
    valueFormatter: formatCurrentAccountExportCell,
  });
}

function formatCurrentAccountExportCell(row, column) {
  if (column.key === "data") return formatDate(row.data);
  if (column.numeric) return row[column.key] !== "" && row[column.key] !== undefined && row[column.key] !== null ? formatNumber(row[column.key]) : "";
  return row[column.key] ?? "";
}

function renderAccessState() {
  const label = state.authProfile
    ? (state.authProfile.role?.name || (state.masterUnlocked ? "Master" : "Colaborador"))
    : state.masterUnlocked ? "Master" : "Colaborador";
  const activeName = state.authProfile?.full_name || label;
  const activeLogin = state.authProfile?.email || (state.authSession ? "" : "Acesso operacional");
  const isAdministrator = state.masterUnlocked || state.authRoleCode === "master" || state.authRoleCode === "technical_admin";
  const action = state.authSession
    ? "Sair"
    : state.masterUnlocked ? "Sair" : state.masterAccount.mustChangePassword ? "Primeiro acesso Master" : "Entrar como Master";
  document.querySelector(".access-panel").classList.toggle("master-active", state.masterUnlocked);
  document.querySelector("#globalAccessStatus").textContent = activeName;
  const activeUser = document.querySelector("#globalAccessUser");
  if (activeUser) activeUser.textContent = activeLogin;
  const roleLabel = document.querySelector("#sidebarRoleLabel");
  if (roleLabel) roleLabel.textContent = isAdministrator ? "ADMINISTRADOR" : "COLABORADOR";
  const initials = document.querySelector("#accountInitials");
  if (initials) initials.textContent = String(activeName || label).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "C";
  document.querySelector("#globalMasterButton").textContent = action;
  document.querySelector("#globalMasterButton").setAttribute("aria-label", state.authSession ? "Sair" : action);
  document.querySelector("#globalMasterButton").setAttribute("title", state.authSession ? "Sair" : action);
  renderSidebarAlerts();
  const localStatus = document.querySelector("#masterStatus");
  const localButton = document.querySelector("#masterLoginButton");
  if (localStatus) localStatus.textContent = state.masterUnlocked ? "Liberado" : "Bloqueado";
  if (localButton) localButton.textContent = state.masterUnlocked ? "Sair" : "Entrar";
}

function pendingZeroValidationAlerts() {
  return productionConfigs().flatMap((config) =>
    (state.rows[config.id] || [])
      .filter((row) => row.validationStatus === "pending")
      .map((row) => ({ config, row }))
  ).sort((a, b) => String(b.row.validationRequestedAt || b.row.createdAt || "")
    .localeCompare(String(a.row.validationRequestedAt || a.row.createdAt || "")));
}

function validationAlertKey(processId, rowId) {
  return `${processId}:${rowId}`;
}

function validationAlertFor(key) {
  const [processId, rowId] = String(key || "").split(":");
  const config = configFor(processId);
  const row = config ? (state.rows[processId] || []).find((item) => item.id === rowId) : null;
  return config && row ? { config, row } : null;
}

function validationReadKey(config, row) {
  return `validation:${config.id}:${row.id}:${row.validationRequestedAt || row.createdAt || row.data || ""}`;
}

function feedbackReadKey(item) {
  return `feedback:colaboradores:${item.row.id}:${item.milestone}:${localDateKey(item.due)}`;
}

function alertItems(includeRead = false) {
  const validationAlerts = pendingZeroValidationAlerts().map(({ config, row }) => {
    const readKey = validationReadKey(config, row);
    return {
      type: "validation",
      processId: config.id,
      readKey,
      isRead: state.readAlertKeys.has(readKey),
      className: "warning",
      actionKey: validationAlertKey(config.id, row.id),
      title: config.name,
      detail: `${formatDate(row.data)} · ${row.validationRequestedByName || row.createdByName || "Colaborador"}`,
      label: "Validar zero",
    };
  });
  const feedbackAlerts = pendingExperienceMilestones().map((item) => {
    const dueMeta = experienceDueMeta(item.due);
    const readKey = feedbackReadKey(item);
    return {
      type: "feedback",
      processId: "colaboradores",
      readKey,
      isRead: state.readAlertKeys.has(readKey),
      className: dueMeta.className,
      actionKey: item.row.id,
      title: item.row.nomeCompleto,
      detail: `${item.row.setor || "Sem setor"} · ${item.milestone} dias`,
      label: dueMeta.label,
    };
  });
  const items = [...validationAlerts, ...feedbackAlerts];
  return includeRead ? items : items.filter((item) => !item.isRead);
}

function unreadAlertCountsByProcess() {
  return alertItems(false).reduce((map, item) => {
    map.set(item.processId, (map.get(item.processId) || 0) + 1);
    return map;
  }, new Map());
}

function markAlertRead(readKey) {
  if (!readKey) return;
  state.readAlertKeys.add(readKey);
  saveReadAlertKeys();
  renderSidebarAlerts();
  renderProcessNav();
}

function markAllAlertsRead() {
  alertItems(false).forEach((item) => state.readAlertKeys.add(item.readKey));
  saveReadAlertKeys();
  renderSidebarAlerts();
  renderProcessNav();
}

function openZeroValidationDialog(key) {
  const item = validationAlertFor(key);
  const dialog = document.querySelector("#zeroValidationDialog");
  if (!item || !dialog) return;
  const { config, row } = item;
  document.querySelector("#zeroValidationKey").value = key;
  document.querySelector("#zeroValidationTitle").textContent = `Validar lançamento · ${config.name}`;
  document.querySelector("#zeroValidationMeta").textContent = `${formatDate(row.data)} · ${row.validationRequestedByName || row.createdByName || "Colaborador"}`;
  document.querySelector("#zeroValidationFields").textContent = (row.validationZeroFields || [])
    .map((field) => field.label || field.key)
    .join(", ") || "Campo produtivo com valor zero";
  document.querySelector("#zeroValidationReason").textContent = row.validationReason || row.observacoes || "Sem justificativa registrada.";
  document.querySelector("#zeroValidationNote").value = "";
  document.querySelector("#zeroValidationMessage").textContent = "";
  dialog.showModal();
}

function closeZeroValidationDialog() {
  document.querySelector("#zeroValidationDialog")?.close();
}

async function decideZeroValidation(decision) {
  const key = document.querySelector("#zeroValidationKey")?.value || "";
  const item = validationAlertFor(key);
  const message = document.querySelector("#zeroValidationMessage");
  const note = document.querySelector("#zeroValidationNote")?.value.trim() || "";
  if (!item) {
    if (message) message.textContent = "Lançamento não encontrado. Atualize a tela.";
    return;
  }
  if (decision === "correction_requested" && !note) {
    if (message) message.textContent = "Informe qual correção o colaborador precisa realizar.";
    document.querySelector("#zeroValidationNote")?.focus();
    return;
  }
  if (!canPersistManagerValidation()) {
    if (message) {
      message.textContent = "Entre com um usuario Master/Admin do Supabase para validar este lancamento. O acesso Master local nao tem permissao para alterar a tabela protegida.";
    }
    return;
  }
  const actor = currentActorStamp();
  const now = new Date().toISOString();
  const updatedRow = {
    ...item.row,
    validationStatus: decision,
    validationDecisionNote: note,
    validatedAt: now,
    validatedByProfileId: actor.profileId,
    validatedByName: actor.name,
  };
  const previousRows = state.rows[item.config.id].slice();
  state.rows[item.config.id] = state.rows[item.config.id].map((row) => row.id === updatedRow.id ? updatedRow : row);
  try {
    if (message) message.textContent = "Salvando decisão...";
    await persistManagerValidationDecision(item.config, updatedRow, decision, note);
    saveRows(item.config.id, state.rows[item.config.id]);
    invalidateProcessCache(item.config.id);
    persistOperationalRecord(item.config, updatedRow).catch((error) => console.warn("Espelho legado não sincronizado:", error));
    state.inputLogs = window.PHAudit.createEvent({
      type: decision === "approved" ? "lancamento_zero_aprovado" : "lancamento_correcao_solicitada",
      processId: item.config.id,
      processName: item.config.name,
      profile: "Gestor Master",
      summary: `${item.config.name} de ${formatDate(updatedRow.data)}: ${decision === "approved" ? "valor zero aprovado" : "correção solicitada"} por ${actor.name}.`,
      details: { rowId: updatedRow.id, decision, note, zeroFields: updatedRow.validationZeroFields || [] },
    });
    closeZeroValidationDialog();
    renderSidebarAlerts();
    renderProcessNav();
    if (state.activeProcessId === item.config.id) renderProcess();
  } catch (error) {
    state.rows[item.config.id] = previousRows;
    if (message) message.textContent = error.message || "Não foi possível salvar a decisão.";
  }
}

function renderSidebarAlerts() {
  const button = document.querySelector("#sidebarAlertButton");
  const badge = document.querySelector("#sidebarAlertBadge");
  const list = document.querySelector("#sidebarAlertList");
  if (!button || !badge || !list) return;
  const isAdministrator = state.masterUnlocked || state.authRoleCode === "master" || state.authRoleCode === "technical_admin";
  button.hidden = !isAdministrator;
  if (!isAdministrator) {
    document.querySelector("#sidebarAlertPanel").hidden = true;
    return;
  }
  const alerts = alertItems(false);
  const totalAlerts = alerts.length;
  badge.textContent = String(totalAlerts);
  badge.hidden = totalAlerts === 0;
  list.innerHTML = alerts.length ? alerts.slice(0, 12).map((item) => `
    <article class="sidebar-alert-row">
      <button class="sidebar-alert-item ${item.className}" type="button" ${item.type === "validation" ? `data-zero-validation="${escapeHtml(item.actionKey)}"` : `data-feedback-alert="${escapeHtml(item.actionKey)}"`}>
        <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span>
        <em>${escapeHtml(item.label)}</em>
      </button>
      <button class="sidebar-alert-read" type="button" data-alert-read="${escapeHtml(item.readKey)}">Lida</button>
    </article>
  `).join("") : `<p class="sidebar-alert-empty">Nenhum alerta pendente.</p>`;
}

function toggleSidebarAlerts(force) {
  const panel = document.querySelector("#sidebarAlertPanel");
  if (!panel) return;
  panel.hidden = typeof force === "boolean" ? !force : !panel.hidden;
  if (!panel.hidden) renderSidebarAlerts();
}

function closeProfileMenu() {
  const menu = document.querySelector("#profileMenu");
  if (menu) menu.hidden = true;
}

function toggleProfileMenu() {
  const menu = document.querySelector("#profileMenu");
  if (!menu) return;
  menu.hidden = !menu.hidden;
}

function openMasterModal() {
  document.querySelector("#masterModal").hidden = false;
  document.querySelector("#masterModalTitle").textContent = "Acesso restrito";
  document.querySelector("#masterLoginFields").hidden = false;
  document.querySelector("#masterPasswordChangeFields").hidden = true;
  document.querySelector("#masterSubmitButton").textContent = "Liberar";
  document.querySelector("#masterUser").value = "";
  document.querySelector("#masterPassword").value = "";
  document.querySelector("#masterNewPassword").value = "";
  document.querySelector("#masterConfirmPassword").value = "";
  document.querySelector("#masterLoginMessage").textContent = "";
  state.masterLoginVerified = false;
  document.querySelector("#masterUser").focus();
}

function openPasswordChangeMode() {
  document.querySelector("#masterModalTitle").textContent = "Trocar senha inicial";
  document.querySelector("#masterLoginFields").hidden = true;
  document.querySelector("#masterPasswordChangeFields").hidden = false;
  document.querySelector("#masterSubmitButton").textContent = "Salvar senha";
  document.querySelector("#masterLoginMessage").textContent = "Primeiro acesso: cadastre uma senha definitiva para liberar o Master.";
  document.querySelector("#masterNewPassword").focus();
}

function closeMasterModal() {
  document.querySelector("#masterModal").hidden = true;
  state.masterLoginVerified = false;
}

function lockMasterAccess() {
  state.masterUnlocked = false;
  state.launchProcessId = null;
  setActiveProcess("launch");
}

function unlockMasterAccess() {
  state.masterUnlocked = true;
  state.masterLoginVerified = false;
  closeMasterModal();
  renderProcessNav();
  setActiveProcess("launchMonitor");
}

function changeMasterPassword() {
  const newPassword = document.querySelector("#masterNewPassword").value;
  const confirmPassword = document.querySelector("#masterConfirmPassword").value;
  if (newPassword.length < 6) {
    document.querySelector("#masterLoginMessage").textContent = "A nova senha precisa ter pelo menos 6 caracteres.";
    return;
  }
  if (newPassword !== confirmPassword) {
    document.querySelector("#masterLoginMessage").textContent = "A confirmação não confere com a nova senha.";
    return;
  }
  state.masterAccount = {
    ...state.masterAccount,
    password: newPassword,
    mustChangePassword: false,
  };
  saveMasterAccount();
  unlockMasterAccess();
}

function wireEvents() {
  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, registerUserActivity, { passive: true });
  });
  window.addEventListener("scroll", registerUserActivity, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !state.authSession) return;
    if (Date.now() - lastActivityAt() >= INACTIVITY_LIMIT_MS) {
      expireSessionForInactivity();
      return;
    }
    registerUserActivity();
  });
  document.querySelector("#authLoginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.querySelector("#authSubmitButton");
    const message = document.querySelector("#authMessage");
    const email = document.querySelector("#authEmail").value.trim();
    const password = document.querySelector("#authPassword").value;
    message.textContent = "";
    if (!email || !password) {
      message.textContent = "Informe e-mail/login e senha para entrar.";
      return;
    }
    button.disabled = true;
    button.textContent = "Entrando...";
    try {
      await signInWithSupabaseAuth(email, password);
      await syncFromSupabase();
      renderAuthenticatedShell();
      document.querySelector("#authPassword").value = "";
    } catch (error) {
      message.textContent = error.message || "Não foi possível entrar.";
    } finally {
      button.disabled = false;
      button.textContent = "Entrar";
    }
  });
  document.querySelector("#sidebarToggle").addEventListener("click", () => {
    const shell = document.querySelector(".app-shell");
    shell.classList.toggle("sidebar-collapsed");
    const collapsed = shell.classList.contains("sidebar-collapsed");
    localStorage.setItem("ph-sidebar-collapsed", collapsed ? "true" : "false");
    document.querySelector("#sidebarToggle").setAttribute("aria-label", collapsed ? "Expandir menu" : "Recolher menu");
    document.querySelector("#sidebarToggle").setAttribute("title", collapsed ? "Expandir menu" : "Recolher menu");
  });
  document.querySelector("#processNav").addEventListener("click", (event) => {
    const groupToggle = event.target.closest("[data-process-group-toggle]");
    if (groupToggle) {
      toggleProcessNavGroup(groupToggle.dataset.processGroupToggle);
      return;
    }
    const button = event.target.closest("[data-process]");
    if (!button) return;
    if (button.dataset.process === "launch") {
      state.launchProcessId = null;
      state.launchFormOpen = false;
      state.editingRow = null;
    }
    if (button.dataset.process === "currentAccount") {
      state.editingRow = null;
      state.currentAccountFormOpen = false;
      state.launchProcessId = state.currentAccountProcessId;
    }
    setActiveProcess(button.dataset.process);
  });
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", (event) => {
    if (event.target?.dataset?.field === "colaborador") syncSelectedCollaboratorSector();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    try {
      const row = getFormRow();
      await saveFormRow(row);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
  document.querySelector("#clearFormButton").addEventListener("click", clearForm);
  document.querySelector("#cancelFormButton").addEventListener("click", cancelForm);
  document.querySelector("#currentAccountSectorList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-current-account-sector]");
    if (!button) return;
    if (launchFormHasData() && !confirm("Existem dados preenchidos que ainda não foram salvos. Deseja trocar de setor?")) return;
    state.currentAccountProcessId = button.dataset.currentAccountSector;
    state.launchProcessId = state.currentAccountProcessId;
    state.currentAccountFormOpen = false;
    state.editingRow = null;
    state.editReturnProcessId = "";
    renderCurrentAccount();
  });
  document.querySelector("#currentAccountWeekEnd")?.addEventListener("change", () => {
    const config = currentAccountSelectedConfig();
    if (config) renderCurrentAccountClosing(config);
  });
  document.querySelector("#currentAccountPhysicalBalance")?.addEventListener("input", updateCurrentAccountClosingPreview);
  document.querySelector("#applyImportedCurrentAccountBalanceButton")?.addEventListener("click", applyImportedCurrentAccountBalance);
  document.querySelector("#saveCurrentAccountBaseButton")?.addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    try {
      await saveCurrentAccountBaseBalance();
    } finally {
      event.currentTarget.disabled = false;
    }
  });
  document.querySelector("#saveCurrentAccountClosingButton")?.addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    try {
      await saveCurrentAccountClosing();
    } finally {
      event.currentTarget.disabled = false;
    }
  });
  document.querySelector("#currentAccountHistoryBody")?.addEventListener("click", async (event) => {
    const viewButton = event.target.closest("[data-current-account-view]");
    if (viewButton) {
      openCurrentAccountRecordView(viewButton.dataset.currentAccountView);
      return;
    }
    const deleteButton = event.target.closest("[data-current-account-delete]");
    if (deleteButton) {
      await deleteCurrentAccountRecord(deleteButton.dataset.currentAccountDelete);
      return;
    }
    const button = event.target.closest("[data-current-account-edit]");
    if (!button) return;
    const config = currentAccountSelectedConfig();
    if (!config) return;
    state.launchProcessId = config.id;
    state.editingRow = { processId: config.id, rowId: button.dataset.currentAccountEdit };
    state.currentAccountFormOpen = true;
    state.editReturnProcessId = "";
    renderCurrentAccount();
    document.querySelector("#currentAccountFormMount")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#seedButton").addEventListener("click", restoreRealData);
  document.querySelector("#templateButton").addEventListener("click", downloadTemplateCsv);
  document.querySelector("#importButton").addEventListener("click", () => document.querySelector("#importFileInput").click());
  document.querySelector("#importFileInput").addEventListener("change", importCsvFile);
  document.querySelector("#saveSectorCostsButton")?.addEventListener("click", saveAllCurrentProcessRows);
  document.querySelector("#exportButton").addEventListener("click", exportCsv);
  document.querySelector("#exportLaunchHistoryButton")?.addEventListener("click", exportLaunchHistoryCsv);
  document.querySelector("#clearCurrentAccountButton")?.addEventListener("click", clearCurrentAccountTable);
  document.querySelector("#importCurrentAccountButton")?.addEventListener("click", () => document.querySelector("#importFileInput").click());
  document.querySelector("#exportCurrentAccountButton")?.addEventListener("click", exportCurrentAccountCsv);
  document.querySelector("#refreshDiagnosticsButton")?.addEventListener("click", refreshDiagnostics);
  document.querySelector("#newRecordButton").addEventListener("click", () => {
    const config = configFor();
    if (!config) return;
    state.editReturnProcessId = "";
    if (config.indicator) {
      openIndicatorForm(config.id);
      return;
    }
    state.editingRow = null;
    state.launchProcessId = config.id;
    state.launchFormOpen = true;
    if (state.masterUnlocked) {
      renderProcess();
      document.querySelector("#inlineLaunchMount")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setActiveProcess("launch");
  });
  document.querySelector("#absenceNewRecordButton").addEventListener("click", () => {
    openIndicatorForm("absenteismo");
  });
  document.querySelector("#generateProviderClosingButton").addEventListener("click", exportProviderClosing);
  document.querySelector("#productionSnapshotPeriod").addEventListener("change", () => {
    const processId = document.querySelector("#productionSnapshot")?.dataset.processId;
    const config = configFor(processId);
    if (config) renderProductionSnapshot(config);
  });
  document.querySelector("#refreshLaunchMonitorButton").addEventListener("click", refreshLaunchMonitor);
  document.querySelector("#processBackButton").addEventListener("click", goBackFromProcess);
  document.querySelector("#operationalFlowWeek").addEventListener("change", (event) => {
    state.operationalFlowWeek = event.target.value;
    document.querySelector("#operationalFlowMessage").textContent = "";
    renderOperationalFlow();
  });
  document.querySelector("#openCreateOperationalWeekButton").addEventListener("click", () => {
    setOperationalWeekCreatorDefaults();
    document.querySelector("#operationalWeekCreator").hidden = false;
    document.querySelector("#operationalWeekStart")?.focus();
  });
  document.querySelector("#cancelOperationalWeekButton").addEventListener("click", () => {
    document.querySelector("#operationalWeekCreator").hidden = true;
  });
  document.querySelector("#operationalWeekStart").addEventListener("change", (event) => {
    const startKey = event.target.value;
    const endInput = document.querySelector("#operationalWeekEnd");
    if (startKey && endInput) endInput.value = addDaysKey(startKey, 4);
  });
  document.querySelector("#createOperationalWeekButton").addEventListener("click", createOperationalWeek);
  document.querySelector("#saveOperationalFlowButton").addEventListener("click", saveOperationalFlow);
  document.querySelector("#operationalFlowArea").addEventListener("input", (event) => {
    if (event.target.matches("[data-flow-manual-week], [data-flow-manual-day], [data-flow-opening], [data-flow-target], [data-flow-note]")) {
      storeOperationalFlowDraftInput(event.target);
    }
  });
  document.querySelector("#launchMonitorCards").addEventListener("click", (event) => {
    const card = event.target.closest("[data-monitor-process]");
    if (!card) return;
    setActiveProcess(card.dataset.monitorProcess);
  });
  document.querySelector("#dashboardPeriod").addEventListener("change", renderDashboard);
  document.querySelector("#dashboardSector").addEventListener("change", renderDashboard);
  document.querySelector("#productionManagementPeriod")?.addEventListener("change", renderProductionManagement);
  document.querySelector("#productionManagementScope")?.addEventListener("change", renderProductionManagement);
  document.querySelector("#weeklyClosingDate")?.addEventListener("change", renderWeeklyClosing);
  document.querySelector("#weeklyClosingSector")?.addEventListener("change", renderWeeklyClosing);
  document.querySelector("#weeklyClosingStatusFilter")?.addEventListener("change", () => renderWeeklyClosingMasterPanel());
  document.querySelector("#weeklyClosingSaveDraftButton")?.addEventListener("click", async () => {
    await saveWeeklyClosing("draft");
  });
  document.querySelector("#weeklyClosingForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.querySelector("#weeklyClosingSubmitButton");
    if (button) button.disabled = true;
    try {
      await saveWeeklyClosing("sent");
    } finally {
      if (button) button.disabled = false;
    }
  });
  document.querySelector("#weeklyClosingClearButton")?.addEventListener("click", () => {
    fillWeeklyClosingForm(null);
    document.querySelector("#weeklyClosingMessage").textContent = "";
  });
  document.querySelector("#weeklyClosingList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-weekly-sector]");
    if (!button) return;
    document.querySelector("#weeklyClosingSector").value = button.dataset.weeklySector;
    renderWeeklyClosing();
  });
  document.querySelector("#weeklyClosingGenerateSummaryButton")?.addEventListener("click", generateWeeklyClosingSummary);
  document.querySelector("#weeklyClosingRequestRevisionButton")?.addEventListener("click", () => updateWeeklyClosingStatus("revision_requested"));
  document.querySelector("#weeklyClosingApproveButton")?.addEventListener("click", () => updateWeeklyClosingStatus("reviewed"));
  const dashboardMetric = document.querySelector("#dashboardMetric");
  if (dashboardMetric) dashboardMetric.addEventListener("change", renderDashboard);
  document.querySelector("#absencePeriodFilter").addEventListener("change", (event) => {
    state.absencePeriod = event.target.value;
    renderSummary(PROCESS_CONFIGS.absenteismo);
    renderAbsenteeismAnalytics();
  });
  const executiveTagGoalInput = document.querySelector("#executiveTagGoalInput");
  if (executiveTagGoalInput) {
    executiveTagGoalInput.addEventListener("change", (event) => {
      const value = Math.round(Number(event.target.value));
      if (!Number.isFinite(value) || value <= 0) {
        event.target.value = String(state.executiveTagGoal || 85000);
        return;
      }
      event.target.value = String(value);
      const status = document.querySelector("#factoryTvSaveStatus");
      if (status) {
        status.textContent = "Meta alterada na tela. Clique em Salvar parâmetros para gravar no banco.";
        status.classList.remove("error");
      }
    });
  }
  const saveFactoryHoursButton = document.querySelector("#factoryTvSaveHours");
  if (saveFactoryHoursButton) {
    saveFactoryHoursButton.addEventListener("click", async () => {
      const status = document.querySelector("#factoryTvSaveStatus");
      const goalInput = document.querySelector("#executiveTagGoalInput");
      if (status) {
        status.textContent = "Salvando parâmetros...";
        status.classList.remove("error");
      }
      if (goalInput) {
        const value = Math.round(Number(goalInput.value));
        if (!Number.isFinite(value) || value <= 0) {
          if (status) {
            status.textContent = "Informe uma meta válida antes de salvar.";
            status.classList.add("error");
          }
          goalInput.focus();
          return;
        }
        goalInput.value = String(value);
        saveExecutiveTagGoal(value);
      }
      saveFactoryDashboardHours({
        extraHours: document.querySelector("#factoryTvExtraHoursInput")?.value,
        people: document.querySelector("#factoryTvExtraPeopleInput")?.value,
      });
      let savedInDatabase = false;
      try {
        savedInDatabase = await persistFactoryDashboardSettings();
      } catch (error) {
        const errorStatus = document.querySelector("#factoryTvSaveStatus");
        if (errorStatus) {
          errorStatus.textContent = error.message || "Não foi possível salvar os parâmetros no banco.";
          errorStatus.classList.add("error");
        }
        return;
      } finally {
        renderDashboard();
      }
      const updatedStatus = document.querySelector("#factoryTvSaveStatus");
      const savedMessage = savedInDatabase
        ? `Parâmetros salvos no banco às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`
        : `Parâmetros salvos localmente às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`;
      if (updatedStatus) {
        updatedStatus.textContent = savedMessage;
        updatedStatus.classList.toggle("error", !savedInDatabase && Boolean(state.authSession?.access_token));
        clearTimeout(window.factoryTvSaveStatusTimer);
        window.factoryTvSaveStatusTimer = setTimeout(() => {
          const currentStatus = document.querySelector("#factoryTvSaveStatus");
          if (currentStatus) currentStatus.textContent = "";
        }, 5000);
      }
      showSystemToast(savedMessage, savedInDatabase ? "success" : "info");
    });
  }
  const addFactoryCollaboratorButton = document.querySelector("#factoryTvAddCollaborator");
  if (addFactoryCollaboratorButton) {
    addFactoryCollaboratorButton.addEventListener("click", () => {
      const search = document.querySelector("#factoryTvCollaboratorSearch");
      const typedName = String(search?.value || "").trim();
      const match = collaboratorOptions().find((name) => normalizedSectorName(name) === normalizedSectorName(typedName));
      if (!match) {
        if (search) search.focus();
        return;
      }
      const selected = parseFactoryExtraPeople(document.querySelector("#factoryTvExtraPeopleInput")?.value);
      setFactoryExtraPeopleInput([...selected, match]);
      if (search) search.value = "";
      renderFactoryExtraPeoplePicker();
    });
  }
  const factoryCollaboratorSearch = document.querySelector("#factoryTvCollaboratorSearch");
  if (factoryCollaboratorSearch) {
    factoryCollaboratorSearch.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      document.querySelector("#factoryTvAddCollaborator")?.click();
    });
  }
  const selectedFactoryCollaborators = document.querySelector("#factoryTvSelectedCollaborators");
  if (selectedFactoryCollaborators) {
    selectedFactoryCollaborators.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-extra-person]");
      if (!button) return;
      const removed = normalizedSectorName(button.dataset.removeExtraPerson);
      const selected = parseFactoryExtraPeople(document.querySelector("#factoryTvExtraPeopleInput")?.value)
        .filter((name) => normalizedSectorName(name) !== removed);
      setFactoryExtraPeopleInput(selected);
      renderFactoryExtraPeoplePicker();
    });
  }
  const executiveWeekFilter = document.querySelector("#executiveWeekFilter");
  if (executiveWeekFilter) {
    executiveWeekFilter.addEventListener("change", (event) => {
      state.executiveWeek = event.target.value;
      renderExecutiveWeeklyTagFlow();
    });
  }
  const tagConversionControls = document.querySelector("#tagConversionControls");
  if (tagConversionControls) {
    tagConversionControls.addEventListener("change", (event) => {
      const input = event.target.closest("[data-tag-factor]");
      if (!input) return;
      const value = numberValue(input.value);
      if (value <= 0) {
        input.value = String(state.tagConversionFactors[input.dataset.tagFactor] || 1);
        return;
      }
      state.tagConversionFactors[input.dataset.tagFactor] = value;
      saveTagConversionFactors();
      renderExecutiveWeeklyTagFlow();
    });
  }
  document.querySelector("#dashboardModeSwitch").addEventListener("click", (event) => {
    const button = event.target.closest("[data-dashboard-mode]");
    if (!button) return;
    state.dashboardView = button.dataset.dashboardMode;
    renderDashboardView();
  });
  const closeMonthButton = document.querySelector("#closeMonthButton");
  if (closeMonthButton) {
    closeMonthButton.addEventListener("click", () => {
      closeSelectedMonth();
      setActiveProcess("monthlyClose");
    });
  }
  document.querySelector("#logsSectorFilter").addEventListener("change", renderLogs);
  const refreshLogsButton = document.querySelector("#refreshLogsButton");
  if (refreshLogsButton) refreshLogsButton.addEventListener("click", refreshTrustedLogs);
  document.querySelector("#refreshAccessButton").addEventListener("click", refreshAccessManagement);
  document.querySelector("#newAccessUserButton").addEventListener("click", async () => openAccessUserForm());
  document.querySelector("#cancelAccessUserButton").addEventListener("click", closeAccessUserForm);
  document.querySelector("#backAccessUserButton").addEventListener("click", closeAccessUserForm);
  document.querySelector("#accessLogin").addEventListener("input", updateAccessEmailPreview);
  document.querySelector("#accessUserForm").addEventListener("submit", saveAccessUserProfile);
  document.querySelector("#accessUsersTable").addEventListener("click", (event) => {
    const resetButton = event.target.closest("[data-access-reset-password]");
    if (resetButton) {
      resetAccessUserPassword(resetButton.dataset.accessResetPassword);
      return;
    }
    const editButton = event.target.closest("[data-access-edit]");
    if (!editButton) return;
    openAccessUserForm(editButton.dataset.accessEdit);
  });
  document.querySelector("#accessUserSelect").addEventListener("change", (event) => {
    state.selectedAccessUserId = event.target.value;
    updateAccessPermissionSaveState();
    renderAccessPermissions();
  });
  document.querySelector("#accessGroupFilter").addEventListener("change", renderAccessPermissions);
  document.querySelector("#saveAccessPermissionsButton")?.addEventListener("click", () => {
    savePendingAccessPermissions().catch((error) => console.error("Falha ao salvar permissões:", error));
  });
  document.querySelector("#accessPermissionsTable").addEventListener("change", (event) => {
    const input = event.target.closest(".access-permission-check");
    if (!input) return;
    stageAccessPermission(input);
  });
  document.querySelector("#launchSectorPicker").addEventListener("click", (event) => {
    const button = event.target.closest("[data-launch-process]");
    if (!button) return;
    state.editingRow = null;
    state.editReturnProcessId = "";
    state.launchProcessId = button.dataset.launchProcess;
    state.launchFormOpen = false;
    renderLaunch();
  });
  document.querySelector("#openLaunchFormButton")?.addEventListener("click", () => {
    if (state.activeProcessId === "currentAccount") {
      state.editingRow = null;
      state.currentAccountFormOpen = true;
      renderCurrentAccount();
      document.querySelector("#currentAccountFormMount")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const config = formConfig();
    if (!config) return;
    state.editingRow = null;
    state.launchFormOpen = true;
    renderLaunch();
    document.querySelector("#launchFormShell")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#changeLaunchSectorButton").addEventListener("click", leaveLaunchForm);
  document.querySelector("#launchHistoryBody").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    if (!editButton) return;
    const config = formConfig();
    if (!config) return;
    editProcessRow(config.id, editButton.dataset.edit);
  });
  const masterLoginButton = document.querySelector("#masterLoginButton");
  if (masterLoginButton) {
    masterLoginButton.addEventListener("click", () => {
      if (state.masterUnlocked) {
        lockMasterAccess();
        return;
      }
      openMasterModal();
    });
  }
  document.querySelector("#globalMasterButton").addEventListener("click", () => {
    if (state.authSession) {
      signOutSupabaseAuth();
      return;
    }
    if (state.masterUnlocked) {
      lockMasterAccess();
      return;
    }
    openMasterModal();
  });
  document.querySelector("#syncStatusButton")?.addEventListener("click", refreshDataManually);
  document.querySelector("#accountProfileButton").addEventListener("click", () => {
    if (state.authSession) {
      toggleProfileMenu();
      return;
    }
    if (!state.masterUnlocked) openMasterModal();
  });
  document.querySelector("#openProfileButton").addEventListener("click", () => {
    closeProfileMenu();
    setActiveProcess("profile");
  });
  document.querySelector("#sidebarAlertButton").addEventListener("click", () => toggleSidebarAlerts());
  document.querySelector("#closeSidebarAlerts").addEventListener("click", () => toggleSidebarAlerts(false));
  document.querySelector("#markAllSidebarAlertsRead").addEventListener("click", markAllAlertsRead);
  document.querySelector("#sidebarAlertList").addEventListener("click", (event) => {
    const readButton = event.target.closest("[data-alert-read]");
    if (readButton) {
      markAlertRead(readButton.dataset.alertRead);
      return;
    }
    const zeroItem = event.target.closest("[data-zero-validation]");
    if (zeroItem) {
      toggleSidebarAlerts(false);
      openZeroValidationDialog(zeroItem.dataset.zeroValidation);
      return;
    }
    const item = event.target.closest("[data-feedback-alert]");
    if (!item) return;
    toggleSidebarAlerts(false);
    setActiveProcess("colaboradores");
    setTimeout(() => document.querySelector("#peopleExperienceList")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  });
  document.querySelector("#closeZeroValidationButton").addEventListener("click", closeZeroValidationDialog);
  document.querySelector("#approveZeroValidationButton").addEventListener("click", () => decideZeroValidation("approved"));
  document.querySelector("#requestZeroCorrectionButton").addEventListener("click", () => decideZeroValidation("correction_requested"));
  document.querySelector("#zeroValidationDialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeZeroValidationDialog();
  });
  document.addEventListener("click", (event) => {
    const accessPanel = event.target.closest(".access-panel");
    if (!accessPanel) closeProfileMenu();
    if (!event.target.closest("#sidebarAlertButton") && !event.target.closest("#sidebarAlertPanel")) toggleSidebarAlerts(false);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.authSession?.access_token) {
      if (activeFormHasUnsavedData()) return;
      syncFromSupabase().catch((error) => {
        console.warn("Sincronização ao retornar para a tela não concluída:", error);
      });
    }
  });
  document.querySelector("#profileForm").addEventListener("submit", saveOwnProfile);
  document.querySelector("#passwordForm").addEventListener("submit", changeOwnPassword);
  document.querySelector("#masterCancelButton").addEventListener("click", closeMasterModal);
  document.querySelector("#masterLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.masterLoginVerified && state.masterAccount.mustChangePassword) {
      changeMasterPassword();
      return;
    }
    const user = document.querySelector("#masterUser").value.trim();
    const password = document.querySelector("#masterPassword").value;
    if (user === state.masterAccount.user && password === state.masterAccount.password) {
      if (state.masterAccount.mustChangePassword) {
        state.masterLoginVerified = true;
        openPasswordChangeMode();
        return;
      }
      unlockMasterAccess();
      return;
    }
    document.querySelector("#masterLoginMessage").textContent = "Login ou senha inválidos.";
  });
  searchInput.addEventListener("input", () => {
    const config = configFor();
    if (config) state.tablePages[config.id] = 1;
    if (config) renderTable(config);
  });
  document.querySelector("#tablePeriodFilter").addEventListener("change", (event) => {
    const config = configFor();
    if (!config) return;
    state.tablePeriods[config.id] = event.target.value;
    state.tablePages[config.id] = 1;
    if (config.indicator) renderSummary(config);
    renderExternalServicesAlerts(config);
    renderTable(config);
    if (config.id === "prestadoresServicos") renderProvidersAnalytics();
  });
  document.querySelector("#tableHead").addEventListener("click", (event) => {
    const button = event.target.closest("[data-table-sort]");
    const config = configFor();
    if (!button || !config) return;
    const key = button.dataset.tableSort;
    const current = state.tableSorts[config.id] || {};
    state.tableSorts[config.id] = {
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    };
    state.tablePages[config.id] = 1;
    renderTableHeader(config);
    renderTable(config);
  });
  document.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-table-page]");
    if (!pageButton) return;
    const config = configFor();
    if (!config) return;
    const rows = visibleTableRows(config);
    const totalPages = Math.max(1, Math.ceil(rows.length / state.tablePageSize));
    const current = state.tablePages[config.id] || 1;
    state.tablePages[config.id] = pageButton.dataset.tablePage === "next"
      ? Math.min(totalPages, current + 1)
      : Math.max(1, current - 1);
    renderTable(config);
  });
  document.querySelector("#tableBody").addEventListener("click", async (event) => {
    const sectorExpand = event.target.closest("[data-sector-expand]");
    if (sectorExpand) {
      const rowId = sectorExpand.dataset.sectorExpand;
      if (state.expandedSectorCostRows.has(rowId)) state.expandedSectorCostRows.delete(rowId);
      else state.expandedSectorCostRows.add(rowId);
      renderTable(configFor());
      return;
    }
    const printButton = event.target.closest("[data-print-os]");
    if (printButton) {
      printTerceirosGalvanoOrder(printButton.dataset.printOs);
      return;
    }
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      openRecordView(viewButton.dataset.view);
      return;
    }
    const editButton = event.target.closest("[data-edit]");
    if (editButton) {
      const config = configFor();
      editProcessRow(config.id, editButton.dataset.edit);
      return;
    }
    const button = event.target.closest("[data-delete]");
    if (!button) return;
    const config = configFor();
    const removedRow = state.rows[config.id].find((row) => row.id === button.dataset.delete);
    if (!removedRow || !canDeleteRow(config, removedRow)) return;
    const reference = removedRow.nomeCompleto || removedRow.colaborador || removedRow.setor || formatDate(removedRow.data) || "registro selecionado";
    if (!confirmMasterDeletion(`${reference} em ${config.name}`)) return;
    try {
      await voidTrustedProductionEntry(config, removedRow);
    } catch (error) {
      alert(error.message || "Não foi possível confirmar a exclusão no banco.");
      return;
    }
    state.rows[config.id] = state.rows[config.id].filter((row) => row.id !== button.dataset.delete);
    saveRows(config.id, state.rows[config.id]);
    invalidateProcessCache(config.id);
    deleteOperationalRecord(config, removedRow).catch((error) => {
      console.warn("Exclusão no espelho legado não sincronizada:", error);
    });
    state.inputLogs = window.PHAudit.createEvent({
      type: "lancamento_excluido",
      processId: config.id,
      processName: config.name,
      profile: state.masterUnlocked ? "Gestor Master" : "Usuário comum",
      summary: `Registro excluído da tabela ${config.name}.`,
      details: { removedRow },
    });
    renderProcess();
  });
  document.querySelector("#closeRecordViewButton").addEventListener("click", () => document.querySelector("#recordViewDialog").close());
  document.querySelector("#recordViewDialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  document.querySelector("#experienceKanban").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-feedback-action]");
    await handleExperienceFeedbackAction(button);
  });
  document.querySelector("#peopleExperienceList").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-feedback-action]");
    await handleExperienceFeedbackAction(button);
  });
  document.querySelector("#experienceFeedbackForm").addEventListener("submit", saveExperienceFeedback);
  document.querySelector("#closeExperienceFeedbackButton").addEventListener("click", closeExperienceFeedback);
  document.querySelector("#cancelExperienceFeedbackButton").addEventListener("click", closeExperienceFeedback);
  document.querySelector("#experienceFeedbackDialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeExperienceFeedback();
  });
}

async function init() {
  try {
    wireEvents();
    renderSyncStatus();
    initButtonIconEnhancer();
    const restored = await restoreAuthSession();
    if (!restored) {
      showAuthGate(state.sessionExpiredByInactivity
        ? "Sessão encerrada após 30 minutos de inatividade. Entre novamente."
        : "");
    } else {
      await syncFromSupabase();
      renderAuthenticatedShell();
    }
  } catch (error) {
    window.PH_BOOT_ERRORS.push(error.message || String(error));
    showAuthGate("Não foi possível iniciar. Atualize a página e tente novamente.");
  } finally {
    window.PH_APP_READY = true;
  }
}

init();




