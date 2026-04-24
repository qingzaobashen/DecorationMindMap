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
  'DecorationContractAuditTool': {
    id: 'DecorationContractAuditTool',
    name: 'DCATool',
    description: '上传合同照片，AI 智能识别和审计合同内容',
    component: 'ContractAuditModal',
    color: '#1890ff',
    position: 'right',
    icon: `<svg cursor="pointer" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="20px" height="20px" viewBox="0 0 469.09 469.089" style="enable-background:new 0 0 469.09 469.089;"
	 xml:space="preserve">
		<path d="M205.566,181.586L11.138,376.013c-7.232,7.231-10.85,15.893-10.85,25.981c0,10.28,3.617,18.842,10.85,25.7L41.4,458.529
			c7.426,7.043,16.086,10.561,25.981,10.561c10.089,0,18.654-3.518,25.697-10.561l194.709-194.715
			c-18.647-7.426-35.156-18.322-49.532-32.691C223.887,216.751,212.992,200.239,205.566,181.586z M98.504,396.57
			c-3.621,3.614-7.903,5.425-12.85,5.425c-4.949,0-9.231-1.811-12.847-5.425c-3.617-3.617-5.426-7.898-5.426-12.847
			c0-4.944,1.809-9.232,5.426-12.854c3.616-3.61,7.895-5.421,12.847-5.421c4.95,0,9.233,1.811,12.85,5.421
			c3.615,3.621,5.424,7.909,5.424,12.854C103.928,388.671,102.119,392.953,98.504,396.57z"/>
		<path d="M466.379,132.477c-1.618-1.906-3.856-2.856-6.707-2.856c-1.711,0-8.419,3.381-20.129,10.138
			c-11.704,6.755-24.603,14.462-38.685,23.124c-14.089,8.663-21.607,13.278-22.556,13.85l-55.106-30.55V82.229l83.651-48.254
			c3.045-2.093,4.568-4.758,4.568-7.994c0-3.234-1.523-5.898-4.568-7.992c-8.378-5.712-18.61-10.138-30.69-13.278
			C364.07,1.571,352.504,0,341.467,0c-35.211,0-65.332,12.518-90.358,37.546c-25.035,25.026-37.544,55.149-37.544,90.36
			c0,35.212,12.516,65.334,37.544,90.362c25.026,25.026,55.147,37.544,90.358,37.544c26.84,0,51.442-7.953,73.806-23.842
			c22.36-15.893,38.021-36.592,46.966-62.097c4.374-12.751,6.563-22.841,6.563-30.262
			C468.809,136.763,467.994,134.383,466.379,132.477z"/>
`
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
  return `data:image/svg+xml,${encodeURIComponent(config.icon)}`;
};

/**
 * 获取工具图标 Data URL（用于 simple-mind-map iconList）
 * @param {string} toolId - 工具 ID
 * @returns {string|null} 图标 Data URL
 */
export const getToolIconDataUrl = (toolId) => {
  const config = getToolConfig(toolId);
  if (!config) return null;
  return config.icon;
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
  getToolIconDataUrl,
  getToolComponent,
  ToolIconRenderer
};
