-- =========================================================
-- 不動産管理アプリ用スキーマ
-- Supabase ダッシュボードの「SQL Editor」で実行する
-- =========================================================

-- 物件テーブル
create table if not exists public.properties (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,                       -- 物件名
  rent        integer     not null check (rent >= 0),     -- 家賃（円）
  area        text        not null,                       -- エリア名
  layout      text        not null,                       -- 間取り（例: 1LDK）
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 一覧表示の高速化用インデックス
create index if not exists properties_user_id_idx    on public.properties(user_id);
create index if not exists properties_created_at_idx on public.properties(created_at desc);

-- =========================================================
-- updated_at を更新時に自動で書き換えるトリガー
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_on_properties on public.properties;
create trigger set_updated_at_on_properties
  before update on public.properties
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- RLS (Row Level Security) を有効化
-- =========================================================
alter table public.properties enable row level security;

-- 既存ポリシーがあれば一旦削除（再実行を可能にする）
drop policy if exists "自分の物件を閲覧" on public.properties;
drop policy if exists "自分の物件を追加" on public.properties;
drop policy if exists "自分の物件を更新" on public.properties;
drop policy if exists "自分の物件を削除" on public.properties;

-- SELECT: 自分が登録した物件のみ閲覧可能
create policy "自分の物件を閲覧"
  on public.properties
  for select
  using (auth.uid() = user_id);

-- INSERT: 自分の user_id 以外では登録不可
create policy "自分の物件を追加"
  on public.properties
  for insert
  with check (auth.uid() = user_id);

-- UPDATE: 自分の物件のみ更新可能
create policy "自分の物件を更新"
  on public.properties
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: 自分の物件のみ削除可能
create policy "自分の物件を削除"
  on public.properties
  for delete
  using (auth.uid() = user_id);
