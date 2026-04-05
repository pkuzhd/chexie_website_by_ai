const express = require('express');
const boardInfoService = require('../services/BoardInfoService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const boardinfo = await boardInfoService.getAllBoards();
    res.json({
      message: '获取板块信息成功',
      data: boardinfo
    });
  } catch (error) {
    console.error('获取板块信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:bid', async (req, res) => {
  try {
    const { bid } = req.params;

    if (isNaN(bid)) {
      return res.status(400).json({ message: '无效的板块ID' });
    }

    const boardData = await boardInfoService.getBoardByBid(bid);
    res.json({
      message: '获取板块信息成功',
      data: boardData
    });
  } catch (error) {
    if (error.message === '板块不存在') {
      return res.status(404).json({ message: error.message });
    }
    console.error('获取板块信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
