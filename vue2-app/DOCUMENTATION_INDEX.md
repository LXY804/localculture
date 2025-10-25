# 项目文档索引

本项目包含多个文档，此索引帮助您快速找到需要的信息。

## 📚 文档分类

### 🚀 快速开始
适合**新团队成员**或**首次部署**

| 文档 | 用途 | 阅读时间 |
|------|------|----------|
| [QUICK_SETUP.md](QUICK_SETUP.md) | 最快速的设置指南，一步步命令 | 5分钟 |
| [STARTUP_GUIDE.md](STARTUP_GUIDE.md) | 项目启动详细说明 | 10分钟 |

**推荐阅读顺序：**
1. 先看 `QUICK_SETUP.md`
2. 遇到问题看 `STARTUP_GUIDE.md`

---

### 🔄 项目同步
适合**已有开发环境的成员**需要**同步最新更改**

| 文档 | 用途 | 阅读时间 |
|------|------|----------|
| [PROJECT_SYNC_GUIDE.md](PROJECT_SYNC_GUIDE.md) | 完整的同步指南，包含所有细节 | 15分钟 |
| [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) | 本次更新的所有更改汇总 | 10分钟 |

**推荐阅读顺序：**
1. 先看 `CHANGES_SUMMARY.md` 了解改了什么
2. 按 `PROJECT_SYNC_GUIDE.md` 执行同步

---

### 👨‍💼 管理员文档
适合**管理员**或**高级用户**

| 文档 | 用途 | 阅读时间 |
|------|------|----------|
| [ADMIN_README.md](ADMIN_README.md) | 管理员功能说明 | 15分钟 |
| [COLLABORATION_GUIDE.md](COLLABORATION_GUIDE.md) | 团队协作规范 | 10分钟 |

---

### ✅ 提交与检查
适合**代码提交者**

| 文档 | 用途 | 阅读时间 |
|------|------|----------|
| [CHECKLIST_FOR_COMMIT.md](CHECKLIST_FOR_COMMIT.md) | Git提交前的完整检查清单 | 5分钟 |

---

### 🗄️ 数据库
适合**数据库管理**和**初始化**

| 文件 | 用途 |
|------|------|
| [sql/schema.sql](sql/schema.sql) | 数据库表结构定义 |
| [sql/data.sql](sql/data.sql) | 初始数据（测试账号等） |
| [sql/fix-articles-data.sql](sql/fix-articles-data.sql) | **必须执行**的数据修复脚本 |

**执行顺序：**
```bash
1. schema.sql   # 创建表
2. data.sql     # 插入初始数据
3. fix-articles-data.sql  # 修复数据（重要！）
```

---

### 🛠️ 自动化脚本

| 脚本 | 平台 | 用途 |
|------|------|------|
| [setup-for-new-member.bat](setup-for-new-member.bat) | Windows | 自动化环境设置 |
| [setup-for-new-member.sh](setup-for-new-member.sh) | Linux/Mac | 自动化环境设置 |
| [start.bat](start.bat) | Windows | 启动项目 |
| [start.sh](start.sh) | Linux/Mac | 启动项目 |

---

## 📋 常见场景指引

### 场景1：我是新成员，第一次部署
```
1. 阅读 QUICK_SETUP.md
2. 运行 setup-for-new-member.bat（或.sh）
3. 按提示初始化数据库
4. 运行 start.bat 启动项目
```

### 场景2：我要同步最新代码
```
1. git pull origin main
2. 阅读 CHANGES_SUMMARY.md 了解改动
3. 按 PROJECT_SYNC_GUIDE.md 执行同步步骤
4. 特别注意：执行 sql/fix-articles-data.sql
```

### 场景3：我要提交代码
```
1. 完成开发和测试
2. 按 CHECKLIST_FOR_COMMIT.md 检查
3. git commit & git push
4. 通知团队成员同步
```

### 场景4：数据库出问题了
```
1. 检查 .env 配置
2. 重新执行 sql/schema.sql
3. 执行 sql/data.sql
4. 执行 sql/fix-articles-data.sql（重要！）
5. 查看 PROJECT_SYNC_GUIDE.md 的"常见问题"部分
```

### 场景5：封面图片不显示
```
1. 检查 public/assets/ 目录是否存在
2. 检查是否有9张jpg图片
3. 如果没有，运行：
   Windows: Copy-Item -Path "src\assets\*.jpg" -Destination "public\assets\" -Force
   Linux/Mac: cp src/assets/*.jpg public/assets/
```

---

## 🔍 快速搜索

### 我想找...

| 关键词 | 推荐文档 | 章节 |
|--------|----------|------|
| 安装依赖 | QUICK_SETUP.md | 第二步 |
| 数据库配置 | QUICK_SETUP.md | 第三步 |
| 数据库初始化 | QUICK_SETUP.md | 第四步 |
| 封面图片 | PROJECT_SYNC_GUIDE.md | 第五步 |
| 草稿功能 | CHANGES_SUMMARY.md | 删除的功能 |
| API修改 | CHANGES_SUMMARY.md | 修改的文件 |
| Git提交 | CHECKLIST_FOR_COMMIT.md | 全文 |
| 错误排查 | PROJECT_SYNC_GUIDE.md | 常见问题 |
| 管理员功能 | ADMIN_README.md | 全文 |
| 团队协作 | COLLABORATION_GUIDE.md | 全文 |

---

## ⚠️ 重要提醒

### 必读事项
1. **所有人必须执行** `sql/fix-articles-data.sql`
2. **封面图片必须在** `public/assets/` 目录
3. **每个人的** `.env` **配置可能不同**

### 获取帮助
1. 先查阅相关文档的"常见问题"部分
2. 搜索本文档索引
3. 联系项目负责人

---

## 📝 文档维护

### 文档更新原则
- 有重大功能变更时更新相关文档
- 发现问题及时补充到"常见问题"
- 保持文档同步到最新版本

### 文档结构
```
vue2-app/
├── DOCUMENTATION_INDEX.md     # 本文件（文档导航）
├── QUICK_SETUP.md            # 快速设置
├── PROJECT_SYNC_GUIDE.md     # 项目同步
├── CHANGES_SUMMARY.md        # 更改汇总
├── CHECKLIST_FOR_COMMIT.md   # 提交检查清单
├── STARTUP_GUIDE.md          # 启动指南
├── ADMIN_README.md           # 管理员文档
├── COLLABORATION_GUIDE.md    # 协作指南
└── 使用说明.md               # 中文使用说明
```

---

**文档版本：** 2.0.0  
**最后更新：** 2025-10-25  
**维护者：** 项目团队

