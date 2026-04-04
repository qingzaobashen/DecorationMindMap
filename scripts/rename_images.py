# -*- coding: utf-8 -*-
import os
import shutil

# 基础路径
base_path = r'd:\workT\wx_smallPrograms\Decorations\DecorationMindMap_github\public\backend_data\images'

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

print("Starting folder renaming...")

# 重命名文件夹
for old_name, new_name in folder_mapping.items():
    old_path = os.path.join(base_path, old_name)
    new_path = os.path.join(base_path, new_name)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        print(f"Renamed folder: {old_name} -> {new_name}")
    else:
        print(f"Folder not found: {old_path}")

print("\nStarting file renaming...")

# 重命名文件
for root, dirs, files in os.walk(base_path):
    for filename in files:
        if filename in file_mapping:
            old_path = os.path.join(root, filename)
            new_filename = file_mapping[filename]
            new_path = os.path.join(root, new_filename)
            os.rename(old_path, new_path)
            print(f"Renamed file: {filename} -> {new_filename}")

print("\nDone!")
