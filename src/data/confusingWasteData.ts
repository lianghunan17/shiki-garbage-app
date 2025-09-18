// 判断に迷うごみの一覧表データ

export interface ConfusingWasteItem {
  item: string; // 品目
  handling: string; // 取扱（燃やせるごみ、燃やせないごみ、資源ごみ、粗大ごみ等）
  reason: string; // 理由・受入条件
}

// 迷惑ゴミOK.csvから抽出したデータ
export const confusingWasteData: ConfusingWasteItem[] = [
  {
    item: 'アイロン',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'アイロン台',
    handling: '粗大',
    reason: ''
  },
  {
    item: 'アクリル板',
    handling: '不燃',
    reason: '一斗缶サイズ以内のみ'
  },
  {
    item: 'アスベスト',
    handling: '受入不可',
    reason: '有害物質のため'
  },
  {
    item: 'アルミホイル',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'アンテナ（室内用）',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'アンテナ（屋外用）',
    handling: '粗大',
    reason: ''
  },
  {
    item: 'イス',
    handling: '粗大',
    reason: ''
  },
  {
    item: 'イヤホン',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'インクカートリッジ',
    handling: '不燃',
    reason: '販売店での回収を推進'
  },
  {
    item: 'ウェットティッシュ',
    handling: '可燃',
    reason: ''
  },
  {
    item: 'ウォシュレット',
    handling: '粗大',
    reason: ''
  },
  {
    item: 'エアコン',
    handling: '受入不可',
    reason: '家電リサイクル法対象品目のため、販売店又は指定業者等へ引き取りの依頼をすること。分解した物も受入不可。ただし、火災などで原型をとどめない又は識別できない場合は、リサイクルの対象にはならないので受入可能（家電製品協会に確認済。）。'
  },
  {
    item: 'エレクトーン',
    handling: '粗大',
    reason: ''
  },
  {
    item: 'オイルヒーター',
    handling: '粗大',
    reason: 'オイルを抜くこと'
  },
  {
    item: 'オーディオ機器',
    handling: '不燃',
    reason: '一斗缶サイズを超える大きさのものは粗大ごみ'
  },
  {
    item: 'オートバイ',
    handling: '受入不可',
    reason: '二輪車リサイクルシステムを利用すること'
  },
  {
    item: 'お菓子の袋（プラスチック製）',
    handling: '資源プラ',
    reason: '汚れを落として出す。汚れが落ちないものは可燃ごみ'
  },
  {
    item: 'カーペット',
    handling: '粗大',
    reason: '50cm×50cm以内に切れば可燃ごみ'
  },
  {
    item: 'カーテン',
    handling: '粗大',
    reason: '50cm×50cm以内に切れば可燃ごみ'
  },
  {
    item: 'ガスボンベ（プロパン）',
    handling: '受入不可',
    reason: '販売店に引き取ってもらうこと'
  },
  {
    item: 'ガスボンベ（カセット）',
    handling: '有害',
    reason: '中身を使い切ること'
  },
  {
    item: 'カセットテープ',
    handling: '可燃',
    reason: ''
  },
  {
    item: 'ガラス製品',
    handling: 'ビン',
    reason: '危険物のため紙に包んで出す'
  },
  {
    item: 'キーボード（パソコン用）',
    handling: '不燃',
    reason: ''
  },
  {
    item: '車椅子',
    handling: '粗大',
    reason: ''
  },
  {
    item: 'クリーニングの袋',
    handling: '資源プラ',
    reason: ''
  },
  {
    item: 'ゲーム機',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'コード類',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'ゴム手袋',
    handling: '可燃',
    reason: ''
  },
  {
    item: 'サランラップ',
    handling: '資源プラ',
    reason: '汚れているものは可燃ごみ'
  },
  {
    item: 'CD・DVD',
    handling: '可燃',
    reason: ''
  },
  {
    item: 'スプレー缶',
    handling: '有害',
    reason: '中身を使い切って穴を開けて出す'
  },
  {
    item: 'セロハンテープ',
    handling: '可燃',
    reason: ''
  },
  {
    item: '体温計（水銀式）',
    handling: '有害',
    reason: ''
  },
  {
    item: '体温計（デジタル式）',
    handling: '不燃',
    reason: ''
  },
  {
    item: '電池',
    handling: '有害',
    reason: ''
  },
  {
    item: '電球',
    handling: '不燃',
    reason: '紙に包んで出す'
  },
  {
    item: 'LED電球',
    handling: '不燃',
    reason: ''
  },
  {
    item: '蛍光灯',
    handling: '有害',
    reason: ''
  },
  {
    item: 'ドライヤー',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'ビデオテープ',
    handling: '可燃',
    reason: ''
  },
  {
    item: 'ファイル（金属部分あり）',
    handling: '不燃',
    reason: '金属部分を取り外せない場合'
  },
  {
    item: 'ファイル（プラスチック製）',
    handling: '可燃',
    reason: '金属部分を取り外した場合'
  },
  {
    item: 'プラスチック製おもちゃ',
    handling: '可燃',
    reason: ''
  },
  {
    item: 'ペットボトルのキャップ',
    handling: '資源プラ',
    reason: ''
  },
  {
    item: 'ペットボトルのラベル',
    handling: '資源プラ',
    reason: ''
  },
  {
    item: 'マウス（パソコン用）',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'マスク',
    handling: '可燃',
    reason: ''
  },
  {
    item: 'ライター',
    handling: '有害',
    reason: '中身を使いきること'
  },
  {
    item: 'テレビ',
    handling: '受入不可',
    reason: '家電リサイクル法対象品目のため、販売店又は指定業者等へ引き取りの依頼をすること。分解した物も受入不可。ただし、火災などで原型をとどめない又は識別できない場合は、リサイクルの対象にはならないので受入可能（家電製品協会に確認済。）。'
  },
  {
    item: '冷蔵庫・冷凍庫',
    handling: '受入不可',
    reason: '家電リサイクル法対象品目のため、販売店又は指定業者等へ引き取りの依頼をすること。分解した物も受入不可。ただし、火災などで原型をとどめない又は識別できない場合は、リサイクルの対象にはならないので受入可能（家電製品協会に確認済。）。'
  },
  {
    item: '洗濯機・衣類乾燥機',
    handling: '受入不可',
    reason: '家電リサイクル法対象品目のため、販売店又は指定業者等へ引き取りの依頼をすること。分解した物も受入不可。ただし、火災などで原型をとどめない又は識別できない場合は、リサイクルの対象にはならないので受入可能（家電製品協会に確認済。）。'
  },
  {
    item: 'パソコン',
    handling: '受入不可',
    reason: 'ＰＣリサイクル制度により、各メーカーによる引き取り。ただし、自作又は撤退メーカーのもの等は、「一般社団法人パソコン３R推進協会（電話：044-540-0576）」で引き取る。'
  },
  {
    item: '食用油のペットボトル',
    handling: 'ペット',
    reason: '中身を使い切り、洗って出すこと'
  },
  {
    item: 'タブレット端末',
    handling: '不燃',
    reason: ''
  },
  {
    item: 'だるま',
    handling: '可燃',
    reason: '目玉は不燃ごみ'
  },
  {
    item: '断熱材',
    handling: '受入不可',
    reason: '建築廃材であるため'
  },
  {
    item: 'マスキングテープ（塗装業関係）',
    handling: '受入不可',
    reason: '産業廃棄物のため'
  },
  {
    item: 'マッチ',
    handling: '可燃',
    reason: '水で十分に濡らすこと'
  },
  {
    item: 'まな板（プラスチック製）',
    handling: '不燃',
    reason: '圧縮梱包できない。そのまま焼却すると燃え固まるので破砕してから焼却する。'
  },
  {
    item: 'マヨネーズの容器',
    handling: '資源プラ・可燃',
    reason: '洗って汚れが取れていれば資源プラ。汚れが残っていれば可燃ごみ'
  },
  {
    item: 'ミシン',
    handling: '粗大',
    reason: ''
  },
  {
    item: 'めがね',
    handling: '不燃',
    reason: ''
  },
  {
    item: '毛布',
    handling: '粗大',
    reason: '市の集団回収を推進、50cm×50cm以内に切れば可燃ごみ'
  },
  {
    item: 'モーター',
    handling: '不燃',
    reason: '２０cm×１５cm×１５cm以内のみ可能で、それ以上又は工業用は受入不可とする。'
  },
  {
    item: '物置（金属製の組み立て式）',
    handling: '粗大',
    reason: '幅９０cm×高さ２ｍ以内までで、それ以上は分解すれば受入可とする。'
  },
  {
    item: '物干し竿・台',
    handling: '粗大',
    reason: '台に使用するコンクリートや石は受入不可とする。'
  },
  {
    item: '野球のバット(金属・木製)',
    handling: '粗大',
    reason: ''
  },
  {
    item: '薬剤のプラ袋（糖尿病、人工透析、ストマ等）',
    handling: '可燃',
    reason: '在宅医療に限る。注射器・注射針がないこと'
  },
  {
    item: '薬品類（劇毒物）',
    handling: '受入不可',
    reason: 'ビン等の容器を含む。毒物への対応ができないため'
  },
  {
    item: '湯沸かし器',
    handling: '粗大',
    reason: ''
  },
  {
    item: '養生シート（一般家庭）',
    handling: '資源プラ',
    reason: '汚れを取り除き５０cm×５０cm以内に切って出すこと'
  },
  {
    item: '浴槽（ステンレス、ホーロー、ＦＲＰ製）',
    handling: '受入不可',
    reason: '購入店等で引き取ってもらうこと'
  },
  {
    item: 'よしず',
    handling: '粗大',
    reason: '５０cm×５０cm以内に切断すれば可燃ごみ'
  },
  {
    item: 'ラジカセ',
    handling: '不燃',
    reason: '一斗缶サイズを超える大きさのものは粗大ごみ'
  },
  {
    item: 'ラップ',
    handling: '資源プラ',
    reason: '汚れているものは可燃ごみ'
  },
  {
    item: 'ラムネのビン',
    handling: 'ビン',
    reason: '中のビー玉はそのままでよい。'
  },
  {
    item: 'ランドセル',
    handling: '可燃',
    reason: '金具部分は不燃ごみ。金属部分を外さないものは不燃ごみ'
  },
  {
    item: 'ルーフボックス',
    handling: '粗大',
    reason: 'エアロボックスについても粗大ごみとする。'
  },
  {
    item: 'レジ袋',
    handling: '資源プラ・可燃',
    reason: '洗って汚れが取れていれば資源プラ。ただし、汚れが残っていれば可燃ごみとして取り扱う。'
  },
  {
    item: 'レンガ',
    handling: '受入不可',
    reason: '建築廃材であるため'
  },
  {
    item: 'レンジフードフィルター（ガラス繊維）',
    handling: '不燃',
    reason: '家庭系に限る。'
  },
  {
    item: 'ローソク（家庭で使用した物）',
    handling: '可燃',
    reason: '少量であれば、可燃ごみとして処理する。'
  },
  {
    item: 'ワープロ',
    handling: '粗大',
    reason: '卓上型も、一斗缶を超える大きさのものは粗大ごみ'
  },
  {
    item: 'ワイヤーネット（ハンガーネット）',
    handling: '粗大・不燃',
    reason: ''
  },
  {
    item: 'ワックス（固形）',
    handling: '可燃',
    reason: ''
  },
  {
    item: '割れたビン',
    handling: 'ビン',
    reason: '透明・白色半透明袋に入れること'
  }
];