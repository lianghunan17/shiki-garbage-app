// 埼玉県志木市のゴミ収集データ

export interface GarbageScheduleData {
  area: string;
  recyclable: string; // リサイクル資源
  plasticResource: string; // 資源プラスチック
  burnable: string; // 可燃ごみ
  nonBurnable: string; // 不燃ごみ
}

// 曜日の定義
export const WEEKDAYS = {
  MONDAY: '月曜日',
  TUESDAY: '火曜日',
  WEDNESDAY: '水曜日',
  THURSDAY: '木曜日',
  FRIDAY: '金曜日',
  SATURDAY: '土曜日',
  SUNDAY: '日曜日'
};

// 志木市の地域別ゴミ収集スケジュール
export const SHIKI_GARBAGE_SCHEDULE: GarbageScheduleData[] = [
  {
    area: '上宗岡全域（下記除く）',
    recyclable: '月曜日',
    plasticResource: '水曜日',
    burnable: '火曜日・金曜日',
    nonBurnable: '第2水曜日・第4水曜日'
  },
  {
    area: '上宗岡4-6-27、上宗岡4-6-47',
    recyclable: '月曜日',
    plasticResource: '水曜日',
    burnable: '水曜日・土曜日',
    nonBurnable: '第2水曜日・第4水曜日'
  },
  {
    area: '中宗岡1丁目、中宗岡2丁目',
    recyclable: '月曜日',
    plasticResource: '水曜日',
    burnable: '火曜日・金曜日',
    nonBurnable: '第2水曜日・第4水曜日'
  },
  {
    area: '中宗岡3丁目、中宗岡4丁目、中宗岡5丁目',
    recyclable: '火曜日',
    plasticResource: '金曜日',
    burnable: '月曜日・木曜日',
    nonBurnable: '第2金曜日・第4金曜日'
  },
  {
    area: '下宗岡全域',
    recyclable: '火曜日',
    plasticResource: '金曜日',
    burnable: '月曜日・木曜日',
    nonBurnable: '第2金曜日・第4金曜日'
  },
  {
    area: '本町全域',
    recyclable: '金曜日',
    plasticResource: '火曜日',
    burnable: '月曜日・木曜日',
    nonBurnable: '第2火曜日・第4火曜日'
  },
  {
    area: '幸町全域',
    recyclable: '木曜日',
    plasticResource: '月曜日',
    burnable: '水曜日・土曜日',
    nonBurnable: '第2月曜日・第4月曜日'
  },
  {
    area: '館1-5、館1-6、館2-1、館2-3、館2-4-5、館2-8',
    recyclable: '木曜日',
    plasticResource: '月曜日',
    burnable: '月曜日・木曜日',
    nonBurnable: '第2月曜日・第4月曜日'
  },
  {
    area: '館1-1、館2-4（2-4-5を除く）、館2-6、館2-2-3、館2-2-4',
    recyclable: '木曜日',
    plasticResource: '月曜日',
    burnable: '火曜日・金曜日',
    nonBurnable: '第2月曜日・第4月曜日'
  },
  {
    area: '柏町全域',
    recyclable: '水曜日',
    plasticResource: '木曜日',
    burnable: '火曜日・金曜日',
    nonBurnable: '第2木曜日・第4木曜日'
  }
];

// 地域名のリスト（選択用）
export const SHIKI_AREAS = SHIKI_GARBAGE_SCHEDULE.map(schedule => schedule.area);

// 曜日を数値に変換する関数
export const getWeekdayNumber = (weekdayStr: string): number => {
  const weekdayMap: { [key: string]: number } = {
    '日曜日': 0,
    '月曜日': 1,
    '火曜日': 2,
    '水曜日': 3,
    '木曜日': 4,
    '金曜日': 5,
    '土曜日': 6
  };
  return weekdayMap[weekdayStr] ?? -1;
};

// 第N週の指定を解析する関数
export const parseWeekSpecification = (spec: string): number[] => {
  if (spec.includes('第2') && spec.includes('第4')) {
    return [2, 4];
  } else if (spec.includes('第1') && spec.includes('第3')) {
    return [1, 3];
  } else if (spec.includes('第2')) {
    return [2];
  } else if (spec.includes('第4')) {
    return [4];
  } else if (spec.includes('第1')) {
    return [1];
  } else if (spec.includes('第3')) {
    return [3];
  }
  return [];
};

// 複数の曜日を解析する関数
export const parseMultipleWeekdays = (weekdayStr: string): number[] => {
  const weekdays = weekdayStr.split('・');
  return weekdays.map(day => getWeekdayNumber(day)).filter(num => num !== -1);
};