# 项目同步指南 / Project Synchronization Guide

本文档帮助团队成员同步最新的项目修改。

## 快速开始步骤

### 第一步：获取最新代码
```bash
git pull origin main
```

### 第二步：安装依赖（如果是首次安装）
```bash
cd vue2-app
npm install
```

### 第三步：配置数据库
1. 确保 MySQL 已安装并运行
2. 配置 `.env` 文件（参考 `.env.example`）：
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=localculture
PORT=3000
```

### 第四步：初始化数据库

**方案A：完整初始化（推荐新成员）**
```bash
# 1. 创建数据库
mysql -u root -p
CREATE DATABASE IF NOT EXISTS localculture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# 2. 导入表结构
mysql -u root -p localculture < sql/schema.sql

# 3. 导入基础数据
mysql -u root -p localculture < sql/data.sql

# 4. 修复文章数据（重要！）
mysql -u root -p localculture < sql/fix-articles-data.sql
```

**方案B：只修复现有数据**
如果你已经有数据库，只需运行：
```bash
mysql -u root -p localculture < sql/fix-articles-data.sql
```

### 第五步：复制静态资源
确保封面图片在正确位置：
```bash
# Windows PowerShell
Copy-Item -Path "src\assets\*.jpg" -Destination "public\assets\" -Force

# Linux/Mac
cp src/assets/*.jpg public/assets/
```

如果 `public/assets` 目录不存在，先创建：
```bash
# Windows
mkdir public\assets

# Linux/Mac
mkdir -p public/assets
```

### 第六步：启动项目
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

## 重要文件清单

### 必须同步的文件
```
vue2-app/
├── sql/
│   ├── schema.sql          # 数据库表结构
│   ├── data.sql           # 基础数据
│   └── fix-articles-data.sql  # 文章数据修复脚本（新增）
├── server/
│   └── index.js           # 后端API（已修改）
├── src/
│   ├── components/
│   │   ├── ArticlePublishForm.vue  # 简化版（已修改）
│   │   └── Modal.vue              # 样式调整（已修改）
│   ├── views/
│   │   ├── Articles.vue          
│   │   ├── ArticleDetail.vue     
│   │   ├── Forum.vue             
│   │   ├── ForumPostDetail.vue    
│   │   └── Profile.vue          
│   └── App.vue                  
└── public/
    └── assets/                    # 封面图片目录（新增）
        ├── campus.jpg
        ├── craft.jpg
        ├── festival.jpg
        ├── food1.jpg
        ├── language.jpg
        ├── museum.jpg
        ├── music.jpg
        ├── painting.jpg
        └── temple.jpg
```

### 已删除的文件（如果存在请删除）
```
- src/utils/draftManager.js
- DEBUG_DRAFT_CONTENT.md
- IMPROVEMENTS_SUMMARY.md
- DELETE_FEATURE_README.md
- DRAFT_FEATURE_GUIDE.md
- 草稿功能说明.md
- FINAL_UPDATE_SUMMARY.md
- 其他临时文档
```

## 数据库架构说明

### 正确的数据关系
- **`articles` 表**：主表，包含所有文章的完整数据（标题、内容、摘要、封面等）
- **`hotarticles` 表**：热门文章索引表，通过 `article_id` 关联到 `articles` 表

### 关键点
1. `hotarticles` 是 `articles` 的子集，不是独立数据源
2. 所有文章数据的"真相之源"是 `articles` 表
3. `hotarticles` 只用于标记哪些文章是热门的

## 常见问题

### Q1: 文章列表不显示封面图片？
**A:** 确保图片已复制到 `public/assets/` 目录
```bash
Copy-Item -Path "src\assets\*.jpg" -Destination "public\assets\" -Force
```

### Q2: 文章列表和详情页内容不一致？
**A:** 运行文章数据修复脚本
```bash
mysql -u root -p localculture < sql/fix-articles-data.sql
```

### Q3: 启动时报数据库连接错误？
**A:** 检查 `.env` 文件配置，确保数据库密码正确

## 验证安装

启动项目后，检查以下功能：

- [ ] 文章列表能正常显示（显示所有文章，热门文章在前）
- [ ] 文章封面图片正常显示
- [ ] 文章详情页与列表页标题、摘要一致
- [ ] 可以发布新文章（无草稿保存功能）
- [ ] 可以删除自己的文章/帖子
- [ ] 个人中心没有"草稿箱"按钮

## 技术支持

如果遇到问题，请检查：
1. Node.js 版本 >= 14
2. MySQL 版本 >= 5.7
3. 所有依赖已正确安装（npm install）
4. 数据库已正确初始化
5. `.env` 配置正确

## 更新日志

### 2025-10-25
- ✅ 修复文章数据一致性
- ✅ 添加封面图片支持
- ✅ 简化API逻辑
- ✅ 优化数据库查询

---

**注意：** 每次同步代码后，如果 `sql/` 目录有更新，记得重新运行相关的SQL脚本！

