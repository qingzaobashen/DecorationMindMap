-- =====================================================
-- Supabase 数据库索引优化脚本
-- 用于提升思维导图节点数据查询性能
-- =====================================================

-- 1. 为 mindmap_nodes 表的 node_id 字段创建索引（如果不存在）
-- 这能显著提升 ORDER BY node_id 的查询速度
CREATE INDEX IF NOT EXISTS idx_mindmap_nodes_node_id 
ON mindmap_nodes(node_id);

-- 2. 为 mindmap_nodes 表的 parent_id 字段创建索引
-- 如果经常根据父节点查询子节点，这个索引很有用
CREATE INDEX IF NOT EXISTS idx_mindmap_nodes_parent_id 
ON mindmap_nodes(parent_id);

-- 3. 为 user_custom_nodes 表创建复合索引
-- 加速根据 user_id 和 node_id 的查询
CREATE INDEX IF NOT EXISTS idx_user_custom_nodes_user_id 
ON user_custom_nodes(user_id);

CREATE INDEX IF NOT EXISTS idx_user_custom_nodes_node_id 
ON user_custom_nodes(node_id);

-- 4. 创建复合索引，加速常见的查询模式
CREATE INDEX IF NOT EXISTS idx_user_custom_nodes_user_node 
ON user_custom_nodes(user_id, node_id);

-- 5. 为 created_at 字段创建索引（如果需要按时间排序）
CREATE INDEX IF NOT EXISTS idx_user_custom_nodes_created_at 
ON user_custom_nodes(created_at DESC);

-- =====================================================
-- 查看索引创建情况（可选）
-- =====================================================
-- SELECT 
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND (tablename = 'mindmap_nodes' OR tablename = 'user_custom_nodes')
-- ORDER BY tablename, indexname;

-- =====================================================
-- 查看表的大小和索引大小（可选）
-- =====================================================
-- SELECT 
--     relname AS table_name,
--     pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
--     pg_size_pretty(pg_relation_size(relid)) AS table_size,
--     pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
-- FROM pg_catalog.pg_statio_user_tables
-- WHERE relname IN ('mindmap_nodes', 'user_custom_nodes')
-- ORDER BY pg_total_relation_size(relid) DESC;
