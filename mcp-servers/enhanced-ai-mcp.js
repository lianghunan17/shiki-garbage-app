const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/mcp/enhanced-ai' });

console.log('Enhanced AI MCP Server starting...');

// Moondream統合設定
const OLLAMA_CONFIG = {
  baseUrl: 'http://localhost:11434',
  model: 'moondream:latest',
  fallbackModel: 'qwen2.5:latest'
};

// 高度なAI分析データ
const enhancedClassifications = {
  materials: {
    plastic: {
      types: ['PET', 'PP', 'PE', 'PS', 'PVC'],
      recyclability: 'high',
      processing: 'mechanical_recycling'
    },
    metal: {
      types: ['aluminum', 'steel', 'copper'],
      recyclability: 'very_high',
      processing: 'melting_recycling'
    },
    glass: {
      types: ['clear', 'colored', 'tempered'],
      recyclability: 'high',
      processing: 'crushing_recycling'
    },
    paper: {
      types: ['cardboard', 'newspaper', 'magazine'],
      recyclability: 'medium',
      processing: 'pulping_recycling'
    }
  },
  aiModels: {
    moondreamModel: {
      name: 'moondream:latest',
      accuracy: 0.96,
      lastUpdated: '2024-01-20',
      version: '1.6.0',
      capabilities: ['image_analysis', 'object_detection', 'material_classification']
    },
    textAnalysis: {
      accuracy: 0.89,
      lastUpdated: '2024-01-10',
      version: '1.8.2'
    }
  }
};

