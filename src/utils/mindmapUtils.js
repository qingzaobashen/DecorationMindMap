// 正则表达式，用于匹配 Markdown 中的附件链接
// 格式: [链接文本](attachment:附件URL "附件文件名")
const attachmentRegex = '/\\[([^\\]]+)\\]\\(attachment:([^\\s")]+)(?:\\s\\"([^\\"]+)\\")?\\)/';

// 将 Markdown 格式转换为思维导图数据结构
export const convertMarkdownToMindMap = (markdown) => {
    if (typeof markdown !== 'string' || !markdown.trim()) return null;
    console.log("convertMarkdownToMindMap() markdown:", typeof (markdown));
    const lines = markdown.split('\n');
    const rootNode = {
        data: { text: '装修流程' },
        children: []
    };

    let currentLevel = 0;
    let currentParents = [rootNode];

    lines.forEach(line => {
        if (!line.trim()) return; // 跳过空行

        const headingMatch = line.match(/^(#+)\\s+(.*)/); // 匹配标题行
        if (!headingMatch) {
            // 如果不是标题行，尝试匹配附件
            const attachmentMatchGlobal = Array.from(line.matchAll(new RegExp(attachmentRegex, 'g')));
            if (attachmentMatchGlobal.length > 0 && currentParents[currentParents.length - 1].data) {
                const lastParent = currentParents[currentParents.length - 1];
                const lastChildNode = lastParent.children.length > 0 ? lastParent.children[lastParent.children.length - 1] : lastParent;

                if (!lastChildNode.data.attachments) {
                    lastChildNode.data.attachments = [];
                }
                attachmentMatchGlobal.forEach(match => {
                    const linkText = match[1];
                    const attachmentUrl = match[2];
                    const attachmentName = match[3] || linkText || 'download'; // 如果没有文件名，使用链接文本或默认名
                    lastChildNode.data.attachments.push({
                        url: attachmentUrl,
                        name: attachmentName,
                        linkText: linkText,
                    });
                    // 从文本中移除附件标记
                    if (lastChildNode.data.text) {
                        lastChildNode.data.text = lastChildNode.data.text.replace(match[0], '').trim();
                    }
                    if (lastChildNode.data.note) {
                        lastChildNode.data.note = lastChildNode.data.note.replace(match[0], '').trim();
                    }
                });
            }
            return; // 如果不是标题也不是附件行，则跳过
        }

        const level = headingMatch[1].length; // # 的数量代表层级
        let text = headingMatch[2].trim();

        // 检查文本中是否包含附件标记
        const attachmentMatch = text.match(attachmentRegex);
        let attachmentData = null;
        if (attachmentMatch) {
            const linkText = attachmentMatch[1];
            const attachmentUrl = attachmentMatch[2];
            const attachmentName = attachmentMatch[3] || linkText || 'download'; // 如果没有文件名，使用链接文本

            attachmentData = {
                url: attachmentUrl,
                name: attachmentName,
                linkText: linkText,
            };
            // 从文本中移除附件标记
            text = text.replace(attachmentMatch[0], '').trim();
        }

        const newNode = {
            data: { text },
            children: []
        };

        if (attachmentData) {
            if (!newNode.data.attachments) {
                newNode.data.attachments = [];
            }
            newNode.data.attachments.push(attachmentData);
        }

        if (level > currentLevel) {
            // 层级增加
            if (currentParents[currentParents.length - 1].children.length === 0 && currentParents.length > 1) {
                // 如果父节点没有子节点，且不是根节点，那么新的父节点应该是父节点的父节点下的最后一个子节点
                const grandParent = currentParents[currentParents.length - 2];
                currentParents.push(grandParent.children[grandParent.children.length - 1]);
            } else if (currentParents[currentParents.length - 1].children.length > 0) {
                // 正常情况，父节点是当前父列表最后一个元素的最后一个子节点
                currentParents.push(currentParents[currentParents.length - 1].children[currentParents[currentParents.length - 1].children.length - 1]);
            } else {
                // 如果当前父节点（可能是根节点）还没有子节点，则新节点直接作为其子节点，父级列表不变
            }
        } else if (level < currentLevel) {
            // 层级减少，回到上一级父节点
            for (let i = 0; i < currentLevel - level; i++) {
                currentParents.pop();
            }
        }
        // 如果level === currentLevel，父节点保持不变

        currentParents[currentParents.length - 1].children.push(newNode);
        currentLevel = level;
    });

    return rootNode;
};

// 将普通对象转换为思维导图数据结构
export const convertObjectToMindMap = (obj) => {
    if (!obj) return null;

    const mapNode = (node) => {
        // 限制文字长度的辅助函数
        const limitTextLength = (text, maxLength = 100) => {
            if (!text) return '';
            // 移除多余的空白字符
            const trimmedText = text.trim();
            if (trimmedText.length <= maxLength) return trimmedText;
            // 在最大长度处截断，并添加省略号
            return trimmedText.substring(0, maxLength) + '...';
        };

        return {
            data: {
                text: node.name,
                // 使用双换行符分隔段落，并限制每段文字长度
                note: limitTextLength(Array.isArray(node.details) ? node.details.map(d => d.text).join('\n') : (node.details || '')),
                details: node.details,
                // 添加可下载标记和下载链接（示例）
                attachmentUrl: node.attachment_url,
                attachmentName: node.attachment_name,
                // 解析图片URL
                // 将字符串格式的数组解析为真正的数组
                img_url: Array.isArray(node.img_url) ? node.img_url : (node.img_url ? JSON.parse(node.img_url.replace(/'/g, '"')) : [])
            },
            children: (node.children || []).map(mapNode)
        };
    };
    console.log("convertObjectToMindMap() obj:", obj);
    // 创建根节点
    return {
        data: {
            text: obj.name || '装修流程',
            note: obj.details?.map(d => d.text).join('\n') || '',
            details: obj.details,
            img_url: obj.img_url,
            attachmentUrl: '/resources/装修流程目录.md',
            attachmentName: '装修流程目录.md'
        },
        children: (obj.children || []).map(mapNode)
    };
};
