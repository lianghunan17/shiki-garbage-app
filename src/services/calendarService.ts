// Google Calendar MCP Service
class CalendarMCPService {
  private ws: WebSocket | null = null;
  private requestId = 1;
  private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    // 初期接続を非同期で開始（エラーは後で処理）
    this.connect().catch(error => {
      console.warn('Initial connection failed, will retry on first request:', error);
    });
  }

  private connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('ws://localhost:8087/mcp/calendar');
        
        this.ws.onopen = () => {
          console.log('Connected to Google Calendar MCP Server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            const request = this.pendingRequests.get(response.id);
            
            if (request) {
              this.pendingRequests.delete(response.id);
              
              if (response.error) {
                request.reject(new Error(response.error.message));
              } else {
                request.resolve(response.result);
              }
            }
          } catch (error) {
            console.error('Error parsing MCP response:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          this.connectionPromise = null;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from Google Calendar MCP Server');
          this.isConnected = false;
          this.connectionPromise = null;
          
          // 再接続を試行
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
          } else {
            console.error('Max reconnection attempts reached');
          }
        };

        // 接続タイムアウト
        setTimeout(() => {
          if (!this.isConnected) {
            this.ws?.close();
            this.connectionPromise = null;
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      } catch (error) {
        console.error('Failed to connect to MCP server:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private async sendRequest(method: string, params: any = {}): Promise<any> {
    // 接続が確立されるまで待機
    if (!this.isConnected) {
      try {
        await this.connect();
      } catch (error) {
        throw new Error(`Failed to connect to MCP server: ${error}`);
      }
    }

    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const id = this.requestId++;
      this.pendingRequests.set(id, { resolve, reject });

      const request = {
        id,
        method,
        params
      };

      this.ws.send(JSON.stringify(request));

      // タイムアウト設定
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 15000);
    });
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    reminders?: any[];
  }) {
    try {
      const result = await this.sendRequest('calendar/create_event', eventData);
      return result;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  async getEvents(params: {
    startDate?: string;
    endDate?: string;
    filter?: string;
  } = {}) {
    try {
      const result = await this.sendRequest('calendar/get_events', params);
      return result;
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      throw error;
    }
  }

  async createReminder(params: {
    eventId: string;
    reminderTime: string;
    message?: string;
  }) {
    try {
      const result = await this.sendRequest('calendar/create_reminder', params);
      return result;
    } catch (error) {
      console.error('Failed to create reminder:', error);
      throw error;
    }
  }

  // ゴミ出し日のカレンダーイベントを作成
  async createGarbageEvent(params: {
    garbageType: string;
    prefecture: string;
    municipality: string;
    weekday: number;
    weekNumber: string;
    time: string;
    startDate: string;
    endDate: string;
  }) {
    const { garbageType, prefecture, municipality, weekday, time, startDate, endDate } = params;
    
    const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const weekdayName = weekdayNames[weekday];
    
    const title = `${garbageType}の日`;
    const description = `地域: ${prefecture} ${municipality}\n収集時間: ${time}\n曜日: ${weekdayName}曜日`;
    const location = `${prefecture} ${municipality}`;
    
    // リマインダー設定（30分前）
    const reminders = [
      {
        method: 'popup',
        minutes: 30
      }
    ];

    return await this.createEvent({
      title,
      description,
      startDate,
      endDate,
      location,
      reminders
    });
  }

  // 繰り返しのゴミ出し日イベントを作成
  async createRecurringGarbageEvents(params: {
    garbageType: string;
    prefecture: string;
    municipality: string;
    weekday: number;
    weekNumber: string;
    time: string;
    startDate: string;
    months: number; // 何ヶ月分作成するか
  }) {
    const { weekday, weekNumber, time, startDate, months } = params;
    const events = [];
    
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + months);
    
    const current = new Date(start);
    
    while (current <= endDate) {
      // 指定された曜日を探す
      const targetWeekday = weekday;
      const dayOfWeek = current.getDay();
      const daysToAdd = (targetWeekday - dayOfWeek + 7) % 7;
      
      const eventDate = new Date(current);
      eventDate.setDate(eventDate.getDate() + daysToAdd);
      
      // 週の指定をチェック
      if (this.shouldCreateEventForWeek(eventDate, weekNumber)) {
        const eventStart = new Date(eventDate);
        const [hours, minutes] = time.split(':').map(Number);
        eventStart.setHours(hours, minutes, 0, 0);
        
        const eventEnd = new Date(eventStart);
        eventEnd.setHours(eventStart.getHours() + 1); // 1時間のイベント
        
        try {
          const event = await this.createGarbageEvent({
            ...params,
            startDate: eventStart.toISOString(),
            endDate: eventEnd.toISOString()
          });
          events.push(event);
        } catch (error) {
          console.error('Failed to create event for', eventDate, error);
        }
      }
      
      // 次の週に進む
      current.setDate(current.getDate() + 7);
    }
    
    return events;
  }
  
  private shouldCreateEventForWeek(date: Date, weekNumber: string): boolean {
    if (weekNumber === 'every') {
      return true;
    }
    
    const weekOfMonth = Math.ceil(date.getDate() / 7);
    
    if (weekNumber.includes(',')) {
      // 複数週指定（例: "1,3"）
      const weeks = weekNumber.split(',').map(w => parseInt(w));
      return weeks.includes(weekOfMonth);
    } else {
      // 単一週指定
      return weekOfMonth === parseInt(weekNumber);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default CalendarMCPService;