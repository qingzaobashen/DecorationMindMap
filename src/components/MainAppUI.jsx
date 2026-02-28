import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { marked } from 'marked';
import { Modal, Button } from 'antd';
import { useUser } from '../context/UserContext';
import MindMap_SimpleMindMap from '../MindMap_SimpleMindMap';
import MindMapSaver from './MindMapSaver';
import { sampleData } from '../utils/sampleData';

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
        import('papaparse').then(({ default: Papa }) => {
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
    });
};

/**
 * 构建思维导图结构的函数
 * @param {Array} flatData - 平面节点数据
 * @returns {Object} 构建好的思维导图结构
 */
function buildMindMapStructure(flatData) {
  const nodeMap = new Map();
  let root = null;

  if (!Array.isArray(flatData) || flatData.length === 0) {
    console.error('无效的平面数据格式');
    return sampleData;
  }

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
  // console.log("buildMindMapStructure(): ", root);
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

/**
 * 主应用UI组件
 * 包含思维导图及节点弹窗
 * @param {Object} props - 组件属性
 * @param {boolean} props.isAuthenticated - 登录状态
 * @param {boolean} props.isPremium - VIP用户状态
 * @param {function} props.logout - 退出登录函数
 * @param {function} props.showLogin - 显示登录模态框的函数
 */
function MainAppUI({ isAuthenticated, isPremium, logout, showLogin }) 
{
  const [selectedNode, setSelectedNode] = useState(null);  // 当前选择的叶节点
  const [panelVisible, setPanelVisible] = useState(false); // 弹出窗是否可见
  const [mindData, setMindData] = useState(null);          // 思维导图的数据
  const [loading, setLoading] = useState(true);            // 是否正在加载中，初始为true
  const [viewType] = useState('simplemindmap'); // 导图的显示类型，默认simplemindmap
  const [fullscreenImageVisible, setFullscreenImageVisible] = useState(false); // 全屏图片查看器是否可见
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 当前查看的图片索引
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // 当前轮播图索引
  const mindMapInstanceRef = useRef(null);                   // 缓存思维导图实例
  const swiperInstanceRef = useRef(null);                    // 缓存Swiper实例

  const { isAuthenticated: userIsAuthenticated, isPremium: userIsPremium, upgradeToPremium, completeUpgradeToPremium,
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
    //console.log("MindMap instance loaded/reloaded in MainAppUI:", instance);
    mindMapInstanceRef.current = instance;
  }, []);

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
  }, [viewType, userIsAuthenticated]); // currentDocPath removed as docs view has its own route

  // Determine what to render based on the current route (implicitly) or viewType state
  // For this example, we assume MainAppUI is rendered for '/' and handles mindmap views
  // DocsViewer, CommunityPage will be handled by their own <Route> elements.

  let currentViewComponent = null;
  if (loading && viewType !== 'docs_page') {
    currentViewComponent = (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>正在加载思维导图数据...</p>
        <p className="loading-subtext">这可能需要几秒钟时间，请耐心等待</p>
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
  } else if (!loading && !mindData) {
    currentViewComponent = (
      <div className="empty-state">
        <p>暂无数据</p>
        <p className="empty-subtext">请稍后再试</p>
      </div>
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
            }} aria-label="关闭全屏图片" tabIndex={0} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFullscreenImageVisible(false);
              }
            }}>×</button>
            
            {/* 左右切换按钮 */}
            {currentImageIndex > 0 && (
              <button className="fullscreen-nav-btn prev-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev - 1);
              }} 
              aria-label="上一张图片" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setCurrentImageIndex(prev => prev - 1);
                }
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
            
            {currentImageIndex < selectedNode.img_url.length - 1 && (
              <button className="fullscreen-nav-btn next-btn" 
                onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev + 1);
                }} 
                aria-label="下一张图片" 
                tabIndex={0} 
                onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  setCurrentImageIndex(prev => prev + 1);
                }
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
            
            {/* 图片 */}
            <img
              src={imageFilePath + (selectedNode.img_url[currentImageIndex] || '/error0.png')}
              className="fullscreen-image"
              alt={`全屏查看图片${currentImageIndex + 1}`}
              loading="lazy"
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
        <header className="view-header">
          <h2>装修流程思维导图</h2>
          {viewType === 'simplemindmap' && mindData && !loading && (
            <MindMapSaver mindMapInstance={mindMapInstanceRef.current} />
          )}
        </header>
        <main className={`mindmap-wrapper mindWrapper-size`}>
          {currentViewComponent}
        </main>
        {panelVisible && (
          <div className="panel-mask" onClick={() => setPanelVisible(false)}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="node-detail-title">
              <button className="close-btn" onClick={() => setPanelVisible(false)} aria-label="关闭详情面板" tabIndex={0} onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                  e.preventDefault();
                  setPanelVisible(false);
                }
              }}>×</button>
              {selectedNode ? (
                <>
                  <h3 id="node-detail-title">{selectedNode.name}</h3>
                  {selectedNode.details && (
                    <div className="content-scroll">
                      <div className="split-layout">
                        {/* 只有当存在有效图片地址时才显示图片轮播区域 */}
                        {selectedNode.img_url && Array.isArray(selectedNode.img_url) && selectedNode.img_url.some(img => img && typeof img === 'string') && (
                          <div className="image-carousel">
                            <Swiper
                              loop={selectedNode.img_url?.filter(img => img && typeof img === 'string').length >= 2}
                              pagination={{ clickable: true }}
                              navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                              }}
                              slidesPerView={1}
                              className="my-swiper"
                              onSwiper={(swiper) => {
                                // 保存Swiper实例
                                swiperInstanceRef.current = swiper;
                                // 初始化时设置当前索引
                                setCurrentSlideIndex(swiper.realIndex);
                                
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
                              onSlideChange={(swiper) => {
                                // 更新当前幻灯片索引
                                setCurrentSlideIndex(swiper.realIndex);
                              }}
                            >
                              {selectedNode.img_url?.map((item, i) => (
                                item && typeof item === 'string' && (
                                  <SwiperSlide key={i}>
                                    <img
                                          src={imageFilePath + (item || '/error0.png')}
                                          className="carousel-image"
                                          alt={`知识点配图${i + 1}`}
                                          loading="lazy"
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
                            {/* 左右切换按钮 */}
                            <div 
                              className="swiper-button-prev"
                              onClick={() => {
                                if (swiperInstanceRef.current) {
                                  swiperInstanceRef.current.slidePrev();
                                }
                              }}
                              aria-label="上一张图片"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                            </div>
                            <div 
                              className="swiper-button-next"
                              onClick={() => {
                                if (swiperInstanceRef.current) {
                                  swiperInstanceRef.current.slideNext();
                                }
                              }}
                              aria-label="下一张图片"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </div>
                            {/* 图片序号显示 */}
                            <div className="image-counter-pre">
                              {currentSlideIndex + 1}/{selectedNode.img_url?.filter(img => img && typeof img === 'string').length}
                            </div>
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
                                  {selectedNode.is_premium && !userIsPremium && !hasPurchasedArticle(selectedNode.id) ? (
                                    // 付费节点且非VIP用户，只显示部分内容
                                    <>
                                      <div dangerouslySetInnerHTML={{ __html: marked.parse(truncateText(item.text)) }} />
                                      <div className="premium-locked">
                                        <p>该内容为VIP专属，仅对VIP用户开放全部内容，或直接付费阅读</p>
                                        {userIsAuthenticated ? (
                                          // 已登录用户，显示升级按钮和支付按钮
                                          <div className="premium-actions">
                                            <button className="upgrade-btn-detail" onClick={() => upgradeToPremium()} tabIndex={0} onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                upgradeToPremium();
                                              }
                                            }} aria-label="立即升级为VIP">
                                              立即升级为VIP
                                            </button>
                                            <button className="pay-btn-detail" onClick={() => purchaseArticle(selectedNode.id)} tabIndex={0} onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                purchaseArticle(selectedNode.id);
                                              }
                                            }} aria-label="立即付费阅读">
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



export default MainAppUI;