import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, Typography, Spin, Alert, Button, Input } from 'antd';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { Search } = Input;

/**
 * 社区页面，展示帖子列表。
 */
const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: 根据后端 API调整分页和搜索参数
        const response = await axios.get(`http://localhost:5000/api/posts?search=${searchTerm}`);
        setPosts(response.data.posts || response.data); // 兼容不同后端返回格式
      } catch (err) {
        console.error("获取帖子列表失败:", err);
        setError('无法加载帖子列表，请稍后再试。');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin tip="加载帖子中..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="错误" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>社区帖子</Title>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Search
          placeholder="搜索帖子标题或内容"
          onSearch={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        {/* TODO: 阶段二 - 添加 "发布新帖" 按钮 */}
        {/* <Link to="/forum/new">
          <Button type="primary">发布新帖</Button>
        </Link> */}
      </div>
      {posts.length === 0 && !loading ? (
        <Alert message="暂无帖子" description="当前还没有用户发布帖子，或者没有符合搜索条件的帖子。" type="info" />
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={posts}
          renderItem={item => (
            <List.Item
              key={item.id || item._id} // 兼容不同ID字段
              actions={[
                // 可选：显示作者、时间、评论数等
                // <span key="list-author">作者: {item.author?.username || '匿名'}</span>,
                // <span key="list-date">发布于: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>,
                // <span key="list-comments">评论: {item.commentCount || 0}</span>,
              ]}
            >
              <List.Item.Meta
                title={<Link to={`/forum/post/${item.id || item._id}`}>{item.title || '无标题帖子'}</Link>}
                description={
                  <Paragraph ellipsis={{ rows: 2, expandable: false }}>
                    {item.contentExcerpt || item.content?.substring(0, 150) || '暂无内容摘要...'}
                  </Paragraph>
                }
              />
            </List.Item>
          )}
        />
      )}
      {/* TODO: 添加分页组件 */}
    </div>
  );
};

export default CommunityPage;
