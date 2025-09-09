import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import {
  GarbageScheduleData,
  getWeekdayNumber,
  parseWeekSpecification,
  parseMultipleWeekdays
} from '../data/shikiGarbageData';

interface GarbageScheduleCalendarProps {
  areaData: GarbageScheduleData | null;
  year: number;
  month: number;
}

interface GarbageEvent {
  date: number;
  type: string;
  color: string;
  id: string;
}

interface SelectedEvent {
  id: string;
  date: number;
  type: string;
  typeName: string;
  year: number;
  month: number;
}

const GarbageScheduleCalendar: React.FC<GarbageScheduleCalendarProps> = ({
  areaData,
  year,
  month
}) => {
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // イベント選択のハンドラー
  const handleEventSelect = (event: GarbageEvent, checked: boolean) => {
    if (checked) {
      const selectedEvent: SelectedEvent = {
        id: event.id,
        date: event.date,
        type: event.type,
        typeName: garbageTypes[event.type as keyof typeof garbageTypes].name,
        year,
        month
      };
      setSelectedEvents(prev => [...prev, selectedEvent]);
    } else {
      setSelectedEvents(prev => prev.filter(e => e.id !== event.id));
    }
  };

  // Google Calendarに登録
  const handleRegisterToCalendar = async () => {
    if (selectedEvents.length === 0) {
      setSnackbarMessage('登録するイベントを選択してください');
      setSnackbarOpen(true);
      return;
    }

    setIsRegistering(true);
    try {
      // CalendarMCPServiceをインポートして使用
      const CalendarMCPService = (await import('../services/calendarService')).default;
      const calendarService = new CalendarMCPService();

      for (const event of selectedEvents) {
        const eventDate = new Date(event.year, event.month - 1, event.date);
        const startDate = eventDate.toISOString().split('T')[0];
        const endDate = startDate;

        await calendarService.createEvent({
          title: `${event.typeName} 収集日`,
          description: `志木市 ${areaData?.area} - ${event.typeName}の収集日です`,
          startDate: `${startDate}T08:30:00`,
          endDate: `${startDate}T09:00:00`,
          location: `志木市 ${areaData?.area}`,
          reminders: [{
            method: 'popup',
            minutes: 60
          }]
        });
      }

      setSnackbarMessage(`${selectedEvents.length}件のイベントをGoogle Calendarに登録しました`);
      setSelectedEvents([]);
    } catch (error) {
      console.error('Calendar registration error:', error);
      setSnackbarMessage('Google Calendarへの登録に失敗しました');
    } finally {
      setIsRegistering(false);
      setSnackbarOpen(true);
    }
  };

  // ゴミの種類と色の定義
  const garbageTypes = {
    recyclable: { name: 'リサイクル資源', color: '#4caf50' },
    plasticResource: { name: '資源プラスチック', color: '#2196f3' },
    burnable: { name: '可燃ごみ', color: '#ff5722' },
    nonBurnable: { name: '不燃ごみ', color: '#607d8b' }
  };

  // 指定された年月の日数を取得
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // 指定された日付の曜日を取得
  const getWeekday = (year: number, month: number, day: number): number => {
    return new Date(year, month - 1, day).getDay();
  };

  // 第N週の日付を計算
  const getNthWeekdayDates = (year: number, month: number, weekday: number, weeks: number[]): number[] => {
    const dates: number[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    
    for (let day = 1; day <= daysInMonth; day++) {
      if (getWeekday(year, month, day) === weekday) {
        const weekOfMonth = Math.ceil(day / 7);
        if (weeks.includes(weekOfMonth)) {
          dates.push(day);
        }
      }
    }
    
    return dates;
  };

  // 毎週の指定曜日の日付を取得
  const getWeeklyDates = (year: number, month: number, weekdays: number[]): number[] => {
    const dates: number[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayWeekday = getWeekday(year, month, day);
      if (weekdays.includes(dayWeekday)) {
        dates.push(day);
      }
    }
    
    return dates;
  };

  // ゴミ収集日程を計算
  const calculateGarbageEvents = (): GarbageEvent[] => {
    if (!areaData) return [];
    
    const events: GarbageEvent[] = [];
    
    // リサイクル資源
    const recyclableWeekdays = parseMultipleWeekdays(areaData.recyclable);
    const recyclableDates = getWeeklyDates(year, month, recyclableWeekdays);
    recyclableDates.forEach(date => {
      events.push({
        date,
        type: 'recyclable',
        color: garbageTypes.recyclable.color,
        id: `${year}-${month}-${date}-recyclable`
      });
    });
    
    // 資源プラスチック
    const plasticWeekdays = parseMultipleWeekdays(areaData.plasticResource);
    const plasticDates = getWeeklyDates(year, month, plasticWeekdays);
    plasticDates.forEach(date => {
      events.push({
        date,
        type: 'plasticResource',
        color: garbageTypes.plasticResource.color,
        id: `${year}-${month}-${date}-plasticResource`
      });
    });
    
    // 可燃ごみ
    const burnableWeekdays = parseMultipleWeekdays(areaData.burnable);
    const burnableDates = getWeeklyDates(year, month, burnableWeekdays);
    burnableDates.forEach(date => {
      events.push({
        date,
        type: 'burnable',
        color: garbageTypes.burnable.color,
        id: `${year}-${month}-${date}-burnable`
      });
    });
    
    // 不燃ごみ（第N週の指定）
    const nonBurnableWeeks = parseWeekSpecification(areaData.nonBurnable);
    if (nonBurnableWeeks.length > 0) {
      // 不燃ごみの曜日を抽出（例：「第2水曜日・第4水曜日」から「水曜日」を抽出）
      const nonBurnableWeekdayMatch = areaData.nonBurnable.match(/(月|火|水|木|金|土|日)曜日/);
      if (nonBurnableWeekdayMatch) {
        const weekdayStr = nonBurnableWeekdayMatch[1] + '曜日';
        const weekday = getWeekdayNumber(weekdayStr);
        if (weekday !== -1) {
          const nonBurnableDates = getNthWeekdayDates(year, month, weekday, nonBurnableWeeks);
          nonBurnableDates.forEach(date => {
            events.push({
              date,
              type: 'nonBurnable',
              color: garbageTypes.nonBurnable.color,
              id: `${year}-${month}-${date}-nonBurnable`
            });
          });
        }
      }
    }
    
    return events.sort((a, b) => a.date - b.date);
  };

  const events = calculateGarbageEvents();
  const daysInMonth = getDaysInMonth(year, month);
  
  // カレンダーグリッドの作成
  const createCalendarGrid = () => {
    const firstDayWeekday = getWeekday(year, month, 1);
    const grid: (number | null)[] = [];
    
    // 月の最初の日までの空白
    for (let i = 0; i < firstDayWeekday; i++) {
      grid.push(null);
    }
    
    // 月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push(day);
    }
    
    return grid;
  };

  const calendarGrid = createCalendarGrid();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  if (!areaData) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          地域を選択してください
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {year}年{month}月 ゴミ収集日程表
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        地域: {areaData.area}
      </Typography>
      
      {/* 凡例 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          凡例:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(garbageTypes).map(([key, type]) => (
            <Chip
              key={key}
              label={type.name}
              sx={{ bgcolor: type.color, color: 'white' }}
              size="small"
            />
          ))}
        </Box>
      </Box>
      
      {/* カレンダー */}
      <Grid container spacing={1}>
        {/* 曜日ヘッダー */}
        {weekdays.map((day) => (
          <Grid item xs={12/7} key={day}>
            <Box sx={{ 
              textAlign: 'center', 
              fontWeight: 'bold', 
              p: 1,
              bgcolor: 'grey.100'
            }}>
              {day}
            </Box>
          </Grid>
        ))}
        
        {/* 日付セル */}
        {calendarGrid.map((day, index) => {
          const dayEvents = day ? events.filter(event => event.date === day) : [];
          
          return (
            <Grid item xs={12/7} key={index}>
              <Card sx={{ 
                minHeight: 80, 
                bgcolor: day ? 'white' : 'grey.50',
                border: day ? '1px solid #e0e0e0' : 'none'
              }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  {day && (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {day}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {dayEvents.map((event, eventIndex) => {
                          const isSelected = selectedEvents.some(e => e.id === event.id);
                          return (
                            <Box key={eventIndex} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={(e) => handleEventSelect(event, e.target.checked)}
                                sx={{ p: 0, '& .MuiSvgIcon-root': { fontSize: 14 } }}
                              />
                              <Chip
                                label={garbageTypes[event.type as keyof typeof garbageTypes].name}
                                size="small"
                                sx={{ 
                                  bgcolor: event.color, 
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  height: 18,
                                  flex: 1
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Google Calendar登録ボタン */}
      {selectedEvents.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleRegisterToCalendar}
            disabled={isRegistering}
            sx={{ minWidth: 200 }}
          >
            {isRegistering ? 'Google Calendarに登録中...' : `Google Calendarに登録 (${selectedEvents.length}件)`}
          </Button>
        </Box>
      )}

      {/* 収集日一覧 */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          今月の収集日一覧
        </Typography>
        {events.length > 0 ? (
          <Grid container spacing={2}>
            {Object.entries(garbageTypes).map(([key, type]) => {
              const typeEvents = events.filter(event => event.type === key);
              if (typeEvents.length === 0) return null;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ color: type.color, fontWeight: 'bold' }}>
                        {type.name}
                      </Typography>
                      <Typography variant="body2">
                        {typeEvents.map(event => `${event.date}日`).join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Alert severity="info">
            今月は収集日がありません
          </Alert>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default GarbageScheduleCalendar;