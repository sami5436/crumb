-- Crumb: sourdough starter feeding log.
-- Tables are RLS-enabled with no policies, so the publishable key can only reach
-- the security-definer functions below, each of which requires a secret slug.

create extension if not exists pgcrypto;

create table if not exists public.crumb_starters (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  flour      text not null default 'bread flour',
  hydration  int  not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.crumb_feedings (
  id         uuid primary key default gen_random_uuid(),
  starter_id uuid not null references public.crumb_starters(id) on delete cascade,
  fed_at     timestamptz not null default now(),
  ratio      text not null default '1:1:1',
  temp_f     numeric,
  peak_hours numeric,
  rise_ratio numeric,
  notes      text,
  created_at timestamptz not null default now()
);

create index if not exists crumb_feedings_starter_fed_at_idx
  on public.crumb_feedings (starter_id, fed_at desc);

alter table public.crumb_starters enable row level security;
alter table public.crumb_feedings enable row level security;

-- No RLS policies exist, so anon/authenticated cannot read or write the tables
-- directly. Every operation goes through the security-definer RPCs below, which
-- require knowledge of a starter's secret slug.
revoke all on public.crumb_starters from anon, authenticated;
revoke all on public.crumb_feedings from anon, authenticated;

create or replace function public.crumb_new_slug()
returns text language sql volatile
set search_path = public, pg_temp as $$
  select string_agg(
    substr('abcdefghjkmnpqrstuvwxyz23456789', 1 + floor(random() * 31)::int, 1), ''
  ) from generate_series(1, 10);
$$;

create or replace function public.crumb_create_starter(
  p_name text, p_flour text default 'bread flour', p_hydration int default 100
) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_slug text; v_tries int := 0;
begin
  p_name := nullif(btrim(p_name), '');
  if p_name is null then raise exception 'Give your starter a name.'; end if;
  if length(p_name) > 60 then raise exception 'Name is too long.'; end if;
  if p_hydration is null or p_hydration < 50 or p_hydration > 200 then
    raise exception 'Hydration must be between 50%% and 200%%.';
  end if;

  loop
    v_slug := crumb_new_slug();
    exit when not exists (select 1 from crumb_starters s where s.slug = v_slug);
    v_tries := v_tries + 1;
    if v_tries > 10 then raise exception 'Could not allocate a slug.'; end if;
  end loop;

  insert into crumb_starters (slug, name, flour, hydration)
  values (v_slug, p_name, coalesce(nullif(btrim(p_flour), ''), 'bread flour'), p_hydration);
  return v_slug;
end $$;

create or replace function public.crumb_get(p_slug text)
returns jsonb
language sql security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'starter', to_jsonb(s) - 'id',
    'feedings', coalesce((
      select jsonb_agg(to_jsonb(f) - 'starter_id' order by f.fed_at desc)
      from crumb_feedings f where f.starter_id = s.id
    ), '[]'::jsonb)
  )
  from crumb_starters s where s.slug = p_slug;
$$;

create or replace function public.crumb_log_feeding(
  p_slug text, p_fed_at timestamptz, p_ratio text, p_temp_f numeric,
  p_peak_hours numeric, p_rise_ratio numeric, p_notes text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  select id into v_id from crumb_starters where slug = p_slug;
  if v_id is null then raise exception 'No starter found for that link.'; end if;
  if p_peak_hours is not null and (p_peak_hours <= 0 or p_peak_hours > 48) then
    raise exception 'Peak time must be between 0 and 48 hours.';
  end if;
  if p_rise_ratio is not null and (p_rise_ratio < 1 or p_rise_ratio > 10) then
    raise exception 'Rise must be between 1x and 10x.';
  end if;

  insert into crumb_feedings (starter_id, fed_at, ratio, temp_f, peak_hours, rise_ratio, notes)
  values (
    v_id, coalesce(p_fed_at, now()),
    coalesce(nullif(btrim(p_ratio), ''), '1:1:1'),
    p_temp_f, p_peak_hours, p_rise_ratio, nullif(btrim(p_notes), '')
  );
  return crumb_get(p_slug);
end $$;

create or replace function public.crumb_delete_feeding(p_slug text, p_id uuid)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  delete from crumb_feedings f
  using crumb_starters s
  where f.id = p_id and f.starter_id = s.id and s.slug = p_slug;
  return crumb_get(p_slug);
end $$;

revoke all on function public.crumb_new_slug() from public, anon, authenticated;
revoke all on function public.crumb_create_starter(text, text, int) from public;
revoke all on function public.crumb_get(text) from public;
revoke all on function public.crumb_log_feeding(text, timestamptz, text, numeric, numeric, numeric, text) from public;
revoke all on function public.crumb_delete_feeding(text, uuid) from public;

grant execute on function public.crumb_create_starter(text, text, int) to anon, authenticated;
grant execute on function public.crumb_get(text) to anon, authenticated;
grant execute on function public.crumb_log_feeding(text, timestamptz, text, numeric, numeric, numeric, text) to anon, authenticated;
grant execute on function public.crumb_delete_feeding(text, uuid) to anon, authenticated;
