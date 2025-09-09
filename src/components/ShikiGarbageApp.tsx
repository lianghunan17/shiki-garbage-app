import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Card,
  CardContent,
  Button,
  Link
} from '@mui/material';
import ShikiAreaSelector from './ShikiAreaSelector';
import MonthYearSelector from './MonthYearSelector';
import GarbageScheduleCalendar from './GarbageScheduleCalendar';
import BulkyWasteFeeSearch from './BulkyWasteFeeSearch';
import { GarbageScheduleData } from '../data/shikiGarbageData';

const ShikiGarbageApp: React.FC = () => {
  const [selectedAreaData, setSelectedAreaData] = useState<GarbageScheduleData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const handleAreaChange = (areaData: GarbageScheduleData | null) => {
    setSelectedAreaData(areaData);
  };

  const handleDateChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🗑️ 志木市ゴミ収集日程表
        </Typography>
        <Typography variant="subtitle1">
          埼玉県志木市のゴミ収集スケジュールを確認できます
        </Typography>
      </Paper>

      {/* 地域選択 */}
      <ShikiAreaSelector onAreaChange={handleAreaChange} />
      
      <Divider sx={{ my: 2 }} />
      
      {/* 年月選択 */}
      <MonthYearSelector onDateChange={handleDateChange} />
      
      <Divider sx={{ my: 2 }} />
      
      {/* カレンダー表示 */}
      <GarbageScheduleCalendar 
        areaData={selectedAreaData}
        year={selectedYear}
        month={selectedMonth}
      />
      
      {/* フッター */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ※ 収集日程は変更される場合があります。最新の情報は志木市公式サイトでご確認ください。
        </Typography>
      </Box>

      {/* 粗大ごみ料金検索 */}
      <Box sx={{ mt: 4 }}>
        <BulkyWasteFeeSearch />
      </Box>

      {/* 粗大ごみ申し込み情報 */}
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            粗大ごみの申し込み方法
          </Typography>
          
          <Card sx={{ mt: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                申込先：志木市粗大ごみ等受付センター
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  申し込み方法：
                </Typography>
                
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    📞 <strong>受付専用ダイヤル：048-473-5311</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    （平日午前8時30分から午後5時15分まで）
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    💻 <strong>インターネット申し込み：</strong>
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ mb: 2 }}
                    onClick={() => window.open('https://www.city.shiki.lg.jp/soshiki/16/1215.html', '_blank')}
                  >
                    志木市粗大ごみ申し込みページを開く
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  ⚠️ 注意事項：
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • 申し込みから回収まで2週間以上かかる場合があります
                </Typography>
                <Typography variant="body2">
                  • 引っ越し等の予定がある方は、日にちに余裕をもってお申し込みください
                </Typography>
                <Typography variant="body2">
                  • 1回に回収できる粗大ごみは5点まで
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link 
              href="https://www.city.shiki.lg.jp/soshiki/16/1215.html" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ fontSize: '0.9rem' }}
            >
              詳細情報は志木市公式サイトをご確認ください
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ShikiGarbageApp;