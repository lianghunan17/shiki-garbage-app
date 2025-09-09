import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { CalendarMonth as CalendarIcon, Add as AddIcon } from '@mui/icons-material';
import RegionSelector from './RegionSelector';
import GarbageScheduleSettings from './GarbageScheduleSettings';
import CalendarMCPService from '../services/calendarService';

interface GarbageSchedule {
  id: string;
  garbageType: string;
  weekday: number;
  weekNumber: string;
  time: string;
}

const GarbageCalendar: React.FC = () => {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [schedules, setSchedules] = useState<GarbageSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [calendarDialog, setCalendarDialog] = useState<boolean>(false);
  const [calendarSettings, setCalendarSettings] = useState({
    startDate: new Date().toISOString().split('T')[0],
    months: 3
  });
  
  const calendarService = new CalendarMCPService();

  const handleRegionChange = (prefecture: string, municipality: string) => {
    setSelectedPrefecture(prefecture);
    setSelectedMunicipality(municipality);
  };

  const handleScheduleChange = (newSchedules: GarbageSchedule[]) => {
    setSchedules(newSchedules);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateCalendarEvents = async () => {
    if (!selectedPrefecture || !selectedMunicipality) {
      showSnackbar('地域を選択してください', 'error');
      return;
    }

    if (schedules.length === 0) {
      showSnackbar('ゴミ出し日を設定してください', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const createdEvents = [];
      
      for (const schedule of schedules) {
        const events = await calendarService.createRecurringGarbageEvents({
          garbageType: schedule.garbageType,
          prefecture: selectedPrefecture,
          municipality: selectedMunicipality,
          weekday: schedule.weekday,
          weekNumber: schedule.weekNumber,
          time: schedule.time,
          startDate: calendarSettings.startDate,
          months: calendarSettings.months
        });
        
        createdEvents.push(...events);
      }
      
      showSnackbar(
        `${createdEvents.length}件のゴミ出し日イベントをカレンダーに追加しました`,
        'success'
      );
      setCalendarDialog(false);
    } catch (error) {
      console.error('Failed to create calendar events:', error);
      showSnackbar(
        'カレンダーイベントの作成に失敗しました。MCPサーバーが起動しているか確認してください。',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const canCreateCalendar = selectedPrefecture && selectedMunicipality && schedules.length > 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <CalendarIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          ゴミ出しカレンダー作成
        </Typography>
        <Typography variant="subtitle1">
          地域のゴミ出し日をGoogle Calendarに登録して、忘れずにゴミ出しをしましょう
        </Typography>
      </Paper>

      {/* ステップ1: 地域選択 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            1
          </Box>
          地域を選択
        </Typography>
        <RegionSelector onRegionChange={handleRegionChange} />
      </Box>

      {/* ステップ2: ゴミ出し日設定 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: selectedPrefecture && selectedMunicipality ? 'primary.main' : 'grey.400',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            2
          </Box>
          ゴミ出し日を設定
        </Typography>
        {selectedPrefecture && selectedMunicipality ? (
          <GarbageScheduleSettings onScheduleChange={handleScheduleChange} />
        ) : (
          <Alert severity="info">
            まず地域を選択してください
          </Alert>
        )}
      </Box>

      {/* ステップ3: カレンダー作成 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: canCreateCalendar ? 'primary.main' : 'grey.400',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            3
          </Box>
          Google Calendarに登録
        </Typography>
        <Paper sx={{ p: 3 }}>
          {canCreateCalendar ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                設定が完了しました。Google Calendarにゴミ出し日を登録しますか？
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setCalendarDialog(true)}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'カレンダーに登録'
                )}
              </Button>
            </Box>
          ) : (
            <Alert severity="info">
              地域選択とゴミ出し日設定を完了してください
            </Alert>
          )}
        </Paper>
      </Box>

      {/* カレンダー設定ダイアログ */}
      <Dialog open={calendarDialog} onClose={() => setCalendarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>カレンダー登録設定</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="開始日"
              type="date"
              value={calendarSettings.startDate}
              onChange={(e) => setCalendarSettings({ ...calendarSettings, startDate: e.target.value })}
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>登録期間</InputLabel>
              <Select
                value={calendarSettings.months}
                label="登録期間"
                onChange={(e) => setCalendarSettings({ ...calendarSettings, months: Number(e.target.value) })}
              >
                <MenuItem value={1}>1ヶ月</MenuItem>
                <MenuItem value={3}>3ヶ月</MenuItem>
                <MenuItem value={6}>6ヶ月</MenuItem>
                <MenuItem value={12}>1年</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {selectedPrefecture} {selectedMunicipality}の{schedules.length}種類のゴミ出し日を
              {calendarSettings.months}ヶ月分登録します。
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarDialog(false)}>キャンセル</Button>
          <Button
            onClick={handleCreateCalendarEvents}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : '登録'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GarbageCalendar;