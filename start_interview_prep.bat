@echo off
setlocal

set "PORT=4173"
set "HOST=127.0.0.1"
set "ROOT=%~dp0"
set "URL=http://%HOST%:%PORT%/index.html"

for /f %%P in ('powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess; if ($conn) { Write-Output $conn }"') do set "EXISTING_PID=%%P"

if defined EXISTING_PID goto open_browser

where py >nul 2>nul
if %errorlevel%==0 (
  start "Interview Prep Server" /min cmd /c py -3 -m http.server %PORT% --bind %HOST% --directory "%ROOT%"
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    start "Interview Prep Server" /min cmd /c python -m http.server %PORT% --bind %HOST% --directory "%ROOT%"
  ) else (
    echo Python 3 not found. Please install Python 3, then try again.
    pause
    exit /b 1
  )
)

powershell -NoProfile -Command "Start-Sleep -Milliseconds 1200"

:open_browser
start "" "%URL%"
exit /b 0
