const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// テスト用の画像データ（小さなPNG画像のbase64）
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testMoondreamIntegration() {
  console.log('=== Moondream統合テスト開始 ===');
  
  try {
    // 1. Ollamaサーバーの状態確認
    console.log('\n1. Ollamaサーバーの状態確認...');
    const ollamaHealthResponse = await fetch('http://localhost:11434/api/tags');
    if (ollamaHealthResponse.ok) {
      const models = await ollamaHealthResponse.json();
      console.log('✓ Ollamaサーバーが起動中');
      const moondreamModel = models.models.find(m => m.name.includes('moondream'));
      if (moondreamModel) {
        console.log('✓ Moondreamモデルが利用可能:', moondreamModel.name);
      } else {
        console.log('⚠ Moondreamモデルが見つかりません');
        console.log('利用可能なモデル:', models.models.map(m => m.name));
      }
    } else {
      console.log('✗ Ollamaサーバーに接続できません');
      return;
    }

    // 2. Moondreamモデル直接テスト
    console.log('\n2. Moondreamモデル直接テスト...');
    try {
      const directResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'moondream:latest',
          prompt: 'この画像に何が写っていますか？',
          images: [testImageBase64],
          stream: false
        })
      });

      if (directResponse.ok) {
        const result = await directResponse.json();
        console.log('✓ Moondreamモデル直接テスト成功');
        console.log('応答:', result.response);
      } else {
        const errorText = await directResponse.text();
        console.log('✗ Moondreamモデル直接テスト失敗:', directResponse.status, errorText);
      }
    } catch (error) {
      console.log('✗ Moondreamモデル直接テストでエラー:', error.message);
    }

    // 3. Enhanced AI MCP経由でのテスト
    console.log('\n3. Enhanced AI MCP経由でのテスト...');
    
    const ws = new WebSocket('ws://localhost:8086/mcp/enhanced-ai');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('テストタイムアウト'));
      }, 30000);

      ws.on('open', () => {
        console.log('✓ WebSocket接続成功');
        
        // 画像分析リクエストを送信
        const request = {
          jsonrpc: '2.0',
          id: 1,
          method: 'advanced-classify',
          params: {
            imageData: testImageBase64,
            textDescription: 'テスト画像の分析',
            contextData: { source: 'test' }
          }
        };
        
        console.log('画像分析リクエスト送信中...');
        ws.send(JSON.stringify(request));
      });

      ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          console.log('\n=== MCP応答受信 ===');
          
          if (response.error) {
            console.log('✗ エラー応答:', response.error);
          } else if (response.result) {
            console.log('✓ 成功応答受信');
            console.log('分類結果:', response.result.classification);
            console.log('信頼度:', response.result.confidence);
            console.log('推論:', response.result.reasoning);
            
            if (response.result.imageAnalysis && response.result.imageAnalysis.moondreamResponse) {
              console.log('✓ Moondream分析結果:', response.result.imageAnalysis.moondreamResponse);
            } else {
              console.log('⚠ Moondream分析結果が含まれていません（フォールバック使用）');
            }
          }
          
          clearTimeout(timeout);
          ws.close();
          resolve();
        } catch (error) {
          console.log('✗ 応答解析エラー:', error.message);
          clearTimeout(timeout);
          ws.close();
          reject(error);
        }
      });

      ws.on('error', (error) => {
        console.log('✗ WebSocketエラー:', error.message);
        clearTimeout(timeout);
        reject(error);
      });

      ws.on('close', () => {
        console.log('WebSocket接続終了');
      });
    });

  } catch (error) {
    console.error('✗ テスト実行エラー:', error.message);
    throw error;
  }
}

// テスト実行
testMoondreamIntegration()
  .then(() => {
    console.log('\n=== Moondream統合テスト完了 ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== Moondream統合テスト失敗 ===');
    console.error('エラー:', error.message);
    process.exit(1);
  });