# Playlist Roulette

誰かが登録した YouTube 再生リストをランダムに表示する Next.js アプリです。

投稿されたプレイリストと通報は Supabase の `playlists` / `reports` テーブルに保存します。

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- YouTube playlist embed

## Setup

```bash
npm install
copy .env.example .env.local
npm.cmd run dev
```

`.env.local` に Supabase の値を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

起動後に以下を開きます。

```text
http://127.0.0.1:3000
```

## Supabase Schema

Supabase SQL Editor で以下を実行します。

```sql
create table playlists (
  id uuid primary key default gen_random_uuid(),
  playlist_id text not null unique,
  url text not null,
  title text,
  description text,
  tags text[],
  created_at timestamp with time zone default now(),
  is_hidden boolean default false
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id),
  reason text,
  created_at timestamp with time zone default now()
);
```

RLS と最低限のポリシーです。

```sql
alter table playlists enable row level security;
alter table reports enable row level security;

create policy "Visible playlists can be read"
on playlists
for select
using (is_hidden = false);

create policy "Anyone can submit playlists"
on playlists
for insert
with check (true);

create policy "Anyone can create reports"
on reports
for insert
with check (true);
```

## Routes

- `/` - 登録済みプレイリストからランダムに1件表示
- `/submit` - YouTube 再生リスト URL、タイトル、説明、タグを登録
- `GET /api/playlists` - 表示可能なプレイリスト一覧
- `POST /api/playlists` - プレイリスト登録
- `GET /api/random-playlist` - ランダムなプレイリストを1件取得
- `POST /api/reports` - 通報を保存

## Notes

- YouTube Data API は使っていません。
- 埋め込み URL は `https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID` です。
- 登録時は URL の `list` パラメータを `playlist_id` として保存します。
- 同じ `playlist_id` は登録できません。
- `SUPABASE_SERVICE_ROLE_KEY` はこのアプリでは使いません。GitHub に push しないでください。
