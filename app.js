const STORAGE_KEY = "factoryPartOrders";
const SESSION_KEY = "factoryPartOrdersSession";
const USERS_KEY = "factoryPartOrdersUsersV2";
const API_ORDERS_URL = "/api/orders";
const API_ACCESS_LOGS_URL = "/api/access-logs";
const API_PRICES_URL = "/api/prices";
const API_COST_SETTINGS_URL = "/api/cost-settings";
const API_PASSWORD_RESET_URL = "/api/password-reset";
const defaultUsers = [
  { login: "Charles Marinho", password: "12345", name: "Charles Marinho", role: "master", mustChangePassword: true },
  { login: "Willians.Jorge", password: "12345", name: "Willians Jorge", role: "master", mustChangePassword: true },
  { login: "Juliano", password: "12345", name: "Juliano", role: "consultant", mustChangePassword: true },
];

const statuses = [
  "Pedido Recebido",
  "Em separa\u00e7\u00e3o",
  "Em prepara\u00e7\u00e3o de banho (galvanoplastia)",
  "P\u00f3s banho",
  "Prepara\u00e7\u00e3o final",
  "Entregue",
];

const origins = [
  "Escrit\u00f3rio VQF",
  "Loja Cambu\u00ed Campinas",
  "Loja Dom Pedro",
  "Loja Iguatemi Campinas",
  "Loja Iguatemi Sorocaba",
  "Showroom Barueri",
  "Showroom Campinas",
  "Showroom Indaiatuba",
  "Showroom S\u00e3o Paulo",
  "Showroom Sorocaba",
  "Showroom Sumar\u00e9",
  "Site",
  "Veri Em Casa",
];

const partSizes = {
  Argolinha: ["3.0 x 0.60", "3.5 x 0.70", "3.5 x 0.80", "4.2 x 0.70", "4.2 x 0.80", "5.0 x 0.80"],
  "Extensor Losango": ["3 cm", "5 cm", "7 cm", "10 cm"],
  "Extensor bal\u00e3ozinho": ["3 cm", "5 cm", "7 cm", "10 cm"],
  "Extensor Vqzinha": ["2,5 cm", "4,5 cm"],
  Timbre: ["VERI"],
  "Fecho lagosta": ["9 mm", "10 mm", "11 mm", "12 mm"],
  "Fecho Italiano": ["7mm", "10mm", "11mm"],
  "Fecho Mola": ["5mm", "6mm", "7mm"],
  "Fecho Boia": ["9mm", "11mm", "13mm"],
  Veneziana: ["40 cm", "42 cm", "44 cm", "50 cm", "60 cm", "70 cm"],
  Tarraxa: ["P", "M", "G", "BABY"],
};

const baths = ["Ouro", "R\u00f3dio"];

const sampleOrders = [
  {
    id: "PED-2026-0001",
    requestDate: "2026-05-20",
    requester: "Ana Costa",
    phone: "11999990001",
    origin: "Showroom Campinas",
    priority: "Urgente",
    dueDate: "",
    status: "Em separa\u00e7\u00e3o",
    notes: "Separar banho com prioridade para vitrine.",
    attachmentName: "",
    items: [
      { model: "Argolinha", size: "3.5 x 0.70", bath: "Ouro", quantity: 10 },
      { model: "Extensor Losango", size: "5 cm", bath: "R\u00f3dio", quantity: 5 },
    ],
  },
  {
    id: "PED-2026-0002",
    requestDate: "2026-05-24",
    requester: "Carlos Lima",
    phone: "11999990002",
    origin: "Loja Dom Pedro",
    priority: "Normal",
    dueDate: "",
    status: "Pedido Recebido",
    notes: "",
    attachmentName: "",
    items: [{ model: "Fecho lagosta", size: "10 mm", bath: "Ouro", quantity: 12 }],
  },
];

const today = new Date();
const todayIso = toIsoDate(today);
let orders = [];
let accessLogs = [];
let prices = [];
let costSettings = { goldValue: 800, rhodiumValue: 2500, rhodiumFactor: 0.7 };
let currentSession = loadSession();
let apiAvailable = false;
let users = loadUsers();
let masterUsers = [];
let passwordResetRequests = [];
let masterCredential = null;
let masterDatabase = null;
let pendingUser = null;
let isSubmittingOrder = false;
let editingManagementUserLogin = "";
let expandedOrderIds = new Set();
let activeLoginMode = "common";
let collaboratorAccessMode = "login";

const elements = {
  entryScreen: document.querySelector("#entryScreen"),
  appShell: document.querySelector("#appShell"),
  passwordScreen: document.querySelector("#passwordScreen"),
  loginForm: document.querySelector("#loginForm"),
  resetRequestForm: document.querySelector("#resetRequestForm"),
  resetCompleteForm: document.querySelector("#resetCompleteForm"),
  passwordForm: document.querySelector("#passwordForm"),
  commonLoginTab: document.querySelector("#commonLoginTab"),
  consultantLoginTab: document.querySelector("#consultantLoginTab"),
  masterLoginTab: document.querySelector("#masterLoginTab"),
  commonLoginFields: document.querySelector("#commonLoginFields"),
  internalLoginFields: document.querySelector("#internalLoginFields"),
  loginName: document.querySelector("#loginName"),
  loginPhone: document.querySelector("#loginPhone"),
  collaboratorLoginAccess: document.querySelector("#collaboratorLoginAccess"),
  collaboratorNewAccess: document.querySelector("#collaboratorNewAccess"),
  collaboratorLoginFields: document.querySelector("#collaboratorLoginFields"),
  collaboratorRegisterFields: document.querySelector("#collaboratorRegisterFields"),
  collaboratorLogin: document.querySelector("#collaboratorLogin"),
  collaboratorPassword: document.querySelector("#collaboratorPassword"),
  registerLogin: document.querySelector("#registerLogin"),
  registerFullName: document.querySelector("#registerFullName"),
  registerOrigin: document.querySelector("#registerOrigin"),
  registerPhone: document.querySelector("#registerPhone"),
  registerPassword: document.querySelector("#registerPassword"),
  registerConfirmPassword: document.querySelector("#registerConfirmPassword"),
  loginSubmitButton: document.querySelector("#loginSubmitButton"),
  forgotPasswordButton: document.querySelector("#forgotPasswordButton"),
  authorizedResetButton: document.querySelector("#authorizedResetButton"),
  resetRequestLogin: document.querySelector("#resetRequestLogin"),
  resetRequestError: document.querySelector("#resetRequestError"),
  cancelResetRequest: document.querySelector("#cancelResetRequest"),
  resetCompleteLogin: document.querySelector("#resetCompleteLogin"),
  resetCompleteCode: document.querySelector("#resetCompleteCode"),
  resetCompletePassword: document.querySelector("#resetCompletePassword"),
  resetCompleteConfirm: document.querySelector("#resetCompleteConfirm"),
  resetCompleteError: document.querySelector("#resetCompleteError"),
  cancelResetComplete: document.querySelector("#cancelResetComplete"),
  internalLogin: document.querySelector("#internalLogin"),
  masterPassword: document.querySelector("#masterPassword"),
  loginError: document.querySelector("#loginError"),
  newPassword: document.querySelector("#newPassword"),
  confirmPassword: document.querySelector("#confirmPassword"),
  passwordError: document.querySelector("#passwordError"),
  activeUser: document.querySelector("#activeUser"),
  logout: document.querySelector("#logout"),
  viewButtons: document.querySelectorAll("[data-view]"),
  views: document.querySelectorAll(".app-view"),
  form: document.querySelector("#orderForm"),
  submitOrder: document.querySelector("#submitOrder"),
  submitOrderButtons: document.querySelectorAll(".submit-order-button"),
  editingId: document.querySelector("#editingId"),
  formTitle: document.querySelector("#formTitle"),
  orderNumberPreview: document.querySelector("#orderNumberPreview"),
  requester: document.querySelector("#requester"),
  origin: document.querySelector("#origin"),
  priority: document.querySelector("#priority"),
  status: document.querySelector("#status"),
  notes: document.querySelector("#notes"),
  itemsList: document.querySelector("#itemsList"),
  itemTemplate: document.querySelector("#itemTemplate"),
  cancelEdit: document.querySelector("#cancelEdit"),
  exportCsv: document.querySelector("#exportCsv"),
  printReport: document.querySelector("#printReport"),
  exportPdf: document.querySelector("#exportPdf"),
  exportXlsx: document.querySelector("#exportXlsx"),
  searchInput: document.querySelector("#searchInput"),
  filterStatus: document.querySelector("#filterStatus"),
  filterPriority: document.querySelector("#filterPriority"),
  printManagementSummary: document.querySelector("#printManagementSummary"),
  printManagementAnalytical: document.querySelector("#printManagementAnalytical"),
  statusWidgets: document.querySelectorAll("[data-status-filter]"),
  widgetReceived: document.querySelector("#widgetReceived"),
  widgetProgress: document.querySelector("#widgetProgress"),
  widgetBathPrep: document.querySelector("#widgetBathPrep"),
  widgetPostBath: document.querySelector("#widgetPostBath"),
  widgetFinalPrep: document.querySelector("#widgetFinalPrep"),
  widgetDelivered: document.querySelector("#widgetDelivered"),
  dashboardDateFrom: document.querySelector("#dashboardDateFrom"),
  dashboardDateTo: document.querySelector("#dashboardDateTo"),
  dashboardFilterStatus: document.querySelector("#dashboardFilterStatus"),
  dashboardFilterOrigin: document.querySelector("#dashboardFilterOrigin"),
  dashboardFilterRequester: document.querySelector("#dashboardFilterRequester"),
  reportSearchInput: document.querySelector("#reportSearchInput"),
  reportFilterStatus: document.querySelector("#reportFilterStatus"),
  reportFilterPriority: document.querySelector("#reportFilterPriority"),
  ordersList: document.querySelector("#ordersList"),
  managementOrderDetail: document.querySelector("#managementOrderDetail"),
  collaboratorOrdersList: document.querySelector("#collaboratorOrdersList"),
  collaboratorOrderDetail: document.querySelector("#collaboratorOrderDetail"),
  refreshMyOrders: document.querySelector("#refreshMyOrders"),
  orderCount: document.querySelector("#orderCount"),
  priorityPieChart: document.querySelector("#priorityPieChart"),
  monthlyOriginChart: document.querySelector("#monthlyOriginChart"),
  originRankingChart: document.querySelector("#originRankingChart"),
  requesterRankingChart: document.querySelector("#requesterRankingChart"),
  metricTotal: document.querySelector("#metricTotal"),
  metricUrgent: document.querySelector("#metricUrgent"),
  metricOpen: document.querySelector("#metricOpen"),
  metricPieces: document.querySelector("#metricPieces"),
  reportBody: document.querySelector("#reportBody"),
  reportTotalOrders: document.querySelector("#reportTotalOrders"),
  reportOpenOrders: document.querySelector("#reportOpenOrders"),
  reportTotalPieces: document.querySelector("#reportTotalPieces"),
  dashboardBody: document.querySelector("#dashboardBody"),
  refreshMasterData: document.querySelector("#refreshMasterData"),
  masterAccessCount: document.querySelector("#masterAccessCount"),
  masterOrderHistoryCount: document.querySelector("#masterOrderHistoryCount"),
  masterTabButtons: document.querySelectorAll("[data-master-tab]"),
  masterPanes: document.querySelectorAll(".master-pane"),
  masterCostDateFrom: document.querySelector("#masterCostDateFrom"),
  masterCostDateTo: document.querySelector("#masterCostDateTo"),
  masterCostOrigin: document.querySelector("#masterCostOrigin"),
  masterCostRequester: document.querySelector("#masterCostRequester"),
  masterCostOrders: document.querySelector("#masterCostOrders"),
  masterCostPieces: document.querySelector("#masterCostPieces"),
  masterCostTotal: document.querySelector("#masterCostTotal"),
  masterCostBody: document.querySelector("#masterCostBody"),
  refreshUsers: document.querySelector("#refreshUsers"),
  refreshPasswordResets: document.querySelector("#refreshPasswordResets"),
  managementUserForm: document.querySelector("#managementUserForm"),
  managementUserRole: document.querySelector("#managementUserRole"),
  managementUserLogin: document.querySelector("#managementUserLogin"),
  managementUserName: document.querySelector("#managementUserName"),
  managementUserSector: document.querySelector("#managementUserSector"),
  managementUserPhone: document.querySelector("#managementUserPhone"),
  managementUserPassword: document.querySelector("#managementUserPassword"),
  managementUserSubmit: document.querySelector("#managementUserSubmit"),
  cancelManagementUserEdit: document.querySelector("#cancelManagementUserEdit"),
  masterUsersBody: document.querySelector("#masterUsersBody"),
  passwordResetRequestsBody: document.querySelector("#passwordResetRequestsBody"),
  refreshDatabase: document.querySelector("#refreshDatabase"),
  exportDatabase: document.querySelector("#exportDatabase"),
  databaseTableSelect: document.querySelector("#databaseTableSelect"),
  databaseOrdersCount: document.querySelector("#databaseOrdersCount"),
  databaseUsersCount: document.querySelector("#databaseUsersCount"),
  databasePricesCount: document.querySelector("#databasePricesCount"),
  databaseLogsCount: document.querySelector("#databaseLogsCount"),
  databasePreviewHead: document.querySelector("#databasePreviewHead"),
  databasePreviewBody: document.querySelector("#databasePreviewBody"),
  accessLogsBody: document.querySelector("#accessLogsBody"),
  orderHistoryBody: document.querySelector("#orderHistoryBody"),
  costSettingsForm: document.querySelector("#costSettingsForm"),
  costGoldValue: document.querySelector("#costGoldValue"),
  costRhodiumValue: document.querySelector("#costRhodiumValue"),
  costRhodiumFactor: document.querySelector("#costRhodiumFactor"),
  priceForm: document.querySelector("#priceForm"),
  priceModel: document.querySelector("#priceModel"),
  priceSize: document.querySelector("#priceSize"),
  priceValue: document.querySelector("#priceValue"),
  priceWeight: document.querySelector("#priceWeight"),
  priceGoldThousandth: document.querySelector("#priceGoldThousandth"),
  pricesBody: document.querySelector("#pricesBody"),
};

init();

async function init() {
  populateOriginOptions();
  populateStatusOptions();
  populatePriceOptions();
  populateRegisterOriginOptions();
  try {
    orders = await loadOrders(false);
    await loadCostData();
  } catch (error) {
    orders = [];
    apiAvailable = false;
    console.error(error);
  }
  applySessionState();

  elements.loginForm.addEventListener("submit", handleLogin);
  elements.resetRequestForm?.addEventListener("submit", submitPasswordResetRequest);
  elements.resetCompleteForm?.addEventListener("submit", submitAuthorizedPasswordReset);
  elements.passwordForm.addEventListener("submit", handlePasswordChange);
  elements.forgotPasswordButton?.addEventListener("click", requestPasswordReset);
  elements.authorizedResetButton?.addEventListener("click", completeAuthorizedPasswordReset);
  elements.cancelResetRequest?.addEventListener("click", () => showResetMode("login"));
  elements.cancelResetComplete?.addEventListener("click", () => showResetMode("login"));
  document.querySelectorAll("[data-login-mode]").forEach((button) => {
    button.addEventListener("click", () => setLoginMode(button.dataset.loginMode));
  });
  document.querySelectorAll("[data-collaborator-access]").forEach((button) => {
    button.addEventListener("click", () => setCollaboratorAccessMode(button.dataset.collaboratorAccess));
  });
  elements.logout.addEventListener("click", logout);
  elements.form.addEventListener("submit", handleSubmit);
  elements.cancelEdit.addEventListener("click", resetForm);
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.printReport.addEventListener("click", () => window.print());
  elements.exportPdf.addEventListener("click", () => window.print());
  elements.exportXlsx.addEventListener("click", exportXlsx);
  elements.searchInput.addEventListener("input", render);
  elements.filterStatus.addEventListener("change", render);
  elements.filterPriority.addEventListener("change", render);
  elements.printManagementSummary?.addEventListener("click", () => printManagementOrders("summary"));
  elements.printManagementAnalytical?.addEventListener("click", () => printManagementOrders("analytical"));
  elements.statusWidgets.forEach((button) => {
    button.addEventListener("click", () => applyStatusWidgetFilter(button.dataset.statusFilter));
  });
  elements.dashboardDateFrom.addEventListener("change", render);
  elements.dashboardDateTo.addEventListener("change", render);
  elements.dashboardFilterStatus.addEventListener("change", render);
  elements.dashboardFilterOrigin.addEventListener("change", render);
  elements.dashboardFilterRequester.addEventListener("input", render);
  elements.reportSearchInput.addEventListener("input", renderReports);
  elements.reportFilterStatus.addEventListener("change", renderReports);
  elements.reportFilterPriority.addEventListener("change", renderReports);
  elements.refreshMyOrders?.addEventListener("click", refreshOrders);
  elements.refreshMasterData?.addEventListener("click", loadMasterData);
  elements.refreshUsers?.addEventListener("click", loadMasterUsers);
  elements.refreshPasswordResets?.addEventListener("click", loadPasswordResetRequests);
  elements.managementUserForm?.addEventListener("submit", handleManagementUserSubmit);
  elements.cancelManagementUserEdit?.addEventListener("click", resetManagementUserFormMode);
  elements.refreshDatabase?.addEventListener("click", loadMasterDatabase);
  elements.exportDatabase?.addEventListener("click", exportMasterDatabase);
  elements.databaseTableSelect?.addEventListener("change", renderDatabasePreview);
  elements.masterTabButtons.forEach((button) => {
    button.addEventListener("click", () => showMasterTab(button.dataset.masterTab));
  });
  elements.masterCostDateFrom?.addEventListener("change", renderMasterPanel);
  elements.masterCostDateTo?.addEventListener("change", renderMasterPanel);
  elements.masterCostOrigin?.addEventListener("change", renderMasterPanel);
  elements.masterCostRequester?.addEventListener("input", renderMasterPanel);
  elements.costSettingsForm?.addEventListener("submit", handleCostSettingsSubmit);
  elements.priceForm?.addEventListener("submit", handlePriceSubmit);
  elements.priceModel?.addEventListener("change", () => populatePriceSizeOptions());
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });
  document.querySelector(".app-nav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) showView(button.dataset.view);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      loadOrders(false).then((nextOrders) => {
        orders = nextOrders;
        render();
      });
    }
  });
  window.setInterval(refreshOrders, 4000);
}

