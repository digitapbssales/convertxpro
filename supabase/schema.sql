create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default now()
);

create table if not exists conversion_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  from_unit text not null,
  to_unit text not null,
  value numeric not null,
  result numeric not null,
  created_at timestamp with time zone default now()
);

create table if not exists favorites (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  from_unit text not null,
  to_unit text not null,
  hash text generated always as (md5(category||from_unit||to_unit)) stored,
  created_at timestamp with time zone default now(),
  unique(user_id, hash)
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid,
  action text not null,
  meta jsonb,
  created_at timestamp with time zone default now()
);

alter table conversion_history enable row level security;
alter table favorites enable row level security;
alter table audit_logs enable row level security;

create policy history_select on conversion_history for select using (auth.uid() = user_id);
create policy history_insert on conversion_history for insert with check (auth.uid() = user_id);
create policy favorites_select on favorites for select using (auth.uid() = user_id);
create policy favorites_insert on favorites for insert with check (auth.uid() = user_id);
create policy audit_select on audit_logs for select using (auth.uid() = user_id);
create policy audit_insert on audit_logs for insert with check (auth.uid() = user_id);

create table if not exists banners (
  id bigint generated always as identity primary key,
  title text,
  message text,
  image_url text,
  link_url text,
  active boolean default true,
  created_at timestamp with time zone default now()
);
alter table banners enable row level security;
create policy banners_public on banners for select using (true);
