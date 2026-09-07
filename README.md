# contact-form-sample

> このREADMEは、このプロジェクトに初めて触れる方向けの入口です。機能・API・インフラの詳細な仕様は [`docs/仕様書.md`](docs/仕様書.md) にまとめています。

お問い合わせフォームのサンプルアプリケーションです。フォームに入力された内容をデータベースに保存し、一覧で確認できます。Azureのサービスのみで動作するように構築されています。

## 🌐 実際に触ってみる

- お問い合わせフォーム: **https://contact-form-sample.proudwave-93429adb.japaneast.azurecontainerapps.io/**
- 問い合わせ一覧（社内確認用）: **https://contact-form-sample.proudwave-93429adb.japaneast.azurecontainerapps.io/list.html**

> ⚠️ 一覧画面には認証がなく、送信された個人情報がそのまま表示されます。このURLを外部に共有しないでください。

## 使われている技術

- フロントエンド: HTML / CSS / JavaScript（フレームワークなし）
- バックエンド: Node.js (Express)
- データベース: PostgreSQL（Azure Database for PostgreSQL）
- ホスティング: Azure Container Apps

## ローカルで動かす

```bash
npm install
cp .env.example .env   # DATABASE_URL を接続先のPostgresの情報に書き換える
npm run db:migrate     # テーブルを作成
npm start               # http://localhost:3000
```

```bash
npm test    # 単体テストを実行
```

環境構築の前提条件や各コマンドの詳細は [`docs/仕様書.md`](docs/仕様書.md) を参照してください。

## 現在の状態

フォームからの送信・データベースへの保存・一覧表示までは、Azure上の実環境で動作確認済みです。一方で、次の点は今後の対応事項として残っています。

| 内容 | 状況 |
|---|---|
| デプロイの自動化 (CI/CD) | 未対応。現状は手動でデプロイしている（[Issue #1](https://github.com/yNagata6158/contact-form-sample/issues/1)） |
| データベースを使った自動テスト | 未対応。入力チェックの単体テストのみ整備済み（[Issue #2](https://github.com/yNagata6158/contact-form-sample/issues/2)） |
| 障害・エラー発生時の通知 | 未対応。ログは記録されているが、能動的なアラート通知は未設定（[Issue #4](https://github.com/yNagata6158/contact-form-sample/issues/4)） |

スパム対策（フォームの不正送信対策）は対応済みです。

## ドキュメント

| ドキュメント | 内容 | 主な読み手 |
|---|---|---|
| README.md（このファイル） | プロジェクトの概要・触り方・現状 | はじめてこのプロジェクトを見る方 |
| [docs/仕様書.md](docs/仕様書.md) | 機能・API・データベース・インフラの設計仕様 | 開発者・運用者 |
| [TODO.md](TODO.md) | 開発の進め方・意思決定の記録 | 開発を引き継ぐ方 |
