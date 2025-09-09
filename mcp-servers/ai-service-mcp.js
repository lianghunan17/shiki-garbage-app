const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/mcp/ai' });

console.log('AI Service MCP Server starting...');

// モックAI分類データ
const garbageClassifications = {
  '可燃ごみ': {
    type: 'burnable',
    description: '生ごみ、紙くず、プラスチック製品など',
    collectionDays: ['月曜日', '木曜日'],
    notes: '水分をよく切って出してください'
  },
  '不燃ごみ': {
    type: 'non-burnable',
    description: '金属、ガラス、陶器など',
    collectionDays: ['第2・4水曜日'],
    notes: '危険物は新聞紙で包んでください'
  },
  '資源ごみ': {
    type: 'recyclable',
    description: 'ペットボトル、缶、びんなど',
    collectionDays: ['火曜日'],
    notes: 'きれいに洗って出してください'
  },
  '粗大ごみ': {
    type: 'bulky',
    description: '家具、家電など大型のもの',
    collectionDays: ['予約制'],
    notes: '事前に粗大ごみ受付センターに連絡が必要です'
  }
};

// WebSocket接続処理
wss.on('connection', (ws) => {
  console.log('MCP Client connected to AI Service server');
  
  ws.on('message', async (message) => {
    try {
      const request = JSON.parse(message);
      console.log('Received AI request:', request);
      
      const response = await handleMCPRequest(request);
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error handling AI request:', error);
      const errorResponse = {
        id: request?.id || 'unknown',
        error: { 
          code: -1, 
          message: error.message 
        }
      };
      ws.send(JSON.stringify(errorResponse));
    }
  });
  
  ws.on('close', () => {
    console.log('MCP Client disconnected from AI Service server');
  });
});

// MCPリクエスト処理
async function handleMCPRequest(request) {
  const { id, method, params } = request;
  
  switch (method) {
    case 'classify-garbage':
      return await classifyGarbage(id, params);
    case 'analyze-image':
      return await analyzeImage(id, params);
    case 'get-classification-rules':
      return await getClassificationRules(id, params);
    case 'suggest-disposal-method':
      return await suggestDisposalMethod(id, params);
    default:
      throw new Error(`Unknown AI method: ${method}`);
  }
}

// ゴミ分類処理
async function classifyGarbage(id, params) {
  const { itemName, imageData, municipalityId } = params;
  
  // シンプルなキーワードマッチング
  let classification = null;
  const itemLower = itemName?.toLowerCase() || '';
  
  if (itemLower.includes('ペットボトル') || itemLower.includes('缶') || itemLower.includes('びん')) {
    classification = garbageClassifications['資源ごみ'];
  } else if (itemLower.includes('金属') || itemLower.includes('ガラス') || itemLower.includes('陶器')) {
    classification = garbageClassifications['不燃ごみ'];
  } else if (itemLower.includes('家具') || itemLower.includes('家電') || itemLower.includes('大型')) {
    classification = garbageClassifications['粗大ごみ'];
  } else {
    classification = garbageClassifications['可燃ごみ'];
  }
  
  // 信頼度をランダムに生成（実際のAIでは実際の分析結果）
  const confidence = Math.random() * 0.3 + 0.7; // 70-100%
  
  const result = {
    item: itemName,
    classification: classification.type,
    description: classification.description,
    collectionDays: classification.collectionDays,
    notes: classification.notes,
    confidence: confidence,
    municipalityId: municipalityId || '東京都渋谷区',
    timestamp: new Date().toISOString()
  };
  
  console.log('Classification result:', result);
  
  return {
    id,
    result: {
      success: true,
      classification: result
    }
  };
}

// 画像分析処理
async function analyzeImage(id, params) {
  const { imageData, analysisType } = params;
  
  // モック画像分析結果
  const mockAnalysis = {
    detectedItems: [
      {
        name: 'ペットボトル',
        confidence: 0.95,
        boundingBox: { x: 100, y: 50, width: 200, height: 300 }
      },
      {
        name: '食品容器',
        confidence: 0.87,
        boundingBox: { x: 350, y: 80, width: 150, height: 200 }
      }
    ],
    overallConfidence: 0.91,
    processingTime: Math.random() * 2000 + 500 // 0.5-2.5秒
  };
  
  return {
    id,
    result: {
      success: true,
      analysis: mockAnalysis
    }
  };
}

// 分類ルール取得
async function getClassificationRules(id, params) {
  const { municipalityId } = params;
  
  return {
    id,
    result: {
      success: true,
      rules: garbageClassifications,
      municipalityId: municipalityId || '東京都渋谷区'
    }
  };
}

// 処分方法提案
async function suggestDisposalMethod(id, params) {
  const { itemType, municipalityId } = params;
  
  const suggestions = {
    burnable: {
      method: '可燃ごみとして処分',
      steps: [
        '水分をよく切る',
        '指定のごみ袋に入れる',
        '収集日の朝8時までに出す'
      ],
      cost: '無料（指定袋代のみ）'
    },
    recyclable: {
      method: '資源ごみとして処分',
      steps: [
        'きれいに洗浄する',
        'ラベルを剥がす',
        '分別して指定の場所に出す'
      ],
      cost: '無料'
    },
    bulky: {
      method: '粗大ごみとして処分',
      steps: [
        '粗大ごみ受付センターに電話',
        '処理券を購入',
        '指定日に指定場所に出す'
      ],
      cost: '品目により200円〜2000円'
    }
  };
  
  const suggestion = suggestions[itemType] || suggestions.burnable;
  
  return {
    id,
    result: {
      success: true,
      suggestion: suggestion,
      municipalityId: municipalityId || '東京都渋谷区'
    }
  };
}

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'ai-service-mcp' });
});

// サーバー起動
const PORT = 8085;
server.listen(PORT, () => {
  console.log(`AI Service MCP Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/mcp/ai`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});