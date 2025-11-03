-- =============================================
-- 修复文章标签关联：从articles表的tags字段迁移到article_tags表
-- 执行前提：已执行 create-categories-tags-tables.sql
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

-- 显示一些示例数据
SELECT 
  id, 
  title, 
  tags,
  category
FROM articles 
WHERE tags IS NOT NULL AND tags != '' AND tags != 'null' AND tags != '[]'
LIMIT 5;

-- =============================================
-- 步骤2：清空现有的关联（如果存在）
-- =============================================

TRUNCATE TABLE `article_tags`;

-- =============================================
-- 步骤3：从articles表的tags字段迁移到article_tags表
-- =============================================

-- 使用存储过程来处理迁移
DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_article_tags$$

CREATE PROCEDURE migrate_article_tags()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE article_id_val BIGINT;
  DECLARE tags_json JSON;
  DECLARE tag_name VARCHAR(64);
  DECLARE tag_id_val BIGINT;
  DECLARE i INT DEFAULT 0;
  DECLARE tag_count INT;
  DECLARE processed_count INT DEFAULT 0;
  DECLARE total_associations INT DEFAULT 0;
  
  -- 游标：获取所有有tags的文章
  DECLARE cur CURSOR FOR 
    SELECT id, tags 
    FROM articles 
    WHERE tags IS NOT NULL 
      AND tags != 'null' 
      AND tags != ''
      AND tags != '[]'
      AND JSON_VALID(tags);
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  
  read_loop: LOOP
    FETCH cur INTO article_id_val, tags_json;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- 获取tags数组的长度
    SET tag_count = JSON_LENGTH(tags_json);
    SET i = 0;
    
    -- 遍历tags数组
    WHILE i < tag_count DO
      -- 获取第i个标签名
      SET tag_name = JSON_UNQUOTE(JSON_EXTRACT(tags_json, CONCAT('$[', i, ']')));
      
      IF tag_name IS NOT NULL AND tag_name != '' THEN
        -- 查找标签（标签名必须完全匹配，使用COLLATE解决字符集不匹配问题）
        SELECT id INTO tag_id_val FROM tags WHERE name COLLATE utf8mb4_general_ci = tag_name COLLATE utf8mb4_general_ci LIMIT 1;
        
        -- 如果标签不存在，创建它
        IF tag_id_val IS NULL THEN
          INSERT INTO tags (name, slug, description, color) 
          VALUES (
            tag_name COLLATE utf8mb4_general_ci, 
            LOWER(REPLACE(tag_name, ' ', '-')), 
            CONCAT(tag_name, '相关'), 
            '#409EFF'
          )
          ON DUPLICATE KEY UPDATE name=name;
          
          SET tag_id_val = LAST_INSERT_ID();
          IF tag_id_val = 0 THEN
            SELECT id INTO tag_id_val FROM tags WHERE name COLLATE utf8mb4_general_ci = tag_name COLLATE utf8mb4_general_ci LIMIT 1;
          END IF;
        END IF;
        
        -- 创建文章-标签关联（如果不存在）
        IF tag_id_val IS NOT NULL THEN
          INSERT INTO article_tags (article_id, tag_id)
          VALUES (article_id_val, tag_id_val)
          ON DUPLICATE KEY UPDATE article_id=article_id;
          
          SET total_associations = total_associations + 1;
        END IF;
      END IF;
      
      SET i = i + 1;
    END WHILE;
    
    SET processed_count = processed_count + 1;
  END LOOP;
  
  CLOSE cur;
  
  SELECT CONCAT('处理了 ', processed_count, ' 篇文章，创建了 ', total_associations, ' 个标签关联') as message;
END$$

DELIMITER ;

-- 执行迁移
CALL migrate_article_tags();

-- 删除临时存储过程
DROP PROCEDURE IF EXISTS migrate_article_tags;

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
  WHERE a.category = c.name 
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
LEFT JOIN articles a ON a.category = c.name AND a.status = 'published'
GROUP BY c.id, c.name, c.article_count
ORDER BY actual_count DESC, c.name ASC;

SELECT '=== 迁移完成！请检查上面的结果，标签计数应该不为0了 ===' as message;
