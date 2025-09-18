const WebSocket = require('ws');

// モックAIサービス - 古いバージョン
class MockAIService {
  constructor() {
    this.port = 8090;
    this.server = null;
  }

  // サーバー開始
  start() {
    this.server = new WebSocket.Server({ port: this.port });
    
    this.server.on('connection', (ws) => {
      console.log('AI Service: クライアント接続');
      
      ws.on('message', async (message) => {
        try {
          const request = JSON.parse(message.toString());
          console.log('AI Service: リクエスト受信:', request.method);
          
          const response = await this.handleRequest(request);
          ws.send(JSON.stringify(response));
        } catch (error) {
          console.error('AI Service: エラー:', error);
          ws.send(JSON.stringify({
            id: 'error',
            error: { message: error.message }
          }));
        }
      });
      
      ws.on('close', () => {
        console.log('AI Service: クライアント切断');
      });
    });
    
    console.log(`Mock AI Service started on port ${this.port}`);
  }

  // リクエスト処理
  async handleRequest(request) {
    const { id, method, params } = request;
    
    switch (method) {
      case 'analyze-image':
        return await this.analyzeImage(id, params);
      case 'classify-text':
        return await this.classifyText(id, params);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  // 画像分析（モック）
  async analyzeImage(id, params) {
    const { imageData, prompt } = params;
    
    // モック応答を生成
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
    
    const mockItems = [
      { name: 'テーブル', confidence: 0.85 },
      { name: '椅子', confidence: 0.78 },
      { name: 'ソファー', confidence: 0.92 },
      { name: '冷蔵庫', confidence: 0.88 },
      { name: 'テレビ', confidence: 0.75 }
    ];
    
    const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
    
    return {
      id,
      result: {
        analysis: {
          image: {
            detectedObjects: [randomItem]
          },
          text: {
            description: `画像から${randomItem.name}を検出しました。`
          }
        },
        confidence: randomItem.confidence,
        processingTime: '1.2s'
      }
    };
  }

  // テキスト分類（モック）
  async classifyText(id, params) {
    const { text, categories } = params;
    
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5秒待機
    
    return {
      id,
      result: {
        classification: {
          category: categories[0] || 'その他',
          confidence: 0.8,
          reasoning: `テキスト「${text}」を分析しました。`
        }
      }
    };
  }

  // サーバー停止
  stop() {
    if (this.server) {
      this.server.close();
      console.log('Mock AI Service stopped');
    }
  }
}

// サーバー開始
if (require.main === module) {
  const aiService = new MockAIService();
  aiService.start();
  
  // 終了処理
  process.on('SIGINT', () => {
    console.log('\nShutting down Mock AI Service...');
    aiService.stop();
    process.exit(0);
  });
}

module.exports = MockAIService;