import { executeSqlFile } from '../db.js';

executeSqlFile('./sample_data.sql')
  .then(() => {
    console.log('数据库初始化成功');
    process.exit(0);
  })
  .catch((err) => {
    console.error('初始化失败:', err);
    process.exit(1);
  });