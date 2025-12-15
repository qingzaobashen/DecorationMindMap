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
  const { isPremium, username } = useUser(); // 获取VIP状态和用户信息
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // 控制升级弹窗
  
  // 存储触摸事件处理函数的引用，以便在清理函数中使用
  const touchEventHandlersRef = useRef({
    handleWindowTouchStart: null,
    handleWindowTouchMove: null,
    handleWindowTouchEnd: null
  });

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
        isDisableDrag: false,
        useLeftKeySelectionRightKeyDrag: false,

      });

      mindMapRef.current = mindMap;

      // 传递 mindMap 实例给父组件
      if (onMindMapLoad) {
        onMindMapLoad(mindMap);
      }
      
      // 存储双指触摸距离，用于计算缩放比例
      let lastDistance = null;
      let lastDeltaY = null;
      
      // 在画布容器上添加触摸事件监听器，并将触摸事件转换为鼠标事件
      // 这样simple-mind-map库就能识别和处理移动设备上的拖拽和缩放操作
      const handleCanvasTouchStart = (e) => {
        e.preventDefault();
        
        // 处理单指触摸，转换为mousedown事件
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true
          });
          touch.target.dispatchEvent(mouseEvent);
        }
        // 处理双指触摸，记录初始距离
        else if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          lastDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
        }
      };
      
      const handleCanvasTouchMove = (e) => {
        e.preventDefault();
        
        // 处理单指触摸，转换为mousemove事件
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true
          });
          touch.target.dispatchEvent(mouseEvent);
        }
        // 处理双指触摸，计算缩放比例并转换为mousewheel事件
        else if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          // console.log('currentDistance:', currentDistance, ', lastDistance:', lastDistance);
          
          if (lastDistance) {
            // 计算缩放比例，转换为鼠标滚轮事件的delta值
            let scale = currentDistance / lastDistance;
            let deltaY = scale > 1 ? -scale+1 : 1-scale; // 放大时deltaY为负，缩小时为正
            // 限制缩放比例，防止过快缩放
            if (Math.abs(deltaY - lastDeltaY) > 0.2) {
              deltaY = (deltaY - lastDeltaY)>0 ? 0.2 + deltaY : -0.2 + deltaY;
            }
            // console.log('scale:', scale, ', deltaY:', deltaY);
            // 获取双指中心点作为缩放中心
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            
            // 创建并触发鼠标滚轮事件
            const wheelEvent = new WheelEvent('wheel', {
              isTrusted: true,
              composed:true,
              ctrlKey: true,
              deltaY: deltaY,
              clientX: centerX,
              clientY: centerY,
              bubbles: true,
              cancelable: true
            });
            touch1.target.dispatchEvent(wheelEvent);
            lastDistance = currentDistance;
            lastDeltaY = deltaY;
          }
        }
      };
      
      const handleCanvasTouchEnd = (e) => {
        e.preventDefault();
        
        // 重置双指触摸距离
        lastDistance = null;
        
        // 处理单指触摸结束，触发mouseup和click事件
        if (e.changedTouches.length === 1 && e.touches.length === 0) {
          const touch = e.changedTouches[0];
          
          // 触发mouseup事件
          const mouseUpEvent = new MouseEvent('mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true
          });
          touch.target.dispatchEvent(mouseUpEvent);
          
          // 触发click事件，确保节点点击事件能够被正确处理
          const clickEvent = new MouseEvent('click', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true
          });
          touch.target.dispatchEvent(clickEvent);
        }
      };
      
      // 在画布容器上添加触摸事件监听器
      const canvasElement = containerRef.current;
      canvasElement.addEventListener('touchstart', handleCanvasTouchStart);
      canvasElement.addEventListener('touchmove', handleCanvasTouchMove);
      canvasElement.addEventListener('touchend', handleCanvasTouchEnd);
      
      // 存储画布触摸事件处理函数引用，以便清理
      touchEventHandlersRef.current.canvasHandlers = {
        handleCanvasTouchStart,
        handleCanvasTouchMove,
        handleCanvasTouchEnd
      };

      // mindMap.on('mousewheel', (e) => {
      //   console.log('mindMap.on(\'mousewheel\'):', e);
      // })

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
            return;
          }
        }
        
      });
    } catch (error) {
      console.error('思维导图初始化失败:', error);
    }

    return () => {
      if (mindMapRef.current) {
        mindMapRef.current.destroy();
        mindMapRef.current = null;
      }
      // 清理触摸事件监听器
      const { handleWindowTouchStart, handleWindowTouchMove, handleWindowTouchEnd, canvasHandlers } = touchEventHandlersRef.current;
      if (handleWindowTouchStart) window.removeEventListener('touchstart', handleWindowTouchStart);
      if (handleWindowTouchMove) window.removeEventListener('touchmove', handleWindowTouchMove);
      if (handleWindowTouchEnd) window.removeEventListener('touchend', handleWindowTouchEnd);
      
      // 清理画布上的触摸事件监听器
      if (canvasHandlers) {
        const { handleCanvasTouchStart, handleCanvasTouchMove, handleCanvasTouchEnd } = canvasHandlers;
        const canvasElement = containerRef.current;
        if (canvasElement) {
          canvasElement.removeEventListener('touchstart', handleCanvasTouchStart);
          canvasElement.removeEventListener('touchmove', handleCanvasTouchMove);
          canvasElement.removeEventListener('touchend', handleCanvasTouchEnd);
        }
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