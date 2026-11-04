from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from json import dumps, loads
from pathlib import Path
from threading import Lock
from urllib.parse import parse_qs, quote, unquote, urlparse
from zipfile import ZIP_DEFLATED, ZipFile
from io import BytesIO
from html import escape
from os import environ, replace as replace_file
from sys import stderr
from time import time
from traceback import print_exc
from datetime import datetime, timedelta, timezone
from secrets import token_hex, token_urlsafe
from hashlib import pbkdf2_hmac, sha256
from base64 import urlsafe_b64decode, urlsafe_b64encode
from math import isfinite
import hmac
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from unicodedata import category, normalize as unicode_normalize

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "orders.json"
PRICES_FILE = ROOT / "prices.json"
COST_SETTINGS_FILE = ROOT / "cost_settings.json"
USERS_FILE = ROOT / "users.json"
PASSWORD_RESETS_FILE = ROOT / "password_resets.json"
ACCESS_LOGS_FILE = ROOT / "access_logs.json"
LOCK = Lock()
# Só estes arquivos são servidos pela web; o resto da pasta (dados, código, .git) fica fechado.
PUBLIC_FILES = {
    "/",
    "/index.html",
    "/app.js",
    "/styles.css",
    "/logo-veri.png",
    "/logo-veri-white.png",
    "/logo-veri-original.jpg",
    "/favicon.ico",
}

# Brasil sem horário de verão (UTC-3). Não usamos zoneinfo porque o Windows não traz tzdata.
BR_TZ = timezone(timedelta(hours=-3))
MAX_BODY_BYTES = 1024 * 1024
# Sem script inline: as janelas de impressão usam só <style> e o print() é chamado pela janela de origem.
CONTENT_SECURITY_POLICY = (
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data: https://fonts.gstatic.com; "
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; frame-ancestors 'none'; "
    "base-uri 'none'; form-action 'self'"
)
SESSION_TTL_SECONDS = 12 * 60 * 60
SESSION_USER_CACHE_SECONDS = 60
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 200
PBKDF2_ITERATIONS = 200_000
PASSWORD_HASH_PREFIX = "pbkdf2_sha256"
RESET_CODE_MINUTES = 30
# Limites de tentativas (memória do processo).
LOGIN_MAX_FAILURES = 5
LOGIN_FAILURE_WINDOW_SECONDS = 15 * 60
LOGIN_BLOCK_SECONDS = 15 * 60
RESET_REQUESTS_PER_IP = 5
RESET_REQUEST_WINDOW_SECONDS = 60 * 60
REGISTRATIONS_PER_IP = 10
REGISTRATION_WINDOW_SECONDS = 60 * 60

ORDER_STATUSES = (
    "Pedido Recebido",
    "Em separação",
    "Em preparação de banho (galvanoplastia)",
    "Pós banho",
    "Preparação final",
    "Entrega parcial",
    "Finalizado",
)
ORDER_PRIORITIES = ("Normal", "Urgente")
PRICE_BATHS = ("Bruto", "Ouro", "Ródio")
INTERNAL_ROLES = ("consultant", "master")
ALL_ROLES = ("collaborator", "consultant", "master")
# Aba de entrada -> papéis aceitos. Master também entra pela aba Gestão de Pedidos.
LOGIN_TAB_ROLES = {
    "collaborator": ("collaborator",),
    "consultant": ("consultant", "master"),
    "master": ("master",),
}
# Campos que cada perfil pode alterar em PATCH /api/orders/{id}. "history" é sempre do servidor.
COLLABORATOR_UPDATE_FIELDS = ("origin", "priority", "notes", "items")
ORDER_UPDATE_FIELDS = (
    "requestDate",
    "dueDate",
    "requester",
    "phone",
    "origin",
    "priority",
    "status",
    "notes",
    "items",
    "galvanoplasty",
    "deliveries",
)
ORDER_TEXT_LIMITS = {"requester": 120, "origin": 120, "priority": 20, "notes": 2000, "phone": 20}
MAX_ORDER_ITEMS = 200
MAX_DELIVERIES = 500
MAX_PRICES = 5000
ITEM_TEXT_FIELDS = ("model", "size", "bath")
ITEM_NUMBER_FIELDS = ("unitCost", "weight", "goldThousandth", "bathCost", "totalUnitCost", "lineCost")
ITEM_SNAPSHOT_FIELDS = ("goldValue", "rhodiumValue", "rhodiumFactor")
CLIENT_ACCESS_EVENTS = ("alerta_nome_celular",)
ORDER_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

SESSION_EXPIRED_MESSAGE = "Sessão expirada. Entre novamente."
FORBIDDEN_MESSAGE = "Seu perfil não tem permissão para esta ação."
GENERIC_STORAGE_MESSAGE = "Não foi possível acessar o banco de dados agora. Tente novamente em instantes."
GENERIC_RESET_MESSAGE = "Pedido enviado. O Master vai confirmar e te enviar o código."
INVALID_LOGIN_MESSAGE = "Login ou senha inválidos."


def load_env_file():
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        environ.setdefault(key.strip().lstrip("﻿"), value.strip().strip('"').strip("'"))


load_env_file()
SUPABASE_URL = environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_TABLE = environ.get("SUPABASE_ORDERS_TABLE", "accessory_orders")
SUPABASE_ACCESS_LOGS_TABLE = environ.get("SUPABASE_ACCESS_LOGS_TABLE", "accessory_access_logs")
SUPABASE_PRICES_TABLE = environ.get("SUPABASE_PRICES_TABLE", "accessory_prices")
SUPABASE_COST_SETTINGS_TABLE = environ.get("SUPABASE_COST_SETTINGS_TABLE", "accessory_cost_settings")
SUPABASE_USERS_TABLE = environ.get("SUPABASE_USERS_TABLE", "accessory_users")
SUPABASE_PASSWORD_RESETS_TABLE = environ.get("SUPABASE_PASSWORD_RESETS_TABLE", "accessory_password_resets")


def resolve_session_secret():
    secret = environ.get("SESSION_SECRET", "").strip()
    if secret:
        return secret.encode("utf-8")
    if SUPABASE_SERVICE_ROLE_KEY:
        return sha256(f"acessorios-session:{SUPABASE_SERVICE_ROLE_KEY}".encode("utf-8")).digest()
    # Modo local: segredo novo a cada processo (reiniciar desloga todo mundo).
    return token_hex(32).encode("utf-8")


SESSION_SECRET = resolve_session_secret()

# Usuários semeados apenas quando a base de usuários está totalmente vazia.
# A senha provisória é sorteada e aparece só no log do servidor.
DEFAULT_USERS = [
    {"login": "Charles Marinho", "name": "Charles Marinho", "role": "master"},
    {"login": "Willians.Jorge", "name": "Willians Jorge", "role": "master"},
    {"login": "Juliano", "name": "Juliano", "role": "consultant"},
]


class StorageError(RuntimeError):
    pass


class ApiError(Exception):
    def __init__(self, status, message, headers=None):
        super().__init__(message)
        self.status = status
        self.message = message
        self.headers = headers or {}


class CredentialError(ValueError):
    """Senha atual ou código de autorização errados (conta para o limite de tentativas)."""


try:
    # Um caractere que o console não suporta nunca pode derrubar o registro de erro.
    stderr.reconfigure(errors="backslashreplace")
except (AttributeError, ValueError):
    pass


def log_error(message):
    print(f"[{now_br():%Y-%m-%d %H:%M:%S}] {message}", file=stderr, flush=True)


