from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from json import dumps, loads
from pathlib import Path
from threading import Lock
from urllib.parse import parse_qs, quote, urlparse
from zipfile import ZIP_DEFLATED, ZipFile
from io import BytesIO
from html import escape
from os import environ
from datetime import datetime
from secrets import token_hex
from hashlib import sha256
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from unicodedata import category, normalize as unicode_normalize

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "orders.json"
PRICES_FILE = ROOT / "prices.json"
COST_SETTINGS_FILE = ROOT / "cost_settings.json"
USERS_FILE = ROOT / "users.json"
LOCK = Lock()


def load_env_file():
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        environ.setdefault(key.strip().lstrip("\ufeff"), value.strip().strip('"').strip("'"))


load_env_file()
SUPABASE_URL = environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_TABLE = environ.get("SUPABASE_ORDERS_TABLE", "accessory_orders")
SUPABASE_ACCESS_LOGS_TABLE = environ.get("SUPABASE_ACCESS_LOGS_TABLE", "accessory_access_logs")
SUPABASE_PRICES_TABLE = environ.get("SUPABASE_PRICES_TABLE", "accessory_prices")
SUPABASE_COST_SETTINGS_TABLE = environ.get("SUPABASE_COST_SETTINGS_TABLE", "accessory_cost_settings")
SUPABASE_USERS_TABLE = environ.get("SUPABASE_USERS_TABLE", "accessory_users")

DEFAULT_USERS = [
    {"login": "Charles Marinho", "password": "12345", "name": "Charles Marinho", "role": "master", "mustChangePassword": True},
    {"login": "Willians.Jorge", "password": "12345", "name": "Willians Jorge", "role": "master", "mustChangePassword": True},
    {"login": "Juliano", "password": "12345", "name": "Juliano", "role": "consultant", "mustChangePassword": True},
]


class StorageError(RuntimeError):
    pass


class RequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def guess_type(self, path):
        content_type = super().guess_type(path)
        if path.endswith((".html", ".js", ".css")) and "charset=" not in content_type:
            return f"{content_type}; charset=utf-8"
        return content_type

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/orders":
            try:
                self.send_json(read_orders())
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if parsed.path == "/api/health":
            self.send_json(health_status())
            return

        if parsed.path == "/api/status":
            filters = parse_qs(parsed.query)
            phone = only_digits(filters.get("phone", [""])[0])
            try:
                orders = [order for order in read_orders() if only_digits(order.get("phone")) == phone]
                self.send_json(orders)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if parsed.path == "/api/report.xlsx":
            filters = parse_qs(parsed.query)
            try:
                self.send_xlsx(filter_orders(read_orders(), filters))
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if parsed.path == "/api/access-logs":
            try:
                self.send_json(read_access_logs())
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if parsed.path == "/api/prices":
            try:
                self.send_json(read_prices())
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if parsed.path == "/api/cost-settings":
            try:
                self.send_json(read_cost_settings())
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        super().do_GET()

    def do_PUT(self):
        if self.path == "/api/orders":
            try:
                orders = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            if not isinstance(orders, list):
                self.send_error(400, "A lista de pedidos é obrigatória")
                return

            try:
                write_orders(orders)
                self.send_json({"ok": True})
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/prices":
            try:
                prices = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            if not isinstance(prices, list):
                self.send_error(400, "A lista de preços é obrigatória")
                return

            try:
                write_prices(prices)
                self.send_json({"ok": True})
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/cost-settings":
            try:
                settings = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            if not isinstance(settings, dict):
                self.send_error(400, "Os parâmetros de custo são obrigatórios")
                return

            try:
                write_cost_settings(settings)
                self.send_json({"ok": True})
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        self.send_error(404)

    def do_POST(self):
        if self.path == "/api/auth":
            try:
                credentials = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            try:
                user = authenticate_user(credentials)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
                return
            if not user:
                self.send_json({"ok": False, "error": "Login ou senha inválidos."}, status=401)
                return
            self.send_json({"ok": True, "user": user})
            return

        if self.path == "/api/users/password":
            try:
                payload = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            try:
                user = change_user_password(payload)
                self.send_json({"ok": True, "user": user})
            except ValueError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=400)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/users/admin-list":
            try:
                payload = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON invalido")
                return

            try:
                users = list_users_for_master(payload)
                self.send_json({"ok": True, "users": users})
            except ValueError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=403)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/users/admin-password":
            try:
                payload = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON invalido")
                return

            try:
                user = admin_reset_user_password(payload)
                self.send_json({"ok": True, "user": user})
            except ValueError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=400)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/users/management":
            try:
                payload = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON invalido")
                return

            try:
                user = create_management_user(payload)
                self.send_json({"ok": True, "user": user}, status=201)
            except ValueError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=400)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/admin/database":
            try:
                payload = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON invalido")
                return

            try:
                database = read_admin_database(payload)
                self.send_json({"ok": True, "database": database})
            except ValueError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=403)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/users":
            try:
                payload = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            try:
                user = create_user(payload)
                self.send_json({"ok": True, "user": user}, status=201)
            except ValueError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=400)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        if self.path == "/api/access-logs":
            try:
                access = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            write_access_log(access)
            self.send_json({"ok": True}, status=201)
            return

        if self.path == "/api/orders":
            try:
                order = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            if not isinstance(order, dict):
                self.send_error(400, "Pedido inválido")
                return

            try:
                self.send_json(create_order(order), status=201)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        self.send_error(404)

    def do_PATCH(self):
        parsed = urlparse(self.path)
        prefix = "/api/orders/"
        if parsed.path.startswith(prefix):
            order_id = parsed.path[len(prefix) :]
            if not order_id:
                self.send_error(400, "Pedido obrigatório")
                return

            try:
                updates = self.read_json_body()
            except ValueError:
                self.send_error(400, "JSON inválido")
                return

            try:
                updated = update_order(order_id, updates)
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
                return
            if not updated:
                self.send_error(404, "Pedido não encontrado")
                return
            self.send_json(updated)
            return

        self.send_error(404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        prefix = "/api/orders/"
        if parsed.path.startswith(prefix):
            order_id = parsed.path[len(prefix) :]
            if not order_id:
                self.send_error(400, "Pedido obrigatório")
                return

            try:
                delete_order(order_id)
                self.send_json({"ok": True})
            except StorageError as exc:
                self.send_json({"ok": False, "error": str(exc)}, status=503)
            return

        self.send_error(404)

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        payload = self.rfile.read(length).decode("utf-8")
        return loads(payload)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, payload, status=200):
        body = dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
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


def read_orders():
    if supabase_enabled():
        try:
            return read_orders_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler pedidos no Supabase", exc) from exc

    with LOCK:
        return read_local_orders_unlocked()


def write_orders(orders):
    if supabase_enabled():
        try:
            write_orders_supabase(orders)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar pedidos no Supabase", exc) from exc

    with LOCK:
        DATA_FILE.write_text(dumps(orders, ensure_ascii=False, indent=2), encoding="utf-8")


def create_order(order):
    normalized = normalize_order(order)
    normalized["id"] = normalized.get("id") or generate_order_id()
    append_history(
        normalized,
        "Pedido criado",
        normalized.get("updatedBy") or normalized.get("requester"),
        normalized.get("updatedByRole") or "collaborator",
        {"status": normalized.get("status"), "items": len(normalized.get("items", []))},
    )

    if supabase_enabled():
        try:
            return create_order_supabase(normalized)
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("criar pedido no Supabase", exc) from exc

    with LOCK:
        orders = read_local_orders_unlocked()
        existing_ids = {current.get("id") for current in orders}
        while normalized["id"] in existing_ids:
            normalized["id"] = generate_order_id()
        orders.insert(0, normalized)
        DATA_FILE.write_text(dumps(orders, ensure_ascii=False, indent=2), encoding="utf-8")
    return normalized


def upsert_order(order):
    normalized = normalize_order(order)
    if supabase_enabled():
        try:
            return upsert_order_supabase(normalized)
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("atualizar pedido no Supabase", exc) from exc

    with LOCK:
        orders = read_local_orders_unlocked()
        found = False
        for index, current in enumerate(orders):
            if current.get("id") == normalized.get("id"):
                orders[index] = {**current, **normalized}
                found = True
                break
        if not found:
            orders.insert(0, normalized)
        DATA_FILE.write_text(dumps(orders, ensure_ascii=False, indent=2), encoding="utf-8")
    return normalized


