import React, { useRef, useEffect, useState, useCallback } from 'react';
import MindMap from 'simple-mind-map';
import 'simple-mind-map/dist/simpleMindMap.esm.css';
import { LockOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import { useUser } from './context/UserContext';
import { convertMarkdownToMindMap, convertObjectToMindMap } from './utils/mindmapUtils';
import { customNoteContentShowPlugin } from './utils/mindmapPlugins';

const MindMap_SimpleMindMap = ({ data, onNodeClick, onMindMapLoad }) => {
  const containerRef = useRef(null);
  const mindMapRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const { isPremium, username } = useUser(); // 获取VIP状态和用户信息
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // 控制升级弹窗

  const handleDownloadClick = useCallback((nodeData) => {
    if (isPremium) {
      if (nodeData.data.attachmentUrl) {
        console.log(`开始下载 ${nodeData.data.attachmentName}`);
        // 实际下载文件，可以创建一个a标签点击，或者 window.open
        const link = document.createElement('a');
        link.href = nodeData.data.attachmentUrl;
        link.setAttribute('download', `${nodeData.data.attachmentName}`); // 或者从 downloadUrl 获取文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('该节点没有可下载的文件。');
      }
    } else {
      setShowUpgradeModal(true);
    }
  }, [isPremium]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 清理之前的实例
    if (mindMapRef.current) {
      mindMapRef.current.destroy();
      mindMapRef.current = null;
    }

    // 准备数据
    let mindMapData;
    try {
      if (typeof data === 'string') {
        // Markdown 数据
        mindMapData = convertMarkdownToMindMap(data);
      } else {
        // 对象数据
        mindMapData = convertObjectToMindMap(data);
      }

      if (!mindMapData) {
        console.error('无法解析数据:', typeof (data));
        return;
      }

      console.log('SimpleMindMap 数据:', mindMapData);

      // 创建思维导图实例
      const mindMap = new MindMap({
        el: containerRef.current,
        data: mindMapData,
        // 新增自定义备注配置
        customNoteContentShow: customNoteContentShowPlugin,
        direction: MindMap.RIGHT,
        draggable: true,
        contextMenu: true,
        toolBar: true,
        nodeMenu: true,
        theme: {
          cssVar: {
            '--main-color': '#4a89dc',
            '--main-bgcolor': '#f5f6fa',
            '--color': '#333',
            '--bgcolor': '#fff',
          }
        },

      });

      mindMapRef.current = mindMap;

      // 传递 mindMap 实例给父组件
      if (onMindMapLoad) {
        onMindMapLoad(mindMap);
      }

      mindMap.on('node_click', (node, e) => {
        if (node === null) return;

        const clickedIconSvg = e.target.closest('svg[cursor="pointer"]');
        //console.log("mindMap.on('node_click') clickedIconSvg:",node.nodeData);
        if (clickedIconSvg) {
          // 1、处理附件下载按钮点击
          const titleElement = clickedIconSvg.querySelector(':scope > title'); // :scope确保是直接子元素
          if (titleElement && titleElement.textContent === node.nodeData.data.attachmentName) {
            e.stopPropagation(); // 阻止节点点击事件，避免冲突
            handleDownloadClick(node.nodeData);
            return;
          }
          // 2、处理节点备注点击
          const isNoteClick = e.target.closest('.smm-node-note');
          if (isNoteClick) {
            console.log("mindMap.on('node_click') isNoteClick:", node.nodeData);
            onNodeClick(node.nodeData);
            if (mindMap.plugins && mindMap.plugins.customNoteContentShow != undefined) {
              mindMap.plugins.customNoteContentShow.hide();
            }
          }
        }

      });

      setIsReady(true);
    } catch (error) {
      console.error('思维导图初始化失败:', error);
    }

    return () => {
      if (mindMapRef.current) {
        mindMapRef.current.destroy();
        mindMapRef.current = null;
      }
      // 清理可能存在的弹窗
      const existingPanels = document.querySelectorAll('.custom-note-panel');
      existingPanels.forEach(panel => panel.remove());
    };
  }, [data, onMindMapLoad, handleDownloadClick]);

  return (
    <>
      <div className="simple-mindmap-container" style={{ width: '100%', height: '100%' }}>
        <div
          ref={containerRef}
          className="mindmap-canvas"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <Modal
        title="升级提示"
        open={showUpgradeModal}
        onCancel={() => setShowUpgradeModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowUpgradeModal(false)}>
            取消
          </Button>,
          <Button key="upgrade" type="primary" onClick={() => {
            // 这里可以调用 UserContext 中的 upgradeToPremium 方法，或导航到升级页面
            // 例如: history.push('/upgrade');
            message.info('请联系管理员或前往充值页面升级为VIP用户。');
            setShowUpgradeModal(false);
          }}>
            立即升级
          </Button>,
        ]}
      >
        <p><LockOutlined /> 此下载功能为VIP用户专享，升级后即可使用。</p>
        <p>当前用户: {username || '未登录'}</p>
      </Modal>
    </>
  );
};

export default React.memo(MindMap_SimpleMindMap);