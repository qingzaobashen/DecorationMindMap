import React, { useState } from 'react';
import { Button, Modal, Form, Input, message, Upload, Alert } from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  FileExcelOutlined, 
  UploadOutlined,
  LockOutlined 
} from '@ant-design/icons';
import { useUser } from '../context/UserContext';

const MindMapControls = ({ data, onDataChange, selectedNode, mindMapInstance }) => {
  const { isPremium, saveUserData } = useUser();

  // 保存编辑后的思维导图
  const handleSaveMindMap = async () => {
    if (!isPremium) {
      message.warning('保存功能仅对VIP用户开放');
      return;
    }
    
    if (!mindMapInstance) {
      message.error('思维导图实例不存在，无法保存');
      return;
    }

    try {
      const mindMapData = mindMapInstance.getData(true); // 获取完整数据
      const saved = await saveUserData(mindMapData, 'mindmap_simple'); // 使用新的type或根据需要调整
      if (saved) {
        message.success('思维导图已保存');
      }
    } catch (error) {
      console.error('保存思维导图失败:', error);
      message.error('保存失败，请稍后再试');
    }
  };
  
  return (
    <div className="mindmap-controls">
      {/* 保存按钮 */}
      <Button 
        type="primary" 
        icon={<SaveOutlined />} 
        className="edit-mindmap-btn"
        onClick={handleSaveMindMap}
        disabled={!isPremium}
        title={isPremium ? "保存思维导图" : "VIP用户专享功能"}
      >
        保存思维导图
      </Button>
    </div>
  );
};

export default MindMapControls; 