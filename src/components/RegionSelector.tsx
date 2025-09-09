import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  SelectChangeEvent
} from '@mui/material';

// 都道府県データ
const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// 主要市区町村データ（サンプル）
const municipalities: { [key: string]: string[] } = {
  '東京都': [
    '千代田区', '中央区', '港区', '新宿区', '文京区', '台東区', '墨田区',
    '江東区', '品川区', '目黒区', '大田区', '世田谷区', '渋谷区', '中野区',
    '杉並区', '豊島区', '北区', '荒川区', '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区',
    '八王子市', '立川市', '武蔵野市', '三鷹市', '青梅市', '府中市', '昭島市',
    '調布市', '町田市', '小金井市', '小平市', '日野市', '東村山市', '国分寺市',
    '国立市', '福生市', '狛江市', '東大和市', '清瀬市', '東久留米市', '武蔵村山市',
    '多摩市', '稲城市', 'あきる野市', '西東京市'
  ],
  '神奈川県': [
    '横浜市', '川崎市', '相模原市', '横須賀市', '平塚市', '鎌倉市', '藤沢市',
    '小田原市', '茅ヶ崎市', '逗子市', '三浦市', '秦野市', '厚木市', '大和市',
    '伊勢原市', '海老名市', '座間市', '南足柄市', '綾瀬市'
  ],
  '大阪府': [
    '大阪市', '堺市', '岸和田市', '豊中市', '池田市', '吹田市', '泉大津市',
    '高槻市', '貝塚市', '守口市', '枚方市', '茨木市', '八尾市', '泉佐野市',
    '富田林市', '寝屋川市', '河内長野市', '松原市', '大東市', '和泉市',
    '箕面市', '柏原市', '羽曳野市', '門真市', '摂津市', '高石市', '藤井寺市',
    '東大阪市', '泉南市', '四條畷市', '交野市', '大阪狭山市', '阪南市'
  ]
};

interface RegionSelectorProps {
  onRegionChange: (prefecture: string, municipality: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ onRegionChange }) => {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');

  const handlePrefectureChange = (event: SelectChangeEvent) => {
    const prefecture = event.target.value;
    setSelectedPrefecture(prefecture);
    setSelectedMunicipality(''); // 都道府県が変わったら市区町村をリセット
    onRegionChange(prefecture, '');
  };

  const handleMunicipalityChange = (event: SelectChangeEvent) => {
    const municipality = event.target.value;
    setSelectedMunicipality(municipality);
    onRegionChange(selectedPrefecture, municipality);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        地域選択
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="prefecture-label">都道府県</InputLabel>
          <Select
            labelId="prefecture-label"
            value={selectedPrefecture}
            label="都道府県"
            onChange={handlePrefectureChange}
          >
            {prefectures.map((prefecture) => (
              <MenuItem key={prefecture} value={prefecture}>
                {prefecture}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} disabled={!selectedPrefecture}>
          <InputLabel id="municipality-label">市区町村</InputLabel>
          <Select
            labelId="municipality-label"
            value={selectedMunicipality}
            label="市区町村"
            onChange={handleMunicipalityChange}
          >
            {selectedPrefecture && municipalities[selectedPrefecture] ? (
              municipalities[selectedPrefecture].map((municipality) => (
                <MenuItem key={municipality} value={municipality}>
                  {municipality}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">
                都道府県を選択してください
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>
      
      {selectedPrefecture && selectedMunicipality && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          選択中: {selectedPrefecture} {selectedMunicipality}
        </Typography>
      )}
    </Paper>
  );
};

export default RegionSelector;