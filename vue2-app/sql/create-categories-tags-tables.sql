-- =============================================
-- 创建独立的分类表和标签表
-- 这是一个更规范的设计方案
-- =============================================

USE `localculture`;

-- =============================================
-- 分类表（可选：如果需要管理分类的元数据）
-- =============================================

CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL UNIQUE COMMENT '分类名称',
  `slug` VARCHAR(64) DEFAULT NULL COMMENT '分类别名（URL友好）',
  `description` TEXT COMMENT '分类描述',
  `color` VARCHAR(20) DEFAULT '#409EFF' COMMENT '分类颜色',
  `icon` VARCHAR(50) DEFAULT 'el-icon-document' COMMENT '分类图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父分类ID（支持分类层级）',
  `status` ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  `article_count` INT DEFAULT 0 COMMENT '文章数量（冗余字段，便于统计）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章分类表';

-- =============================================
-- 标签表（可选：如果需要管理标签的元数据）
-- =============================================

CREATE TABLE IF NOT EXISTS `tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL UNIQUE COMMENT '标签名称',
  `slug` VARCHAR(64) DEFAULT NULL COMMENT '标签别名（URL友好）',
  `description` TEXT COMMENT '标签描述',
  `color` VARCHAR(20) DEFAULT '#409EFF' COMMENT '标签颜色',
  `article_count` INT DEFAULT 0 COMMENT '文章数量（冗余字段，便于统计）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_count` (`article_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签表';

-- =============================================
-- 文章标签关联表（多对多关系）
-- =============================================

CREATE TABLE IF NOT EXISTS `article_tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
  `tag_id` BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_tag` (`article_id`, `tag_id`),
  KEY `idx_article` (`article_id`),
  KEY `idx_tag` (`tag_id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签关联表';

-- =============================================
-- 插入初始分类数据
-- =============================================

INSERT INTO `categories` (`name`, `slug`, `description`, `color`, `icon`, `sort_order`) VALUES
('传统文化', 'traditional-culture', '传统文化相关内容', '#409EFF', 'el-icon-star-on', 1),
('民俗节庆', 'folk-festivals', '民俗节庆活动', '#67C23A', 'el-icon-present', 2),
('手工艺', 'handicrafts', '传统手工艺技艺', '#E6A23C', 'el-icon-tools', 3),
('古建筑', 'ancient-architecture', '古建筑保护与修复', '#F56C6C', 'el-icon-house', 4),
('音乐舞蹈', 'music-dance', '传统音乐与舞蹈', '#909399', 'el-icon-video-play', 5),
('地方传统美食', 'traditional-food', '地方传统美食文化', '#E6A23C', 'el-icon-fork-spoon', 6),
('传统节日', 'traditional-festivals', '传统节日相关', '#67C23A', 'el-icon-present', 7),
('其他', 'other', '其他相关内容', '#C0C4CC', 'el-icon-more', 99)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- =============================================
-- 插入初始标签数据
-- =============================================

INSERT INTO `tags` (`name`, `slug`, `description`, `color`) VALUES
('保护', 'protection', '文化保护相关', '#409EFF'),
('传承', 'inheritance', '文化传承相关', '#67C23A'),
('创新', 'innovation', '创新发展相关', '#E6A23C'),
('历史', 'history', '历史文化相关', '#F56C6C'),
('艺术', 'art', '艺术创作相关', '#909399'),
('教育', 'education', '文化教育相关', '#C0C4CC'),
('节庆', 'festival', '节庆活动相关', '#FF6B6B'),
('技艺', 'skill', '传统技艺相关', '#4ECDC4'),
('文化', 'culture', '文化相关', '#409EFF'),
('传统', 'tradition', '传统相关', '#67C23A'),
('美食', 'food', '美食相关', '#E6A23C'),
('手工艺', 'handicraft', '手工艺相关', '#E6A23C'),
('民俗', 'folk', '民俗相关', '#67C23A'),
('音乐', 'music', '音乐相关', '#909399'),
('方言', 'dialect', '方言相关', '#409EFF'),
('市场', 'market', '市场相关', '#909399'),
('旅游', 'tourism', '旅游相关', '#4ECDC4')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- =============================================
-- 从现有文章数据中提取标签并建立关联
-- =============================================

-- 先清空关联表
TRUNCATE TABLE `article_tags`;

-- 为每篇文章创建标签关联（基于articles表的tags JSON字段）
-- 注意：这个查询会比较复杂，因为需要解析JSON并匹配标签名
-- 建议在应用层处理，或者使用存储过程

-- 示例：为文章1创建标签关联（手动方式）
INSERT INTO `article_tags` (`article_id`, `tag_id`) 
SELECT 1, id FROM tags WHERE name IN ('保护', '传承', '文化', '历史')
ON DUPLICATE KEY UPDATE article_id=article_id;

-- 为文章2创建标签关联
INSERT INTO `article_tags` (`article_id`, `tag_id`) 
SELECT 2, id FROM tags WHERE name IN ('节庆', '民俗', '传承', '文化')
ON DUPLICATE KEY UPDATE article_id=article_id;

-- 为文章3创建标签关联
INSERT INTO `article_tags` (`article_id`, `tag_id`) 
SELECT 3, id FROM tags WHERE name IN ('保护', '传承', '文化', '历史')
ON DUPLICATE KEY UPDATE article_id=article_id;

-- 为文章4创建标签关联
INSERT INTO `article_tags` (`article_id`, `tag_id`) 
SELECT 4, id FROM tags WHERE name IN ('手工艺', '技艺', '传承', '保护', '艺术')
ON DUPLICATE KEY UPDATE article_id=article_id;

-- 为文章5创建标签关联
INSERT INTO `article_tags` (`article_id`, `tag_id`) 
SELECT 5, id FROM tags WHERE name IN ('节庆', '传统', '民俗', '文化')
ON DUPLICATE KEY UPDATE article_id=article_id;

-- 为文章6创建标签关联
INSERT INTO `article_tags` (`article_id`, `tag_id`) 
SELECT 6, id FROM tags WHERE name IN ('美食', '文化', '历史', '传统')
ON DUPLICATE KEY UPDATE article_id=article_id;

-- =============================================
-- 更新分类和标签的统计数量
-- =============================================

-- 更新分类的文章数量
UPDATE `categories` c
SET `article_count` = (
  SELECT COUNT(*) 
  FROM `articles` a 
  WHERE a.`category` = c.`name`
);

-- 更新标签的文章数量
UPDATE `tags` t
SET `article_count` = (
  SELECT COUNT(*) 
  FROM `article_tags` at 
  WHERE at.`tag_id` = t.`id`
);

-- =============================================
-- 验证数据
-- =============================================

SELECT '分类表和标签表创建完成！' as message;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as tag_count FROM tags;
SELECT COUNT(*) as article_tag_count FROM article_tags;