function loadSession() {
  const saved = sessionStorage.getItem(SESSION_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    return parsed?.name ? parsed : null;
  } catch {
    return null;
  }
}

function loadUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  if (!saved) return defaultUsers;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? normalizeUsers(parsed) : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function normalizeUsers(userList) {
  const legacyRoleMap = { admin: "master", operator: "consultant" };
  const normalized = userList.map((user) => ({ ...user, role: legacyRoleMap[user.role] || user.role }));
  const byLogin = new Map(defaultUsers.map((user) => [normalizeText(user.login), user]));
  normalized.forEach((user) => byLogin.set(normalizeText(user.login), { ...byLogin.get(normalizeText(user.login)), ...user }));
  return [...byLogin.values()];
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session) {
  currentSession = session;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  applySessionState();
  logAccess(session);
}

async function handleLogin(event) {
  event.preventDefault();
  if (activeLoginMode === "consultant" || activeLoginMode === "master") {
    await handleInternalLogin();
    return;
  }

  if (collaboratorAccessMode === "register") {
    await handleCollaboratorRegistration();
    return;
  }

  await handleCollaboratorLogin();
  return;

  const name = elements.loginName.value.trim();
  const phone = normalizeLoginPhone(elements.loginPhone.value);

  if (!name) {
    showLoginError("Informe o nome do solicitante.");
    return;
  }

  if (!isValidBrazilMobile(phone)) {
    showLoginError("Informe um celular v\u00e1lido com DDD e 9 d\u00edgitos. Exemplo: (11) 99999-9999. Esse n\u00famero ser\u00e1 usado para avisos do WhatsApp.");
    return;
  }

  const knownNames = await findKnownNamesForPhone(phone);
  const differentNames = knownNames.filter((knownName) => normalizeText(knownName) !== normalizeText(name));
  if (differentNames.length) {
    const previousNames = differentNames.slice(0, 3).join(", ");
    alert(`Aten\u00e7\u00e3o: este celular j\u00e1 possui hist\u00f3rico no sistema vinculado a: ${previousNames}.\n\nPara manter a consulta dos pedidos e os avisos por WhatsApp corretos, use sempre este mesmo n\u00famero quando for voc\u00ea realizando a solicita\u00e7\u00e3o.`);
    await logAccess(
      { name, phone, role: "collaborator", login: name },
      "alerta_nome_celular",
      { previousNames: differentNames, message: "Celular j\u00e1 utilizado com outro nome de colaborador." }
    );
  }

  saveSession({ name, phone, role: "collaborator" });
}

async function handleCollaboratorLogin() {
  const login = elements.collaboratorLogin.value.trim();
  const password = elements.collaboratorPassword.value;

  if (!login || !password) {
    showLoginError("Informe usu\u00e1rio e senha para entrar.");
    return;
  }

  let user = null;
  try {
    user = await authenticateInternalUser(login, password, "collaborator");
  } catch (error) {
    showLoginError(error.message);
    return;
  }

  if (!user) {
    showLoginError("Usu\u00e1rio ou senha inv\u00e1lidos.");
    return;
  }

  if (user.mustChangePassword) {
    pendingUser = { ...user, currentPassword: password, accessMode: activeLoginMode };
    elements.entryScreen.hidden = true;
    elements.passwordScreen.hidden = false;
    return;
  }

  saveSession({
    name: user.name,
    phone: user.phone,
    origin: user.origin,
    role: "collaborator",
    login: user.login,
    accessMode: "collaborator",
  });
}

async function handleCollaboratorRegistration() {
  const login = elements.registerLogin.value.trim();
  const name = elements.registerFullName.value.trim();
  const origin = elements.registerOrigin.value;
  const phone = normalizeLoginPhone(elements.registerPhone.value);
  const password = elements.registerPassword.value;
  const confirmPassword = elements.registerConfirmPassword.value;

  if (!login || !name || !origin || !phone || !password || !confirmPassword) {
    showLoginError("Preencha todos os campos para criar o acesso.");
    return;
  }
  if (!name.includes(" ")) {
    showLoginError("Informe o nome completo do colaborador.");
    return;
  }
  if (!isValidBrazilMobile(phone)) {
    showLoginError("Informe um telefone corporativo v\u00e1lido com DDD e 9 d\u00edgitos. Exemplo: (11) 99999-9999.");
    return;
  }
  if (password.length < 4) {
    showLoginError("A senha deve ter pelo menos 4 caracteres.");
    return;
  }
  if (password !== confirmPassword) {
    showLoginError("A confirma\u00e7\u00e3o de senha n\u00e3o confere.");
    return;
  }

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, name, origin, phone, password, role: "collaborator" }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      showLoginError(payload.error || "N\u00e3o foi poss\u00edvel criar o acesso.");
      return;
    }
    setCollaboratorAccessMode("login");
    elements.collaboratorLogin.value = login;
    elements.collaboratorPassword.value = "";
    elements.registerLogin.value = "";
    elements.registerFullName.value = "";
    elements.registerOrigin.value = "";
    elements.registerPhone.value = "";
    elements.registerPassword.value = "";
    elements.registerConfirmPassword.value = "";
    showLoginError("Acesso criado. Digite sua senha para entrar.");
  } catch (error) {
    showLoginError(error.message || "N\u00e3o foi poss\u00edvel criar o acesso.");
  }
}

async function handleInternalLogin() {
  const login = elements.internalLogin.value.trim();
  const password = elements.masterPassword.value;
  let user = null;
  try {
    user = await authenticateInternalUser(login, password, activeLoginMode);
    if (!user && activeLoginMode === "consultant") {
      user = await authenticateInternalUser(login, password, "master");
    }
  } catch (error) {
    showLoginError(error.message);
    return;
  }

  if (!user) {
    showLoginError("Login ou senha inv\u00e1lidos.");
    return;
  }

  if (user.mustChangePassword) {
    pendingUser = { ...user, currentPassword: password };
    elements.entryScreen.hidden = true;
    elements.passwordScreen.hidden = false;
    return;
  }

  if (user.role === "master" && activeLoginMode === "master") {
    masterCredential = { login, password };
  }
  saveSession({ name: user.name, role: user.role, login: user.login, accessMode: activeLoginMode });
}

async function authenticateInternalUser(login, password, role) {
  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password, role }),
    });
    if (response.ok) {
      const payload = await response.json();
      return payload.user;
    }
    const payload = await response.json().catch(() => ({}));
    if (response.status >= 500 && payload.error) throw new Error(payload.error);
    return null;
  } catch {
    const user = users.find((item) => normalizeText(item.login) === normalizeText(login));
    if (!user || user.password !== password || user.role !== role) return null;
    return user;
  }
}

async function findKnownNamesForPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  let phoneOrders = orders.filter((order) => normalizePhone(order.phone) === normalizedPhone);

  if (location.protocol.startsWith("http")) {
    try {
      const response = await fetch(`/api/status?phone=${encodeURIComponent(normalizedPhone)}`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) phoneOrders = data;
      }
    } catch {
      // Use the locally loaded orders if the status endpoint is temporarily unavailable.
    }
  }

  const names = phoneOrders.map((order) => order.requester).filter(Boolean);
  return [...new Set(names)];
}

function showLoginError(message) {
  elements.loginError.textContent = message;
}

function setLoginMode(mode) {
  activeLoginMode = mode;
  elements.loginError.textContent = "";
  elements.commonLoginTab.classList.toggle("active", mode === "common");
  elements.consultantLoginTab.classList.toggle("active", mode === "consultant");
  elements.masterLoginTab.classList.toggle("active", mode === "master");
  elements.commonLoginFields.classList.toggle("active-login-mode", mode === "common");
  elements.internalLoginFields.classList.toggle("active-login-mode", mode === "consultant" || mode === "master");
  elements.internalLogin.value = "";
  elements.masterPassword.value = "";
  if (elements.loginName) elements.loginName.value = "";
  if (elements.loginPhone) elements.loginPhone.value = "";
  if (mode === "common") setCollaboratorAccessMode(collaboratorAccessMode);
  elements.loginSubmitButton.textContent = mode === "common" && collaboratorAccessMode === "register" ? "Criar acesso" : "Entrar";
}

function setCollaboratorAccessMode(mode) {
  collaboratorAccessMode = mode;
  elements.loginError.textContent = "";
  elements.collaboratorLoginAccess?.classList.toggle("active", mode === "login");
  elements.collaboratorNewAccess?.classList.toggle("active", mode === "register");
  elements.collaboratorLoginFields?.classList.toggle("active-collaborator-mode", mode === "login");
  elements.collaboratorRegisterFields?.classList.toggle("active-collaborator-mode", mode === "register");
  elements.loginSubmitButton.textContent = mode === "register" ? "Criar acesso" : "Entrar";
}

async function handlePasswordChange(event) {
  event.preventDefault();
  const password = elements.newPassword.value;
  const confirmation = elements.confirmPassword.value;

  if (!pendingUser) return;

  if (password !== confirmation) {
    elements.passwordError.textContent = "As senhas n\u00e3o conferem.";
    return;
  }

  if (password === "12345") {
    elements.passwordError.textContent = "Escolha uma senha diferente da provis\u00f3ria.";
    return;
  }

  try {
    const response = await fetch("/api/users/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: pendingUser.login,
        currentPassword: pendingUser.currentPassword,
        newPassword: password,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      elements.passwordError.textContent = payload.error || "N\u00e3o foi poss\u00edvel trocar a senha.";
      return;
    }
    const accessMode = pendingUser?.accessMode || payload.user.role;
    pendingUser = null;
    elements.passwordForm.reset();
    if (payload.user.role === "master" && accessMode === "master") {
      masterCredential = { login: payload.user.login, password };
    }
    saveSession({
      name: payload.user.name,
      role: payload.user.role,
      login: payload.user.login,
      phone: payload.user.phone || "",
      origin: payload.user.origin || "",
      accessMode,
    });
  } catch (error) {
    users = users.map((user) =>
      user.login === pendingUser.login ? { ...user, password, mustChangePassword: false } : user
    );
    saveUsers();
    const user = users.find((item) => item.login === pendingUser.login);
    const accessMode = pendingUser?.accessMode || user?.role || "";
    pendingUser = null;
    elements.passwordForm.reset();
    if (user) saveSession({ name: user.name, role: user.role, login: user.login, phone: user.phone || "", origin: user.origin || "", accessMode });
    else elements.passwordError.textContent = error.message;
  }
}

async function requestPasswordReset() {
  showResetMode("request");
}

async function submitPasswordResetRequest(event) {
  event.preventDefault();
  const trimmedLogin = elements.resetRequestLogin.value.trim();
  if (!trimmedLogin) {
    elements.resetRequestError.textContent = "Informe o usu\u00e1rio/login para solicitar a redefini\u00e7\u00e3o.";
    return;
  }

  try {
    const response = await fetch(`${API_PASSWORD_RESET_URL}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: trimmedLogin }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel registrar a solicita\u00e7\u00e3o.");
    alert(`${payload.message}\n\nC\u00f3digo da solicita\u00e7\u00e3o: ${payload.requestCode}\n\nGuarde este c\u00f3digo. Ap\u00f3s aprova\u00e7\u00e3o do administrador, informe o c\u00f3digo para criar sua nova senha.`);
    elements.resetRequestForm.reset();
    showResetMode("complete");
    elements.resetCompleteLogin.value = trimmedLogin;
    if (payload.whatsappUrl) openExternalLink(payload.whatsappUrl);
  } catch (error) {
    elements.resetRequestError.textContent = error.message || "N\u00e3o foi poss\u00edvel registrar a solicita\u00e7\u00e3o.";
  }
}

async function completeAuthorizedPasswordReset() {
  showResetMode("complete");
}

async function submitAuthorizedPasswordReset(event) {
  event.preventDefault();
  const login = elements.resetCompleteLogin.value.trim();
  const requestCode = elements.resetCompleteCode.value.trim();
  const newPassword = elements.resetCompletePassword.value;
  const confirmation = elements.resetCompleteConfirm.value;

  if (!login || !requestCode || !newPassword) {
    elements.resetCompleteError.textContent = "Informe usu\u00e1rio, c\u00f3digo e nova senha.";
    return;
  }
  if (newPassword !== confirmation) {
    elements.resetCompleteError.textContent = "As senhas n\u00e3o conferem.";
    return;
  }

  try {
    const response = await fetch(`${API_PASSWORD_RESET_URL}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: login.trim(), requestCode: requestCode.trim(), newPassword }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel redefinir a senha.");
    alert("Senha redefinida com sucesso. Entre novamente com sua nova senha.");
    elements.resetCompleteForm.reset();
    showResetMode("login");
    elements.collaboratorLogin.value = payload.user?.login || login.trim();
    elements.collaboratorPassword.value = "";
  } catch (error) {
    elements.resetCompleteError.textContent = error.message || "N\u00e3o foi poss\u00edvel redefinir a senha.";
  }
}

function showResetMode(mode) {
  elements.loginError.textContent = "";
  elements.resetRequestError.textContent = "";
  elements.resetCompleteError.textContent = "";
  elements.loginForm.hidden = mode !== "login";
  elements.resetRequestForm.hidden = mode !== "request";
  elements.resetCompleteForm.hidden = mode !== "complete";
  if (mode === "request") elements.resetRequestLogin.focus();
  if (mode === "complete") elements.resetCompleteLogin.focus();
}

function applySessionState() {
  const isLoggedIn = Boolean(currentSession?.name);
  elements.entryScreen.hidden = isLoggedIn;
  elements.passwordScreen.hidden = true;
  elements.appShell.hidden = !isLoggedIn;

  if (!isLoggedIn) return;

  elements.activeUser.textContent = `Conectado: ${currentSession.name}`;
  document.body.classList.toggle("is-admin", isInternalUser());
  document.body.classList.toggle("is-master", isMasterWorkspaceUser());
  document.body.classList.toggle("is-collaborator", currentSession.role === "collaborator");
  showView(isInternalUser() ? "managementView" : "requestView");
  resetForm();
  if (isMasterWorkspaceUser()) loadMasterData();
  render();
}

function showView(viewId) {
  if (viewId === "masterView" && !isMasterWorkspaceUser()) viewId = "managementView";
  elements.views.forEach((view) => view.classList.toggle("active-view", view.id === viewId));
  elements.viewButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
}

window.showView = showView;

function showMasterTab(tabId) {
  elements.masterTabButtons.forEach((button) => button.classList.toggle("active", button.dataset.masterTab === tabId));
  elements.masterPanes.forEach((pane) => pane.classList.toggle("active-master-pane", pane.id === tabId));
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  currentSession = null;
  masterCredential = null;
  masterUsers = [];
  masterDatabase = null;
  elements.loginError.textContent = "";
  elements.masterPassword.value = "";
  if (elements.loginPhone) elements.loginPhone.value = "";
  elements.collaboratorPassword.value = "";
  elements.appShell.hidden = true;
  elements.passwordScreen.hidden = true;
  elements.entryScreen.hidden = false;
  document.body.classList.remove("is-admin");
  document.body.classList.remove("is-master");
  document.body.classList.remove("is-collaborator");
  elements.collaboratorLogin?.focus();
}

