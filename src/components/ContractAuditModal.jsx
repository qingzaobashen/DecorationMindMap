/**
 * 合同审计模态框组件
 * 提供图片上传、AI合同识别和审计功能
 */
import React, { useState, useRef } from 'react';
import { Modal, Upload, Button, message, Spin, Result } from 'antd';
import { UploadOutlined, AuditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import supabase from '../utils/supabase';
import './ContractAuditModal.css';

const { Dragger } = Upload;

/**
 * 合同审计配置
 */
const CONTRACT_AUDIT_CONFIG = {
  edgeFunctionUrl: 'https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/contractAudit_edgFunc',
  maxImageCount: 8
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
  const [imageUrls, setImageUrls] = useState([]);
  const [fileList, setFileList] = useState([]);
  const draggerRef = useRef(null);

  /**
   * 处理图片上传
   */
  const handleUploadChange = async (info) => {
    // 检查图片数量限制
    if (imageUrls.length >= CONTRACT_AUDIT_CONFIG.maxImageCount) {
      message.warning(`最多只能上传 ${CONTRACT_AUDIT_CONFIG.maxImageCount} 张图片`);
      return;
    }

    // 获取原始文件对象，优先使用 originFileObj，否则使用 info.file 本身
    const file = info.file.originFileObj || info.file;

    if (!file) {
      message.error('无法获取文件对象');
      return;
    }

    // 显示上传中状态
    setUploading(true);

    try {
      const base64 = await convertFileToBase64(file);
      // 支持多图上传，追加到数组
      setImageUrls(prev => [...prev, base64]);
      setFileList(prev => [...prev, { ...info.file, status: 'done', url: base64 }]);
      message.success('图片上传成功');
    } catch (error) {
      console.error('图片处理失败:', error);
      message.error('图片处理失败');
    } finally {
      setUploading(false);
    }
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
   * 调用AI接口进行合同审计
   */
  const handleAudit = async () => {
    if (imageUrls.length === 0) {
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
          imageData: imageUrls,  // 传递多张图片数组
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
   * 移除单张图片
   */
  const handleRemove = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setFileList(prev => prev.filter((_, i) => i !== index));
    // 如果移除了所有图片，重置审计结果
    if (imageUrls.length <= 1) {
      setAuditResult(null);
    }
  };

  /**
   * 重置组件状态
   */
  const handleReset = () => {
    setAuditResult(null);
    setImageUrls([]);
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

  const uploadProps = {
    name: 'contractImage',
    multiple: true,
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
            {imageUrls.length > 0 && !auditResult && (
              <Button type="primary" onClick={handleAudit} loading={loading}>
                开始审计 ({imageUrls.length}张)
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
          <Dragger ref={draggerRef} {...uploadProps}>
            {imageUrls.length === 0 ? (
              <div className="contract-audit-upload-tip">
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽上传合同照片</p>
                <p className="ant-upload-hint">支持 JPG、PNG 格式，最多 {CONTRACT_AUDIT_CONFIG.maxImageCount} 张图片</p>
              </div>
            ) : (
              <div className="contract-audit-upload-tip">
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">继续添加更多图片</p>
              </div>
            )}
          </Dragger>

          {/* 已上传图片预览 */}
          {imageUrls.length > 0 && (
            <div className="contract-audit-images-preview">
              {imageUrls.map((url, index) => (
                <div key={index} className="contract-audit-image-item">
                  <img src={url} alt={`合同预览 ${index + 1}`} />
                  <Button
                    size="small"
                    danger
                    shape="circle"
                    icon={<CloseCircleOutlined />}
                    className="contract-audit-image-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          )}

          {(uploading) && (
            <div className="contract-audit-loading-overlay">
              <Spin tip="上传中..." />
            </div>
          )}
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
