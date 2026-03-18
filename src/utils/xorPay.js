/**
 * XorPay支付集成工具
 * 用于生成支付二维码和验证支付状态
 */

import axios from 'axios';

// XorPay配置
const XORPAY_CONFIG = {
  appId: 'YOUR_XORPAY_APPID', // 替换为你的XorPay AppId
  appSecret: 'YOUR_XORPAY_APPSECRET', // 替换为你的XorPay AppSecret
  apiUrl: 'https://api.xorpay.com/api/v1/create_order' // XorPay API地址
};

/**
 * 生成支付二维码
 * @param {Object} params - 支付参数
 * @param {string} params.out_trade_no - 订单号
 * @param {number} params.total_fee - 支付金额（单位：分）
 * @param {string} params.subject - 商品名称
 * @param {string} params.body - 商品描述
 * @param {string} params.pay_type - 支付方式，可选：alipay, wechat
 * @returns {Promise<Object>} 支付二维码信息
 */
export const createPayment = async (params) => {
  try {
    const { out_trade_no, total_fee, subject, body, pay_type = 'wechat' } = params;
    
    // 构建请求参数
    const requestData = {
      appid: XORPAY_CONFIG.appId,
      out_trade_no,
      total_fee,
      subject,
      body,
      pay_type,
      notify_url: `${window.location.origin}/api/payment/notify`, // 支付回调地址
      return_url: `${window.location.origin}` // 支付完成后跳转地址
    };
    
    // 生成签名（实际项目中应该在后端生成）
    // 这里简化处理，实际应按照XorPay文档生成签名
    
    // 发送请求
    const response = await axios.post(XORPAY_CONFIG.apiUrl, requestData);
    
    if (response.data.code === 0) {
      return response.data.data;
    } else {
      throw new Error(response.data.msg || '生成支付二维码失败');
    }
  } catch (error) {
    console.error('创建支付订单失败:', error);
    throw error;
  }
};

/**
 * 验证支付状态
 * @param {string} out_trade_no - 订单号
 * @returns {Promise<boolean>} 支付是否成功
 */
export const verifyPayment = async (out_trade_no) => {
  try {
    // 实际项目中应该调用后端API验证支付状态
    // 这里简化处理，模拟验证
    // 真实场景应该调用XorPay的查询订单API
    
    // 模拟支付成功
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  } catch (error) {
    console.error('验证支付状态失败:', error);
    return false;
  }
};

/**
 * 生成唯一订单号
 * @returns {string} 订单号
 */
export const generateOrderNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORDER_${timestamp}_${random}`;
};
