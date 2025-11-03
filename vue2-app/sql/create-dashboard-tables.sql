-- =============================================
-- 创建仪表盘统计相关表
-- =============================================

USE `localculture`;

-- =============================================
-- 1. 访问日志表（用于统计访问量）
-- =============================================

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

-- =============================================
-- 2. 用户统计表（可选：用于更详细的用户增长数据）
-- =============================================
-- 注意：如果不需要详细统计，可以直接使用users表的created_at字段

-- =============================================
-- 修复标签计数：更新tags表的article_count
-- =============================================
-- 注意：如果article_tags表为空，请先执行 fix-article-tags-associations.sql

-- 重新计算并更新所有标签的文章数量
UPDATE `tags` t
SET `article_count` = (
  SELECT COUNT(*) 
  FROM `article_tags` at 
  WHERE at.`tag_id` = t.`id`
);

-- =============================================
-- 修复分类计数：更新categories表的article_count
-- =============================================

-- 重新计算并更新所有分类的文章数量
UPDATE `categories` c
SET `article_count` = (
  SELECT COUNT(*) 
  FROM `articles` a 
  WHERE a.`category` = c.`name` 
    AND a.`status` = 'published'
);

-- =============================================
-- 验证数据
-- =============================================

SELECT '表创建和计数更新完成！' as message;

SELECT 
  '标签统计' as type,
  COUNT(*) as total_tags,
  SUM(article_count) as total_article_tag_relations
FROM tags;

SELECT 
  '分类统计' as type,
  COUNT(*) as total_categories,
  SUM(article_count) as total_articles
FROM categories;

-- 显示每个标签的计数
SELECT 
  t.id,
  t.name,
  t.article_count,
  COUNT(at.article_id) as actual_count
FROM tags t
LEFT JOIN article_tags at ON t.id = at.tag_id
GROUP BY t.id, t.name, t.article_count
ORDER BY t.article_count DESC, t.name ASC;

