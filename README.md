# Playlist Roulette

誰かが登録した YouTube 再生リストをランダムに表示する、ローカル完結の Next.js アプリです。

Supabase や外部 DB は使わず、投稿されたプレイリストと通報はローカルでは `data/local-db.json` に保存されます。

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

Vercel 上ではファイルシステムが読み取り専用のため、書き込み先は `/tmp/playlist-roulette/local-db.json` になります。この保存先は一時領域なので、デプロイや実行環境の都合で消える可能性があります。公開運用で投稿を残したい場合は、Supabase や Vercel Postgres などの永続 DB に切り替えてください。

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

## Banner Ad

トップページと登録ページに仮のバナー広告枠を置いています。

任意で以下の環境変数を設定すると、自前の広告リンクや画像に差し替えられます。

```env
NEXT_PUBLIC_ADSENSE_SLOT=9482939667
NEXT_PUBLIC_AD_BANNER_URL=https://example.com
NEXT_PUBLIC_AD_BANNER_IMAGE_URL=https://example.com/banner.png
NEXT_PUBLIC_AD_BANNER_TEXT=広告テキスト
```

Google AdSense の読み込みスクリプトは `ca-pub-8137251460969383` で設定済みです。広告ユニットのデフォルト slot は `9482939667` です。別の広告ユニットに切り替える場合は `NEXT_PUBLIC_ADSENSE_SLOT` を変更してください。
