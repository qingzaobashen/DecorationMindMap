export const sampleData = {
    // 调整图片字段为images并更新路径

    name: '装修总流程',
    children: [
        {
            name: '设计阶段',
            details: [
                { text: '确定装修风格', image: '/resources/style1.png' },
                { text: '量房测绘', image: '/resources/test1.png' },
                { text: '施工图纸审核', image: '/resources/style1.png' },
            ],
            children: [
                {
                    name: '方案确认',
                    details: [
                        { text: '业主需求沟通', image: '/resources/style1.png' },
                        { text: '3D效果图制作', image: '/resources/style1.png' },
                    ],
                },
                {
                    name: '材料选购',
                    details: [
                        { text: '主材清单制定', image: '/resources/style1.png' },
                        { text: '环保等级确认', image: '/resources/test1.png' },
                    ],
                },
            ],
        },
        {
            name: '施工阶段',
            details: [
                { text: '水电改造', image: '/resources/style1.png' },
                { text: '防水工程', image: '/resources/style1.png' },
                { text: '墙面处理', image: '/resources/style1.png' },
            ],
            children: [
                {
                    name: '隐蔽工程',
                    details: [
                        { text: '管线铺设规范', image: '/resources/style1.png' },
                        { text: '压力测试', image: '/resources/style1.png' },
                    ],
                },
                {
                    name: '泥木工程',
                    details: [
                        { text: '瓷砖铺贴', image: '/resources/style1.png' },
                        { text: '吊顶施工', image: '/resources/style1.png' },
                    ],
                },
            ],
        },
    ],
};