function populateOriginOptions() {
  for (const origin of origins) {
    elements.origin.append(new Option(origin, origin));
    elements.dashboardFilterOrigin.append(new Option(origin, origin));
  }
}

function populateRegisterOriginOptions() {
  if (!elements.registerOrigin) return;
  origins.forEach((origin) => elements.registerOrigin.append(new Option(origin, origin)));
}

function populateStatusOptions() {
  for (const status of statuses) {
    elements.status.append(new Option(status, status));
    elements.filterStatus.append(new Option(status, status));
    elements.reportFilterStatus.append(new Option(status, status));
    elements.dashboardFilterStatus.append(new Option(status, status));
  }
}

function populatePriceOptions() {
  if (!elements.priceModel) return;
  elements.priceModel.innerHTML = '<option value="">Selecione</option>';
  Object.keys(partSizes).forEach((model) => elements.priceModel.append(new Option(model, model)));
  populateMasterCostOrigins();
  populatePriceSizeOptions();
}

function populateMasterCostOrigins() {
  if (!elements.masterCostOrigin) return;
  const selected = elements.masterCostOrigin.value;
  elements.masterCostOrigin.innerHTML = '<option value="">Todas</option>';
  origins.forEach((origin) => elements.masterCostOrigin.append(new Option(origin, origin)));
  elements.masterCostOrigin.value = selected;
}

function populatePriceSizeOptions(selectedSize = "") {
  if (!elements.priceSize) return;
  const sizes = partSizes[elements.priceModel.value] || [];
  elements.priceSize.innerHTML = '<option value="">Selecione</option>';
  sizes.forEach((size) => elements.priceSize.append(new Option(size, size)));
  elements.priceSize.value = selectedSize;
}

async function refreshOrders() {
  if (!currentSession?.name || !apiAvailable) return;
  try {
    orders = await loadOrders(false);
    render();
  } catch (error) {
    apiAvailable = false;
    console.error(error);
  }
}

async function loadOrders(seedWhenEmpty = true) {
  if (location.protocol.startsWith("http")) {
    try {
      const response = await fetch(API_ORDERS_URL, { cache: "no-store" });
      if (response.ok) {
        apiAvailable = true;
        const serverOrders = await response.json();
        return Array.isArray(serverOrders) ? normalizeOrders(serverOrders) : [];
      }
      apiAvailable = false;
      throw new Error(await apiErrorMessage(response));
    } catch (error) {
      apiAvailable = false;
      throw error;
    }
  }

  const localOrders = loadLocalOrders();
  return normalizeOrders(localOrders.length ? localOrders : sampleOrders);
}

function loadLocalOrders() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function apiErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload?.error) return payload.error;
  } catch {
    // Keep the fallback message below when the server did not return JSON.
  }
  return `Erro ${response.status} ao comunicar com o servidor.`;
}

async function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  if (!apiAvailable) return;

  try {
    const response = await fetch(API_ORDERS_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orders),
    });
    apiAvailable = response.ok;
  } catch {
    apiAvailable = false;
  }
}

async function saveOrder(order) {
  orders = orders.some((item) => item.id === order.id)
    ? orders.map((item) => (item.id === order.id ? { ...item, ...order } : item))
    : [order, ...orders];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  if (!apiAvailable) return order;

  try {
    const response = await fetch(API_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    apiAvailable = response.ok;
    if (response.ok) return await response.json();
  } catch {
    apiAvailable = false;
  }

  return order;
}

async function createOrder(order) {
  const fallbackOrder = { ...order, id: order.id || nextOrderId() };

  if (!apiAvailable) {
    if (location.protocol.startsWith("http")) {
      throw new Error("API indispon\u00edvel. Confira a conex\u00e3o do Render com o Supabase.");
    }
    orders = [fallbackOrder, ...orders];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return fallbackOrder;
  }

  try {
    const response = await fetch(API_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    apiAvailable = response.ok;
    if (response.ok) {
      const savedOrder = await response.json();
      orders = [savedOrder, ...orders.filter((item) => item.id !== savedOrder.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      return savedOrder;
    }
    throw new Error(await apiErrorMessage(response));
  } catch (error) {
    apiAvailable = false;
    if (location.protocol.startsWith("http")) throw error;
  }

  orders = [fallbackOrder, ...orders];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return fallbackOrder;
}

async function patchOrder(id, updates) {
  orders = orders.map((order) => (order.id === id ? { ...order, ...updates } : order));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  if (!apiAvailable) {
    if (location.protocol.startsWith("http")) {
      throw new Error("API indispon\u00edvel. Confira a conex\u00e3o do Render com o Supabase.");
    }
    return orders.find((order) => order.id === id);
  }

  try {
    const response = await fetch(`${API_ORDERS_URL}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    apiAvailable = response.ok;
    if (response.ok) return await response.json();
    throw new Error(await apiErrorMessage(response));
  } catch (error) {
    apiAvailable = false;
    if (location.protocol.startsWith("http")) throw error;
  }

  return orders.find((order) => order.id === id);
}

async function removeOrder(id) {
  orders = orders.filter((order) => order.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  if (!apiAvailable) {
    if (location.protocol.startsWith("http")) {
      throw new Error("API indispon\u00edvel. Confira a conex\u00e3o do Render com o Supabase.");
    }
    return;
  }

  try {
    const response = await fetch(`${API_ORDERS_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    apiAvailable = response.ok;
    if (!response.ok) throw new Error(await apiErrorMessage(response));
  } catch (error) {
    apiAvailable = false;
    if (location.protocol.startsWith("http")) throw error;
  }
}

async function logAccess(session, eventType = "login", details = {}) {
  if (!location.protocol.startsWith("http")) return;
  try {
    await fetch(API_ACCESS_LOGS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: session.name,
        login: session.login || session.name,
        role: session.role,
        phone: session.phone || "",
        origin: location.href,
        userAgent: navigator.userAgent,
        eventType,
        details,
      }),
    });
  } catch {
    // Access logs are audit support; login should not fail if logging is unavailable.
  }
}

async function loadMasterData() {
  if (!isMasterUser()) return;
  try {
    const [logsResponse, pricesResponse, settingsResponse] = await Promise.all([
      fetch(API_ACCESS_LOGS_URL, { cache: "no-store" }),
      fetch(API_PRICES_URL, { cache: "no-store" }),
      fetch(API_COST_SETTINGS_URL, { cache: "no-store" }),
    ]);
    if (logsResponse.ok) accessLogs = await logsResponse.json();
    if (pricesResponse.ok) prices = await pricesResponse.json();
    if (settingsResponse.ok) costSettings = normalizeCostSettings(await settingsResponse.json());
  } catch (error) {
    console.error(error);
  }
  await loadMasterUsers(false);
  await loadPasswordResetRequests(false);
  renderMasterPanel();
}

async function loadMasterUsers(shouldRender = true) {
  if (!isMasterUser() || !masterCredential) {
    if (elements.masterUsersBody) {
      elements.masterUsersBody.innerHTML = '<tr><td colspan="9">Entre novamente como Master para carregar os usu\u00e1rios.</td></tr>';
    }
    return;
  }

  try {
    const response = await fetch("/api/users/admin-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ master: masterCredential }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel carregar usu\u00e1rios.");
    masterUsers = Array.isArray(payload.users) ? payload.users : [];
    if (shouldRender) renderMasterPanel();
  } catch (error) {
    masterUsers = [];
    if (elements.masterUsersBody) {
      elements.masterUsersBody.innerHTML = `<tr><td colspan="9">${error.message}</td></tr>`;
    }
  }
}

async function loadPasswordResetRequests(shouldRender = true) {
  if (!isMasterUser() || !masterCredential) {
    if (elements.passwordResetRequestsBody) {
      elements.passwordResetRequestsBody.innerHTML = '<tr><td colspan="6">Entre novamente como Master para carregar as solicita\u00e7\u00f5es.</td></tr>';
    }
    return;
  }

  try {
    const response = await fetch(`${API_PASSWORD_RESET_URL}/admin-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ master: masterCredential }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel carregar solicita\u00e7\u00f5es.");
    passwordResetRequests = Array.isArray(payload.requests) ? payload.requests : [];
    if (shouldRender) renderMasterPanel();
  } catch (error) {
    passwordResetRequests = [];
    if (elements.passwordResetRequestsBody) {
      elements.passwordResetRequestsBody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
  }
}

async function loadMasterDatabase() {
  if (!isMasterUser() || !masterCredential) {
    renderDatabaseAccessMessage("Entre novamente como Master para acessar a base de dados.");
    return;
  }

  try {
    const response = await fetch("/api/admin/database", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ master: masterCredential }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel carregar a base de dados.");
    masterDatabase = payload.database;
    renderDatabaseSummary();
    renderDatabasePreview();
  } catch (error) {
    masterDatabase = null;
    renderDatabaseAccessMessage(error.message);
  }
}

function renderDatabaseAccessMessage(message) {
  if (elements.databasePreviewHead) elements.databasePreviewHead.innerHTML = "";
  if (elements.databasePreviewBody) elements.databasePreviewBody.innerHTML = `<tr><td>${message}</td></tr>`;
}

function renderDatabaseSummary() {
  if (!elements.databaseOrdersCount) return;
  elements.databaseOrdersCount.textContent = masterDatabase?.orders?.length || 0;
  elements.databaseUsersCount.textContent = masterDatabase?.users?.length || 0;
  elements.databasePricesCount.textContent = masterDatabase?.prices?.length || 0;
  elements.databaseLogsCount.textContent = masterDatabase?.accessLogs?.length || 0;
}

function renderDatabasePreview() {
  if (!elements.databasePreviewHead || !elements.databasePreviewBody) return;
  if (!masterDatabase) {
    renderDatabaseAccessMessage("Clique em Atualizar para carregar a base de dados.");
    return;
  }

  const table = elements.databaseTableSelect?.value || "orders";
  const rows = databaseRows(table).slice(0, 80);
  const columns = databaseColumns(table);
  elements.databasePreviewHead.innerHTML = `<tr>${columns.map((column) => `<th>${column.label}</th>`).join("")}</tr>`;
  elements.databasePreviewBody.innerHTML = "";

  if (!rows.length) {
    elements.databasePreviewBody.innerHTML = `<tr><td colspan="${columns.length}">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = columns.map((column) => `<td>${formatDatabaseValue(row[column.key])}</td>`).join("");
    elements.databasePreviewBody.append(tr);
  });
}

function databaseRows(table) {
  if (table === "costSettings") return [masterDatabase?.costSettings || {}];
  return Array.isArray(masterDatabase?.[table]) ? masterDatabase[table] : [];
}

function databaseColumns(table) {
  const columns = {
    orders: [
      { key: "id", label: "Pedido" },
      { key: "requestDate", label: "Data" },
      { key: "requester", label: "Solicitante" },
      { key: "origin", label: "Loja" },
      { key: "status", label: "Status" },
      { key: "itemsCount", label: "Itens" },
      { key: "pieces", label: "Pe\u00e7as" },
    ],
    users: [
      { key: "login", label: "Login" },
      { key: "name", label: "Nome" },
      { key: "role", label: "Perfil" },
      { key: "origin", label: "Origem" },
      { key: "phone", label: "Celular" },
      { key: "mustChangePassword", label: "Troca senha" },
      { key: "active", label: "Ativo" },
    ],
    prices: [
      { key: "model", label: "Modelo" },
      { key: "size", label: "Tamanho" },
      { key: "bath", label: "Tipo" },
      { key: "unitCost", label: "Custo" },
      { key: "weight", label: "Peso" },
    ],
    accessLogs: [
      { key: "createdAt", label: "Data/Hora" },
      { key: "userName", label: "Usu\u00e1rio" },
      { key: "login", label: "Login" },
      { key: "role", label: "Perfil" },
      { key: "eventType", label: "Evento" },
    ],
    costSettings: [
      { key: "goldValue", label: "Ouro" },
      { key: "rhodiumValue", label: "R\u00f3dio" },
      { key: "rhodiumFactor", label: "Fator R\u00f3dio" },
    ],
  };
  return columns[table] || columns.orders;
}

function formatDatabaseValue(value) {
  if (Array.isArray(value)) return `${value.length} registro(s)`;
  if (value && typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Sim" : "N\u00e3o";
  return value ?? "";
}

function exportMasterDatabase() {
  if (!masterDatabase) {
    alert("Carregue a base de dados antes de exportar.");
    return;
  }
  const blob = new Blob([JSON.stringify(masterDatabase, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadUrl(url, `veri-base-dados-${todayIso}.json`, true);
}

async function loadCostData() {
  if (!location.protocol.startsWith("http")) return;
  try {
    const [pricesResponse, settingsResponse] = await Promise.all([
      fetch(API_PRICES_URL, { cache: "no-store" }),
      fetch(API_COST_SETTINGS_URL, { cache: "no-store" }),
    ]);
    if (pricesResponse.ok) prices = await pricesResponse.json();
    if (settingsResponse.ok) costSettings = normalizeCostSettings(await settingsResponse.json());
  } catch (error) {
    console.error(error);
  }
}

async function savePrices() {
  const response = await fetch(API_PRICES_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prices),
  });
  if (!response.ok) throw new Error(await apiErrorMessage(response));
}

async function saveCostSettings() {
  const response = await fetch(API_COST_SETTINGS_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(costSettings),
  });
  if (!response.ok) throw new Error(await apiErrorMessage(response));
}

async function handleCostSettingsSubmit(event) {
  event.preventDefault();
  if (!isMasterUser()) return;

  costSettings = normalizeCostSettings({
    goldValue: elements.costGoldValue.value,
    rhodiumValue: elements.costRhodiumValue.value,
    rhodiumFactor: elements.costRhodiumFactor.value,
  });

  try {
    await saveCostSettings();
    await loadMasterData();
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel salvar os par\u00e2metros.\n\n${error.message}`);
  }
}

async function handlePriceSubmit(event) {
  event.preventDefault();
  if (!isMasterUser()) return;

  const price = {
    model: elements.priceModel.value,
    size: elements.priceSize.value,
    bath: "Bruto",
    unitCost: Number(elements.priceValue.value || 0),
    weight: Number(elements.priceWeight.value || 0),
    goldThousandth: Number(elements.priceGoldThousandth.value || 0),
  };

  prices = [
    price,
    ...prices.filter(
      (item) => !(item.model === price.model && item.size === price.size)
    ),
  ];

  try {
    await savePrices();
    elements.priceForm.reset();
    populatePriceSizeOptions();
    await loadMasterData();
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel salvar o pre\u00e7o.\n\n${error.message}`);
  }
}

async function deletePrice(index) {
  if (!isMasterUser()) return;
  prices.splice(index, 1);
  try {
    await savePrices();
    renderMasterPanel();
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel excluir o pre\u00e7o.\n\n${error.message}`);
  }
}

async function deletePiecePrice(model, size) {
  if (!isMasterUser()) return;
  prices = prices.filter((price) => !(price.model === model && price.size === size));
  try {
    await savePrices();
    renderMasterPanel();
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel excluir o pre\u00e7o.\n\n${error.message}`);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!currentSession?.name) return;
  if (isSubmittingOrder) return;

  isSubmittingOrder = true;
  setSubmitButtonState(true);

  try {
    orders = await loadOrders();

    const items = getItemsFromForm();

    if (!items.length) {
      alert("Adicione pelo menos um item ao pedido.");
      return;
    }

    await loadCostData();

    const existingId = elements.editingId.value;
    const requester = isInternalUser() ? elements.requester.value.trim() : currentSession.name;
    const existingOrder = existingId ? orders.find((item) => item.id === existingId) : null;
    const pricedItems = enrichItemsForOrder(items, existingOrder);
    const order = {
      requestDate: existingOrder?.requestDate || todayIso,
      requester,
      phone: currentSession.role === "collaborator" ? currentSession.phone : existingOrder?.phone || "",
      origin: elements.origin.value,
      priority: elements.priority.value,
      dueDate: existingOrder?.dueDate || "",
      status: isInternalUser() ? elements.status.value : statuses[0],
      notes: elements.notes.value.trim(),
      items: pricedItems,
      updatedBy: currentSession.name,
      updatedByRole: currentSession.role,
    };

    const savedOrder = existingId ? await patchOrder(existingId, { ...order, id: existingId }) : await createOrder(order);

    if (currentSession.role === "collaborator") {
      alert(`Pedido ${savedOrder.id} finalizado com sucesso.`);
      resetForm();
      await refreshOrders();
      return;
    }

    resetForm();
    showView("managementView");
    render();
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel finalizar o pedido.\n\n${error.message}`);
  } finally {
    isSubmittingOrder = false;
    setSubmitButtonState(false);
  }
}

function setSubmitButtonState(isBusy) {
  const buttons = elements.submitOrderButtons?.length ? elements.submitOrderButtons : [elements.submitOrder].filter(Boolean);
  buttons.forEach((button) => {
    button.disabled = isBusy;
    button.textContent = isBusy ? "Finalizando..." : "Finalizar pedido";
  });
}

function getItemsFromForm() {
  return [...elements.itemsList.querySelectorAll(".item-row")]
    .map((row) => ({
      model: row.querySelector(".item-model").value.trim(),
      size: row.querySelector(".item-size").value,
      bath: row.querySelector(".item-bath").value,
      quantity: Number(row.querySelector(".item-quantity").value),
    }))
    .filter((item) => item.model && item.quantity > 0);
}

function enrichItemsForOrder(items, existingOrder) {
  const remainingExistingItems = [...(existingOrder?.items || [])];
  return items.map((item) => {
    const existingIndex = remainingExistingItems.findIndex((current) => sameItemIdentity(current, item));
    if (existingIndex >= 0) {
      const existingItem = remainingExistingItems.splice(existingIndex, 1)[0];
      return recalculateExistingItemCost(item, existingItem);
    }
    return enrichItemCost(item);
  });
}

function sameItemIdentity(a, b) {
  return a.model === b.model && a.size === b.size && normalizeBath(a.bath) === normalizeBath(b.bath);
}

function recalculateExistingItemCost(item, existingItem) {
  if (!existingItem.totalUnitCost && !existingItem.unitCost && !existingItem.bathCost) {
    return enrichItemCost(item);
  }
  const quantity = Number(item.quantity || 0);
  const totalUnitCost = Number(existingItem.totalUnitCost || 0);
  return {
    ...item,
    quantity,
    unitCost: roundCost(existingItem.unitCost || 0),
    weight: Number(existingItem.weight || 0),
    goldThousandth: Number(existingItem.goldThousandth || 0),
    bathCost: roundCost(existingItem.bathCost || 0),
    totalUnitCost: roundCost(totalUnitCost),
    lineCost: roundMoney(totalUnitCost * quantity),
    costSnapshot: existingItem.costSnapshot || {},
  };
}

function enrichItemCost(item) {
  const price = findPrice(item);
  const unitCost = Number(price?.unitCost || 0);
  const weight = Number(price?.weight || 0);
  const goldThousandth = Number(price?.goldThousandth || 0);
  const bathCost = calculateBathCost({ bath: item.bath, weight, goldThousandth });
  const totalUnitCost = unitCost + bathCost;
  const quantity = Number(item.quantity || 0);

  return {
    ...item,
    quantity,
    unitCost: roundCost(unitCost),
    weight,
    goldThousandth,
    bathCost: roundCost(bathCost),
    totalUnitCost: roundCost(totalUnitCost),
    lineCost: roundMoney(totalUnitCost * quantity),
    costSnapshot: {
      goldValue: Number(costSettings.goldValue || 0),
      rhodiumValue: Number(costSettings.rhodiumValue || 0),
      rhodiumFactor: Number(costSettings.rhodiumFactor || 0),
    },
  };
}

function findPrice(item) {
  return (
    prices.find((price) => price.model === item.model && price.size === item.size && price.bath === "Bruto") ||
    prices.find((price) => price.model === item.model && price.size === item.size && normalizeBath(price.bath) === normalizeBath(item.bath)) ||
    prices.find((price) => price.model === item.model && price.size === item.size)
  );
}

function calculateBathCost({ bath, weight, goldThousandth }) {
  const normalizedBath = normalizeBath(bath);
  const pieceWeight = Number(weight || 0);
  if (normalizedBath === "R\u00f3dio") {
    return (Number(costSettings.rhodiumFactor || 0) * Number(costSettings.rhodiumValue || 0) / 1000) * pieceWeight;
  }
  if (normalizedBath === "Ouro") {
    return pieceWeight * Number(goldThousandth || 0) * Number(costSettings.goldValue || 0);
  }
  return 0;
}

function calculatePricePreview(price) {
  const bathCost = calculateBathCost({
    bath: price.bath,
    weight: price.weight,
    goldThousandth: price.goldThousandth,
  });
  return {
    bathCost: roundCost(bathCost),
    totalUnitCost: roundCost(Number(price.unitCost || 0) + bathCost),
  };
}

function addItemRow(item = {}) {
  const fragment = elements.itemTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".item-row");
  row.dataset.createdAt = String(Date.now());
  const modelSelect = row.querySelector(".item-model");
  populateModelOptions(modelSelect, item.model);
  populateSizeOptions(row, modelSelect.value, item.size);
  modelSelect.addEventListener("change", () => {
    populateSizeOptions(row, modelSelect.value);
    updateItemCostPreview(row);
  });
  row.querySelector(".item-size").addEventListener("change", () => updateItemCostPreview(row));
  row.querySelector(".item-bath").addEventListener("change", () => updateItemCostPreview(row));
  row.querySelector(".item-quantity").addEventListener("input", () => updateItemCostPreview(row));
  populateBathOptions(row.querySelector(".item-bath"), item.bath);
  row.querySelector(".item-quantity").value = item.quantity || "";
  row.querySelector(".add-item-inline")?.addEventListener("click", () => addItemRow());
  row.querySelector(".remove-item").addEventListener("click", () => {
    if (elements.itemsList.children.length > 1) {
      row.remove();
      refreshItemRowLabels();
    }
  });
  elements.itemsList.prepend(row);
  refreshItemRowLabels(row);
  updateItemCostPreview(row);
}

function refreshItemRowLabels(newRow = null) {
  const rows = [...elements.itemsList.querySelectorAll(".item-row")];
  rows.forEach((row, index) => {
    row.classList.toggle("new-item-row", row === newRow);
    const badge = row.querySelector(".item-index");
    if (badge) badge.textContent = `Item ${index + 1}`;
  });
}

function updateItemCostPreview(row) {
  const preview = row.querySelector(".item-cost-preview");
  if (!preview) return;
  const item = {
    model: row.querySelector(".item-model").value,
    size: row.querySelector(".item-size").value,
    bath: row.querySelector(".item-bath").value,
    quantity: Number(row.querySelector(".item-quantity").value || 0),
  };
  const unitCost = Number(findPrice(item)?.unitCost || 0);
  const total = unitCost * item.quantity;
  preview.textContent = item.model && item.size && item.quantity > 0
    ? `Custo bruto: ${formatCostMoney(total)}`
    : "Custo bruto: R$ 0,00";
}

function populateBathOptions(select, selectedBath = "") {
  select.innerHTML = '<option value="">Selecione</option>';
  const bath = normalizeBath(selectedBath);

  for (const option of baths) {
    select.append(new Option(option, option));
  }

  if (bath && !baths.includes(bath)) {
    select.append(new Option(bath, bath));
  }

  select.value = bath || "";
}

function populateModelOptions(select, selectedModel = "") {
  select.innerHTML = '<option value="">Selecione</option>';

  for (const model of Object.keys(partSizes)) {
    select.append(new Option(model, model));
  }

  if (selectedModel && !partSizes[selectedModel]) {
    select.append(new Option(selectedModel, selectedModel));
  }

  select.value = selectedModel || "";
}

function populateSizeOptions(row, model, selectedSize = "") {
  const sizeSelect = row.querySelector(".item-size");
  const sizes = partSizes[model] || (selectedSize ? [selectedSize] : []);
  sizeSelect.innerHTML = '<option value="">Selecione</option>';

  for (const size of sizes) {
    sizeSelect.append(new Option(size, size));
  }

  if (selectedSize && !sizes.includes(selectedSize)) {
    sizeSelect.append(new Option(selectedSize, selectedSize));
  }

  sizeSelect.value = selectedSize || "";
}

function resetForm() {
  elements.form.reset();
  elements.editingId.value = "";
  elements.formTitle.textContent = "Carrinho da solicita\u00e7\u00e3o";
  if (elements.orderNumberPreview) elements.orderNumberPreview.textContent = "";
  elements.requester.value = isInternalUser() ? "" : currentSession?.name || "";
  elements.requester.readOnly = !isInternalUser();
  if (!isInternalUser() && currentSession?.origin) elements.origin.value = currentSession.origin;
  elements.status.value = statuses[0];
  elements.status.disabled = !isInternalUser();
  elements.itemsList.innerHTML = "";
  addItemRow();
}

async function editOrder(id) {
  if (!isInternalUser()) {
    try {
      orders = await loadOrders(false);
    } catch {
      // Use the current screen data if the refresh is temporarily unavailable.
    }
  }

  const order = orders.find((item) => item.id === id);
  if (!order) return;
  if (!canManageOrder(order)) {
    alert("Este pedido j\u00e1 foi movimentado pela Gest\u00e3o de Pedidos e n\u00e3o pode mais ser editado. Para solicitar altera\u00e7\u00f5es, crie um novo pedido.");
    render();
    return;
  }

  elements.editingId.value = order.id;
  elements.formTitle.textContent = "Editar pedido";
  if (elements.orderNumberPreview) elements.orderNumberPreview.textContent = order.id;
  elements.requester.value = order.requester;
  if (order.origin && !origins.includes(order.origin)) {
    elements.origin.append(new Option(order.origin, order.origin));
  }
  elements.origin.value = order.origin;
  elements.priority.value = order.priority;
  elements.status.value = order.status;
  elements.notes.value = order.notes || "";
  elements.itemsList.innerHTML = "";
  order.items.forEach((item) => addItemRow(item));
  showView("requestView");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteOrder(id) {
  if (!isMasterUser()) return;
  if (!confirm("Excluir este pedido?")) return;
  try {
    await removeOrder(id);
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel excluir o pedido no banco.\n\n${error.message}`);
  }
  render();
}

async function updateStatus(id, status) {
  if (!isInternalUser()) return;
  try {
    await patchOrder(id, { status, updatedBy: currentSession.name, updatedByRole: currentSession.role });
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel alterar o status no banco.\n\n${error.message}`);
  }
  render();
}

async function updateDueDate(id, dueDate) {
  if (!isInternalUser()) return;
  try {
    await patchOrder(id, { dueDate, updatedBy: currentSession.name, updatedByRole: currentSession.role });
  } catch (error) {
    alert(`N\u00e3o foi poss\u00edvel salvar a previs\u00e3o de entrega no banco.\n\n${error.message}`);
  }
  render();
}

function render() {
  renderMetrics();
  renderStatusWidgets();
  renderCharts();
  renderOrders();
  renderDashboardTable();
  renderReports();
  renderCollaboratorOrders();
  renderMasterPanel();
}

function renderMasterPanel() {
  if (!isMasterUser() || !elements.masterCostBody) return;
  const historyRows = getOrderHistoryRows();
  elements.masterAccessCount.textContent = accessLogs.length;
  elements.masterOrderHistoryCount.textContent = historyRows.length;
  renderCostSettings();
  renderMasterCostDashboard();
  renderAccessLogs();
  renderOrderHistory(historyRows);
  renderMasterUsers();
  renderPasswordResetRequests();
  renderDatabaseSummary();
  renderDatabasePreview();
  renderPrices();
}

function renderCostSettings() {
  if (!elements.costGoldValue) return;
  elements.costGoldValue.value = Number(costSettings.goldValue || 800);
  elements.costRhodiumValue.value = Number(costSettings.rhodiumValue || 2500);
  elements.costRhodiumFactor.value = Number(costSettings.rhodiumFactor || 0.7);
}

function renderMasterCostDashboard() {
  const rows = getMasterCostRows();
  const totalPieces = rows.reduce((sum, row) => sum + row.pieces, 0);
  const totalRawCost = rows.reduce((sum, row) => sum + row.rawCost, 0);

  elements.masterCostOrders.textContent = rows.length;
  elements.masterCostPieces.textContent = totalPieces;
  elements.masterCostTotal.textContent = formatCostMoney(totalRawCost);
  elements.masterCostBody.innerHTML = "";

  if (!rows.length) {
    elements.masterCostBody.innerHTML = '<tr><td colspan="9">Nenhum pedido encontrado para os filtros.</td></tr>';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${formatDate(row.requestDate)}</td>
      <td>${row.requester}</td>
      <td>${row.origin}</td>
      <td>${row.status}</td>
      <td>${row.pieces}</td>
      <td>${formatCostMoney(row.rawCost)}</td>
      <td>${formatCostMoney(row.bathCost)}</td>
      <td>${formatCostMoney(row.totalCost)}</td>
    `;
    elements.masterCostBody.append(tr);
  });
}

