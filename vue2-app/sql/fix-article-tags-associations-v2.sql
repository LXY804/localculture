-- =============================================
-- 修复文章标签关联（修复字符集不匹配问题）
-- 使用更简单的方法：直接使用CONVERT解决字符集问题
-- =============================================

USE `localculture`;

-- =============================================
-- 步骤1：检查当前状态
-- =============================================

SELECT '=== 当前状态检查 ===' as info;

-- 检查articles表中是否有tags数据
SELECT 
  'articles表中的tags数据' as type,
  COUNT(*) as total_articles,
  COUNT(CASE WHEN tags IS NOT NULL AND tags != '' AND tags != 'null' AND tags != '[]' THEN 1 END) as articles_with_tags
FROM articles;

-- 检查article_tags表中的数据
SELECT 
  'article_tags关联表' as type,
  COUNT(*) as total_associations
FROM article_tags;

-- =============================================
-- 步骤2：清空现有的关联
-- =============================================

TRUNCATE TABLE `article_tags`;

-- =============================================
-- 步骤3：使用简单的SQL直接建立关联（避免存储过程的字符集问题）
-- =============================================

-- 方法：使用临时表来处理，避免字符集不匹配
-- 创建临时表存储文章ID和标签名
DROP TEMPORARY TABLE IF EXISTS temp_article_tags;

CREATE TEMPORARY TABLE temp_article_tags (
  article_id BIGINT UNSIGNED NOT NULL,
  tag_name VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  INDEX idx_article (article_id),
  INDEX idx_tag (tag_name)
) ENGINE=Memory;

-- 从articles表中提取所有标签（使用JSON函数）
INSERT INTO temp_article_tags (article_id, tag_name)
SELECT 
  a.id as article_id,
  JSON_UNQUOTE(JSON_EXTRACT(a.tags, CONCAT('$[', numbers.n, ']'))) COLLATE utf8mb4_general_ci as tag_name
FROM articles a
CROSS JOIN (
  SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
  UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
) numbers
WHERE a.tags IS NOT NULL 
  AND a.tags != '' 
  AND a.tags != 'null'
  AND a.tags != '[]'
  AND JSON_VALID(a.tags)
  AND JSON_EXTRACT(a.tags, CONCAT('$[', numbers.n, ']')) IS NOT NULL
  AND JSON_UNQUOTE(JSON_EXTRACT(a.tags, CONCAT('$[', numbers.n, ']'))) != '';

-- 确保所有标签都存在于tags表中（如果不存在则创建）
INSERT INTO tags (name, slug, description, color)
SELECT DISTINCT
  tat.tag_name COLLATE utf8mb4_general_ci as name,
  LOWER(REPLACE(tat.tag_name, ' ', '-')) as slug,
  CONCAT(tat.tag_name, '相关') as description,
  '#409EFF' as color
FROM temp_article_tags tat
LEFT JOIN tags t ON t.name COLLATE utf8mb4_general_ci = tat.tag_name COLLATE utf8mb4_general_ci
WHERE t.id IS NULL;

-- 建立文章-标签关联
INSERT INTO article_tags (article_id, tag_id)
SELECT DISTINCT
  tat.article_id,
  t.id as tag_id
FROM temp_article_tags tat
INNER JOIN tags t ON t.name COLLATE utf8mb4_general_ci = tat.tag_name COLLATE utf8mb4_general_ci
WHERE tat.tag_name IS NOT NULL AND tat.tag_name != '';

-- 清理临时表
DROP TEMPORARY TABLE IF EXISTS temp_article_tags;

-- =============================================
-- 步骤4：更新标签和分类的统计计数
-- =============================================

-- 更新标签的文章数量统计
UPDATE tags t
SET article_count = (
  SELECT COUNT(*) 
  FROM article_tags at 
  WHERE at.tag_id = t.id
);

-- 更新分类的文章数量统计
UPDATE categories c
SET article_count = (
  SELECT COUNT(*) 
  FROM articles a 
  WHERE a.category COLLATE utf8mb4_general_ci = c.name COLLATE utf8mb4_general_ci
    AND a.status = 'published'
);

-- =============================================
-- 步骤5：验证迁移结果
-- =============================================

SELECT '=== 迁移结果验证 ===' as info;

-- 显示迁移后的统计
SELECT 
  'article_tags关联表' as type,
  COUNT(*) as total_associations,
  COUNT(DISTINCT article_id) as unique_articles,
  COUNT(DISTINCT tag_id) as unique_tags
FROM article_tags;

-- 显示每个标签的计数（应该不为0了）
SELECT 
  t.id,
  t.name,
  t.article_count as stored_count,
  COUNT(at.article_id) as actual_count
FROM tags t
LEFT JOIN article_tags at ON t.id = at.tag_id
GROUP BY t.id, t.name, t.article_count
HAVING actual_count > 0
ORDER BY actual_count DESC, t.name ASC
LIMIT 20;

-- 显示每个分类的计数
SELECT 
  c.id,
  c.name,
  c.article_count as stored_count,
  COUNT(a.id) as actual_count
FROM categories c
LEFT JOIN articles a ON a.category COLLATE utf8mb4_general_ci = c.name COLLATE utf8mb4_general_ci 
  AND a.status = 'published'
GROUP BY c.id, c.name, c.article_count
ORDER BY actual_count DESC, c.name ASC;

SELECT '=== 迁移完成！标签计数应该不为0了 ===' as message;

