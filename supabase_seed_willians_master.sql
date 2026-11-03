insert into public.accessory_users (
  login,
  name,
  role,
  phone,
  origin,
  password_hash,
  password_salt,
  must_change_password
)
values (
  'Willians.Jorge',
  'Willians Jorge',
  'master',
  '',
  '',
  '5034dc4c174b76e62822c2218bd93196f90b067f6d404bd883d4ef0ae5cd742c',
  'williansjorge',
  true
)
on conflict (login) do update set
  name = excluded.name,
  role = excluded.role,
  must_change_password = true,
  updated_at = now();
