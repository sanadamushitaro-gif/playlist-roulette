# Playlist Roulette

誰かが登録した YouTube 再生リストをランダムに表示する、ローカル完結の Next.js アプリです。

Supabase や外部 DB は使わず、投稿されたプレイリストと通報は `data/local-db.json` に保存されます。

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local JSON storage
- YouTube playlist embed

## Setup

```bash
npm install
npm.cmd run dev
```

起動後に以下を開きます。

```text
http://127.0.0.1:3000
```

## Local Data

初回登録時に `data/local-db.json` が自動作成されます。

保存形式は以下です。

```json
{
  "playlists": [
    {
      "id": "uuid",
      "playlist_id": "PLxxxx",
      "url": "https://www.youtube.com/playlist?list=PLxxxx",
      "title": "深夜に聴くやつ",
      "description": "知らない人に届いてほしい",
      "tags": ["深夜", "平成", "internet"],
      "created_at": "2026-05-09T00:00:00.000Z",
      "is_hidden": false
    }
  ],
  "reports": [
    {
      "id": "uuid",
      "playlist_id": "playlist uuid",
      "reason": "不適切",
      "created_at": "2026-05-09T00:00:00.000Z"
    }
  ]
}
```

`data/local-db.json` は `.gitignore` 済みです。ローカルの登録データを消したい場合は、このファイルを削除してください。

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
