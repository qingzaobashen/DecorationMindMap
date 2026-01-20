// 从react库中导入useState钩子
import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';

import { Outlet } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react'
import Papa from 'papaparse';
import './App.css';
import 'swiper/css';
import 'swiper/css/pagination';
import { Modal, Button } from 'antd';
import { marked } from 'marked';

// 导入App.css样式文件
import './App.css';

// 从UserContext导入useUser
import { useUser } from './context/UserContext';

// 导入WelcomePage组件
import WelcomePage from './components/WelcomePage';
import MindMap_SimpleMindMap from './MindMap_SimpleMindMap';
import { FaFileAlt, FaUsers, FaProjectDiagram, FaCommentDots } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import UserWelcome from './components/UserWelcome';
import LoginBySupabaseUsername from './components/LoginByUserName_supabase';
import DocsViewer from './components/DocsViewer';
import MindMapSaver from './components/MindMapSaver';
import FeedbackModal from './components/FeedbackModal';
// Import community pages with corrected casing
import CommunityPage from './components/Community/CommunityPage';
import PostDetailPage from './components/Community/PostDetailPage';
import NotFoundPage from './components/NotFoundPage';
import { sampleData } from './utils/sampleData';

const PORT = 5000;
// CSV文件路径（基于public目录）
// 使用import.meta.env.BASE_URL来动态获取base路径，确保在不同部署环境下都能正确访问资源
const csvFilePath = `${import.meta.env.BASE_URL}backend_data/nodes_details_data.csv`;
const imageFilePath = `${import.meta.env.BASE_URL}backend_data/images/`;
// 浏览器端解析CSV文件的函数（使用Papa Parse库）
const parseCSV = () => {
  return fetch(csvFilePath)
    .then(response => {
      if (!response.ok) throw new Error(`Fetch file ${csvFilePath} error! status: ${response.status}`);
      return response.arrayBuffer(); // 获取原始二进制数据
    })
    .then(arrayBuffer => {
      // 尝试使用GBK编码解码CSV文件（Windows系统常见编码）
      let csvText;
      try {
        const decoder = new TextDecoder('gbk');
        csvText = decoder.decode(arrayBuffer);
      } catch (error) {
        // 如果GBK解码失败，回退到UTF-8编码
        console.log('GBK解码失败，尝试使用UTF-8编码:', error);
        const decoder = new TextDecoder('utf-8');
        csvText = decoder.decode(arrayBuffer);
      }
      
      // 使用Papa Parse解析CSV文本
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true, // 使用第一行作为表头
          skipEmptyLines: true, // 跳过空行
          complete: (results) => {
            // 转换数值类型的字段
            const formattedResults = results.data.map(item => ({
              ...item,
              id: parseInt(item.id),
              node_id: parseInt(item.node_id),
              parent_id: item.parent_id ? parseInt(item.parent_id) : null,
              create_user_id: parseInt(item.create_user_id),
              parent_mindMap_id: parseInt(item.parent_mindMap_id)
            }));
            resolve(formattedResults);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    });
};

// 返回主界面的思维导图及节点弹窗
function MainAppUI() {
  const [selectedNode, setSelectedNode] = useState(null);  // 当前选择的叶节点
  const [panelVisible, setPanelVisible] = useState(false); // 弹出窗是否可见
  const [mindData, setMindData] = useState(null);          // 思维导图的数据
  const [loading, setLoading] = useState(true);            // 是否正在加载中，初始为true
  const [viewType] = useState('simplemindmap'); // 导图的显示类型，默认simplemindmap
  const [fullscreenImageVisible, setFullscreenImageVisible] = useState(false); // 全屏图片查看器是否可见
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 当前查看的图片索引
  const mindMapInstanceRef = useRef(null);                   // 缓存思维导图实例

  const { isAuthenticated, isPremium, upgradeToPremium, completeUpgradeToPremium,
     purchaseArticle, completePurchaseArticle, paymentModalVisible, closePaymentModal, 
     paymentType, hasPurchasedArticle } = useUser();

  // 截断文本函数，用于付费内容的部分显示
  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    // 截断文本并添加省略号
    return text.substring(0, maxLength) + '...';
  };

  // 设置思维导图实例缓存的回调函数，传给MindMap_SimpleMindMap子组件，让它创建好实例后把实例缓存起来
  const memoizedOnMindMapLoad = useCallback((instance) => {
    console.log("MindMap instance loaded/reloaded in MainAppUI:", instance);
    mindMapInstanceRef.current = instance;
  }, []);

  // 移除自定义事件监听器，改用UserContext管理支付模态框状态

  // 处理节点点击事件的回调函数，传给MindMap_SimpleMindMap子组件，让它点击节点时调用
  // 主要是拿到点击节点的数据，然后弹出详情页
  const memoizedHandleNodeClick = useCallback((nodeData, nodeInstance, clickDetails) => {
    const nodeName = nodeData.name || nodeData.data?.text || nodeData.text || '未命名节点';
    let details = nodeData.details || nodeData.data?.details || [];
    if (typeof details === 'string') details = [{ text: details }];
    if (!Array.isArray(details) || !details.every(item => typeof item === 'object' && item !== null)) {
      details = nodeData.data?.note ? [{ text: nodeData.data.note }] : [{ text: '暂无详细信息。' }];
    }
    let img_url = nodeData.img_url || nodeData.data?.img_url || [];
    // 添加节点的付费状态
    const is_premium = nodeData.is_premium || nodeData.data?.is_premium || false;
    // 获取节点的唯一标识，优先使用node_id，其次使用name作为回退
    const nodeId = nodeData.node_id || nodeData.data?.node_id || nodeName;
    console.log("is_premium: ", is_premium);
    setSelectedNode({ name: nodeName, details, img_url: img_url, is_premium, id: nodeId });
    setPanelVisible(true);
    if (clickDetails && clickDetails.type === 'attachment_icon_click') {
      console.log('MainAppUI: Attachment icon click received:', clickDetails.attachment);
    }
  }, [setSelectedNode, setPanelVisible]);

  // Effect for fetching data based on viewType
  useEffect(() => {
    const fetchDataForView = async () => {
      if (viewType === 'document') { // Document view is now handled by its own route
        setLoading(false);
        return;
      }
      setLoading(true);
      setMindData(null);
      mindMapInstanceRef.current = null;
      try {
        if (viewType === 'simplemindmap') {
          try {
              // const response = await fetch(`http://localhost:${PORT}/api/nodes`);
              const nodesData = await parseCSV();
              // console.log('CSV data:', nodesData);
              //if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              setMindData(buildMindMapStructure(nodesData));
            } catch (error) {
            console.error('Server data failed (simplemindmap), using sample:', error);
            setMindData(sampleData);
          }
        } else {
          setMindData(sampleData);
        }
      } catch (error) {
        console.error('Data loading failed:', error);
        setMindData(sampleData);
      } finally {
        setLoading(false);
      }
    };

    if (viewType !== 'docs_page') { // 'docs_page' is a placeholder for a dedicated docs route
      fetchDataForView();
    } else {
      setLoading(false); // If it's a docs route, loading is handled by DocsViewer or not needed here
    }
  }, [viewType, isAuthenticated]); // currentDocPath removed as docs view has its own route



  // Determine what to render based on the current route (implicitly) or viewType state
  // For this example, we assume MainAppUI is rendered for '/' and handles mindmap views
  // DocsViewer, CommunityPage will be handled by their own <Route> elements.

  let currentViewComponent = null;
  if (loading && viewType !== 'docs_page') {
    currentViewComponent = (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>正在加载数据...</p>
      </div>
    );
  } else if (viewType === 'simplemindmap' && mindData) {
    currentViewComponent = (
      <MindMap_SimpleMindMap
        data={mindData}
        onNodeClick={memoizedHandleNodeClick}
        onMindMapLoad={memoizedOnMindMapLoad}
      />
    );
  }
  // Note: DocsViewer will be rendered via its own Route in the main App component

  return (
    <div className="app-layout">
      {/* 全屏图片查看器 */}
      {fullscreenImageVisible && selectedNode && selectedNode.img_url && (
        <div className="fullscreen-image-viewer" onClick={() => setFullscreenImageVisible(false)}>
          <div className="fullscreen-image-container">
            {/* 关闭按钮 */}
            <button className="fullscreen-close-btn" onClick={(e) => {
              e.stopPropagation();
              setFullscreenImageVisible(false);
            }}>×</button>
            
            {/* 左右切换按钮 */}
            {currentImageIndex > 0 && (
              <button className="fullscreen-nav-btn prev-btn" onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev - 1);
              }}>‹</button>
            )}
            
            {currentImageIndex < selectedNode.img_url.length - 1 && (
              <button className="fullscreen-nav-btn next-btn" onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev + 1);
              }}>›</button>
            )}
            
            {/* 图片 */}
            <img
              src={imageFilePath + (selectedNode.img_url[currentImageIndex] || '/error0.png')}
              className="fullscreen-image"
              alt={`全屏查看图片${currentImageIndex + 1}`}
            />
            
            {/* 图片计数 */}
            <div className="image-counter">
              {currentImageIndex + 1} / {selectedNode.img_url.length}
            </div>
          </div>
        </div>
      )}
      
      {/* 支付二维码弹窗 */}
      <Modal
        title={paymentType === 'vip' ? "扫码支付 - VIP升级" : "扫码支付 - 单篇文章"}
        open={paymentModalVisible}
        onCancel={closePaymentModal}
        footer={[
          <Button key="cancel" onClick={closePaymentModal}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={async () => {
            let success = false;
            if (paymentType === 'vip') {
              // 调用完成VIP升级的函数
              success = await completeUpgradeToPremium();
            } else if (paymentType === 'article') {
              // 调用完成单篇文章购买的函数
              success = await completePurchaseArticle();
            }
            
            if (success) {
              closePaymentModal();
              // 关闭节点详情面板，以便重新加载内容
              setPanelVisible(false);
            }
          }}>
            支付已完成
          </Button>
        ]}
        width={360}
        centered
        zIndex={2000}
      >
        <div className="payment-modal-content">
          <p className="payment-description">请使用微信或支付宝扫描下方二维码支付</p>
          <div className="qr-code-container">
            {/* 这里使用示例二维码，实际项目中应替换为真实支付二维码 */}
            <img
              src={paymentType === 'vip' ? "https://via.placeholder.com/200x200?text=VIP支付二维码" : "https://via.placeholder.com/200x200?text=文章支付二维码"}
              alt={paymentType === 'vip' ? "VIP支付二维码" : "文章支付二维码"}
              className="qr-code"
            />
          </div>
          <p className="payment-amount">支付金额：{paymentType === 'vip' ? "¥9.00" : "¥3.00"}</p>
          <p className="payment-note">
            {paymentType === 'vip' ? "支付成功后，点击'支付完成'按钮完成VIP升级" : "支付成功后，点击'支付完成'按钮查看完整文章"}
          </p>
        </div>
      </Modal>

      <div className={`mainMap`}>
        <div className="view-header">
          <h2>装修流程思维导图</h2>
          {viewType === 'simplemindmap' && mindData && !loading && (
            <MindMapSaver mindMapInstance={mindMapInstanceRef.current} />
          )}
        </div>
        <div className={`mindmap-wrapper mindWrapper-size`}>
          {currentViewComponent}
        </div>
        {panelVisible && (
          <div className="panel-mask" onClick={() => setPanelVisible(false)}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setPanelVisible(false)}>×</button>
              {selectedNode ? (
                <>
                  <h3>{selectedNode.name}</h3>
                  {selectedNode.details && (
                    <div className="content-scroll">
                      <div className="split-layout">
                        {/* 只有当存在有效图片地址时才显示图片轮播区域 */}
                        {selectedNode.img_url && Array.isArray(selectedNode.img_url) && selectedNode.img_url.some(img => img && typeof img === 'string') && (
                          <div className="image-carousel">
                            <Swiper
                              loop={selectedNode.img_url?.filter(img => img && typeof img === 'string').length >= 2}
                              pagination={{ clickable: true }}
                              slidesPerView={1}
                              className="my-swiper"
                              onSwiper={(swiper) => {
                                // 获取图片轮播区域元素
                                const carouselElement = document.querySelector('.image-carousel');
                                if (carouselElement) {
                                  // 添加鼠标滚轮事件监听
                                  const handleWheel = (e) => {
                                    e.preventDefault();
                                    // 根据滚轮方向切换图片
                                    if (e.deltaY > 0) {
                                      swiper.slideNext();
                                    } else {
                                      swiper.slidePrev();
                                    }
                                  };
                                  
                                  // 添加事件监听器
                                  carouselElement.addEventListener('wheel', handleWheel);
                                  
                                  // 组件卸载时移除事件监听器
                                  return () => {
                                    carouselElement.removeEventListener('wheel', handleWheel);
                                  };
                                }
                              }}
                            >
                              {selectedNode.img_url?.map((item, i) => (
                                item && typeof item === 'string' && (
                                  <SwiperSlide key={i}>
                                    <img
                                          src={imageFilePath + (item || '/error0.png')}
                                          className="carousel-image"
                                          alt={`知识点配图${i + 1}`}
                                          onClick={() => {
                                            setCurrentImageIndex(i);
                                            setFullscreenImageVisible(true);
                                          }}
                                          onError={(e) => {
                                            e.target.onerror = null; // 防止循环错误
                                            e.target.style.display = 'none';
                                            // 可以在这里添加一个占位符图片或文本
                                            const placeholderText = document.createElement('p');
                                            placeholderText.textContent = '图片加载失败';
                                            if (e.target.parentNode) e.target.parentNode.appendChild(placeholderText);
                                          }}
                                        />
                                  </SwiperSlide>
                                )
                              ))}
                            </Swiper>
                          </div>
                        )}
                        <div className="text-content">
                          <div className="knowledge-points">
                            {selectedNode.details?.map((item, idx) => (
                              item && typeof item === 'object' && item.text && (
                                <div
                                  key={idx}
                                  className="point"
                                >
                                  {selectedNode.is_premium && !isPremium && !hasPurchasedArticle(selectedNode.id) ? (
                                    // 付费节点且非VIP用户，只显示部分内容
                                    <>
                                      <div dangerouslySetInnerHTML={{ __html: marked.parse(truncateText(item.text)) }} />
                                      <div className="premium-locked">
                                        <p>该内容为VIP专属，仅对VIP用户开放全部内容，或直接付费阅读</p>
                                        {isAuthenticated ? (
                                          // 已登录用户，显示升级按钮和支付按钮
                                          <div className="premium-actions">
                                            <button className="upgrade-btn-detail" onClick={() => upgradeToPremium()}>
                                              立即升级为VIP
                                            </button>
                                            <button className="pay-btn-detail" onClick={() => purchaseArticle(selectedNode.id)}>
                                              立即付费阅读
                                            </button>
                                          </div>
                                        ) : (
                                          // 未登录用户，提示登录
                                          <p>请先登录后查看更多内容</p>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    // 免费节点或VIP用户，显示全部内容
                                    <div dangerouslySetInnerHTML={{ __html: marked.parse(item.text) }} />
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>请点击节点查看详细知识点</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




/**
 * 带侧边栏的布局组件
 * 用于包裹需要显示侧边栏的页面组件
 * @param {Object} props - 组件属性
 * @param {Array} props.navItems - 导航项数组
 * @param {boolean} props.isAuthenticated - 登录状态
 * @param {boolean} props.isPremium - VIP用户状态
 * @param {function} props.showLogin - 显示登录模态框的函数
 * @param {function} props.logout - 退出登录函数
 * @param {boolean} props.showWelcomeNotification - 是否显示欢迎通知
 * @param {function} props.onCloseWelcomeNotification - 关闭欢迎通知的回调函数
 */
const Layout = ({
  navItems,
  isAuthenticated,
  isPremium,
  showLogin,
  logout,
  showWelcomeNotification = false,
  onCloseWelcomeNotification
}) => {
  // 侧边栏折叠状态
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // 屏幕宽度状态
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 处理侧边栏折叠状态切换
  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="app-layout">
      {/* 欢迎通知 */}
      {showWelcomeNotification && (
        <UserWelcome
          isVisible={showWelcomeNotification}
          onClose={onCloseWelcomeNotification}
        />
      )}

      {/* 侧边栏 */}
      <Sidebar
        items={navItems}
        onLogin={(status) => status ? showLogin() : logout()}
        isAuthenticated={isAuthenticated}
        isPremium={isPremium}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 子路由内容 */}
      <div className={`main-content ${isSidebarCollapsed && !isMobile ? 'expanded' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};


export default function App() {
  const navigate = useNavigate(); // React Router's navigate hook


  const [loginVisible, setLoginVisible] = useState(false);
  const { isAuthenticated, isPremium, logout, loading } = useUser();

  const [showWelcome, setShowWelcome] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const handleOpenFeedbackModal = () => setFeedbackModalVisible(true);
  const handleCloseFeedbackModal = () => setFeedbackModalVisible(false);

  const navigationItems = [
    {
      id: 'document',
      icon: <FaFileAlt />,
      label: '文档',
      onClick: () => {
        // setCurrentDocPath('/README.md'); // Handled by effect or explicit navigation
        // setViewType('document'); // Handled by effect or explicit navigation
        navigate('/docs/README'); // Navigate to a docs route
      }
    },
    // {
    //   id: 'community',
    //   icon: <FaUsers />,
    //   label: '社区',
    //   onClick: () => navigate('/forum') // Use navigate for internal routing
    // },
    {
      id: 'simplemindmap',
      icon: <FaProjectDiagram />,
      label: '思维视图',
      // This assumes the main page '/' defaults to simplemindmap view
      onClick: () => navigate('/')
    },
    {
      id: 'feedback',
      icon: <FaCommentDots />,
      label: '意见反馈',
      onClick: handleOpenFeedbackModal
    }
  ];

  // Effect for welcome message
  useEffect(() => {
    if (isAuthenticated) setShowWelcome(true);
  }, [isAuthenticated]);

  const showLoginModal = () => setLoginVisible(true);
  const handleLoginSuccess = () => {
    setLoginVisible(false);
    // UserContext's login function should have already updated isAuthenticated
  };

  // 当加载中时，显示加载界面
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>正在加载用户信息...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        {/* 根Route，未登录前是欢迎页，登录后是侧边栏组件 */}
        <Route path="/" element={
          isAuthenticated ? (
            <Layout navItems={navigationItems}
              isAuthenticated={isAuthenticated}
              isPremium={isPremium}
              showLogin={showLoginModal}
              logout={logout}
              showWelcomeNotification={showWelcome}
              onCloseWelcomeNotification={() => setShowWelcome(false)}
            />) : (
            <WelcomePage showLogin={showLoginModal} />
          )} >
          {/* Layout的子Route，登录后显示的主要应用UI */}
          <Route path="/" element={<MainAppUI isAuthenticated={isAuthenticated} isPremium={isPremium}
            logout={logout} showLogin={showLoginModal} />} />
          <Route path="/forum" element={<CommunityPage />} />
          <Route path="/forum/post/:postId" element={<PostDetailPage />} />
          {/* Example route for DocsViewer if you want to navigate to specific docs */}
          <Route path="/docs/:docName" element={
            <MainAppUIWrapperForDocs />
          } />
          <Route path="*" element={<NotFoundPage />} /> {/* 捕获所有未匹配的路由并显示404页面 */}
          {/* Add other routes as needed */}
        </Route>
      </Routes>

      <Modal
        title=""
        open={loginVisible}
        footer={null}
        onCancel={() => setLoginVisible(false)}
        maskClosable={false}
        destroyOnHidden={true}
        width={360} // 设置Modal宽度
        style={{ borderRadius: '16px' }} // 添加圆角
      >
        {/* <Login onSuccess={handleLoginSuccess} /> */}
        <LoginBySupabaseUsername onSuccess={handleLoginSuccess} />
      </Modal>
      <FeedbackModal visible={feedbackModalVisible} onClose={handleCloseFeedbackModal} />
    </div>
  );
}

// Wrapper component to provide layout for DocsViewer when accessed via route
function MainAppUIWrapperForDocs() {
  const { docName: rawDocNameFromParams } = useParams();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const navigate = useNavigate();

  // Ensure docName always has .md, and handle cases where it might be undefined (though route should prevent this)
  // The route /docs redirects to /docs/README.md, so rawDocNameFromParams should generally be defined.
  const docName = rawDocNameFromParams || 'README'; // Fallback, e.g. if somehow /docs/:docName is hit with no param

  // Construct the path for fetching: served from /docs/filename.md
  // 使用import.meta.env.BASE_URL来动态获取base路径，确保在不同部署环境下都能正确访问文档
  //const documentToFetch = docName.endsWith('.md') ? docName : `${docName}.md`;
  const finalDocPath = `${import.meta.env.BASE_URL}docs/${docName}`;

  const handleDocNavigate = (newPath) => {
    // newPath from DocsViewer is usually a relative path like 'AnotherFile.md' or '../OtherDir/File.md'
    // Or an absolute path like '/docs/AnotherFile.md'
    if (newPath.startsWith('/docs/')) {
      navigate(newPath);
    } else if (newPath.startsWith('/')) { // e.g. /somefolder/AnotherFile.md
      navigate(`/docs${newPath}`);
    } else { // e.g. AnotherFile.md or ../OtherFolder/File.md
      // This needs careful handling if relative paths like ../ are used.
      // For simplicity, assuming newPath is a filename or relative to current /docs/ path.
      // A more robust solution might involve URL parsing if complex relative paths are needed.
      navigate(`/docs/${newPath}`);
    }
  };

  const handleCloseFeedbackModal = () => setFeedbackModalVisible(false);


  return (
    <div className="app-layout">
      <div className={`mainMap`}>
        <div className="view-header">
          {/* Display the name without .md for a cleaner title */}
          <h2>文档中心: {docName.replace('.md', '')}</h2>
        </div>
        <div className={`mindmap-wrapper mindWrapper-size docs-view-active`}>
          {/* Pass the correctly constructed path for fetching */}
          <DocsViewer docPath={finalDocPath} onNavigate={handleDocNavigate} />
        </div>
        <FeedbackModal visible={feedbackModalVisible} onClose={handleCloseFeedbackModal} />
      </div>
    </div>
  );
}

function buildMindMapStructure(flatData) {
  const nodeMap = new Map();
  let root = null;

  if (!Array.isArray(flatData) || flatData.length === 0) {
    console.error('无效的平面数据格式');
    return sampleData;
  }
  // console.log("buildMindMapStructure() flatData:", flatData);
  // 创建基础节点结构
  flatData.forEach(item => {
    if (!nodeMap.has(item.node_id)) {
      // 将数据平铺为，每个节点有自己的名字、详情、子节点，详情里面有文字和图片
      nodeMap.set(item.node_id, {
        name: item.name,
        details: item.details ? [{ text: item.details, image: item.image }] : [],
        img_url: item.img_url, // Assuming img_url collects images
        attachment_url: item.attachment_url,
        attachment_name: item.attachment_name,
        children: [],
        parent_id: item.parent_id,
        node_id: item.node_id,
        is_premium: item.is_premium
      });
    } else {
      // 这里是防止原始数据里有重复的node_id，若有，则合并详情和图片列表
      if (item.details) {
        nodeMap.get(item.node_id).details.push({ text: item.details, image: item.image });
      }
      if (item.img_url) {
        // Optional: collect all images in img_url if needed, though details has them
        const node = nodeMap.get(item.node_id);
        if (!node.img_url) node.img_url = [];
        node.img_url.push(item.image);
      }
    }
    // 设置根节点
    if (item.parent_id === null && !isNaN(item.node_id)) {
      root = nodeMap.get(item.node_id);
      console.log("buildMindTreeStructure() root:",root);
    }
  });
  const nodeMapCp = nodeMap;
  // 遍历节点，将具有父子关系的节点关联，构建父子关系
  nodeMapCp.forEach(item => {
    if (item.parent_id !== null && nodeMap.has(item.parent_id)) {
      const parent = nodeMap.get(item.parent_id);
      parent.children.push({
        name: item.name,
        details: item.details,
        img_url: item.img_url,
        attachment_url: item.attachment_url,
        attachment_name: item.attachment_name,
        children: item.children,
        node_id: item.node_id,
        is_premium: item.is_premium
      });
    }
  });
  return root ? {
    name: root.name,
    details: root.details,
    children: root.children,
    node_id: root.node_id,
    img_url: root.img_url,
    attachment_url: root.attachment_url,
    attachment_name: root.attachment_name
  } : sampleData;
}