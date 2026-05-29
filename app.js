const STORAGE_KEY = "factoryPartOrders";
const SESSION_KEY = "factoryPartOrdersSession";
const USERS_KEY = "factoryPartOrdersUsersV2";
const API_ORDERS_URL = "/api/orders";
const defaultUsers = [
  { login: "Charles Marinho", password: "12345", name: "Charles Marinho", role: "admin", mustChangePassword: true },
  { login: "Juliano", password: "12345", name: "Juliano", role: "operator", mustChangePassword: true },
];

const statuses = [
  "Pedido Recebido",
  "Em separação",
  "Entregue",
];

const origins = [
  "Escritório VQF",
  "Loja Cambuí Campinas",
  "Loja Dom Pedro",
  "Loja Iguatemi Campinas",
  "Loja Iguatemi Sorocaba",
  "Showroom Barueri",
  "Showroom Campinas",
  "Showroom Indaiatuba",
  "Showroom São Paulo",
  "Showroom Sorocaba",
  "Showroom Sumaré",
  "Site",
  "Veri Em Casa",
];

const partSizes = {
  Argolinha: ["3.0 x 0.60", "3.5 x 0.70", "3.5 x 0.80", "4.2 x 0.70", "4.2 x 0.80", "5.0 x 0.80"],
  "Extensor Losango": ["3 cm", "5 cm", "7 cm", "10 cm"],
  "Extensor balãozinho": ["3 cm", "5 cm", "7 cm", "10 cm"],
  "Extensor Vqzinha": ["2,5 cm", "4,5 cm"],
  Timbre: ["VERI"],
  "Fecho lagosta": ["9 mm", "10 mm", "11 mm", "12 mm"],
  "Fecho Italiano": ["7mm", "10mm", "11mm"],
  "Fecho Mola": ["5mm", "6mm", "7mm"],
  "Fecho Boia": ["9mm", "11mm", "13mm"],
  Veneziana: ["40 cm", "42 cm", "44 cm", "50 cm", "60 cm", "70 cm"],
  Tarraxa: ["P", "M", "G", "BABY"],
};

const baths = ["Ouro", "Ródio"];

