# 🤝 协作开发指南

## 📋 数据库协作流程

### 1. 获取项目数据
当您加入项目时，请按以下步骤获取数据库：

```bash
# 1. 克隆项目
git clone <repository-url>
cd vue2-app

# 2. 安装依赖
npm install

# 3. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS localculture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 4. 导入数据库结构
mysql -u root -p localculture < sql/schema.sql

# 5. 导入数据库数据
mysql -u root -p localculture < sql/data.sql

# 6. 配置环境变量
# 复制 .env.example 到 .env 并修改数据库密码

# 7. 启动项目
.\start.bat  # Windows
# 或
./start.sh   # Linux/Mac
```

### 2. 提交数据变更
当您修改了数据库内容时：

```bash
# 1. 导出最新数据
cd server
node export-data.js

# 2. 提交变更
git add sql/
git commit -m "Update database: [描述您的变更]"
git push
```

### 3. 获取最新数据
当其他开发者更新了数据库时：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新导入数据库
mysql -u root -p localculture < sql/schema.sql
mysql -u root -p localculture < sql/data.sql
```

## 📁 数据库文件说明

- `sql/schema.sql` - 数据库结构文件（表结构、索引、外键等）
- `sql/data.sql` - 数据库数据文件（实际数据内容）

## ⚠️ 注意事项

1. **数据冲突处理**：如果多人同时修改数据，请先沟通避免冲突
2. **敏感数据**：不要提交包含真实用户密码或敏感信息的数据库
3. **数据备份**：重要数据修改前请先备份
4. **测试数据**：开发环境可以使用测试数据，生产环境请使用真实数据

## 🔄 数据同步最佳实践

### 开发阶段
- 使用测试数据进行开发
- 定期同步数据库结构变更
- 避免直接修改生产数据

### 测试阶段
- 使用标准测试数据集
- 记录数据变更日志
- 确保数据一致性

### 生产部署
- 备份现有数据
- 逐步部署数据库变更
- 验证数据完整性

## 🛠️ 故障排除

### 常见问题

1. **导入失败**
   ```bash
   # 检查MySQL服务状态
   mysql -u root -p -e "SHOW DATABASES;"
   
   # 检查文件编码
   file sql/schema.sql
   ```

2. **权限问题**
   ```bash
   # 确保用户有足够权限
   mysql -u root -p -e "GRANT ALL PRIVILEGES ON localculture.* TO 'your_user'@'localhost';"
   ```

3. **数据不一致**
   ```bash
   # 重新导入完整数据库
   mysql -u root -p -e "DROP DATABASE localculture;"
   mysql -u root -p -e "CREATE DATABASE localculture DEFAULT CHARACTER SET utf8mb4;"
   mysql -u root -p localculture < sql/schema.sql
   mysql -u root -p localculture < sql/data.sql
   ```

## 📞 获取帮助

- 查看项目README.md
- 检查STARTUP_GUIDE.md
- 联系项目维护者
- 提交Issue到项目仓库
