@echo off
chcp 65001 >nul
echo ========================================
echo    导入公告数据到数据库
echo ========================================
echo.

echo 请确保MySQL服务正在运行，并且已配置好数据库连接信息。
echo.
echo 使用方法：
echo   1. 修改下面的MySQL连接信息
echo   2. 运行此脚本
echo.
echo 或者直接在MySQL客户端中执行：
echo   source sql/announcements-data.sql;
echo.

pause

