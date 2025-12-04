// 从react库中导入useState钩子
import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';

import { Outlet } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Modal } from 'antd';
import { marked } from 'marked';

// 导入App.css样式文件
import './App.css';


// 从UserContext导入useUser
import { useUser } from './context/UserContext';
import Login from './components/Login';
// 导入WelcomePage组件
import WelcomePage from './components/WelcomePage';
import MindMap_SimpleMindMap from './MindMap_SimpleMindMap';
import { FaFileAlt, FaUsers, FaProjectDiagram, FaCommentDots } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import UserWelcome from './components/UserWelcome';
import LoginBySupabase from './components/Login_supabase';
import DocsViewer from './components/DocsViewer';
import MindMapControls from './components/MindMapControls';
import FeedbackModal from './components/FeedbackModal';
// Import community pages with corrected casing
import CommunityPage from './components/Community/CommunityPage';
import PostDetailPage from './components/Community/PostDetailPage';
import { sampleData } from './utils/sampleData';

const PORT = 3000;

// 返回主界面的思维导图及节点弹窗
function MainAppUI() {
  const [selectedNode, setSelectedNode] = useState(null);  // 当前选择的叶节点
  const [panelVisible, setPanelVisible] = useState(false); // 弹出窗是否可见
  const [mindData, setMindData] = useState(null);          // 思维导图的数据
  const [loading, setLoading] = useState(true);            // 是否正在加载中，初始为true
  const [viewType, setViewType] = useState('simplemindmap'); // 导图的显示类型，默认simplemindmap
  const mindMapInstanceRef = useRef(null);                   // 缓存思维导图实例
  const navigate = useNavigate(); // React Router's navigate hook

  const { isAuthenticated } = useUser();

  // 设置思维导图实例缓存的回调函数，传给MindMap_SimpleMindMap子组件，让它创建好实例后把实例缓存起来
  const memoizedOnMindMapLoad = useCallback((instance) => {
    console.log("MindMap instance loaded/reloaded in MainAppUI:", instance);
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
    setSelectedNode({ name: nodeName, details, img_url: img_url });
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
            const response = await fetch(`http://localhost:${PORT}/api/nodes`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            setMindData(buildMindMapStructure(await response.json()));
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

      <div className={`mainMap`}>
        <div className="view-header">
          <h2>装修流程思维导图</h2>
          {viewType === 'simplemindmap' && mindData && !loading && (
            <MindMapControls mindMapInstance={mindMapInstanceRef.current} />
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
                        <div className="image-carousel">
                          <Swiper
                            loop={selectedNode.details?.length >= 2}
                            pagination={{ clickable: true }}
                            slidesPerView={1}
                            className="my-swiper"
                          >
                            {selectedNode.img_url?.map((item, i) => (
                              item && typeof item === 'string' && (
                                <SwiperSlide key={i}>
                                  <img
                                    src={item || '/resources/style1.png'}
                                    className="carousel-image"
                                    alt={`知识点配图${i + 1}`}
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
                        <div className="text-content">
                          <div className="knowledge-points">
                            {selectedNode.details?.map((item, idx) => (
                              item && typeof item === 'object' && item.text && (
                                <div
                                  key={idx}
                                  className="point"
                                  dangerouslySetInnerHTML={{
                                    __html: marked.parse(item.text)
                                  }}
                                />
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
      <div className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};


export default function App() {
  const navigate = useNavigate(); // React Router's navigate hook


  const [loginVisible, setLoginVisible] = useState(false);
  const { isAuthenticated, isPremium, logout, login } = useUser(); // Ensure login is available if needed directly

  const [showWelcome, setShowWelcome] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const handleOpenFeedbackModal = () => setFeedbackModalVisible(true);
  const handleCloseFeedbackModal = () => setFeedbackModalVisible(false);

  const [name, setName] = useState("unknown");
/**
   * 调用API函数
   * 在GitHub Pages环境中会优雅降级为使用模拟数据
   */
  const callApi = async () => {
    try {
      // 尝试调用API - 在GitHub Pages环境下这将失败
      const response = await fetch("./api/"); // 使用相对路径
      if (response.ok) {
        const data = await response.json();
        setName(data.name);
      } else {
        // API调用失败，使用模拟数据
        console.log("API调用失败，使用模拟数据");
        setName("模拟API数据 - GitHub Pages环境");
      }
    } catch (error) {
      // 捕获网络错误，使用模拟数据
      console.log("网络错误，使用模拟数据:", error);
      setName("模拟API数据 - GitHub Pages环境");
    }
  };
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
          {/* 子Route，登录后显示的主要应用UI */}
          <Route path="/" element={<MainAppUI isAuthenticated={isAuthenticated} isPremium={isPremium}
            logout={logout} showLogin={showLoginModal} />} />
          <Route path="/forum" element={<CommunityPage />} />
          <Route path="/forum/post/:postId" element={<PostDetailPage />} />
          {/* Example route for DocsViewer if you want to navigate to specific docs */}
          <Route path="/docs/:docName" element={
            <MainAppUIWrapperForDocs />
          } />
          <Route path="*" element={<Navigate to="/" />} /> {/* 捕获所有未匹配的路由并重定向到主页 */}
          {/* Add other routes as needed */}
        </Route>
      </Routes>

      <Modal
        title="用户登录"
        open={loginVisible}
        footer={null}
        onCancel={() => setLoginVisible(false)}
        maskClosable={false}
        destroyOnClose={true}
      >
        {/* <Login onSuccess={handleLoginSuccess} /> */}
        <LoginBySupabase onSuccess={handleLoginSuccess} />
      </Modal>
      <FeedbackModal visible={feedbackModalVisible} onClose={handleCloseFeedbackModal} />
      {/* <div className="card">
        <button
          onClick={callApi}
          aria-label="get name"
        >
          Name from API is: {name}
        </button>
        <p>
          Edit <code>./start.js</code> to change the name
        </p>
      </div> */}
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
  //const documentToFetch = docName.endsWith('.md') ? docName : `${docName}.md`;
  const finalDocPath = `/docs/${docName}`;

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

// function buildMindTreeStructure(flatData) {
// // 从数据库的扁平数据结构转换为前端需要的树形结构
// // 输入：平面数据，包含节点ID、名称、详情、图片和父节点ID
// // 输出：树形数据，每个节点包含：
// // label: 字符串类型，默认为空。节点的标签文本。
// // direction: 数字类型，默认为0。节点方向，1表示向右，0表示无偏移，-1表示向左。
// // isRoot: 布尔类型，默认为false。指示该节点是否为根节点。
// // children: 字符串数组，默认为空数组。子节点的ID列表。
// // isExpand: 布尔类型，默认为true。节点初始展开状态。
//   const nodeMap = new Map();
//   let root = null;
//   if (!Array.isArray(flatData) || flatData.length === 0) {
//     // 如果 flatData 不是预期的数组格式，记录错误并使用 sampleData 的 children 部分作为 Plan B
//     console.error('buildMindTreeStructure: 无效的平面数据格式，尝试使用 sampleData.children');
//     if (sampleData && Array.isArray(sampleData.children)) {
//         // 这是一个简化的转换，可能需要根据mindmap-tree的具体需求调整
//         // 这里仅做了一个非常基础的映射，实际可能需要更复杂的逻辑
//         const treeResult = {};
//         let nodeIdCounter = 1000; // 避免与 sampleData 中可能存在的 id 冲突
//         const convertSampleToTree = (nodes, parentId) => {
//             nodes.forEach(sNode => {
//                 const currentId = (nodeIdCounter++).toString();
//                 treeResult[currentId] = {
//                     label: sNode.name,
//                     direction: 1,
//                     isRoot: !parentId,
//                     children: [],
//                     isExpand: true,
//                     // details: sNode.details // mindmap-tree 可能不直接使用此结构
//                 };
//                 if(parentId && treeResult[parentId]){
//                     treeResult[parentId].children.push(currentId);
//                 }
//                 if(sNode.children && sNode.children.length > 0){
//                     convertSampleToTree(sNode.children, currentId);
//                 }
//                 if(!parentId && !root) root = treeResult[currentId]; // 设置根节点
//             });
//         }
//         convertSampleToTree(sampleData.children, null);
//         return treeResult;
//     } else {
//         console.error('buildMindTreeStructure: sampleData.children 也无效，返回空对象');
//         return {}; // 返回空对象或一个基础的根节点
//     }
//   }

//   flatData.forEach(item => {
//     if (!nodeMap.has(item.node_id)) {
//       nodeMap.set(item.node_id.toString(), { // Ensure node_id is string for consistency
//         label: item.name || '',
//         direction: 1, 
//         isRoot: false,
//         children: [], 
//         isExpand: true,
//         details: item.details ? [{ text: item.details, image: item.image }] : [],
//         parent_id: item.parent_id ? item.parent_id.toString() : null, // Ensure parent_id is string or null
//         node_id: item.node_id.toString(),
//       });
//     } else {
//       if (item.details) {
//         // Ensure details is an array and item.details is valid before pushing
//         let existingNode = nodeMap.get(item.node_id.toString());
//         if (!Array.isArray(existingNode.details)) existingNode.details = [];
//         existingNode.details.push({ text: item.details, image: item.image });
//       }
//     }
//   });

//   // 2. 组装父子关系
//   nodeMap.forEach((node, id) => {
//     if (node.parent_id === null || node.parent_id === undefined) {
//       node.isRoot = true;
//       if (!root) root = node; // Set the first root found
//     } else if (nodeMap.has(node.parent_id)) {
//       const parent = nodeMap.get(node.parent_id);
//       if (parent && Array.isArray(parent.children)) { // Ensure parent and children array exist
//            parent.children.push(id);
//       }
//     } else {
//         // If parent_id exists but parent node is not in map, consider this node a root (or orphaned)
//         console.warn(`Node ${id} has parent_id ${node.parent_id} but parent not found. Marking as root.`);
//         node.isRoot = true;
//         if(!root) root = node; // If no root was set yet
//     }
//   });

//   // If no root was identified (e.g., circular dependencies or all nodes have parents not in the list),
//   // try to find a node without a listed parent or just pick the first one.
//   if (!root && nodeMap.size > 0) {
//       for (const node of nodeMap.values()) {
//           if (!node.parent_id || !nodeMap.has(node.parent_id)) {
//               node.isRoot = true;
//               root = node;
//               break;
//           }
//       }
//       if (!root) { // Fallback: pick the first node as root
//         root = nodeMap.values().next().value;
//         if(root) root.isRoot = true;
//       }
//   }

//   const result = {};
//   nodeMap.forEach((value, key) => {
//     // 只保留需要的字段
//     result[key] = {
//       children: value.children,
//       label: value.label,
//       direction: value.direction,
//       isRoot: value.isRoot,
//       isExpand: value.isExpand
//       // 你可以按需添加其他字段
//     };
//   });
//   return result;
// }

function buildMindMapStructure(flatData) {
  const nodeMap = new Map();
  let root = null;

  if (!Array.isArray(flatData) || flatData.length === 0) {
    console.error('无效的平面数据格式');
    return sampleData;
  }
  console.log("buildMindMapStructure() flatData:", flatData);
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
        node_id: item.node_id
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
    if (item.parent_id === null) {
      root = nodeMap.get(item.node_id);
    }
  });
  console.log("buildMindMapStructure() nodeMap:", nodeMap);
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
        node_id: item.node_id
      });
    }
  });
  console.log("buildMindTreeStructure() root:", root);
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

