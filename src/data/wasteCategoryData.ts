import { WasteCategory } from '../types';

// 品目とごみ分類の対応データベース
export const wasteCategoryMapping: Record<string, WasteCategory> = {
  // 粗大ごみ
  'ソファ': '粗大ごみ',
  'テーブル': '粗大ごみ',
  '椅子': '粗大ごみ',
  'ベッド': '粗大ごみ',
  'タンス': '粗大ごみ',
  '冷蔵庫': '粗大ごみ',
  '洗濯機': '粗大ごみ',
  'テレビ': '粗大ごみ',
  'エアコン': '粗大ごみ',
  '電子レンジ': '粗大ごみ',
  '掃除機': '粗大ごみ',
  '自転車': '粗大ごみ',
  'マットレス': '粗大ごみ',
  '本棚': '粗大ごみ',
  'デスク': '粗大ごみ',
  'カーペット': '粗大ごみ',
  'ストーブ': '粗大ごみ',
  'ファンヒーター': '粗大ごみ',
  
  // 不燃ごみ
  'フライパン': '不燃ごみ',
  '鍋': '不燃ごみ',
  'やかん': '不燃ごみ',
  '包丁': '不燃ごみ',
  'ハサミ': '不燃ごみ',
  'ガラス': '不燃ごみ',
  '陶器': '不燃ごみ',
  '金属製品': '不燃ごみ',
  'アルミホイル': '不燃ごみ',
  '缶詰': '不燃ごみ',
  '電池': '不燃ごみ',
  '電球': '不燃ごみ',
  '蛍光灯': '不燃ごみ',
  
  // 可燃ごみ
  '紙': '可燃ごみ',
  '木材': '可燃ごみ',
  '布': '可燃ごみ',
  '革製品': '可燃ごみ',
  '生ごみ': '可燃ごみ',
  'ティッシュ': '可燃ごみ',
  '割り箸': '可燃ごみ',
  'ゴム製品': '可燃ごみ',
  '靴': '可燃ごみ',
  'カバン': '可燃ごみ',
  '衣類': '可燃ごみ',
  
  // 資源プラスチック
  'ペットボトル': '資源プラスチック',
  'プラスチック容器': '資源プラスチック',
  'ビニール袋': '資源プラスチック',
  'プラスチック製品': '資源プラスチック',
  'トレー': '資源プラスチック',
  'カップ': '資源プラスチック',
  'ボトル': '資源プラスチック',
  
  // 不燃ごみリサイクル資源
  'アルミ缶': '不燃ごみリサイクル資源',
  'スチール缶': '不燃ごみリサイクル資源',
  '金属缶': '不燃ごみリサイクル資源',
  'ビン': '不燃ごみリサイクル資源',
  'ガラス瓶': '不燃ごみリサイクル資源',
  '新聞紙': '不燃ごみリサイクル資源',
  '雑誌': '不燃ごみリサイクル資源',
  'ダンボール': '不燃ごみリサイクル資源',
  '牛乳パック': '不燃ごみリサイクル資源'
};

// キーワードベースの分類推定
export const classifyWasteByKeywords = (itemName: string): WasteCategory | null => {
  const lowerItemName = itemName.toLowerCase();
  
  // 直接マッチング
  for (const [key, category] of Object.entries(wasteCategoryMapping)) {
    if (key.toLowerCase() === lowerItemName || lowerItemName.includes(key.toLowerCase())) {
      return category;
    }
  }
  
  // キーワードベースの推定
  if (lowerItemName.includes('プラスチック') || lowerItemName.includes('ペット') || lowerItemName.includes('ビニール')) {
    return '資源プラスチック';
  }
  
  if (lowerItemName.includes('金属') || lowerItemName.includes('アルミ') || lowerItemName.includes('スチール') || lowerItemName.includes('缶')) {
    return '不燃ごみリサイクル資源';
  }
  
  if (lowerItemName.includes('ガラス') || lowerItemName.includes('陶器') || lowerItemName.includes('セラミック')) {
    return '不燃ごみ';
  }
  
  if (lowerItemName.includes('紙') || lowerItemName.includes('木') || lowerItemName.includes('布') || lowerItemName.includes('革')) {
    return '可燃ごみ';
  }
  
  // 大型家具・家電は粗大ごみ
  if (lowerItemName.includes('家具') || lowerItemName.includes('家電') || lowerItemName.includes('電気')) {
    return '粗大ごみ';
  }
  
  return null;
};

// ごみ分類の説明
export const wasteCategoryDescriptions: Record<WasteCategory, string> = {
  '粗大ごみ': '大型の家具や家電製品など、通常のごみ収集では処理できない大きなもの',
  '不燃ごみ': '燃えない材質でできたもの（金属、ガラス、陶器など）',
  '可燃ごみ': '燃える材質でできたもの（紙、木材、布、生ごみなど）',
  '資源プラスチック': 'リサイクル可能なプラスチック製品',
  '不燃ごみリサイクル資源': 'リサイクル可能な金属缶、ガラス瓶、紙類など'
};