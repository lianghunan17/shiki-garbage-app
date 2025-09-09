const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/mcp/calendar' });

console.log('Google Calendar MCP Server starting...');

// モックデータ
const mockEvents = [];
let eventIdCounter = 1;

// WebSocket接続処理
wss.on('connection', (ws) => {
  console.log('MCP Client connected to Google Calendar server');
  
  ws.on('message', async (message) => {
    let request;
    try {
      request = JSON.parse(message);
      console.log('Received request:', request);
      
      const response = await handleMCPRequest(request);
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error handling request:', error);
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
    console.log('MCP Client disconnected from Google Calendar server');
  });
});

// MCPリクエスト処理
async function handleMCPRequest(request) {
  const { id, method, params } = request;
  
  switch (method) {
    case 'tools/call':
      return await handleToolCall(id, params);
    case 'tools/list':
      return await listTools(id, params);
    case 'create-event':
      return await createCalendarEvent(id, params);
    case 'get-events':
      return await getCalendarEvents(id, params);
    case 'create-reminder':
      return await createReminder(id, params);
    case 'update-event':
      return await updateEvent(id, params);
    case 'delete-event':
      return await deleteEvent(id, params);
    case 'sync-calendar':
      return await syncCalendar(id, params);
    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

// ツール一覧取得
async function listTools(id, params) {
  return {
    id,
    result: {
      tools: [
        {
          name: 'create-calendar-event',
          description: 'カレンダーイベントを作成します',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              location: { type: 'string' },
              reminders: { type: 'array' }
            },
            required: ['title', 'startDate', 'endDate']
          }
        },
        {
          name: 'get-calendar-events',
          description: 'カレンダーイベントを取得します',
          inputSchema: {
            type: 'object',
            properties: {
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              filter: { type: 'string' }
            }
          }
        },
        {
          name: 'create-reminder',
          description: 'リマインダーを作成します',
          inputSchema: {
            type: 'object',
            properties: {
              eventId: { type: 'string' },
              reminderTime: { type: 'string' },
              message: { type: 'string' }
            },
            required: ['eventId', 'reminderTime']
          }
        }
      ]
    }
  };
}

// ツール呼び出し処理
async function handleToolCall(id, params) {
  const { name, arguments: toolArgs } = params;
  
  switch (name) {
    case 'create-calendar-event':
      return await createCalendarEvent(id, toolArgs);
    case 'get-calendar-events':
      return await getCalendarEvents(id, toolArgs);
    case 'create-reminder':
      return await createReminder(id, toolArgs);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// カレンダーイベント作成
async function createCalendarEvent(id, params) {
  const {
    title,
    description,
    startDate,
    endDate,
    location,
    reminders
  } = params;
  
  const event = {
    id: `event_${eventIdCounter++}`,
    title: title || 'ゴミ出し',
    description: description || '',
    startDate: startDate,
    endDate: endDate,
    location: location || '',
    reminders: reminders || [],
    created: new Date().toISOString()
  };
  
  mockEvents.push(event);
  
  console.log('Created event:', event);
  
  return {
    id,
    result: {
      success: true,
      eventId: event.id,
      message: 'カレンダーイベントが正常に作成されました'
    }
  };
}

// カレンダーイベント取得
async function getCalendarEvents(id, params) {
  const { startDate, endDate, filter } = params;
  
  let filteredEvents = mockEvents;
  
  if (startDate && endDate) {
    filteredEvents = mockEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
    });
  }
  
  return {
    id,
    result: {
      success: true,
      events: filteredEvents
    }
  };
}

// リマインダー作成
async function createReminder(id, params) {
  const { eventId, reminderTime, message } = params;
  
  const reminder = {
    id: `reminder_${eventIdCounter++}`,
    eventId,
    reminderTime,
    message: message || 'ゴミ出しの時間です',
    created: new Date().toISOString()
  };
  
  console.log('Created reminder:', reminder);
  
  return {
    id,
    result: {
      success: true,
      reminderId: reminder.id,
      message: 'リマインダーが正常に作成されました'
    }
  };
}

// イベント更新
async function updateEvent(id, params) {
  const { eventId, updates } = params;
  
  const eventIndex = mockEvents.findIndex(event => event.id === eventId);
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...updates };
  
  return {
    id,
    result: {
      success: true,
      message: 'イベントが正常に更新されました'
    }
  };
}

// イベント削除
async function deleteEvent(id, params) {
  const { eventId } = params;
  
  const eventIndex = mockEvents.findIndex(event => event.id === eventId);
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  mockEvents.splice(eventIndex, 1);
  
  return {
    id,
    result: {
      success: true,
      message: 'イベントが正常に削除されました'
    }
  };
}

// カレンダー同期
async function syncCalendar(id, params) {
  return {
    id,
    result: {
      success: true,
      message: 'カレンダー同期が完了しました'
    }
  };
}

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'google-calendar-mcp' });
});

// サーバー起動
const PORT = 8084;
server.listen(PORT, () => {
  console.log(`Google Calendar MCP Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/mcp/calendar`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});