// ゴミの種類
export type GarbageCategory = 'burnable' | 'non-burnable' | 'recyclable' | 'plastic' | 'bulky' | 'hazardous';
export type GarbageType = 
  | 'combustible'     // 可燃ゴミ
  | 'non-combustible' // 不燃ゴミ
  | 'recyclable'      // 資源ゴミ
  | 'plastic'         // プラスチック
  | 'bulky'           // 粗大ゴミ
  | 'hazardous'       // 有害ゴミ
  | 'difficult'       // 処理困難ゴミ
  | 'fabric';         // 布類

// 志木市のゴミ品目情報
export interface ShikiCityGarbageItem {
  item: string;
  category: string;
  fee: number;
  type: GarbageType;
  keywords: string[];
  note?: string;
}

// ゴミアイテム
export interface GarbageItem {
  id: string;
  name: string;
  type: GarbageType;
  description?: string;
  imageUrl?: string;
  municipalityRules?: MunicipalityRule[];
}

// 自治体ルール
export interface MunicipalityRule {
  municipalityId: string;
  municipalityName: string;
  garbageType: GarbageType;
  collectionDay: string;
  specialInstructions?: string;
  fee?: number;
  applicationMethod?: string;
}

// ゴミ分類ルール
export interface GarbageRule {
  garbageType: string;
  examples: string[];
  description: string;
  collectionDay: string;
  specialInstructions?: string;
}

// 自治体情報
export interface Municipality {
  id: string;
  name: string;
  prefecture: string;
  postalCode: string;
  rules: MunicipalityRule[];
}

// ユーザー情報
export interface User {
  id: string;
  name: string;
  email: string;
  municipality: Municipality;
  preferences: UserPreferences;
}

// ユーザー設定
export interface UserPreferences {
  language: 'ja' | 'en' | 'zh';
  notificationEnabled: boolean;
  reminderTime: {
    evening: string; // 前日夜の通知時間
    morning: string; // 当日朝の通知時間
  };
  calendarIntegration: boolean;
}

// 分類結果
export interface ClassificationResult {
  item: GarbageItem;
  confidence: number;
  suggestions?: GarbageItem[];
  municipalityRule?: MunicipalityRule;
  shikiCityInfo?: ShikiCityGarbageItem; // 志木市の詳細情報
}

// 通知スケジュール
export interface NotificationSchedule {
  id: string;
  userId: string;
  garbageType: GarbageType;
  scheduledDate: Date;
  reminderSent: boolean;
  calendarEventId?: string;
  isRecurring?: boolean;
  collectionTime?: string;
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 画像認識API レスポンス
export interface ImageRecognitionResponse {
  predictions: {
    className: string;
    probability: number;
  }[];
}

// 入力方法
export type InputMethod = 'camera' | 'text';

// アプリの状態
export interface AppState {
  user: User | null;
  currentClassification: ClassificationResult | null;
  loading: boolean;
  error: string | null;
}

// カレンダーイベント
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  attendees?: string[];
  reminders?: {
    method: string;
    minutes: number;
  }[];
  recurrence?: string;
  calendarProvider?: string;
}

// ゴミ収集スケジュール
export interface GarbageCollectionSchedule {
  id: string;
  municipalityId: string;
  area: string;
  garbageType: GarbageType;
  collectionDate: string;
  collectionTime?: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  notes?: string;
}

// リマインダー
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderTime: string;
  type: 'garbage' | 'custom' | 'garbage-preparation';
  relatedScheduleId?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
}

// 地域情報関連の型定義
export interface LocationInfo {
  id: string;
  name: string;
  prefecture: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  postalCode: string;
  timezone: string;
}

export interface WeatherInfo {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed?: number;
  condition: string;
  description?: string;
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
  lastUpdated: string;
  timestamp?: string;
}

export interface TrafficInfo {
  location: string;
  trafficLevel?: string;
  routes?: {
    name: string;
    status: 'normal' | 'congested' | 'blocked';
    travelTime: number;
    distance: number;
  }[];
  incidents: {
    type: string;
    description: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  roadClosures?: any[];
  publicTransport?: any;
  lastUpdated: string;
  timestamp?: string;
}

export interface LocalNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  source: string;
  url: string;
  location: string;
}

export interface NotificationConfig {
  id: string;
  type: 'email' | 'push' | 'sms' | 'webhook';
  enabled: boolean;
  settings: Record<string, any>;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'webhook';
  config: NotificationConfig;
  isActive: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'garbage-reminder' | 'schedule-update' | 'emergency-alert';
  variables: string[];
}