import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
dotenv.config({ path: '../.env' });

// 创建连接池
console.log('当前数据库配置:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  authPlugins: {
    mysql_native_password: () => require('mysql2/lib/auth_plugins/mysql_native_password'),
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 封装数据库查询方法
// 执行SQL文件方法
export async function executeSqlFile(filePath) {
  const connection = await pool.getConnection();
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    await connection.query(sql);
  } finally {
    connection.release();
  }
}

export const query = async (sql, values) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(sql, values);
    return results;
  } finally {
    connection.release();
  }
};

export const connect = async () => {
  return await pool.getConnection();
};

const db = {
  connect: async () => {
    return await pool.getConnection();
  },
  query: async (sql, values) => {
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.query(sql, values);
      return results;
    } finally {
      connection.release();
    }
  }
};

export default db;