def update_order(order_id, updates):
    updates = {**updates}
    actor = updates.pop("updatedBy", "")
    actor_role = updates.pop("updatedByRole", "")
    if supabase_enabled():
        try:
            return update_order_supabase(order_id, updates, actor, actor_role)
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("alterar pedido no Supabase", exc) from exc

    with LOCK:
        orders = read_local_orders_unlocked()
        updated = None
        for index, current in enumerate(orders):
            if current.get("id") == order_id:
                updated = {**current, **allowed_order_updates(updates)}
                append_history(updated, history_action(updates), actor, actor_role, allowed_order_updates(updates))
                orders[index] = updated
                break
        if updated:
            DATA_FILE.write_text(dumps(orders, ensure_ascii=False, indent=2), encoding="utf-8")
        return updated


def delete_order(order_id):
    if supabase_enabled():
        try:
            delete_order_supabase(order_id)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("excluir pedido no Supabase", exc) from exc

    with LOCK:
        orders = read_local_orders_unlocked()
        orders = [order for order in orders if order.get("id") != order_id]
        DATA_FILE.write_text(dumps(orders, ensure_ascii=False, indent=2), encoding="utf-8")


def read_access_logs():
    if supabase_enabled():
        try:
            return read_access_logs_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler registros de acesso no Supabase", exc) from exc
    return []


def read_prices():
    if supabase_enabled():
        try:
            return read_prices_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler preços no Supabase", exc) from exc

    with LOCK:
        return read_local_prices_unlocked()


