-- =============================================
-- 修复文章数据：将 hotarticles 的完整数据同步到 articles 表
-- 说明：hotarticles 应该是 articles 的子集（热门标记），不是独立数据源
-- =============================================

-- 步骤1: 将 hotarticles 的标题、摘要、封面同步到 articles 表
UPDATE articles a
INNER JOIN hotarticles h ON a.id = h.article_id
SET 
  a.title = h.title,
  a.summary = h.summary,
  a.cover = h.cover
WHERE h.status = 'active';

-- 步骤2: 为没有 content 的文章填充默认内容（使用摘要扩展）
UPDATE articles 
SET content = CONCAT(summary, '\n\n这是一篇关于', title, '的文章。内容正在完善中...')
WHERE (content IS NULL OR content = '') AND summary IS NOT NULL AND summary != '';

-- 步骤3: 验证修复结果
SELECT 
  a.id,
  a.title,
  CASE WHEN a.content IS NULL OR a.content = '' THEN '缺失' ELSE '正常' END as content_status,
  CASE WHEN a.summary IS NULL OR a.summary = '' THEN '缺失' ELSE '正常' END as summary_status,
  a.cover,
  CASE WHEN h.article_id IS NOT NULL THEN '是' ELSE '否' END as is_hot
FROM articles a
LEFT JOIN hotarticles h ON a.id = h.article_id AND h.status = 'active'
ORDER BY a.id;


