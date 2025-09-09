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
import { SHIKI_AREAS, GarbageScheduleData, SHIKI_GARBAGE_SCHEDULE } from '../data/shikiGarbageData';

interface ShikiAreaSelectorProps {
  onAreaChange: (areaData: GarbageScheduleData | null) => void;
}

const ShikiAreaSelector: React.FC<ShikiAreaSelectorProps> = ({ onAreaChange }) => {
  const [selectedArea, setSelectedArea] = useState<string>('');

  const handleAreaChange = (event: SelectChangeEvent) => {
    const area = event.target.value;
    setSelectedArea(area);
    
    // 選択された地域のデータを取得
    const areaData = SHIKI_GARBAGE_SCHEDULE.find(schedule => schedule.area === area);
    onAreaChange(areaData || null);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        埼玉県志木市 - 地域選択
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        お住まいの地域を選択してください
      </Typography>
      
      <FormControl fullWidth>
        <InputLabel id="area-label">地域</InputLabel>
        <Select
          labelId="area-label"
          value={selectedArea}
          label="地域"
          onChange={handleAreaChange}
        >
          {SHIKI_AREAS.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedArea && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            選択された地域: {selectedArea}
          </Typography>
          {(() => {
            const areaData = SHIKI_GARBAGE_SCHEDULE.find(schedule => schedule.area === selectedArea);
            if (!areaData) return null;
            
            return (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>リサイクル資源:</strong> {areaData.recyclable}
                </Typography>
                <Typography variant="body2">
                  <strong>資源プラスチック:</strong> {areaData.plasticResource}
                </Typography>
                <Typography variant="body2">
                  <strong>可燃ごみ:</strong> {areaData.burnable}
                </Typography>
                <Typography variant="body2">
                  <strong>不燃ごみ:</strong> {areaData.nonBurnable}
                </Typography>
              </Box>
            );
          })()} 
        </Box>
      )}
    </Paper>
  );
};

export default ShikiAreaSelector;