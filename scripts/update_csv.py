# -*- coding: utf-8 -*-
import csv
import re
import os

# 文件夹中英文映射
folder_mapping = {
    '入住前知识-图片': 'preMoveIn-knowledge',
    '家具图片': 'furniture',
    '电器图片': 'appliances',
    '全屋定制图片': 'wholeHouseCustom',
    '美缝图片': 'grout',
    '油工图片': 'paintWork',
    '卫生间防水图片': 'bathroomWaterproof',
    '瓷砖图片': 'tiles',
    '木工图片': 'carpentry',
    '水电施工图片': 'hydroConstruction',
    '水电材料验收图片': 'hydroMaterialAcceptance',
    '打拆与新建图片': 'demolitionNew',
    '水电设计图片': 'hydroDesign',
    '嵌入式图片': 'embedded',
    '空调图片': 'airConditioner',
    '净水器图片': 'waterPurifier',
    '地暖知识图片': 'floorHeating',
    '封窗安装与验收图片': 'windowInstallAcceptance',
    '封窗工地考察图片': 'windowSiteVisit',
    '封窗知识图片': 'windowKnowledge',
    '厨房材料图片': 'kitchenMaterial',
    '卫浴材料图片': 'bathroomMaterial',
    '门图片': 'doors',
    '地板挑选图片': 'floorSelection',
    '地板挑选指南图片': 'floorSelectionGuide',
    '瓷砖主材图片': 'tileMainMaterial',
    '油工材料图片': 'paintMaterial',
    '泥工材料图片': 'tilingMaterial',
    '水电材料图片': 'hydroMaterial',
    '设计步骤-设计图与效果图': 'designStepsRenderings',
    '装修方式图片': 'decorationMethod',
    '收房验房图片': 'houseAcceptance',
    '软装阶段知识-图片': 'softDecorationKnowledge',
    '硬装阶段知识-图片': 'hardDecorationKnowledge',
    '主材安装图片': 'mainMaterialInstall',
    '装修入门知识图片': 'decorationBasicKnowledge',
    '装修知识图片': 'decKnowlegPic',
    '硬装阶段知识-图片': 'hardDecorationKnowledge',
    '软装阶段知识-图片': 'softDecorationKnowledge',
    '设计步骤-设计图与效果图': 'designStepsRenderings',
}

# 文件名中英文映射
file_mapping = {
    '三书一证一表.jpg': 'threeBooksOneCertificateOneForm.jpg',
    '掌握预算.jpg': 'budgetControl.jpg',
    '硬装5大工序.jpg': 'fiveHardWorkStages.jpg',
    '自行设计.jpg': 'selfDesign.jpg',
    '验房必备工具.jpg': 'houseInspectionTools.jpg',
    '装修三大阶段.jpg': 'threeDecorationStages.jpg',
    '装修公司选择.jpg': 'chooseDecorationCompany.jpg',
    '设计工作室选择.jpg': 'chooseDesignStudio.jpg',
    '主材选购有妙招.jpg': 'mainMaterialSelectionTips.jpg',
    '带着设计图找团队.jpg': 'findTeamWithDesign.jpg',
    '暖通门窗早确定.jpg': 'hvacWindowsDoorsEarly.jpg',
    '水电泥木油.jpg': 'hydroTileWoodPaint.jpg',
    '窗户结构.jpg': 'windowStructure.jpg',
    '玻璃结构.jpg': 'glassStructure.jpg',
}

csv_path = r'd:\workT\wx_smallPrograms\Decorations\DecorationMindMap_github\public\backend_data\nodes_details_data.csv'
output_path = r'd:\workT\wx_smallPrograms\Decorations\DecorationMindMap_github\public\backend_data\nodes_details_data_new.csv'

def translate_path(path):
    """翻译路径中的中文部分为英文"""
    if not path:
        return path
    
    # 检查是否包含中文
    has_chinese = any('\u4e00' <= c <= '\u9fff' for c in path)
    if not has_chinese:
        return path
    
    # 替换文件夹名
    for cn_folder, en_folder in folder_mapping.items():
        if cn_folder in path:
            path = path.replace(cn_folder, en_folder)
    
    # 替换文件名
    for cn_file, en_file in file_mapping.items():
        if cn_file in path:
            path = path.replace(cn_file, en_file)
    
    return path

def process_img_url_field(value):
    """处理 img_url 字段，转换其中的图片路径"""
    if not value or value.strip() == '':
        return value
    
    # 检查是否包含中文
    has_chinese = any('\u4e00' <= c <= '\u9fff' for c in value)
    if not has_chinese:
        return value
    
    # 处理 Python 列表格式 ['xxx.jpg', 'yyy.jpg']
    # 首先提取所有引号内的内容
    result = value
    
    # 替换文件夹名（在路径中）
    for cn_folder, en_folder in folder_mapping.items():
        if cn_folder in result:
            result = result.replace(cn_folder, en_folder)
    
    # 替换文件名
    for cn_file, en_file in file_mapping.items():
        if cn_file in result:
            result = result.replace(cn_file, en_file)
    
    return result

print("Reading CSV file...")

# 读取 CSV 文件
rows = []
with open(csv_path, 'r', encoding='gbk', errors='ignore') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)

print(f"Total rows: {len(rows)}")

# 处理每一行
updated_count = 0
for row in rows:
    # 处理 img_url 字段
    if 'img_url' in row and row['img_url']:
        old_value = row['img_url']
        new_value = process_img_url_field(old_value)
        if old_value != new_value:
            row['img_url'] = new_value
            updated_count += 1
            print(f"Updated img_url: {old_value[:50]}... -> {new_value[:50]}...")

print(f"\nTotal fields updated: {updated_count}")

# 写入新的 CSV 文件
print(f"\nWriting to new CSV file: {output_path}")
with open(output_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("Done!")
print(f"\nNew CSV saved to: {output_path}")
print("Please replace the original file with the new one.")
