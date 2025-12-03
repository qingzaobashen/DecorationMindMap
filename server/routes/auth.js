import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Use parameterized query to prevent SQL injection
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!users || users.length === 0) {
      console.log(users);
      res.status(401).json({ error: '无效的用户名或密码！' });
      return;
    }

    let user = users[0];
    if (!user){
      user = users;  //sql查询到的一般只有一个用户，返回的users就是一个
    }
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: '无效的用户名或密码！' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录错误' });
  }
});

export default router;