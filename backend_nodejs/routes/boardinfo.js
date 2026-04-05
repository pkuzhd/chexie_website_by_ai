const express = require('express');
const { Op } = require('sequelize');
const BoardInfo = require('../models/BoardInfo');
const Threads = require('../models/Threads');
const Posts = require('../models/Posts');

const router = express.Router();

// 1. 获取所有板块信息（仅显示未隐藏的板块）
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

// 2. 获取单个板块信息（通过路径参数/:bid）
router.get('/:bid', async (req, res) => {
  try {
    const { bid } = req.params;
    
    // 验证bid是否为有效的数字
    if (isNaN(bid)) {
      return res.status(400).json({ message: '无效的板块ID' });
    }
    
    const boardinfo = await BoardInfo.findOne({
      where: { bid }
    });
    
    if (!boardinfo) {
      return res.status(404).json({ message: '板块不存在' });
    }
    
    // 获取当前日期
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // 格式：Y-m-d
    
    // 计算今日的时间戳范围
    const time1 = Math.floor(new Date(date).getTime() / 1000); // 当日00:00:00
    const time2 = Math.floor(new Date(date + 'T23:59:59').getTime() / 1000); // 当日23:59:59
    
    // 并行执行所有查询，提高性能
    const [topics, extr, newpost, newreply] = await Promise.all([
      // 主题总数
      Threads.count({
        where: { bid }
      }),
      // 特殊主题数量
      Threads.count({
        where: { bid, extr: 1 }
      }),
      // 今日新增主题数
      Threads.count({
        where: {
          bid,
          postdate: {
            [Op.gte]: new Date(date),
            [Op.lt]: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
          }
        }
      }),
      // 今日新增回复数
      Posts.count({
        where: {
          bid,
          replytime: {
            [Op.gte]: time1,
            [Op.lte]: time2
          }
        }
      })
    ]);
    
    // 将新字段添加到返回数据中
    const boardData = boardinfo.toJSON();
    boardData.topics = topics;
    boardData.extr = extr;
    boardData.newpost = newpost;
    boardData.newreply = newreply;
    
    res.json({
      message: '获取板块信息成功',
      data: boardData
    });
  } catch (error) {
    console.error('获取板块信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
