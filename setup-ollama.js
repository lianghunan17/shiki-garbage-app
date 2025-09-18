const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ollamaのセットアップと管理を行うクラス
class OllamaSetup {
  constructor() {
    this.recommendedModels = [
      {
        name: 'qwen2.5:latest',
        description: 'ツール呼び出し対応の高性能モデル（推奨）',
        size: '4.7GB'
      },
      {
        name: 'moondream:latest',
        description: '軽量な画像解析モデル（1.6B、低リソース向け）',
        size: '1.7GB'
      },
      {
        name: 'llava:7b',
        description: '画像解析対応のマルチモーダルモデル（標準版）',
        size: '4.5GB'
      },
      {
        name: 'deepseek-r1:1.5b',
        description: '軽量で高速なモデル',
        size: '1.1GB'
      },
      {
        name: 'llama3.2:3b',
        description: 'バランスの取れた中型モデル',
        size: '2.0GB'
      }
    ];
  }

  // Ollamaがインストールされているかチェック
  async checkOllamaInstalled() {
    return new Promise((resolve) => {
      exec('ollama --version', (error, stdout, stderr) => {
        if (error) {
          resolve(false);
        } else {
          console.log('Ollama バージョン:', stdout.trim());
          resolve(true);
        }
      });
    });
  }

  // Ollamaサーバーが起動しているかチェック
  async checkOllamaRunning() {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // インストール済みモデルを取得
  async getInstalledModels() {
    return new Promise((resolve, reject) => {
      exec('ollama list', (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        
        const lines = stdout.split('\n').slice(1); // ヘッダー行をスキップ
        const models = lines
          .filter(line => line.trim())
          .map(line => {
            const parts = line.split(/\s+/);
            return {
              name: parts[0],
              id: parts[1],
              size: parts[2],
              modified: parts.slice(3).join(' ')
            };
          });
        
        resolve(models);
      });
    });
  }

  // モデルをダウンロード
  async downloadModel(modelName) {
    console.log(`モデル "${modelName}" をダウンロード中...`);
    
    return new Promise((resolve, reject) => {
      const process = spawn('ollama', ['pull', modelName], {
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let output = '';
      
      process.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text); // リアルタイム表示
      });

      process.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stderr.write(text);
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`\nモデル "${modelName}" のダウンロードが完了しました！`);
          resolve(output);
        } else {
          reject(new Error(`モデルダウンロードに失敗しました。終了コード: ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Ollamaサーバーを起動
  async startOllamaServer() {
    console.log('Ollamaサーバーを起動中...');
    
    return new Promise((resolve, reject) => {
      const process = spawn('ollama', ['serve'], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // サーバーが起動するまで少し待つ
      setTimeout(async () => {
        const isRunning = await this.checkOllamaRunning();
        if (isRunning) {
          console.log('Ollamaサーバーが起動しました！');
          resolve(process);
        } else {
          reject(new Error('Ollamaサーバーの起動に失敗しました'));
        }
      }, 3000);

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  // モデルをテスト
  async testModel(modelName) {
    console.log(`モデル "${modelName}" をテスト中...`);
    
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{
            role: 'user',
            content: 'こんにちは！簡単な自己紹介をしてください。'
          }],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('テスト成功！');
      console.log('AI応答:', result.message.content);
      return true;
    } catch (error) {
      console.error('テスト失敗:', error.message);
      return false;
    }
  }

  // セットアップガイド表示
  showSetupGuide() {
    console.log('\n=== Ollama セットアップガイド ===');
    console.log('\n1. Ollamaのインストール:');
    console.log('   https://ollama.com/download からダウンロードしてインストール');
    console.log('\n2. 推奨モデル:');
    this.recommendedModels.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.name} (${model.size})`);
      console.log(`      ${model.description}`);
    });
    console.log('\n3. モデルダウンロードコマンド例:');
    console.log('   ollama pull qwen2.5');
    console.log('\n4. サーバー起動:');
    console.log('   ollama serve');
    console.log('\n5. このスクリプトを再実行してセットアップを完了してください。');
  }

  // 完全セットアップ
  async fullSetup() {
    console.log('=== Ollama 自動セットアップ開始 ===\n');

    // 1. Ollamaインストール確認
    console.log('1. Ollamaインストール状況を確認中...');
    const isInstalled = await this.checkOllamaInstalled();
    
    if (!isInstalled) {
      console.log('❌ Ollamaがインストールされていません。');
      this.showSetupGuide();
      return false;
    }
    console.log('✅ Ollamaがインストールされています。');

    // 2. サーバー起動確認
    console.log('\n2. Ollamaサーバー状況を確認中...');
    let isRunning = await this.checkOllamaRunning();
    
    if (!isRunning) {
      console.log('⚠️  Ollamaサーバーが起動していません。起動を試行中...');
      try {
        await this.startOllamaServer();
        isRunning = true;
      } catch (error) {
        console.log('❌ Ollamaサーバーの自動起動に失敗しました。');
        console.log('手動で "ollama serve" コマンドを実行してください。');
        return false;
      }
    }
    console.log('✅ Ollamaサーバーが起動しています。');

    // 3. インストール済みモデル確認
    console.log('\n3. インストール済みモデルを確認中...');
    try {
      const installedModels = await this.getInstalledModels();
      
      if (installedModels.length === 0) {
        console.log('⚠️  モデルがインストールされていません。');
        console.log('推奨モデル "qwen2.5" をダウンロードします...');
        
        try {
          await this.downloadModel('qwen2.5');
        } catch (error) {
          console.log('❌ モデルダウンロードに失敗しました:', error.message);
          return false;
        }
      } else {
        console.log('✅ 以下のモデルがインストールされています:');
        installedModels.forEach(model => {
          console.log(`   - ${model.name} (${model.size})`);
        });
      }
    } catch (error) {
      console.log('❌ モデル一覧の取得に失敗しました:', error.message);
      return false;
    }

    // 4. モデルテスト
    console.log('\n4. モデルをテスト中...');
    const testModel = 'qwen2.5:latest';
    const testSuccess = await this.testModel(testModel);
    
    if (!testSuccess) {
      console.log('❌ モデルテストに失敗しました。');
      return false;
    }

    console.log('\n🎉 Ollamaセットアップが完了しました！');
    console.log('\n次のステップ:');
    console.log('1. MCPサーバーを起動: cd mcp-servers && npm run start:calendar');
    console.log('2. Ollama MCPクライアントを実行: node ollama-mcp-client.js');
    
    return true;
  }
}

// メイン実行関数
async function main() {
  const setup = new OllamaSetup();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'check':
      console.log('Ollama状況確認中...');
      const installed = await setup.checkOllamaInstalled();
      const running = await setup.checkOllamaRunning();
      console.log('インストール済み:', installed ? '✅' : '❌');
      console.log('サーバー起動中:', running ? '✅' : '❌');
      if (installed) {
        try {
          const models = await setup.getInstalledModels();
          console.log('インストール済みモデル:', models.length);
          models.forEach(m => console.log(`  - ${m.name}`));
        } catch (error) {
          console.log('モデル一覧取得エラー:', error.message);
        }
      }
      break;
      
    case 'download':
      const modelName = args[1] || 'qwen2.5';
      await setup.downloadModel(modelName);
      break;
      
    case 'test':
      const testModelName = args[1] || 'qwen2.5:latest';
      await setup.testModel(testModelName);
      break;
      
    case 'guide':
      setup.showSetupGuide();
      break;
      
    default:
      await setup.fullSetup();
      break;
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { OllamaSetup };