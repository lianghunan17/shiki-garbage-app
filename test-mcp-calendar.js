const WebSocket = require('ws');

// MCPサーバーとの接続テスト
async function testMCPCalendar() {
    console.log('=== MCP Calendar Server テスト ===');
    
    const ws = new WebSocket('ws://localhost:8087/mcp/calendar');
    
    return new Promise((resolve, reject) => {
        ws.on('open', () => {
            console.log('✅ MCPサーバーに接続しました');
            
            // イベント作成のテストメッセージ
            const testEvent = {
                id: 1,
                method: 'calendar/create_event',
                params: {
                    title: 'MCPテストイベント - OAuth認証成功',
                    description: 'OAuth認証が成功し、MCPサーバー経由でカレンダーイベントを作成するテスト',
                    startDate: '2025-01-15T14:00:00+09:00',
                    endDate: '2025-01-15T15:00:00+09:00',
                    location: 'テスト環境'
                }
            };
            
            console.log('📅 イベント作成リクエストを送信中...');
            ws.send(JSON.stringify(testEvent));
        });
        
        ws.on('message', (data) => {
            try {
                const response = JSON.parse(data.toString());
                console.log('📨 MCPサーバーからの応答:');
                console.log(JSON.stringify(response, null, 2));
                
                if (response.result) {
                    console.log('✅ イベント作成成功!');
                    if (response.result.content && response.result.content[0]) {
                        console.log('📋 作成されたイベント情報:');
                        console.log(response.result.content[0].text);
                    }
                } else if (response.error) {
                    console.log('❌ エラーが発生しました:', response.error);
                }
                
                ws.close();
                resolve(response);
            } catch (error) {
                console.error('❌ レスポンス解析エラー:', error);
                ws.close();
                reject(error);
            }
        });
        
        ws.on('error', (error) => {
            console.error('❌ WebSocket接続エラー:', error);
            reject(error);
        });
        
        ws.on('close', () => {
            console.log('🔌 MCPサーバーとの接続を閉じました');
        });
        
        // タイムアウト設定
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
                reject(new Error('タイムアウト: 10秒以内に応答がありませんでした'));
            }
        }, 10000);
    });
}

// テスト実行
testMCPCalendar()
    .then(() => {
        console.log('\n🎉 MCPカレンダーテスト完了!');
        console.log('📅 Google Calendarで確認してください: https://calendar.google.com/');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ テスト失敗:', error.message);
        process.exit(1);
    });