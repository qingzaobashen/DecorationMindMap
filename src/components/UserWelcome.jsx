import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Button, Badge } from 'antd';
import { CloseOutlined, UserOutlined, ClockCircleOutlined, CrownOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';

/**
 * 用户欢迎组件 - 显示欢迎信息和用户统计数据
 */
const UserWelcome = ({ isVisible, onClose }) => {
  const [lastVisit, setLastVisit] = useState('首次访问');
  const [visitCount, setVisitCount] = useState(1);
  const { username, isPremium } = useUser();
  
  useEffect(() => {
    // 从本地存储获取访问记录
    const lastVisitTime = localStorage.getItem('lastVisit');
    const count = parseInt(localStorage.getItem('visitCount')) || 0;
    
    if (lastVisitTime) {
      const formatDate = new Date(lastVisitTime).toLocaleString();
      setLastVisit(formatDate);
    }
    
    // 更新访问次数
    setVisitCount(count + 1);
    localStorage.setItem('visitCount', (count + 1).toString());
    
    // 记录本次访问时间
    localStorage.setItem('lastVisit', new Date().toISOString());
    // 3秒后自动关闭通知
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="welcome-container">
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {isPremium ? (
                <Badge color="gold" text={<><CrownOutlined style={{ color: '#ffd700' }} /> 尊贵的VIP用户，欢迎回来！</>} />
              ) : (
                <>欢迎回来</>
              )}
            </span>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
              style={{ color: '#999' }}
            />
          </div>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card className="welcome-card">
              <Statistic
                title="用户名"
                value={username || '访客'}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="welcome-card">
              <Statistic
                title="访问次数"
                value={visitCount}
              />
            </Card>
          </Col>
        </Row>
        <Card className="welcome-card" style={{ marginTop: '10px' }}>
          <Statistic
            title="上次访问时间"
            value={lastVisit}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        
        {isPremium && (
          <Card className="welcome-card" style={{ marginTop: '10px', backgroundColor: 'rgba(255, 215, 0, 0.05)', borderColor: '#ffd700' }}>
            <Statistic
              title="会员特权"
              value="已激活高级功能"
              valueStyle={{ color: '#d4b106', fontSize: '16px' }}
              prefix={<CrownOutlined style={{ color: '#ffd700' }} />}
            />
          </Card>
        )}
      </Card>
    </div>
  );
};

export default UserWelcome; 