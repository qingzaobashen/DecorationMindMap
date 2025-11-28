import { marked } from 'marked';
import MindMap from 'simple-mind-map';

export const customNoteContentShowPlugin = {
    // 鼠标hover时显示备注弹窗
    show: (content, left, top) => {
        // 1. 清理现有弹窗
        const existingPanels = document.querySelectorAll('.custom-note-panel');
        existingPanels.forEach(panel => panel.remove());

        // 2. Markdown图片语法处理（将![]()转换为<img>标签）
        const processedContent = content.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1" style="max-width:300px;height:auto;margin:10px 0;"/>'
        );

        // 3. 创建弹窗容器（直接在页面中创建div块）
        const notePanel = document.createElement('div');
        notePanel.className = 'custom-note-panel';
        notePanel.innerHTML = marked.parse(processedContent);// 使用marked库解析Markdown

        // 4. 弹窗样式配置
        Object.assign(notePanel.style, {
            position: 'fixed',
            left: `${Math.min(left + 20, window.innerWidth - 300)}px`,// 防止右侧溢出
            top: `${Math.min(top + 20, window.innerHeight - 300)}px`,// 防止底部溢出
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'black',
            zIndex: 9999,
            maxWidth: '400px',  // 最大宽度限制
            maxHeight: '500px', // 最大高度限制
            overflowY: 'auto'   // 支持内容滚动
        });

        // 为弹窗内的Markdown标题添加更小的字体大小样式（直接在页面中添加<style>标签）
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
      .custom-note-panel h1 { font-size: 18px; margin-top: 10px; margin-bottom: 8px; }
      .custom-note-panel h2 { font-size: 16px; margin-top: 8px; margin-bottom: 6px; }
      .custom-note-panel h3 { font-size: 14px; margin-top: 6px; margin-bottom: 4px; }
      .custom-note-panel h4, .custom-note-panel h5, .custom-note-panel h6 { font-size: 13px; margin-top: 5px; margin-bottom: 3px; }
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