def write_prices(prices):
    normalized = [normalize_price(price) for price in prices if isinstance(price, dict)]
    if supabase_enabled():
        try:
            write_prices_supabase(normalized)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar preços no Supabase", exc) from exc

    with LOCK:
        PRICES_FILE.write_text(dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")


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
    if supabase_enabled():
        try:
            write_cost_settings_supabase(normalized)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar parâmetros de custo no Supabase", exc) from exc

    with LOCK:
        COST_SETTINGS_FILE.write_text(dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")


def authenticate_user(credentials):
    if not isinstance(credentials, dict):
        return None
    login = str(credentials.get("login", "")).strip()
    password = str(credentials.get("password", ""))
    role = str(credentials.get("role", "")).strip()
    user = find_user(login)
    if not user or user.get("role") != role:
        return None
    if not verify_password(password, user):
        return None
    return public_user(user)


def change_user_password(payload):
    if not isinstance(payload, dict):
        raise ValueError("Dados inválidos.")
    login = str(payload.get("login", "")).strip()
    current_password = str(payload.get("currentPassword", ""))
    new_password = str(payload.get("newPassword", ""))
    if len(new_password) < 4:
        raise ValueError("A senha deve ter pelo menos 4 caracteres.")
    if new_password == "12345":
        raise ValueError("Escolha uma senha diferente da provisória.")
    user = find_user(login)
    if not user or not verify_password(current_password, user):
        raise ValueError("Senha atual inválida.")
    salt = token_hex(8)
    updated = {
        **user,
        "passwordHash": hash_password(new_password, salt),
        "passwordSalt": salt,
        "mustChangePassword": False,
        "updatedAt": datetime.now().isoformat(),
    }
    save_user(updated)
    return public_user(updated)


def authenticate_master(payload):
    master = payload.get("master") if isinstance(payload, dict) else {}
    if not isinstance(master, dict):
        raise ValueError("Credencial Master obrigatoria.")
    credentials = {
        "login": str(master.get("login", "")).strip(),
        "password": str(master.get("password", "")),
        "role": "master",
    }
    user = authenticate_user(credentials)
    if not user or user.get("role") != "master":
        raise ValueError("Acesso Master invalido.")
    return user


def list_users_for_master(payload):
    authenticate_master(payload)
    return [public_user(user) for user in read_users()]


def read_admin_database(payload):
    authenticate_master(payload)
    orders = read_orders()
    return {
        "generatedAt": datetime.now().isoformat(),
        "storage": "supabase" if supabase_enabled() else "local",
        "orders": [admin_order_summary(order) for order in orders],
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
    except (TypeError, ValueError):
        return 0


def admin_reset_user_password(payload):
    if not isinstance(payload, dict):
        raise ValueError("Dados invalidos.")
    master_user = authenticate_master(payload)
    login = str(payload.get("login", "")).strip()
    new_password = str(payload.get("newPassword", ""))
    if len(new_password) < 4:
        raise ValueError("A senha provisoria deve ter pelo menos 4 caracteres.")
    user = find_user(login)
    if not user:
        raise ValueError("Usuario nao encontrado.")
    salt = token_hex(8)
    updated = {
        **user,
        "passwordHash": hash_password(new_password, salt),
        "passwordSalt": salt,
        "mustChangePassword": True,
        "updatedAt": datetime.now().isoformat(),
    }
    save_user(updated)
    write_access_log({
        "userName": master_user.get("name", "Master"),
        "login": master_user.get("login", ""),
        "role": "master",
        "eventType": "senha_provisoria",
        "details": {"targetLogin": login},
    })
    return public_user(updated)


def create_management_user(payload):
    if not isinstance(payload, dict):
        raise ValueError("Dados invalidos.")
    master_user = authenticate_master(payload)
    name = str(payload.get("name", "")).strip()
    sector = str(payload.get("sector", "")).strip()
    password = str(payload.get("password", ""))
    role = str(payload.get("role", "consultant")).strip() or "consultant"
    login = str(payload.get("login", "")).strip() or name

    if not name or not sector or not password:
        raise ValueError("Preencha nome, setor e senha padrao.")
    if role not in ("consultant", "master"):
        raise ValueError("Perfil administrativo invalido.")
    if len(password) < 4:
        raise ValueError("A senha padrao deve ter pelo menos 4 caracteres.")
    if find_user(login):
        raise ValueError("Ja existe usuario com este nome/login. Use outro nome para o cadastro.")

    salt = token_hex(8)
    now = datetime.now().isoformat()
    user = {
        "login": login,
        "name": name,
        "role": role,
        "phone": "",
        "origin": sector,
        "passwordHash": hash_password(password, salt),
        "passwordSalt": salt,
        "mustChangePassword": True,
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
    password = str(payload.get("password", ""))
    role = str(payload.get("role", "collaborator")).strip() or "collaborator"

    if role != "collaborator":
        raise ValueError("Perfil de cadastro inválido.")
    if not login or not name or not origin or not phone or not password:
        raise ValueError("Preencha todos os campos obrigatórios.")
    if not is_valid_mobile(phone):
        raise ValueError("Informe um telefone corporativo válido com DDD e 9 dígitos.")
    if len(password) < 4:
        raise ValueError("A senha deve ter pelo menos 4 caracteres.")
    if find_user(login):
        raise ValueError("Este usuário já existe. Escolha outro login.")

    salt = token_hex(8)
    user = {
        "login": login,
        "name": name,
        "role": role,
        "phone": phone,
        "origin": origin,
        "passwordHash": hash_password(password, salt),
        "passwordSalt": salt,
        "mustChangePassword": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat(),
    }
    save_user(user)
    return public_user(user)


def find_user(login):
    ensure_default_users()
    normalized_login = normalize(login)
    return next((user for user in read_users() if normalize(user.get("login")) == normalized_login), None)


def read_users():
    if supabase_enabled():
        try:
            return read_users_supabase()
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("ler usuários no Supabase", exc) from exc
    with LOCK:
        return read_local_users_unlocked()


def save_user(user):
    if supabase_enabled():
        try:
            save_user_supabase(user)
            return
        except (HTTPError, URLError, ValueError) as exc:
            raise storage_error("salvar usuário no Supabase", exc) from exc
    with LOCK:
        users = read_local_users_unlocked()
        users = [current for current in users if normalize(current.get("login")) != normalize(user.get("login"))]
        users.append(user)
        USERS_FILE.write_text(dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")


def ensure_default_users():
    if getattr(ensure_default_users, "done", False):
        return
    try:
        users = read_users_without_seed()
        existing = {normalize(user.get("login")) for user in users}
        for default in DEFAULT_USERS:
            if normalize(default["login"]) not in existing:
                save_user_without_seed(default_user_record(default))
    except (HTTPError, URLError, ValueError) as exc:
        raise storage_error("preparar usuários no Supabase", exc) from exc
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
        USERS_FILE.write_text(dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")


def read_local_orders_unlocked():
    if not DATA_FILE.exists():
        return []

    try:
        data = loads(DATA_FILE.read_text(encoding="utf-8"))
    except ValueError:
        return []

    return data if isinstance(data, list) else []


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
    return data if isinstance(data, list) else []


def supabase_enabled():
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)


def storage_error(action, exc):
    details = ""
    if isinstance(exc, HTTPError):
        body = exc.read().decode("utf-8", errors="replace")
        details = f" HTTP {exc.code}: {body[:300]}"
    else:
        details = f" {exc}"
    return StorageError(f"Nao foi possivel {action}.{details}")


def health_status():
    status = {
        "ok": True,
        "supabaseConfigured": supabase_enabled(),
        "supabaseConnected": False,
        "storage": "local",
        "error": "",
    }
    if not supabase_enabled():
        return status

    try:
        read_orders_supabase()
        status["supabaseConnected"] = True
        status["storage"] = "supabase"
    except (HTTPError, URLError, ValueError) as exc:
        status["ok"] = False
        status["error"] = str(storage_error("conectar ao Supabase", exc))

    return status


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


def write_orders_supabase(orders):
    if not orders:
        return
    supabase_request(
        f"/rest/v1/{SUPABASE_TABLE}?on_conflict=id",
        method="POST",
        body=[order_to_db(order) for order in orders],
        extra_headers={"Prefer": "return=minimal,resolution=merge-duplicates"},
    )


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
            if exc.code == 400 and "history" in error_body:
                rows = supabase_request(
                    f"/rest/v1/{SUPABASE_TABLE}",
                    method="POST",
                    body=order_to_db(order, include_history=False),
                    extra_headers={"Prefer": "return=representation"},
                )
                if rows:
                    return db_to_order(rows[0])
            elif exc.code != 409:
                raise
        order["id"] = generate_order_id()
    return order


def upsert_order_supabase(order):
    try:
        rows = supabase_request(
            f"/rest/v1/{SUPABASE_TABLE}?on_conflict=id",
            method="POST",
            body=order_to_db(order),
            extra_headers={"Prefer": "return=representation,resolution=merge-duplicates"},
        )
    except HTTPError as exc:
        if exc.code != 400:
            raise
        rows = supabase_request(
            f"/rest/v1/{SUPABASE_TABLE}?on_conflict=id",
            method="POST",
            body=order_to_db(order, include_history=False),
            extra_headers={"Prefer": "return=representation,resolution=merge-duplicates"},
        )
    return db_to_order(rows[0]) if rows else order


def update_order_supabase(order_id, updates, actor="", actor_role=""):
    current_rows = supabase_request(f"/rest/v1/{SUPABASE_TABLE}?id=eq.{quote(order_id, safe='')}&select=*")
    if not current_rows:
        return None
    current = db_to_order(current_rows[0])
    merged = {**current, **allowed_order_updates(updates)}
    append_history(merged, history_action(updates), actor, actor_role, allowed_order_updates(updates))
    try:
        rows = supabase_request(
            f"/rest/v1/{SUPABASE_TABLE}?id=eq.{quote(order_id, safe='')}",
            method="PATCH",
            body=updates_to_db({**updates, "history": merged.get("history", [])}),
            extra_headers={"Prefer": "return=representation"},
        )
    except HTTPError as exc:
        if exc.code != 400:
            raise
        rows = supabase_request(
            f"/rest/v1/{SUPABASE_TABLE}?id=eq.{quote(order_id, safe='')}",
            method="PATCH",
            body=updates_to_db(updates, include_history=False),
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
    supabase_request(
        f"/rest/v1/{SUPABASE_PRICES_TABLE}?id=gte.0",
        method="DELETE",
        extra_headers={"Prefer": "return=minimal"},
    )
    if not prices:
        return
    supabase_request(
        f"/rest/v1/{SUPABASE_PRICES_TABLE}",
        method="POST",
        body=[price_to_db(price) for price in prices],
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


def write_access_log(access):
    if not isinstance(access, dict):
        return
    payload = {
        "user_name": str(access.get("userName", "") or "").strip(),
        "login": str(access.get("login", "") or "").strip(),
        "role": str(access.get("role", "") or "").strip(),
        "phone": only_digits(access.get("phone", "")),
        "origin": str(access.get("origin", "") or "").strip(),
        "user_agent": str(access.get("userAgent", "") or "").strip(),
        "event_type": str(access.get("eventType", "login") or "login").strip(),
        "details": access.get("details") if isinstance(access.get("details"), dict) else {},
    }
    if supabase_enabled():
        try:
            supabase_request(
                f"/rest/v1/{SUPABASE_ACCESS_LOGS_TABLE}",
                method="POST",
                body=payload,
                extra_headers={"Prefer": "return=minimal"},
            )
        except (HTTPError, URLError, ValueError):
            pass


def normalize_order(order):
    return {
        "id": str(order.get("id", "")).strip(),
        "requestDate": str(order.get("requestDate", "")).strip() or datetime.now().date().isoformat(),
        "requester": str(order.get("requester", "")).strip(),
        "phone": only_digits(order.get("phone", "")),
        "origin": str(order.get("origin", "")).strip(),
        "priority": str(order.get("priority", "")).strip(),
        "status": str(order.get("status", "")).strip(),
        "notes": str(order.get("notes", "") or "").strip(),
        "items": order.get("items") if isinstance(order.get("items"), list) else [],
        "history": order.get("history") if isinstance(order.get("history"), list) else [],
        "updatedBy": str(order.get("updatedBy", "") or "").strip(),
        "updatedByRole": str(order.get("updatedByRole", "") or "").strip(),
    }


def normalize_price(price):
    return {
        "model": str(price.get("model", "")).strip(),
        "size": str(price.get("size", "")).strip(),
        "bath": str(price.get("bath", "")).strip(),
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


def default_user_record(user):
    salt = token_hex(8)
    now = datetime.now().isoformat()
    return {
        "login": user["login"],
        "name": user["name"],
        "role": user["role"],
        "passwordHash": hash_password(user["password"], salt),
        "passwordSalt": salt,
        "mustChangePassword": bool(user.get("mustChangePassword", False)),
        "createdAt": now,
        "updatedAt": now,
    }


def hash_password(password, salt):
    return sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def verify_password(password, user):
    salt = user.get("passwordSalt", "")
    password_hash = user.get("passwordHash", "")
    return bool(salt and password_hash and hash_password(password, salt) == password_hash)


def public_user(user):
    return {
        "login": user.get("login", ""),
        "name": user.get("name", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "origin": user.get("origin", ""),
        "mustChangePassword": bool(user.get("mustChangePassword")),
        "createdAt": user.get("createdAt", ""),
        "updatedAt": user.get("updatedAt", ""),
    }


def parse_money(value):
    if isinstance(value, (int, float)):
        return round(float(value), 2)
    text = str(value or "0").strip().replace(".", "").replace(",", ".")
    try:
        return round(float(text), 2)
    except ValueError:
        return 0


def parse_decimal(value, places=4):
    if isinstance(value, (int, float)):
        return round(float(value), places)
    text = str(value or "0").strip().replace(".", "").replace(",", ".")
    try:
        return round(float(text), places)
    except ValueError:
        return 0


def generate_order_id():
    now = datetime.now()
    return f"PED-{now:%Y%m%d-%H%M%S}-{token_hex(2).upper()}"


def append_history(order, action, actor="", actor_role="", details=None):
    history = order.get("history") if isinstance(order.get("history"), list) else []
    history.append(
        {
            "at": datetime.now().isoformat(timespec="seconds"),
            "action": action,
            "user": actor or "Sistema",
            "role": actor_role or "",
            "details": details or {},
        }
    )
    order["history"] = history


def history_action(updates):
    if "status" in updates:
        return f"Status alterado para {updates.get('status')}"
    if "items" in updates:
        return "Itens do pedido atualizados"
    return "Pedido atualizado"


def allowed_order_updates(updates):
    if not isinstance(updates, dict):
        return {}
    allowed = {}
    for key in ("requestDate", "requester", "phone", "origin", "priority", "status", "notes", "items", "history"):
        if key in updates:
            allowed[key] = updates[key]
    if "phone" in allowed:
        allowed["phone"] = only_digits(allowed["phone"])
    return allowed


def updates_to_db(updates, include_history=True):
    db_updates = {}
    allowed = allowed_order_updates(updates)
    field_map = {
        "requestDate": "request_date",
        "requester": "requester",
        "phone": "phone",
        "origin": "origin",
        "priority": "priority",
        "status": "status",
        "notes": "notes",
        "items": "items",
        "history": "history",
    }
    for key, value in allowed.items():
        if key == "history" and not include_history:
            continue
        db_updates[field_map[key]] = value
    return db_updates


def order_to_db(order, include_history=True):
    data = {
        "id": order.get("id", ""),
        "request_date": order.get("requestDate", ""),
        "requester": order.get("requester", ""),
        "phone": only_digits(order.get("phone", "")),
        "origin": order.get("origin", ""),
        "priority": order.get("priority", ""),
        "status": order.get("status", ""),
        "notes": order.get("notes", ""),
        "items": order.get("items", []),
    }
    if include_history:
        data["history"] = order.get("history", [])
    return data


def db_to_order(row):
    return {
        "id": row.get("id", ""),
        "requestDate": row.get("request_date", ""),
        "requester": row.get("requester", ""),
        "phone": row.get("phone", ""),
        "origin": row.get("origin", ""),
        "priority": row.get("priority", ""),
        "status": row.get("status", ""),
        "notes": row.get("notes", ""),
        "items": row.get("items") or [],
        "history": row.get("history") or [],
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
        "createdAt": row.get("created_at", ""),
        "updatedAt": row.get("updated_at", ""),
    }


def normalize(value):
    return str(value or "").strip().lower()


def normalize_identity(value):
    text = " ".join(str(value or "").strip().lower().split())
    decomposed = unicode_normalize("NFD", text)
    return "".join(ch for ch in decomposed if category(ch) != "Mn")


def validate_user_identity_link(name, phone):
    identity_name = normalize_identity(name)
    identity_phone = only_digits(phone)
    for user in read_users():
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


def filter_orders(orders, filters):
    search = normalize(filters.get("search", [""])[0])
    status = filters.get("status", [""])[0]
    priority = filters.get("priority", [""])[0]
    phone = only_digits(filters.get("phone", [""])[0])

    result = []
    for order in orders:
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
                str(order.get("requester", "")),
                str(order.get("phone", "")),
                str(order.get("origin", "")),
                str(order.get("priority", "")),
                str(order.get("status", "")),
                str(order.get("notes", "")),
                " ".join(
                    f"{item.get('model', '')} {item.get('size', '')} {item.get('bath', '')}"
                    for item in order.get("items", [])
                ),
            ]
        ).lower()
        if search and search not in text:
            continue
        result.append(order)
    return result


def build_xlsx(orders):
    rows = [["Pedido", "Data", "Solicitante", "Celular", "Origem", "Status", "Prioridade", "Modelo", "Tamanho", "Banho", "Quantidade", "Observações"]]
    for order in orders:
        for item in order.get("items", []):
            rows.append(
                [
                    order.get("id", ""),
                    order.get("requestDate", ""),
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

    sheet_rows = []
    for row_index, row in enumerate(rows, start=1):
        cells = []
        for column_index, value in enumerate(row, start=1):
            cell_ref = f"{column_name(column_index)}{row_index}"
            if isinstance(value, (int, float)):
                cells.append(f'<c r="{cell_ref}"><v>{value}</v></c>')
            else:
                cells.append(f'<c r="{cell_ref}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>')
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
    ensure_default_users()
    server = ThreadingHTTPServer(("0.0.0.0", port), RequestHandler)
    print(f"Sistema disponível em http://0.0.0.0:{port}/index.html")
    server.serve_forever()
