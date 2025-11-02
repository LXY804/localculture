# 本地文化平台 (Local Culture Platform)

一个基于Vue.js和Node.js的地方传统文化展示平台，支持文章发布、活动管理、用户互动等功能。

## 🚀 快速开始

### 1. 环境要求
- Node.js 14+
- MySQL 5.7+
- npm 或 yarn

### 2. 安装依赖
```bash
npm install
```

### 3. 数据库设置

#### 方法一：使用提供的SQL文件（推荐）
```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS localculture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 2. 导入数据库结构
mysql -u root -p localculture < sql/schema.sql

# 3. 导入数据库数据
mysql -u root -p localculture < sql/data.sql
```

#### 方法二：使用PowerShell脚本（Windows）
```powershell
# 运行数据库初始化脚本
.\scripts\import-schema.ps1
```

### 4. 环境配置
复制 `.env.example` 到 `.env` 并配置数据库连接：
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=localculture
```

### 5. 启动项目

#### 一键启动（推荐）
```bash
# Windows
.\start.bat

# Linux/Mac
./start.sh

# 或使用npm命令
npm start
```

#### 手动启动
```bash
# 启动后端服务器
cd server && node index.js

# 启动前端开发服务器（新终端）
npm run serve
```

### 6. 访问应用
- 前端地址: http://localhost:8080
- 后端API: http://localhost:3001

## 📁 项目结构

```
vue2-app/
├── sql/                    # 数据库文件
│   ├── schema.sql         # 数据库结构
│   └── data.sql           # 数据库数据
├── server/                # 后端服务器
│   ├── index.js          # 服务器入口
│   ├── db.js             # 数据库连接
│   └── routes/           # API路由
├── src/                   # 前端源码
│   ├── components/        # Vue组件
│   ├── views/            # 页面视图
│   ├── router/           # 路由配置
│   └── store/            # 状态管理
├── start.bat             # Windows启动脚本
├── start.sh              # Linux/Mac启动脚本
└── stop.bat              # 停止服务脚本
```

## 🛠️ 开发指南

### 数据库管理
- 数据库结构文件：`sql/schema.sql`
- 数据库数据文件：`sql/data.sql`
- 如需重新导出数据：`cd server && node export-data.js`

### API接口
- 文章管理：`/api/articles`
- 活动管理：`/api/activities`
- 用户管理：`/api/users`
- 公告管理：`/api/announcements`

### 常用命令
```bash
# 开发模式
npm run serve

# 生产构建
npm run build

# 代码检查
npm run lint

# 停止服务
.\stop.bat  # Windows
```

## 🤝 协作开发

### 获取最新数据
1. 拉取最新代码：`git pull`
2. 重新导入数据库：
   ```bash
   mysql -u root -p localculture < sql/schema.sql
   mysql -u root -p localculture < sql/data.sql
   ```

### 提交数据变更
1. 导出最新数据：`cd server && node export-data.js`
2. 提交SQL文件：`git add sql/ && git commit -m "Update database"`
3. 推送到远程：`git push`

## 📝 注意事项

- 确保MySQL服务正在运行
- 检查端口3001和8080是否被占用
- 如遇到权限问题，请检查数据库用户权限
- 生产环境请修改默认密码和配置

## 🔧 故障排除

### 常见问题
1. **数据库连接失败**：检查`.env`配置和MySQL服务状态
2. **端口被占用**：使用`netstat -ano | findstr :3001`检查端口
3. **权限错误**：确保数据库用户有足够权限

### 获取帮助
- 查看详细文档：`STARTUP_GUIDE.md`
- 检查服务器日志：查看控制台输出
- 数据库问题：检查`server/db.js`连接配置
