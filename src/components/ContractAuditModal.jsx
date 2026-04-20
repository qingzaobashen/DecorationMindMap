/**
 * 合同审计模态框组件
 * 提供图片上传、AI合同识别和审计功能
 */
import React, { useState, useRef } from 'react';
import { Modal, Upload, Button, message, Spin, Result } from 'antd';
import { UploadOutlined, FileImageOutlined, AuditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import supabase from '../utils/supabase';
import './ContractAuditModal.css';

const { Dragger } = Upload;

/**
 * 合同审计配置
 */
const CONTRACT_AUDIT_CONFIG = {
  edgeFunctionUrl: 'https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/contract-audit'
};

/**
 * 合同审计模态框组件
 * @param {object} props - 组件属性
 * @param {boolean} props.visible - 模态框是否可见
 * @param {function} props.onClose - 关闭模态框的回调函数
 * @param {object} props.nodeData - 当前节点数据
 */
const ContractAuditModal = ({ visible, onClose, nodeData }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [fileList, setFileList] = useState([]);
  const draggerRef = useRef(null);

  /**
   * 处理图片上传
   */
  const handleUploadChange = async (info) => {
    const { status, originFileObj, name } = info.file;
    
    if (status === 'uploading') {
      setUploading(true);
      return;
    }

    if (status === 'done') {
      const base64 = await convertFileToBase64(originFileObj);
      setImageUrl(base64);
      setFileList([{ ...info.file, status: 'done', url: base64 }]);
      message.success('图片上传成功');
    } else if (status === 'error') {
      message.error('图片上传失败');
    }
    setUploading(false);
  };

  /**
   * 将文件转换为Base64
   * @param {File} file - 文件对象
   * @returns {Promise<string>} Base64字符串
   */
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * 处理图片预览
   */
  const handlePreview = async () => {
    if (!imageUrl) {
      message.warning('请先上传合同图片');
      return;
    }
    window.open(imageUrl, '_blank');
  };

  /**
   * 调用AI接口进行合同审计
   */
  const handleAudit = async () => {
    if (!imageUrl) {
      message.warning('请先上传合同图片');
      return;
    }

    setLoading(true);
    setAuditResult(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error('无法获取 session: ' + sessionError.message);
      }
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('用户未登录，请先登录后再提交审计');
      }

      const response = await axios.post(
        CONTRACT_AUDIT_CONFIG.edgeFunctionUrl,
        {
          imageData: imageUrl,
          nodeText: nodeData?.text || '',
          requestId: Date.now().toString()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          timeout: 120000
        }
      );

      if (response.data.success) {
        setAuditResult(response.data.data);
        message.success('审计完成');
      } else {
        throw new Error(response.data.message || '审计失败');
      }
    } catch (error) {
      console.error('合同审计失败:', error);
      message.error(error.message || '审计失败，请稍后再试');
      setAuditResult({
        isError: true,
        errorMessage: error.message || '审计失败，请稍后再试'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重置组件状态
   */
  const handleReset = () => {
    setAuditResult(null);
    setImageUrl(null);
    setFileList([]);
    setLoading(false);
    setUploading(false);
  };

  /**
   * 关闭模态框
   */
  const handleClose = () => {
    handleReset();
    onClose();
  };

  /**
   * 移除已上传的图片
   */
  const handleRemove = () => {
    setImageUrl(null);
    setFileList([]);
    setAuditResult(null);
  };

  const uploadProps = {
    name: 'contractImage',
    multiple: false,
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: () => false,
    onChange: handleUploadChange,
    fileList
  };

  return (
    <Modal
      title={
        <div className="contract-audit-modal-title">
          <AuditOutlined style={{ marginRight: 8 }} />
          合同审计
          {nodeData?.text && <span className="contract-audit-node-text"> - {nodeData.text}</span>}
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={700}
      destroyOnHidden={true}
      maskClosable={false}
      footer={
        !auditResult || auditResult.isError ? (
          <div className="contract-audit-footer">
            <Button onClick={handleClose}>取消</Button>
            {imageUrl && !auditResult && (
              <Button type="primary" onClick={handleAudit} loading={loading}>
                开始审计
              </Button>
            )}
          </div>
        ) : (
          <div className="contract-audit-footer">
            <Button onClick={handleReset}>重新上传</Button>
            <Button type="primary" onClick={handleClose}>完成</Button>
          </div>
        )
      }
    >
      <div className="contract-audit-content">
        {/* 图片上传区域 */}
        <div className="contract-audit-upload-section">
          <Dragger ref={draggerRef} {...uploadProps} disabled={loading || uploading}>
            {imageUrl ? (
              <div className="contract-audit-image-preview">
                <img src={imageUrl} alt="合同预览" className="contract-audit-preview-img" />
                <div className="contract-audit-preview-overlay">
                  <Button size="small" onClick={(e) => { e.stopPropagation(); handlePreview(); }} icon={<FileImageOutlined />}>
                    预览
                  </Button>
                  <Button 
                    size="small" 
                    danger 
                    onClick={(e) => { e.stopPropagation(); handleRemove(); }} 
                    icon={<CloseCircleOutlined />}
                    disabled={loading}
                  >
                    移除
                  </Button>
                </div>
              </div>
            ) : (
              <div className="contract-audit-upload-tip">
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽上传合同照片</p>
                <p className="ant-upload-hint">支持 JPG、PNG 格式，建议图片清晰可读</p>
              </div>
            )}
            {(uploading) && (
              <div className="contract-audit-loading-overlay">
                <Spin tip="上传中..." />
              </div>
            )}
          </Dragger>
        </div>

        {/* 审计结果区域 */}
        {loading && (
          <div className="contract-audit-loading">
            <Spin size="large" tip="AI 正在分析合同，请稍候..." />
          </div>
        )}

        {auditResult && !loading && (
          <div className={`contract-audit-result ${auditResult.isError ? 'contract-audit-result-error' : ''}`}>
            {auditResult.isError ? (
              <Result
                status="error"
                title="审计失败"
                subTitle={auditResult.errorMessage}
              />
            ) : (
              <>
                <Result
                  status={auditResult.hasIssue ? "warning" : "success"}
                  title={auditResult.hasIssue ? "审计发现问题" : "审计通过"}
                  subTitle={auditResult.summary}
                />
                {auditResult.issues && auditResult.issues.length > 0 && (
                  <div className="contract-audit-issues">
                    <h4>发现问题：</h4>
                    <ul>
                      {auditResult.issues.map((issue, index) => (
                        <li key={index} className={`contract-audit-issue-item issue-${issue.severity}`}>
                          <span className="issue-severity">[{issue.severity}]</span>
                          <span className="issue-title">{issue.title}</span>
                          <p className="issue-description">{issue.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {auditResult.suggestions && auditResult.suggestions.length > 0 && (
                  <div className="contract-audit-suggestions">
                    <h4>建议：</h4>
                    <ul>
                      {auditResult.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ContractAuditModal;
