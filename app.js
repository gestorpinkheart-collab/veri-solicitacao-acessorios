const STORAGE_KEY = "factoryPartOrders";
const SESSION_KEY = "factoryPartOrdersSession";
const USERS_KEY = "factoryPartOrdersUsersV2";
const API_ORDERS_URL = "/api/orders";
const API_ACCESS_LOGS_URL = "/api/access-logs";
const API_PRICES_URL = "/api/prices";
const API_COST_SETTINGS_URL = "/api/cost-settings";
const defaultUsers = [
  { login: "Charles Marinho", password: "12345", name: "Charles Marinho", role: "master", mustChangePassword: true },
  { login: "Juliano", password: "12345", name: "Juliano", role: "consultant", mustChangePassword: true },
];

const statuses = [
  "Pedido Enviado",
  "Em separaÃ§Ã£o",
  "Entregue",
];

const origins = [
  "EscritÃ³rio VQF",
  "Loja CambuÃ­ Campinas",
  "Loja Dom Pedro",
  "Loja Iguatemi Campinas",
  "Loja Iguatemi Sorocaba",
  "Showroom Barueri",
  "Showroom Campinas",
  "Showroom Indaiatuba",
  "Showroom SÃ£o Paulo",
  "Showroom Sorocaba",
  "Showroom SumarÃ©",
  "Site",
  "Veri Em Casa",
];

const partSizes = {
  Argolinha: ["3.0 x 0.60", "3.5 x 0.70", "3.5 x 0.80", "4.2 x 0.70", "4.2 x 0.80", "5.0 x 0.80"],
  "Extensor Losango": ["3 cm", "5 cm", "7 cm", "10 cm"],
  "Extensor balÃ£ozinho": ["3 cm", "5 cm", "7 cm", "10 cm"],
  "Extensor Vqzinha": ["2,5 cm", "4,5 cm"],
  Timbre: ["VERI"],
  "Fecho lagosta": ["9 mm", "10 mm", "11 mm", "12 mm"],
  "Fecho Italiano": ["7mm", "10mm", "11mm"],
  "Fecho Mola": ["5mm", "6mm", "7mm"],
  "Fecho Boia": ["9mm", "11mm", "13mm"],
  Veneziana: ["40 cm", "42 cm", "44 cm", "50 cm", "60 cm", "70 cm"],
  Tarraxa: ["P", "M", "G", "BABY"],
};

const baths = ["Ouro", "RÃ³dio"];

