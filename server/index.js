import express from 'express';
import cors from 'cors';
import { expressjwt } from 'express-jwt';
import dotenv from 'dotenv';
import db from './db.js';
import nodesRouter from './routes/nodes.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// 配置中间件
app.use(cors());
app.use(express.json());

// 连接数据库
db.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err.stack);
    return;
  }
  console.log('成功连接到数据库，连接ID:', db.threadId);
});

// JWT认证中间件
app.use(
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    credentialsRequired: false
  }).unless({
    path: [
      '/api/auth/login',
      '/api/auth/register',
      { url: /^\/api\/nodes\//, methods: ['POST'] }
    ]
  })
);

// 注册路由
app.use('/api/nodes', nodesRouter);
app.use('/api/auth', authRouter);

app.listen(port, () => {
  console.log(`后端服务运行在 http://localhost:${port}`);
});