const sampleOrders = [
  {
    id: "PED-2026-0001",
    requestDate: "2026-05-20",
    requester: "Ana Costa",
    phone: "11999990001",
    origin: "Showroom Campinas",
    priority: "Urgente",
    dueDate: "",
    status: "Em separação",
    notes: "Separar banho com prioridade para vitrine.",
    attachmentName: "",
    items: [
      { model: "Argolinha", size: "3.5 x 0.70", bath: "Ouro", quantity: 10 },
      { model: "Extensor Losango", size: "5 cm", bath: "Ródio", quantity: 5 },
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
let currentSession = loadSession();
let apiAvailable = false;
let users = loadUsers();
let pendingUser = null;
let activeLoginMode = "common";

const elements = {
  entryScreen: document.querySelector("#entryScreen"),
  appShell: document.querySelector("#appShell"),
  passwordScreen: document.querySelector("#passwordScreen"),
  loginForm: document.querySelector("#loginForm"),
  passwordForm: document.querySelector("#passwordForm"),
  commonLoginTab: document.querySelector("#commonLoginTab"),
  internalLoginTab: document.querySelector("#internalLoginTab"),
  commonLoginFields: document.querySelector("#commonLoginFields"),
  internalLoginFields: document.querySelector("#internalLoginFields"),
  loginName: document.querySelector("#loginName"),
  loginPhone: document.querySelector("#loginPhone"),
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
  newOrder: document.querySelector("#newOrder"),
  exportCsv: document.querySelector("#exportCsv"),
  printReport: document.querySelector("#printReport"),
  exportPdf: document.querySelector("#exportPdf"),
  exportXlsx: document.querySelector("#exportXlsx"),
  searchInput: document.querySelector("#searchInput"),
  filterStatus: document.querySelector("#filterStatus"),
  filterPriority: document.querySelector("#filterPriority"),
  reportSearchInput: document.querySelector("#reportSearchInput"),
  reportFilterStatus: document.querySelector("#reportFilterStatus"),
  reportFilterPriority: document.querySelector("#reportFilterPriority"),
  ordersList: document.querySelector("#ordersList"),
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
};

init();

async function init() {
  populateOriginOptions();
  populateStatusOptions();
  orders = await loadOrders();
  applySessionState();

  elements.loginForm.addEventListener("submit", handleLogin);
  elements.passwordForm.addEventListener("submit", handlePasswordChange);
  elements.commonLoginTab.addEventListener("click", () => setLoginMode("common"));
  elements.internalLoginTab.addEventListener("click", () => setLoginMode("internal"));
  elements.logout.addEventListener("click", logout);
  elements.form.addEventListener("submit", handleSubmit);
  elements.addItem.addEventListener("click", () => addItemRow());
  elements.addItemBottom.addEventListener("click", () => addItemRow());
  elements.cancelEdit.addEventListener("click", resetForm);
  elements.newOrder.addEventListener("click", () => {
    resetForm();
    showView("requestView");
  });
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.printReport.addEventListener("click", () => window.print());
  elements.exportPdf.addEventListener("click", () => window.print());
  elements.exportXlsx.addEventListener("click", exportXlsx);
  elements.searchInput.addEventListener("input", render);
  elements.filterStatus.addEventListener("change", render);
  elements.filterPriority.addEventListener("change", render);
  elements.reportSearchInput.addEventListener("input", renderReports);
  elements.reportFilterStatus.addEventListener("change", renderReports);
  elements.reportFilterPriority.addEventListener("change", renderReports);
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
    return Array.isArray(parsed) ? parsed : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session) {
  currentSession = session;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  applySessionState();
}

function handleLogin(event) {
  event.preventDefault();
  if (activeLoginMode === "internal") {
    handleInternalLogin();
    return;
  }

  const name = elements.loginName.value.trim();
  const phone = normalizePhone(elements.loginPhone.value);

  if (!name) {
    showLoginError("Informe o nome do solicitante.");
    return;
  }

  if (phone.length < 10) {
    showLoginError("Informe um celular válido para receber avisos.");
    return;
  }

  saveSession({ name, phone, role: "user" });
}

function handleInternalLogin() {
  const login = elements.internalLogin.value.trim();
  const password = elements.masterPassword.value;
  const user = users.find((item) => normalizeText(item.login) === normalizeText(login));

  if (!user || user.password !== password) {
    showLoginError("Login ou senha inválidos.");
    return;
  }

  if (user.mustChangePassword) {
    pendingUser = user;
    elements.entryScreen.hidden = true;
    elements.passwordScreen.hidden = false;
    return;
  }

  saveSession({ name: user.name, role: user.role, login: user.login });
}

function showLoginError(message) {
  elements.loginError.textContent = message;
}

function setLoginMode(mode) {
  activeLoginMode = mode;
  elements.loginError.textContent = "";
  elements.commonLoginTab.classList.toggle("active", mode === "common");
  elements.internalLoginTab.classList.toggle("active", mode === "internal");
  elements.commonLoginFields.classList.toggle("active-login-mode", mode === "common");
  elements.internalLoginFields.classList.toggle("active-login-mode", mode === "internal");
}

function handlePasswordChange(event) {
  event.preventDefault();
  const password = elements.newPassword.value;
  const confirmation = elements.confirmPassword.value;

  if (!pendingUser) return;

  if (password !== confirmation) {
    elements.passwordError.textContent = "As senhas não conferem.";
    return;
  }

  if (password === "12345") {
    elements.passwordError.textContent = "Escolha uma senha diferente da provisória.";
    return;
  }

  users = users.map((user) =>
    user.login === pendingUser.login ? { ...user, password, mustChangePassword: false } : user
  );
  saveUsers();
  const user = users.find((item) => item.login === pendingUser.login);
  pendingUser = null;
  elements.passwordForm.reset();
  saveSession({ name: user.name, role: user.role, login: user.login });
}

function applySessionState() {
  const isLoggedIn = Boolean(currentSession?.name);
  elements.entryScreen.hidden = isLoggedIn;
  elements.passwordScreen.hidden = true;
  elements.appShell.hidden = !isLoggedIn;

  if (!isLoggedIn) return;

  elements.activeUser.textContent = `Conectado: ${currentSession.name}`;
  elements.newOrder.hidden = isInternalUser();
  document.body.classList.toggle("is-admin", isInternalUser());
  showView(isInternalUser() ? "managementView" : "requestView");
  resetForm();
  render();
}

function showView(viewId) {
  elements.views.forEach((view) => view.classList.toggle("active-view", view.id === viewId));
  elements.viewButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
}

window.showView = showView;

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  currentSession = null;
  elements.loginError.textContent = "";
  elements.masterPassword.value = "";
  elements.loginPhone.value = "";
  elements.appShell.hidden = true;
  elements.passwordScreen.hidden = true;
  elements.entryScreen.hidden = false;
  document.body.classList.remove("is-admin");
  elements.loginName.focus();
}

function populateOriginOptions() {
  for (const origin of origins) {
    elements.origin.append(new Option(origin, origin));
  }
}

function populateStatusOptions() {
  for (const status of statuses) {
    elements.status.append(new Option(status, status));
    elements.filterStatus.append(new Option(status, status));
    elements.reportFilterStatus.append(new Option(status, status));
  }
}

async function refreshOrders() {
  if (!currentSession?.name || !apiAvailable) return;
  orders = await loadOrders(false);
  render();
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
    } catch {
      apiAvailable = false;
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
  } catch {
    apiAvailable = false;
  }

  orders = [fallbackOrder, ...orders];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return fallbackOrder;
}

async function patchOrder(id, updates) {
  orders = orders.map((order) => (order.id === id ? { ...order, ...updates } : order));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  if (!apiAvailable) return orders.find((order) => order.id === id);

  try {
    const response = await fetch(`${API_ORDERS_URL}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    apiAvailable = response.ok;
    if (response.ok) return await response.json();
  } catch {
    apiAvailable = false;
  }

  return orders.find((order) => order.id === id);
}

async function removeOrder(id) {
  orders = orders.filter((order) => order.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  if (!apiAvailable) return;

  try {
    const response = await fetch(`${API_ORDERS_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    apiAvailable = response.ok;
  } catch {
    apiAvailable = false;
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!currentSession?.name) return;
  orders = await loadOrders();

  const items = getItemsFromForm();

  if (!items.length) {
    alert("Adicione pelo menos um item ao pedido.");
    return;
  }

  const existingId = elements.editingId.value;
  const requester = isInternalUser() ? elements.requester.value.trim() : currentSession.name;
  const existingOrder = existingId ? orders.find((item) => item.id === existingId) : null;
  const order = {
    requestDate: existingOrder?.requestDate || todayIso,
    requester,
    phone: currentSession.role === "user" ? currentSession.phone : existingOrder?.phone || "",
    origin: elements.origin.value,
    priority: elements.priority.value,
    dueDate: "",
    status: isInternalUser() ? elements.status.value : statuses[0],
    notes: elements.notes.value.trim(),
    items,
  };

  const savedOrder = existingId ? await patchOrder(existingId, { ...order, id: existingId }) : await createOrder(order);
  if (currentSession.role === "user") {
    alert(`Solicitação ${savedOrder.id} enviada com sucesso.`);
    logout();
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

function addItemRow(item = {}) {
  const fragment = elements.itemTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".item-row");
  const modelSelect = row.querySelector(".item-model");
  populateModelOptions(modelSelect, item.model);
  populateSizeOptions(row, modelSelect.value, item.size);
  modelSelect.addEventListener("change", () => populateSizeOptions(row, modelSelect.value));
  populateBathOptions(row.querySelector(".item-bath"), item.bath);
  row.querySelector(".item-quantity").value = item.quantity || "";
  row.querySelector(".remove-item").addEventListener("click", () => {
    if (elements.itemsList.children.length > 1) row.remove();
  });
  elements.itemsList.append(row);
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
  elements.formTitle.textContent = "Carrinho da solicitação";
  elements.orderNumberPreview.textContent = "Novo pedido a cada envio";
  elements.requester.value = isInternalUser() ? "" : currentSession?.name || "";
  elements.requester.readOnly = !isInternalUser();
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
  elements.orderNumberPreview.textContent = order.id;
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
  if (currentSession?.role !== "admin") return;
  if (!confirm("Excluir este pedido?")) return;
  await removeOrder(id);
  render();
}

async function updateStatus(id, status) {
  if (!isInternalUser()) return;
  await patchOrder(id, { status });
  render();
}

function render() {
  renderMetrics();
  renderCharts();
  renderOrders();
  renderDashboardTable();
  renderReports();
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

function renderMetrics() {
  const visibleOrders = getVisibleOrders();
  const urgent = visibleOrders.filter((order) => order.priority === "Urgente").length;
  const newOpen = visibleOrders.filter((order) => order.status === "Pedido Recebido").length;
  const progress = visibleOrders.filter((order) => order.status === "Em separação").length;
  const delivered = visibleOrders.filter((order) => order.status === "Entregue").length;
  elements.metricTotal.textContent = newOpen;
  elements.metricUrgent.textContent = urgent;
  elements.metricOpen.textContent = progress;
  elements.metricPieces.textContent = delivered;
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
        <span>${totalPieces} peças</span>
        <span>${order.items.length} itens</span>
      </div>
      <ul class="order-items">
        ${order.items.map((item) => `<li>${item.quantity}x ${item.model} · ${item.size} · ${item.bath}</li>`).join("")}
      </ul>
      <div class="order-footer">
        <label>
          Status
          <select data-order-status="${order.id}" ${!isInternalUser() ? "disabled" : ""}>
            ${statuses.map((status) => `<option ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <div class="order-actions">
          ${canManage ? `<button class="text-button" type="button" data-edit="${order.id}">Editar</button>` : ""}
          ${isInternalUser() && order.phone ? `<a class="notify-button" href="${whatsappUrl(order)}" target="_blank" rel="noopener noreferrer">Enviar WhatsApp</a>` : ""}
          ${currentSession?.role === "admin" ? `<button class="text-button" type="button" data-delete="${order.id}">Excluir</button>` : ""}
        </div>
      </div>
    `;

    card.querySelector("[data-order-status]").addEventListener("change", (event) => updateStatus(order.id, event.target.value));
    card.querySelector("[data-edit]")?.addEventListener("click", () => editOrder(order.id));
    card.querySelector("[data-delete]")?.addEventListener("click", () => deleteOrder(order.id));
    elements.ordersList.append(card);
  });
}

function canManageOrder(order) {
  return isInternalUser() || normalizeText(order.requester) === normalizeText(currentSession?.name || "");
}

function isInternalUser() {
  return currentSession?.role === "admin" || currentSession?.role === "operator";
}

function buildStatusMessage(order) {
  const statusMessages = {
    "Pedido Recebido": `Olá, ${order.requester}. Seu pedido ${order.id} foi recebido com sucesso pela fábrica. Em breve iniciaremos a separação. Equipe VERI.`,
    "Em separação": `Olá, ${order.requester}. Seu pedido ${order.id} está em andamento na fábrica. Avisaremos assim que for entregue. Equipe VERI.`,
    Entregue: `Olá, ${order.requester}. Seu pedido ${order.id} foi entregue. Obrigado por acompanhar pelo sistema VERI.`,
  };

  return statusMessages[order.status] || `Olá, ${order.requester}. Seu pedido ${order.id} está com status: ${order.status}. Equipe VERI.`;
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
  const visibleOrders = getVisibleOrders();
  return statuses.reduce((acc, status) => {
    acc[status] = visibleOrders.filter((order) => order.status === status).length;
    return acc;
  }, {});
}

function countByBath() {
  return getVisibleOrders().reduce((acc, order) => {
    order.items.forEach((item) => {
      acc[item.bath] = (acc[item.bath] || 0) + item.quantity;
    });
    return acc;
  }, {});
}

function countByOrigin() {
  const counts = getVisibleOrders().reduce((acc, order) => {
    const origin = order.origin || "Sem loja";
    acc[origin] = (acc[origin] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts);
}

function countByDate() {
  const counts = getVisibleOrders().reduce((acc, order) => {
    const date = formatDate(order.requestDate) || "Sem data";
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts);
}

function countByRequester() {
  const counts = getVisibleOrders().reduce((acc, order) => {
    const requester = order.requester || "Sem solicitante";
    acc[requester] = (acc[requester] || 0) + 1;
    return acc;
  }, {});
  return sortCountObject(counts);
}

function countPiecesByRequester() {
  const counts = getVisibleOrders().reduce((acc, order) => {
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
    ["Pedido", "Data", "Solicitante", "Celular", "Origem", "Prioridade", "Status", "Modelo", "Tamanho", "Banho", "Quantidade", "Observações"],
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
  if (status === "Pedido Recebido") return "Pedido Recebido";
  return "Em separação";
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

function normalizeBath(value) {
  const bath = String(value || "").trim();
  if (["Ouro Quebec", "Ouro Diamont", "Ouro 18k", "Ouro Rosé", "Prata"].includes(bath)) return "Ouro";
  if (["Ródio Branco", "Rodio", "Ródio"].includes(bath)) return "Ródio";
  return bath;
}

function formatPhone(value) {
  const phone = normalizePhone(value);
  if (phone.length === 11) return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  if (phone.length === 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  return phone;
}
