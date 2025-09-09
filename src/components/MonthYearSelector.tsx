import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  SelectChangeEvent,
  Grid
} from '@mui/material';

interface MonthYearSelectorProps {
  onDateChange: (year: number, month: number) => void;
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({ onDateChange }) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  // 年の選択肢（現在年から前後2年）
  const years = [];
  for (let i = currentDate.getFullYear() - 2; i <= currentDate.getFullYear() + 2; i++) {
    years.push(i);
  }

  // 月の選択肢
  const months = [
    { value: 1, label: '1月' },
    { value: 2, label: '2月' },
    { value: 3, label: '3月' },
    { value: 4, label: '4月' },
    { value: 5, label: '5月' },
    { value: 6, label: '6月' },
    { value: 7, label: '7月' },
    { value: 8, label: '8月' },
    { value: 9, label: '9月' },
    { value: 10, label: '10月' },
    { value: 11, label: '11月' },
    { value: 12, label: '12月' }
  ];

  const handleYearChange = (event: SelectChangeEvent) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    onDateChange(year, selectedMonth);
  };

  const handleMonthChange = (event: SelectChangeEvent) => {
    const month = parseInt(event.target.value);
    setSelectedMonth(month);
    onDateChange(selectedYear, month);
  };

  // 初期値を親コンポーネントに通知
  React.useEffect(() => {
    onDateChange(selectedYear, selectedMonth);
  }, []);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        年月選択
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        収集日程表を表示する年月を選択してください
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="year-label">年</InputLabel>
            <Select
              labelId="year-label"
              value={selectedYear.toString()}
              label="年"
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year.toString()}>
                  {year}年
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="month-label">月</InputLabel>
            <Select
              labelId="month-label"
              value={selectedMonth.toString()}
              label="月"
              onChange={handleMonthChange}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="primary">
          選択された期間: {selectedYear}年{selectedMonth}月
        </Typography>
      </Box>
    </Paper>
  );
};

export default MonthYearSelector;