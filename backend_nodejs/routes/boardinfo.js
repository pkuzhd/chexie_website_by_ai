const express = require('express');
const BoardInfo = require('../models/BoardInfo');

const router = express.Router();

// 获取所有板块信息
router.get('/', async (req, res) => {
  try {
    // 查询所有板块信息，不包含隐藏的板块（hide=0）
    const boardinfo = await BoardInfo.findAll({
      where: { hide: 0 },
      order: [['bid', 'ASC']] // 按照板块ID升序排列
    });
    
    res.json({
      message: '获取板块信息成功',
      data: boardinfo
    });
  } catch (error) {
    console.error('获取板块信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个板块信息
router.get('/:bid', async (req, res) => {
  try {
    const { bid } = req.params;
    
    const boardinfo = await BoardInfo.findOne({
      where: { bid, hide: 0 }
    });
    
    if (!boardinfo) {
      return res.status(404).json({ message: '板块不存在' });
    }
    
    res.json({
      message: '获取板块信息成功',
      data: boardinfo
    });
  } catch (error) {
    console.error('获取板块信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
