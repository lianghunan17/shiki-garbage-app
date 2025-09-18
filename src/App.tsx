import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import ShikiGarbageApp from './components/ShikiGarbageApp';
import CalendarTest from './components/CalendarTest';
import ConfusingWasteSearch from './components/ConfusingWasteSearch';

// Material-UIテーマ設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // 環境に優しい緑色
    },
    secondary: {
      main: '#ff9800', // オレンジ色
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", "Noto Sans JP", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Routes>
              <Route 
                path="/" 
                element={<ShikiGarbageApp />} 
              />
              <Route 
                path="/calendar-test" 
                element={<CalendarTest />} 
              />
              <Route 
                path="/confusing-waste" 
                element={<ConfusingWasteSearch />} 
              />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;