function getMasterCostRows() {
  const dateFrom = elements.masterCostDateFrom?.value || "";
  const dateTo = elements.masterCostDateTo?.value || "";
  const origin = elements.masterCostOrigin?.value || "";
  const requester = normalizeText(elements.masterCostRequester?.value || "");

  return orders
    .filter((order) => {
      const orderDate = order.requestDate || "";
      return (
        (!dateFrom || orderDate >= dateFrom) &&
        (!dateTo || orderDate <= dateTo) &&
        (!origin || order.origin === origin) &&
        (!requester || normalizeText(order.requester).includes(requester))
      );
    })
    .map((order) => {
      const rawCost = orderRawCost(order);
      const bathCost = orderBathCost(order);
      return {
        id: order.id,
        requestDate: order.requestDate,
        requester: order.requester,
        origin: order.origin,
        status: order.status,
        pieces: countPieces([order]),
        rawCost,
        bathCost,
        totalCost: rawCost + bathCost,
      };
    })
    .sort((a, b) => String(b.requestDate || "").localeCompare(String(a.requestDate || "")) || String(b.id || "").localeCompare(String(a.id || "")));
}

function orderRawCost(order) {
  return (order.items || []).reduce((sum, item) => {
    const unitCost = Number(item.unitCost || findPrice(item)?.unitCost || 0);
    return sum + unitCost * Number(item.quantity || 0);
  }, 0);
}

function orderBathCost(order) {
  return (order.items || []).reduce((sum, item) => sum + Number(item.bathCost || 0) * Number(item.quantity || 0), 0);
}

function renderAccessLogs() {
  elements.accessLogsBody.innerHTML = "";
  if (!accessLogs.length) {
    elements.accessLogsBody.innerHTML = '<tr><td colspan="5">Nenhum acesso registrado.</td></tr>';
    return;
  }

  accessLogs.slice(0, 80).forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDateTime(log.createdAt)}</td>
      <td>${log.userName || log.login || "Sem usu\u00e1rio"}</td>
      <td>${roleLabel(log.role)}</td>
      <td>${accessEventLabel(log.eventType)}</td>
      <td>${log.origin || ""}</td>
    `;
    elements.accessLogsBody.append(row);
  });
}

function accessEventLabel(eventType) {
  const labels = {
    login: "Login",
    alerta_nome_celular: "Nome diferente no celular",
    senha_provisoria: "Senha provis\u00f3ria",
    usuario_gestao_criado: "Usu\u00e1rio Gest\u00e3o criado",
    usuario_admin_criado: "Usu\u00e1rio administrativo criado",
    usuario_editado: "Usu\u00e1rio editado",
    usuario_ativado: "Usu\u00e1rio ativado",
    usuario_inativado: "Usu\u00e1rio inativado",
    usuario_excluido: "Usu\u00e1rio exclu\u00eddo",
    reset_senha_solicitado: "Redefini\u00e7\u00e3o solicitada",
    reset_senha_aprovado: "Redefini\u00e7\u00e3o aprovada",
    reset_senha_recusado: "Redefini\u00e7\u00e3o recusada",
    reset_senha_concluido: "Senha redefinida",
  };
  return labels[eventType] || eventType || "Login";
}

function renderOrderHistory(historyRows) {
  elements.orderHistoryBody.innerHTML = "";
  if (!historyRows.length) {
    elements.orderHistoryBody.innerHTML = '<tr><td colspan="5">Nenhuma movimenta\u00e7\u00e3o registrada.</td></tr>';
    return;
  }

  historyRows.slice(0, 120).forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDateTime(item.at)}</td>
      <td>${item.orderId}</td>
      <td>${item.action}</td>
      <td>${item.user}</td>
      <td>${roleLabel(item.role)}</td>
    `;
    elements.orderHistoryBody.append(row);
  });
}

