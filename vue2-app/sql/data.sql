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
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (1, '传统文化保护的重要性','传统文化是一个民族的精神财富，保护传统文化对于维护民族特色、传承历史文明具有重要意义。\n\n## 传统文化的重要性\n\n传统文化承载着一个民族的历史记忆、价值观念和生活方式，是民族认同感的重要来源。通过保护传统文化，我们可以：\n\n1. 维护民族特色\n2. 传承历史文明\n3. 增强文化自信\n4. 促进社会和谐\n\n## 保护措施\n\n为了更好地保护传统文化，我们需要：\n\n- 加强教育宣传\n- 建立保护机制\n- 创新发展方式\n- 国际合作交流\n\n让我们共同努力，为传统文化的传承和发展贡献力量。', '传统文化', 'published', 1, '/assets/craft.jpg', 1209, 46, '2025-10-20 13:47:50', '2025-10-22 05:46:06', 9, NULL, '["保护", "传承", "文化", "历史"]', NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (2, '民俗节庆的多样性','民俗节庆是中华民族丰富多彩的文化遗产，蕴含着深厚的历史价值和民族特色。\n\n## 民俗节庆的多样性\n\n民俗节庆是中华民族丰富多彩的文化遗产，蕴含着深厚的历史价值和民族特色。通过传承民俗节庆，我们可以：\n\n1. 传承民族文化\n2. 增强民族认同\n3. 促进文化交流\n4. 丰富精神生活\n\n## 民俗节庆的保护\n\n为了更好地保护民俗节庆，我们需要：\n\n- 加强教育宣传\n- 建立保护机制\n- 创新发展方式\n- 国际合作交流\n\n让我们共同努力，为民俗节庆的传承和发展贡献力量。', '民俗节庆', 'published', 1, '/assets/festival.jpg', 860, 28, '2025-10-20 13:47:50', '2025-10-22 05:46:06', 9, NULL, '["节庆", "民俗", "传承", "文化"]', NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (3, '传统文化保护的重要性','传统文化是一个民族的精神财富，保护传统文化对于维护民族特色、传承历史文明具有重要意义。\n\n## 传统文化的重要性\n\n传统文化承载着一个民族的历史记忆、价值观念和生活方式，是民族认同感的重要来源。通过保护传统文化，我们可以：\n\n1. 维护民族特色\n2. 传承历史文明\n3. 增强文化自信\n4. 促进社会和谐\n\n## 保护措施\n\n为了更好地保护传统文化，我们需要：\n\n- 加强教育宣传\n- 建立保护机制\n- 创新发展方式\n- 国际合作交流\n\n让我们共同努力，为传统文化的传承和发展贡献力量。', '传统文化', 'published', 1, '/assets/craft.jpg', 1207, 46, '2025-10-20 14:07:34', '2025-10-22 05:46:06', 9, NULL, '["保护", "传承", "文化", "历史"]', NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (4, '传统手工艺', '传统手工艺是中华民族的宝贵财富，蕴含着深厚的历史价值和文化内涵。\n\n## 传统手工艺的多样性\n\n传统手工艺是中华民族的宝贵财富，蕴含着深厚的历史价值和文化内涵。通过传承传统手工艺，我们可以：\n\n1. 传承民族文化\n2. 增强民族认同\n3. 促进文化交流\n4. 丰富精神生活\n\n## 传统手工艺的保护\n\n为了更好地保护传统手工艺，我们需要：\n\n- 加强教育宣传\n- 建立保护机制\n- 创新发展方式\n- 国际合作交流\n\n让我们共同努力，为传统手工艺的传承和发展贡献力量。', '手工艺', 'published', 1, '/assets/craft.jpg', 900, 40, '2025-10-22 04:08:25', '2025-10-22 05:46:06', 9, NULL, '["手工艺", "技艺", "传承", "保护", "艺术"]', NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (5, '传统节日', '传统节日是中华民族丰富多彩的文化遗产，蕴含着深厚的历史价值和民族特色。\n\n## 传统节日的多样性\n\n传统节日是中华民族丰富多彩的文化遗产，蕴含着深厚的历史价值和民族特色。通过传承传统节日，我们可以：\n\n1. 传承民族文化\n2. 增强民族认同\n3. 促进文化交流\n4. 丰富精神生活\n\n## 传统节日的保护\n\n为了更好地保护传统节日，我们需要：\n\n- 加强教育宣传\n- 建立保护机制\n- 创新发展方式\n- 国际合作交流\n\n让我们共同努力，为传统节日的传承和发展贡献力量。', '民俗节庆', 'published', 1, NULL, 4, 2, '2025-10-20 14:29:02', '2025-10-22 05:46:06', 9, NULL, '["节庆", "传统", "民俗", "文化"]', NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (6, '地方传统美食背后的故事', '地方传统美食是中华民族的宝贵财富，蕴含着深厚的历史价值和文化内涵。\n\n## 地方传统美食的多样性\n\n地方传统美食是中华民族的宝贵财富，蕴含着深厚的历史价值和文化内涵。通过传承地方传统美食，我们可以：\n\n1. 传承民族文化\n2. 增强民族认同\n3. 促进文化交流\n4. 丰富精神生活\n\n## 地方传统美食的保护\n\n为了更好地保护地方传统美食，我们需要：\n\n- 加强教育宣传\n- 建立保护机制\n- 创新发展方式\n- 国际合作交流\n\n让我们共同努力，为地方传统美食的传承和发展贡献力量。', '地方传统美食', 'published', 1, NULL, 30, 2, '2025-10-20 14:49:32', '2025-10-22 05:46:06', 9, NULL, '["美食", "文化", "历史", "传统"]', NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (11, '测试帖子', '测试帖子测试帖子测试帖子', '其他', 'published', 1, NULL, 5, 1, '2025-10-22 05:50:39', '2025-10-22 16:07:39', 7, NULL, '["测试"]', NULL, NULL, NULL, 0, 0);

-- 表: announcements
DELETE FROM `announcements`;
INSERT INTO `announcements` (`id`, `title`, `content`, `status`, `visible`, `author_id`, `summary`, `priority`, `created_at`, `updated_at`) VALUES
(1, '系统维护通知', '尊敬的用户：

系统将于今晚（10月30日）22:00-24:00进行例行维护升级，期间可能影响正常使用，请提前做好准备。

**维护内容包括：**
1. 数据库优化和性能提升
2. 服务器安全补丁更新
3. 功能模块升级和完善
4. 系统稳定性改进

**维护影响：**
- 维护期间用户可能无法正常访问平台
- 正在进行的数据操作请提前保存
- 维护完成后所有功能将恢复正常

维护期间如有紧急情况，请联系客服邮箱：support@localculture.com

感谢您的理解与支持！', 'published', 1, 1, '系统将于今晚22:00-24:00进行维护升级，期间可能影响正常使用', 1, '2025-10-29 10:00:00', '2025-10-29 10:00:00'),
(2, '春节传统文化知识竞赛活动', '亲爱的用户朋友们：

为庆祝新春佳节，弘扬传统文化，我们特别推出"春节传统文化知识竞赛"活动！

**活动时间：**
2025年1月20日 - 2025年2月10日

**活动内容：**
- 传统文化知识问答竞赛
- 参与即可获得精美礼品
- 成绩优异者可获得丰厚奖励

**参与方式：**
1. 登录平台，进入活动页面
2. 完成在线答题
3. 分享活动链接，邀请好友参与可获得额外奖励

**奖品设置：**
- 一等奖：传统文化纪念品套装（3名）
- 二等奖：精美文创产品（10名）
- 参与奖：平台积分和优惠券（所有参与者）

让我们一起在传统文化的海洋中探索，传承中华民族的优秀文化！

期待您的积极参与！', 'published', 1, 1, '春节传统文化知识竞赛活动即将开启，参与即有机会获得精美奖品', 1, '2025-10-28 12:00:00', '2025-10-28 12:00:00'),
(3, '用户协议更新通知', '尊敬的用户：

根据相关法律法规的要求，我们已对《用户服务协议》和《隐私政策》进行了更新和完善。

**主要更新内容：**
1. 明确数据使用和隐私保护条款
2. 完善用户权利和义务说明
3. 更新平台服务内容描述
4. 规范社区行为准则

**生效时间：**
新版协议将于2025年11月1日正式生效

**重要提示：**
请您仔细阅读新的服务协议和隐私政策。继续使用我们的服务即表示您同意接受更新后的协议条款。

如果您对新协议有任何疑问，欢迎通过以下方式联系我们：
- 客服邮箱：support@localculture.com
- 在线客服：工作日 9:00-18:00

感谢您一直以来对我们的支持与信任！', 'published', 1, 1, '用户服务协议和隐私政策已更新，请仔细阅读新版协议', 0, '2025-10-27 09:30:00', '2025-10-27 09:30:00'),
(4, '新功能上线：收藏与分享功能', '大家好！

我们很高兴地宣布，平台新增了文章收藏和分享功能，让您更好地管理和传播优秀的文化内容！

**新增功能：**
1. **文章收藏**
   - 一键收藏感兴趣的文章
   - 在个人中心统一管理收藏内容
   - 方便随时回顾和学习

2. **内容分享**
   - 支持分享到微信、微博等社交平台
   - 生成专属分享链接
   - 让更多人了解传统文化

3. **阅读历史**
   - 自动记录您的阅读足迹
   - 快速找到之前浏览的内容
   - 个性化推荐相关文章

**使用提示：**
- 点击文章详情页的"收藏"按钮即可收藏
- 使用"分享"功能可将内容分享给好友
- 在个人中心可以查看和管理收藏与历史记录

我们一直在努力提升用户体验，感谢您的支持与反馈！

如有任何问题或建议，欢迎随时联系我们。', 'published', 1, 1, '平台新增收藏、分享和阅读历史功能，让您更好地管理文化内容', 0, '2025-10-26 15:20:00', '2025-10-26 15:20:00'),
(5, '传统文化体验活动报名开启', '亲爱的文化爱好者们：

我们将于11月15日举办"传统文化体验日"线下活动，现正式开启报名！

**活动主题：**
探索传统手工艺的魅力

**活动时间：**
2025年11月15日（周六）上午9:00-下午5:00

**活动地点：**
市文化中心（具体地址：XX市XX区XX路XX号）

**活动内容：**
- 传统手工艺制作体验（剪纸、泥塑、编织等）
- 非遗传承人现场教学
- 传统美食制作体验
- 文化知识讲座和交流

**报名方式：**
1. 登录平台，进入"活动"页面
2. 找到"传统文化体验日"活动
3. 点击"立即报名"并填写报名信息
4. 报名成功后将收到确认通知

**报名名额：**
限50人，先到先得！

**费用说明：**
活动费用：100元/人（包含材料费和午餐）
平台会员享受8折优惠

**注意事项：**
- 报名截止时间：11月10日
- 请准时参加，迟到可能影响活动体验
- 活动期间请遵守现场秩序

期待与您一起度过一个充满文化气息的美好周末！', 'published', 1, 1, '传统文化体验日活动报名开启，限50人，先到先得', 1, '2025-10-25 14:00:00', '2025-10-25 14:00:00'),
(6, '内容发布规范提醒', '尊敬的用户：

为了维护良好的社区氛围，确保平台内容质量，请您在发布内容时遵守以下规范：

**发布要求：**
1. 内容需与传统文化相关
2. 原创或注明转载来源
3. 内容真实、准确、有价值
4. 文字表述清晰，排版规范

**禁止内容：**
- 违法违规、低俗不良信息
- 虚假、误导性内容
- 恶意攻击、人身攻击
- 商业广告（未经许可）

**审核说明：**
- 所有发布内容需经管理员审核
- 审核时间：1-3个工作日
- 审核通过后会及时通知您
- 未通过审核的内容将被退回并说明原因

**版权声明：**
- 用户发布的内容需保证拥有合法权利
- 如发生版权纠纷，发布者需承担相应责任
- 平台对优秀原创内容提供保护

感谢您的理解与配合，让我们共同营造一个优质的传统文化交流平台！', 'published', 1, 1, '请遵守内容发布规范，确保平台内容质量和社区氛围', 0, '2025-10-24 11:00:00', '2025-10-24 11:00:00'),
(7, '平台版本更新 v2.0', '各位用户好！

平台已完成重大版本更新，v2.0版本带来了全新的体验和功能优化！

**主要更新：**

1. **界面优化**
   - 全新的UI设计，更加美观易用
   - 响应式布局，完美适配各种设备
   - 优化的导航和分类系统

2. **功能增强**
   - 改进的搜索功能，支持模糊搜索和标签筛选
   - 新增评论点赞和回复功能
   - 优化的用户个人中心

3. **性能提升**
   - 页面加载速度提升50%
   - 优化数据库查询性能
   - 改善移动端使用体验

4. **安全性改进**
   - 加强数据加密保护
   - 完善用户隐私保护机制
   - 优化安全验证流程

**使用建议：**
- 首次使用建议清除浏览器缓存
- 如遇到问题，请尝试刷新页面或重新登录
- 欢迎反馈使用体验和建议

**致谢：**
感谢所有用户的支持和反馈，你们的意见是我们改进的动力！

让我们一起见证传统文化的传承与发展！', 'published', 1, 1, '平台v2.0版本更新完成，带来全新界面和功能优化', 0, '2025-10-23 16:00:00', '2025-10-23 16:00:00');

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

-- 表: forum_posts
DELETE FROM `forum_posts`;
INSERT INTO `forum_posts` (`id`, `title`, `content`, `category`, `author_id`, `views`, `likes`, `favorites_count`, `comments_count`, `status`, `visible`) VALUES
(1, '传统文化保护的重要性讨论', '大家好，我想和大家讨论一下传统文化保护的重要性。随着现代化进程的加快，很多传统文化面临失传的危险。我们应该如何在保护传统文化和现代发展之间找到平衡点呢？欢迎大家发表看法。', '传统文化', 2, 150, 0, 0, 0, 'published', 1),
(2, '地方美食制作技巧分享', '今天想给大家分享一些地方传统美食的制作技巧。这些美食不仅美味，而且承载着深厚的文化内涵。比如我们当地的特色糕点，需要经过十几道工序，每一步都有讲究。有兴趣的朋友可以一起交流学习。', '饮食文化', 2, 120, 0, 0, 0, 'published', 1),
(3, '手工艺学习心得分享', '最近参加了一个传统手工艺学习班，收获颇丰，想和大家分享一下学习心得。手工艺制作不仅需要技巧，更需要耐心和对传统文化的热爱。每一件作品都是独一无二的，这就是手工艺的魅力所在。', '手工艺', 2, 95, 0, 0, 0, 'published', 1),
(4, '民俗节庆活动组织经验', '我们社区每年都会组织民俗节庆活动，通过这些活动让更多年轻人了解传统文化。今天想和大家分享一些组织经验，希望能对其他社区有所帮助。', '民俗节庆', 2, 80, 0, 0, 0, 'published', 1),
(5, '地方戏曲欣赏入门指南', '很多年轻人对地方戏曲不太了解，觉得难以欣赏。其实只要掌握一些基础知识，就能体会到戏曲的独特魅力。这里我整理了一份入门指南，希望能帮助大家更好地欣赏地方戏曲。', '音乐舞蹈', 2, 65, 0, 0, 0, 'published', 1);

-- 表: forum_post_likes
DELETE FROM `forum_post_likes`;
INSERT INTO `forum_post_likes` (`post_id`, `user_id`, `created_at`) VALUES
(1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 2, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 更新论坛帖子点赞数
UPDATE `forum_posts` SET likes = likes + 1 WHERE id IN (1, 2, 3, 4, 5);

-- 表: forum_post_favorites
DELETE FROM `forum_post_favorites`;
INSERT INTO `forum_post_favorites` (`post_id`, `user_id`, `created_at`) VALUES
(1, 2, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 2, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 2, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 更新论坛帖子收藏数
UPDATE `forum_posts` SET favorites_count = favorites_count + 1 WHERE id IN (1, 2, 4);

-- 表: forum_post_comments
DELETE FROM `forum_post_comments`;
INSERT INTO `forum_post_comments` (`post_id`, `user_id`, `content`, `status`, `created_at`) VALUES
(1, 2, '说得很对，传统文化保护确实非常重要！我们这一代人有责任把优秀的传统文化传承下去。', 'active', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 2, '感谢分享，学到了很多！这些传统美食的制作技巧很实用，周末试着做一做。', 'active', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 2, '手工艺学习需要很大的耐心，坚持就是胜利！期待看到你的作品分享。', 'active', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 2, '民俗节庆活动是传承文化的好方式，我们社区也应该多组织这样的活动。', 'active', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 2, '这份指南很实用，让我对地方戏曲有了新的认识，准备去剧院看一场。', 'active', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 更新论坛帖子评论数
UPDATE `forum_posts` SET comments_count = comments_count + 1 WHERE id IN (1, 2, 3, 4, 5);

-- 添加测试文章
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `author_id`, `summary`, `tags`) VALUES
(20, '传统节日的现代传承方式', '传统节日是民族文化的重要载体。在现代社会中，如何让年轻一代更好地理解和参与传统节日，是我们需要思考的问题。本文探讨了几种创新的传承方式，包括线上活动、文化体验馆、节日市集等，希望能为传统节日的现代传承提供一些思路。', '民俗节庆', 'published', 1, '/assets/festival.jpg', 320, 0, 2, '探讨传统节日在现代社会中的创新传承方式', '["节庆", "传承", "创新", "教育"]'),
(21, '手工艺品的市场发展前景', '随着人们对传统文化认识的提高，手工艺品市场呈现出良好的发展态势。本文分析了当前手工艺品市场的现状、发展趋势和机遇挑战，并提出了一些建议，希望能帮助手工艺从业者更好地发展。', '手工艺', 'published', 1, '/assets/craft.jpg', 280, 0, 2, '分析手工艺品市场的发展现状和前景', '["手工艺", "技艺", "市场", "创新"]'),
(22, '地方方言保护的紧迫性', '地方方言是地域文化的重要组成部分，承载着丰富的历史信息和文化内涵。然而，在普通话推广的背景下，许多地方方言面临着逐渐消失的危险。我们应该重视方言保护，让这些宝贵的文化遗产得以传承。', '传统文化', 'published', 1, '/assets/language.jpg', 250, 0, 2, '呼吁重视地方方言的保护和传承工作', '["保护", "方言", "文化", "历史"]'),
(23, '传统音乐的教育传承', '传统音乐是非物质文化遗产的重要组成部分。如何通过教育手段让更多年轻人接触和学习传统音乐，是当前面临的重要课题。本文介绍了一些成功的教育传承案例，希望能提供借鉴。', '音乐舞蹈', 'published', 1, '/assets/music.jpg', 210, 0, 2, '探讨传统音乐的教育传承路径和方法', '["音乐", "教育", "传承", "艺术"]'),
(24, '古建筑保护与旅游开发的平衡', '古建筑既是珍贵的文化遗产，也是重要的旅游资源。如何在保护古建筑的同时，合理开发其旅游价值，实现保护与利用的平衡，是值得深入探讨的问题。', '古建筑', 'published', 1, '/assets/museum.jpg', 190, 0, 2, '探讨古建筑保护与旅游开发的平衡策略', '["古建筑", "保护", "旅游", "文化"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 文章点赞数据
INSERT INTO `article_likes` (`article_id`, `user_id`, `created_at`) VALUES
(20, 2, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(21, 2, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(22, 2, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(23, 2, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(24, 2, DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE article_id=article_id;

UPDATE `articles` SET likes = likes + 1 WHERE id IN (20, 21, 22, 23, 24);

-- 文章收藏数据
INSERT INTO `article_favorites` (`article_id`, `user_id`, `created_at`) VALUES
(20, 2, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(22, 2, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(24, 2, DATE_SUB(NOW(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE article_id=article_id;

-- 文章评论数据
INSERT INTO `article_comments` (`article_id`, `user_id`, `content`, `status`, `created_at`) VALUES
(20, 2, '传统节日的现代传承确实需要创新，线上活动是个不错的方式。', 'active', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(21, 2, '手工艺品市场前景看好，希望更多人能关注和支持传统手工艺。', 'active', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(22, 2, '方言保护刻不容缓！作为年轻一代，我们也要学习和使用方言。', 'active', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(23, 2, '传统音乐教育很重要，学校应该开设相关课程。', 'active', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(24, 2, '古建筑保护和旅游开发确实需要平衡。', 'active', DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE content=content;


-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 数据导出完成
SELECT 'Data export completed successfully!' as message;
