import { uploadFile, initStorage } from './supabaseStorage';

/**
 * 批量上传本地文件到 Supabase 存储
 * 用于将 public/backend_data 目录下的文件迁移到 Supabase
 */

// 要上传的本地文件路径（相对于 public 目录）
const LOCAL_FILES = [
  'backend_data/nodes_details_data.csv',
  // 图片文件会通过递归上传
];

/**
 * 递归上传目录下的所有文件
 * @param {string} localDir - 本地目录路径（相对于 public 目录）
 * @param {string} remoteDir - 远程目录路径（在 Supabase 存储桶中）
 */
async function uploadDirectory(localDir, remoteDir) {
  console.log(`开始上传目录: ${localDir} -> ${remoteDir}`);
  
  // 这里需要手动列出要上传的文件
  // 实际使用时，可以将这些路径存储在一个数组中
  const filesToUpload = [
    // 水电施工
    { local: 'backend_data/images/水电施工图片/1.jpg', remote: 'backend_data/images/水电施工图片/1.jpg' },
    
    // 水电材料验收
    { local: 'backend_data/images/水电材料验收图片/1.jpg', remote: 'backend_data/images/水电材料验收图片/1.jpg' },
    { local: 'backend_data/images/水电材料验收图片/2.jpg', remote: 'backend_data/images/水电材料验收图片/2.jpg' },
    { local: 'backend_data/images/水电材料验收图片/3.jpg', remote: 'backend_data/images/水电材料验收图片/3.jpg' },
    { local: 'backend_data/images/水电材料验收图片/4.jpg', remote: 'backend_data/images/水电材料验收图片/4.jpg' },
    
    // 打拆与新建
    { local: 'backend_data/images/打拆与新建图片/1.jpg', remote: 'backend_data/images/打拆与新建图片/1.jpg' },
    { local: 'backend_data/images/打拆与新建图片/2.jpg', remote: 'backend_data/images/打拆与新建图片/2.jpg' },
    { local: 'backend_data/images/打拆与新建图片/3.jpg', remote: 'backend_data/images/打拆与新建图片/3.jpg' },
    { local: 'backend_data/images/打拆与新建图片/4.jpg', remote: 'backend_data/images/打拆与新建图片/4.jpg' },
    { local: 'backend_data/images/打拆与新建图片/5.jpg', remote: 'backend_data/images/打拆与新建图片/5.jpg' },
    { local: 'backend_data/images/打拆与新建图片/6.jpg', remote: 'backend_data/images/打拆与新建图片/6.jpg' },
    
    // 水电设计
    { local: 'backend_data/images/水电设计图片/1.jpg', remote: 'backend_data/images/水电设计图片/1.jpg' },
    { local: 'backend_data/images/水电设计图片/2.jpg', remote: 'backend_data/images/水电设计图片/2.jpg' },
    { local: 'backend_data/images/水电设计图片/3.jpg', remote: 'backend_data/images/水电设计图片/3.jpg' },
    { local: 'backend_data/images/水电设计图片/4.jpg', remote: 'backend_data/images/水电设计图片/4.jpg' },
    { local: 'backend_data/images/水电设计图片/5.jpg', remote: 'backend_data/images/水电设计图片/5.jpg' },
    { local: 'backend_data/images/水电设计图片/6.jpg', remote: 'backend_data/images/水电设计图片/6.jpg' },
    
    // 嵌入式
    { local: 'backend_data/images/嵌入式图片/1.jpg', remote: 'backend_data/images/嵌入式图片/1.jpg' },
    { local: 'backend_data/images/嵌入式图片/2.jpg', remote: 'backend_data/images/嵌入式图片/2.jpg' },
    { local: 'backend_data/images/嵌入式图片/3.jpg', remote: 'backend_data/images/嵌入式图片/3.jpg' },
    { local: 'backend_data/images/嵌入式图片/4.jpg', remote: 'backend_data/images/嵌入式图片/4.jpg' },
    
    // 空调
    { local: 'backend_data/images/空调图片/1.jpg', remote: 'backend_data/images/空调图片/1.jpg' },
    { local: 'backend_data/images/空调图片/2.jpg', remote: 'backend_data/images/空调图片/2.jpg' },
    { local: 'backend_data/images/空调图片/3.jpg', remote: 'backend_data/images/空调图片/3.jpg' },
    { local: 'backend_data/images/空调图片/4.jpg', remote: 'backend_data/images/空调图片/4.jpg' },
    
    // 净水器
    { local: 'backend_data/images/净水器图片/1.jpg', remote: 'backend_data/images/净水器图片/1.jpg' },
    { local: 'backend_data/images/净水器图片/2.jpg', remote: 'backend_data/images/净水器图片/2.jpg' },
    { local: 'backend_data/images/净水器图片/3.jpg', remote: 'backend_data/images/净水器图片/3.jpg' },
    { local: 'backend_data/images/净水器图片/4.jpg', remote: 'backend_data/images/净水器图片/4.jpg' },
    { local: 'backend_data/images/净水器图片/5.jpg', remote: 'backend_data/images/净水器图片/5.jpg' },
    
    // 地暖知识
    { local: 'backend_data/images/地暖知识图片/1.jpg', remote: 'backend_data/images/地暖知识图片/1.jpg' },
    { local: 'backend_data/images/地暖知识图片/2.jpg', remote: 'backend_data/images/地暖知识图片/2.jpg' },
    { local: 'backend_data/images/地暖知识图片/3.jpg', remote: 'backend_data/images/地暖知识图片/3.jpg' },
    { local: 'backend_data/images/地暖知识图片/4.jpg', remote: 'backend_data/images/地暖知识图片/4.jpg' },
    { local: 'backend_data/images/地暖知识图片/5.jpg', remote: 'backend_data/images/地暖知识图片/5.jpg' },
    { local: 'backend_data/images/地暖知识图片/6.jpg', remote: 'backend_data/images/地暖知识图片/6.jpg' },
    { local: 'backend_data/images/地暖知识图片/7.jpg', remote: 'backend_data/images/地暖知识图片/7.jpg' },
    { local: 'backend_data/images/地暖知识图片/8.jpg', remote: 'backend_data/images/地暖知识图片/8.jpg' },
    { local: 'backend_data/images/地暖知识图片/9.jpg', remote: 'backend_data/images/地暖知识图片/9.jpg' },
    { local: 'backend_data/images/地暖知识图片/10.jpg', remote: 'backend_data/images/地暖知识图片/10.jpg' },
    { local: 'backend_data/images/地暖知识图片/11.jpg', remote: 'backend_data/images/地暖知识图片/11.jpg' },
    
    // 封窗安装与验收
    { local: 'backend_data/images/封窗安装与验收图片/1.jpg', remote: 'backend_data/images/封窗安装与验收图片/1.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/2.jpg', remote: 'backend_data/images/封窗安装与验收图片/2.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/3.jpg', remote: 'backend_data/images/封窗安装与验收图片/3.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/4.jpg', remote: 'backend_data/images/封窗安装与验收图片/4.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/5.jpg', remote: 'backend_data/images/封窗安装与验收图片/5.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/6.jpg', remote: 'backend_data/images/封窗安装与验收图片/6.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/7.jpg', remote: 'backend_data/images/封窗安装与验收图片/7.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/8.jpg', remote: 'backend_data/images/封窗安装与验收图片/8.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/9.jpg', remote: 'backend_data/images/封窗安装与验收图片/9.jpg' },
    { local: 'backend_data/images/封窗安装与验收图片/10.jpg', remote: 'backend_data/images/封窗安装与验收图片/10.jpg' },
    
    // 封窗工地考察
    { local: 'backend_data/images/封窗工地考察图片/1.jpg', remote: 'backend_data/images/封窗工地考察图片/1.jpg' },
    { local: 'backend_data/images/封窗工地考察图片/2.jpg', remote: 'backend_data/images/封窗工地考察图片/2.jpg' },
    { local: 'backend_data/images/封窗工地考察图片/3.jpg', remote: 'backend_data/images/封窗工地考察图片/3.jpg' },
    { local: 'backend_data/images/封窗工地考察图片/4.jpg', remote: 'backend_data/images/封窗工地考察图片/4.jpg' },
    { local: 'backend_data/images/封窗工地考察图片/5.jpg', remote: 'backend_data/images/封窗工地考察图片/5.jpg' },
    { local: 'backend_data/images/封窗工地考察图片/6.jpg', remote: 'backend_data/images/封窗工地考察图片/6.jpg' },
    
    // 封窗知识
    { local: 'backend_data/images/封窗知识图片/窗户结构.jpg', remote: 'backend_data/images/封窗知识图片/窗户结构.jpg' },
    { local: 'backend_data/images/封窗知识图片/玻璃结构.jpg', remote: 'backend_data/images/封窗知识图片/玻璃结构.jpg' },
    
    // 厨房材料
    { local: 'backend_data/images/厨房材料图片/1.jpg', remote: 'backend_data/images/厨房材料图片/1.jpg' },
    { local: 'backend_data/images/厨房材料图片/2.jpg', remote: 'backend_data/images/厨房材料图片/2.jpg' },
    
    // 卫浴材料
    { local: 'backend_data/images/卫浴材料图片/1.jpg', remote: 'backend_data/images/卫浴材料图片/1.jpg' },
    { local: 'backend_data/images/卫浴材料图片/2.jpg', remote: 'backend_data/images/卫浴材料图片/2.jpg' },
    
    // 门
    { local: 'backend_data/images/门图片/1.jpg', remote: 'backend_data/images/门图片/1.jpg' },
    { local: 'backend_data/images/门图片/2.jpg', remote: 'backend_data/images/门图片/2.jpg' },
    
    // 地板挑选指南
    { local: 'backend_data/images/地板挑选指南图片/1.jpg', remote: 'backend_data/images/地板挑选指南图片/1.jpg' },
    { local: 'backend_data/images/地板挑选指南图片/2.jpg', remote: 'backend_data/images/地板挑选指南图片/2.jpg' },
    { local: 'backend_data/images/地板挑选指南图片/3.jpg', remote: 'backend_data/images/地板挑选指南图片/3.jpg' },
    { local: 'backend_data/images/地板挑选指南图片/4.jpg', remote: 'backend_data/images/地板挑选指南图片/4.jpg' },
    { local: 'backend_data/images/地板挑选指南图片/5.jpg', remote: 'backend_data/images/地板挑选指南图片/5.jpg' },
    
    // 地板挑选
    { local: 'backend_data/images/地板挑选图片/1.jpg', remote: 'backend_data/images/地板挑选图片/1.jpg' },
    { local: 'backend_data/images/地板挑选图片/2.jpg', remote: 'backend_data/images/地板挑选图片/2.jpg' },
    { local: 'backend_data/images/地板挑选图片/3.jpg', remote: 'backend_data/images/地板挑选图片/3.jpg' },
    { local: 'backend_data/images/地板挑选图片/4.jpg', remote: 'backend_data/images/地板挑选图片/4.jpg' },
    { local: 'backend_data/images/地板挑选图片/5.jpg', remote: 'backend_data/images/地板挑选图片/5.jpg' },
    
    // 瓷砖主材
    { local: 'backend_data/images/瓷砖主材图片/1.jpg', remote: 'backend_data/images/瓷砖主材图片/1.jpg' },
    { local: 'backend_data/images/瓷砖主材图片/2.jpg', remote: 'backend_data/images/瓷砖主材图片/2.jpg' },
    { local: 'backend_data/images/瓷砖主材图片/3.jpg', remote: 'backend_data/images/瓷砖主材图片/3.jpg' },
    
    // 油工材料
    { local: 'backend_data/images/油工材料图片/1.jpg', remote: 'backend_data/images/油工材料图片/1.jpg' },
    { local: 'backend_data/images/油工材料图片/2.jpg', remote: 'backend_data/images/油工材料图片/2.jpg' },
    
    // 泥工材料
    { local: 'backend_data/images/泥工材料图片/1.jpg', remote: 'backend_data/images/泥工材料图片/1.jpg' },
    { local: 'backend_data/images/泥工材料图片/2.jpg', remote: 'backend_data/images/泥工材料图片/2.jpg' },
    { local: 'backend_data/images/泥工材料图片/3.jpg', remote: 'backend_data/images/泥工材料图片/3.jpg' },
    
    // 水电材料
    { local: 'backend_data/images/水电材料图片/1.jpg', remote: 'backend_data/images/水电材料图片/1.jpg' },
    { local: 'backend_data/images/水电材料图片/2.jpg', remote: 'backend_data/images/水电材料图片/2.jpg' },
    { local: 'backend_data/images/水电材料图片/3.jpg', remote: 'backend_data/images/水电材料图片/3.jpg' },
    
    // 设计步骤-设计图与效果图
    { local: 'backend_data/images/设计步骤-设计图与效果图/1.jpg', remote: 'backend_data/images/设计步骤-设计图与效果图/1.jpg' },
    { local: 'backend_data/images/设计步骤-设计图与效果图/2.jpg', remote: 'backend_data/images/设计步骤-设计图与效果图/2.jpg' },
    
    // 装修方式
    { local: 'backend_data/images/装修方式图片/1.jpg', remote: 'backend_data/images/装修方式图片/1.jpg' },
    { local: 'backend_data/images/装修方式图片/2.jpg', remote: 'backend_data/images/装修方式图片/2.jpg' },
    { local: 'backend_data/images/装修方式图片/3.jpg', remote: 'backend_data/images/装修方式图片/3.jpg' },
    { local: 'backend_data/images/装修方式图片/4.jpg', remote: 'backend_data/images/装修方式图片/4.jpg' },
    { local: 'backend_data/images/装修方式图片/装修公司选择.jpg', remote: 'backend_data/images/装修方式图片/装修公司选择.jpg' },
    { local: 'backend_data/images/装修方式图片/设计工作室选择.jpg', remote: 'backend_data/images/装修方式图片/设计工作室选择.jpg' },
    
    // 收房验房
    { local: 'backend_data/images/收房验房图片/1.jpg', remote: 'backend_data/images/收房验房图片/1.jpg' },
    { local: 'backend_data/images/收房验房图片/2.jpg', remote: 'backend_data/images/收房验房图片/2.jpg' },
    { local: 'backend_data/images/收房验房图片/3.jpg', remote: 'backend_data/images/收房验房图片/3.jpg' },
    { local: 'backend_data/images/收房验房图片/4.jpg', remote: 'backend_data/images/收房验房图片/4.jpg' },
    { local: 'backend_data/images/收房验房图片/5.jpg', remote: 'backend_data/images/收房验房图片/5.jpg' },
    { local: 'backend_data/images/收房验房图片/6.jpg', remote: 'backend_data/images/收房验房图片/6.jpg' },
    
    // 软装阶段知识
    { local: 'backend_data/images/软装阶段知识-图片/1.jpg', remote: 'backend_data/images/软装阶段知识-图片/1.jpg' },
    { local: 'backend_data/images/软装阶段知识-图片/2.jpg', remote: 'backend_data/images/软装阶段知识-图片/2.jpg' },
    { local: 'backend_data/images/软装阶段知识-图片/3.jpg', remote: 'backend_data/images/软装阶段知识-图片/3.jpg' },
    { local: 'backend_data/images/软装阶段知识-图片/4.jpg', remote: 'backend_data/images/软装阶段知识-图片/4.jpg' },
    { local: 'backend_data/images/软装阶段知识-图片/5.jpg', remote: 'backend_data/images/软装阶段知识-图片/5.jpg' },
    
    // 硬装阶段知识
    { local: 'backend_data/images/硬装阶段知识-图片/带着设计图找团队.jpg', remote: 'backend_data/images/硬装阶段知识-图片/带着设计图找团队.jpg' },
    { local: 'backend_data/images/硬装阶段知识-图片/暖通门窗早确定.jpg', remote: 'backend_data/images/硬装阶段知识-图片/暖通门窗早确定.jpg' },
    { local: 'backend_data/images/硬装阶段知识-图片/水电泥木油.jpg', remote: 'backend_data/images/硬装阶段知识-图片/水电泥木油.jpg' },
    { local: 'backend_data/images/硬装阶段知识-图片/主材选购有妙招.jpg', remote: 'backend_data/images/硬装阶段知识-图片/主材选购有妙招.jpg' },
    
    // 装修入门知识
    { local: 'backend_data/images/装修入门知识图片/三书一证一表.jpg', remote: 'backend_data/images/装修入门知识图片/三书一证一表.jpg' },
    { local: 'backend_data/images/装修入门知识图片/掌握预算.jpg', remote: 'backend_data/images/装修入门知识图片/掌握预算.jpg' },
    { local: 'backend_data/images/装修入门知识图片/验房必备工具.jpg', remote: 'backend_data/images/装修入门知识图片/验房必备工具.jpg' },
    { local: 'backend_data/images/装修入门知识图片/自行设计.jpg', remote: 'backend_data/images/装修入门知识图片/自行设计.jpg' },
    { local: 'backend_data/images/装修入门知识图片/硬装5大工序.jpg', remote: 'backend_data/images/装修入门知识图片/硬装5大工序.jpg' },
    { local: 'backend_data/images/装修入门知识图片/装修三大阶段.jpg', remote: 'backend_data/images/装修入门知识图片/装修三大阶段.jpg' },
    
    // 主材安装
    { local: 'backend_data/images/主材安装图片/1.jpg', remote: 'backend_data/images/主材安装图片/1.jpg' },
    { local: 'backend_data/images/主材安装图片/2.jpg', remote: 'backend_data/images/主材安装图片/2.jpg' },
    { local: 'backend_data/images/主材安装图片/3.jpg', remote: 'backend_data/images/主材安装图片/3.jpg' },
    { local: 'backend_data/images/主材安装图片/4.jpg', remote: 'backend_data/images/主材安装图片/4.jpg' },
    { local: 'backend_data/images/主材安装图片/5.jpg', remote: 'backend_data/images/主材安装图片/5.jpg' },
    { local: 'backend_data/images/主材安装图片/6.jpg', remote: 'backend_data/images/主材安装图片/6.jpg' },
    { local: 'backend_data/images/主材安装图片/7.jpg', remote: 'backend_data/images/主材安装图片/7.jpg' },
    
    // 卫生间防水
    { local: 'backend_data/images/卫生间防水图片/1.jpg', remote: 'backend_data/images/卫生间防水图片/1.jpg' },
    { local: 'backend_data/images/卫生间防水图片/2.jpg', remote: 'backend_data/images/卫生间防水图片/2.jpg' },
    { local: 'backend_data/images/卫生间防水图片/3.jpg', remote: 'backend_data/images/卫生间防水图片/3.jpg' },
    { local: 'backend_data/images/卫生间防水图片/4.jpg', remote: 'backend_data/images/卫生间防水图片/4.jpg' },
    
    // 瓷砖
    { local: 'backend_data/images/瓷砖图片/1.jpg', remote: 'backend_data/images/瓷砖图片/1.jpg' },
    { local: 'backend_data/images/瓷砖图片/2.jpg', remote: 'backend_data/images/瓷砖图片/2.jpg' },
    { local: 'backend_data/images/瓷砖图片/3.jpg', remote: 'backend_data/images/瓷砖图片/3.jpg' },
    { local: 'backend_data/images/瓷砖图片/4.jpg', remote: 'backend_data/images/瓷砖图片/4.jpg' },
    { local: 'backend_data/images/瓷砖图片/5.jpg', remote: 'backend_data/images/瓷砖图片/5.jpg' },
    { local: 'backend_data/images/瓷砖图片/6.jpg', remote: 'backend_data/images/瓷砖图片/6.jpg' },
    { local: 'backend_data/images/瓷砖图片/7.jpg', remote: 'backend_data/images/瓷砖图片/7.jpg' },
    
    // 木工
    { local: 'backend_data/images/木工图片/1.jpg', remote: 'backend_data/images/木工图片/1.jpg' },
    { local: 'backend_data/images/木工图片/2.jpg', remote: 'backend_data/images/木工图片/2.jpg' },
    { local: 'backend_data/images/木工图片/3.jpg', remote: 'backend_data/images/木工图片/3.jpg' },
    { local: 'backend_data/images/木工图片/4.jpg', remote: 'backend_data/images/木工图片/4.jpg' },
    { local: 'backend_data/images/木工图片/5.jpg', remote: 'backend_data/images/木工图片/5.jpg' },
    { local: 'backend_data/images/木工图片/6.jpg', remote: 'backend_data/images/木工图片/6.jpg' },
    { local: 'backend_data/images/木工图片/7.jpg', remote: 'backend_data/images/木工图片/7.jpg' },
    
    // 油工
    { local: 'backend_data/images/油工图片/1.jpg', remote: 'backend_data/images/油工图片/1.jpg' },
    { local: 'backend_data/images/油工图片/2.jpg', remote: 'backend_data/images/油工图片/2.jpg' },
    { local: 'backend_data/images/油工图片/3.jpg', remote: 'backend_data/images/油工图片/3.jpg' },
    { local: 'backend_data/images/油工图片/4.jpg', remote: 'backend_data/images/油工图片/4.jpg' },
    
    // 美缝
    { local: 'backend_data/images/美缝图片/1.jpg', remote: 'backend_data/images/美缝图片/1.jpg' },
    { local: 'backend_data/images/美缝图片/2.jpg', remote: 'backend_data/images/美缝图片/2.jpg' },
    { local: 'backend_data/images/美缝图片/3.jpg', remote: 'backend_data/images/美缝图片/3.jpg' },
    
    // 全屋定制
    { local: 'backend_data/images/全屋定制图片/1.jpg', remote: 'backend_data/images/全屋定制图片/1.jpg' },
    { local: 'backend_data/images/全屋定制图片/2.jpg', remote: 'backend_data/images/全屋定制图片/2.jpg' },
    { local: 'backend_data/images/全屋定制图片/3.jpg', remote: 'backend_data/images/全屋定制图片/3.jpg' },
    { local: 'backend_data/images/全屋定制图片/4.jpg', remote: 'backend_data/images/全屋定制图片/4.jpg' },
    { local: 'backend_data/images/全屋定制图片/5.jpg', remote: 'backend_data/images/全屋定制图片/5.jpg' },
    
    // 电器
    { local: 'backend_data/images/电器图片/1.jpg', remote: 'backend_data/images/电器图片/1.jpg' },
    { local: 'backend_data/images/电器图片/2.jpg', remote: 'backend_data/images/电器图片/2.jpg' },
    { local: 'backend_data/images/电器图片/3.jpg', remote: 'backend_data/images/电器图片/3.jpg' },
    { local: 'backend_data/images/电器图片/4.jpg', remote: 'backend_data/images/电器图片/4.jpg' },
    { local: 'backend_data/images/电器图片/5.jpg', remote: 'backend_data/images/电器图片/5.jpg' },
    { local: 'backend_data/images/电器图片/6.jpg', remote: 'backend_data/images/电器图片/6.jpg' },
    { local: 'backend_data/images/电器图片/7.jpg', remote: 'backend_data/images/电器图片/7.jpg' },
    { local: 'backend_data/images/电器图片/8.jpg', remote: 'backend_data/images/电器图片/8.jpg' },
    
    // 家具
    { local: 'backend_data/images/家具图片/1.jpg', remote: 'backend_data/images/家具图片/1.jpg' },
    { local: 'backend_data/images/家具图片/2.jpg', remote: 'backend_data/images/家具图片/2.jpg' },
    { local: 'backend_data/images/家具图片/3.jpg', remote: 'backend_data/images/家具图片/3.jpg' },
    { local: 'backend_data/images/家具图片/4.jpg', remote: 'backend_data/images/家具图片/4.jpg' },
    { local: 'backend_data/images/家具图片/5.jpg', remote: 'backend_data/images/家具图片/5.jpg' },
    { local: 'backend_data/images/家具图片/6.jpg', remote: 'backend_data/images/家具图片/6.jpg' },
    
    // 入住前知识
    { local: 'backend_data/images/入住前知识-图片/1.jpg', remote: 'backend_data/images/入住前知识-图片/1.jpg' },
    { local: 'backend_data/images/入住前知识-图片/2.jpg', remote: 'backend_data/images/入住前知识-图片/2.jpg' },
    { local: 'backend_data/images/入住前知识-图片/3.jpg', remote: 'backend_data/images/入住前知识-图片/3.jpg' },
    { local: 'backend_data/images/入住前知识-图片/4.jpg', remote: 'backend_data/images/入住前知识-图片/4.jpg' },
    { local: 'backend_data/images/入住前知识-图片/5.jpg', remote: 'backend_data/images/入住前知识-图片/5.jpg' },
  ];
  
  // 初始化存储桶
  const initialized = await initStorage();
  if (!initialized) {
    console.error('存储桶初始化失败');
    return;
  }
  
  // 逐个上传文件
  let successCount = 0;
  let failCount = 0;
  
  for (const file of filesToUpload) {
    try {
      // 读取本地文件
      const response = await fetch(file.local);
      if (!response.ok) {
        throw new Error(`无法读取文件: ${file.local}`);
      }
      
      const blob = await response.blob();
      
      // 上传文件
      const result = await uploadFile(blob, file.remote);
      
      if (result.success) {
        console.log(`上传成功: ${file.local} -> ${file.remote}`);
        successCount++;
      } else {
        console.error(`上传失败: ${file.local} -> ${file.remote}, 错误: ${result.error}`);
        failCount++;
      }
    } catch (error) {
      console.error(`上传异常: ${file.local}, 错误: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n上传完成! 成功: ${successCount}, 失败: ${failCount}`);
}

// 导出上传函数
export { uploadDirectory };
