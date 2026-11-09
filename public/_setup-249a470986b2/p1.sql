-- ════════════════════════════════════════════════════════════════════
-- 방구석 춘식&덕구 — 전용 Supabase 스키마 (api-bangguseok.jawsweb.site)
-- Studio → SQL Editor 에 전체 붙여넣고 Run. 재실행 안전.
-- 이후 supabase/seed.sql 실행.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── 소유자 판별 (해동기공·A.D.I 와 동일) ─────────────────────────────
-- ⚠️ src/lib/admin-auth.ts 의 OWNER_EMAIL 과 같아야 한다.
create or replace function public.is_owner() returns boolean
language sql security definer stable set search_path = public, auth as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and lower(email) = 'k710922@gmail.com'
  );
$$;

-- ── 사이트 설정 (key-value) ─────────────────────────────────────────
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ── 시리즈 ──────────────────────────────────────────────────────────
create table if not exists public.series (
  slug text primary key,
  title text not null,
  channel text not null default '00',
  code_prefix text not null,
  summary text not null default '',
  format text not null default '',
  status text not null default 'planned' check (status in ('live','coming','planned')),
  sort int not null default 0
);

-- ── 캐릭터 ──────────────────────────────────────────────────────────
create table if not exists public.characters (
  slug text primary key,
  name text not null,
  role text not null default 'support' check (role in ('main','support')),
  age int,
  job text not null default '',
  tagline text not null default '',
  personality text not null default '',
  quote text not null default '',
  comic text not null default '',
  props text not null default '',
  spinoff text,
  face_url text not null default '',
  sheet_url text,
  color text not null default '#E2231A',
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

-- ── 회차 ────────────────────────────────────────────────────────────
create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_slug text not null references public.series(slug) on update cascade,
  number int not null,
  tape_code text not null unique,
  title text not null,
  youtube_id text unique,
  tiktok_url text,
  reels_url text,
  thumbnail_url text,
  q1 text,
  q2 text,
  summary text,
  duration_sec int,
  views int,
  published_at timestamptz,
  status text not null default 'published' check (status in ('published','draft')),
  source text not null default 'manual', -- manual | youtube-sync
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (series_slug, number)
);

create table if not exists public.episode_cast (
  episode_id uuid not null references public.episodes(id) on delete cascade,
  character_slug text not null references public.characters(slug) on update cascade on delete cascade,
  primary key (episode_id, character_slug)
);

-- 테이프 코드 입력 시에만 열리는 보너스 (공개 select 없음 → 서버가 service role 로 조회)
create table if not exists public.episode_bonus (
  episode_id uuid primary key references public.episodes(id) on delete cascade,
  q1_answer text,
  q2_answer text,
  q2_explain text,
  fly_count int,
  note text,
  unlock_count int not null default 0
);

-- ── 아재개그 자판기 DB ─────────────────────────────────────────────
create table if not exists public.jokes (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  wrong_answer text,
  asker text not null default 'chunsik',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── 오답 명예의 전당 (방문자 제출 → 소유자 승인) ─────────────────────
create table if not exists public.wrong_answers (
  id uuid primary key default gen_random_uuid(),
  episode_code text,
  nickname text not null check (char_length(nickname) between 1 and 20),
  body text not null check (char_length(body) between 1 and 200),
  votes int not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','featured','rejected')),
  created_at timestamptz not null default now()
);

-- ── 늬우스 제보함 ───────────────────────────────────────────────────
create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  nickname text check (nickname is null or char_length(nickname) <= 20),
  headline text not null check (char_length(headline) between 2 and 200),
  source_url text not null check (source_url ~* '^https?://'),
  note text check (note is null or char_length(note) <= 1000),
  status text not null default 'new' check (status in ('new','picked','rejected')),
  created_at timestamptz not null default now()
);

-- ── 유튜브 동기화 로그 ──────────────────────────────────────────────
create table if not exists public.sync_log (
  id bigserial primary key,
  ran_at timestamptz not null default now(),
  source text not null,
  found int not null default 0,
  inserted int not null default 0,
  updated int not null default 0,
  message text
);

-- ── 투표 RPC (익명 가능, 승인된 오답에만) ────────────────────────────
create or replace function public.vote_wrong_answer(p_id uuid) returns int
language sql security definer set search_path = public as $$
  update public.wrong_answers set votes = votes + 1
  where id = p_id and status in ('approved','featured')
  returning votes;
$$;
grant execute on function public.vote_wrong_answer(uuid) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- RLS — 공개 읽기 + 소유자만 쓰기
-- ════════════════════════════════════════════════════════════════════
alter table public.site_settings enable row level security;
alter table public.series        enable row level security;
alter table public.characters    enable row level security;
alter table public.episodes      enable row level security;
alter table public.episode_cast  enable row level security;
alter table public.episode_bonus enable row level security;
alter table public.jokes         enable row level security;
alter table public.wrong_answers enable row level security;
alter table public.tips          enable row level security;
alter table public.sync_log      enable row level security;

do $$
declare t text;
begin
  foreach t in array array['site_settings','series','characters','episode_cast','jokes'] loop
    execute format('drop policy if exists %I on public.%I', t||'_read', t);
    execute format('create policy %I on public.%I for select using (true)', t||'_read', t);
  end loop;
  foreach t in array array['site_settings','series','characters','episodes','episode_cast','episode_bonus','jokes','wrong_answers','tips','sync_log'] loop
    execute format('drop policy if exists %I on public.%I', t||'_owner', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_owner()) with check (public.is_owner())', t||'_owner', t);
  end loop;
end $$;

drop policy if exists episodes_read on public.episodes;
create policy episodes_read on public.episodes for select using (status = 'published');

drop policy if exists wrong_answers_read on public.wrong_answers;
create policy wrong_answers_read on public.wrong_answers for select using (status in ('approved','featured'));
drop policy if exists wrong_answers_submit on public.wrong_answers;
create policy wrong_answers_submit on public.wrong_answers for insert to anon, authenticated
  with check (status = 'pending' and votes = 0);

drop policy if exists tips_submit on public.tips;
create policy tips_submit on public.tips for insert to anon, authenticated
  with check (status = 'new');

-- ════════════════════════════════════════════════════════════════════
-- Storage — media 버킷 (캐릭터 이미지·썸네일), 공개 읽기 / 소유자 쓰기
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do update set public = true;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media_owner_write" on storage.objects;
create policy "media_owner_write" on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.is_owner())
  with check (bucket_id = 'media' and public.is_owner());