const sampleOrders = [
  {
    id: "PED-2026-0001",
    requestDate: "2026-05-20",
    requester: "Ana Costa",
    phone: "11999990001",
    origin: "Showroom Campinas",
    priority: "Urgente",
    dueDate: "",
    status: "Em separaÃ§Ã£o",
    notes: "Separar banho com prioridade para vitrine.",
    attachmentName: "",
    items: [
      { model: "Argolinha", size: "3.5 x 0.70", bath: "Ouro", quantity: 10 },
      { model: "Extensor Losango", size: "5 cm", bath: "RÃ³dio", quantity: 5 },
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
    status: "Pedido Enviado",
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
let pendingUser = null;
let activeLoginMode = "common";
let collaboratorAccessMode = "login";

const elements = {
  entryScreen: document.querySelector("#entryScreen"),
  appShell: document.querySelector("#appShell"),
  passwordScreen: document.querySelector("#passwordScreen"),
  loginForm: document.querySelector("#loginForm"),
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
  editingId: document.querySelector("#editingId"),
  formTitle: document.querySelector("#formTitle"),
  orderNumberPreview: document.querySelector("#orderNumberPreview"),
  requester: document.querySelector("#requester"),
  origin: document.querySelector("#origin"),
  priority: document.querySelector("#priority"),
  status: document.querySelector("#status"),
  notes: document.querySelector("#notes"),
  addItem: document.querySelector("#addItem"),
  addItemBottom: document.querySelector("#addItemBottom"),
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
  widgetReceived: document.querySelector("#widgetReceived"),
  widgetProgress: document.querySelector("#widgetProgress"),
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
  collaboratorOrdersList: document.querySelector("#collaboratorOrdersList"),
  refreshMyOrders: document.querySelector("#refreshMyOrders"),
  orderCount: document.querySelector("#orderCount"),
  statusChart: document.querySelector("#statusChart"),
  bathChart: document.querySelector("#bathChart"),
  originChart: document.querySelector("#originChart"),
  frequencyChart: document.querySelector("#frequencyChart"),
  requesterChart: document.querySelector("#requesterChart"),
  requesterPiecesChart: document.querySelector("#requesterPiecesChart"),
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
  elements.passwordForm.addEventListener("submit", handlePasswordChange);
  document.querySelectorAll("[data-login-mode]").forEach((button) => {
    button.addEventListener("click", () => setLoginMode(button.dataset.loginMode));
  });
  document.querySelectorAll("[data-collaborator-access]").forEach((button) => {
    button.addEventListener("click", () => setCollaboratorAccessMode(button.dataset.collaboratorAccess));
  });
  elements.logout.addEventListener("click", logout);
  elements.form.addEventListener("submit", handleSubmit);
  elements.addItem.addEventListener("click", () => addItemRow());
  elements.addItemBottom.addEventListener("click", () => addItemRow());
  elements.cancelEdit.addEventListener("click", resetForm);
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.printReport.addEventListener("click", () => window.print());
  elements.exportPdf.addEventListener("click", () => window.print());
  elements.exportXlsx.addEventListener("click", exportXlsx);
  elements.searchInput.addEventListener("input", render);
  elements.filterStatus.addEventListener("change", render);
  elements.filterPriority.addEventListener("change", render);
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
    showLoginError("Informe um celular vÃ¡lido com DDD e 9 dÃ­gitos. Exemplo: (11) 99999-9999. Esse nÃºmero serÃ¡ usado para avisos do WhatsApp.");
    return;
  }

  const knownNames = await findKnownNamesForPhone(phone);
  const differentNames = knownNames.filter((knownName) => normalizeText(knownName) !== normalizeText(name));
  if (differentNames.length) {
    const previousNames = differentNames.slice(0, 3).join(", ");
    alert(`AtenÃ§Ã£o: este celular jÃ¡ possui histÃ³rico no sistema vinculado a: ${previousNames}.\n\nPara manter a consulta dos pedidos e os avisos por WhatsApp corretos, use sempre este mesmo nÃºmero quando for vocÃª realizando a solicitaÃ§Ã£o.`);
    await logAccess(
      { name, phone, role: "collaborator", login: name },
      "alerta_nome_celular",
      { previousNames: differentNames, message: "Celular jÃ¡ utilizado com outro nome de colaborador." }
    );
  }

  saveSession({ name, phone, role: "collaborator" });
}

async function handleCollaboratorLogin() {
  const login = elements.collaboratorLogin.value.trim();
  const password = elements.collaboratorPassword.value;

  if (!login || !password) {
    showLoginError("Informe usuÃ¡rio e senha para entrar.");
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
    showLoginError("UsuÃ¡rio ou senha invÃ¡lidos.");
    return;
  }

  saveSession({
    name: user.name,
    phone: user.phone,
    origin: user.origin,
    role: "collaborator",
    login: user.login,
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
    showLoginError("Informe um telefone corporativo vÃ¡lido com DDD e 9 dÃ­gitos. Exemplo: (11) 99999-9999.");
    return;
  }
  if (password.length < 4) {
    showLoginError("A senha deve ter pelo menos 4 caracteres.");
    return;
  }
  if (password !== confirmPassword) {
    showLoginError("A confirmaÃ§Ã£o de senha nÃ£o confere.");
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
      showLoginError(payload.error || "NÃ£o foi possÃ­vel criar o acesso.");
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
    showLoginError(error.message || "NÃ£o foi possÃ­vel criar o acesso.");
  }
}

async function handleInternalLogin() {
  const login = elements.internalLogin.value.trim();
  const password = elements.masterPassword.value;
  let user = null;
  try {
    user = await authenticateInternalUser(login, password, activeLoginMode);
  } catch (error) {
    showLoginError(error.message);
    return;
  }

  if (!user) {
    showLoginError("Login ou senha invÃ¡lidos.");
    return;
  }

  if (user.mustChangePassword) {
    pendingUser = { ...user, currentPassword: password };
    elements.entryScreen.hidden = true;
    elements.passwordScreen.hidden = false;
    return;
  }

  saveSession({ name: user.name, role: user.role, login: user.login });
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
    elements.passwordError.textContent = "As senhas nÃ£o conferem.";
    return;
  }

  if (password === "12345") {
    elements.passwordError.textContent = "Escolha uma senha diferente da provisÃ³ria.";
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
      elements.passwordError.textContent = payload.error || "NÃ£o foi possÃ­vel trocar a senha.";
      return;
    }
    pendingUser = null;
    elements.passwordForm.reset();
    saveSession({ name: payload.user.name, role: payload.user.role, login: payload.user.login });
  } catch (error) {
    users = users.map((user) =>
      user.login === pendingUser.login ? { ...user, password, mustChangePassword: false } : user
    );
    saveUsers();
    const user = users.find((item) => item.login === pendingUser.login);
    pendingUser = null;
    elements.passwordForm.reset();
    if (user) saveSession({ name: user.name, role: user.role, login: user.login });
    else elements.passwordError.textContent = error.message;
  }
}

function applySessionState() {
  const isLoggedIn = Boolean(currentSession?.name);
  elements.entryScreen.hidden = isLoggedIn;
  elements.passwordScreen.hidden = true;
  elements.appShell.hidden = !isLoggedIn;

  if (!isLoggedIn) return;

  elements.activeUser.textContent = `Conectado: ${currentSession.name}`;
  document.body.classList.toggle("is-admin", isInternalUser());
  document.body.classList.toggle("is-master", isMasterUser());
  document.body.classList.toggle("is-collaborator", currentSession.role === "collaborator");
  showView(isInternalUser() ? "managementView" : "requestView");
  resetForm();
  if (isMasterUser()) loadMasterData();
  render();
}

function showView(viewId) {
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
      throw new Error("API indisponÃ­vel. Confira a conexÃ£o do Render com o Supabase.");
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
      throw new Error("API indisponÃ­vel. Confira a conexÃ£o do Render com o Supabase.");
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
      throw new Error("API indisponÃ­vel. Confira a conexÃ£o do Render com o Supabase.");
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
  renderMasterPanel();
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
    alert(`NÃ£o foi possÃ­vel salvar os parÃ¢metros.\n\n${error.message}`);
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
    alert(`NÃ£o foi possÃ­vel salvar o preÃ§o.\n\n${error.message}`);
  }
}

