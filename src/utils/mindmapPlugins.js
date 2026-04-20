import { marked } from 'marked';
import MindMap from 'simple-mind-map';

/**
 * 审计图标 SVG 数据
 * 用于在支持审计功能的节点上显示审计图标
 */
const AUDIT_ICON_SVG = `<svg viewBox="0 0 1024 1024" width="20" height="20" cursor="pointer">
  <title>audit</title>
  <path d="M512 128c-70.7 0-134.4 26.9-181.8 70.7L181.8 347.1c-8.5 8.5-8.5 21.3 0 29.9l64 64c8.5 8.5 21.3 8.5 29.9 0l85.3-85.3c70.7 47.5 149.3 70.7 229.1 70.7 212.1 0 384-171.9 384-384S724.1 0 512 0 128 171.9 128 384c0 80.8 23.2 158.4 70.7 229.1l-85.3 85.3c-8.5 8.5-8.5 21.3 0 29.9l64 64c8.5 8.5 21.3 8.5 29.9 0l148.4-148.4C485.1 641.6 512 577.9 512 512 512 299.3 299.3 128 512 128m0-64c238.1 0 432 193.9 432 432s-193.9 432-432 432-432-193.9-432-432 193.9-432 432-432z" fill="#1890ff"/>
  <path d="M480 320a64 64 0 1 0-64-64 64.1 64.1 0 0 0 64 64m0-96a32 32 0 1 1-32 32 32 32 0 0 1 32-32m0 160a64 64 0 1 0-64-64 64.1 64.1 0 0 0 64 64m0-96a32 32 0 1 1-32 32 32 32 0 0 1 32-32m0 160a64 64 0 1 0-64-64 64.1 64.1 0 0 0 64 64m0-96a32 32 0 1 1-32 32 32 32 0 0 1 32-32" fill="#1890ff"/>
</svg>`;

export const customNoteContentShowPlugin = {
    // 鼠标 hover 时显示备注弹窗
    show: (content, left, top) => {
        // 1. 清理现有弹窗
        const existingPanels = document.querySelectorAll('.custom-note-panel');
        existingPanels.forEach(panel => panel.remove());

        // 2. Markdown 图片语法处理（将![]()转换为<img>标签）
        const processedContent = content.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1" style="max-width:300px;height:auto;margin:10px 0;"/>'
        );

        // 3. 创建弹窗容器（直接在页面中创建 div 块）
        const notePanel = document.createElement('div');
        notePanel.className = 'custom-note-panel';
        notePanel.innerHTML = marked.parse(processedContent);// 使用 marked 库解析 Markdown

        // 4. 弹窗样式配置
        Object.assign(notePanel.style, {
            position: 'fixed',
            left: `${Math.min(left + 20, window.innerWidth - 300)}px`,// 防止右侧溢出
            top: `${Math.min(top + 20, window.innerHeight - 300)}px`,// 防止底部溢出
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            maxWidth: '400px',  // 最大宽度限制
            maxHeight: '500px', // 最大高度限制
            overflowY: 'auto',   // 支持内容滚动
            pointerEvents: 'none', // 防止备注框拦截鼠标事件，避免与备注图标重叠时闪烁
            // 使用 CSS 变量，自动适配夜间模式
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)'
        });

        // 为弹窗内的 Markdown 标题添加更小的字体大小样式（直接在页面中添加<style>标签）
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
      .custom-note-panel h1 { font-size: 18px; margin-top: 10px; margin-bottom: 8px; color: var(--color-text-primary); }
      .custom-note-panel h2 { font-size: 16px; margin-top: 8px; margin-bottom: 6px; color: var(--color-text-primary); }
      .custom-note-panel h3 { font-size: 14px; margin-top: 6px; margin-bottom: 4px; color: var(--color-text-primary); }
      .custom-note-panel h4, .custom-note-panel h5, .custom-note-panel h6 { font-size: 13px; margin-top: 5px; margin-bottom: 3px; color: var(--color-text-primary); }
      .custom-note-panel p { color: var(--color-text-secondary); line-height: 1.6; }
      .custom-note-panel ul, .custom-note-panel ol { color: var(--color-text-secondary); }
      .custom-note-panel li { color: var(--color-text-secondary); margin-bottom: 4px; }
      .custom-note-panel strong { color: var(--color-text-primary); }
      .custom-note-panel em { color: var(--color-text-secondary); }
      .custom-note-panel blockquote { 
        border-left: 3px solid var(--color-primary); 
        padding-left: 10px; 
        color: var(--color-text-tertiary);
        background: var(--color-bg-secondary);
        padding: 8px 12px;
        margin: 10px 0;
        border-radius: 4px;
      }
      .custom-note-panel code { 
        background: var(--color-bg-tertiary); 
        padding: 2px 6px; 
        border-radius: 3px;
        color: var(--color-text-secondary);
      }
      .custom-note-panel pre { 
        background: var(--color-bg-tertiary); 
        padding: 10px; 
        border-radius: 4px;
        overflow-x: auto;
      }
      .custom-note-panel pre code { 
        background: transparent; 
        padding: 0;
      }
      .custom-note-panel hr {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 15px 0;
      }
      .custom-note-panel img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 10px 0;
      }
    `;
        notePanel.appendChild(styleSheet);

        document.body.appendChild(notePanel);
    },
    // 隐藏所有备注弹窗
    hide: () => {
        const panels = document.querySelectorAll('.custom-note-panel');
        panels.forEach(panel => panel.remove());
    }
};

/**
 * 渲染审计图标插件
 * 在设置了 hasAudit: true 的节点上渲染审计图标
 */
export const renderAuditIconPlugin = {
    /**
     * 在节点渲染前添加审计图标
     * @param {object} node - 思维导图节点
     */
    beforeShow(node) {
        if (node && node.data && node.data.hasAudit) {
            const nodeEl = node._nodeEl;
            if (nodeEl) {
                const iconContainer = nodeEl.querySelector('.smm-node-icon-custom');
                if (!iconContainer) {
                    const iconWrapper = document.createElement('span');
                    iconWrapper.className = 'smm-node-icon-custom smm-node-audit-icon';
                    iconWrapper.innerHTML = AUDIT_ICON_SVG;
                    iconWrapper.style.marginLeft = '4px';
                    iconWrapper.style.marginRight = '4px';
                    iconWrapper.style.display = 'inline-flex';
                    iconWrapper.style.alignItems = 'center';
                    iconWrapper.style.verticalAlign = 'middle';

                    const textEl = nodeEl.querySelector('.smm-node-text');
                    if (textEl) {
                        textEl.parentNode.insertBefore(iconWrapper, textEl.nextSibling);
                    }
                }
            }
        }
    },

    /**
     * 清理审计图标
     * @param {object} node - 思维导图节点
     */
    hide(node) {
        if (node && node._nodeEl) {
            const iconEl = node._nodeEl.querySelector('.smm-node-audit-icon');
            if (iconEl) {
                iconEl.remove();
            }
        }
    }
};