function renderMasterUsers() {
  if (!elements.masterUsersBody) return;
  elements.masterUsersBody.innerHTML = "";

  if (!masterCredential) {
    elements.masterUsersBody.innerHTML = '<tr><td colspan="9">Entre novamente como Master para liberar a administra\u00e7\u00e3o de usu\u00e1rios.</td></tr>';
    return;
  }

  if (!masterUsers.length) {
    elements.masterUsersBody.innerHTML = '<tr><td colspan="9">Nenhum usu\u00e1rio cadastrado.</td></tr>';
    return;
  }

  masterUsers.forEach((user) => {
    const row = document.createElement("tr");
    const needsChange = Boolean(user.mustChangePassword);
    const isActive = user.active !== false;
    row.innerHTML = `
      <td>${user.login}</td>
      <td>${user.name}</td>
      <td>${roleLabel(user.role)}</td>
      <td>${user.origin || ""}</td>
      <td>${formatPhone(user.phone) || ""}</td>
      <td>${formatDateTime(user.createdAt)}</td>
      <td>${formatDateTime(user.updatedAt)}</td>
      <td><span class="pill ${!isActive || needsChange ? "urgent" : ""}">${!isActive ? "Inativo" : needsChange ? "Troca pendente" : "Ativo"}</span></td>
      <td>
        <div class="inline-actions">
          <button class="ghost-button small" type="button" data-edit-user="${user.login}" title="Editar usu\u00e1rio">Editar</button>
          <button class="ghost-button small" type="button" data-toggle-user="${user.login}" title="${isActive ? "Inativar usu\u00e1rio" : "Ativar usu\u00e1rio"}">${isActive ? "Inativar" : "Ativar"}</button>
          <button class="ghost-button small" type="button" data-reset-user="${user.login}" title="Definir senha provis\u00f3ria">Senha</button>
          <button class="ghost-button small danger" type="button" data-delete-user="${user.login}" title="Excluir usu\u00e1rio">Excluir</button>
        </div>
      </td>
    `;
    row.querySelector("[data-edit-user]").addEventListener("click", () => editMasterUser(user.login));
    row.querySelector("[data-toggle-user]").addEventListener("click", () => toggleMasterUserStatus(user.login));
    row.querySelector("[data-reset-user]").addEventListener("click", () => resetUserPassword(user.login));
    row.querySelector("[data-delete-user]").addEventListener("click", () => deleteMasterUser(user.login));
    elements.masterUsersBody.append(row);
  });
}

function setManagementUserFormMode(user = null) {
  editingManagementUserLogin = user?.login || "";
  if (elements.managementUserLogin) {
    elements.managementUserLogin.readOnly = Boolean(user);
    elements.managementUserLogin.value = user?.login || "";
  }
  if (elements.managementUserRole) elements.managementUserRole.value = user?.role || "consultant";
  if (elements.managementUserName) elements.managementUserName.value = user?.name || "";
  if (elements.managementUserSector) elements.managementUserSector.value = user?.origin || "";
  if (elements.managementUserPhone) elements.managementUserPhone.value = user?.phone ? formatPhone(user.phone) : "";
  if (elements.managementUserPassword) {
    elements.managementUserPassword.value = "";
    elements.managementUserPassword.required = !user;
    elements.managementUserPassword.placeholder = user ? "Use o bot\u00e3o Senha para redefinir" : "Senha provis\u00f3ria";
  }
  if (elements.managementUserSubmit) elements.managementUserSubmit.textContent = user ? "Salvar altera\u00e7\u00f5es" : "Criar usu\u00e1rio";
  if (elements.cancelManagementUserEdit) elements.cancelManagementUserEdit.hidden = !user;
}

function resetManagementUserFormMode() {
  elements.managementUserForm?.reset();
  setManagementUserFormMode(null);
}

function renderPasswordResetRequests() {
  if (!elements.passwordResetRequestsBody) return;
  elements.passwordResetRequestsBody.innerHTML = "";

  if (!masterCredential) {
    elements.passwordResetRequestsBody.innerHTML =
      '<tr><td colspan="6">Entre novamente como Master para liberar as solicita\u00e7\u00f5es.</td></tr>';
    return;
  }

  if (!passwordResetRequests.length) {
    elements.passwordResetRequestsBody.innerHTML =
      '<tr><td colspan="6">Nenhuma solicita\u00e7\u00e3o de redefini\u00e7\u00e3o registrada.</td></tr>';
    return;
  }

  const statusOrder = { PENDENTE: 0, APROVADO: 1, RECUSADO: 2, EXPIRADO: 3, CONCLUIDO: 4 };
  passwordResetRequests
    .slice()
    .sort((a, b) => {
      const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (statusDiff) return statusDiff;
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    })
    .forEach((request) => {
      const isPending = request.status === "PENDENTE";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatDateTime(request.createdAt)}</td>
        <td><strong>${request.login || ""}</strong><br><span>${request.userName || ""}</span></td>
        <td>${roleLabel(request.role)}</td>
        <td><span class="pill ${isPending ? "urgent" : ""}">${passwordResetStatusLabel(request.status)}</span></td>
        <td>${request.expiresAt ? formatDateTime(request.expiresAt) : "-"}</td>
        <td>
          ${
            isPending
              ? `<div class="inline-actions">
                  <button class="ghost-button small" type="button" data-reset-request="${request.id}" data-reset-decision="APROVADO">Aprovar</button>
                  <button class="ghost-button small danger" type="button" data-reset-request="${request.id}" data-reset-decision="RECUSADO">Recusar</button>
                </div>`
              : "-"
          }
        </td>
      `;

      row.querySelectorAll("[data-reset-decision]").forEach((button) => {
        button.addEventListener("click", () => decidePasswordReset(button.dataset.resetRequest, button.dataset.resetDecision));
      });
      elements.passwordResetRequestsBody.append(row);
    });
}

function passwordResetStatusLabel(status) {
  const labels = {
    PENDENTE: "Pendente",
    APROVADO: "Aprovado",
    RECUSADO: "Recusado",
    CONCLUIDO: "Conclu\u00eddo",
    EXPIRADO: "Expirado",
  };
  return labels[status] || status || "-";
}

async function decidePasswordReset(requestId, decision) {
  if (!isMasterUser() || !masterCredential || !requestId || !decision) return;

  try {
    const response = await fetch(`${API_PASSWORD_RESET_URL}/admin-decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master: masterCredential,
        requestId,
        decision,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel atualizar a solicita\u00e7\u00e3o.");

    passwordResetRequests = passwordResetRequests.map((item) => (item.id === payload.request.id ? payload.request : item));
    renderPasswordResetRequests();
    alert(decision === "APROVADO" ? "Solicita\u00e7\u00e3o aprovada. O usu\u00e1rio j\u00e1 pode redefinir a pr\u00f3pria senha." : "Solicita\u00e7\u00e3o recusada.");
  } catch (error) {
    alert(error.message);
  }
}

