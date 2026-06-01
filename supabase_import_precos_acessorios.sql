alter table public.accessory_prices add column if not exists weight numeric(12,4) not null default 0;
alter table public.accessory_prices add column if not exists gold_thousandth numeric(12,6) not null default 0;
alter table public.accessory_prices alter column unit_cost type numeric(14,6);

with source_prices(model, size, unit_cost) as (
  values
    ('Argolinha', '3.0 x 0.60', 0.003),
    ('Argolinha', '3.5 x 0.70', 0.004),
    ('Argolinha', '3.5 x 0.80', 0.004),
    ('Argolinha', '4.2 x 0.70', 0.004),
    ('Argolinha', '4.2 x 0.80', 0.004),
    ('Argolinha', '5.0 x 0.80', 0.004),
    ('Extensor Losango', '3 cm', 0.12),
    ('Extensor Losango', '5 cm', 0.20),
    ('Extensor Losango', '7 cm', 0.28),
    ('Extensor Losango', '10 cm', 0.40),
    ('Extensor balãozinho', '3 cm', 0.09),
    ('Extensor balãozinho', '5 cm', 0.15),
    ('Extensor balãozinho', '7 cm', 0.21),
    ('Extensor balãozinho', '10 cm', 0.30),
    ('Extensor Vqzinha', '2,5 cm', 0.06),
    ('Extensor Vqzinha', '4,5 cm', 0.10),
    ('Timbre', 'VERI', 0.02),
    ('Fecho lagosta', '9 mm', 0.05),
    ('Fecho lagosta', '10 mm', 0.06),
    ('Fecho lagosta', '11 mm', 0.07),
    ('Fecho lagosta', '12 mm', 0.08),
    ('Fecho Italiano', '7mm', 0.12),
    ('Fecho Italiano', '10mm', 0.11),
    ('Fecho Italiano', '11mm', 0.10),
    ('Fecho Mola', '5mm', 0.07),
    ('Fecho Mola', '6mm', 0.04),
    ('Fecho Mola', '7mm', 0.07),
    ('Fecho Boia', '9mm', 0.26),
    ('Fecho Boia', '11mm', 0.28),
    ('Fecho Boia', '13mm', 0.30),
    ('Veneziana', '40 cm', 2.75),
    ('Veneziana', '42 cm', 2.85),
    ('Veneziana', '44 cm', 2.95),
    ('Veneziana', '50 cm', 3.25),
    ('Veneziana', '60 cm', 3.75),
    ('Veneziana', '70 cm', 4.25),
    ('Tarraxa', 'P', 0.02),
    ('Tarraxa', 'M', 0.03),
    ('Tarraxa', 'G', 0.06),
    ('Tarraxa', 'BABY', 0.06)
),
baths(bath) as (
  values ('Ouro'), ('Ródio')
)
insert into public.accessory_prices (model, size, bath, unit_cost, weight, gold_thousandth)
select
  source_prices.model,
  source_prices.size,
  baths.bath,
  source_prices.unit_cost,
  0,
  0
from source_prices
cross join baths
on conflict (model, size, bath) do update
set
  unit_cost = excluded.unit_cost,
  updated_at = now();
