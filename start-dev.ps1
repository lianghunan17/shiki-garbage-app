# AI画像分析デモ - 開発環境起動スクリプト

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   AI画像分析デモ - 開発環境起動" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 すべてのサーバーを起動しています..." -ForegroundColor Green
Write-Host "   - Ollama サーバー" -ForegroundColor White
Write-Host "   - MCP サーバー" -ForegroundColor White  
Write-Host "   - React フロントエンド" -ForegroundColor White
Write-Host ""
Write-Host "🌐 ブラウザで http://localhost:3000 が自動で開きます" -ForegroundColor Magenta
Write-Host ""
Write-Host "⚠️  終了するには Ctrl+C を押してください" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# プロジェクトディレクトリに移動
Set-Location $PSScriptRoot

# 3秒後にブラウザを開く（バックグラウンドで）
Start-Job -ScriptBlock {
    Start-Sleep 10
    Start-Process "http://localhost:3000"
} | Out-Null

# 開発サーバー起動
npm run dev-all

Write-Host ""
Write-Host "開発サーバーが終了しました。" -ForegroundColor Yellow
Read-Host "Enterキーを押して終了してください"