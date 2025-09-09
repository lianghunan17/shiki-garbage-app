import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface CalendarTestProps {
  onClose?: () => void;
}

const CalendarTest: React.FC<CalendarTestProps> = ({ onClose }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        MCP機能テスト
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          MCPサーバー機能
        </Typography>
        <Typography variant="body1">
          このアプリケーションはMCP（Model Context Protocol）機能のみを残したシンプルな構成になっています。
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          利用可能なMCPサーバー:
        </Typography>
        <ul>
          <li>Google Calendar MCP Server</li>
          <li>AI Service MCP Server</li>
          <li>Municipality Data MCP Server</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default CalendarTest;