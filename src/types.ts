// 型定義ファイル

// ごみ分類の型
export type WasteCategory = 
  | '不燃ごみリサイクル資源'
  | '資源プラスチック'
  | '可燃ごみ'
  | '不燃ごみ'
  | '粗大ごみ';

// AI分析結果の型
export interface AnalysisResult {
  identifiedItem: string;
  confidence: number;
  suggestedFee: number;
  category?: string;
  description?: string;
  processingTime?: string;
  wasteCategory?: WasteCategory;
  wasteCategoryConfidence?: number;
}

// 粗大ごみアイテムの型
export interface BulkyWasteItem {
  id: string;
  name: string;
  category: string;
  fee: number;
  size?: string;
  material?: string;
  notes?: string;
}

// ゴミ収集スケジュールの型
export interface GarbageSchedule {
  id: string;
  date: string;
  memo: string;
  createdAt: Date;
}

// AI分析リクエストの型
export interface AnalysisRequest {
  imageData: string;
  prompt?: string;
  options?: {
    maxResults?: number;
    confidenceThreshold?: number;
  };
}

// AI分析レスポンスの型
export interface AnalysisResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
  timestamp: string;
}

// MCPサーバーレスポンスの型
export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

// 検索結果の型
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  relevance: number;
}