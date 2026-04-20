/**
 * 节点工具系统配置文件
 * 用于管理思维导图节点上的工具图标和功能
 * 
 * 工具配置说明：
 * - id: 工具唯一标识符（对应数据库中的 tool 字段值）
 * - name: 工具显示名称
 * - icon: 工具图标（SVG 字符串）
 * - description: 工具描述
 * - component: 对应的 React 组件路径
 * - color: 图标颜色
 * - position: 图标位置（left/right）
 */

/**
 * 工具配置列表
 * 新增工具时只需在此添加配置即可
 */
export const NODE_TOOLS_CONFIG = {
  // 装修合同审计工具
  'Decoration_contract_audit_tool': {
    id: 'Decoration_contract_audit_tool',
    name: '装修合同审计工具',
    description: '上传合同照片，AI 智能识别和审计合同内容',
    component: 'ContractAuditModal',
    color: '#1890ff',
    position: 'right',
    icon: `<svg viewBox="0 0 1024 1024" width="18" height="18" cursor="pointer">
      <title>Decoration_contract_audit_tool</title>
      <path d="M832 128H192c-35.3 0-64 28.7-64 64v640c0 35.3 28.7 64 64 64h640c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64zM192 192h640v640H192V192z" fill="#1890ff"/>
      <path d="M512 320c-106 0-192 86-192 192s86 192 192 192 192-86 192-192-86-192-192-192zm0 320c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128z" fill="#1890ff"/>
      <path d="M480 448h64v128h-64zM480 608h64v64h-64z" fill="#1890ff"/>
    </svg>`
  },

  // 示例：预算计算器工具（预留）
  'Decoration_budget_calculator_tool': {
    id: 'Decoration_budget_calculator_tool',
    name: '预算计算器',
    description: '计算装修预算和费用明细',
    component: 'BudgetCalculatorModal',
    color: '#52c41a',
    position: 'right',
    icon: `<svg viewBox="0 0 1024 1024" width="18" height="18" cursor="pointer">
      <title>Decoration_budget_calculator_tool</title>
      <path d="M320 128h384v64H320zM256 256h512v64H256z" fill="#52c41a"/>
      <path d="M704 384H320c-35.3 0-64 28.7-64 64v320c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V448c0-35.3-28.7-64-64-64zM320 768V448h384v320H320z" fill="#52c41a"/>
      <path d="M448 576h128v64H448z" fill="#52c41a"/>
    </svg>`
  },

  // 示例：材料清单工具（预留）
  'Decoration_material_list_tool': {
    id: 'Decoration_material_list_tool',
    name: '材料清单',
    description: '查看和管理装修材料清单',
    component: 'MaterialListModal',
    color: '#faad14',
    position: 'right',
    icon: `<svg viewBox="0 0 1024 1024" width="18" height="18" cursor="pointer">
      <title>Decoration_material_list_tool</title>
      <path d="M320 128h384v64H320zM256 256h512v64H256z" fill="#faad14"/>
      <path d="M704 384H320c-35.3 0-64 28.7-64 64v320c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V448c0-35.3-28.7-64-64-64zM320 768V448h384v320H320z" fill="#faad14"/>
      <path d="M384 512h256v64H384zM384 640h256v64H384z" fill="#faad14"/>
    </svg>`
  }
};

/**
 * 获取工具配置
 * @param {string} toolId - 工具 ID
 * @returns {object|null} 工具配置对象
 */
export const getToolConfig = (toolId) => {
  if (!toolId) return null;
  return NODE_TOOLS_CONFIG[toolId] || null;
};

/**
 * 检查工具是否存在
 * @param {string} toolId - 工具 ID
 * @returns {boolean} 是否存在
 */
export const hasTool = (toolId) => {
  return !!toolId && !!NODE_TOOLS_CONFIG[toolId];
};

/**
 * 获取所有可用工具列表
 * @returns {Array} 工具配置数组
 */
export const getAllTools = () => {
  return Object.values(NODE_TOOLS_CONFIG);
};

/**
 * 获取工具图标
 * @param {string} toolId - 工具 ID
 * @returns {string|null} SVG 图标字符串
 */
export const getToolIcon = (toolId) => {
  const config = getToolConfig(toolId);
  return config ? config.icon : null;
};

/**
 * 获取工具组件名称
 * @param {string} toolId - 工具 ID
 * @returns {string|null} 组件名称
 */
