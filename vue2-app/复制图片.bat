@echo off
chcp 65001 >nul
echo ========================================
echo   复制图片资源到 public/assets
echo ========================================
echo.

echo 正在复制图片...
if not exist public\assets mkdir public\assets

copy /Y src\assets\*.jpg public\assets\
if errorlevel 1 (
    echo ❌ 复制失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 图片复制成功！
echo ========================================
echo.
echo 已复制的图片：
dir public\assets\*.jpg /b
echo.
pause

