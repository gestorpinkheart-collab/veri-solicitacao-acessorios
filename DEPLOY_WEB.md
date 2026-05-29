# Publicar o sistema na web

O link `127.0.0.1` e links com IP local funcionam apenas no computador/rede local. Para qualquer pessoa acessar de fora, o sistema precisa ficar hospedado em um servidor web.

## Estado atual do Supabase

O arquivo `.env` ainda esta com valores de exemplo. Enquanto estiver assim, o sistema usa `orders.json` como fallback local.

Para ativar o banco, preencha `.env` ou as variaveis do provedor com:

```env
SUPABASE_URL=https://seu-projeto-real.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
SUPABASE_ORDERS_TABLE=accessory_orders
```

Nunca coloque a `SUPABASE_SERVICE_ROLE_KEY` no `app.js` ou no HTML.

## Opcao recomendada: Render

1. Suba esta pasta para um repositorio GitHub privado.
2. Acesse `https://render.com`.
3. Clique em `New` > `Web Service`.
4. Conecte o repositorio.
5. Configure:
   - Runtime: `Python`
   - Build command: `pip install -r requirements.txt`
   - Start command: `python server.py`
6. Em `Environment`, cadastre:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ORDERS_TABLE=accessory_orders`
7. Clique em `Deploy`.

O Render vai gerar um link parecido com:

```text
https://veri-solicitacao-acessorios.onrender.com/index.html
```

Esse sera o link para divulgar.

## Verificar se o banco esta ativo

Depois de publicar, abra:

```text
https://SEU-LINK/api/health
```

Resultado esperado:

```json
{
  "ok": true,
  "supabaseConfigured": true,
  "supabaseConnected": true,
  "storage": "supabase"
}
```

Se aparecer `"storage": "local"`, o sistema nao esta conectado ao Supabase e esta usando fallback local.

## Teste final

1. Abra o link publico em uma janela anonima.
2. Entre como usuario comum.
3. Crie um pedido.
4. Abra o Supabase > Table Editor > `accessory_orders`.
5. Confirme se o pedido apareceu.
6. Entre como Fabrica/Master no link publico.
7. Altere status e confira se continua salvo apos atualizar a pagina.
