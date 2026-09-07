# contact-form-sample

静的な HTML/CSS/JS のお問い合わせフォームと、Node.js (Express) の API、PostgreSQL によるデータ保存を組み合わせたサンプルアプリケーションです。
デプロイ先は **Azure完結**（App Service + Azure Database for PostgreSQL）を想定しています。フロントエンドもExpressの静的配信で同じアプリから提供するため、GitHub Pagesのような別ホスティングとの分離やCORS設定は不要です。

## 構成

```
contact-form-sample/
├── public/            静的フロントエンド
│   ├── index.html     お問い合わせフォーム
│   ├── thanks.html    送信完了後のサンクスページ
│   ├── list.html      問い合わせ一覧 (簡易・認証なし)
│   ├── list.js
│   ├── style.css
│   └── script.js
├── server/            Express API (public/ の静的配信も兼ねる)
│   ├── index.js
│   ├── db/
│   │   ├── pool.js    PostgreSQL 接続プール (Azure向けにSSL有効がデフォルト)
│   │   ├── init.sql   テーブル定義
│   │   └── migrate.js init.sql を適用するスクリプト
│   └── routes/
│       └── contact.js POST/GET /api/contact
└── .env.example
```

## ローカルでの動作確認

Azure Database for PostgreSQL Flexible Server（開発用インスタンス）に対して接続する想定です。

```bash
npm install
cp .env.example .env   # DATABASE_URL を実際のAzure Postgresの接続情報に書き換える

npm run db:migrate     # テーブルを作成
npm start               # http://localhost:3000
```

## API

- `POST /api/contact` — お問い合わせを保存します。
  - Body: `{ "name": string, "email": string, "category": "general"|"product"|"quote"|"other", "message": string }`
  - 成功時: `201` と保存されたレコードを返します。
  - バリデーションエラー時: `400` とフィールドごとのエラーを返します。
- `GET /api/contact` — 保存済みのお問い合わせを新しい順に最大50件返します。`public/list.html` が利用します。
- `GET /api/health` — ヘルスチェック。

## 画面

- `/` (`index.html`) — お問い合わせフォーム。送信成功時は `thanks.html` に遷移します。
- `/thanks.html` — 送信完了メッセージを表示するサンクスページ。
- `/list.html` — 保存済み問い合わせの簡易一覧画面。**認証はありません**。社内・開発用途を想定しており、個人情報を含むため公開URLとして外部に共有しないでください。将来的にスパム対策(reCAPTCHA等)や一覧画面への認証追加を検討しています（`TODO.md` 参照）。

## Azureへのデプロイ（想定構成）

| リソース | 役割 |
|---|---|
| **Azure App Service** (Node.js ランタイム) | `server/index.js` を起動し、`public/` の静的配信とAPIの両方を提供 |
| **Azure Database for PostgreSQL Flexible Server** | データ保存先 |

App Serviceは環境変数 `PORT` を自動的に注入するため、このアプリはコード変更なしでそのまま動作します。デプロイ後は App Service の「構成」で `DATABASE_URL` を Azure Database for PostgreSQL の接続文字列（`sslmode=require`）に設定してください。

CI/CD（GitHub Actionsなど）を組む場合は、別途ワークフローの追加が必要です。
