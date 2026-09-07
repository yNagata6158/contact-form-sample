# TODO

`contact-form-sample` 開発のタスクリスト。Azure完結構成（App Service + Azure Database for PostgreSQL）を前提とする。
チェック済みは完了済みタスク。以後の作業依頼はこのリストの項目単位で行う。

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

## Phase 1: Azureリソース準備 (一部ブロック中)

- [x] Azure Database for PostgreSQL Flexible Server を作成
- [x] ファイアウォール/ネットワーク設定 (Azureサービス許可 + 開発機のIP許可)
- [ ] Azure App Service を作成 (Node.js ランタイム) — **クォータ制限でブロック中** (下記参照)
- [ ] App Service の環境変数設定 (`DATABASE_URL` 等)

### ブロッカー: App Serviceのコンピューティングクォータ不足

サブスクリプション `Pay-As-You-Go` で、japaneast・eastus双方において Linux App Service Plan (B1/F1共に) 作成時に
`Operation cannot be completed without additional quota` エラー。サブスクリプション全体でVMクォータが0の状態。

対応: Azureポータルの「Quotas」ブレードからApp Service (japaneast, Linux) のクォータ増設を申請中。
承認後、`plan-contact-form-sample` (Linux, B1) と Web App の作成を再開する。

### 作成済みリソース (参照用)

| リソース | 名前 | 備考 |
|---|---|---|
| リソースグループ | `rg-contact-form-sample` | japaneast |
| サブスクリプション | `Pay-As-You-Go` (`0d378385-895f-4f37-a9da-e7aaf101d980`) | |
| PostgreSQL Flexible Server | `contact-form-sample-ngkft` | `contact-form-sample-ngkft.postgres.database.azure.com` |
| DB名 | `contact_form_sample` | |
| DB管理者ユーザー | `pgadmin` | パスワードは `.azure-pg-admin-password.txt` (gitignore対象・リポジトリには含まれない) |
| ファイアウォール | `AllowAllAzureServicesAndResourcesWithinAzureIps_*`, `AllowDevMachine` (開発機IP) | |

## Phase 2: DB接続・マイグレーション確認

- [ ] ローカルからAzure Postgresへの接続確認
- [ ] `npm run db:migrate` 実行し、`contacts`テーブルと`category`カラムが設計通り作成されることを確認
- [ ] `POST /api/contact` で実際にINSERTされ、`category`を含めて正しく保存されることを確認
- [ ] `GET /api/contact` で保存データが正しく取得できることを確認 (`categories`ラベルの対応含む)
- [ ] `list.html` が実データを正しく一覧表示できることを確認
- [ ] フォーム送信のE2E動作確認 (ローカル → Azure DB → サンクスページ遷移)

## Phase 3: Azureへのデプロイ

- [ ] App ServiceへExpressアプリをデプロイ
- [ ] デプロイ後の疎通確認 (`/api/health`, フォーム送信)
- [ ] HTTPS/カスタムドメイン確認 (必要な場合)

## Phase 4: CI/CD

- [ ] GitHub Actionsワークフロー作成 (main pushで自動デプロイ)
- [ ] デプロイ用シークレット設定 (Azure発行プロファイル等)

## Phase 5: 品質・セキュリティ強化

- [ ] レート制限・スパム対策の検討 (reCAPTCHA等)
- [ ] `qs`/Expressの脆弱性フォロー (upstream修正待ち、定期的に `npm audit` 確認)
- [ ] エラーハンドリング/ロギングの改善
- [ ] 自動テスト追加 (APIの単体・結合テスト)

## Phase 6: 運用

- [ ] バックアップ/監視設定
