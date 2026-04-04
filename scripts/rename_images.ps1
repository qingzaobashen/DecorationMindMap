# 文件夹中英文映射
$folderMapping = @{
    '入住前知识-图片' = 'preMoveIn-knowledge'
    '家具图片' = 'furniture'
    '电器图片' = 'appliances'
    '全屋定制图片' = 'wholeHouseCustom'
    '美缝图片' = 'grout'
    '油工图片' = 'paintWork'
    '卫生间防水图片' = 'bathroomWaterproof'
    '瓷砖图片' = 'tiles'
    '木工图片' = 'carpentry'
    '水电施工图片' = 'hydroConstruction'
    '水电材料验收图片' = 'hydroMaterialAcceptance'
    '打拆与新建图片' = 'demolitionNew'
    '水电设计图片' = 'hydroDesign'
    '嵌入式图片' = 'embedded'
    '空调图片' = 'airConditioner'
    '净水器图片' = 'waterPurifier'
    '地暖知识图片' = 'floorHeating'
    '封窗安装与验收图片' = 'windowInstallAcceptance'
    '封窗工地考察图片' = 'windowSiteVisit'
    '封窗知识图片' = 'windowKnowledge'
    '厨房材料图片' = 'kitchenMaterial'
    '卫浴材料图片' = 'bathroomMaterial'
    '门图片' = 'doors'
    '地板挑选图片' = 'floorSelection'
    '地板挑选指南图片' = 'floorSelectionGuide'
    '瓷砖主材图片' = 'tileMainMaterial'
    '油工材料图片' = 'paintMaterial'
    '泥工材料图片' = 'tilingMaterial'
    '水电材料图片' = 'hydroMaterial'
    '设计步骤-设计图与效果图' = 'designStepsRenderings'
    '装修方式图片' = 'decorationMethod'
    '收房验房图片' = 'houseAcceptance'
    '软装阶段知识-图片' = 'softDecorationKnowledge'
    '硬装阶段知识-图片' = 'hardDecorationKnowledge'
    '主材安装图片' = 'mainMaterialInstall'
    '装修入门知识图片' = 'decorationBasicKnowledge'
}

# 文件名中英文映射
$fileMapping = @{
    '三书一证一表.jpg' = 'threeBooksOneCertificateOneForm.jpg'
    '掌握预算.jpg' = 'budgetControl.jpg'
    '硬装5大工序.jpg' = 'fiveHardWorkStages.jpg'
    '自行设计.jpg' = 'selfDesign.jpg'
    '验房必备工具.jpg' = 'houseInspectionTools.jpg'
    '装修三大阶段.jpg' = 'threeDecorationStages.jpg'
    '装修公司选择.jpg' = 'chooseDecorationCompany.jpg'
    '设计工作室选择.jpg' = 'chooseDesignStudio.jpg'
    '主材选购有妙招.jpg' = 'mainMaterialSelectionTips.jpg'
    '带着设计图找团队.jpg' = 'findTeamWithDesign.jpg'
    '暖通门窗早确定.jpg' = 'hvacWindowsDoorsEarly.jpg'
    '水电泥木油.jpg' = 'hydroTileWoodPaint.jpg'
    '三书一证一表.jpg' = 'threeBooksOneCertificateOneForm.jpg'
    '装修三大阶段.jpg' = 'threeDecorationStages.jpg'
    '验房必备工具.jpg' = 'houseInspectionTools.jpg'
    '装修三大阶段.jpg' = 'threeDecorationStages.jpg'
    '三书一证一表.jpg' = 'threeBooksOneCertificateOneForm.jpg'
}

$basePath = 'd:\workT\wx_smallPrograms\Decorations\DecorationMindMap_github\public\backend_data\images'

Write-Host "Starting folder renaming..."

# 重命名文件夹
foreach ($folder in $folderMapping.Keys) {
    $oldPath = Join-Path $basePath $folder
    $newPath = Join-Path $basePath $folderMapping[$folder]
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName $folderMapping[$folder] -Force
        Write-Host "Renamed folder: $folder -> $($folderMapping[$folder])"
    } else {
        Write-Host "Folder not found: $oldPath"
    }
}

Write-Host "Starting file renaming..."

# 重命名文件
$allFiles = Get-ChildItem -Path $basePath -Recurse -File
foreach ($file in $allFiles) {
    $fileName = $file.Name
    $dirName = $file.Directory.Name
    
    if ($fileMapping.ContainsKey($fileName)) {
        $newFileName = $fileMapping[$fileName]
        $newPath = Join-Path $file.DirectoryName $newFileName
        Rename-Item -Path $file.FullName -NewName $newFileName -Force
        Write-Host "Renamed file: $fileName -> $newFileName"
    }
}

Write-Host "Done!"
