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
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "orders.json"
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


class StorageError(RuntimeError):
    pass


class RequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

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

        self.send_error(404)

    def do_POST(self):
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


def read_local_orders_unlocked():
    if not DATA_FILE.exists():
        return []

    try:
        data = loads(DATA_FILE.read_text(encoding="utf-8"))
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


def normalize(value):
    return str(value or "").strip().lower()


def only_digits(value):
    return "".join(ch for ch in str(value or "") if ch.isdigit())


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
    server = ThreadingHTTPServer(("0.0.0.0", port), RequestHandler)
    print(f"Sistema disponível em http://0.0.0.0:{port}/index.html")
    server.serve_forever()
