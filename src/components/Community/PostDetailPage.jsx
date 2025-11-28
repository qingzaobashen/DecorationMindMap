import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Spin, Alert, Divider, List, Form, Input, Button, message, Card } from 'antd';
import axios from 'axios';
import { useUser } from '../../context/UserContext'; // 假设用于获取当前用户信息以发表评论

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/**
 * 帖子详情页面，展示帖子内容和评论。
 */
const PostDetailPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [commentForm] = Form.useForm();
  const [submittingComment, setSubmittingComment] = useState(false);
  const { isAuthenticated, username } = useUser(); // 获取用户登录状态和用户名

  const fetchPostDetails = useCallback(async () => {
    setLoadingPost(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${postId}`);
      setPost(response.data.post || response.data);
    } catch (err) {
      console.error("获取帖子详情失败:", err);
      setError('无法加载帖子详情，请稍后再试。');
    } finally {
      setLoadingPost(false);
    }
  }, [postId]);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
      setComments(response.data.comments || response.data || []);
    } catch (err) {
      console.error("获取评论列表失败:", err);
      // 不覆盖帖子加载的错误
      if (!error) setError('无法加载评论列表。');
    } finally {
      setLoadingComments(false);
    }
  }, [postId, error]);

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [fetchPostDetails, fetchComments]);

  const handleCommentSubmit = async (values) => {
    if (!isAuthenticated) {
      message.warning('请先登录后再发表评论！');
      // TODO: 可以考虑弹出登录模态框
      return;
    }
    setSubmittingComment(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        content: values.commentContent,
        // authorId: userId, // 从 UserContext 或 token 解码获取
        // authorName: username, // 从 UserContext 获取
      });
      setComments([response.data.comment, ...comments]); // 将新评论添加到列表顶部
      commentForm.resetFields();
      message.success('评论发表成功！');
    } catch (err) {
      console.error("发表评论失败:", err);
      message.error(err.response?.data?.message || '评论发表失败，请稍后再试。');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loadingPost) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin tip="加载帖子内容..." />
      </div>
    );
  }

  if (error && !post) { // 如果帖子加载失败则显示错误
    return <Alert message="错误" description={error} type="error" showIcon style={{ margin: '20px' }} />;
  }

  if (!post) { // 进一步检查 post 是否存在
    return <Alert message="错误" description="未找到该帖子。" type="error" showIcon style={{ margin: '20px' }} />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>{post.title || '帖子详情'}</Title>
      <Text type="secondary">
        作者: {post.author?.username || '匿名'} | 发布于: {new Date(post.createdAt || Date.now()).toLocaleString()}
      </Text>
      <Divider />
      <Card>
        <Paragraph style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
          {post.content || '帖子内容加载中或为空...'}
        </Paragraph>
      </Card>

      <Divider />
      <Title level={3}>评论区 ({comments.length})</Title>
      {isAuthenticated ? (
        <Form form={commentForm} onFinish={handleCommentSubmit} layout="vertical">
          <Form.Item name="commentContent" rules={[{ required: true, message: '评论内容不能为空！' }]}>
            <TextArea rows={3} placeholder="写下你的评论..." />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={submittingComment} type="primary">
              发表评论
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Alert
          message="请登录后发表评论。"
          type="info"
          showIcon
          action={
            <Link to="/"> {/* 或者 specific login path */}
              <Button size="small" type="primary">
                去登录
              </Button>
            </Link>
          }
        />
      )}

      {loadingComments && <Spin tip="加载评论中..." style={{ display: 'block', marginTop: '20px' }} />}
      {!loadingComments && comments.length === 0 && <Paragraph>暂无评论，快来抢沙发吧！</Paragraph>}
      {!loadingComments && comments.length > 0 && (
        <List
          dataSource={comments}
          itemLayout="horizontal"
          renderItem={comment => (
            <List.Item>
              <List.Item.Meta
                // avatar={<Avatar src={comment.author?.avatarUrl} />}
                title={<Text strong>{comment.author?.username || comment.authorName || '匿名用户'}</Text>}
                description={
                  <>
                    <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Paragraph>
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                      {new Date(comment.createdAt || Date.now()).toLocaleString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
      <div style={{ marginTop: '20px' }}>
        <Link to="/forum">
          <Button>返回帖子列表</Button>
        </Link>
      </div>
    </div>
  );
};

export default PostDetailPage;
