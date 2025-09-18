@echo off
echo PowerShellスクリプトをEXEファイルに変換します...
echo.

REM ps2exeモジュールがインストールされているかチェック
powershell -Command "if (Get-Module -ListAvailable -Name ps2exe) { Write-Host 'ps2exe モジュールが見つかりました' -ForegroundColor Green } else { Write-Host 'ps2exe モジュールをインストールしています...' -ForegroundColor Yellow; Install-Module -Name ps2exe -Force -Scope CurrentUser }"

REM PowerShellスクリプトをEXEに変換
echo.
echo EXEファイルを作成しています...
powershell -Command "Invoke-ps2exe -inputFile '.\create-desktop-shortcut.ps1' -outputFile '.\create-desktop-shortcut.exe' -iconFile 'shell32.dll' -title 'デスクトップショートカット作成ツール' -description 'AI画像分析デモのショートカットを作成します' -company 'AI Demo Project' -version '1.0.0.0' -copyright '2024' -requireAdmin"

if exist "create-desktop-shortcut.exe" (
    echo.
    echo ✓ EXEファイルが正常に作成されました: create-desktop-shortcut.exe
    echo.
    echo 使用方法:
    echo 1. create-desktop-shortcut.exe を右クリック
    echo 2. "管理者として実行" を選択
    echo.
) else (
    echo.
    echo ✗ EXEファイルの作成に失敗しました
    echo.
    echo トラブルシューティング:
    echo 1. PowerShellの実行ポリシーを確認してください
    echo 2. 管理者権限でこのBATファイルを実行してください
    echo.
)

pause