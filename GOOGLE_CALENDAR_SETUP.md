# Google Calendar MCP サーバー認証設定手順

## 概要
このドキュメントでは、Google Calendar MCP サーバーを実際のGoogle Calendar APIと連携させるための認証設定手順を説明します。

## 前提条件
- Googleアカウントを持っていること
- Google Cloud Platformのアカウントを持っていること（無料枠で十分）

## 手順

### 1. Google Cloud Platformでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
3. プロジェクト名を設定（例：「garbage-calendar-mcp」）

### 2. Google Calendar APIを有効化

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」に移動
2. 「Google Calendar API」を検索
3. 「Google Calendar API」を選択し、「有効にする」をクリック

### 3. 認証情報を作成

#### サービスアカウント方式（推奨）

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「サービスアカウント」を選択
3. サービスアカウント情報を入力：
   - サービスアカウント名：`calendar-mcp-service`
   - サービスアカウントID：`calendar-mcp-service`
   - 説明：`MCP Calendar Service Account`
4. 「作成して続行」をクリック
5. ロールを選択（オプション）：
   - 「基本」→「編集者」を選択（開発環境用）
6. 「完了」をクリック

#### サービスアカウントキーを生成

1. 作成したサービスアカウントをクリック
2. 「キー」タブに移動
3. 「鍵を追加」→「新しい鍵を作成」をクリック
4. 「JSON」を選択し、「作成」をクリック
5. ダウンロードされたJSONファイルを安全な場所に保存

### 4. 環境設定

#### 認証情報ファイルの配置

1. ダウンロードしたJSONファイルを `mcp-servers/credentials/` フォルダに配置
2. ファイル名を `google-calendar-credentials.json` に変更

```bash
mkdir mcp-servers/credentials
cp /path/to/downloaded-file.json mcp-servers/credentials/google-calendar-credentials.json
```

#### 環境変数の設定

`.env` ファイルに以下を追加：

```env
# Google Calendar API設定
GOOGLE_APPLICATION_CREDENTIALS=./mcp-servers/credentials/google-calendar-credentials.json
GOOGLE_CALENDAR_ID=primary
```

### 5. 必要なパッケージのインストール

```bash
cd mcp-servers
npm install googleapis
```

### 6. MCPサーバーの更新

`google-calendar-mcp.js` を以下のように更新する必要があります：

```javascript
const { google } = require('googleapis');
const path = require('path');

// Google Calendar API認証設定
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials', 'google-calendar-credentials.json'),
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth });
```

### 7. カレンダーの共有設定

#### 個人カレンダーを使用する場合

1. Google Calendarにアクセス
2. 使用したいカレンダーの設定を開く
3. 「特定のユーザーと共有」でサービスアカウントのメールアドレスを追加
4. 権限を「予定の変更権限」に設定

#### 新しいカレンダーを作成する場合

1. Google Calendarで新しいカレンダーを作成
2. カレンダーIDをコピー（設定画面で確認可能）
3. `.env` ファイルの `GOOGLE_CALENDAR_ID` を更新

### 8. テスト実行

1. MCPサーバーを再起動
```bash
cd mcp-servers
npm start
```

2. アプリケーションでカレンダーテスト機能を実行
3. 実際のGoogle Calendarにイベントが作成されることを確認

## セキュリティ注意事項

- `google-calendar-credentials.json` ファイルは絶対にGitにコミットしないでください
- `.gitignore` に `mcp-servers/credentials/` を追加してください
- 本番環境では環境変数やシークレット管理サービスを使用してください

## トラブルシューティング

### よくあるエラー

1. **「403 Forbidden」エラー**
   - API が有効になっているか確認
   - サービスアカウントにカレンダーへのアクセス権限があるか確認

2. **「401 Unauthorized」エラー**
   - 認証情報ファイルのパスが正しいか確認
   - 環境変数が正しく設定されているか確認

3. **「Calendar not found」エラー**
   - カレンダーIDが正しいか確認
   - カレンダーがサービスアカウントと共有されているか確認

### ログの確認

MCPサーバーのログを確認して、詳細なエラー情報を取得してください：

```bash
cd mcp-servers
npm start
```

## 参考リンク

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google Cloud Authentication](https://cloud.google.com/docs/authentication)
- [googleapis Node.js Client](https://github.com/googleapis/google-api-nodejs-client)