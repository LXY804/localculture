-- =============================================
-- 鏈湴鏂囧寲骞冲彴 - 鏁版嵁搴撴暟鎹鍑?
-- 鐢熸垚鏃堕棿: 2025-10-23T07:35:04.960Z
-- =============================================

USE `localculture`;

-- 绂佺敤澶栭敭妫€鏌?
SET FOREIGN_KEY_CHECKS = 0;

-- 琛? users
DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (1, 'admin', '绯荤粺绠＄悊鍛?, NULL, '13800000000', '123', 'admin', 'active', NULL, '2025-10-20 15:01:28', '2025-10-22 05:53:24');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (2, 'user001', '鏂囧寲鐖卞ソ鑰?, NULL, '18271209635', '123', 'user', 'active', NULL, '2025-10-20 15:01:28', '2025-10-21 15:34:21');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (3, 'editor01', '鍐呭缂栬緫', NULL, '13900000001', NULL, 'editor', 'active', NULL, '2025-10-20 15:01:28', '2025-10-20 15:01:28');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (7, 'LLL', 'LLL', 'lxy20050588@qq.com', '15871232205', '123456', 'user', 'active', 'http://localhost:3001/uploads/avatar-1761061885216-736565727.jpg', '2025-10-20 15:11:59', '2025-10-22 03:23:05');
INSERT INTO `users` (`id`, `username`, `nickname`, `email`, `phone`, `password`, `role`, `status`, `avatar`, `created_at`, `updated_at`) VALUES (9, 'user1', '鏅€氱敤鎴?, 'user1@example.com', NULL, 'user123', 'user', 'active', NULL, '2025-10-22 04:46:59', '2025-10-22 04:46:59');

-- 琛? articles
DELETE FROM `articles`;
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (1, '浼犵粺鏂囧寲淇濇姢鐨勯噸瑕佹€?, NULL, '浼犵粺鏂囧寲', 'published', 1, '/assets/craft.jpg', 1209, 46, '2025-10-20 13:47:50', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (2, '姘戜織鑺傚簡鐨勫鏍锋€?, NULL, '姘戜織鑺傚簡', 'published', 1, '/assets/festival.jpg', 860, 28, '2025-10-20 13:47:50', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (3, '浼犵粺鏂囧寲淇濇姢鐨勯噸瑕佹€?, NULL, '浼犵粺鏂囧寲', 'published', 1, '/assets/craft.jpg', 1207, 46, '2025-10-20 14:07:34', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (4, '浼犵粺鎵嬪伐鑹?, '2222222222222', '鎵嬪伐鑹?, 'published', 1, '/assets/craft.jpg', 900, 40, '2025-10-22 04:08:25', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (5, '浼犵粺鑺傛棩', '浼犵粺鑺傛棩浼犵粺鑺傛棩浼犵粺鑺傛棩', NULL, 'published', 1, NULL, 4, 2, '2025-10-20 14:29:02', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (6, '鍦版柟浼犵粺缇庨鑳屽悗鐨勬晠浜?, '鎴戞兂鍚冭嚟璞嗚厫', NULL, 'published', 1, NULL, 30, 2, '2025-10-20 14:49:32', '2025-10-22 05:46:06', 9, NULL, NULL, NULL, NULL, NULL, 0, 0);
INSERT INTO `articles` (`id`, `title`, `content`, `category`, `status`, `visible`, `cover`, `views`, `likes`, `created_at`, `updated_at`, `author_id`, `summary`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `comments_count`, `likes_count`) VALUES (11, '娴嬭瘯甯栧瓙', '娴嬭瘯甯栧瓙娴嬭瘯甯栧瓙娴嬭瘯甯栧瓙', NULL, 'published', 1, NULL, 5, 1, '2025-10-22 05:50:39', '2025-10-22 16:07:39', 7, NULL, NULL, NULL, NULL, NULL, 0, 0);

-- 琛? announcements (鏃犳暟鎹?

-- 琛? activities
DELETE FROM `activities`;
INSERT INTO `activities` (`id`, `title`, `description`, `location`, `start_time`, `end_time`, `max_participants`, `current_participants`, `cover`, `status`, `visible`, `created_at`, `updated_at`) VALUES (1, '闈為仐甯傞泦', '灞曠ず浼犵粺鎵嬪伐鑹哄搧锛屼綋楠岄潪閬楁枃鍖?, '甯傛枃鍖栧箍鍦?, '2025-10-28 02:00:00', '2025-11-20 10:00:00', 100, 2, '/assets/craft.jpg', 'published', 1, '2025-10-22 15:49:33', '2025-10-22 16:08:17');
INSERT INTO `activities` (`id`, `title`, `description`, `location`, `start_time`, `end_time`, `max_participants`, `current_participants`, `cover`, `status`, `visible`, `created_at`, `updated_at`) VALUES (2, '浼犵粺闊充箰鑺?, '浼犵粺涔愬櫒婕斿锛屾劅鍙楀彜鍏搁煶涔愰瓍鍔?, '闊充箰鍘?, '2024-01-25 11:00:00', '2024-01-25 13:00:00', 200, 0, '/assets/music.jpg', 'published', 1, '2025-10-22 15:49:33', '2025-10-22 15:49:33');
INSERT INTO `activities` (`id`, `title`, `description`, `location`, `start_time`, `end_time`, `max_participants`, `current_participants`, `cover`, `status`, `visible`, `created_at`, `updated_at`) VALUES (3, '姘戜織鏂囧寲灞?, '灞曠ず鍚勫湴姘戜織鏂囧寲锛屼簡瑙ｄ紶缁熶範淇?, '鍗氱墿棣?, '2024-01-30 01:00:00', '2024-01-30 09:00:00', 150, 0, '/assets/museum.jpg', 'published', 1, '2025-10-22 15:49:33', '2025-10-22 15:49:33');

-- 琛? user_activities
DELETE FROM `user_activities`;
INSERT INTO `user_activities` (`id`, `user_id`, `activity_id`, `status`, `registration_time`, `notes`, `created_at`, `updated_at`) VALUES (1, 7, 1, 'registered', '2025-10-22 16:00:42', NULL, '2025-10-22 16:00:42', '2025-10-22 16:00:42');
INSERT INTO `user_activities` (`id`, `user_id`, `activity_id`, `status`, `registration_time`, `notes`, `created_at`, `updated_at`) VALUES (2, 1, 1, 'registered', '2025-10-22 16:08:17', NULL, '2025-10-22 16:08:17', '2025-10-22 16:08:17');

-- 琛? article_comments
DELETE FROM `article_comments`;
INSERT INTO `article_comments` (`id`, `article_id`, `user_id`, `content`, `parent_id`, `status`, `created_at`, `updated_at`) VALUES (1, 1, 9, 'This is a test comment', NULL, 'active', '2025-10-22 04:47:42', '2025-10-22 04:47:42');

-- 琛? article_likes
DELETE FROM `article_likes`;
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (2, 6, 7, '2025-10-22 04:56:56');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (3, 5, 7, '2025-10-22 04:57:09');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (5, 1, 9, '2025-10-22 04:59:30');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (6, 3, 7, '2025-10-22 05:00:45');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (7, 5, 9, '2025-10-22 05:07:53');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (8, 6, 9, '2025-10-22 05:23:11');
INSERT INTO `article_likes` (`id`, `article_id`, `user_id`, `created_at`) VALUES (9, 11, 1, '2025-10-22 16:07:39');

-- 琛? article_favorites
DELETE FROM `article_favorites`;
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (1, 1, 9, '2025-10-22 04:47:22');
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (2, 3, 7, '2025-10-22 04:57:35');
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (3, 6, 7, '2025-10-22 05:24:27');
INSERT INTO `article_favorites` (`id`, `article_id`, `user_id`, `created_at`) VALUES (4, 6, 1, '2025-10-22 16:08:01');

-- 琛? hotarticles
DELETE FROM `hotarticles`;
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (1, 6, '鍦版柟浼犵粺缇庨鑳屽悗鐨勬晠浜?, '鎺㈢储鍦版柟浼犵粺缇庨鐨勫巻鍙叉笂婧愬拰鏂囧寲鍐呮兜锛屼簡瑙ｆ瘡涓€閬撹彍鑳屽悗鐨勬晠浜嬨€?, '/assets/food1.jpg', '浼犵粺鏂囧寲', '缇庨涓撳', 1212, 86, 23, '95.50', 0, 'active', 1, '2025-10-22 03:50:09', '2025-10-22 16:08:01');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (2, 5, '鏈ㄧ増骞寸敾鐨勪紶鎵夸笌鍒涙柊', '浼犵粺鏈ㄧ増骞寸敾鎶€鑹虹殑浼犳壙鐜扮姸涓庣幇浠ｅ垱鏂板簲鐢紝淇濇姢闈為仐鏂囧寲銆?, '/assets/painting.jpg', '鎵嬪伐鑹?, '闈為仐浼犳壙浜?, 982, 72, 18, '88.20', 0, 'active', 0, '2025-10-22 03:50:09', '2025-10-22 15:13:35');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (3, 3, '姘戜織鑺傚簡涓庣ぞ鍖哄嚌鑱氬姏', '浼犵粺鑺傚簡娲诲姩濡備綍澧炲己绀惧尯鍑濊仛鍔涳紝淇冭繘閭婚噷鍏崇郴鍜岃皭鍙戝睍銆?, '/assets/festival.jpg', '姘戜織鑺傚簡', '绀惧尯鐮旂┒鍛?, 750, 58, 15, '82.10', 0, 'active', 1, '2025-10-22 03:50:09', '2025-10-22 03:50:09');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (4, 2, '鎴忔洸杩涙牎鍥殑浼犳壙瀹炶返', '鎴忔洸鑹烘湳鍦ㄦ牎鍥腑鐨勪紶鎵垮疄璺碉紝鍩瑰吇骞磋交涓€浠ｅ浼犵粺鏂囧寲鐨勫叴瓒ｃ€?, '/assets/campus.jpg', '闊充箰鑸炶箞', '鏁欒偛涓撳', 650, 45, 12, '75.80', 0, 'active', 0, '2025-10-22 03:50:09', '2025-10-22 03:50:09');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (5, 1, '鍦版柟鏂硅█閲岀殑鏂囧寲瀵嗙爜', '鎺㈢储鍦版柟鏂硅█涓暣鍚殑鏂囧寲瀵嗙爜锛屼簡瑙ｈ瑷€涓庢枃鍖栫殑娣卞眰鑱旂郴銆?, '/assets/language.jpg', '浼犵粺鏂囧寲', '璇█瀛﹀', 580, 38, 9, '70.30', 0, 'active', 0, '2025-10-22 03:50:09', '2025-10-22 03:50:09');
INSERT INTO `hotarticles` (`id`, `article_id`, `title`, `summary`, `cover`, `category`, `author`, `views`, `likes`, `comments_count`, `hot_score`, `sort_order`, `status`, `featured`, `created_at`, `updated_at`) VALUES (6, 4, '鎵嬪伐鑹?, '鎺㈠鎵嬪伐鑹轰箣缇?, '/assets/craft.jpg', '鎵嬪伐鑹?, 'LLL', 900, 40, 0, '0.00', 0, 'active', 0, '2025-10-22 04:09:49', '2025-10-22 04:09:49');

-- 鍚敤澶栭敭妫€鏌?
SET FOREIGN_KEY_CHECKS = 1;

-- 鏁版嵁瀵煎嚭瀹屾垚
SELECT 'Data export completed successfully!' as message;