class RequestHandler(SimpleHTTPRequestHandler):
    timeout = 20

    def __init__(self, *args, **kwargs):
        self.session_payload = None
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def guess_type(self, path):
        content_type = super().guess_type(path)
        if path.endswith((".html", ".js", ".css")) and "charset=" not in content_type:
            return f"{content_type}; charset=utf-8"
        return content_type

    def do_GET(self):
        self.handle_safely(self.route_get)

    def do_HEAD(self):
        self.handle_safely(self.route_head)

    def do_PUT(self):
        self.handle_safely(self.route_put)

    def do_POST(self):
        self.handle_safely(self.route_post)

    def do_PATCH(self):
        self.handle_safely(self.route_patch)

    def do_DELETE(self):
        self.handle_safely(self.route_delete)

    def handle_safely(self, route):
        try:
            route()
        except ApiError as exc:
            self.send_json({"ok": False, "error": exc.message}, status=exc.status, headers=exc.headers)
        except StorageError as exc:
            log_error(f"{self.command} {urlparse(self.path).path}: {exc}")
            self.send_json({"ok": False, "error": GENERIC_STORAGE_MESSAGE}, status=503)
        except ValueError as exc:
            self.send_json({"ok": False, "error": str(exc)}, status=400)
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception:
            log_error(f"Erro inesperado em {self.command} {urlparse(self.path).path}")
            print_exc(file=stderr)
            try:
                self.send_json({"ok": False, "error": "Erro interno."}, status=500)
            except Exception:
                pass

    def route_get(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self.send_json(health_status())
            return

        if path == "/api/orders":
            user = self.require_session()
            self.send_json(visible_orders_for(user, read_orders()))
            return

        if path == "/api/status":
            user = self.require_session()
            filters = parse_qs(parsed.query)
            orders = visible_orders_for(user, read_orders())
            if user.get("role") in INTERNAL_ROLES:
                phone = only_digits(filters.get("phone", [""])[0])
                orders = [order for order in orders if only_digits(order.get("phone")) == phone]
            self.send_json(orders)
            return

        if path == "/api/report.xlsx":
            user = self.require_session()
            filters = parse_qs(parsed.query)
            if user.get("role") not in INTERNAL_ROLES:
                filters.pop("phone", None)
            self.send_xlsx(filter_orders(visible_orders_for(user, read_orders()), filters))
            return

        if path == "/api/access-logs":
            self.require_session(roles=("master",))
            self.send_json(read_access_logs())
            return

        if path == "/api/prices":
            self.require_session()
            self.send_json(read_prices())
            return

        if path == "/api/cost-settings":
            self.require_session()
            self.send_json(read_cost_settings())
            return

        if path.startswith("/api/"):
            raise ApiError(404, "Rota não encontrada.")

        if path not in PUBLIC_FILES:
            self.send_error(404)
            return
        super().do_GET()

    def route_head(self):
        if urlparse(self.path).path not in PUBLIC_FILES:
            self.send_error(404)
            return
        super().do_HEAD()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def route_put(self):
        path = urlparse(self.path).path

        if path == "/api/prices":
            self.require_session(roles=("master",))
            prices = self.read_json_body()
            if not isinstance(prices, list):
                raise ValueError("A lista de preços é obrigatória.")
            write_prices(prices)
            self.send_json({"ok": True})
            return

        if path == "/api/cost-settings":
            self.require_session(roles=("master",))
            settings = self.read_json_body()
            if not isinstance(settings, dict):
                raise ValueError("Os parâmetros de custo são obrigatórios.")
            write_cost_settings(settings)
            self.send_json({"ok": True})
            return

        raise ApiError(404, "Rota não encontrada.")

    def route_post(self):
        path = urlparse(self.path).path
        public_routes = {
            "/api/auth": self.post_auth,
            "/api/users": self.post_register,
            "/api/users/password": self.post_change_password,
            "/api/password-reset/request": self.post_reset_request,
            "/api/password-reset/complete": self.post_reset_complete,
            "/api/access-logs": self.post_access_log,
            "/api/orders": self.post_order,
        }
        if path in public_routes:
            public_routes[path]()
            return

        admin_routes = {
            "/api/users/admin-list": lambda master, payload: {"users": list_users_for_master(master)},
            "/api/password-reset/admin-list": lambda master, payload: {
                "requests": list_password_reset_requests_for_master(master)
            },
            "/api/password-reset/admin-decision": lambda master, payload: {
                "request": decide_password_reset_request(master, payload)
            },
            "/api/users/admin-password": lambda master, payload: {"user": admin_reset_user_password(master, payload)},
            "/api/users/admin-update": lambda master, payload: {"user": admin_update_user(master, payload)},
            "/api/users/admin-status": lambda master, payload: {"user": admin_set_user_status(master, payload)},
            "/api/users/admin-delete": lambda master, payload: {"login": admin_delete_user(master, payload)},
            "/api/users/management": lambda master, payload: {"user": create_management_user(master, payload)},
            "/api/admin/database": lambda master, payload: {"database": read_admin_database(master)},
        }
        if path in admin_routes:
            master_user = self.require_session(roles=("master",))
            payload = self.read_json_body()
            if not isinstance(payload, dict):
                raise ValueError("Dados inválidos.")
            result = admin_routes[path](master_user, payload)
            self.send_json({"ok": True, **result}, status=201 if path == "/api/users/management" else 200)
            return

        raise ApiError(404, "Rota não encontrada.")

    def post_auth(self):
        credentials = self.read_json_body()
        if not isinstance(credentials, dict):
            raise ValueError("Dados inválidos.")
        self.send_json(login_user(credentials, self.client_ip(), self.user_agent()))

    def post_register(self):
        payload = self.read_json_body()
        key = f"cadastro-ip:{self.client_ip()}"
        enforce_rate_limit((key,))
        RATE_LIMITER.register(key, REGISTRATIONS_PER_IP, REGISTRATION_WINDOW_SECONDS, REGISTRATION_WINDOW_SECONDS)
        user = create_user(payload)
        self.send_json({"ok": True, "user": user}, status=201)

    def post_change_password(self):
        user = self.require_session(allow_password_change=True)
        payload = self.read_json_body()
        keys = (f"senha-ip:{self.client_ip()}", f"senha-login:{normalize(user.get('login'))}")
        enforce_rate_limit(keys)
        must_change = bool((self.session_payload or {}).get("mustChangePassword"))
        try:
            updated = change_user_password(user, payload, require_current=not must_change)
        except CredentialError:
            register_failures(keys)
            raise
        RATE_LIMITER.clear(keys[1])
        self.send_json({"ok": True, "user": public_user(updated), "token": create_session_token(updated)})

    def post_reset_request(self):
        payload = self.read_json_body()
        key = f"reset-pedido-ip:{self.client_ip()}"
        enforce_rate_limit((key,))
        RATE_LIMITER.register(key, RESET_REQUESTS_PER_IP, RESET_REQUEST_WINDOW_SECONDS, RESET_REQUEST_WINDOW_SECONDS)
        self.send_json(create_password_reset_request(payload, self.user_agent()), status=201)

    def post_reset_complete(self):
        payload = self.read_json_body()
        if not isinstance(payload, dict):
            raise ValueError("Dados inválidos.")
        login = str(payload.get("login", "")).strip()
        keys = (f"reset-ip:{self.client_ip()}", f"reset-login:{normalize(login)}")
        enforce_rate_limit(keys)
        try:
            user = complete_password_reset(payload, self.user_agent())
        except CredentialError:
            register_failures(keys)
            raise
        RATE_LIMITER.clear(keys[1])
        self.send_json({"ok": True, "user": user})

    def post_access_log(self):
        user = self.require_session()
        access = self.read_json_body()
        if not isinstance(access, dict):
            raise ValueError("Dados inválidos.")
        write_access_log(client_access_log(user, access, self.user_agent()))
        self.send_json({"ok": True}, status=201)

    def post_order(self):
        user = self.require_session()
        order = self.read_json_body()
        if not isinstance(order, dict):
            raise ValueError("Pedido inválido.")
        self.send_json(create_order(order, user), status=201)

    def route_patch(self):
        order_id = self.order_id_from_path()
        user = self.require_session()
        updates = self.read_json_body()
        updated = update_order(order_id, updates, user)
        if not updated:
            raise ApiError(404, "Pedido não encontrado.")
        self.send_json(updated)

    def route_delete(self):
        order_id = self.order_id_from_path()
        self.require_session(roles=("master",))
        delete_order(order_id)
        self.send_json({"ok": True})

    def order_id_from_path(self):
        path = urlparse(self.path).path
        prefix = "/api/orders/"
        if not path.startswith(prefix):
            raise ApiError(404, "Rota não encontrada.")
        order_id = unquote(path[len(prefix) :])
        if not order_id:
            raise ApiError(400, "Pedido obrigatório.")
        if not ORDER_ID_PATTERN.match(order_id):
            raise ApiError(400, "Número de pedido inválido.")
        return order_id

    def require_session(self, roles=None, allow_password_change=False):
        header = self.headers.get("Authorization", "") or ""
        token = header[7:].strip() if header[:7].lower() == "bearer " else ""
        payload = read_session_token(token)
        if not payload:
            raise ApiError(401, SESSION_EXPIRED_MESSAGE)
        user = session_user(payload.get("login"))
        if not user or user.get("active") is False:
            raise ApiError(401, SESSION_EXPIRED_MESSAGE)
        token_must_change = bool(payload.get("mustChangePassword"))
        if user.get("mustChangePassword") and not token_must_change:
            # O Master definiu uma senha provisória depois deste login.
            raise ApiError(401, SESSION_EXPIRED_MESSAGE)
        if token_must_change and not allow_password_change:
            raise ApiError(403, "Troque sua senha provisória para continuar.")
        if roles and user.get("role") not in roles:
            raise ApiError(403, FORBIDDEN_MESSAGE)
        self.session_payload = payload
        return user

    def client_ip(self):
        forwarded = str(self.headers.get("X-Forwarded-For", "") or "")
        first = forwarded.split(",")[0].strip()
        return first[:64] or self.client_address[0]

    def user_agent(self):
        return str(self.headers.get("User-Agent", "") or "")[:300]

    def read_json_body(self):
        raw_length = self.headers.get("Content-Length")
        if raw_length is None:
            raise ApiError(400, "Corpo da requisição obrigatório.")
        try:
            length = int(raw_length)
        except ValueError:
            raise ApiError(400, "Tamanho da requisição inválido.") from None
        if length < 0:
            raise ApiError(400, "Tamanho da requisição inválido.")
        if length > MAX_BODY_BYTES:
            self.close_connection = True
            raise ApiError(413, "Requisição muito grande.")
        payload = self.rfile.read(length)
        try:
            return loads(payload.decode("utf-8"))
        except (UnicodeDecodeError, ValueError):
            raise ApiError(400, "JSON inválido.") from None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Strict-Transport-Security", "max-age=31536000")
        self.send_header("Content-Security-Policy", CONTENT_SECURITY_POLICY)
        super().end_headers()

    def send_json(self, payload, status=200, headers=None):
        body = dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def send_xlsx(self, orders):
        body = build_xlsx(orders)
        self.send_response(200)
        self.send_header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        self.send_header("Content-Disposition", 'attachment; filename="relatorio-pedidos-veri.xlsx"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


# ---------------------------------------------------------------------------
# Sessão (token assinado, sem estado no servidor)
# ---------------------------------------------------------------------------

def b64url_encode(data):
    return urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def b64url_decode(text):
    padding = "=" * (-len(text) % 4)
    return urlsafe_b64decode((text + padding).encode("ascii"))


def sign_session_body(body):
    return b64url_encode(hmac.new(SESSION_SECRET, body.encode("ascii"), sha256).digest())


def create_session_token(user):
    issued_at = int(time())
    payload = {
        "login": user.get("login", ""),
        "role": user.get("role", ""),
        "mustChangePassword": bool(user.get("mustChangePassword")),
        "iat": issued_at,
        "exp": issued_at + SESSION_TTL_SECONDS,
    }
    body = b64url_encode(dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))
    return f"{body}.{sign_session_body(body)}"


def read_session_token(token):
    if not token or len(token) > 4096 or token.count(".") != 1:
        return None
    body, signature = token.split(".", 1)
    try:
        expected = sign_session_body(body)
        if not hmac.compare_digest(signature.encode("utf-8"), expected.encode("ascii")):
            return None
        payload = loads(b64url_decode(body).decode("utf-8"))
    except (UnicodeError, ValueError):
        return None
    if not isinstance(payload, dict):
        return None
    expires_at = payload.get("exp")
    if not isinstance(expires_at, int) or isinstance(expires_at, bool) or expires_at < time():
        return None
    if not isinstance(payload.get("login"), str) or not payload.get("login"):
        return None
    return payload


SESSION_USER_CACHE = {}
SESSION_USER_CACHE_LOCK = Lock()


def session_user(login):
    key = normalize(login)
    now = time()
    with SESSION_USER_CACHE_LOCK:
        cached = SESSION_USER_CACHE.get(key)
    if cached and cached[0] > now:
        return cached[1]
    user = find_user(login)
    with SESSION_USER_CACHE_LOCK:
        if len(SESSION_USER_CACHE) > 5000:
            SESSION_USER_CACHE.clear()
        SESSION_USER_CACHE[key] = (now + SESSION_USER_CACHE_SECONDS, user)
    return user


def forget_session_user(login):
    with SESSION_USER_CACHE_LOCK:
        SESSION_USER_CACHE.pop(normalize(login), None)


# ---------------------------------------------------------------------------
# Limite de tentativas (memória do processo)
# ---------------------------------------------------------------------------

class RateLimiter:
    def __init__(self):
        self.lock = Lock()
        self.hits = {}
        self.blocked = {}

    def retry_after(self, key):
        now = time()
        with self.lock:
            until = self.blocked.get(key, 0)
            if until > now:
                return int(until - now) + 1
            if until:
                self.blocked.pop(key, None)
        return 0

    def register(self, key, limit, window, block):
        now = time()
        with self.lock:
            if len(self.hits) > 20000:
                self.prune_unlocked(now, window)
            recent = [moment for moment in self.hits.get(key, []) if now - moment < window]
            recent.append(now)
            if len(recent) >= limit:
                self.blocked[key] = now + block
                self.hits.pop(key, None)
            else:
                self.hits[key] = recent

    def clear(self, key):
        with self.lock:
            self.hits.pop(key, None)
            self.blocked.pop(key, None)

    def prune_unlocked(self, now, window):
        for key in [key for key, moments in self.hits.items() if not moments or now - moments[-1] >= window]:
            self.hits.pop(key, None)
        for key in [key for key, until in self.blocked.items() if until <= now]:
            self.blocked.pop(key, None)


RATE_LIMITER = RateLimiter()


def enforce_rate_limit(keys):
    wait = max((RATE_LIMITER.retry_after(key) for key in keys), default=0)
    if wait:
        minutes = max(1, (wait + 59) // 60)
        raise ApiError(
            429,
            f"Muitas tentativas. Aguarde {minutes} minuto{'s' if minutes > 1 else ''} e tente novamente.",
            headers={"Retry-After": str(wait)},
        )


def register_failures(keys):
    for key in keys:
        RATE_LIMITER.register(key, LOGIN_MAX_FAILURES, LOGIN_FAILURE_WINDOW_SECONDS, LOGIN_BLOCK_SECONDS)


# ---------------------------------------------------------------------------
# Pedidos
# ---------------------------------------------------------------------------

def visible_orders_for(user, orders):
    if user.get("role") in INTERNAL_ROLES:
        return orders
    return [order for order in orders if isinstance(order, dict) and order_belongs_to(order, user)]


def order_belongs_to(order, user):
    user_phone = only_digits(user.get("phone", ""))
    if user_phone and only_digits(order.get("phone", "")) == user_phone:
        return True
    creator = order_creator_login(order)
    return bool(creator) and normalize(creator) == normalize(user.get("login"))


def order_creator_login(order):
    for entry in order.get("history") or []:
        if isinstance(entry, dict) and entry.get("action") == "Pedido criado":
            return str(entry.get("login", "") or "")
    return ""


def read_orders():
    if supabase_enabled():
        try:
            return read_orders_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler pedidos no Supabase", exc) from exc

    with LOCK:
        return read_local_orders_unlocked()


def find_order(order_id):
    if supabase_enabled():
        try:
            rows = supabase_request(f"/rest/v1/{SUPABASE_TABLE}?id=eq.{quote(order_id, safe='')}&select=*")
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler pedido no Supabase", exc) from exc
        return db_to_order(rows[0]) if rows else None

    with LOCK:
        return next(
            (order for order in read_local_orders_unlocked() if isinstance(order, dict) and order.get("id") == order_id),
            None,
        )


def create_order(order, user):
    if not isinstance(order, dict):
        raise ValueError("Pedido inválido.")
    role = user.get("role", "")
    normalized = normalize_order(order)
    if not normalized.get("status"):
        normalized["status"] = ORDER_STATUSES[0]
    if role == "collaborator":
        today = now_br().date().isoformat()
        normalized["requester"] = str(user.get("name", "") or "").strip()
        normalized["phone"] = only_digits(user.get("phone", ""))
        normalized["status"] = ORDER_STATUSES[0]
        normalized["requestDate"] = today
        normalized["dueDate"] = default_due_date(today)
    fields = validate_order_fields(
        {key: normalized[key] for key in ("requestDate", "dueDate", "requester", "phone", "origin", "priority", "status", "notes")}
    )
    normalized.update(fields)
    normalized["items"] = validate_order_items(order.get("items"))
    if not normalized["items"]:
        raise ValueError("Adicione pelo menos um item ao pedido.")
    normalized["id"] = generate_order_id()
    normalized["history"] = []
    normalized["deliveries"] = []
    normalized["updatedBy"] = str(user.get("name", "") or "")
    normalized["updatedByRole"] = role
    append_history(
        normalized,
        "Pedido criado",
        user.get("name", ""),
        role,
        {"status": normalized.get("status"), "items": len(normalized.get("items", []))},
        user.get("login", ""),
    )

    if supabase_enabled():
        try:
            return create_order_supabase(normalized)
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("criar pedido no Supabase", exc) from exc

    with LOCK:
        orders = read_local_orders_unlocked()
        existing_ids = {current.get("id") for current in orders if isinstance(current, dict)}
        while normalized["id"] in existing_ids:
            normalized["id"] = generate_order_id()
        orders.insert(0, normalized)
        write_json_file(DATA_FILE, orders)
    return normalized


def update_order(order_id, updates, user):
    if not isinstance(updates, dict):
        raise ValueError("Alteração inválida.")
    current = find_order(order_id)
    if not current:
        return None

    role = user.get("role", "")
    current_status = public_order_status(current.get("status", ""))
    if role == "collaborator":
        if not order_belongs_to(current, user):
            raise ApiError(403, "Você só pode alterar os seus próprios pedidos.")
        if current_status != ORDER_STATUSES[0]:
            raise ApiError(
                403,
                "Este pedido já foi movimentado pela Gestão de Pedidos e não pode mais ser editado.",
            )
        if "status" in updates and public_order_status(updates.get("status")) != ORDER_STATUSES[0]:
            raise ApiError(403, FORBIDDEN_MESSAGE)
        allowed_keys = COLLABORATOR_UPDATE_FIELDS
    elif role in INTERNAL_ROLES:
        if current_status == "Finalizado" and role != "master":
            raise ApiError(403, "Este pedido já foi finalizado. Somente o Master pode reativá-lo.")
        if role == "consultant" and "status" in updates:
            notification = updates.get("whatsappNotification")
            if not isinstance(notification, dict) or notification.get("confirmed") is not True:
                raise ValueError("Envie e confirme a mensagem obrigatoria do WhatsApp antes de alterar o status.")
        allowed_keys = ORDER_UPDATE_FIELDS
    else:
        raise ApiError(403, FORBIDDEN_MESSAGE)

    changes = validate_order_fields(allowed_order_updates(updates, allowed_keys))
    if not changes:
        return current

    action_source = dict(changes)
    reason = str(updates.get("reopenReason", "") or "").strip()[:500]
    if reason and "status" in changes:
        action_source["reopenReason"] = reason
    action = history_action(action_source)
    details = order_update_history_details(changes, updates.get("whatsappNotification"))

    if supabase_enabled():
        merged = {**current, **changes, "history": list(current.get("history") or [])}
        append_history(merged, action, user.get("name", ""), role, details, user.get("login", ""))
        try:
            return update_order_supabase(order_id, changes, merged)
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("alterar pedido no Supabase", exc) from exc

    with LOCK:
        orders = read_local_orders_unlocked()
        updated = None
        for index, stored in enumerate(orders):
            if isinstance(stored, dict) and stored.get("id") == order_id:
                updated = {**stored, **changes, "history": list(stored.get("history") or [])}
                append_history(updated, action, user.get("name", ""), role, details, user.get("login", ""))
                orders[index] = updated
                break
        if updated:
            write_json_file(DATA_FILE, orders)
        return updated


def validate_order_fields(fields):
    for key in ("requestDate", "dueDate"):
        if key in fields:
            value = str(fields.get(key) or "").strip()
            if value and not is_iso_date(value):
                raise ValueError("Data inválida no pedido. Use o formato AAAA-MM-DD.")
            fields[key] = value
    if "requestDate" in fields and not fields["requestDate"]:
        raise ValueError("Informe a data do pedido.")
    for key, limit in ORDER_TEXT_LIMITS.items():
        if key in fields:
            value = fields.get(key)
            value = value.strip() if isinstance(value, str) else str(value if value is not None else "").strip()
            if len(value) > limit:
                raise ValueError("Texto muito longo no pedido.")
            fields[key] = value
    if "phone" in fields:
        fields["phone"] = only_digits(fields["phone"])
    if "priority" in fields and fields["priority"] not in ORDER_PRIORITIES:
        raise ValueError("Prioridade inválida.")
    if "status" in fields:
        status = public_order_status(fields.get("status"))
        if status not in ORDER_STATUSES:
            raise ValueError("Status inválido.")
        fields["status"] = status
    if "items" in fields:
        fields["items"] = validate_order_items(fields["items"])
        if not fields["items"]:
            raise ValueError("Adicione pelo menos um item ao pedido.")
    if "deliveries" in fields:
        deliveries = fields["deliveries"]
        if not isinstance(deliveries, list) or len(deliveries) > MAX_DELIVERIES:
            raise ValueError("Entregas inválidas.")
        if any(not isinstance(delivery, dict) for delivery in deliveries):
            raise ValueError("Entregas inválidas.")
    if "galvanoplasty" in fields:
        galvanoplasty = fields["galvanoplasty"]
        if galvanoplasty is None:
            galvanoplasty = {}
        if not isinstance(galvanoplasty, dict) or len(dumps(galvanoplasty, ensure_ascii=False)) > 5000:
            raise ValueError("Dados de Galvanoplastia inválidos.")
        fields["galvanoplasty"] = galvanoplasty
    return fields


def validate_order_items(items):
    if not isinstance(items, list) or len(items) > MAX_ORDER_ITEMS:
        raise ValueError("Itens do pedido inválidos.")
    cleaned = []
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Itens do pedido inválidos.")
        clean = {}
        for key in ITEM_TEXT_FIELDS:
            value = item.get(key, "")
            if value is None:
                value = ""
            if not isinstance(value, (str, int, float)) or isinstance(value, bool):
                raise ValueError("Itens do pedido inválidos.")
            value = str(value).strip()
            if len(value) > 80:
                raise ValueError("Texto muito longo nos itens do pedido.")
            clean[key] = value
        if not clean["model"]:
            raise ValueError("Informe o modelo de todos os itens.")
        quantity = finite_number(item.get("quantity"))
        if quantity is None or quantity <= 0 or quantity > 1_000_000:
            raise ValueError("Informe uma quantidade válida em todos os itens.")
        clean["quantity"] = int(quantity) if float(quantity).is_integer() else quantity
        for key in ITEM_NUMBER_FIELDS:
            if key in item:
                value = finite_number(item.get(key))
                if value is None or value < 0:
                    raise ValueError("Valores de custo inválidos nos itens do pedido.")
                clean[key] = value
        snapshot = item.get("costSnapshot")
        if isinstance(snapshot, dict):
            clean["costSnapshot"] = {
                key: finite_number(snapshot.get(key)) or 0 for key in ITEM_SNAPSHOT_FIELDS if key in snapshot
            }
        cleaned.append(clean)
    return cleaned


def finite_number(value):
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, (int, float)):
        number = float(value) if isinstance(value, float) else value
    elif isinstance(value, str) and value.strip():
        try:
            number = float(value.strip())
        except ValueError:
            return None
    else:
        return None
    try:
        return number if isfinite(number) else None
    except OverflowError:
        return None


def is_iso_date(value):
    try:
        datetime.strptime(value, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def delete_order(order_id):
    if supabase_enabled():
        try:
            delete_order_supabase(order_id)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("excluir pedido no Supabase", exc) from exc

    with LOCK:
        orders = read_local_orders_unlocked()
        orders = [order for order in orders if not (isinstance(order, dict) and order.get("id") == order_id)]
        write_json_file(DATA_FILE, orders)


# ---------------------------------------------------------------------------
# Registros de acesso, preços e custos
# ---------------------------------------------------------------------------

def read_access_logs():
    if supabase_enabled():
        try:
            return read_access_logs_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler registros de acesso no Supabase", exc) from exc
    with LOCK:
        return read_local_access_logs_unlocked()


def client_access_log(user, access, user_agent):
    event_type = str(access.get("eventType", "") or "").strip()
    details = access.get("details") if isinstance(access.get("details"), dict) else {}
    if len(dumps(details, ensure_ascii=False)) > 2000:
        details = {}
    return {
        "userName": user.get("name", ""),
        "login": user.get("login", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "origin": str(access.get("origin", "") or "")[:300],
        "userAgent": user_agent,
        "eventType": event_type if event_type in CLIENT_ACCESS_EVENTS else "evento_cliente",
        "details": details,
    }


def read_prices():
    if supabase_enabled():
        try:
            return read_prices_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler preços no Supabase", exc) from exc

    with LOCK:
        return read_local_prices_unlocked()


def write_prices(prices):
    if len(prices) > MAX_PRICES:
        raise ValueError("Lista de preços muito grande.")
    normalized = []
    seen = set()
    for price in prices:
        if not isinstance(price, dict):
            raise ValueError("Preço inválido na lista.")
        item = normalize_price(price)
        if not item["model"] or not item["size"]:
            raise ValueError("Informe modelo e tamanho em todos os preços.")
        if len(item["model"]) > 80 or len(item["size"]) > 80:
            raise ValueError("Texto muito longo na lista de preços.")
        if item["bath"] not in PRICE_BATHS:
            raise ValueError("Tipo de preço inválido.")
        if any(item[key] < 0 for key in ("unitCost", "weight", "goldThousandth")):
            raise ValueError("Valores de preço não podem ser negativos.")
        key = (item["model"], item["size"], item["bath"])
        if key in seen:
            continue
        seen.add(key)
        normalized.append(item)

    if supabase_enabled():
        try:
            write_prices_supabase(normalized)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar preços no Supabase", exc) from exc

    with LOCK:
        write_json_file(PRICES_FILE, normalized)


def read_cost_settings():
    if supabase_enabled():
        try:
            return read_cost_settings_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler parâmetros de custo no Supabase", exc) from exc

    with LOCK:
        return read_local_cost_settings_unlocked()


def write_cost_settings(settings):
    normalized = normalize_cost_settings(settings)
    if any(value < 0 for value in normalized.values()):
        raise ValueError("Os parâmetros de custo não podem ser negativos.")
    if supabase_enabled():
        try:
            write_cost_settings_supabase(normalized)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar parâmetros de custo no Supabase", exc) from exc

    with LOCK:
        write_json_file(COST_SETTINGS_FILE, normalized)


# ---------------------------------------------------------------------------
# Login, senhas e redefinição
# ---------------------------------------------------------------------------

def login_user(credentials, ip, user_agent=""):
    login = str(credentials.get("login", "") or "").strip()[:120]
    password = str(credentials.get("password", "") or "")
    tab = str(credentials.get("role", "") or "").strip()
    if not login or not password:
        raise ValueError("Informe usuário e senha para entrar.")

    keys = (f"auth-ip:{ip}", f"auth-login:{normalize(login)}")
    enforce_rate_limit(keys)

    user = find_user(login)
    password_ok = verify_password(password, user) if user else burn_password_check(password)
    if not user or not password_ok or user.get("active") is False:
        register_failures(keys)
        write_access_log({
            "userName": (user or {}).get("name", "") or login,
            "login": (user or {}).get("login", "") or login,
            "role": (user or {}).get("role", ""),
            "userAgent": user_agent,
            "eventType": "login_falha",
            "details": {"knownUser": bool(user), "inactive": bool(user) and user.get("active") is False, "ip": ip},
        })
        raise ApiError(401, INVALID_LOGIN_MESSAGE)

    allowed_roles = LOGIN_TAB_ROLES.get(tab, ALL_ROLES)
    if user.get("role") not in allowed_roles:
        write_access_log({
            "userName": user.get("name", ""),
            "login": user.get("login", ""),
            "role": user.get("role", ""),
            "userAgent": user_agent,
            "eventType": "login_falha",
            "details": {"knownUser": True, "wrongTab": tab, "ip": ip},
        })
        raise ApiError(401, INVALID_LOGIN_MESSAGE)

    RATE_LIMITER.clear(keys[1])
    if password_needs_rehash(user):
        upgraded = {**user, **new_password_record(password)}
        try:
            save_user(upgraded)
            user = upgraded
        except StorageError as exc:
            log_error(f"Não foi possível atualizar o formato da senha de {user.get('login')}: {exc}")

    write_access_log({
        "userName": user.get("name", ""),
        "login": user.get("login", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "userAgent": user_agent,
        "eventType": "login",
        "details": {"accessMode": tab, "ip": ip, "mustChangePassword": bool(user.get("mustChangePassword"))},
    })
    return {"ok": True, "user": public_user(user), "token": create_session_token(user)}


def change_user_password(session_user_record, payload, require_current=True):
    if not isinstance(payload, dict):
        raise ValueError("Dados inválidos.")
    new_password = str(payload.get("newPassword", "") or "")
    validate_new_password(new_password)
    user = find_user(session_user_record.get("login", ""))
    if not user or user.get("active") is False:
        raise ApiError(401, SESSION_EXPIRED_MESSAGE)
    if require_current:
        current_password = str(payload.get("currentPassword", "") or "")
        if not verify_password(current_password, user):
            raise CredentialError("Senha atual inválida.")
    if verify_password(new_password, user):
        raise ValueError("Escolha uma senha diferente da atual/provisória.")
    updated = {
        **user,
        **new_password_record(new_password),
        "mustChangePassword": False,
        "updatedAt": now_iso(),
    }
    save_user(updated)
    return updated


def validate_new_password(password, label="A senha"):
    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"{label} deve ter pelo menos {PASSWORD_MIN_LENGTH} caracteres.")
    if len(password) > PASSWORD_MAX_LENGTH:
        raise ValueError(f"{label} deve ter no máximo {PASSWORD_MAX_LENGTH} caracteres.")


def create_password_reset_request(payload, user_agent=""):
    if not isinstance(payload, dict):
        raise ValueError("Dados inválidos.")
    login = str(payload.get("login", "") or "").strip()[:120]
    phone = only_digits(payload.get("phone", ""))[:20]
    if not login:
        raise ValueError("Informe o usuário/login.")

    # A resposta é sempre a mesma, exista ou não o login.
    response = {"ok": True, "message": GENERIC_RESET_MESSAGE, "whatsappUrl": admin_whatsapp_reset_url(login)}

    user = find_user(login)
    if not user or user.get("active") is False:
        write_access_log({
            "userName": (user or {}).get("name", "") or login,
            "login": (user or {}).get("login", "") or login,
            "role": (user or {}).get("role", ""),
            "userAgent": user_agent,
            "eventType": "reset_senha_solicitado",
            "details": {"knownUser": bool(user), "inactive": bool(user)},
        })
        return response

    normalized_login = normalize(user.get("login"))
    already_pending = any(
        normalize(request.get("login")) == normalized_login and request.get("status") == "PENDENTE"
        for request in read_password_reset_requests()
    )
    request_id = ""
    if not already_pending:
        request_id = token_hex(8)
        save_password_reset_request({
            "id": request_id,
            "login": user.get("login", ""),
            "userName": user.get("name", ""),
            "role": user.get("role", ""),
            "status": "PENDENTE",
            # Ainda sem código válido: o código só existe depois da aprovação do Master.
            "codeHash": hash_reset_code(token_hex(16)),
            "createdAt": now_iso(),
            "approvedAt": "",
            "approvedBy": "",
            "expiresAt": "",
            "usedAt": "",
            "decidedAt": "",
            "decidedBy": "",
        })
    write_access_log({
        "userName": user.get("name", login),
        "login": user.get("login", login),
        "role": user.get("role", ""),
        "userAgent": user_agent,
        "eventType": "reset_senha_solicitado",
        "details": {
            "requestId": request_id,
            "knownUser": True,
            "duplicate": already_pending,
            "phoneMatches": bool(phone) and phone == only_digits(user.get("phone", "")),
        },
    })
    return response


def reset_code_for(request):
    digest = hmac.new(SESSION_SECRET, f"reset-code:{request.get('id', '')}".encode("utf-8"), sha256).hexdigest()
    return f"RS-{digest[:8].upper()}"


def list_password_reset_requests_for_master(master_user):
    requests = read_password_reset_requests()
    users_by_login = {normalize(user.get("login")): user for user in read_users()}
    seen_pending_logins = set()
    visible_requests = []
    now = now_br()

    for request in requests:
        if request.get("status") == "PENDENTE":
            login_key = normalize(request.get("login"))
            if login_key in seen_pending_logins:
                save_password_reset_request({
                    **request,
                    "status": "EXPIRADO",
                    "decidedAt": now_iso(),
                    "decidedBy": "solicitacao_duplicada",
                })
                continue
            seen_pending_logins.add(login_key)
        visible_requests.append(request)

    result = []
    for request in visible_requests:
        public = public_password_reset_request(request)
        target = users_by_login.get(normalize(request.get("login")))
        public["phone"] = only_digits((target or {}).get("phone", ""))
        if request.get("status") == "APROVADO" and not request.get("usedAt"):
            expires_at = parse_iso_datetime(request.get("expiresAt", ""))
            if not expires_at or expires_at < now:
                public["status"] = "EXPIRADO"
            else:
                code = reset_code_for(request)
                if hmac.compare_digest(hash_reset_code(code), str(request.get("codeHash", "") or "")):
                    public["code"] = code
        result.append(public)
    return result


def decide_password_reset_request(master_user, payload):
    request_id = str(payload.get("id") or payload.get("requestId") or "").strip()
    decision = str(payload.get("decision", "")).strip().upper()
    if decision not in ("APROVADO", "RECUSADO"):
        raise ValueError("Decisão inválida.")

    request = find_password_reset_request(request_id)
    if not request:
        raise ValueError("Solicitação não encontrada.")
    if request.get("status") != "PENDENTE":
        raise ValueError("Esta solicitação já foi encerrada.")

    now = now_br()
    decided_at = now.isoformat(timespec="seconds")
    updated = {
        **request,
        "status": decision,
        "decidedAt": decided_at,
        "decidedBy": master_user.get("login", ""),
    }
    code = ""
    if decision == "APROVADO":
        # Autorizações aprovadas antes para o mesmo login deixam de valer.
        for other in read_password_reset_requests():
            if (
                other.get("id") != request_id
                and normalize(other.get("login")) == normalize(request.get("login"))
                and other.get("status") == "APROVADO"
                and not other.get("usedAt")
            ):
                save_password_reset_request({**other, "status": "EXPIRADO", "decidedBy": "nova_aprovacao"})
        code = reset_code_for(request)
        updated["codeHash"] = hash_reset_code(code)
        updated["approvedAt"] = decided_at
        updated["approvedBy"] = master_user.get("login", "")
        updated["expiresAt"] = (now + timedelta(minutes=RESET_CODE_MINUTES)).isoformat(timespec="seconds")

    save_password_reset_request(updated)
    write_access_log({
        "userName": master_user.get("name", "Master"),
        "login": master_user.get("login", ""),
        "role": "master",
        "eventType": "reset_senha_aprovado" if decision == "APROVADO" else "reset_senha_recusado",
        "details": {"requestId": request_id, "targetLogin": request.get("login", "")},
    })
    public = public_password_reset_request(updated)
    target = find_user(request.get("login", ""))
    public["phone"] = only_digits((target or {}).get("phone", ""))
    if code:
        public["code"] = code
    return public


def complete_password_reset(payload, user_agent=""):
    login = str(payload.get("login", "") or "").strip()
    request_code = str(payload.get("requestCode", "") or "").strip().upper()
    new_password = str(payload.get("newPassword", "") or "")
    if not login or not request_code or not new_password:
        raise ValueError("Informe usuário, código de autorização e nova senha.")
    validate_new_password(new_password)

    user = find_user(login)
    request = None
    if user and user.get("active") is not False:
        request = find_approved_password_reset_request(login, request_code)
    if not request:
        raise CredentialError("Autorização inválida, expirada ou já utilizada.")

    updated_user = {
        **user,
        **new_password_record(new_password),
        "mustChangePassword": False,
        "updatedAt": now_iso(),
    }
    save_user(updated_user)
    save_password_reset_request({**request, "status": "CONCLUIDO", "usedAt": now_iso()})
    write_access_log({
        "userName": user.get("name", login),
        "login": user.get("login", login),
        "role": user.get("role", ""),
        "userAgent": user_agent,
        "eventType": "reset_senha_concluido",
        "details": {"requestId": request.get("id", "")},
    })
    return public_user(updated_user)


# ---------------------------------------------------------------------------
# Administração (Master)
# ---------------------------------------------------------------------------

def list_users_for_master(master_user):
    return [public_user(user) for user in read_users()]


def read_admin_database(master_user):
    orders = read_orders()
    return {
        "generatedAt": now_iso(),
        "storage": "supabase" if supabase_enabled() else "local",
        "orders": [admin_order_summary(order) for order in orders if isinstance(order, dict)],
        "users": [public_user(user) for user in read_users()],
        "prices": read_prices(),
        "costSettings": read_cost_settings(),
        "accessLogs": read_access_logs(),
    }


def admin_order_summary(order):
    items = order.get("items") if isinstance(order.get("items"), list) else []
    pieces = sum(parse_int(item.get("quantity", 0)) for item in items if isinstance(item, dict))
    return {
        **order,
        "itemsCount": len(items),
        "pieces": pieces,
    }


def parse_int(value):
    try:
        return int(float(value or 0))
    except (TypeError, ValueError, OverflowError):
        return 0


def admin_reset_user_password(master_user, payload):
    login = str(payload.get("login", "")).strip()
    new_password = str(payload.get("newPassword", "") or "")
    validate_new_password(new_password, "A senha provisória")
    user = find_user(login)
    if not user:
        raise ValueError("Usuário não encontrado.")
    updated = {
        **user,
        **new_password_record(new_password),
        "mustChangePassword": True,
        "updatedAt": now_iso(),
    }
    save_user(updated)
    write_access_log({
        "userName": master_user.get("name", "Master"),
        "login": master_user.get("login", ""),
        "role": "master",
        "eventType": "senha_provisoria",
        "details": {"targetLogin": user.get("login", login)},
    })
    return public_user(updated)


def admin_update_user(master_user, payload):
    login = str(payload.get("login", "")).strip()
    name = str(payload.get("name", "")).strip()
    role = str(payload.get("role", "")).strip()
    origin = str(payload.get("origin", payload.get("sector", ""))).strip()
    phone = only_digits(payload.get("phone", ""))

    user = find_user(login)
    if not user:
        raise ValueError("Usuário não encontrado.")
    if not name or not origin:
        raise ValueError("Preencha nome e setor/loja.")
    if len(name) > 120 or len(origin) > 120:
        raise ValueError("Nome ou setor muito longo.")
    if role not in ALL_ROLES:
        raise ValueError("Perfil inválido.")
    if phone and not is_valid_mobile(phone):
        raise ValueError("Informe um telefone válido com DDD e 9 dígitos.")
    if role == "collaborator":
        if not phone:
            raise ValueError("Colaborador precisa ter celular corporativo válido.")
        validate_user_identity_link(name, phone, exclude_login=user.get("login", login))
    if user.get("role") == "master" and role != "master" and would_remove_last_active_master(user.get("login", login)):
        raise ValueError("Não é permitido remover o último Master ativo do sistema.")

    updated = {
        **user,
        "name": name,
        "role": role,
        "origin": origin,
        "phone": phone,
        "updatedAt": now_iso(),
    }
    save_user(updated)
    write_access_log({
        "userName": master_user.get("name", "Master"),
        "login": master_user.get("login", ""),
        "role": "master",
        "eventType": "usuario_editado",
        "details": {"targetLogin": user.get("login", login), "role": role},
    })
    return public_user(updated)


def admin_set_user_status(master_user, payload):
    login = str(payload.get("login", "")).strip()
    active = bool(payload.get("active"))
    user = find_user(login)
    if not user:
        raise ValueError("Usuário não encontrado.")
    if normalize(user.get("login")) == normalize(master_user.get("login")) and not active:
        raise ValueError("Não é permitido inativar o próprio usuário conectado.")
    if user.get("role") == "master" and not active and would_remove_last_active_master(user.get("login", login)):
        raise ValueError("Não é permitido inativar o último Master ativo do sistema.")

    updated = {
        **user,
        "active": active,
        "updatedAt": now_iso(),
    }
    save_user(updated)
    write_access_log({
        "userName": master_user.get("name", "Master"),
        "login": master_user.get("login", ""),
        "role": "master",
        "eventType": "usuario_ativado" if active else "usuario_inativado",
        "details": {"targetLogin": user.get("login", login)},
    })
    return public_user(updated)


def admin_delete_user(master_user, payload):
    login = str(payload.get("login", "")).strip()
    user = find_user(login)
    if not user:
        raise ValueError("Usuário não encontrado.")
    stored_login = user.get("login", "")
    if normalize(stored_login) == normalize(master_user.get("login")):
        raise ValueError("Não é permitido excluir o próprio usuário conectado.")
    if user.get("role") == "master" and would_remove_last_active_master(stored_login):
        raise ValueError("Não é permitido excluir o último Master ativo do sistema.")

    # Usa o login exatamente como está gravado (a busca ignora maiúsculas/minúsculas).
    delete_user(stored_login)
    write_access_log({
        "userName": master_user.get("name", "Master"),
        "login": master_user.get("login", ""),
        "role": "master",
        "eventType": "usuario_excluido",
        "details": {"targetLogin": stored_login, "targetRole": user.get("role", "")},
    })
    return stored_login


def create_management_user(master_user, payload):
    name = str(payload.get("name", "")).strip()
    sector = str(payload.get("sector", "")).strip()
    phone = only_digits(payload.get("phone", ""))
    password = str(payload.get("password", "") or "")
    role = str(payload.get("role", "consultant")).strip() or "consultant"
    login = str(payload.get("login", "")).strip() or name

    if not name or not sector or not password:
        raise ValueError("Preencha nome, setor e senha padrão.")
    if len(login) > 80 or len(name) > 120 or len(sector) > 120:
        raise ValueError("Login, nome ou setor muito longo.")
    if role not in ALL_ROLES:
        raise ValueError("Perfil inválido.")
    if phone and not is_valid_mobile(phone):
        raise ValueError("Informe um telefone válido com DDD e 9 dígitos.")
    if role == "collaborator":
        if not phone:
            raise ValueError("Colaborador precisa ter celular corporativo válido.")
        validate_user_identity_link(name, phone)
    validate_new_password(password, "A senha padrão")
    if find_user(login):
        raise ValueError("Já existe usuário com este nome/login. Use outro nome para o cadastro.")

    now = now_iso()
    user = {
        "login": login,
        "name": name,
        "role": role,
        "phone": phone,
        "origin": sector,
        **new_password_record(password),
        "mustChangePassword": True,
        "active": True,
        "createdAt": now,
        "updatedAt": now,
    }
    save_user(user)
    write_access_log({
        "userName": master_user.get("name", "Master"),
        "login": master_user.get("login", ""),
        "role": "master",
        "eventType": "usuario_admin_criado",
        "details": {"targetLogin": login, "sector": sector, "role": role},
    })
    return public_user(user)


def create_user(payload):
    if not isinstance(payload, dict):
        raise ValueError("Dados inválidos.")
    login = str(payload.get("login", "")).strip()
    name = str(payload.get("name", "")).strip()
    origin = str(payload.get("origin", "")).strip()
    phone = only_digits(payload.get("phone", ""))
    password = str(payload.get("password", "") or "")
    role = str(payload.get("role", "collaborator")).strip() or "collaborator"

    if role != "collaborator":
        raise ValueError("Perfil de cadastro inválido.")
    if not login or not name or not origin or not phone or not password:
        raise ValueError("Preencha todos os campos obrigatórios.")
    if len(login) > 80 or len(name) > 120 or len(origin) > 120:
        raise ValueError("Login, nome ou origem muito longo.")
    if not is_valid_mobile(phone):
        raise ValueError("Informe um telefone corporativo válido com DDD e 9 dígitos.")
    validate_new_password(password)
    if find_user(login):
        raise ValueError("Este usuário já existe. Escolha outro login.")
    validate_user_identity_link(name, phone)

    now = now_iso()
    user = {
        "login": login,
        "name": name,
        "role": role,
        "phone": phone,
        "origin": origin,
        **new_password_record(password),
        "mustChangePassword": False,
        "active": True,
        "createdAt": now,
        "updatedAt": now,
    }
    save_user(user)
    return public_user(user)


# ---------------------------------------------------------------------------
# Usuários e solicitações de redefinição (armazenamento)
# ---------------------------------------------------------------------------

def find_user(login):
    ensure_default_users()
    normalized_login = normalize(login)
    if not normalized_login:
        return None
    return next((user for user in read_users() if normalize(user.get("login")) == normalized_login), None)


def read_users():
    if supabase_enabled():
        try:
            return read_users_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler usuários no Supabase", exc) from exc
    with LOCK:
        return read_local_users_unlocked()


def read_password_reset_requests():
    if supabase_enabled():
        try:
            return read_password_reset_requests_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler solicitacoes de redefinicao no Supabase", exc) from exc
    with LOCK:
        return read_local_password_reset_requests_unlocked()


def save_password_reset_request(request):
    if supabase_enabled():
        try:
            save_password_reset_request_supabase(request)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar solicitacao de redefinicao no Supabase", exc) from exc
    with LOCK:
        requests = read_local_password_reset_requests_unlocked()
        requests = [current for current in requests if current.get("id") != request.get("id")]
        requests.insert(0, request)
        write_json_file(PASSWORD_RESETS_FILE, requests)


def find_password_reset_request(request_id):
    if not request_id:
        return None
    return next((request for request in read_password_reset_requests() if request.get("id") == request_id), None)


def find_approved_password_reset_request(login, request_code):
    code_hash = hash_reset_code(request_code)
    normalized_login = normalize(login)
    now = now_br()
    for request in read_password_reset_requests():
        if normalize(request.get("login")) != normalized_login:
            continue
        if request.get("status") != "APROVADO" or request.get("usedAt"):
            continue
        if not hmac.compare_digest(str(request.get("codeHash", "") or ""), code_hash):
            continue
        expires_at = parse_iso_datetime(request.get("expiresAt", ""))
        if not expires_at:
            continue
        if expires_at < now:
            save_password_reset_request({**request, "status": "EXPIRADO"})
            continue
        return request
    return None


def save_user(user):
    forget_session_user(user.get("login"))
    if supabase_enabled():
        try:
            save_user_supabase(user)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar usuário no Supabase", exc) from exc
        finally:
            forget_session_user(user.get("login"))
    with LOCK:
        users = read_local_users_unlocked()
        users = [current for current in users if normalize(current.get("login")) != normalize(user.get("login"))]
        users.append(user)
        write_json_file(USERS_FILE, users)
    forget_session_user(user.get("login"))


def delete_user(login):
    forget_session_user(login)
    if supabase_enabled():
        try:
            delete_user_supabase(login)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("excluir usuario no Supabase", exc) from exc
        finally:
            forget_session_user(login)
    with LOCK:
        users = read_local_users_unlocked()
        users = [current for current in users if normalize(current.get("login")) != normalize(login)]
        write_json_file(USERS_FILE, users)
    forget_session_user(login)


def would_remove_last_active_master(target_login):
    active_masters = [
        user for user in read_users()
        if user.get("role") == "master" and user.get("active") is not False and normalize(user.get("login")) != normalize(target_login)
    ]
    return not active_masters


SEED_LOCK = Lock()


def ensure_default_users():
    """Semeia os usuários iniciais só quando não existe nenhum usuário. Nunca derruba o servidor."""
    if getattr(ensure_default_users, "done", False):
        return
    with SEED_LOCK:
        if getattr(ensure_default_users, "done", False):
            return
        try:
            users = read_users_without_seed()
        except (HTTPError, URLError, ValueError, OSError) as exc:
            log_error(f"Não foi possível conferir os usuários iniciais: {storage_error('ler usuários', exc)}")
            return
        if not users:
            try:
                for default in DEFAULT_USERS:
                    password = token_urlsafe(9)
                    save_user_without_seed(default_user_record(default, password))
                    log_error(
                        f"Base de usuários vazia: criado '{default['login']}' ({default['role']}) "
                        f"com senha provisória {password} (troca obrigatória no primeiro acesso)."
                    )
            except (HTTPError, URLError, ValueError, OSError) as exc:
                log_error(f"Não foi possível criar os usuários iniciais: {storage_error('salvar usuários', exc)}")
                return
        ensure_default_users.done = True


def read_users_without_seed():
    if supabase_enabled():
        return read_users_supabase()
    with LOCK:
        return read_local_users_unlocked()


def save_user_without_seed(user):
    if supabase_enabled():
        save_user_supabase(user)
        return
    with LOCK:
        users = read_local_users_unlocked()
        users = [current for current in users if normalize(current.get("login")) != normalize(user.get("login"))]
        users.append(user)
        write_json_file(USERS_FILE, users)


# ---------------------------------------------------------------------------
# Arquivos locais (modo sem Supabase)
# ---------------------------------------------------------------------------

def write_json_file(path, data):
    temporary = path.with_name(f"{path.name}.tmp")
    temporary.write_text(dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    replace_file(temporary, path)


def read_local_orders_unlocked():
    if not DATA_FILE.exists():
        return []

    try:
        data = loads(DATA_FILE.read_text(encoding="utf-8"))
    except ValueError:
        return []

    if not isinstance(data, list):
        return []
    return [
        {**order, "status": public_order_status(order.get("status", ""))}
        if isinstance(order, dict)
        else order
        for order in data
    ]


def read_local_prices_unlocked():
    if not PRICES_FILE.exists():
        return []

    try:
        data = loads(PRICES_FILE.read_text(encoding="utf-8"))
    except ValueError:
        return []

    return data if isinstance(data, list) else []


def read_local_cost_settings_unlocked():
    if not COST_SETTINGS_FILE.exists():
        return default_cost_settings()

    try:
        data = loads(COST_SETTINGS_FILE.read_text(encoding="utf-8"))
    except ValueError:
        return default_cost_settings()

    return normalize_cost_settings(data if isinstance(data, dict) else {})


def read_local_users_unlocked():
    if not USERS_FILE.exists():
        return []
    try:
        data = loads(USERS_FILE.read_text(encoding="utf-8"))
    except ValueError:
        return []
    return [user for user in data if isinstance(user, dict)] if isinstance(data, list) else []


def read_local_password_reset_requests_unlocked():
    if not PASSWORD_RESETS_FILE.exists():
        return []
    try:
        data = loads(PASSWORD_RESETS_FILE.read_text(encoding="utf-8"))
    except ValueError:
        return []
    return [request for request in data if isinstance(request, dict)] if isinstance(data, list) else []


def read_local_access_logs_unlocked():
    if not ACCESS_LOGS_FILE.exists():
        return []
    try:
        data = loads(ACCESS_LOGS_FILE.read_text(encoding="utf-8"))
    except ValueError:
        return []
    return [log for log in data if isinstance(log, dict)] if isinstance(data, list) else []


# ---------------------------------------------------------------------------
# Supabase
# ---------------------------------------------------------------------------

def supabase_enabled():
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def storage_error(action, exc):
    details = ""
    if isinstance(exc, HTTPError):
        try:
            body = exc.read().decode("utf-8", errors="replace")
        except Exception:
            body = ""
        details = f" HTTP {exc.code}: {body[:300]}"
    else:
        details = f" {exc}"
    # A mensagem detalhada vai só para o log; o cliente recebe uma mensagem genérica.
    return StorageError(f"Nao foi possivel {action}.{details}")


def health_status():
    if not supabase_enabled():
        return {"ok": True, "storage": "local"}
    try:
        supabase_request(f"/rest/v1/{SUPABASE_TABLE}?select=id&limit=1")
        return {"ok": True, "storage": "supabase"}
    except (HTTPError, URLError, ValueError, OSError) as exc:
        log_error(f"Health: {storage_error('conectar ao Supabase', exc)}")
        return {"ok": False, "storage": "supabase"}


def supabase_request(path, method="GET", body=None, extra_headers=None):
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)

    data = None if body is None else dumps(body, ensure_ascii=False).encode("utf-8")
    request = Request(f"{SUPABASE_URL}{path}", data=data, headers=headers, method=method)
    with urlopen(request, timeout=20) as response:
        payload = response.read().decode("utf-8")
        return loads(payload) if payload else None


def read_orders_supabase():
    rows = supabase_request(f"/rest/v1/{SUPABASE_TABLE}?select=*&order=request_date.desc,id.desc")
    return [db_to_order(row) for row in rows or []]


def create_order_supabase(order):
    for _ in range(5):
        try:
            rows = supabase_request(
                f"/rest/v1/{SUPABASE_TABLE}",
                method="POST",
                body=order_to_db(order),
                extra_headers={"Prefer": "return=representation"},
            )
            if rows:
                return db_to_order(rows[0])
        except HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            if exc.code == 400 and ("history" in error_body or "deliveries" in error_body):
                rows = supabase_request(
                    f"/rest/v1/{SUPABASE_TABLE}",
                    method="POST",
                    body=order_to_db(order, include_history="history" not in error_body, include_deliveries="deliveries" not in error_body),
                    extra_headers={"Prefer": "return=representation"},
                )
                if rows:
                    return db_to_order(rows[0])
            elif exc.code != 409:
                log_error(f"Supabase recusou o pedido novo: HTTP {exc.code}: {error_body[:300]}")
                raise
        order["id"] = generate_order_id()
    return order


def update_order_supabase(order_id, changes, merged):
    path = f"/rest/v1/{SUPABASE_TABLE}?id=eq.{quote(order_id, safe='')}"
    fields = {**changes, "history": merged.get("history", [])}
    try:
        rows = supabase_request(
            path,
            method="PATCH",
            body=updates_to_db(fields),
            extra_headers={"Prefer": "return=representation"},
        )
    except HTTPError as exc:
        if exc.code != 400:
            raise
        error_body = exc.read().decode("utf-8", errors="replace")
        # Mesmo no reenvio, o histórico montado pelo servidor (merged) é mantido quando a coluna existe.
        rows = supabase_request(
            path,
            method="PATCH",
            body=updates_to_db(fields, include_history="history" not in error_body, include_deliveries="deliveries" not in error_body),
            extra_headers={"Prefer": "return=representation"},
        )
    return db_to_order(rows[0]) if rows else None


def delete_order_supabase(order_id):
    supabase_request(
        f"/rest/v1/{SUPABASE_TABLE}?id=eq.{quote(order_id, safe='')}",
        method="DELETE",
        extra_headers={"Prefer": "return=minimal"},
    )


def read_access_logs_supabase():
    rows = supabase_request(
        f"/rest/v1/{SUPABASE_ACCESS_LOGS_TABLE}?select=*&order=created_at.desc&limit=300"
    )
    return [db_to_access_log(row) for row in rows or []]


def read_prices_supabase():
    rows = supabase_request(
        f"/rest/v1/{SUPABASE_PRICES_TABLE}?select=*&order=model.asc,size.asc,bath.asc"
    )
    return [db_to_price(row) for row in rows or []]


def write_prices_supabase(prices):
    # Primeiro grava (upsert pela chave única model+size+bath); só depois apaga o que saiu da lista.
    # Se a gravação falhar, a tabela antiga continua intacta.
    if prices:
        supabase_request(
            f"/rest/v1/{SUPABASE_PRICES_TABLE}?on_conflict=model,size,bath",
            method="POST",
            body=[price_to_db(price) for price in prices],
            extra_headers={"Prefer": "return=minimal,resolution=merge-duplicates"},
        )
    keep = {(price["model"], price["size"], price["bath"]) for price in prices}
    existing = supabase_request(f"/rest/v1/{SUPABASE_PRICES_TABLE}?select=id,model,size,bath") or []
    stale_ids = [
        str(row.get("id"))
        for row in existing
        if (row.get("model", ""), row.get("size", ""), row.get("bath", "")) not in keep and row.get("id") is not None
    ]
    for start in range(0, len(stale_ids), 100):
        chunk = ",".join(stale_ids[start : start + 100])
        supabase_request(
            f"/rest/v1/{SUPABASE_PRICES_TABLE}?id=in.({chunk})",
            method="DELETE",
            extra_headers={"Prefer": "return=minimal"},
        )


def read_cost_settings_supabase():
    rows = supabase_request(
        f"/rest/v1/{SUPABASE_COST_SETTINGS_TABLE}?id=eq.current&select=*&limit=1"
    )
    if not rows:
        settings = default_cost_settings()
        write_cost_settings_supabase(settings)
        return settings
    return db_to_cost_settings(rows[0])


def write_cost_settings_supabase(settings):
    supabase_request(
        f"/rest/v1/{SUPABASE_COST_SETTINGS_TABLE}?on_conflict=id",
        method="POST",
        body=cost_settings_to_db(normalize_cost_settings(settings)),
        extra_headers={"Prefer": "return=minimal,resolution=merge-duplicates"},
    )


def read_users_supabase():
    rows = supabase_request(f"/rest/v1/{SUPABASE_USERS_TABLE}?select=*&order=login.asc")
    return [db_to_user(row) for row in rows or []]


def save_user_supabase(user):
    supabase_request(
        f"/rest/v1/{SUPABASE_USERS_TABLE}?on_conflict=login",
        method="POST",
        body=user_to_db(user),
        extra_headers={"Prefer": "return=minimal,resolution=merge-duplicates"},
    )


def delete_user_supabase(login):
    supabase_request(
        f"/rest/v1/{SUPABASE_USERS_TABLE}?login=eq.{quote(login, safe='')}",
        method="DELETE",
        extra_headers={"Prefer": "return=minimal"},
    )


def read_password_reset_requests_supabase():
    rows = supabase_request(f"/rest/v1/{SUPABASE_PASSWORD_RESETS_TABLE}?select=*&order=created_at.desc&limit=300")
    return [db_to_password_reset_request(row) for row in rows or []]


def save_password_reset_request_supabase(request):
    supabase_request(
        f"/rest/v1/{SUPABASE_PASSWORD_RESETS_TABLE}?on_conflict=id",
        method="POST",
        body=password_reset_request_to_db(request),
        extra_headers={"Prefer": "return=minimal,resolution=merge-duplicates"},
    )


def write_access_log(access):
    if not isinstance(access, dict):
        return
    details = access.get("details") if isinstance(access.get("details"), dict) else {}
    payload = {
        "user_name": str(access.get("userName", "") or "").strip()[:120],
        "login": str(access.get("login", "") or "").strip()[:120],
        "role": str(access.get("role", "") or "").strip()[:20],
        "phone": only_digits(access.get("phone", ""))[:20],
        "origin": str(access.get("origin", "") or "").strip()[:300],
        "user_agent": str(access.get("userAgent", "") or "").strip()[:300],
        "event_type": str(access.get("eventType", "login") or "login").strip()[:60],
        "details": details,
    }
    if supabase_enabled():
        try:
            supabase_request(
                f"/rest/v1/{SUPABASE_ACCESS_LOGS_TABLE}",
                method="POST",
                body=payload,
                extra_headers={"Prefer": "return=minimal"},
            )
        except (HTTPError, URLError, ValueError, OSError) as exc:
            log_error(f"Registro de acesso não gravado: {storage_error('gravar registro de acesso', exc)}")
        return
    try:
        with LOCK:
            logs = read_local_access_logs_unlocked()
            logs.insert(0, {**db_to_access_log(payload), "createdAt": now_iso()})
            write_json_file(ACCESS_LOGS_FILE, logs[:300])
    except OSError as exc:
        log_error(f"Registro de acesso local não gravado: {exc}")


def now_br():
    return datetime.now(BR_TZ)


def now_iso():
    return now_br().isoformat(timespec="seconds")


def default_due_date(request_date):
    try:
        current = datetime.strptime(str(request_date or ""), "%Y-%m-%d").date()
    except ValueError:
        current = now_br().date()
    added = 0
    while added < 30:
        current += timedelta(days=1)
        if current.weekday() < 5:
            added += 1
    return current.isoformat()


def public_order_status(status):
    text = str(status or "").strip()
    if normalize(text) in ("entregue", "finalizado", "finalizado (entregue)"):
        return "Finalizado"
    return text


def database_order_status(status):
    # Mantém compatibilidade com a restrição atual do Supabase.
    return "Entregue" if public_order_status(status) == "Finalizado" else str(status or "").strip()


def normalize_order(order):
    request_date = str(order.get("requestDate", "") or "").strip() or now_br().date().isoformat()
    return {
        "id": "",
        "requestDate": request_date,
        "dueDate": str(order.get("dueDate", "") or "").strip() or default_due_date(request_date),
        "requester": str(order.get("requester", "") or "").strip(),
        "phone": only_digits(order.get("phone", "")),
        "origin": str(order.get("origin", "") or "").strip(),
        "priority": str(order.get("priority", "") or "").strip(),
        "status": public_order_status(order.get("status", "")),
        "notes": str(order.get("notes", "") or "").strip(),
        "items": [],
        "history": [],
        "deliveries": [],
        "updatedBy": "",
        "updatedByRole": "",
    }


def normalize_price(price):
    return {
        "model": str(price.get("model", "") or "").strip(),
        "size": str(price.get("size", "") or "").strip(),
        "bath": str(price.get("bath", "") or "").strip(),
        "unitCost": parse_decimal(price.get("unitCost", 0), 6),
        "weight": parse_decimal(price.get("weight", 0), 4),
        "goldThousandth": parse_decimal(price.get("goldThousandth", 0), 6),
    }


def default_cost_settings():
    return {"goldValue": 800, "rhodiumValue": 2500, "rhodiumFactor": 0.7}


def normalize_cost_settings(settings):
    return {
        "goldValue": parse_money(settings.get("goldValue", settings.get("gold_value", 800))),
        "rhodiumValue": parse_money(settings.get("rhodiumValue", settings.get("rhodium_value", 2500))),
        "rhodiumFactor": parse_decimal(settings.get("rhodiumFactor", settings.get("rhodium_factor", 0.7)), 4),
    }


def default_user_record(user, password):
    now = now_iso()
    return {
        "login": user["login"],
        "name": user["name"],
        "role": user["role"],
        **new_password_record(password),
        "mustChangePassword": True,
        "active": True,
        "createdAt": now,
        "updatedAt": now,
    }


def hash_password(password, salt):
    digest = pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ITERATIONS).hex()
    return f"{PASSWORD_HASH_PREFIX}${PBKDF2_ITERATIONS}${digest}"


def legacy_hash_password(password, salt):
    return sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def new_password_record(password):
    salt = token_hex(16)
    return {"passwordHash": hash_password(password, salt), "passwordSalt": salt}


def password_needs_rehash(user):
    return not str(user.get("passwordHash", "") or "").startswith(f"{PASSWORD_HASH_PREFIX}${PBKDF2_ITERATIONS}$")


def burn_password_check(password):
    # Mesmo custo de uma verificação real, para não revelar se o login existe pelo tempo de resposta.
    pbkdf2_hmac("sha256", password.encode("utf-8"), b"usuario-inexistente", PBKDF2_ITERATIONS)
    return False


def hash_reset_code(code):
    return sha256(str(code or "").strip().upper().encode("utf-8")).hexdigest()


def admin_whatsapp_reset_url(login):
    message = (
        "Olá, solicito autorização para redefinição da minha senha de acesso ao sistema.\n"
        f"Usuário informado: {login or '[USUÁRIO]'}."
    )
    return f"https://wa.me/5519971620931?text={quote(message)}"


def verify_password(password, user):
    salt = str(user.get("passwordSalt", "") or "")
    stored = str(user.get("passwordHash", "") or "")
    if not salt or not stored:
        return False
    password_bytes = str(password or "").encode("utf-8")
    if stored.startswith(f"{PASSWORD_HASH_PREFIX}$"):
        parts = stored.split("$")
        if len(parts) != 3:
            return False
        try:
            iterations = int(parts[1])
        except ValueError:
            return False
        if iterations < 1 or iterations > 5_000_000:
            return False
        digest = pbkdf2_hmac("sha256", password_bytes, salt.encode("utf-8"), iterations).hex()
        return hmac.compare_digest(digest.encode("ascii"), parts[2].encode("utf-8"))
    legacy = legacy_hash_password(str(password or ""), salt)
    return hmac.compare_digest(legacy.encode("ascii"), stored.encode("utf-8"))


def public_user(user):
    return {
        "login": user.get("login", ""),
        "name": user.get("name", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "origin": user.get("origin", ""),
        "mustChangePassword": bool(user.get("mustChangePassword")),
        "active": user.get("active") is not False,
        "createdAt": user.get("createdAt", ""),
        "updatedAt": user.get("updatedAt", ""),
    }


def public_password_reset_request(request):
    return {
        "id": request.get("id", ""),
        "login": request.get("login", ""),
        "userName": request.get("userName", ""),
        "role": request.get("role", ""),
        "status": request.get("status", ""),
        "createdAt": request.get("createdAt", ""),
        "approvedAt": request.get("approvedAt", ""),
        "approvedBy": request.get("approvedBy", ""),
        "expiresAt": request.get("expiresAt", ""),
        "usedAt": request.get("usedAt", ""),
        "decidedAt": request.get("decidedAt", ""),
        "decidedBy": request.get("decidedBy", ""),
    }


def parse_number_text(value, places):
    if isinstance(value, bool):
        return 0
    if isinstance(value, (int, float)):
        number = float(value)
    else:
        text = str(value or "0").strip().replace(" ", "")
        if "," in text:
            # Formato brasileiro: "1.234,56" -> 1234.56 ("." é milhar só quando também há ",").
            text = text.replace(".", "").replace(",", ".")
        try:
            number = float(text)
        except ValueError:
            return 0
    if not isfinite(number):
        return 0
    return round(number, places)


def parse_money(value):
    return parse_number_text(value, 2)


def parse_decimal(value, places=4):
    return parse_number_text(value, places)


def parse_iso_datetime(value):
    text = str(value or "").strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = f"{text[:-1]}+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        # Registros antigos foram gravados sem fuso, no horário do Brasil.
        parsed = parsed.replace(tzinfo=BR_TZ)
    return parsed


def generate_order_id():
    now = now_br()
    return f"PED-{now:%Y%m%d-%H%M%S}-{token_hex(2).upper()}"


def append_history(order, action, actor="", actor_role="", details=None, actor_login=""):
    history = order.get("history") if isinstance(order.get("history"), list) else []
    entry = {
        "at": now_iso(),
        "action": action,
        "user": actor or "Sistema",
        "role": actor_role or "",
        "details": details or {},
    }
    if actor_login:
        entry["login"] = actor_login
    history.append(entry)
    order["history"] = history


def history_action(updates):
    if "status" in updates:
        reason = str(updates.get("reopenReason", "") or "").strip()
        if reason:
            return f"Status alterado para {updates.get('status')} - motivo da reativacao: {reason}"
        return f"Status alterado para {updates.get('status')}"
    if "deliveries" in updates:
        return "Entrega do pedido registrada"
    if "galvanoplasty" in updates:
        return "Envio para Galvanoplastia registrado"
    if "dueDate" in updates:
        return f"Previsao de entrega alterada para {updates.get('dueDate') or 'sem previsao'}"
    if "items" in updates:
        return "Itens do pedido atualizados"
    return "Pedido atualizado"


def order_update_history_details(changes, notification=None):
    details = dict(changes)
    if isinstance(notification, dict) and notification.get("confirmed"):
        details["whatsappNotification"] = {
            "confirmed": True,
            "confirmedAt": str(notification.get("confirmedAt", ""))[:40],
            "status": str(notification.get("status", ""))[:80],
            "phone": only_digits(notification.get("phone", ""))[:20],
            "user": str(notification.get("user", ""))[:120],
            "login": str(notification.get("login", ""))[:120],
        }
    return details


def allowed_order_updates(updates, allowed_keys=ORDER_UPDATE_FIELDS):
    if not isinstance(updates, dict):
        return {}
    return {key: updates[key] for key in allowed_keys if key in updates}


def updates_to_db(fields, include_history=True, include_deliveries=True):
    # "fields" já vem validado pelo servidor (inclui o histórico montado aqui, nunca o do cliente).
    db_updates = {}
    field_map = {
        "requestDate": "request_date",
        "dueDate": "due_date",
        "requester": "requester",
        "phone": "phone",
        "origin": "origin",
        "priority": "priority",
        "status": "status",
        "notes": "notes",
        "items": "items",
        "history": "history",
        "galvanoplasty": "galvanoplasty",
        "deliveries": "deliveries",
    }
    for key, value in fields.items():
        if key not in field_map:
            continue
        if key == "history" and not include_history:
            continue
        if key == "deliveries" and not include_deliveries:
            continue
        if key == "status":
            value = database_order_status(value)
        db_updates[field_map[key]] = None if key == "dueDate" and not value else value
    return db_updates


def order_to_db(order, include_history=True, include_deliveries=True):
    data = {
        "id": order.get("id", ""),
        "request_date": order.get("requestDate", ""),
        "due_date": order.get("dueDate") or None,
        "requester": order.get("requester", ""),
        "phone": only_digits(order.get("phone", "")),
        "origin": order.get("origin", ""),
        "priority": order.get("priority", ""),
        "status": database_order_status(order.get("status", "")),
        "notes": order.get("notes", ""),
        "items": order.get("items", []),
        "galvanoplasty": order.get("galvanoplasty") or {},
    }
    if include_deliveries:
        data["deliveries"] = order.get("deliveries") if isinstance(order.get("deliveries"), list) else []
    if include_history:
        data["history"] = order.get("history", [])
    return data


def db_to_order(row):
    request_date = row.get("request_date", "")
    return {
        "id": row.get("id", ""),
        "requestDate": request_date,
        "dueDate": row.get("due_date", "") or default_due_date(request_date),
        "requester": row.get("requester", ""),
        "phone": row.get("phone", ""),
        "origin": row.get("origin", ""),
        "priority": row.get("priority", ""),
        "status": public_order_status(row.get("status", "")),
        "notes": row.get("notes", ""),
        "items": row.get("items") or [],
        "history": row.get("history") or [],
        "galvanoplasty": row.get("galvanoplasty") or {},
        "deliveries": row.get("deliveries") or [],
    }


def price_to_db(price):
    return {
        "model": price.get("model", ""),
        "size": price.get("size", ""),
        "bath": price.get("bath", ""),
        "unit_cost": price.get("unitCost", 0),
        "weight": price.get("weight", 0),
        "gold_thousandth": price.get("goldThousandth", 0),
    }


def db_to_price(row):
    return {
        "model": row.get("model", ""),
        "size": row.get("size", ""),
        "bath": row.get("bath", ""),
        "unitCost": float(row.get("unit_cost") or 0),
        "weight": float(row.get("weight") or 0),
        "goldThousandth": float(row.get("gold_thousandth") or 0),
    }


def cost_settings_to_db(settings):
    return {
        "id": "current",
        "gold_value": settings.get("goldValue", 800),
        "rhodium_value": settings.get("rhodiumValue", 2500),
        "rhodium_factor": settings.get("rhodiumFactor", 0.7),
    }


def db_to_cost_settings(row):
    return normalize_cost_settings(
        {
            "goldValue": row.get("gold_value", 800),
            "rhodiumValue": row.get("rhodium_value", 2500),
            "rhodiumFactor": row.get("rhodium_factor", 0.7),
        }
    )


def db_to_access_log(row):
    return {
        "userName": row.get("user_name", ""),
        "login": row.get("login", ""),
        "role": row.get("role", ""),
        "phone": row.get("phone", ""),
        "origin": row.get("origin", ""),
        "userAgent": row.get("user_agent", ""),
        "eventType": row.get("event_type", "login"),
        "details": row.get("details") or {},
        "createdAt": row.get("created_at", ""),
    }


def user_to_db(user):
    return {
        "login": user.get("login", ""),
        "name": user.get("name", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "origin": user.get("origin", ""),
        "password_hash": user.get("passwordHash", ""),
        "password_salt": user.get("passwordSalt", ""),
        "must_change_password": bool(user.get("mustChangePassword")),
        "active": user.get("active") is not False,
    }


def db_to_user(row):
    return {
        "login": row.get("login", ""),
        "name": row.get("name", ""),
        "role": row.get("role", ""),
        "phone": row.get("phone", ""),
        "origin": row.get("origin", ""),
        "passwordHash": row.get("password_hash", ""),
        "passwordSalt": row.get("password_salt", ""),
        "mustChangePassword": bool(row.get("must_change_password")),
        "active": row.get("active") is not False,
        "createdAt": row.get("created_at", ""),
        "updatedAt": row.get("updated_at", ""),
    }


def password_reset_request_to_db(request):
    return {
        "id": request.get("id", ""),
        "login": request.get("login", ""),
        "user_name": request.get("userName", ""),
        "role": request.get("role", ""),
        "status": request.get("status", ""),
        "code_hash": request.get("codeHash", ""),
        "approved_by": request.get("approvedBy") or None,
        "decided_by": request.get("decidedBy") or None,
        "created_at": request.get("createdAt") or None,
        "approved_at": request.get("approvedAt") or None,
        "expires_at": request.get("expiresAt") or None,
        "used_at": request.get("usedAt") or None,
        "decided_at": request.get("decidedAt") or None,
    }


def db_to_password_reset_request(row):
    return {
        "id": row.get("id", ""),
        "login": row.get("login", ""),
        "userName": row.get("user_name", ""),
        "role": row.get("role", ""),
        "status": row.get("status", ""),
        "codeHash": row.get("code_hash", ""),
        "createdAt": row.get("created_at", ""),
        "approvedAt": row.get("approved_at", ""),
        "approvedBy": row.get("approved_by", ""),
        "expiresAt": row.get("expires_at", ""),
        "usedAt": row.get("used_at", ""),
        "decidedAt": row.get("decided_at", ""),
        "decidedBy": row.get("decided_by", ""),
    }


def normalize(value):
    return str(value or "").strip().lower()


def normalize_identity(value):
    text = " ".join(str(value or "").strip().lower().split())
    decomposed = unicode_normalize("NFD", text)
    return "".join(ch for ch in decomposed if category(ch) != "Mn")


def validate_user_identity_link(name, phone, exclude_login=""):
    identity_name = normalize_identity(name)
    identity_phone = only_digits(phone)
    excluded = normalize(exclude_login)
    for user in read_users():
        if excluded and normalize(user.get("login")) == excluded:
            continue
        if user.get("role") != "collaborator":
            continue
        existing_name = normalize_identity(user.get("name", ""))
        existing_phone = only_digits(user.get("phone", ""))
        if not existing_name or not existing_phone:
            continue
        same_name = existing_name == identity_name
        same_phone = existing_phone == identity_phone
        if same_name and same_phone:
            raise ValueError("Este colaborador ja possui cadastro. Use o acesso existente ou solicite redefinicao de senha.")
        if same_name:
            raise ValueError("Este nome ja esta vinculado a outro celular. Para seguranca, use o celular cadastrado ou solicite ajuste ao Master.")
        if same_phone:
            raise ValueError("Este celular ja esta vinculado a outro colaborador. Para seguranca, use o nome cadastrado ou solicite ajuste ao Master.")


def only_digits(value):
    return "".join(ch for ch in str(value or "") if ch.isdigit())


def is_valid_mobile(value):
    phone = only_digits(value)
    if len(phone) == 13 and phone.startswith("55"):
        phone = phone[2:]
    if len(phone) != 11 or phone == phone[0] * 11:
        return False
    try:
        ddd = int(phone[:2])
    except ValueError:
        return False
    return 11 <= ddd <= 99 and phone[2] == "9"


def order_items(order):
    items = order.get("items") if isinstance(order, dict) else None
    return [item for item in items if isinstance(item, dict)] if isinstance(items, list) else []


def filter_orders(orders, filters):
    search = normalize(filters.get("search", [""])[0])
    status = filters.get("status", [""])[0]
    priority = filters.get("priority", [""])[0]
    phone = only_digits(filters.get("phone", [""])[0])

    result = []
    for order in orders:
        if not isinstance(order, dict):
            continue
        if phone and only_digits(order.get("phone")) != phone:
            continue
        if status and order.get("status") != status:
            continue
        if priority and order.get("priority") != priority:
            continue

        text = " ".join(
            [
                str(order.get("id", "")),
                str(order.get("requestDate", "")),
                str(order.get("dueDate", "")),
                str(order.get("requester", "")),
                str(order.get("phone", "")),
                str(order.get("origin", "")),
                str(order.get("priority", "")),
                str(order.get("status", "")),
                str(order.get("notes", "")),
                " ".join(
                    f"{item.get('model', '')} {item.get('size', '')} {item.get('bath', '')}"
                    for item in order_items(order)
                ),
            ]
        ).lower()
        if search and search not in text:
            continue
        result.append(order)
    return result


# Caracteres que o XML 1.0 não aceita (quebrariam o arquivo do Excel).
XML_INVALID_CHARS = re.compile("[\x00-\x08\x0b\x0c\x0e-\x1f\ud800-\udfff￾￿]")


def xlsx_text(value):
    if value is None:
        return ""
    return XML_INVALID_CHARS.sub("", str(value))


def xlsx_cell(cell_ref, value):
    if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value):
        return f'<c r="{cell_ref}"><v>{value}</v></c>'
    return f'<c r="{cell_ref}" t="inlineStr"><is><t>{escape(xlsx_text(value))}</t></is></c>'


def build_xlsx(orders):
    rows = [["Pedido", "Data", "Previsão", "Solicitante", "Celular", "Origem", "Status", "Prioridade", "Modelo", "Tamanho", "Banho", "Quantidade", "Observações"]]
    for order in orders:
        if not isinstance(order, dict):
            continue
        for item in order_items(order):
            try:
                rows.append(
                    [
                        order.get("id", ""),
                        order.get("requestDate", ""),
                        order.get("dueDate", ""),
                        order.get("requester", ""),
                        order.get("phone", ""),
                        order.get("origin", ""),
                        order.get("status", ""),
                        order.get("priority", ""),
                        item.get("model", ""),
                        item.get("size", ""),
                        item.get("bath", ""),
                        item.get("quantity", ""),
                        order.get("notes", ""),
                    ]
                )
            except Exception:
                log_error(f"Item ignorado no relatório do pedido {order.get('id', '')}")

    sheet_rows = []
    for row_index, row in enumerate(rows, start=1):
        cells = [xlsx_cell(f"{column_name(column_index)}{row_index}", value) for column_index, value in enumerate(row, start=1)]
        sheet_rows.append(f"<row r=\"{row_index}\">{''.join(cells)}</row>")

    worksheet = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>{''.join(sheet_rows)}</sheetData>
</worksheet>'''

    buffer = BytesIO()
    with ZipFile(buffer, "w", ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>''')
        archive.writestr("_rels/.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>''')
        archive.writestr("xl/workbook.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Pedidos" sheetId="1" r:id="rId1"/></sheets>
</workbook>''')
        archive.writestr("xl/_rels/workbook.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>''')
        archive.writestr("xl/worksheets/sheet1.xml", worksheet)
    return buffer.getvalue()


def column_name(index):
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


if __name__ == "__main__":
    port = int(environ.get("PORT", "4174"))
    if not environ.get("SESSION_SECRET", "").strip() and not SUPABASE_SERVICE_ROLE_KEY:
        log_error("SESSION_SECRET não definido (modo local): as sessões valem só enquanto este processo estiver no ar.")
    ensure_default_users()
    server = ThreadingHTTPServer(("0.0.0.0", port), RequestHandler)
    print(f"Sistema disponível em http://0.0.0.0:{port}/index.html", flush=True)
    server.serve_forever()
