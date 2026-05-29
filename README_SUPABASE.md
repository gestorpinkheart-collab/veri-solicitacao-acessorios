# Implantacao com Supabase

Este sistema ja esta preparado para gravar pedidos no Supabase quando as variaveis de ambiente estiverem configuradas. Sem essas variaveis, ele continua usando o arquivo local `orders.json`.

## 1. Criar a tabela

1. Acesse o painel do Supabase.
2. Abra `SQL Editor`.
3. Cole e execute o conteudo do arquivo `supabase_schema.sql`.

Isso cria a tabela `accessory_orders`, indices, controle de `updated_at` e uma policy para uso via `service_role`.

## 2. Configurar as chaves

1. Copie `.env.example` para `.env`.
2. Preencha:
   - `SUPABASE_URL`: URL do projeto Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: chave `service_role`.
   - `SUPABASE_ORDERS_TABLE`: mantenha `accessory_orders`, salvo se mudar o nome da tabela.

Exemplo:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
SUPABASE_ORDERS_TABLE=accessory_orders
```

Importante: a `service_role` nunca deve ficar no `app.js` ou no navegador. Ela fica somente no servidor Python.

## 3. Rodar o sistema

Com o `.env` configurado, reinicie o servidor:

```powershell
python server.py
```

Depois acesse:

```text
http://127.0.0.1:4174/index.html
```

## 4. Como o sistema grava

O app usa operacoes individuais por pedido:

- `GET /api/orders`: lista pedidos.
- `POST /api/orders`: cria ou atualiza um pedido.
- `PATCH /api/orders/{id}`: altera campos como status.
- `DELETE /api/orders/{id}`: exclui pedido.
- `GET /api/report.xlsx`: baixa relatorio Excel.

Esse modelo evita sobrescrever pedidos de outros usuarios quando varias pessoas usam o sistema ao mesmo tempo.

## 5. Proximo passo para publicar

Para liberar para a equipe fora desta maquina, o servidor Python precisa ficar hospedado em um ambiente acessivel pela rede, por exemplo um servidor interno, Render, Railway, VPS ou outro host Python. O navegador dos usuarios deve acessar esse servidor, porque ele protege a chave `service_role` e conversa com o Supabase.
