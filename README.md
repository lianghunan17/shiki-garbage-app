# 志木市ゴミ収集日程・粗大ごみ料金検索アプリ

埼玉県志木市のゴミ収集スケジュールと粗大ごみ処理手数料を確認できるWebアプリケーションです。

## 🌟 主な機能

### 📅 ゴミ収集日程表
- 志木市の各地域別ゴミ収集スケジュール表示
- 年月選択による期間指定
- 燃やせるゴミ、燃やせないゴミ、資源ゴミの収集日確認

### 🔍 粗大ごみ料金検索
- 品目名による検索機能
- カテゴリー別絞り込み
- 処理手数料の即座表示
- 志木市公式データに基づく正確な料金情報

### 📱 Google Calendar連携（オプション）
- MCPサーバーを使用したGoogle Calendar API連携
- ゴミ収集日の自動カレンダー登録

## 🚀 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **UIライブラリ**: Material-UI (MUI)
- **ルーティング**: React Router
- **バックエンド**: Node.js + MCP (Model Context Protocol)
- **API連携**: Google Calendar API

## 📦 セットアップ

### 前提条件
- Node.js 16.x 以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd 第4回勉強会
```

2. 依存関係をインストール
```bash
npm install
```

3. MCPサーバーの依存関係をインストール
```bash
cd mcp-servers
npm install
cd ..
```

### 基本的な使用方法

1. フロントエンドサーバーを起動
```bash
npm start
```

2. ブラウザで http://localhost:3000 にアクセス

## 🔧 Google Calendar連携の設定（オプション）

Google Calendar機能を使用する場合は、以下の設定が必要です：

### 1. Google Cloud Platformでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Calendar APIを有効化
3. サービスアカウントを作成し、JSONキーファイルをダウンロード

### 2. 認証ファイルの配置

```bash
# サービスアカウントキーファイルを配置
credentials/google-calendar-service-account.json

# OAuth認証用トークンファイル（初回認証後に自動生成）
credentials/tokens.json
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な設定を記入してください。

### 4. MCPサーバーの起動

```bash
cd mcp-servers
node google-calendar-mcp-real.js
```

詳細な設定手順は `GOOGLE_CALENDAR_SETUP.md` を参照してください。

## 📁 プロジェクト構造

```
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── ShikiGarbageApp.tsx
│   │   ├── BulkyWasteFeeSearch.tsx
│   │   └── ...
│   ├── data/               # データファイル
│   │   ├── shikiGarbageData.ts
│   │   └── bulkyWasteData.ts
│   └── services/           # APIサービス
├── mcp-servers/            # MCPサーバー実装
├── credentials/            # 認証ファイル（Git管理外）
└── public/                 # 静的ファイル
```

## 🎯 使用方法

### ゴミ収集日程の確認
1. 地域を選択
2. 年月を指定
3. カレンダーでゴミ収集日を確認

### 粗大ごみ料金の検索
1. 品目名を入力（例：「冷蔵庫」「ソファー」）
2. 必要に応じてカテゴリーで絞り込み
3. 検索ボタンをクリック
4. 処理手数料を確認

## 📝 データソース

- **ゴミ収集日程**: 志木市公式サイトの情報に基づく
- **粗大ごみ料金**: 志木市粗大ごみ処理手数料表に基づく

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 お問い合わせ

- 志木市粗大ごみ等受付センター: 048-473-5311
- 志木市公式サイト: https://www.city.shiki.lg.jp/

## 🔗 関連リンク

- [志木市公式サイト](https://www.city.shiki.lg.jp/)
- [志木市粗大ごみ申し込みページ](https://www.city.shiki.lg.jp/soshiki/16/1215.html)
- [Google Calendar API ドキュメント](https://developers.google.com/calendar)
- [MCP (Model Context Protocol)](https://github.com/modelcontextprotocol)

---

**注意**: このアプリケーションは非公式のツールです。最新の情報は必ず志木市公式サイトでご確認ください。