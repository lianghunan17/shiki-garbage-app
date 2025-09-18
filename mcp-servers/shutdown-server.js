const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8091;

// CORS設定
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// シャットダウンエンドポイント
app.post('/shutdown', (req, res) => {
  console.log('🛑 シャットダウン要求を受信しました...');
  
  res.json({ 
    success: true, 
    message: 'サーバーをシャットダウンしています...' 
  });
  
  // レスポンスを送信後、少し待ってからプロセスを終了
  setTimeout(() => {
    console.log('🔴 全てのサーバーを終了します');
    process.exit(0);
  }, 1000);
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🔧 シャットダウンサーバーがポート ${PORT} で起動しました`);
  console.log(`   シャットダウンURL: http://localhost:${PORT}/shutdown`);
});

// プロセス終了時の処理
process.on('SIGINT', () => {
  console.log('\n🛑 シャットダウンサーバーを終了します...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 シャットダウンサーバーを終了します...');
  process.exit(0);
});