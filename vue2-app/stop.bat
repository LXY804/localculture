@echo off
chcp 65001 >nul
echo ========================================
echo    停止本地文化平台服务
echo ========================================
echo.

echo 正在停止所有Node.js进程...
taskkill /f /im node.exe >nul 2>&1

if errorlevel 1 (
    echo ✅ 没有找到运行中的Node.js进程
) else (
    echo ✅ 已停止所有Node.js进程
)

echo.
echo 服务已停止！
echo.
pause
