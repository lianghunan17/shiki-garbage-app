# 起動ガイド

## 便利な起動方法

### 1. 全てを一括起動（推奨）
```bash
npm run dev-all
```
このコマンドで以下が同時に起動されます：
- Ollamaサーバー（AI機能用）
- MCPサーバー（Google Calendar連携用）
- Reactアプリケーション（http://localhost:3000）

### 2. 個別起動

#### Ollamaサーバーのみ起動
```bash
ollama serve
```

#### MCPサーバーのみ起動
```bash
npm run start-mcp
```

#### Reactアプリのみ起動
```bash
npm run dev
```

## 起動後のアクセス

- **アプリケーション**: http://localhost:3000
- **Ollamaサーバー**: http://localhost:11434
- **Google Calendar MCP**: ws://localhost:8087/mcp/calendar
- **Enhanced AI MCP**: ws://localhost:8086/mcp/enhanced-ai
- **AI Service MCP**: ws://localhost:8085/mcp/ai

## 停止方法

- `Ctrl + C` で全てのサーバーを停止できます
- 個別に停止したい場合は、該当するターミナルで `Ctrl + C`

## トラブルシューティング

### ポートが使用中の場合
- 他のプロセスがポートを使用している可能性があります
- ターミナルを再起動してから再度実行してください

### Ollamaサーバーエラー
- Ollamaがインストールされていることを確認: `ollama --version`
- モデルがダウンロードされていることを確認: `ollama list`
- 推奨モデルのダウンロード: `ollama pull qwen2.5`

### Google Calendar連携エラー
- MCPサーバーが起動していることを確認してください
- `npm run start-mcp` でMCPサーバーを先に起動してください

### AI機能が動作しない場合
- Ollamaサーバーが起動していることを確認してください
- `ollama serve` でOllamaサーバーを先に起動してください