async function resetUserPassword(login) {
  if (!isMasterUser() || !masterCredential) return;
  const user = masterUsers.find((item) => item.login === login);
  const label = user?.name || login;
  const temporaryPassword = prompt(`Definir senha provis\u00f3ria para ${label}.\n\nO usu\u00e1rio precisar\u00e1 trocar a senha no pr\u00f3ximo acesso.`);
  if (temporaryPassword === null) return;
  const trimmedPassword = temporaryPassword.trim();

  if (trimmedPassword.length < 4) {
    alert("A senha provis\u00f3ria deve ter pelo menos 4 caracteres.");
    return;
  }

  try {
    const response = await fetch("/api/users/admin-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master: masterCredential,
        login,
        newPassword: trimmedPassword,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel redefinir a senha.");
    masterUsers = masterUsers.map((item) => (item.login === payload.user.login ? payload.user : item));
    renderMasterUsers();
    alert("Senha provis\u00f3ria definida. No pr\u00f3ximo acesso, o usu\u00e1rio ser\u00e1 direcionado para trocar a senha.");
  } catch (error) {
    alert(error.message);
  }
}

async function editMasterUser(login) {
  if (!isMasterUser() || !masterCredential) return;
  const user = masterUsers.find((item) => item.login === login);
  if (!user) return;
  setManagementUserFormMode(user);
  elements.managementUserForm?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function toggleMasterUserStatus(login) {
  if (!isMasterUser() || !masterCredential) return;
  const user = masterUsers.find((item) => item.login === login);
  if (!user) return;
  const nextActive = user.active === false;
  const action = nextActive ? "ativar" : "inativar";
  if (!confirm(`Confirmar ${action} o usu\u00e1rio ${user.name || login}?`)) return;

  try {
    const response = await fetch("/api/users/admin-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master: masterCredential,
        login,
        active: nextActive,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel alterar o status do usu\u00e1rio.");
    masterUsers = masterUsers.map((item) => (item.login === payload.user.login ? payload.user : item));
    renderMasterUsers();
    alert(nextActive ? "Usu\u00e1rio ativado." : "Usu\u00e1rio inativado.");
  } catch (error) {
    alert(error.message);
  }
}

async function deleteMasterUser(login) {
  if (!isMasterUser() || !masterCredential) return;
  const user = masterUsers.find((item) => item.login === login);
  if (!user) return;
  if (!confirm(`Excluir definitivamente o usu\u00e1rio ${user.name || login}?`)) return;

  try {
    const response = await fetch("/api/users/admin-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master: masterCredential,
        login,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "N\u00e3o foi poss\u00edvel excluir o usu\u00e1rio.");
    masterUsers = masterUsers.filter((item) => item.login !== payload.login);
    renderMasterUsers();
    alert("Usu\u00e1rio exclu\u00eddo.");
  } catch (error) {
    alert(error.message);
  }
}

async function handleManagementUserSubmit(event) {
  event.preventDefault();
  if (!isMasterUser() || !masterCredential) return;

  const role = elements.managementUserRole.value;
  const login = elements.managementUserLogin.value.trim();
  const name = elements.managementUserName.value.trim();
  const sector = elements.managementUserSector.value.trim();
  const phone = elements.managementUserPhone.value.trim();
  const password = elements.managementUserPassword.value.trim();
  const wasEditing = Boolean(editingManagementUserLogin);

  if (!name || !sector || (!wasEditing && !password)) {
    alert(wasEditing ? "Preencha nome e setor." : "Preencha nome, setor e senha padr\u00e3o.");
    return;
  }

  if (!wasEditing && password.length < 4) {
    alert("A senha padr\u00e3o deve ter pelo menos 4 caracteres.");
    return;
  }

  try {
    const response = await fetch(wasEditing ? "/api/users/admin-update" : "/api/users/management", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        master: masterCredential,
        role,
        login,
        name,
        sector,
        phone,
        password,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || (wasEditing ? "N\u00e3o foi poss\u00edvel editar o usu\u00e1rio." : "N\u00e3o foi poss\u00edvel criar o usu\u00e1rio."));
    resetManagementUserFormMode();
    masterUsers = [payload.user, ...masterUsers.filter((item) => item.login !== payload.user.login)];
    renderMasterUsers();
    alert(wasEditing ? "Usu\u00e1rio atualizado." : "Usu\u00e1rio criado. No primeiro acesso, ele dever\u00e1 trocar a senha.");
  } catch (error) {
    alert(error.message);
  }
}

function renderPrices() {
  elements.pricesBody.innerHTML = "";
  const piecePrices = getUniquePiecePrices();
  if (!piecePrices.length) {
    elements.pricesBody.innerHTML = '<tr><td colspan="6">Nenhum pre\u00e7o cadastrado.</td></tr>';
    return;
  }

  piecePrices.forEach((price) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${price.model}</td>
      <td>${price.size}</td>
      <td>${formatCostMoney(price.unitCost)}</td>
      <td>${Number(price.weight || 0).toLocaleString("pt-BR", { maximumFractionDigits: 3 })}</td>
      <td>${Number(price.goldThousandth || 0).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}</td>
      <td><button class="action-button danger-action" type="button" title="Excluir" aria-label="Excluir pre\u00e7o" data-price-delete="${price.model}||${price.size}">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 11H6.8L6 9Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"/>
        </svg>
      </button></td>
    `;
    row.querySelector("[data-price-delete]").addEventListener("click", () => deletePiecePrice(price.model, price.size));
    elements.pricesBody.append(row);
  });
}

function getUniquePiecePrices() {
  const grouped = new Map();
  prices.forEach((price) => {
    const key = `${price.model}||${price.size}`;
    const current = grouped.get(key);
    if (!current || price.bath === "Bruto") grouped.set(key, price);
  });
  return [...grouped.values()].sort((a, b) => `${a.model} ${a.size}`.localeCompare(`${b.model} ${b.size}`));
}

function getOrderHistoryRows() {
  return orders
    .flatMap((order) =>
      (Array.isArray(order.history) ? order.history : []).map((entry) => ({
        orderId: order.id,
        at: entry.at,
        action: entry.action,
        user: entry.user,
        role: entry.role,
      }))
    )
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
}

function getFilteredOrders() {
  const search = elements.searchInput.value.trim().toLowerCase();
  const status = elements.filterStatus.value;
  const priority = elements.filterPriority.value;

  return getVisibleOrders()
    .filter((order) => {
      const currentStatus = normalizeStatus(order.status);
      const text = [
        order.id,
        order.requester,
        order.phone,
        order.origin,
        order.priority,
        currentStatus,
        order.notes,
        ...order.items.map((item) => `${item.model} ${item.size} ${item.bath}`),
      ]
        .join(" ")
        .toLowerCase();

      const hideDeliveredInDefaultList = !status && currentStatus === "Entregue";

      return (
        !hideDeliveredInDefaultList &&
        (!search || text.includes(search)) &&
        (!status || currentStatus === status) &&
        (!priority || order.priority === priority)
      );
    })
    .sort(orderSortByStatus);
}

function orderSortByStatus(a, b) {
  const order = {
    "Pedido Recebido": 0,
    "Em separa\u00e7\u00e3o": 1,
    "Em prepara\u00e7\u00e3o de banho (galvanoplastia)": 2,
    "P\u00f3s banho": 3,
    "Prepara\u00e7\u00e3o final": 4,
    Entregue: 5,
  };
  const statusDiff = (order[normalizeStatus(a.status)] ?? 9) - (order[normalizeStatus(b.status)] ?? 9);
  if (statusDiff) return statusDiff;
  if (normalizeStatus(a.status) === "Pedido Recebido") {
    return String(b.id || "").localeCompare(String(a.id || ""));
  }
  return String(a.id || "").localeCompare(String(b.id || ""));
}

function statusClass(status) {
  const currentStatus = normalizeStatus(status);
  if (currentStatus === "Pedido Recebido") return "order-received";
  if (currentStatus === "Em separa\u00e7\u00e3o") return "order-progress";
  if (currentStatus === "Em prepara\u00e7\u00e3o de banho (galvanoplastia)") return "order-bath";
  if (currentStatus === "P\u00f3s banho") return "order-post-bath";
  if (currentStatus === "Prepara\u00e7\u00e3o final") return "order-final-prep";
  if (currentStatus === "Entregue") return "order-delivered";
  return "";
}

function getVisibleOrders() {
  if (isInternalUser()) return orders;
  return orders.filter((order) => normalizePhone(order.phone) === normalizePhone(currentSession?.phone || ""));
}

function getDashboardOrders() {
  const dateFrom = elements.dashboardDateFrom.value;
  const dateTo = elements.dashboardDateTo.value;
  const status = elements.dashboardFilterStatus.value;
  const origin = elements.dashboardFilterOrigin.value;
  const requester = normalizeText(elements.dashboardFilterRequester.value);

  return getVisibleOrders().filter((order) => {
    const orderDate = order.requestDate || "";
    return (
      (!dateFrom || orderDate >= dateFrom) &&
      (!dateTo || orderDate <= dateTo) &&
      (!status || normalizeStatus(order.status) === status) &&
      (!origin || order.origin === origin) &&
      (!requester || normalizeText(order.requester).includes(requester))
    );
  });
}

function renderMetrics() {
  const visibleOrders = getDashboardOrders();
  const urgent = visibleOrders.filter((order) => order.priority === "Urgente").length;
  const newOpen = visibleOrders.filter((order) => normalizeStatus(order.status) === "Pedido Recebido").length;
  const progress = visibleOrders.filter((order) => {
    const status = normalizeStatus(order.status);
    return status !== "Pedido Recebido" && status !== "Entregue";
  }).length;
  const delivered = visibleOrders.filter((order) => normalizeStatus(order.status) === "Entregue").length;
  elements.metricTotal.textContent = newOpen;
  elements.metricUrgent.textContent = urgent;
  elements.metricOpen.textContent = progress;
  elements.metricPieces.textContent = delivered;
}

function renderStatusWidgets() {
  const visibleOrders = getVisibleOrders();
  const countStatus = (status) => visibleOrders.filter((order) => normalizeStatus(order.status) === status).length;
  elements.widgetReceived.textContent = countStatus("Pedido Recebido");
  elements.widgetProgress.textContent = countStatus("Em separa\u00e7\u00e3o");
  if (elements.widgetBathPrep) elements.widgetBathPrep.textContent = countStatus("Em prepara\u00e7\u00e3o de banho (galvanoplastia)");
  if (elements.widgetPostBath) elements.widgetPostBath.textContent = countStatus("P\u00f3s banho");
  if (elements.widgetFinalPrep) elements.widgetFinalPrep.textContent = countStatus("Prepara\u00e7\u00e3o final");
  elements.widgetDelivered.textContent = countStatus("Entregue");
  elements.statusWidgets.forEach((button) => {
    button.classList.toggle("active", elements.filterStatus.value === button.dataset.statusFilter);
  });
}

function applyStatusWidgetFilter(status) {
  if (!elements.filterStatus || !status) return;
  elements.filterStatus.value = elements.filterStatus.value === status ? "" : status;
  render();
  elements.ordersList?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCharts() {
  renderPieChart(elements.priorityPieChart, countByPriority());
  renderColumnChart(elements.monthlyOriginChart, countByOriginMonth());
  renderRankingChart(elements.originRankingChart, countByOrigin(), "pedido(s)");
  renderRankingChart(elements.requesterRankingChart, countByRequester(), "pedido(s)");
}

function renderDashboardTable() {
  if (!elements.dashboardBody) return;
  const grouped = new Map();

  getVisibleOrders().forEach((order) => {
    const key = order.requester || "Sem solicitante";
    const current = grouped.get(key) || { requester: key, orders: 0, pieces: 0, open: 0, delivered: 0 };
    current.orders += 1;
    current.pieces += countPieces([order]);
    if (normalizeStatus(order.status) === "Entregue") current.delivered += 1;
    else current.open += 1;
    grouped.set(key, current);
  });

  elements.dashboardBody.innerHTML = "";
  const rows = [...grouped.values()].sort((a, b) => b.orders - a.orders);

  if (!rows.length) {
    elements.dashboardBody.innerHTML = '<tr><td colspan="5">Nenhum pedido para exibir.</td></tr>';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.requester}</td>
      <td>${row.orders}</td>
      <td>${row.pieces}</td>
      <td>${row.open}</td>
      <td>${row.delivered}</td>
    `;
    elements.dashboardBody.append(tr);
  });
}

function renderBarChart(container, data, labels) {
  if (!container) return;
  container.innerHTML = "";
  const max = Math.max(1, ...Object.values(data));
  const visibleLabels = labels.length ? labels : ["Sem dados"];

  visibleLabels.forEach((label) => {
    const value = data[label] || 0;
    const line = document.createElement("div");
    line.className = "bar-line";
    line.innerHTML = `
      <span>${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width: ${(value / max) * 100}%"></div></div>
      <strong>${value}</strong>
    `;
    container.append(line);
  });
}

function renderPieChart(container, data) {
  if (!container) return;
  const entries = Object.entries(data).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  container.innerHTML = "";
  if (!total) {
    container.innerHTML = '<div class="empty mini-empty">Sem dados no período.</div>';
    return;
  }

  let cursor = 0;
  const colors = ["#2f4d40", "#c9a24a", "#527e86", "#7a8bb1"];
  const segments = entries.map(([label, value], index) => {
    const start = cursor;
    cursor += (value / total) * 100;
    return `${colors[index % colors.length]} ${start}% ${cursor}%`;
  });

  const chart = document.createElement("div");
  chart.className = "pie-visual";
  chart.style.background = `conic-gradient(${segments.join(", ")})`;

  const legend = document.createElement("div");
  legend.className = "chart-legend";
  legend.innerHTML = entries
    .map(([label, value], index) => `
      <span><i style="background:${colors[index % colors.length]}"></i>${label}: <strong>${value}</strong></span>
    `)
    .join("");

  container.append(chart, legend);
}

function renderColumnChart(container, data) {
  if (!container) return;
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  container.innerHTML = "";
  if (!entries.length) {
    container.innerHTML = '<div class="empty mini-empty">Sem dados no período.</div>';
    return;
  }

  entries.forEach(([label, value]) => {
    const column = document.createElement("div");
    column.className = "column-item";
    column.innerHTML = `
      <div class="column-bar" style="height:${Math.max(12, (value / max) * 118)}px"><strong>${value}</strong></div>
      <span>${label}</span>
    `;
    container.append(column);
  });
}

function renderRankingChart(container, data, suffix) {
  if (!container) return;
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  container.innerHTML = "";
  if (!entries.length) {
    container.innerHTML = '<div class="empty mini-empty">Sem dados no período.</div>';
    return;
  }

  entries.forEach(([label, value], index) => {
    const row = document.createElement("div");
    row.className = "ranking-row";
    row.innerHTML = `
      <span class="ranking-position">${index + 1}</span>
      <span class="ranking-label">${label}</span>
      <div class="ranking-track"><div style="width:${(value / max) * 100}%"></div></div>
      <strong>${value} ${suffix}</strong>
    `;
    container.append(row);
  });
}

function renderOrders() {
  const filtered = getFilteredOrders();
  elements.orderCount.textContent = `${filtered.length} encontrados`;
  elements.ordersList.innerHTML = "";

  if (!filtered.length) {
    const status = elements.filterStatus.value;
    elements.ordersList.innerHTML = `<div class="empty">${status ? "Nenhum pedido encontrado." : "Nenhum pedido pendente. Para ver pedidos entregues, filtre por Entregue."}</div>`;
    return;
  }

  filtered.forEach((order) => {
    elements.ordersList.append(buildOrderCard(order, { mode: "management" }));
  });
}

function renderCollaboratorOrders() {
  if (!elements.collaboratorOrdersList || isInternalUser()) return;
  const myOrders = getVisibleOrders().sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")));
  elements.collaboratorOrdersList.innerHTML = "";

  if (!myOrders.length) {
    elements.collaboratorOrdersList.innerHTML = '<div class="empty">Nenhum pedido enviado por este celular.</div>';
    if (elements.collaboratorOrderDetail) {
      elements.collaboratorOrderDetail.hidden = true;
      elements.collaboratorOrderDetail.innerHTML = "";
    }
    return;
  }

  myOrders.forEach((order) => {
    elements.collaboratorOrdersList.append(buildOrderCard(order, { mode: "collaborator" }));
  });
}

function buildOrderCard(order, { mode }) {
  const card = document.createElement("article");
  const displayStatus = normalizeStatus(order.status);
  const isExpanded = expandedOrderIds.has(order.id);
  const totalPieces = countPieces([order]);
  const priorityClass = order.priority === "Urgente" ? "urgent" : "";
  const canEdit = canManageOrder(order);
  const items = Array.isArray(order.items) ? order.items : [];
  const summaryItems = items.slice(0, 4);
  const hiddenItems = Math.max(0, items.length - summaryItems.length);
  const isManagement = mode === "management";
  const galvanoplasty = order.galvanoplasty || {};
  const galvanoplastySent = Boolean(galvanoplasty.sentAt);

  card.className = `order-card compact-order-card ${statusClass(displayStatus)} ${isExpanded ? "expanded-order" : ""}`;
  card.innerHTML = `
    <div class="order-line">
      <button class="expand-button" type="button" data-toggle-order="${order.id}" title="${isExpanded ? "Recolher pedido" : "Expandir pedido"}" aria-label="${isExpanded ? "Recolher pedido" : "Expandir pedido"}" aria-expanded="${isExpanded}">
        ${isExpanded ? "\u25be" : "\u25b8"}
      </button>
      <div class="order-main-info">
        <strong>${order.id}</strong>
        <span>${order.requester || "Sem colaborador"}</span>
      </div>
      <div class="order-kpis">
        <span><strong>${totalPieces}</strong> pe\u00e7as</span>
        <span><strong>${formatDate(order.requestDate)}</strong> abertura</span>
        <span><strong>${formatDate(order.dueDate) || "Sem previs\u00e3o"}</strong> previs\u00e3o</span>
        <span><strong>${leadTimeText(order)}</strong> lead time</span>
      </div>
      <div class="order-tags">
        <span class="pill ${priorityClass}">${order.priority}</span>
        <span class="pill status-pill">${displayStatus}</span>
      </div>
    </div>
    <div class="order-compact-meta">
      <span>${order.origin}</span>
      <span>${formatPhone(order.phone) || "Sem celular"}</span>
      <span>${items.length} item(ns)</span>
      ${isManagement ? `
        <button class="galvanoplasty-indicator ${galvanoplastySent ? "done" : "pending"}" type="button" data-galvanoplasty-detail="${order.id}" title="${galvanoplastySent ? "Ver registro de Galvanoplastia" : "Sem registro de Galvanoplastia"}" aria-label="${galvanoplastySent ? "Ver registro de Galvanoplastia" : "Sem registro de Galvanoplastia"}">
          ${galvanoplastySent ? "\u2713" : "!"}
        </button>
      ` : ""}
    </div>
    ${isExpanded ? `
      <div class="order-expanded-body">
        <ul class="order-items expanded-items">
          ${items.map((item) => `<li>${item.quantity}x ${item.model} \u00b7 ${item.size} \u00b7 ${item.bath}</li>`).join("")}
        </ul>
        ${order.notes ? `<p class="detail-notes"><strong>Observa\u00e7\u00f5es:</strong> ${order.notes}</p>` : ""}
      </div>
    ` : `
      <ul class="order-items order-preview-items">
        ${summaryItems.map((item) => `<li>${item.quantity}x ${item.model} \u00b7 ${item.size} \u00b7 ${item.bath}</li>`).join("")}
        ${hiddenItems ? `<li class="more-items">+ ${hiddenItems} item(ns) no pedido</li>` : ""}
      </ul>
    `}
    <div class="order-footer">
      ${isManagement ? `
        <label class="compact-control">
          Status
          <select data-order-status="${order.id}">
            ${statuses.map((status) => `<option ${status === displayStatus ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label class="compact-control">
          Previs\u00e3o
          <input data-order-due-date="${order.id}" type="date" value="${order.dueDate || ""}">
        </label>
      ` : `<span class="status-note">${statusHelperText(displayStatus)}</span>`}
      <div class="order-actions" aria-label="A\u00e7\u00f5es do pedido">
        ${canEdit ? `<button class="action-button" type="button" data-edit="${order.id}" title="Editar pedido" aria-label="Editar pedido">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="m4 16.6-.7 4.1 4.1-.7L18.8 8.6l-3.4-3.4L4 16.6Zm16.1-9.3 1-1a2 2 0 0 0 0-2.8l-.6-.6a2 2 0 0 0-2.8 0l-1 1 3.4 3.4Z"/>
          </svg>
        </button>` : ""}
        ${!isManagement ? `<button class="action-button clone-action" type="button" data-clone="${order.id}" title="Clonar pedido" aria-label="Clonar pedido">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M8 7V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3v3c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h3Zm2 0h3c1.1 0 2 .9 2 2v5h3V4h-8v3ZM5 9v10h8V9H5Z"/>
          </svg>
        </button>` : ""}
        ${isManagement && order.phone ? `<a class="action-button whatsapp-action" href="${whatsappUrl(order)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="Enviar WhatsApp">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12.1 3a8.9 8.9 0 0 0-7.6 13.5L3.4 21l4.6-1.1A8.9 8.9 0 1 0 12.1 3Zm0 2a6.9 6.9 0 1 1-3.5 12.8l-.4-.2-2.1.5.5-2-.3-.4A6.9 6.9 0 0 1 12.1 5Zm-3 3.6c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.6 2.6 4 3.5 2 .8 2.4.6 2.8.6.4 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.2l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.7-.4Z"/>
          </svg>
        </a>` : ""}
        ${isManagement ? `<button class="action-button galvanoplasty-action" type="button" data-galvanoplasty-send="${order.id}" title="Registrar envio para Galvanoplastia" aria-label="Registrar envio para Galvanoplastia">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm9 1.5V11h5.5L13 5.5ZM6 13h10v2H6v-2Zm0 4h8v2H6v-2Z"/>
          </svg>
        </button>
        <button class="action-button print-action" type="button" data-galvanoplasty-print="${order.id}" title="Imprimir controle de Galvanoplastia" aria-label="Imprimir controle de Galvanoplastia">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M6 2h9l5 5v6h-2V8h-4V4H6v16h6v2H4V4c0-1.1.9-2 2-2Zm9.5 14.5 2 2L22 14l-1.4-1.4-3.1 3.1-2-2-1.5 1.4Zm-8.5-6h8v2H7v-2Zm0 4h5v2H7v-2Z"/>
          </svg>
        </button>` : ""}
        <button class="action-button print-action" type="button" data-print-order="${order.id}" title="Imprimir pedido" aria-label="Imprimir pedido">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M7 3h10v5H7V3Zm-2 7h14a3 3 0 0 1 3 3v5h-4v3H6v-3H2v-5a3 3 0 0 1 3-3Zm3 7v2h8v-2H8Zm10-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
          </svg>
        </button>
        ${isMasterUser() && isManagement ? `<button class="action-button danger-action" type="button" data-delete="${order.id}" title="Excluir pedido" aria-label="Excluir pedido">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 11H6.8L6 9Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"/>
          </svg>
        </button>` : ""}
      </div>
    </div>
  `;

  card.querySelector("[data-toggle-order]")?.addEventListener("click", () => toggleOrderExpansion(order.id));
  card.querySelector("[data-order-status]")?.addEventListener("change", (event) => updateStatus(order.id, event.target.value));
  card.querySelector("[data-order-due-date]")?.addEventListener("change", (event) => updateDueDate(order.id, event.target.value));
  card.querySelector("[data-edit]")?.addEventListener("click", () => editOrder(order.id));
  card.querySelector("[data-clone]")?.addEventListener("click", () => cloneOrder(order.id));
  card.querySelector("[data-galvanoplasty-detail]")?.addEventListener("click", () => showGalvanoplastyDetail(order.id));
  card.querySelector("[data-galvanoplasty-send]")?.addEventListener("click", () => registerGalvanoplastyShipment(order.id));
  card.querySelector("[data-galvanoplasty-print]")?.addEventListener("click", () => printGalvanoplastyProtocol(order.id));
  card.querySelector("[data-print-order]")?.addEventListener("click", () => printCollaboratorOrder(order.id));
  card.querySelector("[data-delete]")?.addEventListener("click", () => deleteOrder(order.id));
  return card;
}

function toggleOrderExpansion(id) {
  if (expandedOrderIds.has(id)) expandedOrderIds.delete(id);
  else expandedOrderIds.add(id);
  render();
}

function showGalvanoplastyDetail(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  const galvanoplasty = order.galvanoplasty || {};
  if (!galvanoplasty.sentAt) {
    alert("Este pedido ainda n\u00e3o possui registro de envio para Galvanoplastia.");
    return;
  }
  const sentAt = new Date(galvanoplasty.sentAt);
  const sentDate = formatShortDate(sentAt);
  const sentTime = Number.isNaN(sentAt.getTime()) ? "-" : sentAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  alert(
    `Registro de Galvanoplastia\n\n` +
      `Pedido: ${order.id}\n` +
      `Data: ${sentDate || "-"}\n` +
      `Hora: ${sentTime}\n` +
      `Enviado por: ${galvanoplasty.sentBy || "-"}\n` +
      `Recebido por: ${galvanoplasty.receivedBy || "-"}\n` +
      `Retorno: ${formatShortDate(galvanoplasty.returnDate || galvanoplasty.deliveryDate) || "-"}`
  );
}

function showManagementOrderDetail(id) {
  if (!elements.managementOrderDetail) return;
  const order = getVisibleOrders().find((item) => item.id === id);
  if (!order) return;
  const displayStatus = normalizeStatus(order.status);
  const totalPieces = countPieces([order]);
  elements.managementOrderDetail.hidden = false;
  elements.managementOrderDetail.innerHTML = `
    <div class="panel-title-row">
      <div>
        <p class="eyebrow">Pedido selecionado</p>
        <h2>${order.id}</h2>
      </div>
      <div class="report-actions">
        <button class="ghost-button small" type="button" data-management-edit="${order.id}">Editar</button>
        ${order.phone ? `<a class="ghost-button small" href="${whatsappUrl(order)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}
        <button class="primary-button small" type="button" data-management-print="${order.id}">Imprimir</button>
      </div>
    </div>
    <div class="detail-summary">
      <span><strong>Status</strong>${displayStatus}</span>
      <span><strong>Data</strong>${formatDate(order.requestDate)}</span>
      <span><strong>Previs\u00e3o</strong>${formatDate(order.dueDate) || "-"}</span>
      <span><strong>Lead time</strong>${leadTimeText(order)}</span>
      <span><strong>Solicitante</strong>${order.requester}</span>
      <span><strong>Loja</strong>${order.origin}</span>
      <span><strong>Pe\u00e7as</strong>${totalPieces}</span>
      <span><strong>Itens</strong>${order.items.length}</span>
    </div>
    <div class="table-wrap compact-table">
      <table class="report-table">
        <thead>
          <tr>
            <th>Qtd.</th>
            <th>Modelo</th>
            <th>Tamanho</th>
            <th>Banho</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item) => `
            <tr>
              <td>${item.quantity}</td>
              <td>${item.model}</td>
              <td>${item.size}</td>
              <td>${item.bath}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    ${order.notes ? `<p class="detail-notes"><strong>Observa\u00e7\u00f5es:</strong> ${order.notes}</p>` : ""}
  `;
  elements.managementOrderDetail.querySelector("[data-management-edit]")?.addEventListener("click", () => editOrder(order.id));
  elements.managementOrderDetail.querySelector("[data-management-print]")?.addEventListener("click", () => printCollaboratorOrder(order.id));
  elements.managementOrderDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showCollaboratorOrderDetail(id) {
  if (!elements.collaboratorOrderDetail) return;
  const order = getVisibleOrders().find((item) => item.id === id);
  if (!order) return;
  const displayStatus = normalizeStatus(order.status);
  const totalPieces = countPieces([order]);
  elements.collaboratorOrderDetail.hidden = false;
  elements.collaboratorOrderDetail.innerHTML = `
    <div class="panel-title-row">
      <div>
        <p class="eyebrow">Pedido selecionado</p>
        <h2>${order.id}</h2>
      </div>
      <div class="report-actions">
        <button class="ghost-button small" type="button" data-detail-clone="${order.id}">Clonar pedido</button>
        <button class="primary-button small" type="button" data-detail-print="${order.id}">Imprimir</button>
      </div>
    </div>
    <div class="detail-summary">
      <span><strong>Status</strong>${displayStatus}</span>
      <span><strong>Data</strong>${formatDate(order.requestDate)}</span>
      <span><strong>Previs\u00e3o</strong>${formatDate(order.dueDate) || "-"}</span>
      <span><strong>Lead time</strong>${leadTimeText(order)}</span>
      <span><strong>Loja</strong>${order.origin}</span>
      <span><strong>Prioridade</strong>${order.priority}</span>
      <span><strong>Pe\u00e7as</strong>${totalPieces}</span>
      <span><strong>Itens</strong>${order.items.length}</span>
    </div>
    <div class="table-wrap compact-table">
      <table class="report-table">
        <thead>
          <tr>
            <th>Qtd.</th>
            <th>Modelo</th>
            <th>Tamanho</th>
            <th>Banho</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item) => `
            <tr>
              <td>${item.quantity}</td>
              <td>${item.model}</td>
              <td>${item.size}</td>
              <td>${item.bath}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    ${order.notes ? `<p class="detail-notes"><strong>Observa\u00e7\u00f5es:</strong> ${order.notes}</p>` : ""}
  `;
  elements.collaboratorOrderDetail.querySelector("[data-detail-clone]")?.addEventListener("click", () => cloneOrder(order.id));
  elements.collaboratorOrderDetail.querySelector("[data-detail-print]")?.addEventListener("click", () => printCollaboratorOrder(order.id));
  elements.collaboratorOrderDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function printManagementOrders(type) {
  if (!isInternalUser()) return;
  const selectedOrders = getFilteredOrders();
  if (!selectedOrders.length) {
    alert("Nenhum pedido encontrado para imprimir com os filtros atuais.");
    return;
  }

  const isAnalytical = type === "analytical";
  const title = isAnalytical ? "Relatório analítico de pedidos" : "Relatório gerencial de pedidos";
  const totalPieces = countPieces(selectedOrders);
  const openOrders = selectedOrders.filter((order) => normalizeStatus(order.status) !== "Entregue").length;
  const rows = selectedOrders
    .map((order) => {
      const pieces = countPieces([order]);
      const items = Array.isArray(order.items) ? order.items : [];
      const detail = isAnalytical
        ? items.map((item) => `${item.quantity}x ${item.model} ${item.size} ${item.bath}`).join("<br>")
        : compactReportItems(items);
      return `
        <tr>
          <td><strong>${order.id}</strong><br>${formatDate(order.requestDate)}</td>
          <td>${order.requester}<br><span>${order.origin}</span></td>
          <td>${normalizeStatus(order.status)}<br><span>${order.priority}</span></td>
          <td>${pieces}</td>
          <td>${detail}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: A4 landscape; margin: 7mm; }
          * { box-sizing: border-box; }
          html, body { width: 100%; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; color: #1d2b26; overflow: hidden; }
          .sheet { width: 100%; max-width: 283mm; margin: 0 auto; overflow: hidden; }
          header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #92ACA0; padding-bottom: 10px; margin-bottom: 12px; }
          .print-logo { display: block; width: 84px; max-height: 34px; object-fit: contain; object-position: left center; margin-bottom: 3px; }
          h1 { font-size: 14px; margin: 3px 0 0; text-transform: uppercase; }
          .printed-at { font-size: 9px; color: #597066; white-space: nowrap; }
          .summary { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
          .summary span { border: 1px solid #d5e0db; border-radius: 7px; padding: 6px 8px; font-size: 9.5px; font-weight: 700; }
          table { width: 100%; max-width: 100%; border-collapse: collapse; table-layout: fixed; font-size: ${isAnalytical ? "7.6px" : "8.4px"}; }
          th, td { border-bottom: 1px solid #d5e0db; padding: 4px 5px; text-align: left; vertical-align: top; line-height: 1.22; }
          th { background: #edf3f0; color: #2f4d40; text-transform: uppercase; font-size: 7.6px; }
          td { overflow-wrap: anywhere; word-break: break-word; }
          td span { color: #597066; }
          th:nth-child(1), td:nth-child(1) { width: 17%; }
          th:nth-child(2), td:nth-child(2) { width: 18%; }
          th:nth-child(3), td:nth-child(3) { width: 14%; }
          th:nth-child(4), td:nth-child(4) { width: 7%; text-align: right; font-weight: 700; }
          th:nth-child(5), td:nth-child(5) { width: 44%; }
        </style>
      </head>
      <body>
        <main class="sheet">
          <header>
            <div>
              <img class="print-logo" src="logo-veri.png" alt="VERI">
              <h1>${title}</h1>
            </div>
            <div class="printed-at">${formatDateTime(new Date().toISOString())}</div>
          </header>
          <div class="summary">
            <span>${selectedOrders.length} pedido(s)</span>
            <span>${openOrders} em aberto</span>
            <span>${totalPieces} peça(s)</span>
            <span>Formato: ${isAnalytical ? "Analítico" : "Gerencial"}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Pedido / Data</th>
                <th>Solicitante / Loja</th>
                <th>Status / Prioridade</th>
                <th>Peças</th>
                <th>${isAnalytical ? "Itens completos" : "Resumo"}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </main>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Não foi possível abrir a impressão. Verifique se o navegador bloqueou pop-ups.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function registerGalvanoplastyShipment(id) {
  if (!isInternalUser()) return;
  const order = orders.find((item) => item.id === id);
  if (!order) return;

  const receivedBy = prompt("Nome de quem recebeu as pe\u00e7as na Galvanoplastia:", order.galvanoplasty?.receivedBy || "");
  if (receivedBy === null) return;
  const trimmedReceivedBy = receivedBy.trim();
  if (!trimmedReceivedBy) {
    alert("Informe o nome de quem recebeu as pe\u00e7as.");
    return;
  }

  const returnDate = prompt("Data de retorno prevista/real da Galvanoplastia (AAAA-MM-DD):", order.galvanoplasty?.returnDate || order.dueDate || "");
  if (returnDate === null) return;
  const trimmedReturnDate = returnDate.trim();
  if (trimmedReturnDate && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedReturnDate)) {
    alert("Informe a data no formato AAAA-MM-DD ou deixe em branco.");
    return;
  }

  const now = new Date();
  const galvanoplasty = {
    ...(order.galvanoplasty || {}),
    sent: true,
    sentAt: now.toISOString(),
    sentBy: currentSession?.name || "Sistema",
    sentByLogin: currentSession?.login || "",
    receivedBy: trimmedReceivedBy,
    returnDate: trimmedReturnDate,
  };

  try {
    const updated = await patchOrder(id, {
      galvanoplasty,
      status: "Em prepara\u00e7\u00e3o de banho (galvanoplastia)",
      updatedBy: currentSession?.name || "",
      updatedByRole: currentSession?.role || "",
    });
    orders = orders.map((item) => (item.id === id ? { ...item, ...updated } : item));
    render();
    if (confirm("Envio registrado. Deseja imprimir o controle em duas vias agora?")) {
      printGalvanoplastyProtocol(id);
    }
  } catch (error) {
    alert(error.message || "N\u00e3o foi poss\u00edvel registrar o envio para Galvanoplastia.");
  }
}

function printGalvanoplastyProtocol(id) {
  const order = getVisibleOrders().find((item) => item.id === id) || orders.find((item) => item.id === id);
  if (!order) return;
  const galvanoplasty = order.galvanoplasty || {};
  const sentAt = galvanoplasty.sentAt ? new Date(galvanoplasty.sentAt) : new Date();
  const sentBy = galvanoplasty.sentBy || currentSession?.name || "";
  const receivedBy = galvanoplasty.receivedBy || "";
  const returnDate = galvanoplasty.returnDate || galvanoplasty.deliveryDate || "";
  const bathTotals = galvanoplastyBathTotals(order);
  const summaryGroups = compactGalvanoplastySummary(order);
  const summaryRows = summaryGroups.slice(0, 8);
  const remainingGroups = Math.max(0, summaryGroups.length - summaryRows.length);
  const totalPieces = countPieces([order]);
  const via = (label) => `
    <section class="copy">
      <header>
        <div>
          <img class="print-logo" src="logo-veri.png" alt="VERI">
          <h1>Controle de envio para Galvanoplastia</h1>
        </div>
        <span>Via: ${label}</span>
      </header>
      <div class="meta">
        <span><strong>Pedido</strong>${order.id}</span>
        <span><strong>${label === "Galvanoplastia" ? "Data recebimento" : "Data de envio"}</strong>${formatShortDate(sentAt)}</span>
        <span><strong>Hora</strong>${sentAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        <span><strong>Enviado por</strong>${sentBy}</span>
        <span><strong>Recebido por</strong>${receivedBy || "-"}</span>
        <span><strong>${label === "Galvanoplastia" ? "Data de retorno" : "Origem"}</strong>${label === "Galvanoplastia" ? formatShortDate(returnDate) || "__-__-__" : order.origin || "-"}</span>
      </div>
      <div class="totals">
        <span><strong>Total geral</strong>${totalPieces} pe\u00e7as</span>
        ${bathTotals.map((item) => `<span><strong>${item.bath}</strong>${item.quantity} pe\u00e7as</span>`).join("")}
      </div>
      <table>
        <thead><tr><th>Resumo para controle interno</th><th>Banho</th><th>Qtd.</th></tr></thead>
        <tbody>
          ${summaryRows.map((item) => `<tr><td>${item.label}</td><td>${item.bath}</td><td>${item.quantity}</td></tr>`).join("")}
          ${remainingGroups ? `<tr><td colspan="3">+ ${remainingGroups} grupo(s) adicional(is) detalhados no pedido digital.</td></tr>` : ""}
        </tbody>
      </table>
      <p class="note">Controle interno por pedido. Confer\u00eancia detalhada deve ser feita no sistema pelo n\u00famero do pedido.</p>
      <div class="signatures">
        ${
          label === "Almoxarifado"
            ? `<div class="line">Assinatura de quem enviou</div><div class="line">Recebido por: ${receivedBy || "________________________"}</div>`
            : `<div class="line">Data do recebimento: ${formatShortDate(sentAt)}</div><div class="line">Data de retorno: ${formatShortDate(returnDate) || "__-__-__"}</div>`
        }
      </div>
    </section>
  `;
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Galvanoplastia - ${order.id}</title>
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #1d2b26; margin: 0; }
          .copy { height: 136mm; padding: 7mm; border: 1px solid #92ACA0; overflow: hidden; page-break-inside: avoid; }
          .copy + .copy { margin-top: 5mm; }
          header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #92ACA0; padding-bottom: 4mm; margin-bottom: 4mm; }
          .print-logo { display: block; width: 76px; max-height: 30px; object-fit: contain; object-position: left center; margin-bottom: 2mm; }
          h1 { font-size: 13px; margin: 2mm 0 0; text-transform: uppercase; }
          header span { font-size: 13px; font-weight: 700; background: #e8f0ec; border-radius: 999px; padding: 7px 12px; }
          .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; margin-bottom: 3mm; font-size: 10px; }
          .meta span, .totals span { border: 1px solid #d5e0db; border-radius: 6px; padding: 5px; min-height: 28px; }
          .meta strong { display: block; font-size: 9px; color: #597066; text-transform: uppercase; margin-bottom: 2px; }
          .totals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; margin-bottom: 4mm; font-size: 11px; font-weight: 700; }
          .totals strong { display: block; font-size: 9px; color: #597066; text-transform: uppercase; margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10px; }
          th, td { border-bottom: 1px solid #d5e0db; padding: 4px 5px; text-align: left; }
          td { overflow-wrap: anywhere; word-break: break-word; }
          th { background: #edf3f0; font-size: 9px; text-transform: uppercase; }
          th:nth-child(2), td:nth-child(2) { width: 32mm; }
          th:last-child, td:last-child { text-align: right; width: 22mm; }
          .note { font-size: 9.5px; color: #597066; margin: 4mm 0 0; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 15mm; margin-top: 10mm; font-size: 10px; }
          .line { border-top: 1px solid #1d2b26; padding-top: 5px; }
        </style>
      </head>
      <body>
        ${via("Almoxarifado")}
        ${via("Galvanoplastia")}
      </body>
    </html>
  `;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("N\u00e3o foi poss\u00edvel abrir a impress\u00e3o. Verifique se o navegador bloqueou pop-ups.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function compactGalvanoplastySummary(order) {
  const grouped = new Map();
  (order.items || []).forEach((item) => {
    const key = [item.model, item.bath].join("||");
    const current = grouped.get(key) || { label: item.model, bath: item.bath, quantity: 0 };
    current.quantity += Number(item.quantity || 0);
    grouped.set(key, current);
  });
  return [...grouped.values()].sort((a, b) => String(a.label).localeCompare(String(b.label)) || String(a.bath).localeCompare(String(b.bath)));
}

function galvanoplastyBathTotals(order) {
  const grouped = new Map();
  (order.items || []).forEach((item) => {
    const bath = item.bath || "Sem banho";
    grouped.set(bath, (grouped.get(bath) || 0) + Number(item.quantity || 0));
  });
  return [...grouped.entries()].map(([bath, quantity]) => ({ bath, quantity })).sort((a, b) => String(a.bath).localeCompare(String(b.bath)));
}

function printCollaboratorOrder(id) {
  const order = getVisibleOrders().find((item) => item.id === id);
  if (!order) return;
  const totalPieces = countPieces([order]);
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${order.id}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #1d2b26; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #92ACA0; padding-bottom: 12px; margin-bottom: 16px; }
          .print-logo { display: block; width: 90px; max-height: 40px; object-fit: contain; object-position: right center; }
          h1 { font-size: 20px; margin: 0 0 6px; }
          p { margin: 4px 0; }
          .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
          .meta span { border: 1px solid #d5e0db; border-radius: 8px; padding: 8px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
          th, td { border-bottom: 1px solid #d5e0db; padding: 8px; text-align: left; }
          td { overflow-wrap: anywhere; word-break: break-word; }
          th { background: #edf3f0; }
          .sign { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 34px; }
          .line { border-top: 1px solid #1d2b26; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Pedido ${order.id}</h1>
            <p>Protocolo de pedido para consulta, confer\u00eancia e impress\u00e3o</p>
          </div>
          <img class="print-logo" src="logo-veri.png" alt="VERI">
        </div>
        <div class="meta">
          <span><strong>Status</strong><br>${normalizeStatus(order.status)}</span>
          <span><strong>Data</strong><br>${formatDate(order.requestDate)}</span>
          <span><strong>Previs\u00e3o</strong><br>${formatDate(order.dueDate) || "-"}</span>
          <span><strong>Lead time</strong><br>${leadTimeText(order)}</span>
          <span><strong>Loja</strong><br>${order.origin}</span>
          <span><strong>Solicitante</strong><br>${order.requester}</span>
          <span><strong>Pe\u00e7as</strong><br>${totalPieces}</span>
          <span><strong>Itens</strong><br>${order.items.length}</span>
        </div>
        <table>
          <thead><tr><th>Qtd.</th><th>Modelo</th><th>Tamanho</th><th>Banho</th></tr></thead>
          <tbody>
            ${order.items.map((item) => `<tr><td>${item.quantity}</td><td>${item.model}</td><td>${item.size}</td><td>${item.bath}</td></tr>`).join("")}
          </tbody>
        </table>
        ${order.notes ? `<p><strong>Observa\u00e7\u00f5es:</strong> ${order.notes}</p>` : ""}
        <div class="sign">
          <div class="line">Solicitante</div>
          <div class="line">Confer\u00eancia</div>
        </div>
      </body>
    </html>
  `;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("N\u00e3o foi poss\u00edvel abrir a impress\u00e3o. Verifique se o navegador bloqueou pop-ups.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function statusHelperText(status) {
  const messages = {
    "Pedido Recebido": "Solicitado \u00e0 f\u00e1brica",
    "Em separa\u00e7\u00e3o": "Em andamento",
    "Em prepara\u00e7\u00e3o de banho (galvanoplastia)": "Em banho",
    "P\u00f3s banho": "Confer\u00eancia ap\u00f3s banho",
    "Prepara\u00e7\u00e3o final": "Prepara\u00e7\u00e3o para entrega",
    Entregue: "Pedido finalizado",
  };
  const currentStatus = normalizeStatus(status);
  return messages[currentStatus] || currentStatus || "";
}

function cloneOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order || isInternalUser()) return;

  elements.editingId.value = "";
  elements.formTitle.textContent = "Clonar pedido";
  if (elements.orderNumberPreview) elements.orderNumberPreview.textContent = "";
  elements.requester.value = currentSession?.name || order.requester || "";
  elements.origin.value = order.origin || "";
  elements.priority.value = order.priority || "Normal";
  elements.status.value = statuses[0];
  elements.notes.value = order.notes || "";
  elements.itemsList.innerHTML = "";
  order.items.forEach((item) => addItemRow({ model: item.model, size: item.size, bath: item.bath, quantity: item.quantity }));
  if (!order.items.length) addItemRow();
  showView("requestView");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function canManageOrder(order) {
  if (isInternalUser()) return true;
  return (
    normalizeText(order.requester) === normalizeText(currentSession?.name || "") &&
    normalizePhone(order.phone) === normalizePhone(currentSession?.phone || "") &&
    normalizeStatus(order.status) === "Pedido Recebido"
  );
}

function isInternalUser() {
  return currentSession?.role === "master" || currentSession?.role === "consultant";
}

function isMasterUser() {
  return isMasterWorkspaceUser();
}

function isMasterWorkspaceUser() {
  return currentSession?.role === "master" && currentSession?.accessMode !== "consultant";
}

function buildStatusMessage(order) {
  const currentStatus = normalizeStatus(order.status);
  const totalPieces = countPieces([order]);
  const itemSummary = order.items
    .slice(0, 4)
    .map((item) => `${item.quantity}x ${item.model} ${item.size} ${item.bath}`)
    .join("; ");
  const extraItems = order.items.length > 4 ? `; +${order.items.length - 4} item(ns)` : "";
  const base = `Ol\u00e1, ${order.requester}. Aqui \u00e9 a equipe VERI.\n\nPedido: ${order.id}\nLoja/Setor: ${order.origin}\nItens: ${order.items.length}\nPe\u00e7as: ${totalPieces}\nResumo: ${itemSummary}${extraItems}`;
  const statusMessages = {
    "Pedido Recebido": `${base}\n\nStatus: Pedido recebido com sucesso.\nSua solicita\u00e7\u00e3o foi registrada para a f\u00e1brica. A pr\u00f3xima atualiza\u00e7\u00e3o ser\u00e1 feita pela Gest\u00e3o de Pedidos.\n\nObrigado por acompanhar pelo sistema VERI.`,
    "Em separa\u00e7\u00e3o": `${base}\n\nStatus: Em separa\u00e7\u00e3o.\nSeu pedido est\u00e1 em andamento na f\u00e1brica. Avisaremos assim que a etapa for conclu\u00edda.\n\nEquipe VERI.`,
    "Em prepara\u00e7\u00e3o de banho (galvanoplastia)": `${base}\n\nStatus: Em prepara\u00e7\u00e3o de banho (galvanoplastia).\nSeu pedido foi direcionado para a etapa de banho. Avisaremos na pr\u00f3xima movimenta\u00e7\u00e3o.\n\nEquipe VERI.`,
    "P\u00f3s banho": `${base}\n\nStatus: P\u00f3s banho.\nSeu pedido retornou do banho e est\u00e1 em confer\u00eancia para a etapa final.\n\nEquipe VERI.`,
    "Prepara\u00e7\u00e3o final": `${base}\n\nStatus: Prepara\u00e7\u00e3o final.\nSeu pedido est\u00e1 sendo preparado para entrega.\n\nEquipe VERI.`,
    Entregue: `${base}\n\nStatus: Entregue.\nSeu pedido foi finalizado e entregue. Obrigado por utilizar o sistema VERI.`,
  };

  return statusMessages[currentStatus] || `${base}\n\nStatus atual: ${currentStatus}.\n\nEquipe VERI.`;
}

function whatsappUrl(order) {
  return `https://wa.me/${phoneForWhatsapp(order.phone)}?text=${encodeURIComponent(buildStatusMessage(order))}`;
}

function renderReports() {
  const visibleOrders = getReportOrders();
  elements.reportTotalOrders.textContent = visibleOrders.length;
  elements.reportOpenOrders.textContent = visibleOrders.filter((order) => normalizeStatus(order.status) !== "Entregue").length;
  elements.reportTotalPieces.textContent = countPieces(visibleOrders);
  elements.reportBody.innerHTML = "";

  if (!visibleOrders.length) {
    elements.reportBody.innerHTML = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
    return;
  }

  visibleOrders.forEach((order) => {
    const row = document.createElement("tr");
    const totalPieces = countPieces([order]);
    const itemSummary = compactReportItems(order.items);
    row.innerHTML = `
      <td class="protocol-id">
        <strong>${order.id}</strong>
        <span>${formatDate(order.requestDate)}</span>
        <span>Previs\u00e3o: ${formatDate(order.dueDate) || "-"}</span>
        <span>Lead time: ${leadTimeText(order)}</span>
        <span class="pill ${order.priority === "Urgente" ? "urgent" : ""}">${order.priority}</span>
        <span class="pill status-pill">${normalizeStatus(order.status)}</span>
      </td>
      <td>
        <strong>${order.requester}</strong>
        <span>${formatPhone(order.phone)}</span>
        <span>${order.origin}</span>
      </td>
      <td>
        <strong>${totalPieces}</strong> pe\u00e7as<br>
        <strong>${order.items.length}</strong> item(ns)
      </td>
      <td class="protocol-items">${itemSummary}</td>
      <td class="protocol-signature">
        <span>Separado por: __________________</span>
        <span>Entregue em: ____/____/______</span>
        <span>Recebido por: _________________</span>
      </td>
    `;
    elements.reportBody.append(row);
  });
}

function compactReportItems(items) {
  const grouped = new Map();
  (items || []).forEach((item) => {
    const key = `${item.model} ${item.size} ${item.bath}`;
    grouped.set(key, (grouped.get(key) || 0) + Number(item.quantity || 0));
  });
  const lines = [...grouped.entries()].map(([label, quantity]) => `${quantity}x ${label}`);
  const visibleLines = lines.slice(0, 6);
  const hidden = Math.max(0, lines.length - visibleLines.length);
  return `${visibleLines.join("<br>")}${hidden ? `<br><strong>+ ${hidden} item(ns)</strong>` : ""}`;
}

function getReportOrders() {
  const search = elements.reportSearchInput.value.trim().toLowerCase();
  const status = elements.reportFilterStatus.value;
  const priority = elements.reportFilterPriority.value;

  return getVisibleOrders().filter((order) => {
    const text = [
      order.id,
      order.requester,
      order.phone,
      order.origin,
      order.priority,
      normalizeStatus(order.status),
      order.notes,
      ...order.items.map((item) => `${item.model} ${item.size} ${item.bath}`),
    ]
      .join(" ")
      .toLowerCase();

    return (!search || text.includes(search)) && (!status || normalizeStatus(order.status) === status) && (!priority || order.priority === priority);
  });
}

function countPieces(orderList) {
  return orderList.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0), 0);
}

function countByStatus() {
  const visibleOrders = getDashboardOrders();
  return statuses.reduce((acc, status) => {
    acc[status] = visibleOrders.filter((order) => normalizeStatus(order.status) === status).length;
    return acc;
  }, {});
}

function countByBath() {
  return getDashboardOrders().reduce((acc, order) => {
    order.items.forEach((item) => {
      acc[item.bath] = (acc[item.bath] || 0) + item.quantity;
    });
    return acc;
  }, {});
}

function countByPriority() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const priority = order.priority || "Sem prioridade";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts, 4);
}

function countByOrigin() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const origin = order.origin || "Sem loja";
    acc[origin] = (acc[origin] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts, 8);
}

function countByOriginMonth() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const origin = order.origin || "Sem loja";
    const month = order.requestDate ? order.requestDate.slice(0, 7).split("-").reverse().join("/") : "Sem mês";
    const label = `${month} · ${origin}`;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts, 10);
}

function countByDate() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const date = formatDate(order.requestDate) || "Sem data";
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts, 8);
}

function countByRequester() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const requester = order.requester || "Sem solicitante";
    acc[requester] = (acc[requester] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts, 8);
}

function countPiecesByRequester() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const requester = order.requester || "Sem solicitante";
    acc[requester] = (acc[requester] || 0) + countPieces([order]);
    return acc;
  }, {});
  return sortCountObject(counts, 8);
}

