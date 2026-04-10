/**
 * VIP 用户编辑节点组件
 * 允许 VIP 用户编辑节点的名称、详情、图片等信息
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Switch, Upload, message, Space, Divider } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import { saveUserCustomNode, deleteUserCustomNode } from '../utils/mindmapData';
import supabase from '../utils/supabase';

const { TextArea } = Input;

/**
 * VIP 节点编辑器组件
 * @param {Object} nodeData - 当前节点数据
 * @param {boolean} visible - 编辑器显示状态
 * @param {Function} onClose - 关闭编辑器回调
 * @param {Function} onSave - 保存成功回调
 */
const VipNodeEditor = ({ nodeData, visible, onClose, onSave }) => {
    const [form] = Form.useForm();
    const { username, isPremium } = useUser();
    const [loading, setLoading] = useState(false);
    const [imgUrl, setImgUrl] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');

    // 初始化表单数据
    useEffect(() => {
        if (visible && nodeData) {
            form.setFieldsValue({
                name: nodeData.name,
                details: nodeData.details,
                img_url: nodeData.img_url,
                attachment_url: nodeData.attachment_url,
                attachment_name: nodeData.attachment_name,
                is_premium: nodeData.is_premium,
                is_expand: nodeData.is_expand
            });
            setImgUrl(nodeData.img_url || '');
            setAttachmentUrl(nodeData.attachment_url || '');
        }
    }, [visible, nodeData, form]);

    // 处理图片上传
    const handleImageUpload = async (file) => {
        if (!isPremium) {
            message.error('只有 VIP 用户可以上传图片');
            return Upload.LIST_IGNORE;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${nodeData.node_id}_${Date.now()}.${fileExt}`;
            const filePath = `node_images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('backend_data')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('backend_data')
                .getPublicUrl(filePath);

            setImgUrl(urlData.publicUrl);
            form.setFieldValue('img_url', urlData.publicUrl);
            message.success('图片上传成功');
        } catch (error) {
            console.error('图片上传失败:', error);
            message.error('图片上传失败');
        }

        return Upload.LIST_IGNORE;
    };

    // 处理附件上传
    const handleAttachmentUpload = async (file) => {
        if (!isPremium) {
            message.error('只有 VIP 用户可以上传附件');
            return Upload.LIST_IGNORE;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${nodeData.node_id}_${Date.now()}.${fileExt}`;
            const filePath = `node_attachments/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('backend_data')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('backend_data')
                .getPublicUrl(filePath);

            setAttachmentUrl(urlData.publicUrl);
            form.setFieldValue('attachment_url', urlData.publicUrl);
            form.setFieldValue('attachment_name', file.name);
            message.success('附件上传成功');
        } catch (error) {
            console.error('附件上传失败:', error);
            message.error('附件上传失败');
        }

        return Upload.LIST_IGNORE;
    };

    // 处理保存
    const handleSave = async () => {
        if (!isPremium) {
            console.error('只有 VIP 用户可以编辑节点');
            onClose();
            return;
        }

        try {
            const values = await form.validateFields();
            setLoading(true);

            const updatedData = {
                ...nodeData,
                ...values
            };

            await saveUserCustomNode(updatedData, username, 'update');
            message.success('节点保存成功');
            onSave(updatedData);
            onClose();
        } catch (error) {
            if (error.name !== 'ValidationError') {
                console.error('保存节点失败:', error);
                message.error('保存节点失败，请重试');
            }
        } finally {
            setLoading(false);
        }
    };

    // 处理删除自定义记录
    const handleDeleteCustom = async () => {
        if (!nodeData._customized) {
            message.info('该节点没有自定义记录');
            return;
        }

        try {
            setLoading(true);
            await deleteUserCustomNode(username, nodeData.node_id);
            message.success('已恢复为原始数据');
            onSave(null); // 通知父节点刷新
            onClose();
        } catch (error) {
            console.error('删除自定义记录失败:', error);
            message.error('操作失败');
        } finally {
            setLoading(false);
        }
    };

    if (!isPremium) {
        return (
            <Modal
                title="提示"
                open={visible}
                onCancel={onClose}
                zIndex={2000}
                footer={[
                    <Button key="close" onClick={onClose}>
                        关闭
                    </Button>
                ]}
            >
                <p>只有 VIP 用户可以编辑节点信息。</p>
                <p>升级 VIP 后，您可以：</p>
                <ul>
                    <li>✏️ 修改节点名称和详情</li>
                    <li>📷 上传自定义图片</li>
                    <li>📎 上传附件</li>
                    <li>💾 永久保存您的个性化设置</li>
                </ul>
            </Modal>
        );
    }

    return (
        <Modal
            title={
                <Space>
                    <EditOutlined />
                    编辑节点 - {nodeData?.name}
                    {nodeData?._customized && (
                        <span style={{ color: '#52c41a', fontSize: '12px' }}>
                            （已自定义）
                        </span>
                    )}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            zIndex={2000}
            className="vip-node-editor-modal"
            styles={{
                body: { maxHeight: '75vh', overflowY: 'auto' }
            }}
            footer={[
                <Button key="close" onClick={onClose}>
                    取消
                </Button>,
                nodeData?._customized && (
                    <Button
                        key="delete"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteCustom}
                        loading={loading}
                    >
                        恢复原始数据
                    </Button>
                ),
                <Button
                    key="save"
                    type="primary"
                    onClick={handleSave}
                    loading={loading}
                >
                    保存
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="节点名称"
                    name="name"
                    rules={[{ required: true, message: '请输入节点名称' }]}
                >
                    <Input placeholder="请输入节点名称" />
                </Form.Item>

                <Form.Item
                    label="详情内容（支持 Markdown）"
                    name="details"
                >
                    <TextArea
                        rows={8}
                        placeholder="请输入详情内容，支持 Markdown 格式"
                    />
                </Form.Item>

                <Form.Item label="图片 URL" name="img_url">
                    <Input placeholder="图片 URL 或点击下方上传" />
                </Form.Item>

                <Form.Item>
                    <Upload
                        accept="image/*"
                        beforeUpload={handleImageUpload}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>上传图片</Button>
                    </Upload>
                    {imgUrl && (
                        <div style={{ marginTop: 8 }}>
                            <img
                                src={imgUrl}
                                alt="预览"
                                style={{ maxWidth: '200px', maxHeight: '200px' }}
                            />
                        </div>
                    )}
                </Form.Item>

                <Divider />

                <Form.Item label="附件 URL" name="attachment_url">
                    <Input placeholder="附件 URL 或点击下方上传" />
                </Form.Item>

                <Form.Item label="附件名称" name="attachment_name">
                    <Input placeholder="附件名称" />
                </Form.Item>

                <Form.Item>
                    <Upload
                        beforeUpload={handleAttachmentUpload}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>上传附件</Button>
                    </Upload>
                    {attachmentUrl && (
                        <div style={{ marginTop: 8, color: '#1890ff' }}>
                            已上传附件：<a href={attachmentUrl} target="_blank" rel="noopener noreferrer">查看附件</a>
                        </div>
                    )}
                </Form.Item>

                <Divider />

                <Form.Item
                    label="是否仅 VIP 可见"
                    name="is_premium"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    label="是否默认展开"
                    name="is_expand"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VipNodeEditor;
