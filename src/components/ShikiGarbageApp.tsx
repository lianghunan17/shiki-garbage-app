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
  Link,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Event as EventIcon, PowerSettingsNew as PowerIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ShikiAreaSelector from './ShikiAreaSelector';
import MonthYearSelector from './MonthYearSelector';
import GarbageScheduleCalendar from './GarbageScheduleCalendar';
import BulkyWasteFeeSearch from './BulkyWasteFeeSearch';
import BulkyWasteImageAnalyzerDemo from './BulkyWasteImageAnalyzerDemo';
import { GarbageScheduleData } from '../data/shikiGarbageData';

interface BulkyWasteSchedule {
  id: string;
  date: string;
  memo: string;
  createdAt: Date;
}

const ShikiGarbageApp: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAreaData, setSelectedAreaData] = useState<GarbageScheduleData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  // 粗大ごみ日程管理
  const [bulkyWasteSchedules, setBulkyWasteSchedules] = useState<BulkyWasteSchedule[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newScheduleMemo, setNewScheduleMemo] = useState('');
  const [calendarMessage, setCalendarMessage] = useState('');
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  const handleAreaChange = (areaData: GarbageScheduleData | null) => {
    setSelectedAreaData(areaData);
  };

  const handleDateChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // 粗大ごみ日程追加
  const handleAddBulkyWasteSchedule = () => {
    if (!newScheduleDate || !newScheduleMemo.trim()) {
      setCalendarMessage('日付とメモを入力してください');
      return;
    }

    // 日付の妥当性チェック
    const testDate = new Date(newScheduleDate);
    if (isNaN(testDate.getTime())) {
      setCalendarMessage('有効な日付を入力してください');
      return;
    }

    const newSchedule: BulkyWasteSchedule = {
      id: Date.now().toString(),
      date: newScheduleDate,
      memo: newScheduleMemo.trim(),
      createdAt: new Date()
    };

    setBulkyWasteSchedules(prev => [...prev, newSchedule]);
    setNewScheduleDate('');
    setNewScheduleMemo('');
    setIsAddDialogOpen(false);
    setCalendarMessage('粗大ごみ日程を追加しました');
  };

  // 粗大ごみ日程削除
  const handleDeleteBulkyWasteSchedule = (id: string) => {
    setBulkyWasteSchedules(prev => prev.filter(schedule => schedule.id !== id));
    setCalendarMessage('粗大ごみ日程を削除しました');
  };

  // サーバーシャットダウン機能
  const handleShutdown = async () => {
    if (!window.confirm('アプリケーションを終了しますか？\n\n※ 全てのサーバー（Ollama、MCP、React）が停止します。')) {
      return;
    }

    setIsShuttingDown(true);
    setCalendarMessage('サーバーをシャットダウンしています...');

    try {
      const response = await fetch('http://localhost:8091/shutdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCalendarMessage('✅ サーバーが正常にシャットダウンされました');
        
        // 3秒後にページを閉じる
        setTimeout(() => {
          window.close();
        }, 3000);
      } else {
        throw new Error('シャットダウンに失敗しました');
      }
    } catch (error) {
      console.error('シャットダウンエラー:', error);
      setCalendarMessage('❌ シャットダウンに失敗しました。ターミナルでCtrl+Cを押してください。');
      setIsShuttingDown(false);
    }
  };

  // Google Calendarに登録
  const handleAddToGoogleCalendar = async (schedule: BulkyWasteSchedule) => {
    try {
      const eventDate = new Date(schedule.date);
      
      // 日付の妥当性チェック
      if (isNaN(eventDate.getTime())) {
        setCalendarMessage('無効な日付です');
        return;
      }
      
      const eventTitle = `粗大ごみ回収: ${schedule.memo}`;
      const eventDescription = `志木市粗大ごみ回収\n品目: ${schedule.memo}\n\n※事前に申し込みが必要です\n申込先: 048-473-5311`;
      
      // Google Calendar URLを生成
      const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent('志木市')}`;
      
      window.open(googleCalendarUrl, '_blank');
      setCalendarMessage('Google Calendarを開きました');
    } catch (error) {
      console.error('Google Calendar連携エラー:', error);
      setCalendarMessage('Google Calendar連携でエラーが発生しました');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              🗑️ 志木市ゴミ収集日程表
            </Typography>
            <Typography variant="subtitle1">
              埼玉県志木市のゴミ収集スケジュールを確認できます
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<PowerIcon />}
            onClick={handleShutdown}
            disabled={isShuttingDown}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: '#ffcdd2',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.5)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            {isShuttingDown ? 'シャットダウン中...' : 'アプリ終了'}
          </Button>
        </Box>
      </Paper>

      {/* 地域選択 */}
      <ShikiAreaSelector onAreaChange={handleAreaChange} />
      
      <Divider sx={{ my: 2 }} />
      
      {/* 年月選択 */}
      <MonthYearSelector onDateChange={handleDateChange} />
      
      {/* 粗大ごみ日程追加セクション */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            粗大ごみ日程管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
          >
            日程追加
          </Button>
        </Box>

        {bulkyWasteSchedules.length > 0 ? (
          <List>
            {bulkyWasteSchedules
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((schedule) => (
                <ListItem key={schedule.id} divider>
                  <ListItemText
                    primary={`${new Date(schedule.date).toLocaleDateString('ja-JP')} - ${schedule.memo}`}
                    secondary={`追加日: ${schedule.createdAt.toLocaleDateString('ja-JP')}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleAddToGoogleCalendar(schedule)}
                      sx={{ mr: 1, color: '#4285f4' }}
                      title="Google Calendarに追加"
                    >
                      <EventIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteBulkyWasteSchedule(schedule.id)}
                      sx={{ color: '#f44336' }}
                      title="削除"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            }
          </List>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            粗大ごみの日程が登録されていません
          </Typography>
        )}
      </Paper>
      
      <Divider sx={{ my: 2 }} />
      
      {/* カレンダー表示 */}
      <GarbageScheduleCalendar
          areaData={selectedAreaData}
          year={selectedYear}
          month={selectedMonth}
          bulkyWasteSchedules={bulkyWasteSchedules}
        />
      
      {/* 粗大ごみ日程追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>粗大ごみ日程を追加</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="回収予定日"
            type="date"
            fullWidth
            variant="outlined"
            value={newScheduleDate}
            onChange={(e) => setNewScheduleDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="品目・メモ"
            fullWidth
            variant="outlined"
            value={newScheduleMemo}
            onChange={(e) => setNewScheduleMemo(e.target.value)}
            placeholder="例：冷蔵庫、ソファ、机など"
            multiline
            rows={3}
          />
          {calendarMessage && (
            <Typography variant="body2" sx={{ mt: 2, color: '#1976d2' }}>
              {calendarMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleAddBulkyWasteSchedule} variant="contained">
            追加
          </Button>
        </DialogActions>
      </Dialog>

        {/* メッセージ表示 */}
        <Snackbar
          open={!!calendarMessage}
          autoHideDuration={3000}
          onClose={() => setCalendarMessage('')}
          message={calendarMessage}
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

      {/* AI画像分析デモ */}
      <Box sx={{ mt: 4 }}>
        <BulkyWasteImageAnalyzerDemo />
      </Box>



      {/* 判断に迷うごみ検索 */}
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            🤔 判断に迷うごみの一覧表
          </Typography>
          
          <Card sx={{ mt: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                ごみの分別に迷った時はこちら
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                品目名で検索して、正しい分別方法を確認できます。
              </Typography>
              
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                onClick={() => navigate('/confusing-waste')}
                sx={{ 
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 3
                }}
              >
                📋 判断に迷うごみを検索する
              </Button>
              
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  💡 検索機能で品目名、取扱方法、理由から該当するごみを見つけられます
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Paper>
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