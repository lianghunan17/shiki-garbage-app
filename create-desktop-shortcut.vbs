' デスクトップショートカット作成スクリプト
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' 現在のスクリプトのディレクトリを取得
strCurrentDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' デスクトップパスを取得
strDesktop = objShell.SpecialFolders("Desktop")

' ショートカットを作成
Set objShortcut = objShell.CreateShortcut(strDesktop & "\AI画像分析デモ起動.lnk")
objShortcut.TargetPath = strCurrentDir & "\start-dev.bat"
objShortcut.WorkingDirectory = strCurrentDir
objShortcut.Description = "AI画像分析デモの開発環境を起動します"
objShortcut.IconLocation = "shell32.dll,25"  ' コンピューターアイコン
objShortcut.Save

' 完了メッセージ
MsgBox "デスクトップに 'AI画像分析デモ起動' ショートカットを作成しました！" & vbCrLf & vbCrLf & "ダブルクリックで開発環境を起動できます。", vbInformation, "ショートカット作成完了"