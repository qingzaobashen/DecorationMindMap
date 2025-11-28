// Markdown文件导入工具模块
// 功能：将结构化Markdown文档转换为数据库存储格式，并批量导入MySQL数据库
// 主要包含：
// 1. Markdown解析器：将标题层级结构转换为父子关系节点
// 2. 数据库适配器：将内存对象转换为数据库表结构
// 3. 事务处理器：保证数据导入的原子性

import fs from 'fs';
import path from 'path';
import { query } from '../db.js';

/**
 * 将Markdown内容解析为数据库存储格式
 * 实现原理：
 * 1. 使用堆栈管理当前节点层级关系
 * 2. 通过标题#号数量确定节点层级
 * 3. 自动生成节点ID并维护父子关系
 * @param {string} mdContent - 原始Markdown内容
 * @returns {Object} 包含nodes和details两个数组的对象
 */
function parseMdToDBFormat(mdContent) {
  // 初始化解析状态
  const lines = mdContent.split('\n');
  const stack = [];  // 用于跟踪当前节点层级的堆栈
  const nodes = [];  // 所有节点集合
  let currentParentId = null;  // 当前父节点ID
  let nodeIdCounter = 1;  // 节点ID自增计数器

  // 逐行解析Markdown内容
  lines.forEach(line => {
    // 解析标题行（示例：## 水电改造）
    const match = line.match(/^(#+)[\s\u3000]*(.*?)[\s\u3000]*$/);
    if (match) {
      const level = match[1].length;  // 通过#号数量确定层级
      const name = match[2].trim();   // 节点名称

      // 创建新节点
      const node = {
        node_id: nodeIdCounter++,
        name: name,
        details: [],  // 节点下的详细条目
        parent_id: null
      };

      // 维护层级堆栈：当堆栈长度≥当前层级时弹出上层节点
      while (stack.length >= level) {
        stack.pop();
      }
      // 设置父节点：堆栈最后一个元素为当前父节点
      if (stack.length > 0) {
        node.parent_id = stack[stack.length-1].node_id;
      }
      stack.push(node);  // 将当前节点压入堆栈

      nodes.push(node);  // 添加到节点集合
    }
    // 解析详细条目（示例：- 电线规格选择(图片URL)）
    else if (line.trim().startsWith('- ')) {
      // 提取条目文本和可选图片URL
      const detailMatch = line.match(/^-\s*(.*?)(?:\s*!\[\[([^\]]+)\]\])?\s*$/);
      if (detailMatch && stack.length > 0) {
        const current = stack[stack.length-1];
        current.details.push({
          text: detailMatch[1],  // 条目描述文本
          image: detailMatch[2] || ''  // 可选图片URL
        });
      }
    }
  });

  // 转换内存对象为数据库表结构
  const nodesData = [];  // nodes表数据
  const detailsData = [];  // node_details表数据
  
  nodes.forEach(node => {
    // 填充nodes表
    nodesData.push({
      node_id: node.node_id,
      name: node.name,
      parent_id: node.parent_id,
      sort_order: 0  // 默认排序值
    });

    // 填充node_details表
    node.details.forEach((detail, index) => {
      detailsData.push({
        parent_id: node.node_id,
        details: detail.text,
        image: detail.image,
        sort_order: index  // 按出现顺序设置排序
      });
    });
  });

  return { nodes: nodesData, details: detailsData };
}

/**
 * 事务化数据插入方法
 * 特点：
 * 1. 使用数据库事务保证插入操作的原子性
 * 2. 分批次插入nodes和details表数据
 * 3. 自动处理事务提交/回滚
 * @param {Object} data - 包含nodes和details的数据对象
 */
async function insertDataToDB(data) {
  const db = await import('../db.js');
  try {
    await db.query('START TRANSACTION');  // 开始事务

    // 批量插入节点数据
    for (const node of data.nodes) {
      await db.query(
        'INSERT INTO nodes (node_id, name, parent_id, sort_order) VALUES (?, ?, ?, ?)',
        [node.node_id, node.name, node.parent_id, node.sort_order || 0]
      );
    }

    // 批量插入详情数据
    for (const detail of data.details) {
      await db.query(
        'INSERT INTO node_details (parent_id, details, image) VALUES (?, ?, ?)',
        [detail.parent_id, detail.details, detail.image || '']  // 空图片字段设为空字符串
      );
    }

    await db.query('COMMIT');  // 提交事务
    console.log('数据导入成功');
  } catch (err) {
    await db.query('ROLLBACK');  // 回滚事务
    console.error('数据库操作失败:', err);
    throw err;
  }
}

/**
 * 主流程控制函数
 * 执行步骤：
 * 1. 读取Markdown文件
 * 2. 解析为数据库格式
 * 3. 事务化插入数据库
 */
async function main() {
  try {
    // 读取并解析Markdown文件
    const mdContent = fs.readFileSync('../../装修流程目录.md', 'utf8');
    const data = parseMdToDBFormat(mdContent);

    // 执行数据库插入
    await insertDataToDB(data);
    console.log('导入成功');
  } catch (err) {
    console.error('导入失败:', err);
  }
}

// 执行主流程
await main();