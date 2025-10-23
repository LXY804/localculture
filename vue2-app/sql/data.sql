-- =============================================
-- 本地文化平台 - 数据库数据导出
-- 生成时间: 2025-10-23T07:35:04.960Z
-- =============================================

USE `localculture`;

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 表: users
DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (1, 'admin', '系统管理员', NULL, '13800000000', '123', 'admin', 'active', NULL, '2025-10-20 15:01:28', '2025-10-22 05:53:24');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (2, 'user001', '文化爱好者', NULL, '18271209635', '123', 'user', 'active', NULL, '2025-10-20 15:01:28', '2025-10-21 15:34:21');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (3, 'editor01', '内容编辑', NULL, '13900000001', NULL, 'editor', 'active', NULL, '2025-10-20 15:01:28', '2025-10-20 15:01:28');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (7, 'LLL', 'LLL', 'lxy20050588@qq.com', '15871232205', '123456', 'user', 'active', 'http://localhost:3001/uploads/avatar-1761061885216-736565727.jpg', '2025-10-20 15:11:59', '2025-10-22 03:23:05');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (9, 'user1', '普通用户', 'user1@example.com', NULL, 'user123', 'user', 'active', NULL, '2025-10-22 04:46:59', '2025-10-22 04:46:59');

-- 表: articles
DELETE FROM `articles`;
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (1, '传统文化保护的重要性', NULL, '传统文化', 'published', 1, '/assets/craft.jpg', 1209, 46, '2025-10-20 13:47:50', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (2, '民俗节庆的多样性', NULL, '民俗节庆', 'published', 1, '/assets/festival.jpg', 860, 28, '2025-10-20 13:47:50', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (3, '传统文化保护的重要性', NULL, '传统文化', 'published', 1, '/assets/craft.jpg', 1207, 46, '2025-10-20 14:07:34', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (4, '传统手工艺', '2222222222222', '手工艺', 'published', 1, '/assets/craft.jpg', 900, 40, '2025-10-22 04:08:25', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (5, '传统节日', '传统节日传统节日传统节日', NULL, 'published', 1, NULL, 4, 2, '2025-10-20 14:29:02', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (6, '地方传统美食背后的故事', '我想吃臭豆腐', NULL, 'published', 1, NULL, 30, 2, '2025-10-20 14:49:32', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (11, '测试帖子', '测试帖子测试帖子测试帖子', NULL, 'published', 1, NULL, 5, 1, '2025-10-22 05:50:39', '2025-10-22 16:07:39', 7, NULL, NULL, NULL, NULL, NULL, 0, 0);

-- 表: announcements (无数据)

-- 表: activities
DELETE FROM `activities`;
INSERT INTO `activities` (`id`, `title`, `description`, `location`, `start_time`, `end_time`, `max_participants`, `current_participants`, `cover`, `status`, `visible`, `created_at`, `updated_at`) VALUES (1, '非遗市集', '展示传统手工艺品，体验非遗文化', '市文化广场', '2025-10-28 02:00:00', '2025-11-20 10:00:00', 100, 2, '/assets/craft.jpg', 'published', 1, '2025-10-22 15:49:33', '2025-10-22 16:08:17');
INSERT INTO `activities` (`id`, `title`, `description`, `location`, `start_time`, `end_time`, `max_participants`, `current_participants`, `cover`, `status`, `visible`, `created_at`, `updated_at`) VALUES (2, '传统音乐节', '传统乐器演奏，感受古典音乐魅力', '音乐厅', '2024-01-25 11:00:00', '2024-01-25 13:00:00', 200, 0, '/assets/music.jpg', 'published', 1, '2025-10-22 15:49:33', '2025-10-22 15:49:33');
INSERT INTO `activities` (`id`, `title`, `description`, `location`, `start_time`, `end_time`, `max_participants`, `current_participants`, `cover`, `status`, `visible`, `created_at`, `updated_at`) VALUES (3, '民俗文化展', '展示各地民俗文化，了解传统习俗', '博物馆', '2024-01-30 01:00:00', '2024-01-30 09:00:00', 150, 0, '/assets/museum.jpg', 'published', 1, '2025-10-22 15:49:33', '2025-10-22 15:49:33');

-- 表: user_activities
DELETE FROM `user_activities`;
INSERT INTO `user_activities` (`id`, `user_id`, `activity_id`, `status`, `registration_time`, `notes`, `created_at`, `updated_at`) VALUES (1, 7, 1, 'registered', '2025-10-22 16:00:42', NULL, '2025-10-22 16:00:42', '2025-10-22 16:00:42');
INSERT INTO `user_activities` (`id`, `user_id`, `activity_id`, `status`, `registration_time`, `notes`, `created_at`, `updated_at`) VALUES (2, 1, 1, 'registered', '2025-10-22 16:08:17', NULL, '2025-10-22 16:08:17', '2025-10-22 16:08:17');

-- 表: article_comments
DELETE FROM `article_comments`;
INSERT INTO `article_comments` (`id`, `article_id`, `user_id`, `content`, `parent_id`, `status`, `created_at`, `updated_at`) VALUES (1, 1, 9, 'This is a test comment', NULL, 'active', '2025-10-22 04:47:42', '2025-10-22 04:47:42');

-- 表: article_likes
DELETE FROM `article_likes`;
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (2, 6, 7, '2025-10-22 04:56:56');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (3, 5, 7, '2025-10-22 04:57:09');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (5, 1, 9, '2025-10-22 04:59:30');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (6, 3, 7, '2025-10-22 05:00:45');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (7, 5, 9, '2025-10-22 05:07:53');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (8, 6, 9, '2025-10-22 05:23:11');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (9, 11, 1, '2025-10-22 16:07:39');

-- 表: article_favorites
DELETE FROM `article_favorites`;
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (1, 1, 9, '2025-10-22 04:47:22');
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (2, 3, 7, '2025-10-22 04:57:35');
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (3, 6, 7, '2025-10-22 05:24:27');
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (4, 6, 1, '2025-10-22 16:08:01');

-- 表: hotarticles
DELETE FROM `hotarticles`;
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (1, 6, '地方传统美食背后的故事', '探索地方传统美食的历史渊源和文化内涵，了解每一道菜背后的故事。', '/assets/food1.jpg', '传统文化', '美食专家', 1212, 86, 23, '95.50', 0, 'active', 1, '2025-10-22 03:50:09', '2025-10-22 16:08:01');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (2, 5, '木版年画的传承与创新', '传统木版年画技艺的传承现状与现代创新应用，保护非遗文化。', '/assets/painting.jpg', '手工艺', '非遗传承人', 982, 72, 18, '88.20', 0, 'active', 0, '2025-10-22 03:50:09', '2025-10-22 15:13:35');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (3, 3, '民俗节庆与社区凝聚力', '传统节庆活动如何增强社区凝聚力，促进邻里关系和谐发展。', '/assets/festival.jpg', '民俗节庆', '社区研究员', 750, 58, 15, '82.10', 0, 'active', 1, '2025-10-22 03:50:09', '2025-10-22 03:50:09');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (4, 2, '戏曲进校园的传承实践', '戏曲艺术在校园中的传承实践，培养年轻一代对传统文化的兴趣。', '/assets/campus.jpg', '音乐舞蹈', '教育专家', 650, 45, 12, '75.80', 0, 'active', 0, '2025-10-22 03:50:09', '2025-10-22 03:50:09');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (5, 1, '地方方言里的文化密码', '探索地方方言中蕴含的文化密码，了解语言与文化的深层联系。', '/assets/language.jpg', '传统文化', '语言学家', 580, 38, 9, '70.30', 0, 'active', 0, '2025-10-22 03:50:09', '2025-10-22 03:50:09');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (6, 4, '手工艺', '探寻手工艺之美', '/assets/craft.jpg', '手工艺', 'LLL', 900, 40, 0, '0.00', 0, 'active', 0, '2025-10-22 04:09:49', '2025-10-22 04:09:49');

-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 数据导出完成
SELECT 'Data export completed successfully!' as message;
