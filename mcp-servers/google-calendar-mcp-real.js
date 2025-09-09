const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// サービスアカウント認証の設定
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials/google-calendar-service-account.json';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/mcp/calendar' });

console.log('Google Calendar MCP Server (Real API) starting...');

// Google Calendar API設定
let calendar;
let auth;

// OAuth 2.0認証設定
async function setupAuth() {
  try {
    // OAuth 2.0認証の設定
    const credentialsPath = path.resolve(CREDENTIALS_PATH);
    
    // 認証情報ファイルの存在確認
    try {
      await fs.access(credentialsPath);
    } catch (error) {
      throw new Error(`認証情報ファイルが見つかりません: ${credentialsPath}`);
    }
    
    // OAuth 2.0認証情報を読み込み
    const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
    console.log('認証情報ファイル内容:', credentialsContent);
    const credentials = JSON.parse(credentialsContent);
    console.log('パースされた認証情報:', JSON.stringify(credentials, null, 2));
    
    // OAuth 2.0クライアント設定（ウェブアプリケーション用）
    let clientConfig;
    if (credentials.web) {
      clientConfig = credentials.web;
    } else if (credentials.installed) {
      clientConfig = credentials.installed;
    } else {
      throw new Error('認証情報ファイルに"web"または"installed"セクションが見つかりません');
    }
    
    const oauth2Client = new google.auth.OAuth2(
      clientConfig.client_id,
      clientConfig.client_secret,
      'http://localhost:8087/auth/callback' // 現在のサーバーポートに合わせたコールバックURL
    );
    
    console.log('OAuth2クライアント設定完了:', {
      client_id: clientConfig.client_id,
      redirect_uri: 'http://localhost:8087/auth/callback'
    });
    
    // スコープ設定
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    
    // 認証URL生成（デモ用）
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    
    console.log('OAuth 2.0認証URL:', authUrl);
     console.log('注意: 実際の運用では適切なトークン管理が必要です');
     
     // 保存されたトークンがあれば読み込み
     const tokenPath = path.join(__dirname, '..', 'credentials', 'tokens.json');
     try {
       const tokenContent = await fs.readFile(tokenPath, 'utf8');
       const tokens = JSON.parse(tokenContent);
       oauth2Client.setCredentials(tokens);
       console.log('保存されたトークンを読み込みました');
     } catch (error) {
       console.log('保存されたトークンが見つかりません。認証が必要です。');
       console.log('認証を開始するには http://localhost:8087/auth にアクセスしてください');
     }
     
     auth = oauth2Client;
     calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    console.log('Google Calendar API サービスアカウント認証設定完了');
    console.log(`使用するカレンダーID: ${CALENDAR_ID}`);
  } catch (error) {
    console.error('認証設定エラー:', error);
    throw error;
  }
}

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
    case 'calendar/create_event':
      return await createCalendarEvent(id, params);
    case 'calendar/get_events':
      return await getCalendarEvents(id, params);
    case 'calendar/create_reminder':
      return await createReminder(id, params);
    case 'calendar/update_event':
      return await updateEvent(id, params);
    case 'calendar/delete_event':
      return await deleteEvent(id, params);
    case 'calendar/sync':
      return await syncCalendar(id, params);
    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

// カレンダーイベント作成
async function createCalendarEvent(id, params) {
  try {
    if (!calendar) {
      throw new Error('Google Calendar API not configured');
    }

    const { title, description, startDate, endDate, location, recurrence } = params;
    
    const event = {
      summary: title,
      description: description,
      location: location,
      start: {
        dateTime: new Date(startDate).toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: new Date(endDate || new Date(new Date(startDate).getTime() + 60 * 60 * 1000)).toISOString(),
        timeZone: 'Asia/Tokyo',
      },
    };

    if (recurrence) {
      event.recurrence = [recurrence];
    }

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    console.log('Event created:', response.data.id);
    
    return {
      id,
      result: {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        message: 'イベントが正常に作成されました'
      }
    };
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      id,
      error: {
        code: -1,
        message: `イベント作成エラー: ${error.message}`
      }
    };
  }
}

// カレンダーイベント取得
async function getCalendarEvents(id, params) {
  try {
    if (!calendar) {
      throw new Error('Google Calendar API not configured');
    }

    const { startDate, endDate, maxResults = 10 } = params;
    
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      timeMax: endDate ? new Date(endDate).toISOString() : undefined,
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      startDate: event.start.dateTime || event.start.date,
      endDate: event.end.dateTime || event.end.date,
      location: event.location,
      htmlLink: event.htmlLink
    }));

    return {
      id,
      result: {
        success: true,
        events: events,
        message: `${events.length}件のイベントを取得しました`
      }
    };
  } catch (error) {
    console.error('Error getting events:', error);
    return {
      id,
      error: {
        code: -1,
        message: `イベント取得エラー: ${error.message}`
      }
    };
  }
}