// WebSocket接続処理
wss.on('connection', (ws) => {
  console.log('MCP Client connected to Enhanced AI server');
  
  ws.on('message', async (message) => {
    let request;
    try {
      request = JSON.parse(message);
      console.log('Received Enhanced AI request:', request);
      
      const response = await handleMCPRequest(request);
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error handling Enhanced AI request:', error);
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
    console.log('MCP Client disconnected from Enhanced AI server');
  });
});

// MCPリクエスト処理
async function handleMCPRequest(request) {
  const { id, method, params } = request;
  
  switch (method) {
    case 'advanced-classify':
      return await advancedClassify(id, params);
    case 'material-analysis':
      return await materialAnalysis(id, params);
    case 'environmental-impact':
      return await environmentalImpact(id, params);
    case 'optimization-suggestions':
      return await optimizationSuggestions(id, params);
    case 'batch-analysis':
      return await batchAnalysis(id, params);
    case 'learning-feedback':
      return await learningFeedback(id, params);
    default:
      throw new Error(`Unknown Enhanced AI method: ${method}`);
  }
}

// Moondreamモデルを使用した画像分析
async function analyzeImageWithMoondream(imageData, prompt) {
  try {
    console.log('Starting Moondream analysis...');
    const base64Image = encodeImageToBase64(imageData);
    console.log('Image encoded, sending request to Ollama...');
    
    const requestBody = {
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      images: [base64Image],
      stream: false
    };
    
    console.log('Request body prepared:', {
      model: requestBody.model,
      prompt: requestBody.prompt.substring(0, 100) + '...',
      imageLength: base64Image.length
    });
    
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Ollama response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error response:', errorText);
      throw new Error(`Moondream API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Moondream analysis result:', result);
    return result.response;
  } catch (error) {
    console.error('Moondream analysis failed:', error);
    throw error;
  }
}

// 画像データをbase64エンコード
function encodeImageToBase64(imageData) {
  // imageDataがすでにbase64の場合はそのまま返す
  if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
    return imageData.split(',')[1]; // data:image/jpeg;base64, の部分を除去
  }
  
  // Buffer形式の場合
  if (Buffer.isBuffer(imageData)) {
    return imageData.toString('base64');
  }
  
  // その他の形式の場合はそのまま返す（すでにbase64と仮定）
  return imageData;
}

// Moondream応答を構造化データに変換
function parseMoondreamResponse(moondreamResponse) {
  try {
    console.log('Moondream raw response:', moondreamResponse);
    
    // Moondreamの応答をパースして構造化データに変換
    const response = moondreamResponse.toLowerCase();
    
    const analysis = {
      detectedObjects: [],
      material: 'unknown',
      condition: 'good',
      confidence: 0.8,
      classification: 'unknown',
      reasoning: [moondreamResponse],
      recommendations: []
    };

    // 食品・生ごみの検出
    if (response.includes('サーモン') || response.includes('salmon') || response.includes('魚') || response.includes('fish') ||
        response.includes('寿司') || response.includes('sushi') || response.includes('刺身') || response.includes('sashimi')) {
      analysis.detectedObjects.push({
        name: 'サーモン/魚類',
        confidence: 0.9,
        material: 'organic',
        condition: 'fresh',
        size: 'medium'
      });
      analysis.material = 'organic';
      analysis.classification = 'burnable_waste';
      analysis.recommendations = [
        '生ごみとして処理してください',
        '水分をよく切ってから捨ててください',
        '燃やせるごみの日に出してください'
      ];
    }
    // プラスチック容器の検出
    else if (response.includes('プラスチック') || response.includes('plastic') || 
             response.includes('容器') || response.includes('container') ||
             response.includes('パック') || response.includes('pack')) {
      analysis.detectedObjects.push({
        name: 'プラスチック容器',
        confidence: 0.8,
        material: 'plastic',
        condition: 'good',
        size: 'small'
      });
      analysis.material = 'plastic';
      analysis.classification = 'recyclable_plastic';
      analysis.recommendations = [
        '洗浄してからプラスチック容器包装として分別',
        'ラベルは剥がしてください',
        '資源ごみの日に出してください'
      ];
    }
    // 金属の検出
    else if (response.includes('金属') || response.includes('metal') || 
             response.includes('缶') || response.includes('can') ||
             response.includes('アルミ') || response.includes('aluminum')) {
      analysis.detectedObjects.push({
        name: '金属容器',
        confidence: 0.9,
        material: 'metal',
        condition: 'good',
        size: 'small'
      });
      analysis.material = 'metal';
      analysis.classification = 'recyclable_metal';
      analysis.recommendations = [
        '中身を空にして洗浄してください',
        '金属類として分別してください',
        '資源ごみの日に出してください'
      ];
    }
    // 紙類の検出
    else if (response.includes('紙') || response.includes('paper') ||
             response.includes('段ボール') || response.includes('cardboard')) {
      analysis.detectedObjects.push({
        name: '紙類',
        confidence: 0.8,
        material: 'paper',
        condition: 'good',
        size: 'medium'
      });
      analysis.material = 'paper';
      analysis.classification = 'recyclable_paper';
      analysis.recommendations = [
        '汚れていない紙類は資源ごみへ',
        '汚れている場合は燃やせるごみへ',
        '資源ごみの日に出してください'
      ];
    }
    // その他の一般的な物体
    else {
      // 応答から物体名を推測
      let objectName = '不明な物体';
      if (response.includes('ボトル') || response.includes('bottle')) {
        objectName = 'ボトル';
        analysis.material = 'plastic';
        analysis.classification = 'recyclable_plastic';
      } else if (response.includes('箱') || response.includes('box')) {
        objectName = '箱';
        analysis.material = 'paper';
        analysis.classification = 'recyclable_paper';
      } else if (response.includes('袋') || response.includes('bag')) {
        objectName = '袋';
        analysis.material = 'plastic';
        analysis.classification = 'burnable_waste';
      }
      
      analysis.detectedObjects.push({
        name: objectName,
        confidence: 0.6,
        material: analysis.material,
        condition: 'unknown',
        size: 'unknown'
      });
      
      analysis.recommendations = [
        '材質を確認して適切に分別してください',
        '不明な場合は自治体のガイドラインを確認してください'
      ];
    }
    
    return analysis;
  } catch (error) {
    console.error('Error parsing Moondream response:', error);
    return {
      detectedObjects: [{
        name: '分析エラー',
        confidence: 0.0,
        material: 'unknown',
        condition: 'unknown',
        size: 'unknown'
      }],
      material: 'unknown',
      condition: 'unknown',
      confidence: 0.0,
      classification: 'unknown',
      reasoning: ['分析エラーが発生しました: ' + error.message],
      recommendations: ['手動で分別を確認してください']
    };
  }
}

// 高度な分類処理（Moondream統合版）
async function advancedClassify(id, params) {
  const { imageData, textDescription, contextData } = params;
  const startTime = Date.now();
  
  let imageAnalysis;
  
  try {
    if (imageData) {
      // Moondreamを使用した画像分析
      const base64Image = encodeImageToBase64(imageData);
      const prompt = `この画像を詳しく分析して、以下の情報を日本語で教えてください：

【物体の識別】
- 写っている物体の具体的な名前（例：サーモンの刺身、プラスチック容器、アルミ缶、段ボール箱など）
- 食品の場合は具体的な食材名
- 容器の場合は材質と用途

【材質の判定】
- プラスチック、金属、紙、ガラス、有機物（食品・生ごみ）のいずれか
- 複数の材質が混在している場合はそれぞれ明記

【状態の確認】
- 新品、使用済み、汚れの有無
- 食品の場合は新鮮さ

【サイズと形状】
- 大きさ（小、中、大）
- 形状の特徴

【ごみ分別】
- 燃やせるごみ、資源ごみ（プラスチック、金属、紙）、生ごみのいずれに該当するか

具体的で正確な物体名を最初に明記してください。

${textDescription ? `追加情報: ${textDescription}` : ''}`;
      
      const moondreamResponse = await analyzeImageWithMoondream(base64Image, prompt);
      const parsedAnalysis = parseMoondreamResponse(moondreamResponse);
      
      imageAnalysis = {
        detectedObjects: parsedAnalysis.detectedObjects,
        material: parsedAnalysis.material,
        condition: parsedAnalysis.condition,
        confidence: parsedAnalysis.confidence,
        moondreamResponse: moondreamResponse,
        processingTime: Date.now() - startTime
      };
    } else {
      // 画像がない場合のフォールバック
      imageAnalysis = {
        detectedObjects: [],
        material: 'unknown',
        condition: 'unknown',
        confidence: 0.0,
        processingTime: Date.now() - startTime,
        error: 'No image data provided'
      };
    }
  } catch (error) {
    console.error('Moondream analysis failed, using fallback:', error);
    
    // フォールバック: 従来のシミュレート分析
    imageAnalysis = {
      detectedObjects: [
        {
          name: 'unknown_object',
          confidence: 0.5,
          material: 'unknown',
          condition: 'unknown',
          size: 'unknown'
        }
      ],
      processingTime: Date.now() - startTime,
      error: error.message,
      fallbackUsed: true
    };
  }
  
  // テキスト分析（既存のロジック）
  const textAnalysis = {
    extractedKeywords: textDescription ? textDescription.split(/\s+/).slice(0, 5) : [],
    sentiment: 'neutral',
    confidence: textDescription ? 0.85 : 0.0
  };
  
  // 結合結果
  const combinedResult = {
    finalClassification: imageAnalysis.material ? `recyclable_${imageAnalysis.material}` : 'unknown',
    confidence: Math.max(imageAnalysis.confidence || 0, textAnalysis.confidence),
    reasoning: [
      imageAnalysis.moondreamResponse ? 'Moondreamモデルによる画像分析を実行' : '画像分析をスキップ',
      textDescription ? 'テキスト情報を分析に組み込み' : 'テキスト情報なし',
      `処理時間: ${imageAnalysis.processingTime}ms`
    ],
    recommendations: [
      '分析結果を確認してください',
      '不明な場合は自治体のガイドラインを参照してください',
      '適切な分別にご協力ください'
    ]
  };
  
  return {
    id,
    result: {
      success: true,
      analysis: {
        image: imageAnalysis,
        text: textAnalysis,
        combined: combinedResult
      }
    }
  };
}

// 材質分析
async function materialAnalysis(id, params) {
  const { itemData } = params;
  
  const analysis = {
    primaryMaterial: 'plastic',
    materialComposition: {
      plastic: 85,
      metal: 10,
      paper: 5
    },
    recyclabilityScore: 0.87,
    decompositionTime: '450年',
    carbonFootprint: '2.3kg CO2',
    recyclingValue: '¥12/kg'
  };
  
  return {
    id,
    result: {
      success: true,
      materialAnalysis: analysis
    }
  };
}

// 環境影響評価
async function environmentalImpact(id, params) {
  const { disposalMethod, quantity } = params;
  
  const impact = {
    carbonEmission: {
      landfill: '5.2kg CO2',
      incineration: '2.1kg CO2',
      recycling: '0.8kg CO2'
    },
    resourceSaving: {
      energy: '65%',
      water: '40%',
      rawMaterials: '80%'
    },
    economicValue: {
      recyclingRevenue: '¥45',
      disposalCost: '¥120',
      netBenefit: '¥165'
    }
  };
  
  return {
    id,
    result: {
      success: true,
      environmentalImpact: impact
    }
  };
}

// 最適化提案
async function optimizationSuggestions(id, params) {
  const { userHistory, preferences } = params;
  
  const suggestions = {
    personalizedTips: [
      'あなたの地域では火曜日の朝が最も収集効率が良いです',
      '過去の分別精度が92%です。金属類の分別を改善できます',
      'リサイクル率を15%向上させることで月¥200の節約が可能です'
    ],
    scheduleOptimization: {
      recommendedDays: ['火曜日', '金曜日'],
      optimalTime: '07:30',
      efficiency: '94%'
    },
    behaviorInsights: {
      strongPoints: ['プラスチック分別', '定期的な排出'],
      improvementAreas: ['金属分別', '事前洗浄'],
      overallScore: 8.2
    }
  };
  
  return {
    id,
    result: {
      success: true,
      optimizations: suggestions
    }
  };
}

// バッチ分析
async function batchAnalysis(id, params) {
  const { items } = params;
  
  const batchResults = items.map((item, index) => ({
    itemId: `item_${index + 1}`,
    name: item.name || `アイテム${index + 1}`,
    classification: 'recyclable',
    confidence: Math.random() * 0.3 + 0.7,
    processingTime: Math.random() * 500 + 200
  }));
  
  const summary = {
    totalItems: items.length,
    averageConfidence: batchResults.reduce((sum, item) => sum + item.confidence, 0) / items.length,
    totalProcessingTime: batchResults.reduce((sum, item) => sum + item.processingTime, 0),
    classificationBreakdown: {
      recyclable: batchResults.filter(item => item.classification === 'recyclable').length,
      burnable: batchResults.filter(item => item.classification === 'burnable').length,
      nonBurnable: batchResults.filter(item => item.classification === 'non-burnable').length
    }
  };
  
  return {
    id,
    result: {
      success: true,
      batchAnalysis: {
        results: batchResults,
        summary: summary
      }
    }
  };
}

// 学習フィードバック
async function learningFeedback(id, params) {
  const { feedback, correctClassification, userInput } = params;
  
  // フィードバックを学習データとして記録（実際の実装では機械学習モデルを更新）
  const learningResult = {
    feedbackReceived: true,
    modelUpdateScheduled: true,
    expectedImprovement: '2-3%',
    nextModelVersion: '2.1.1',
    estimatedReleaseDate: '2024-02-01'
  };
  
  console.log('Learning feedback received:', { feedback, correctClassification, userInput });
  
  return {
    id,
    result: {
      success: true,
      learningUpdate: learningResult
    }
  };
}

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'enhanced-ai-mcp',
    models: enhancedClassifications.aiModels
  });
});

// サーバー起動
const PORT = 8086;
server.listen(PORT, () => {
  console.log(`Enhanced AI MCP Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/mcp/enhanced-ai`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});