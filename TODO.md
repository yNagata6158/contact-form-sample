# TODO

`contact-form-sample` 開発のタスクリスト。Azure完結構成（Azure Container Apps + Azure Database for PostgreSQL）を前提とする。
チェック済みは完了済みタスク。以後の作業依頼はこのリストの項目単位で行う。

※ 当初はApp Serviceを想定していたが、Phase 1でクォータ制限に阻まれ Container Apps に変更した。詳細は下記Phase 1および `README.md` を参照。

## Phase 0: プロジェクト基盤 (完了)

- [x] プロジェクト作成 (静的フロント + Express API)
- [x] フロントエンド実装 (お問い合わせフォーム: `public/`)
- [x] バックエンドAPI実装 (`POST /api/contact`, `GET /api/contact`, `GET /api/health`)
- [x] DB接続層実装 (`pg`, Azure Postgres向けSSL設定)
- [x] ローカル動作確認 (静的配信・ヘルスチェック)
- [x] GitHubリポジトリ作成・プッシュ
- [x] TODOリスト作成

## Phase 0.5: 機能要件定義 (完了)

決定事項:

- [x] フォーム項目: 名前・メールアドレス・本文 + **問い合わせ種別 (プルダウン)**
      選択肢: 「一般的なお問い合わせ」「製品・サービスについて」「お見積もり・体験のご相談」「その他」
- [x] 管理者通知: **不要** (DB保存のみ)
- [x] 送信後のUX: インラインメッセージではなく、**専用のサンクスページ**へ遷移し「お問い合わせありがとうございました。」を表示
- [x] 問い合わせ一覧: **簡易な一覧画面**が必要 (認証なし/簡易、小規模内部向けの想定)
- [x] スパム対策 (reCAPTCHA等): 今回は**保留**。Phase 5に将来対応として残す

## Phase 0.6: 機能要件の実装 (完了・コードのみ)

- [x] フォームに「問い合わせ種別」プルダウンを追加 (`public/index.html`, `public/script.js`)
- [x] APIのバリデーション/保存処理にcategoryを追加 (`server/routes/contact.js`)
- [x] DBスキーマ設計・DDL作成: `contacts`テーブルに`category`カラムを追加 (`server/db/init.sql`)
      ※ **実際のPostgreSQLに対しては未実行・未検証**。DDLの妥当性はコードレビューレベルの確認のみ。
- [x] 送信後のサンクスページを実装 (`thanks.html` への画面遷移)
- [x] 簡易な一覧画面を実装 (`list.html` / `GET /api/contact`)

現時点で確認できているのは以下のみ:
- 各画面 (index/thanks/list.html) が静的配信されること
- サーバー側バリデーション (category未選択・不正値で400になること)
- DB未接続時に `GET /api/contact` がクラッシュせず500を返すこと

DDL適用・INSERT/SELECTの実データ確認は Phase 2 で行う。

## Phase 1: Azureリソース準備 (完了)

- [x] Azure Database for PostgreSQL Flexible Server を作成
- [x] ファイアウォール/ネットワーク設定 (Azureサービス許可 + 開発機のIP許可)
- [x] ~~Azure App Service を作成~~ → **Azure Container Apps に変更**して作成 (下記参照)
- [x] Container Appの環境変数設定 (`DATABASE_URL` をsecretとして設定)

### 方針転換: App Service → Azure Container Apps

サブスクリプション `Pay-As-You-Go` で、japaneast・eastus双方、かつ別サブスクリプション(`Azure サブスクリプション 1`)でも
Linux App Service Plan (B1/F1共に) 作成時に `Operation cannot be completed without additional quota` エラー。
アカウント全体でApp Service向けVMクォータが0の状態で、ポータルでのクォータ増設申請が必要だった
（`Quotas`ブレードにApp Serviceが出てこず、サポートリクエスト経由が必要で手間がかかる）。

Azureポータル操作なしで進められる代替として **Azure Container Apps (Consumption/サーバーレスプラン)** に変更。
このクォータ制限を受けず、CLIから即座に作成できた。コード側の変更は `Dockerfile` の追加のみ。
経緯の詳細は `README.md` の「なぜApp ServiceではなくContainer Appsなのか」を参照。