// リマインダー作成（イベントにリマインダーを追加）
async function createReminder(id, params) {
  try {
    if (!calendar) {
      throw new Error('Google Calendar API not configured');
    }

    const { title, description, reminderTime } = params;
    
    // リマインダーは実際にはイベントとして作成
    const event = {
      summary: `🔔 ${title}`,
      description: description,
      start: {
        dateTime: new Date(reminderTime).toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: new Date(new Date(reminderTime).getTime() + 15 * 60 * 1000).toISOString(), // 15分間
        timeZone: 'Asia/Tokyo',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
          { method: 'popup', minutes: 0 }
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    return {
      id,
      result: {
        success: true,
        reminderId: response.data.id,
        message: 'リマインダーが正常に作成されました'
      }
    };
  } catch (error) {
    console.error('Error creating reminder:', error);
    return {
      id,
      error: {
        code: -1,
        message: `リマインダー作成エラー: ${error.message}`
      }
    };
  }
}

// イベント更新
async function updateEvent(id, params) {
  try {
    if (!calendar) {
      throw new Error('Google Calendar API not configured');
    }

    const { eventId, title, description, startDate, endDate } = params;
    
    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: new Date(startDate).toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: new Date(endDate).toISOString(),
        timeZone: 'Asia/Tokyo',
      },
    };

    const response = await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      resource: event,
    });

    return {
      id,
      result: {
        success: true,
        eventId: response.data.id,
        message: 'イベントが正常に更新されました'
      }
    };
  } catch (error) {
    console.error('Error updating event:', error);
    return {
      id,
      error: {
        code: -1,
        message: `イベント更新エラー: ${error.message}`
      }
    };
  }
}

// イベント削除
async function deleteEvent(id, params) {
  try {
    if (!calendar) {
      throw new Error('Google Calendar API not configured');
    }

    const { eventId } = params;
    
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    return {
      id,
      result: {
        success: true,
        message: 'イベントが正常に削除されました'
      }
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    return {
      id,
      error: {
        code: -1,
        message: `イベント削除エラー: ${error.message}`
      }
    };
  }
}

// カレンダー同期
async function syncCalendar(id, params) {
  try {
    if (!calendar) {
      throw new Error('Google Calendar API not configured');
    }

    // 今後7日間のイベントを取得
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: weekLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return {
      id,
      result: {
        success: true,
        syncedEvents: response.data.items.length,
        message: `${response.data.items.length}件のイベントを同期しました`
      }
    };
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return {
      id,
      error: {
        code: -1,
        message: `カレンダー同期エラー: ${error.message}`
      }
    };
  }
}

// OAuth 2.0認証フロー用エンドポイント
app.get('/auth', (req, res) => {
  if (!auth) {
    return res.status(500).json({ error: 'OAuth client not initialized' });
  }
  
  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
  });
  
  res.redirect(authUrl);
});

// OAuth 2.0コールバックエンドポイント
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }
  
  try {
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);
    
    // トークンをファイルに保存（実際の運用では安全な場所に保存）
    const tokenPath = path.join(__dirname, '..', 'credentials', 'tokens.json');
    await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
    
    console.log('OAuth 2.0認証完了、トークンを保存しました');
    res.json({ message: 'Authentication successful', tokens });
  } catch (error) {
    console.error('OAuth 2.0認証エラー:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
});

// ヘルスチェック
// カレンダーイベント取得用HTTPエンドポイント
app.get('/events', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!auth || !auth.credentials || !auth.credentials.access_token) {
      return res.status(401).json({ 
        error: 'OAuth 2.0認証が必要です', 
        authUrl: 'http://localhost:8085/auth',
        message: '認証を完了してからもう一度お試しください'
      });
    }
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description,
      location: event.location
    }));
    
    res.json({
      success: true,
      year: targetYear,
      month: targetMonth,
      eventsCount: events.length,
      events: events
    });
    
  } catch (error) {
    console.error('カレンダーイベント取得エラー:', error);
    res.status(500).json({ 
      error: 'カレンダーイベント取得に失敗しました', 
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'google-calendar-mcp-real', timestamp: new Date().toISOString() });
});

// サーバー起動
const PORT = 8087; // 元のモックサーバーと区別するため異なるポートを使用

// 認証設定を行ってからサーバーを起動
setupAuth().then(() => {
  server.listen(PORT, () => {
    console.log(`Google Calendar MCP Server (Real API) listening on port ${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}/mcp/calendar`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}).catch((error) => {
  console.error('サーバー起動に失敗しました:', error);
  process.exit(1);
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});