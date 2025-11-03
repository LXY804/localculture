-- =============================================
-- 数据迁移脚本：从articles表的tags字段迁移到article_tags关联表
-- 执行前提：已执行 create-categories-tags-tables.sql
-- =============================================

USE `localculture`;

-- 第一步：从articles表的tags JSON字段提取标签，并创建标签关联
-- 这个脚本会遍历所有文章，解析tags字段，并建立关联

-- 创建临时存储过程来迁移数据
DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_tags_from_articles$$

CREATE PROCEDURE migrate_tags_from_articles()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE article_id_val BIGINT;
  DECLARE tags_json JSON;
  DECLARE tag_name VARCHAR(64);
  DECLARE tag_id_val BIGINT;
  DECLARE i INT DEFAULT 0;
  DECLARE tag_count INT;
  
  -- 游标：获取所有有tags的文章
  DECLARE cur CURSOR FOR 
    SELECT id, tags 
    FROM articles 
    WHERE tags IS NOT NULL 
      AND tags != 'null' 
      AND tags != '';
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  -- 清空关联表
  TRUNCATE TABLE article_tags;
  
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
        -- 查找或创建标签
        SELECT id INTO tag_id_val FROM tags WHERE name = tag_name LIMIT 1;
        
        -- 如果标签不存在，创建它
        IF tag_id_val IS NULL THEN
          INSERT INTO tags (name, slug, description, color) 
          VALUES (tag_name, LOWER(REPLACE(tag_name, ' ', '-')), CONCAT(tag_name, '相关'), '#409EFF')
          ON DUPLICATE KEY UPDATE name=name;
          SET tag_id_val = LAST_INSERT_ID();
          IF tag_id_val = 0 THEN
            SELECT id INTO tag_id_val FROM tags WHERE name = tag_name LIMIT 1;
          END IF;
        END IF;
        
        -- 创建文章-标签关联（如果不存在）
        INSERT INTO article_tags (article_id, tag_id)
        VALUES (article_id_val, tag_id_val)
        ON DUPLICATE KEY UPDATE article_id=article_id;
      END IF;
      
      SET i = i + 1;
    END WHILE;
  END LOOP;
  
  CLOSE cur;
  
  -- 更新标签的文章数量统计
  UPDATE tags t
  SET article_count = (
    SELECT COUNT(*) 
    FROM article_tags at 
    WHERE at.tag_id = t.id
  );
  
  -- 更新分类的文章数量统计（基于articles表的category字段）
  UPDATE categories c
  SET article_count = (
    SELECT COUNT(*) 
    FROM articles a 
    WHERE a.category = c.name
  );
  
  SELECT '标签迁移完成！' as message;
END$$

DELIMITER ;

-- 执行迁移
CALL migrate_tags_from_articles();

-- 删除临时存储过程
DROP PROCEDURE IF EXISTS migrate_tags_from_articles;

-- 验证迁移结果
SELECT 
  '标签迁移验证' as info,
  (SELECT COUNT(*) FROM tags) as total_tags,
  (SELECT COUNT(*) FROM article_tags) as total_article_tag_relations,
  (SELECT COUNT(*) FROM articles WHERE tags IS NOT NULL) as articles_with_tags;

-- 显示标签统计
SELECT t.name, t.article_count, COUNT(at.article_id) as actual_count
FROM tags t
LEFT JOIN article_tags at ON t.id = at.tag_id
GROUP BY t.id, t.name, t.article_count
ORDER BY t.article_count DESC;

