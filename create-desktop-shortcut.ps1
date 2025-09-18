# デスクトップショートカット作成スクリプト (PowerShell版)
# 管理者権限で実行する必要があります

# 現在のスクリプトのディレクトリを取得
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# デスクトップパスを取得
$desktop = [Environment]::GetFolderPath("Desktop")

# ショートカットファイルのパス
$shortcutPath = Join-Path $desktop "AI画像分析デモ起動.lnk"

try {
    # WScript.Shell COMオブジェクトを作成
    $shell = New-Object -ComObject WScript.Shell
    
    # ショートカットを作成
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = Join-Path $currentDir "start-dev.bat"
    $shortcut.WorkingDirectory = $currentDir
    $shortcut.Description = "AI画像分析デモの開発環境を起動します"
    $shortcut.IconLocation = "shell32.dll,25"  # コンピューターアイコン
    $shortcut.Save()
    
    # 完了メッセージ
    [System.Windows.Forms.MessageBox]::Show(
        "デスクトップに 'AI画像分析デモ起動' ショートカットを作成しました!`n`nダブルクリックで開発環境を起動できます。",
        "ショートカット作成完了",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    )
    
    Write-Host "ショートカットが正常に作成されました: $shortcutPath" -ForegroundColor Green
}
catch {
    Write-Error "ショートカットの作成に失敗しました: $($_.Exception.Message)"
    [System.Windows.Forms.MessageBox]::Show(
        "ショートカットの作成に失敗しました:`n$($_.Exception.Message)",
        "エラー",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    )
}

# COMオブジェクトを解放
if ($shell) {
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($shell) | Out-Null
}

# Windows.Formsアセンブリを読み込み
Add-Type -AssemblyName System.Windows.Forms