async function deletePrice(index) {
  if (!isMasterUser()) return;
  prices.splice(index, 1);
  try {
    await savePrices();
    renderMasterPanel();
  } catch (error) {
    alert(`NÃ£o foi possÃ­vel excluir o preÃ§o.\n\n${error.message}`);
  }
}

async function deletePiecePrice(model, size) {
  if (!isMasterUser()) return;
  prices = prices.filter((price) => !(price.model === model && price.size === size));
  try {
    await savePrices();
    renderMasterPanel();
  } catch (error) {
    alert(`NÃ£o foi possÃ­vel excluir o preÃ§o.\n\n${error.message}`);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!currentSession?.name) return;
  try {
    orders = await loadOrders();
  } catch (error) {
    alert(`NÃ£o foi possÃ­vel carregar os pedidos do banco.\n\n${error.message}`);
    return;
  }

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
    dueDate: "",
    status: isInternalUser() ? elements.status.value : statuses[0],
    notes: elements.notes.value.trim(),
    items: pricedItems,
    updatedBy: currentSession.name,
    updatedByRole: currentSession.role,
  };

  let savedOrder;
  try {
    savedOrder = existingId ? await patchOrder(existingId, { ...order, id: existingId }) : await createOrder(order);
  } catch (error) {
    alert(`NÃ£o foi possÃ­vel salvar o pedido no banco.\n\n${error.message}`);
    return;
  }
  if (currentSession.role === "collaborator") {
    alert(`SolicitaÃ§Ã£o ${savedOrder.id} enviada com sucesso.`);
    resetForm();
    await refreshOrders();
    return;
  }
  resetForm();
  showView("managementView");
  render();
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
  if (normalizedBath === "RÃ³dio") {
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
  elements.formTitle.textContent = "Carrinho da solicitaÃ§Ã£o";
  if (elements.orderNumberPreview) elements.orderNumberPreview.textContent = "";
  elements.requester.value = isInternalUser() ? "" : currentSession?.name || "";
  elements.requester.readOnly = !isInternalUser();
  if (!isInternalUser() && currentSession?.origin) elements.origin.value = currentSession.origin;
  elements.status.value = statuses[0];
  elements.status.disabled = !isInternalUser();
  elements.itemsList.innerHTML = "";
  addItemRow();
}

function editOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  if (!canManageOrder(order)) return;

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
    alert(`NÃ£o foi possÃ­vel excluir o pedido no banco.\n\n${error.message}`);
  }
  render();
}

async function updateStatus(id, status) {
  if (!isInternalUser()) return;
  try {
    await patchOrder(id, { status, updatedBy: currentSession.name, updatedByRole: currentSession.role });
  } catch (error) {
    alert(`NÃ£o foi possÃ­vel alterar o status no banco.\n\n${error.message}`);
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
      <td>${log.userName || log.login || "Sem usuÃ¡rio"}</td>
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
  };
  return labels[eventType] || eventType || "Login";
}

function renderOrderHistory(historyRows) {
  elements.orderHistoryBody.innerHTML = "";
  if (!historyRows.length) {
    elements.orderHistoryBody.innerHTML = '<tr><td colspan="5">Nenhuma movimentaÃ§Ã£o registrada.</td></tr>';
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

function renderPrices() {
  elements.pricesBody.innerHTML = "";
  const piecePrices = getUniquePiecePrices();
  if (!piecePrices.length) {
    elements.pricesBody.innerHTML = '<tr><td colspan="6">Nenhum preÃ§o cadastrado.</td></tr>';
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
      <td><button class="action-button danger-action" type="button" title="Excluir" aria-label="Excluir preÃ§o" data-price-delete="${price.model}||${price.size}">
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

  return getVisibleOrders().filter((order) => {
    const text = [
      order.id,
      order.requester,
      order.phone,
      order.origin,
      order.priority,
      order.status,
      order.notes,
      ...order.items.map((item) => `${item.model} ${item.size} ${item.bath}`),
    ]
      .join(" ")
      .toLowerCase();

    return (!search || text.includes(search)) && (!status || order.status === status) && (!priority || order.priority === priority);
  });
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
      (!status || order.status === status) &&
      (!origin || order.origin === origin) &&
      (!requester || normalizeText(order.requester).includes(requester))
    );
  });
}

function renderMetrics() {
  const visibleOrders = getDashboardOrders();
  const urgent = visibleOrders.filter((order) => order.priority === "Urgente").length;
  const newOpen = visibleOrders.filter((order) => order.status === "Pedido Enviado").length;
  const progress = visibleOrders.filter((order) => order.status === "Em separaÃ§Ã£o").length;
  const delivered = visibleOrders.filter((order) => order.status === "Entregue").length;
  elements.metricTotal.textContent = newOpen;
  elements.metricUrgent.textContent = urgent;
  elements.metricOpen.textContent = progress;
  elements.metricPieces.textContent = delivered;
}

function renderStatusWidgets() {
  const visibleOrders = getVisibleOrders();
  elements.widgetReceived.textContent = visibleOrders.filter((order) => order.status === "Pedido Enviado").length;
  elements.widgetProgress.textContent = visibleOrders.filter((order) => order.status === "Em separaÃ§Ã£o").length;
  elements.widgetDelivered.textContent = visibleOrders.filter((order) => order.status === "Entregue").length;
}

