#!/bin/bash

echo "========================================"
echo "    本地文化平台启动脚本"
echo "========================================"
echo

echo "[1/3] 检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi
echo "✅ Node.js环境正常"

echo
echo "[2/3] 启动后端服务器..."
cd server
node index.js &
BACKEND_PID=$!
echo "✅ 后端服务器启动中... (PID: $BACKEND_PID)"

echo
echo "[3/3] 等待后端服务器启动完成..."
sleep 5

echo "启动前端开发服务器..."
cd ..
npm run serve &
FRONTEND_PID=$!
echo "✅ 前端服务器启动中... (PID: $FRONTEND_PID)"

echo
echo "========================================"
echo "    启动完成！"
echo "========================================"
echo
echo "🌐 前端地址: http://localhost:8080"
echo "🔧 后端地址: http://localhost:3001"
echo
echo "💡 提示:"
echo "   - 按 Ctrl+C 停止所有服务"
echo "   - 如果遇到问题，请检查端口是否被占用"
echo

# 等待用户中断
trap "echo; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '服务已停止'; exit 0" INT

echo "服务运行中... 按 Ctrl+C 停止"
wait
