# 快速设置指南（新成员必读）

## 一键部署命令（推荐）

### Windows 用户
```powershell
# 1. 安装依赖
npm install

# 2. 配置环境变量（先手动修改 .env 文件中的数据库密码）
# 编辑 .env 文件，设置：
# DB_PASSWORD=你的MySQL密码

# 3. 初始化数据库（一次性执行）
# 在 MySQL 命令行中执行：
mysql -u root -p
# 输入密码后：
CREATE DATABASE IF NOT EXISTS localculture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# 4. 导入所有数据（按顺序执行）
Get-Content sql\schema.sql | mysql -u root -p localculture
Get-Content sql\data.sql | mysql -u root -p localculture
Get-Content sql\fix-articles-data.sql | mysql -u root -p localculture

# 5. 复制图片资源
New-Item -ItemType Directory -Path "public\assets" -Force
Copy-Item -Path "src\assets\*.jpg" -Destination "public\assets\" -Force

# 6. 启动项目
.\start.bat
```

### Linux/Mac 用户
```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
# 编辑 .env 文件，设置数据库密码

# 3. 初始化数据库
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS localculture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

# 4. 导入所有数据
mysql -u root -p localculture < sql/schema.sql
mysql -u root -p localculture < sql/data.sql
mysql -u root -p localculture < sql/fix-articles-data.sql

# 5. 复制图片资源
mkdir -p public/assets
cp src/assets/*.jpg public/assets/

# 6. 启动项目
./start.sh
```

## 检查清单

启动成功后访问 http://localhost:8080，检查：

### 基础功能
- [ ] 页面能正常打开
- [ ] 可以注册新账号
- [ ] 可以登录/登出
- [ ] 导航栏正常显示

### 文章功能
- [ ] 文章列表显示6篇文章
- [ ] 每篇文章都有封面图片
- [ ] 点击文章能查看详情
- [ ] 文章详情页的标题与列表一致
- [ ] 可以发布新文章（没有"保存草稿"按钮）
- [ ] 可以删除自己发布的文章

### 论坛功能
- [ ] 论坛列表正常显示
- [ ] 可以发布新帖子（没有"保存草稿"按钮）
- [ ] 可以删除自己的帖子

### 个人中心
- [ ] 个人中心能打开
- [ ] 没有"草稿箱"按钮
- [ ] 可以查看我的收藏、我的帖子等

## 如果遇到问题

### 数据库连接失败
```
错误信息: ER_ACCESS_DENIED_ERROR
解决方案: 检查 .env 文件中的数据库密码
```

### 封面图片不显示
```
解决方案: 
cd vue2-app
Copy-Item -Path "src\assets\*.jpg" -Destination "public\assets\" -Force
```

### 文章内容为空或乱码
```
解决方案: 重新运行修复脚本
mysql -u root -p localculture < sql/fix-articles-data.sql
```

### 端口被占用
```
错误信息: EADDRINUSE: address already in use :::3000
解决方案: 
1. 杀死占用端口的进程
2. 或修改 .env 中的 PORT 配置
```

## 测试账号

数据库初始化后会自动创建测试账号：

```
用户名: user1
密码: password123
```

---

更多详细信息请查看 `PROJECT_SYNC_GUIDE.md`