### 作成済みリソース (参照用)

| リソース | 名前 | 備考 |
|---|---|---|
| リソースグループ | `rg-contact-form-sample` | japaneast |
| サブスクリプション | `Pay-As-You-Go` (`0d378385-895f-4f37-a9da-e7aaf101d980`) | |
| PostgreSQL Flexible Server | `contact-form-sample-ngkft` | `contact-form-sample-ngkft.postgres.database.azure.com` |
| DB名 | `contact_form_sample` | |
| DB管理者ユーザー | `pgadmin` | パスワードは `.azure-pg-admin-password.txt` (gitignore対象・リポジトリには含まれない) |
| ファイアウォール | `AllowAllAzureServicesAndResourcesWithinAzureIps_*`, `AllowDevMachine` (開発機IP) | |
| Container Apps環境 | `env-contact-form-sample` | Consumptionワークロードプロファイル |
| Container Registry | `acrcontactformsamplengkft` | 管理者ユーザー無効、Container Appsはシステム割り当てマネージドIDでPull |
| Container App | `contact-form-sample` | https://contact-form-sample.proudwave-93429adb.japaneast.azurecontainerapps.io/ |

## Phase 2: DB接続・マイグレーション確認 (完了)

- [x] ローカルからAzure Postgresへの接続確認 (開発機IPのファイアウォール許可済み)
- [x] `npm run db:migrate` 実行し、`contacts`テーブルと`category`カラムが設計通り作成されることを確認
      ※ `migrate.js`が`.env`を読み込んでいなかったバグを修正 (dotenv.config()追加)
- [x] `POST /api/contact` で実際にINSERTされ、`category`を含めて正しく保存されることを確認 (デプロイ済みContainer App経由)
- [x] `GET /api/contact` で保存データが正しく取得できることを確認 (`categories`ラベルの対応含む)
- [x] `list.html` が実データを表示できること — API応答は確認済み。ブラウザでの目視確認は未実施
- [x] フォーム送信のE2E動作確認 — API層 (POST 201 → GET反映) は確認済み。`script.js`のサンクスページ遷移はコードレビューで確認、実ブラウザでの操作確認は未実施

検証時、Bash(Git Bash)経由のcurlで日本語を送ると文字化けする事象を確認したが、PowerShellから明示的にUTF-8で送信すると正しく保存・取得できることを確認 (アプリ側の問題ではなく検証コマンドの問題)。検証用テストデータ(id:1,2)は削除済み。

## Phase 3: Azureへのデプロイ (完了)

Container Appsは作成時にイメージを指定する方式のため、Phase 1のリソース作成と同時に初回デプロイも完了している。

- [x] Container Appsへ`Dockerfile`のイメージをビルド・デプロイ (`az acr build` → `az containerapp create`)
- [x] デプロイ後の疎通確認 (`/`, `/api/health` が200を返すことを確認)
- [x] フォーム送信のE2E疎通確認 (`POST/GET /api/contact` が201/200で動作することを確認、Phase 2参照)
- [x] HTTPS確認 — `*.azurecontainerapps.io` は既定でHTTPS (追加設定不要)
- [ ] カスタムドメイン確認 — 今回は未要望のため未実施 (必要になれば別途)

以後のイメージ更新は `az acr build` → `az containerapp update --image ...` で行う (`README.md` 参照)。

## Phase 4: CI/CD

- [ ] GitHub Actionsワークフロー作成 (main pushで `az acr build` → `az containerapp update` を自動実行)
- [ ] デプロイ用シークレット設定 (Azureサービスプリンシパル等をGitHub Secretsに登録)

## Phase 5: 品質・セキュリティ強化

- [ ] レート制限・スパム対策の検討 (reCAPTCHA等)
- [ ] `qs`/Expressの脆弱性フォロー (upstream修正待ち、定期的に `npm audit` 確認)
- [ ] エラーハンドリング/ロギングの改善
- [ ] 自動テスト追加 (APIの単体・結合テスト)

## Phase 6: 運用

- [ ] バックアップ/監視設定
