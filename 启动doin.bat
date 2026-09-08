@echo off
cd /d "%~dp0"

echo [doin] Starting desktop app, please wait...
node "node_modules\electron\cli.js" .

if %errorlevel% neq 0 (
    echo.
    echo [doin] App exited with code: %errorlevel%
    pause
)
