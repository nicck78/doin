$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("D:\___aaa\Projects\doin\doin.lnk")
$Shortcut.TargetPath = "D:\___aaa\Projects\doin\release\doin-win32-x64\doin.exe"
$Shortcut.WorkingDirectory = "D:\___aaa\Projects\doin\release\doin-win32-x64"
$Shortcut.IconLocation = "D:\___aaa\Projects\doin\public\logo.ico,0"
$Shortcut.Description = "doin"
$Shortcut.Save()
Write-Host "SHORTCUT_OK"
