# Ollama + MCP サーバー セットアップガイド

## 1. Ollamaのインストール

### 自動インストール（推奨）
1. ブラウザで https://ollama.com/download が開かれています
2. 「Download for Windows」ボタンをクリック
3. ダウンロードしたインストーラーを実行
4. インストール完了後、コマンドプロンプトまたはPowerShellを再起動

### インストール確認
```bash
ollama --version
```

## 2. 推奨モデルのダウンロード

### 高性能モデル（推奨）
```bash
# ツール呼び出し対応の高性能モデル（4.7GB）
ollama pull qwen2.5
```

### 軽量モデル（低スペックPC向け）
```bash
# 軽量で高速なモデル（1.1GB）
ollama pull deepseek-r1:1.5b
```

### バランス型モデル
```bash
# バランスの取れた中型モデル（2.0GB）
ollama pull llama3.2:3b
```

## 3. Ollamaサーバーの起動

### 手動起動
```bash
ollama serve
```

### バックグラウンド起動（Windows）
```powershell
Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
```

## 4. セットアップの自動化

### 自動セットアップスクリプトの実行
```bash
# 完全自動セットアップ
node setup-ollama.js

# 状況確認のみ
node setup-ollama.js check

# モデルダウンロードのみ
node setup-ollama.js download qwen2.5

# モデルテストのみ
node setup-ollama.js test qwen2.5
```

## 5. MCPサーバーとの連携

### MCPサーバーの起動
```bash
cd mcp-servers
npm run start:calendar
```

### Ollama MCPクライアントの実行
```bash
# メインディレクトリで実行
node ollama-mcp-client.js
```

## 6. 使用例

### 基本的な会話
```javascript
// ollama-mcp-client.js を実行後
// プロンプトが表示されたら以下のように入力

> こんにちは！今日の予定を教えて
> 明日の10時に会議の予定を追加して
> 志木市で冷蔵庫の処分費用を調べて
```

### 利用可能なツール
- **Google Calendar**: 予定の追加、確認、削除
- **志木市粗大ごみ料金検索**: 粗大ごみの処分費用検索
- **その他**: MCPサーバーで定義された各種ツール

## 7. トラブルシューティング

### Ollamaが認識されない
```bash
# パスの確認
echo $env:PATH

# Ollamaの再インストール
# https://ollama.com/download から再ダウンロード
```

### モデルダウンロードが失敗する
```bash
# ネットワーク接続確認
ping ollama.com

# 手動でモデル確認
ollama list
```

### MCPサーバーに接続できない
```bash
# MCPサーバーの状況確認
cd mcp-servers
npm run start:calendar

# ポート確認
netstat -an | findstr 3000
```

### メモリ不足エラー
```bash
# 軽量モデルに変更
ollama pull deepseek-r1:1.5b

# または
ollama pull llama3.2:1b
```

## 8. 設定ファイル

### Ollama設定（オプション）
```bash
# 環境変数で設定可能
set OLLAMA_HOST=0.0.0.0:11434
set OLLAMA_MODELS=C:\Users\%USERNAME%\.ollama\models
```

### MCP設定
```json
// mcp-servers/package.json の scripts セクション
{
  "scripts": {
    "start:calendar": "node calendar-server.js",
    "start:garbage": "node garbage-server.js"
  }
}
```

## 9. パフォーマンス最適化

### GPU使用（NVIDIA GPU搭載PC）
```bash
# CUDA対応版のインストール
# https://ollama.com/download でCUDA版を選択
```

### メモリ使用量調整
```bash
# モデル実行時のメモリ制限
ollama run qwen2.5 --memory 4GB
```

## 10. 次のステップ

1. **Ollamaインストール完了後**:
   ```bash
   node setup-ollama.js
   ```

2. **セットアップ成功後**:
   ```bash
   cd mcp-servers && npm run start:calendar
   # 新しいターミナルで
   node ollama-mcp-client.js
   ```

3. **使用開始**:
   - 自然言語でAIと対話
   - カレンダー操作や粗大ごみ料金検索が可能
   - MCPツールを活用した高度なタスク実行

---

**注意**: 初回モデルダウンロードには時間がかかります（数GB〜数十GB）。安定したネットワーク環境で実行してください。