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

## Phase 0.6: 機能要件の実装 (完了)

- [x] フォームに「問い合わせ種別」プルダウンを追加 (フロント/API/DBスキーマ)
- [x] 送信後のサンクスページを実装 (`thanks.html` への画面遷移)
- [x] 簡易な一覧画面を実装 (`list.html` / `GET /api/contact`)

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

- [ ] バックアップ/監視設定
