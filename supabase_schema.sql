create table if not exists public.accessory_orders (
  id text primary key,
  request_date date not null,
  requester text not null,
  phone text,
  origin text not null,
  priority text not null check (priority in ('Normal', 'Urgente')),
  status text not null check (status in ('Pedido Recebido', 'Em separação', 'Entregue')),
  notes text default '',
  items jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accessory_orders
add column if not exists history jsonb not null default '[]'::jsonb;

create index if not exists accessory_orders_phone_idx on public.accessory_orders (phone);
create index if not exists accessory_orders_status_idx on public.accessory_orders (status);
create index if not exists accessory_orders_request_date_idx on public.accessory_orders (request_date desc);

create or replace function public.set_accessory_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists accessory_orders_updated_at on public.accessory_orders;
create trigger accessory_orders_updated_at
before update on public.accessory_orders
for each row
execute function public.set_accessory_orders_updated_at();

alter table public.accessory_orders enable row level security;

drop policy if exists "service role manages accessory orders" on public.accessory_orders;
create policy "service role manages accessory orders"
on public.accessory_orders
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create table if not exists public.accessory_access_logs (
  id bigserial primary key,
  user_name text not null,
  login text,
  role text,
  phone text,
  origin text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists accessory_access_logs_created_at_idx on public.accessory_access_logs (created_at desc);
create index if not exists accessory_access_logs_user_name_idx on public.accessory_access_logs (user_name);

alter table public.accessory_access_logs enable row level security;

drop policy if exists "service role manages accessory access logs" on public.accessory_access_logs;
create policy "service role manages accessory access logs"
on public.accessory_access_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create table if not exists public.accessory_prices (
  id bigserial primary key,
  model text not null,
  size text not null,
  bath text not null check (bath in ('Ouro', 'Ródio')),
  unit_cost numeric(12,2) not null default 0,
  weight numeric(12,4) not null default 0,
  gold_thousandth numeric(12,6) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (model, size, bath)
);

alter table public.accessory_prices add column if not exists weight numeric(12,4) not null default 0;
alter table public.accessory_prices add column if not exists gold_thousandth numeric(12,6) not null default 0;

create index if not exists accessory_prices_model_idx on public.accessory_prices (model);

drop trigger if exists accessory_prices_updated_at on public.accessory_prices;
create trigger accessory_prices_updated_at
before update on public.accessory_prices
for each row
execute function public.set_accessory_orders_updated_at();

alter table public.accessory_prices enable row level security;

drop policy if exists "service role manages accessory prices" on public.accessory_prices;
create policy "service role manages accessory prices"
on public.accessory_prices
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create table if not exists public.accessory_cost_settings (
  id text primary key default 'current',
  gold_value numeric(12,2) not null default 800,
  rhodium_value numeric(12,2) not null default 2500,
  rhodium_factor numeric(12,4) not null default 0.7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.accessory_cost_settings (id, gold_value, rhodium_value, rhodium_factor)
values ('current', 800, 2500, 0.7)
on conflict (id) do nothing;

drop trigger if exists accessory_cost_settings_updated_at on public.accessory_cost_settings;
create trigger accessory_cost_settings_updated_at
before update on public.accessory_cost_settings
for each row
execute function public.set_accessory_orders_updated_at();

alter table public.accessory_cost_settings enable row level security;

drop policy if exists "service role manages accessory cost settings" on public.accessory_cost_settings;
create policy "service role manages accessory cost settings"
on public.accessory_cost_settings
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create table if not exists public.accessory_users (
  login text primary key,
  name text not null,
  role text not null check (role in ('master', 'consultant')),
  password_hash text not null,
  password_salt text not null,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accessory_users_role_idx on public.accessory_users (role);

drop trigger if exists accessory_users_updated_at on public.accessory_users;
create trigger accessory_users_updated_at
before update on public.accessory_users
for each row
execute function public.set_accessory_orders_updated_at();

alter table public.accessory_users enable row level security;

drop policy if exists "service role manages accessory users" on public.accessory_users;
create policy "service role manages accessory users"
on public.accessory_users
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
