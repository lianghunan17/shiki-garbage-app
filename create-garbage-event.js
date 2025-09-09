// 2025年9月16日10:00-11:00の「ゴミ」イベントを作成するスクリプト
const WebSocket = require('ws');

// MCPサーバーに接続してイベントを作成
async function createGarbageEvent() {
  try {
    console.log('ゴミイベント作成を開始...');
    
    // WebSocketでMCPサーバーに接続
    const ws = new WebSocket('ws://localhost:8085/mcp/calendar');
    
    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log('MCPサーバーに接続しました');
        resolve();
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket接続エラー:', error);
        reject(error);
      });
    });
    
    // ゴミイベントのデータ
    const garbageEvent = {
      title: 'ゴミ',
      description: 'ゴミ出しの予定です',
      startDate: '2025-09-16T10:00:00+09:00',
      endDate: '2025-09-16T11:00:00+09:00',
      location: '',
      attendees: [],
      reminders: [{
        method: 'popup',
        minutes: 15
      }],
      calendarProvider: 'google'
    };
    
    // MCPサーバーにイベント作成リクエストを送信
    const createEventRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'calendar/create_event',
      params: garbageEvent
    };
    
    const createdEventId = await new Promise((resolve, reject) => {
      ws.send(JSON.stringify(createEventRequest));
      
      ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === 1) {
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result?.eventId);
            }
          }
        } catch (error) {
          reject(error);
        }
      });
      
      setTimeout(() => {
        reject(new Error('タイムアウト'));
      }, 10000);
    });
    
    if (createdEventId) {
      console.log(`✅ ゴミの予定が作成されました (ID: ${createdEventId})`);
      console.log(`📅 カレンダーで確認: https://calendar.google.com/calendar/u/0/r/day/2025/09/16`);
      
      // 作成されたイベントを確認
      console.log('\n作成されたイベントを確認中...');
      
      const getEventsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get-calendar-events',
          arguments: {
            startDate: '2025-09-16T00:00:00+09:00',
            endDate: '2025-09-16T23:59:59+09:00',
            calendarProvider: 'google'
          }
        }
      };
      
      const events = await new Promise((resolve, reject) => {
        ws.send(JSON.stringify(getEventsRequest));
        
        ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.id === 2) {
              if (response.error) {
                reject(new Error(response.error.message));
              } else {
                resolve(response.result?.events || []);
              }
            }
          } catch (error) {
            reject(error);
          }
        });
        
        setTimeout(() => {
          reject(new Error('タイムアウト'));
        }, 10000);
      });
      
      const garbageEvents = events.filter(event => event.title && event.title.includes('ゴミ'));
      
      if (garbageEvents.length > 0) {
        console.log(`✅ 「ゴミ」イベントが${garbageEvents.length}件見つかりました:`);
        garbageEvents.forEach((event, index) => {
          const startTime = new Date(event.startDate).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          });
          const endTime = new Date(event.endDate).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          });
          console.log(`  ${index + 1}. ${event.title} (${startTime}-${endTime})`);
        });
      } else {
        console.log('❌ ゴミイベントが見つかりませんでした');
      }
      
    } else {
      console.log('❌ ゴミの予定作成に失敗しました');
    }
    
    // WebSocket接続を閉じる
    ws.close();
    
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    console.error(error);
  }
}

// スクリプトを実行
createGarbageEvent().then(() => {
  console.log('\n処理完了');
  process.exit(0);
}).catch((error) => {
  console.error('処理中にエラーが発生しました:', error);
  process.exit(1);
});