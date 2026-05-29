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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
