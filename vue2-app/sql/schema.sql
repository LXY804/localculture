-- =============================================
-- 地方传统文化平台 - 精简数据库架构
-- =============================================

-- 使用数据库
USE `localculture`;

-- =============================================
-- 核心业务表（实际使用的表）
-- =============================================

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `nickname` VARCHAR(50),
  `email` VARCHAR(100),
  `phone` VARCHAR(20) UNIQUE,
  `password` VARCHAR(255),
  `role` ENUM('user', 'admin', 'editor') DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `avatar` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` MEDIUMTEXT NULL,
  `category` VARCHAR(64) DEFAULT NULL,
  `status` ENUM('draft','published') DEFAULT 'published',
  `visible` TINYINT(1) DEFAULT 1,
  `cover` VARCHAR(255) DEFAULT NULL,
  `views` INT DEFAULT 0,
  `likes` INT DEFAULT 0,
  `author_id` BIGINT UNSIGNED DEFAULT NULL,
  `summary` TEXT,
  `tags` JSON,
  `seo_title` VARCHAR(255),
  `seo_description` TEXT,
  `seo_keywords` VARCHAR(255),
  `comments_count` INT DEFAULT 0,
  `likes_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 公告表
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` MEDIUMTEXT NULL,
  `status` ENUM('draft','published') DEFAULT 'published',
  `visible` TINYINT(1) DEFAULT 1,
  `author_id` BIGINT UNSIGNED DEFAULT NULL,
  `summary` TEXT,
  `priority` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 活动表
CREATE TABLE IF NOT EXISTS `activities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `location` VARCHAR(255),
  `start_time` DATETIME,
  `end_time` DATETIME,
  `max_participants` INT DEFAULT NULL,
  `current_participants` INT DEFAULT 0,
  `cover` VARCHAR(255),
  `status` ENUM('draft','published','cancelled') DEFAULT 'published',
  `visible` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户活动关联表
CREATE TABLE IF NOT EXISTS `user_activities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `activity_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('registered','cancelled','attended') DEFAULT 'registered',
  `registration_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_activity` (`user_id`, `activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章评论表
CREATE TABLE IF NOT EXISTS `article_comments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `parent_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('active','hidden','deleted') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `article_comments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章点赞表
CREATE TABLE IF NOT EXISTS `article_likes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_article_like` (`user_id`, `article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章收藏表
CREATE TABLE IF NOT EXISTS `article_favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_article_favorite` (`user_id`, `article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 热门文章表
CREATE TABLE IF NOT EXISTS `hotarticles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT,
  `cover` VARCHAR(255),
  `category` VARCHAR(64),
  `author` VARCHAR(100),
  `views` INT DEFAULT 0,
  `likes` INT DEFAULT 0,
  `comments_count` INT DEFAULT 0,
  `hot_score` DECIMAL(5,2) DEFAULT 0.00,
  `featured` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 插入测试数据
-- =============================================

-- 插入默认用户
INSERT INTO `users` (`username`, `nickname`, `email`, `password`, `role`) VALUES
('admin', '管理员', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user', '普通用户', 'user@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON DUPLICATE KEY UPDATE username=username;

-- 插入示例文章
INSERT INTO `articles` (`title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`) VALUES
('地方传统美食背后的故事', '探索地方传统美食的历史渊源和文化内涵...', '传统文化', 'published', 1, '/assets/food1.jpg', 1200, 85),
('木版年画的传承与创新', '传统木版年画技艺的传承现状与现代创新应用...', '手工艺', 'published', 1, '/assets/painting.jpg', 980, 72),
('民俗节庆与社区凝聚力', '传统节庆活动如何增强社区凝聚力...', '民俗节庆', 'published', 1, '/assets/festival.jpg', 750, 58)
ON DUPLICATE KEY UPDATE title=title;

-- 插入示例活动
INSERT INTO `activities` (`title`, `description`, `location`, `start_time`, `end_time`, `max_participants`, `cover`, `status`) VALUES
('传统手工艺体验活动', '学习传统手工艺制作技巧', '文化中心', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 30, '/assets/craft.jpg', 'published'),
('地方美食文化节', '品尝地方特色美食，了解饮食文化', '美食广场', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 50, '/assets/food1.jpg', 'published')
ON DUPLICATE KEY UPDATE title=title;

-- 插入示例公告
INSERT INTO `announcements` (`title`, `content`, `status`, `visible`) VALUES
('欢迎使用本地文化平台', '这是一个展示和传承地方传统文化的平台...', 'published', 1),
('平台使用说明', '请仔细阅读平台使用说明，了解各项功能...', 'published', 1)
ON DUPLICATE KEY UPDATE title=title;

-- =============================================
-- 创建索引以提高查询性能
-- =============================================

-- 文章表索引
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_visible ON articles(visible);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_author ON articles(author_id);

-- 活动表索引
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_visible ON activities(visible);
CREATE INDEX idx_activities_time ON activities(start_time);

-- 用户活动索引
CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity ON user_activities(activity_id);

-- 评论表索引
CREATE INDEX idx_comments_article ON article_comments(article_id);
CREATE INDEX idx_comments_user ON article_comments(user_id);
CREATE INDEX idx_comments_status ON article_comments(status);

-- 点赞表索引
CREATE INDEX idx_likes_article ON article_likes(article_id);
CREATE INDEX idx_likes_user ON article_likes(user_id);

-- 收藏表索引
CREATE INDEX idx_favorites_article ON article_favorites(article_id);
CREATE INDEX idx_favorites_user ON article_favorites(user_id);

-- 热门文章索引
CREATE INDEX idx_hotarticles_status ON hotarticles(status);
CREATE INDEX idx_hotarticles_score ON hotarticles(hot_score);

SELECT 'Database schema created successfully!' as message;
