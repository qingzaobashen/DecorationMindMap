const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const csvParser = require('csv-parser');

// MySQL 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // 替换为你的数据库密码
  database: 'renovation_mindmap', // 替换为你的数据库名称
};

// 创建 MySQL 连接
const connection = mysql.createConnection(dbConfig);

// CSV 文件路径
const csvFilePath = path.join(__dirname, 
  '../../../../装修思维导图资料/装修思维导图文档/导入数据库/数据库表内容.csv'); // 替换为你的 CSV 文件路径

// 目标表名
const tableName = 'nodes'; // 替换为你的目标表名

// 读取并解析 CSV 文件
fs.createReadStream(csvFilePath)
  .pipe(csvParser())
  .on('data', (row) => {
    // 构建插入 SQL 语句
    const columns = Object.keys(row).join(', ');
    const values = Object.values(row).map((value) => connection.escape(value)).join(', ');
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;

    // 执行插入操作
    connection.query(sql, (err) => {
      if (err) {
        console.error('插入数据时出错:', err);
      } else {
        console.log('成功插入一条数据:', row);
      }
    });
  })
  .on('end', () => {
    console.log('CSV 文件处理完成');
    connection.end(); // 关闭数据库连接
  })
  .on('error', (err) => {
    console.error('读取 CSV 文件时出错:', err);
  });