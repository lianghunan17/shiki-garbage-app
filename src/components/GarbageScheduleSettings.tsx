import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// ゴミの種類
const garbageTypes = [
  { id: 'burnable', name: '燃えるゴミ', color: '#ff5722' },
  { id: 'non-burnable', name: '燃えないゴミ', color: '#607d8b' },
  { id: 'recyclable', name: '資源ゴミ', color: '#4caf50' },
  { id: 'plastic', name: 'プラスチック', color: '#2196f3' },
  { id: 'paper', name: '古紙', color: '#ff9800' },
  { id: 'glass', name: 'ビン・缶', color: '#9c27b0' },
  { id: 'large', name: '粗大ゴミ', color: '#795548' }
];

// 曜日
const weekdays = [
  { id: 0, name: '日曜日', short: '日' },
  { id: 1, name: '月曜日', short: '月' },
  { id: 2, name: '火曜日', short: '火' },
  { id: 3, name: '水曜日', short: '水' },
  { id: 4, name: '木曜日', short: '木' },
  { id: 5, name: '金曜日', short: '金' },
  { id: 6, name: '土曜日', short: '土' }
];

// 週の指定（第何週）
const weekNumbers = [
  { id: 'every', name: '毎週' },
  { id: '1', name: '第1週' },
  { id: '2', name: '第2週' },
  { id: '3', name: '第3週' },
  { id: '4', name: '第4週' },
  { id: '1,3', name: '第1・3週' },
  { id: '2,4', name: '第2・4週' }
];

interface GarbageSchedule {
  id: string;
  garbageType: string;
  weekday: number;
  weekNumber: string;
  time: string;
}

interface GarbageScheduleSettingsProps {
  onScheduleChange: (schedules: GarbageSchedule[]) => void;
}

const GarbageScheduleSettings: React.FC<GarbageScheduleSettingsProps> = ({ onScheduleChange }) => {
  const [schedules, setSchedules] = useState<GarbageSchedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<Partial<GarbageSchedule>>({
    garbageType: '',
    weekday: 1,
    weekNumber: 'every',
    time: '08:00'
  });

  const handleAddSchedule = () => {
    if (!newSchedule.garbageType) {
      return;
    }

    const schedule: GarbageSchedule = {
      id: Date.now().toString(),
      garbageType: newSchedule.garbageType!,
      weekday: newSchedule.weekday!,
      weekNumber: newSchedule.weekNumber!,
      time: newSchedule.time!
    };

    const updatedSchedules = [...schedules, schedule];
    setSchedules(updatedSchedules);
    onScheduleChange(updatedSchedules);

    // フォームをリセット
    setNewSchedule({
      garbageType: '',
      weekday: 1,
      weekNumber: 'every',
      time: '08:00'
    });
  };

  const handleDeleteSchedule = (id: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
    setSchedules(updatedSchedules);
    onScheduleChange(updatedSchedules);
  };

  const getGarbageTypeName = (typeId: string) => {
    return garbageTypes.find(type => type.id === typeId)?.name || typeId;
  };

  const getGarbageTypeColor = (typeId: string) => {
    return garbageTypes.find(type => type.id === typeId)?.color || '#666';
  };

  const getWeekdayName = (weekdayId: number) => {
    return weekdays.find(day => day.id === weekdayId)?.name || '';
  };

  const getWeekNumberName = (weekNumberId: string) => {
    return weekNumbers.find(week => week.id === weekNumberId)?.name || '';
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        ゴミ出し日設定
      </Typography>

      {/* 新しいスケジュール追加フォーム */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            新しいゴミ出し日を追加
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ゴミの種類</InputLabel>
                <Select
                  value={newSchedule.garbageType || ''}
                  label="ゴミの種類"
                  onChange={(e: SelectChangeEvent) => 
                    setNewSchedule({ ...newSchedule, garbageType: e.target.value })
                  }
                >
                  {garbageTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: type.color
                          }}
                        />
                        {type.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>曜日</InputLabel>
                <Select
                  value={newSchedule.weekday?.toString() || '1'}
                  label="曜日"
                  onChange={(e: SelectChangeEvent) => 
                    setNewSchedule({ ...newSchedule, weekday: parseInt(e.target.value) })
                  }
                >
                  {weekdays.map((day) => (
                    <MenuItem key={day.id} value={day.id.toString()}>
                      {day.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>頻度</InputLabel>
                <Select
                  value={newSchedule.weekNumber || 'every'}
                  label="頻度"
                  onChange={(e: SelectChangeEvent) => 
                    setNewSchedule({ ...newSchedule, weekNumber: e.target.value })
                  }
                >
                  {weekNumbers.map((week) => (
                    <MenuItem key={week.id} value={week.id}>
                      {week.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <input
                  type="time"
                  value={newSchedule.time || '08:00'}
                  onChange={(e) => 
                    setNewSchedule({ ...newSchedule, time: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                variant="contained"
                onClick={handleAddSchedule}
                disabled={!newSchedule.garbageType}
                startIcon={<AddIcon />}
                size="small"
              >
                追加
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 設定済みスケジュール一覧 */}
      {schedules.length === 0 ? (
        <Alert severity="info">
          ゴミ出し日が設定されていません。上記のフォームから追加してください。
        </Alert>
      ) : (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            設定済みのゴミ出し日
          </Typography>
          <Grid container spacing={2}>
            {schedules.map((schedule) => (
              <Grid item xs={12} sm={6} md={4} key={schedule.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        label={getGarbageTypeName(schedule.garbageType)}
                        sx={{
                          bgcolor: getGarbageTypeColor(schedule.garbageType),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                        size="small"
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {getWeekNumberName(schedule.weekNumber)} {getWeekdayName(schedule.weekday)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {schedule.time}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default GarbageScheduleSettings;