#!/bin/bash

echo "============================================"
echo "  项目初始化脚本 - 适用于新团队成员"
echo "============================================"
echo ""

echo "[1/6] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi
echo "✅ Node.js 已安装: $(node --version)"

echo ""
echo "[2/6] 安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装成功"

echo ""
echo "[3/6] 检查 .env 配置..."
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，正在创建..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，设置数据库密码！"
    read -p "按 Enter 继续..."
fi
echo "✅ .env 文件存在"

echo ""
echo "[4/6] 创建 public/assets 目录..."
mkdir -p public/assets
echo "✅ 目录已创建"

echo ""
echo "[5/6] 复制图片资源..."
cp src/assets/*.jpg public/assets/ 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 图片复制成功"
else
    echo "⚠️  图片复制可能失败，请手动检查"
fi

echo ""
echo "[6/6] 数据库初始化..."
echo ""
echo "请确保已完成以下操作："
echo "1. MySQL 已安装并运行"
echo "2. 已在 .env 文件中配置数据库密码"
echo "3. 已创建 localculture 数据库"
echo ""
echo "数据库初始化命令（请手动执行）："
echo "----------------------------------------"
echo "mysql -u root -p << EOF"
echo "CREATE DATABASE IF NOT EXISTS localculture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "EOF"
echo ""
echo "mysql -u root -p localculture < sql/schema.sql"
echo "mysql -u root -p localculture < sql/data.sql"
echo "mysql -u root -p localculture < sql/fix-articles-data.sql"
echo "----------------------------------------"

echo ""
echo "============================================"
echo "  初始化完成！"
echo "  接下来请："
echo "  1. 初始化数据库（按上述命令）"
echo "  2. 运行 ./start.sh 启动项目"
echo "============================================"


