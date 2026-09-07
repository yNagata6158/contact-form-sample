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

## Phase 1: Azureリソース準備

- [ ] Azure Database for PostgreSQL Flexible Server を作成
- [ ] ファイアウォール/ネットワーク設定 (開発機のIP許可など)
- [ ] Azure App Service を作成 (Node.js ランタイム)
- [ ] App Service の環境変数設定 (`DATABASE_URL` 等)

## Phase 2: DB接続・マイグレーション確認

- [ ] ローカルからAzure Postgresへの接続確認
- [ ] `npm run db:migrate` 実行してテーブル作成を確認
- [ ] フォーム送信のE2E動作確認 (ローカル → Azure DB)

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

- [ ] 問い合わせ一覧の閲覧手段の検討 (管理画面 or 別途DB確認)
- [ ] バックアップ/監視設定
