# 仪表盘数据库设置指南

## 📋 问题说明

您遇到的几个问题：
1. **标签计数为0**：标签表中的 `article_count` 字段未正确更新
2. **总用户数不一致**：fallback 数据源不准确
3. **用户增长趋势错误**：使用随机数据，需要真实历史数据
4. **访问量错误**：缺少访问日志表来记录真实的访问数据

## 🚀 解决步骤

### 第1步：创建访问日志表

执行以下SQL脚本创建访问日志表和修复计数：

```sql
source sql/create-dashboard-tables.sql;
```

或在MySQL客户端中执行：

```sql
USE `localculture`;

-- 创建访问日志表
CREATE TABLE IF NOT EXISTS `visit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID（未登录为NULL）',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(255) DEFAULT NULL COMMENT '用户代理',
  `page_path` VARCHAR(255) DEFAULT NULL COMMENT '访问页面路径',
  `referer` VARCHAR(255) DEFAULT NULL COMMENT '来源页面',
  `session_id` VARCHAR(64) DEFAULT NULL COMMENT '会话ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_date` (`created_at`, `user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访问日志表';

-- 修复标签计数
UPDATE `tags` t
SET `article_count` = (
  SELECT COUNT(*) 
  FROM `article_tags` at 
  WHERE at.`tag_id` = t.`id`
);

-- 修复分类计数
UPDATE `categories` c
SET `article_count` = (
  SELECT COUNT(*) 
  FROM `articles` a 
  WHERE a.`category` = c.`name` 
    AND a.`status` = 'published'
);
```

### 第2步：验证数据

执行以下查询验证数据是否正确：

```sql
-- 检查标签计数
SELECT 
  t.id,
  t.name,
  t.article_count,
  COUNT(at.article_id) as actual_count
FROM tags t
LEFT JOIN article_tags at ON t.id = at.tag_id
GROUP BY t.id, t.name, t.article_count
ORDER BY t.article_count DESC, t.name ASC;

-- 检查分类计数
SELECT 
  c.id,
  c.name,
  c.article_count,
  COUNT(a.id) as actual_count
FROM categories c
LEFT JOIN articles a ON a.category = c.name AND a.status = 'published'
GROUP BY c.id, c.name, c.article_count
ORDER BY c.article_count DESC, c.name ASC;

-- 检查用户总数
SELECT COUNT(*) as total_users FROM users;

-- 检查访问日志表
SELECT COUNT(*) as total_visits FROM visit_logs;
```

### 第3步：重启后端服务器

修改完成后，重启后端服务器以使新代码生效。

## 📊 数据说明

### 访问日志表 (`visit_logs`)

此表用于记录所有页面访问，系统会自动记录：
- 访问的用户（如果已登录）
- IP地址
- 访问的页面路径
- 访问时间

**注意**：访问日志只记录页面访问（非API调用），以节省数据库空间。

### 用户增长趋势

用户增长趋势现在从 `users` 表的 `created_at` 字段计算，显示真实的用户注册日期分布。

### 标签计数

标签的文章数量现在实时从 `article_tags` 关联表计算，确保准确性。

## 🔧 已修复的API

### 1. `/api/tags` - 获取标签列表
- ✅ 现在实时计算文章数量（不使用 `article_count` 字段）
- ✅ 使用 `LEFT JOIN` 确保所有标签都显示

### 2. `/api/dashboard/stats` - 获取统计数据
- ✅ 总用户数：从 `users` 表直接统计
- ✅ 总文章数：只统计已发布的文章
- ✅ 总公告数：只统计已发布的公告
- ✅ 今日访问量：从 `visit_logs` 表统计（如果表存在）

### 3. `/api/dashboard/user-growth` - 获取用户增长趋势
- ✅ 从 `users` 表的 `created_at` 字段计算
- ✅ 返回最近7天的用户注册数据
- ✅ 自动填充没有注册用户的日期（count为0）

## 📝 维护建议

### 定期清理访问日志

访问日志表可能会快速增长，建议定期清理旧数据：

```sql
-- 删除30天前的访问日志
DELETE FROM visit_logs 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 更新标签计数（如果需要）

虽然标签计数现在是实时计算的，但如果您想保持 `article_count` 字段同步，可以定期执行：

```sql
-- 更新所有标签的计数
UPDATE `tags` t
SET `article_count` = (
  SELECT COUNT(*) 
  FROM `article_tags` at 
  WHERE at.`tag_id` = t.`id`
);
```

## ✅ 验证检查清单

- [ ] 访问日志表已创建
- [ ] 标签计数已修复（所有标签的 `article_count` 已更新）
- [ ] 分类计数已修复
- [ ] 后端服务器已重启
- [ ] 前端刷新后显示正确的数据
- [ ] 标签管理页面显示正确的文章数量
- [ ] 仪表盘显示正确的总用户数
- [ ] 用户增长趋势显示真实数据（而不是随机数据）
- [ ] 访问量开始记录（需要一些时间积累数据）

## 🐛 故障排除

### 标签计数仍然为0

1. 检查 `article_tags` 表是否有数据：
```sql
SELECT COUNT(*) FROM article_tags;
```

2. 检查标签是否有关联：
```sql
SELECT t.name, COUNT(at.article_id) as count
FROM tags t
LEFT JOIN article_tags at ON t.id = at.tag_id
GROUP BY t.id, t.name;
```

### 访问量始终为0

1. 检查 `visit_logs` 表是否存在
2. 访问一些页面（非API路径）
3. 检查表中是否有新记录：
```sql
SELECT * FROM visit_logs ORDER BY created_at DESC LIMIT 10;
```

### 用户增长趋势为空

1. 检查是否有用户数据：
```sql
SELECT DATE(created_at) as date, COUNT(*) as count
FROM users
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

2. 确保用户表的 `created_at` 字段有数据

---

**执行完成后，所有数据都应该显示正确！** 🎉

