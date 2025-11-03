-- =============================================
-- 为文章添加标签和更新分类
-- =============================================

USE `localculture`;

-- 更新文章1：传统文化保护的重要性
UPDATE `articles` 
SET 
  `category` = '传统文化',
  `tags` = JSON_ARRAY('保护', '传承', '文化', '历史')
WHERE `id` = 1;

-- 更新文章2：民俗节庆的多样性
UPDATE `articles` 
SET 
  `category` = '民俗节庆',
  `tags` = JSON_ARRAY('节庆', '民俗', '传承', '文化')
WHERE `id` = 2;

-- 更新文章3：传统文化保护的重要性（重复文章）
UPDATE `articles` 
SET 
  `category` = '传统文化',
  `tags` = JSON_ARRAY('保护', '传承', '文化', '历史')
WHERE `id` = 3;

-- 更新文章4：传统手工艺
UPDATE `articles` 
SET 
  `category` = '手工艺',
  `tags` = JSON_ARRAY('手工艺', '技艺', '传承', '保护', '艺术')
WHERE `id` = 4;

-- 更新文章5：传统节日
UPDATE `articles` 
SET 
  `category` = '民俗节庆',
  `tags` = JSON_ARRAY('节庆', '传统', '民俗', '文化')
WHERE `id` = 5;

-- 更新文章6：地方传统美食背后的故事
UPDATE `articles` 
SET 
  `category` = '地方传统美食',
  `tags` = JSON_ARRAY('美食', '文化', '历史', '传统')
WHERE `id` = 6;

-- 更新文章11：测试帖子
UPDATE `articles` 
SET 
  `category` = '其他',
  `tags` = JSON_ARRAY('测试')
WHERE `id` = 11;

-- 更新后续文章（如果存在）
-- 文章20-24在data.sql后面部分
UPDATE `articles` 
SET 
  `tags` = CASE 
    WHEN `id` = 20 THEN JSON_ARRAY('节庆', '传承', '创新', '教育')
    WHEN `id` = 21 THEN JSON_ARRAY('手工艺', '技艺', '市场', '创新')
    WHEN `id` = 22 THEN JSON_ARRAY('保护', '方言', '文化', '历史')
    WHEN `id` = 23 THEN JSON_ARRAY('音乐', '教育', '传承', '艺术')
    WHEN `id` = 24 THEN JSON_ARRAY('古建筑', '保护', '旅游', '文化')
    ELSE `tags`
  END
WHERE `id` IN (20, 21, 22, 23, 24);

-- 确保所有文章都有分类（如果没有的话，设置为'其他'）
UPDATE `articles` 
SET `category` = '其他'
WHERE `category` IS NULL OR `category` = '';

-- 确保所有文章都有标签（如果没有的话，根据标题添加默认标签）
UPDATE `articles` 
SET `tags` = JSON_ARRAY('文化', '传统')
WHERE (`tags` IS NULL OR `tags` = 'null' OR `tags` = '') 
  AND `id` NOT IN (1, 2, 3, 4, 5, 6, 11, 20, 21, 22, 23, 24);

SELECT '文章标签和分类更新完成！' as message;
SELECT id, title, category, tags FROM articles ORDER BY id;