function sortCountObject(data, limit = 8) {
  return Object.fromEntries(Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, limit));
}

function nextOrderId() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  return `PED-${stamp}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
}

function exportCsv() {
  if (!isInternalUser()) return;
  const rows = [
    ["Pedido", "Data", "Previs\u00e3o", "Lead time", "Solicitante", "Celular", "Origem", "Prioridade", "Status", "Modelo", "Tamanho", "Banho", "Quantidade", "Observa\u00e7\u00f5es"],
  ];

  getReportOrders().forEach((order) => {
    order.items.forEach((item) => {
      rows.push([
        order.id,
        order.requestDate,
        order.dueDate || "",
        leadTimeText(order),
        order.requester,
        order.phone || "",
        order.origin,
        order.priority,
        order.status,
        item.model,
        item.size,
        item.bath,
        item.quantity,
        order.notes,
      ]);
    });
  });

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadUrl(url, "pedidos-pecas-fabrica.csv", true);
}

function exportXlsx() {
  const params = new URLSearchParams({
    search: elements.reportSearchInput.value.trim(),
    status: elements.reportFilterStatus.value,
    priority: elements.reportFilterPriority.value,
  });

  if (!isInternalUser()) {
    params.set("phone", currentSession.phone || "");
  }

  downloadUrl(`/api/report.xlsx?${params.toString()}`, "relatorio-pedidos-veri.xlsx");
}

function downloadUrl(url, filename, revokeAfterClick = false) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.append(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    if (revokeAfterClick) URL.revokeObjectURL(url);
  }, 1000);
}

function openExternalLink(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.append(link);
  link.click();
  window.setTimeout(() => link.remove(), 1000);
}

function phoneForWhatsapp(value) {
  const phone = normalizePhone(value);
  if (phone.startsWith("55")) return phone;
  return `55${phone}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatShortDate(value) {
  if (!value) return "";
  let date = value instanceof Date ? value : null;
  if (!date) {
    const text = String(value);
    date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00Z`) : new Date(text);
  }
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: value instanceof Date ? undefined : "UTC",
  }).format(date).replace(/\//g, "-");
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function leadTimeText(order) {
  if (!order?.requestDate || !order?.dueDate) return "-";
  const start = new Date(`${order.requestDate}T00:00:00Z`);
  const end = new Date(`${order.dueDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";
  const days = Math.max(0, Math.round((end - start) / 86400000));
  return `${days} dia${days === 1 ? "" : "s"}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatCostMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(Number(value || 0));
}

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function roundCost(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 1000000) / 1000000;
}

function normalizeCostSettings(settings = {}) {
  return {
    goldValue: Number(settings.goldValue || settings.gold_value || 800),
    rhodiumValue: Number(settings.rhodiumValue || settings.rhodium_value || 2500),
    rhodiumFactor: Number(settings.rhodiumFactor || settings.rhodium_factor || 0.7),
  };
}

function roleLabel(role) {
  const labels = {
    collaborator: "Colaborador",
    consultant: "Gest\u00e3o de Pedidos",
    master: "Master",
  };
  return labels[role] || role || "";
}

function normalizeOrders(orderList) {
  return orderList.map((order) => ({
    ...order,
    requester: repairText(order.requester),
    phone: normalizePhone(order.phone || ""),
    origin: repairText(order.origin),
    priority: repairText(order.priority) || "Normal",
    status: normalizeStatus(repairText(order.status)),
    notes: repairText(order.notes),
    requestDate: order.requestDate || todayIso,
    dueDate: order.dueDate || "",
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          model: repairText(item.model),
          size: repairText(item.size),
          bath: normalizeBath(repairText(item.bath)),
        }))
      : [],
  }));
}

function repairText(value) {
  const text = String(value || "");
  if (!/[\u00c2\u00c3]/.test(text)) return text;

  try {
    return decodeURIComponent(escape(text));
  } catch (error) {
    return text
      .replace(/\u00c3\u00a1/g, "\u00e1")
      .replace(/\u00c3\u00a9/g, "\u00e9")
      .replace(/\u00c3\u00ad/g, "\u00ed")
      .replace(/\u00c3\u00b3/g, "\u00f3")
      .replace(/\u00c3\u00ba/g, "\u00fa")
      .replace(/\u00c3\u00a7/g, "\u00e7")
      .replace(/\u00c3\u00a3/g, "\u00e3")
      .replace(/\u00c3\u00b5/g, "\u00f5")
      .replace(/\u00c3\u00a2/g, "\u00e2")
      .replace(/\u00c3\u00aa/g, "\u00ea")
      .replace(/\u00c3\u00b4/g, "\u00f4")
      .replace(/\u00c3\u0081/g, "\u00c1")
      .replace(/\u00c3\u0089/g, "\u00c9")
      .replace(/\u00c3\u008d/g, "\u00cd")
      .replace(/\u00c3\u0093/g, "\u00d3")
      .replace(/\u00c3\u009a/g, "\u00da")
      .replace(/\u00c3\u0087/g, "\u00c7")
      .replace(/\u00c3\u0083/g, "\u00c3")
      .replace(/\u00c3\u0095/g, "\u00d5")
      .replace(/\u00c3\u0082/g, "\u00c2")
      .replace(/\u00c3\u008a/g, "\u00ca")
      .replace(/\u00c3\u0094/g, "\u00d4")
      .replace(/\u00c2\u00b7/g, "\u00b7")
      .replace(/\u00c2/g, "");
  }
}

function normalizeStatus(status) {
  const text = repairText(status).trim();
  const key = normalizeText(text);
  if (key === "entregue" || key === "finalizado" || key === "finalizado (entregue)") return "Entregue";
  if (key === "pedido enviado" || key === "recebido" || key === "pedido recebido") return "Pedido Recebido";
  if (key === "em separacao") return "Em separa\u00e7\u00e3o";
  if (
    key === "galvanoplastia" ||
    key === "em banho" ||
    key === "em preparacao de banho" ||
    key === "em preparacao de banho (galvanoplastia)"
  ) {
    return "Em prepara\u00e7\u00e3o de banho (galvanoplastia)";
  }
  if (key === "pos banho" || key === "pos-banho") return "P\u00f3s banho";
  if (key === "preparacao final") return "Prepara\u00e7\u00e3o final";
  return "Em separa\u00e7\u00e3o";
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeLoginPhone(value) {
  const digits = normalizePhone(value);
  if (digits.length === 13 && digits.startsWith("55")) return digits.slice(2);
  return digits;
}

function isValidBrazilMobile(value) {
  const phone = normalizeLoginPhone(value);
  if (phone.length !== 11) return false;
  if (/^(\d)\1+$/.test(phone)) return false;
  const ddd = Number(phone.slice(0, 2));
  return ddd >= 11 && ddd <= 99 && phone[2] === "9";
}

function normalizeBath(value) {
  const bath = String(value || "").trim();
  if (["Ouro Quebec", "Ouro Diamont", "Ouro 18k", "Ouro Ros\u00e9", "Prata"].includes(bath)) return "Ouro";
  if (["R\u00f3dio Branco", "Rodio", "R\u00f3dio"].includes(bath)) return "R\u00f3dio";
  return bath;
}

function formatPhone(value) {
  const phone = normalizePhone(value);
  if (phone.length === 11) return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  if (phone.length === 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  return phone;
}

