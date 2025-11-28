import express from 'express';
import db from '../db.js';

const router = express.Router();

// 获取所有节点数据
router.get('/', async (req, res) => {
  try {
    const results = await db.query(
    `SELECT * FROM nodes`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;