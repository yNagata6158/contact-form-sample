# contact-form-sample

静的な HTML/CSS/JS のお問い合わせフォームと、Node.js (Express) の API、PostgreSQL によるデータ保存を組み合わせたサンプルアプリケーションです。
デプロイ先は **Azure完結**（Azure Container Apps + Azure Database for PostgreSQL）を想定しています。フロントエンドもExpressの静的配信で同じアプリから提供するため、GitHub Pagesのような別ホスティングとの分離やCORS設定は不要です。

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
├── tests/              自動テスト (node:test)
│   └── contact.validate.test.js
├── Dockerfile          Azure Container Apps向けのコンテナイメージ定義
├── .dockerignore
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

## テスト

```bash
npm test    # node:test でバリデーションロジックの単体テストを実行 (追加依存なし)
```

現状はバリデーションロジック(`validate()`)の単体テストのみで、DBに依存する結合テスト（POST/GET /api/contactの実挙動）は未整備です。

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

## Azureへのデプロイ（採用構成）

| リソース | 役割 |
|---|---|
| **Azure Container Apps** | `Dockerfile` からビルドしたコンテナイメージを実行。`public/` の静的配信とAPIの両方を提供 |
| **Azure Container Registry (ACR)** | コンテナイメージの保管先。Container Appsはマネージド ID (システム割り当て) で認証してPull |
| **Azure Database for PostgreSQL Flexible Server** | データ保存先 |

Container Appsはコンテナのポート `3000`（`Dockerfile` の `EXPOSE`/`ENV PORT` に合わせて設定）にingressを向けています。`DATABASE_URL` はContainer Appの secret として保存し、環境変数から参照しています。

### なぜApp ServiceではなくContainer Appsなのか

当初はAzure App Service（Node.jsランタイム、ソースコード直接デプロイ）を採用する予定でした。しかし実際にリソース作成を試みたところ、対象サブスクリプション（新規のPay-As-You-Go）で**App Service Planに必要なコンピューティング(VM)クォータが0**に制限されており、リージョンを変えても（Japan East / East US）、別サブスクリプションに切り替えても作成できませんでした。

Azureポータルからのクォータ増設申請（Help + support 経由のサポートリクエスト）で解消は可能ですが、手続きが煩雑なため、**同じ「Azure完結」構成を保ったまま、別のクォータ枠を使うAzure Container Apps（Consumption/サーバーレスプラン）に切り替えました**。Container Appsはこのクォータ制限の影響を受けず、ポータル操作なしでCLIから即座に作成できました。

この変更に伴うコード側の変更は最小限で、`Dockerfile` を1つ追加しただけです（`server/`・`public/` のコードは無変更）。

### デプロイ手順

```bash
# 1. Azure Container Registry でイメージをビルド・プッシュ (ローカルDocker不要)
az acr build --registry <ACR名> --resource-group <リソースグループ> --image contact-form-sample:latest .

# 2. Container Appを作成 (初回のみ)
az containerapp create \
  --name contact-form-sample \
  --resource-group <リソースグループ> \
  --environment <Container Apps環境名> \
  --image <ACR名>.azurecr.io/contact-form-sample:latest \
  --registry-server <ACR名>.azurecr.io \
  --registry-identity system \
  --target-port 3000 \
  --ingress external \
  --min-replicas 0 --max-replicas 1 \
  --secrets "database-url=<Postgres接続文字列>" \
  --env-vars "DATABASE_URL=secretref:database-url"

# 2'. 更新時はイメージを再ビルド後、以下でリビジョンを更新
# 注意: イメージタグが :latest のまま (文字列が変わらない) だと、Container Appsが
# 「参照に変更なし」と判断して新しいリビジョンを作らないことがある。
# その場合は --revision-suffix で明示的に新しいリビジョンを作成する。
az containerapp update \
  --name contact-form-sample \
  --resource-group <リソースグループ> \
  --image <ACR名>.azurecr.io/contact-form-sample:latest \
  --revision-suffix <任意の一意な文字列 (例: 日時やビルド番号)>
```

コミットハッシュ等でイメージタグを一意にする運用にすれば、この注意は不要になる（Phase 4のCI/CD化で対応予定）。

CI/CD（GitHub Actionsなど）を組む場合は、上記のビルド・プッシュ・更新を自動化するワークフローの追加が必要です。
**現状はセットアップ途中で保留中です** — 詳細と残作業は `TODO.md` Phase 4、および起票予定のGitHub Issueを参照してください。

### バックアップ・監視

- **バックアップ**: Azure Database for PostgreSQL Flexible Serverの既定設定を採用（自動バックアップ保持7日間、ポイントインタイムリストア可能）。geo冗長バックアップは無効（ローカル冗長のみ）。最小構成・低コストを優先したトレードオフ。
- **ログ/監視**: Container Apps環境作成時に自動生成されたLog Analyticsワークスペースにアプリログが送信されます。確認方法:
  ```bash
  az containerapp logs show --name contact-form-sample --resource-group <リソースグループ> --tail 50
  ```
  もしくはAzure Portalの対象Container Appの「ログストリーム」「ログ」から確認できます。
- **アラート通知**（エラー率上昇時のメール通知など）は今回は未設定です。必要になれば別途検討してください。
