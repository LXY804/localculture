@echo off
chcp 65001 >nul
echo ============================================
echo   项目初始化脚本 - 适用于新团队成员
echo ============================================
echo.

echo [1/6] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

echo.
echo [2/6] 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装成功

echo.
echo [3/6] 检查 .env 配置...
if not exist .env (
    echo ⚠️  .env 文件不存在，正在创建...
    copy .env.example .env >nul 2>&1
    echo ⚠️  请编辑 .env 文件，设置数据库密码！
    pause
)
echo ✅ .env 文件存在

echo.
echo [4/6] 创建 public/assets 目录...
if not exist public\assets mkdir public\assets
echo ✅ 目录已创建

echo.
echo [5/6] 复制图片资源...
xcopy /Y /Q src\assets\*.jpg public\assets\ >nul 2>&1
if errorlevel 1 (
    echo ⚠️  图片复制可能失败，请手动检查
) else (
    echo ✅ 图片复制成功
)

echo.
echo [6/6] 数据库初始化...
echo.
echo 请确保已完成以下操作：
echo 1. MySQL 已安装并运行
echo 2. 已在 .env 文件中配置数据库密码
echo.
echo ============================================
echo   数据库初始化步骤
echo ============================================
echo.
echo 第一步：创建数据库（在 MySQL 命令行中执行）
echo ----------------------------------------
echo CREATE DATABASE IF NOT EXISTS localculture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo ----------------------------------------
echo.
echo 第二步：导入数据库表结构和数据（在 PowerShell 中执行）
echo ----------------------------------------
echo # 1. 基础表结构
echo Get-Content sql\schema.sql ^| mysql -u root -p localculture
echo.
echo # 2. 基础数据
echo Get-Content sql\data.sql ^| mysql -u root -p localculture
echo.
echo # 3. 修复文章数据
echo Get-Content sql\fix-articles-data.sql ^| mysql -u root -p localculture

echo ----------------------------------------
echo ============================================
echo   ✅ 初始化准备完成！
echo ============================================
echo.
echo 📋 接下来请按顺序执行：
echo   1. 在 MySQL 中创建数据库（上述第一步）
echo   2. 在 PowerShell 中导入数据（上述第二步）
echo   3. 运行 start.bat 启动项目
echo   4. 访问 http://localhost:8080
echo   5. 使用测试账号登录: user / password
echo.
echo 📖 详细文档：
echo   - 快速开始: QUICK_FIX_SUMMARY.md
echo   - 完整指南: INTERACTION_SYSTEM_GUIDE.md
echo   - 工作总结: WORK_COMPLETED_SUMMARY.md
echo.
echo ============================================
pause


