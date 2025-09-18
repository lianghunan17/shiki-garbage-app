const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Ollama APIクライアント
class OllamaClient {
  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async chat(model, messages, tools = []) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async listModels() {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    return await response.json();
  }
}

// MCPクライアント
class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.tools = [];
    this.requestId = 0;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);
      
      this.ws.on('open', async () => {
        console.log('MCPサーバーに接続しました');
        await this.initialize();
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket接続エラー:', error);
        reject(error);
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('メッセージ解析エラー:', error);
        }
      });
    });
  }

  async initialize() {
    // MCPサーバーの初期化
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'ollama-mcp-client',
        version: '1.0.0'
      }
    });

    // 利用可能なツールを取得
    const toolsResponse = await this.sendRequest('tools/list', {});
    this.tools = toolsResponse.tools || [];
    console.log('利用可能なツール:', this.tools.map(t => t.name));
  }

  async sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const message = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      const timeout = setTimeout(() => {
        reject(new Error('リクエストタイムアウト'));
      }, 10000);

      const handler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === id) {
            clearTimeout(timeout);
            this.ws.off('message', handler);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          // メッセージが対象外の場合は無視
        }
      };

      this.ws.on('message', handler);
      this.ws.send(JSON.stringify(message));
    });
  }

  async callTool(name, arguments_) {
    return await this.sendRequest('tools/call', {
      name,
      arguments: arguments_
    });
  }

  handleMessage(message) {
    // 通知やその他のメッセージを処理
    if (message.method) {
      console.log('通知受信:', message.method, message.params);
    }
  }

  getToolsForOllama() {
    return this.tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
      }
    }));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// メインのエージェントクラス
class OllamaMCPAgent {
  constructor(model = 'qwen2.5:latest') {
    this.model = model;
    this.ollama = new OllamaClient();
    this.mcpClients = [];
    this.conversationHistory = [];
  }

  async addMCPServer(serverUrl) {
    const client = new MCPClient(serverUrl);
    await client.connect();
    this.mcpClients.push(client);
    console.log(`MCPサーバー追加: ${serverUrl}`);
  }

  getAllTools() {
    const allTools = [];
    for (const client of this.mcpClients) {
      allTools.push(...client.getToolsForOllama());
    }
    return allTools;
  }

  async chat(userMessage) {
    // 会話履歴に追加
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const tools = this.getAllTools();
    console.log('利用可能なツール数:', tools.length);

    try {
      const response = await this.ollama.chat(
        this.model,
        this.conversationHistory,
        tools
      );

      const assistantMessage = response.message;
      this.conversationHistory.push(assistantMessage);

      // ツール呼び出しがある場合
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log('ツール呼び出しを実行中...');
        
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          console.log(`ツール実行: ${toolName}`, toolArgs);
          
          // 適切なMCPクライアントを見つけてツールを実行
          let toolResult = null;
          for (const client of this.mcpClients) {
            const clientTools = client.tools.map(t => t.name);
            if (clientTools.includes(toolName)) {
              toolResult = await client.callTool(toolName, toolArgs);
              break;
            }
          }

          // ツール実行結果を会話履歴に追加
          this.conversationHistory.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id
          });
        }

        // ツール実行後に再度LLMに問い合わせ
        const finalResponse = await this.ollama.chat(
          this.model,
          this.conversationHistory
        );
        
        this.conversationHistory.push(finalResponse.message);
        return finalResponse.message.content;
      }

      return assistantMessage.content;
    } catch (error) {
      console.error('チャットエラー:', error);
      return `エラーが発生しました: ${error.message}`;
    }
  }

  async checkOllamaStatus() {
    try {
      const models = await this.ollama.listModels();
      console.log('Ollama接続成功');
      console.log('利用可能なモデル:', models.models?.map(m => m.name) || []);
      return true;
    } catch (error) {
      console.error('Ollama接続失敗:', error.message);
      return false;
    }
  }

  disconnect() {
    for (const client of this.mcpClients) {
      client.disconnect();
    }
  }
}

// 使用例
async function main() {
  console.log('=== Ollama MCP Agent デモ ===');
  
  const agent = new OllamaMCPAgent('qwen2.5:latest');
  
  // Ollamaの状態確認
  console.log('Ollamaの状態を確認中...');
  const ollamaOk = await agent.checkOllamaStatus();
  if (!ollamaOk) {
    console.log('Ollamaが起動していません。以下の手順で起動してください:');
    console.log('1. Ollamaをインストール: https://ollama.com/download');
    console.log('2. モデルをダウンロード: ollama pull qwen2.5');
    console.log('3. Ollamaサーバーを起動: ollama serve');
    return;
  }

  try {
    // MCPサーバーに接続（ポート8001のGoogle Calendar MCP）
    console.log('MCPサーバーに接続中...');
    await agent.addMCPServer('ws://localhost:8001');
    
    // テスト会話
    console.log('\n=== テスト会話開始 ===');
    const response = await agent.chat('今日の予定を教えてください');
    console.log('AI応答:', response);
    
  } catch (error) {
    console.error('エラー:', error.message);
    console.log('\nMCPサーバーが起動していない可能性があります。');
    console.log('以下のコマンドでMCPサーバーを起動してください:');
    console.log('cd mcp-servers && npm run start:calendar');
  } finally {
    agent.disconnect();
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { OllamaMCPAgent, OllamaClient, MCPClient };