function renderCharts() {
  renderBarChart(elements.statusChart, countByStatus(), statuses);
  renderBarChart(elements.bathChart, countByBath(), Object.keys(countByBath()));
  const originCounts = countByOrigin();
  const frequencyCounts = countByDate();
  renderBarChart(elements.originChart, originCounts, Object.keys(originCounts));
  renderBarChart(elements.frequencyChart, frequencyCounts, Object.keys(frequencyCounts));
  const requesterCounts = countByRequester();
  const requesterPieces = countPiecesByRequester();
  renderBarChart(elements.requesterChart, requesterCounts, Object.keys(requesterCounts));
  renderBarChart(elements.requesterPiecesChart, requesterPieces, Object.keys(requesterPieces));
}

function renderDashboardTable() {
  if (!elements.dashboardBody) return;
  const grouped = new Map();

  getVisibleOrders().forEach((order) => {
    const key = order.requester || "Sem solicitante";
    const current = grouped.get(key) || { requester: key, orders: 0, pieces: 0, open: 0, delivered: 0 };
    current.orders += 1;
    current.pieces += countPieces([order]);
    if (order.status === "Entregue") current.delivered += 1;
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

function renderOrders() {
  const filtered = getFilteredOrders();
  elements.orderCount.textContent = `${filtered.length} encontrados`;
  elements.ordersList.innerHTML = "";

  if (!filtered.length) {
    elements.ordersList.innerHTML = '<div class="empty">Nenhum pedido encontrado.</div>';
    return;
  }

  filtered.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    const totalPieces = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const priorityClass = order.priority === "Urgente" ? "urgent" : "";
    const canManage = canManageOrder(order);
    card.innerHTML = `
      <div class="order-top">
        <strong>${order.id}</strong>
        <div class="order-tags">
          <span class="pill ${priorityClass}">${order.priority}</span>
          <span class="pill status-pill">${order.status}</span>
        </div>
      </div>
      <div class="order-meta">
        <span>${formatDate(order.requestDate)}</span>
        <span>${order.requester}</span>
        <span>${formatPhone(order.phone) || "Sem celular"}</span>
        <span>${order.origin}</span>
        <span>${totalPieces} peÃ§as</span>
        <span>${order.items.length} itens</span>
      </div>
      <ul class="order-items">
        ${order.items.map((item) => `<li>${item.quantity}x ${item.model} Â· ${item.size} Â· ${item.bath}</li>`).join("")}
      </ul>
      <div class="order-footer">
        <label>
          Status
          <select data-order-status="${order.id}" ${!isInternalUser() ? "disabled" : ""}>
            ${statuses.map((status) => `<option ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <div class="order-actions" aria-label="AÃ§Ãµes do pedido">
          ${canManage ? `<button class="action-button" type="button" data-edit="${order.id}" title="Editar" aria-label="Editar pedido">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="m4 16.6-.7 4.1 4.1-.7L18.8 8.6l-3.4-3.4L4 16.6Zm16.1-9.3 1-1a2 2 0 0 0 0-2.8l-.6-.6a2 2 0 0 0-2.8 0l-1 1 3.4 3.4Z"/>
            </svg>
          </button>` : ""}
          ${isInternalUser() && order.phone ? `<a class="action-button whatsapp-action" href="${whatsappUrl(order)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="Enviar WhatsApp">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12.1 3a8.9 8.9 0 0 0-7.6 13.5L3.4 21l4.6-1.1A8.9 8.9 0 1 0 12.1 3Zm0 2a6.9 6.9 0 1 1-3.5 12.8l-.4-.2-2.1.5.5-2-.3-.4A6.9 6.9 0 0 1 12.1 5Zm-3 3.6c-.2 0-.5.1-.7.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.6 2.6 4 3.5 2 .8 2.4.6 2.8.6.4 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.2l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.7-.4Z"/>
            </svg>
          </a>` : ""}
          ${isMasterUser() ? `<button class="action-button danger-action" type="button" data-delete="${order.id}" title="Excluir" aria-label="Excluir pedido">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 11H6.8L6 9Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"/>
            </svg>
          </button>` : ""}
        </div>
      </div>
    `;

    card.querySelector("[data-order-status]").addEventListener("change", (event) => updateStatus(order.id, event.target.value));
    card.querySelector("[data-edit]")?.addEventListener("click", () => editOrder(order.id));
    card.querySelector("[data-delete]")?.addEventListener("click", () => deleteOrder(order.id));
    elements.ordersList.append(card);
  });
}

function renderCollaboratorOrders() {
  if (!elements.collaboratorOrdersList || isInternalUser()) return;
  const myOrders = getVisibleOrders().sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")));
  elements.collaboratorOrdersList.innerHTML = "";

  if (!myOrders.length) {
    elements.collaboratorOrdersList.innerHTML = '<div class="empty">Nenhum pedido enviado por este celular.</div>';
    return;
  }

  myOrders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card compact-order-card";
    const totalPieces = countPieces([order]);
    const priorityClass = order.priority === "Urgente" ? "urgent" : "";
    card.innerHTML = `
      <div class="order-top">
        <strong>${order.id}</strong>
        <div class="order-tags">
          <span class="pill ${priorityClass}">${order.priority}</span>
          <span class="pill status-pill">${order.status}</span>
        </div>
      </div>
      <div class="order-meta">
        <span>${formatDate(order.requestDate)}</span>
        <span>${order.origin}</span>
        <span>${totalPieces} peÃ§as</span>
        <span>${order.items.length} itens</span>
      </div>
      <ul class="order-items">
        ${order.items.map((item) => `<li>${item.quantity}x ${item.model} Â· ${item.size} Â· ${item.bath}</li>`).join("")}
      </ul>
      <div class="order-footer collaborator-order-footer">
        <span class="status-note">${statusHelperText(order.status)}</span>
        <button class="action-button clone-action" type="button" data-clone="${order.id}" title="Clonar pedido" aria-label="Clonar pedido">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M8 7V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3v3c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h3Zm2 0h3c1.1 0 2 .9 2 2v5h3V4h-8v3ZM5 9v10h8V9H5Z"/>
          </svg>
        </button>
      </div>
    `;
    card.querySelector("[data-clone]").addEventListener("click", () => cloneOrder(order.id));
    elements.collaboratorOrdersList.append(card);
  });
}

function statusHelperText(status) {
  const messages = {
    "Pedido Enviado": "Solicitado à fábrica",
    "Em separaÃ§Ã£o": "Em andamento",
    Entregue: "Pedido finalizado",
  };
  return messages[status] || status || "";
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
  return isInternalUser() || normalizeText(order.requester) === normalizeText(currentSession?.name || "");
}

function isInternalUser() {
  return currentSession?.role === "master" || currentSession?.role === "consultant";
}

function isMasterUser() {
  return currentSession?.role === "master";
}

function buildStatusMessage(order) {
  const totalPieces = countPieces([order]);
  const itemSummary = order.items
    .slice(0, 4)
    .map((item) => `${item.quantity}x ${item.model} ${item.size} ${item.bath}`)
    .join("; ");
  const extraItems = order.items.length > 4 ? `; +${order.items.length - 4} item(ns)` : "";
  const base = `OlÃ¡, ${order.requester}. Aqui Ã© a equipe VERI.\n\nPedido: ${order.id}\nLoja/Setor: ${order.origin}\nItens: ${order.items.length}\nPeÃ§as: ${totalPieces}\nResumo: ${itemSummary}${extraItems}`;
  const statusMessages = {
    "Pedido Enviado": `${base}\n\nStatus: Pedido enviado com sucesso.\nSua solicitação foi registrada para a fábrica. A próxima atualização será feita pela Gestão de Pedidos.\n\nObrigado por acompanhar pelo sistema VERI.`,
    "Em separaÃ§Ã£o": `${base}\n\nStatus: Em separaÃ§Ã£o.\nSeu pedido estÃ¡ em andamento na fÃ¡brica. Avisaremos assim que a etapa for concluÃ­da.\n\nEquipe VERI.`,
    Entregue: `${base}\n\nStatus: Entregue.\nSeu pedido foi finalizado e entregue. Obrigado por utilizar o sistema VERI.`,
  };

  return statusMessages[order.status] || `${base}\n\nStatus atual: ${order.status}.\n\nEquipe VERI.`;
}

function whatsappUrl(order) {
  return `https://wa.me/${phoneForWhatsapp(order.phone)}?text=${encodeURIComponent(buildStatusMessage(order))}`;
}

function renderReports() {
  const visibleOrders = getReportOrders();
  elements.reportTotalOrders.textContent = visibleOrders.length;
  elements.reportOpenOrders.textContent = visibleOrders.filter((order) => order.status !== "Entregue").length;
  elements.reportTotalPieces.textContent = countPieces(visibleOrders);
  elements.reportBody.innerHTML = "";

  if (!visibleOrders.length) {
    elements.reportBody.innerHTML = '<tr><td colspan="8">Nenhum pedido encontrado.</td></tr>';
    return;
  }

  visibleOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.requester}</td>
      <td>${formatPhone(order.phone)}</td>
      <td>${order.origin}</td>
      <td>${order.status}</td>
      <td>${order.priority}</td>
      <td>${countPieces([order])}</td>
      <td>${order.items.map((item) => `${item.quantity}x ${item.model} ${item.size} ${item.bath}`).join("<br>")}</td>
    `;
    elements.reportBody.append(row);
  });
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
      order.status,
      order.notes,
      ...order.items.map((item) => `${item.model} ${item.size} ${item.bath}`),
    ]
      .join(" ")
      .toLowerCase();

    return (!search || text.includes(search)) && (!status || order.status === status) && (!priority || order.priority === priority);
  });
}

function countPieces(orderList) {
  return orderList.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0), 0);
}

function countByStatus() {
  const visibleOrders = getDashboardOrders();
  return statuses.reduce((acc, status) => {
    acc[status] = visibleOrders.filter((order) => order.status === status).length;
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

function countByOrigin() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const origin = order.origin || "Sem loja";
    acc[origin] = (acc[origin] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts);
}

function countByDate() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const date = formatDate(order.requestDate) || "Sem data";
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts);
}

function countByRequester() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const requester = order.requester || "Sem solicitante";
    acc[requester] = (acc[requester] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts);
}

function countPiecesByRequester() {
  const counts = getDashboardOrders().reduce((acc, order) => {
    const requester = order.requester || "Sem solicitante";
    acc[requester] = (acc[requester] || 0) + countPieces([order]);
    return acc;
  }, {});
  return sortCountObject(counts);
}

function sortCountObject(data) {
  return Object.fromEntries(Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8));
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
    ["Pedido", "Data", "Solicitante", "Celular", "Origem", "Prioridade", "Status", "Modelo", "Tamanho", "Banho", "Quantidade", "ObservaÃ§Ãµes"],
  ];

  getReportOrders().forEach((order) => {
    order.items.forEach((item) => {
      rows.push([
        order.id,
        order.requestDate,
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

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
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
    consultant: "GestÃ£o de Pedidos",
    master: "Master",
  };
  return labels[role] || role || "";
}

function normalizeOrders(orderList) {
  return orderList.map((order) => ({
    ...order,
    status: normalizeStatus(order.status),
    phone: normalizePhone(order.phone || ""),
    requestDate: order.requestDate || todayIso,
    dueDate: "",
    priority: order.priority || "Normal",
    items: Array.isArray(order.items) ? order.items.map((item) => ({ ...item, bath: normalizeBath(item.bath) })) : [],
  }));
}

function normalizeStatus(status) {
  if (status === "Entregue") return "Entregue";
  if (status === "Pedido Recebido") return "Pedido Enviado";
  if (status === "Pedido Enviado") return "Pedido Enviado";
  return "Em separaÃ§Ã£o";
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
  if (["Ouro Quebec", "Ouro Diamont", "Ouro 18k", "Ouro RosÃ©", "Prata"].includes(bath)) return "Ouro";
  if (["RÃ³dio Branco", "Rodio", "RÃ³dio"].includes(bath)) return "RÃ³dio";
  return bath;
}

function formatPhone(value) {
  const phone = normalizePhone(value);
  if (phone.length === 11) return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  if (phone.length === 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  return phone;
}
