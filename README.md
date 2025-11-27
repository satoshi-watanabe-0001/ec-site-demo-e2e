# EC Site Demo E2E Tests

EC-271: iPhoneカテゴリページE2Eテスト自動化

## 概要

このリポジトリは、EC Site Demoプロジェクトの包括的なE2Eテスト自動化を提供します。Playwrightを使用し、Page Object Modelパターンに基づいて実装されています。

## 機能

- iPhoneカテゴリページのE2Eテスト
- APIレスポンス検証テスト
- パフォーマンス測定テスト（P95 < 1.2秒）
- UI-API整合性検証
- requestIdによるリクエスト追跡
- 複数ブラウザ対応（Chromium, Firefox, WebKit）
- モバイル・タブレット対応テスト

## 前提条件

- Node.js 18以上
- Docker & Docker Compose（テスト環境構築用）
- ec-site-demo-frontend（フロントエンド）
- ec-site-demo-backend（バックエンドAPI）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
npx playwright install
```

### 2. テスト環境の起動

#### オプション A: Docker Composeで全環境を起動

```bash
docker-compose up -d
```

#### オプション B: ローカル開発（PostgreSQLのみDocker）

```bash
docker-compose -f docker-compose.local.yml up -d

# フロントエンドを起動（別ターミナル）
cd ../ec-site-demo-frontend
npm run dev

# バックエンドを起動（別ターミナル）
cd ../ec-site-demo-backend
./gradlew bootRun
```

## テストの実行

### 全テストを実行

```bash
npm test
```

### 特定のテストを実行

```bash
# iPhoneカテゴリページテスト
npm run test:iphone

# API検証テスト
npm run test:api

# パフォーマンステスト
npm run test:performance
```

### UIモードで実行

```bash
npm run test:ui
```

### ヘッドモードで実行（ブラウザ表示）

```bash
npm run test:headed
```

### デバッグモードで実行

```bash
npm run test:debug
```

## テストレポート

テスト実行後、以下のレポートが生成されます：

- HTML: `playwright-report/index.html`
- JSON: `test-results/results.json`
- JUnit: `test-results/junit.xml`

レポートを表示：

```bash
npm run report
```

## プロジェクト構造

```
ec-site-demo-e2e/
├── tests/
│   ├── pages/                    # Page Objectクラス
│   │   ├── IPhoneCategoryPage.ts # iPhoneカテゴリページ
│   │   ├── ProductCategoryPage.ts # 製品カテゴリページ
│   │   └── index.ts              # エクスポート
│   ├── fixtures/                 # テストフィクスチャ
│   ├── utils/                    # ユーティリティ関数
│   ├── iphone-category.spec.ts   # iPhoneカテゴリE2Eテスト
│   ├── api-validation.spec.ts    # API検証テスト
│   └── performance.spec.ts       # パフォーマンステスト
├── scripts/
│   └── seed-data.sql             # テストデータシード
├── docker-compose.yml            # 全環境用Docker Compose
├── docker-compose.local.yml      # ローカル開発用Docker Compose
├── playwright.config.ts          # Playwright設定
├── tsconfig.json                 # TypeScript設定
├── .eslintrc.json                # ESLint設定
└── package.json                  # プロジェクト設定
```

## テストカテゴリ

### iPhoneカテゴリページテスト (`iphone-category.spec.ts`)

- ページ表示テスト
  - ページタイトル表示
  - キャンペーンバナー表示
  - 製品数表示
  - 製品カード表示
  - ドコモオンラインショップリンク表示

- 製品情報表示テスト
  - 特定製品の表示確認
  - ストレージオプション表示
  - カラーオプション表示
  - 月額料金表示

- ソート機能テスト
  - 価格順ソート
  - 名前順ソート

- レスポンシブデザインテスト
  - モバイル表示
  - タブレット表示

### API検証テスト (`api-validation.spec.ts`)

- カテゴリ詳細API検証
  - 正常レスポンス確認
  - requestId確認
  - ページネーション動作確認
  - ソートパラメータ動作確認
  - 404エラー確認

- UI-API整合性検証
  - 製品数の一致確認
  - 製品名の表示確認

- フィルター機能API検証
  - キーワード検索
  - ストレージフィルター（未実装）
  - カラーフィルター（未実装）
  - 価格範囲フィルター（未実装）

- エラーハンドリング検証
  - 不正パラメータ検証

### パフォーマンステスト (`performance.spec.ts`)

- APIレスポンスタイム
  - P95 < 1.2秒検証
  - ページネーション付きAPI検証

- ページロードパフォーマンス
  - 初回ロード時間検証
  - ソート操作レスポンス検証

- Core Web Vitals
  - LCP（Largest Contentful Paint）検証
  - FIDシミュレーション

- ネットワークリクエスト監視
  - APIリクエスト数検証
  - レスポンスサイズ検証

- 負荷テスト
  - 同時リクエスト検証

## 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `BASE_URL` | `http://localhost:3000` | フロントエンドURL |
| `API_BASE_URL` | `http://localhost:8080` | バックエンドAPI URL |
| `CI` | `false` | CI環境フラグ |

## コード品質

### リント

```bash
npm run lint
npm run lint:fix
```

### 型チェック

```bash
npm run type-check
```

## organization-standards準拠

このプロジェクトは以下の組織標準に準拠しています：

- Page Object Modelパターン
- 明示的待機（sleepではなく要素の出現を待つ）
- テストの独立性
- 失敗時のスクリーンショット自動取得
- HTML/JSON/JUnitレポート出力
- パフォーマンス測定（P95 < 1.2秒）

## 関連リポジトリ

- [ec-site-demo-frontend](https://github.com/satoshi-watanabe-0001/ec-site-demo-frontend) - フロントエンド
- [ec-site-demo-backend](https://github.com/satoshi-watanabe-0001/ec-site-demo-backend) - バックエンドAPI

## ライセンス

MIT
