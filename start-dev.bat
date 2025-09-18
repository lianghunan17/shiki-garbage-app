@echo off
echo ==========================================
echo   AI画像分析デモ - 開発環境起動
echo ==========================================
echo.
echo すべてのサーバーを起動しています...
echo - Ollama サーバー
echo - MCP サーバー  
echo - React フロントエンド
echo.
echo ブラウザで http://localhost:3000 が自動で開きます
echo.
echo 終了するには Ctrl+C を押してください
echo ==========================================
echo.

cd /d "%~dp0"
npm run dev-all

pause