export const getToolComponent = (toolId) => {
  const config = getToolConfig(toolId);
  return config ? config.component : null;
};

/**
 * 获取工具图标 URL 路径（用于 simple-mind-map 原生 icon 字段）
 * @param {string} toolId - 工具 ID
 * @returns {string|null} 图标路径
 */
export const getToolIconPath = (toolId) => {
  const config = getToolConfig(toolId);
  if (!config) return null;
  // 返回工具图标的路径（可以是本地路径或 URL）
  // 这里使用内联 SVG 数据 URI
  return `data:image/svg+xml,${encodeURIComponent(config.icon)}`;
};

/**
 * 工具图标渲染器
 * 用于在节点上渲染工具图标
 */
export const ToolIconRenderer = {
  /**
   * 创建工具图标元素
   * @param {string} toolId - 工具 ID
   * @param {object} options - 配置选项
   * @returns {HTMLElement|null} 图标元素
   */
  create(toolId, options = {}) {
    const config = getToolConfig(toolId);
    if (!config) return null;

    const {
      className = 'smm-node-tool-icon',
      marginLeft = '6px',
      marginRight = '4px',
      width = '18',
      height = '18'
    } = options;

    const iconWrapper = document.createElement('span');
    iconWrapper.className = `smm-node-icon-custom ${className}`;
    iconWrapper.dataset.toolId = toolId;
    iconWrapper.innerHTML = config.icon;
    iconWrapper.style.marginLeft = marginLeft;
    iconWrapper.style.marginRight = marginRight;
    iconWrapper.style.display = 'inline-flex';
    iconWrapper.style.alignItems = 'center';
    iconWrapper.style.verticalAlign = 'middle';
    iconWrapper.style.cursor = 'pointer';

    // 设置 SVG 尺寸
    const svg = iconWrapper.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
    }

    return iconWrapper;
  },

  /**
   * 为节点添加工具图标
   * @param {HTMLElement} nodeEl - 节点 DOM 元素
   * @param {string} toolId - 工具 ID
   * @param {object} options - 配置选项
   * @returns {boolean} 是否成功添加
   */
  addToNode(nodeEl, toolId, options = {}) {
    if (!nodeEl || !toolId) return false;

    // 检查是否已存在该工具图标
    const existingIcon = nodeEl.querySelector(`[data-tool-id="${toolId}"]`);
    if (existingIcon) return false;

    const iconElement = this.create(toolId, options);
    if (!iconElement) return false;

    // 尝试多种方式找到合适的插入位置
    // 1. 首先尝试 .smm-node-text 元素
    const textEl = nodeEl.querySelector('.smm-node-text');
    if (textEl && textEl.parentNode) {
      textEl.parentNode.insertBefore(iconElement, textEl.nextSibling);
      return true;
    }

    // 2. 尝试找到节点的内容容器
    const contentEl = nodeEl.querySelector('.smm-node-content');
    if (contentEl) {
      contentEl.appendChild(iconElement);
      return true;
    }

    // 3. 尝试直接添加到节点元素中
    if (nodeEl.children.length > 0) {
      nodeEl.insertBefore(iconElement, nodeEl.children[0].nextSibling);
      return true;
    }

    // 4. 最后尝试直接添加到节点
    nodeEl.appendChild(iconElement);
    return true;
  },

  /**
   * 从节点移除工具图标
   * @param {HTMLElement} nodeEl - 节点 DOM 元素
   * @param {string} toolId - 工具 ID
   */
  removeFromNode(nodeEl, toolId) {
    if (!nodeEl) return;
    
    const selector = toolId 
      ? `[data-tool-id="${toolId}"]` 
      : '.smm-node-tool-icon';
    const iconEl = nodeEl.querySelector(selector);
    
    if (iconEl) {
      iconEl.remove();
    }
  },

  /**
   * 移除节点上的所有工具图标
   * @param {HTMLElement} nodeEl - 节点 DOM 元素
   */
  removeAllFromNode(nodeEl) {
    if (!nodeEl) return;
    
    const icons = nodeEl.querySelectorAll('.smm-node-tool-icon');
    icons.forEach(icon => icon.remove());
  }
};

export default {
  NODE_TOOLS_CONFIG,
  getToolConfig,
  hasTool,
  getAllTools,
  getToolIcon,
  getToolIconPath,
  getToolComponent,
  ToolIconRenderer
};
