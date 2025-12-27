const express = require('express');
const Threads = require('../models/Threads');

const router = express.Router();

// 1. 通过查询参数获取主题帖信息：
//    - GET /api/threads?bid=1&tid=2 获取单个主题帖
//    - GET /api/threads?bid=1&p=1 获取分页主题帖列表（p_size默认为10）
//    支持显式key的查询参数格式
router.get('/', async (req, res) => {
  try {
    const { bid, tid, p, p_size } = req.query;
    
    // 验证必填参数bid
    if (!bid) {
      return res.status(400).json({ message: '缺少必填参数bid' });
    }
    
    // 验证bid是否为有效的整数
    const bidInt = parseInt(bid);
    if (isNaN(bidInt)) {
      return res.status(400).json({ message: 'bid参数不是有效的整数' });
    }
    
    // 如果提供了tid参数，则返回单个主题帖信息
    if (tid) {
      const tidInt = parseInt(tid);
      if (isNaN(tidInt)) {
        return res.status(400).json({ message: 'tid参数不是有效的整数' });
      }
      
      const thread = await Threads.findOne({
        where: { bid: bidInt, tid: tidInt }
      });
      
      if (!thread) {
        return res.status(404).json({ message: '主题帖不存在' });
      }
      
      res.json({
        message: '获取主题帖信息成功',
        data: thread
      });
    } else {
      // 处理分页参数，默认值
      const page = parseInt(p) || 1;
      const pageSize = parseInt(p_size) || 10;
      const offset = (page - 1) * pageSize;
      
      // 查询主题帖信息
      const threads = await Threads.findAll({
        where: { bid: bidInt },
        limit: pageSize,
        offset: offset,
        order: [['timestamp', 'DESC']] // 按时间戳降序排列，最新的主题帖在前
      });
      
      // 获取总记录数
      const total = await Threads.count({
        where: { bid: bidInt }
      });
      
      res.json({
        message: '获取主题帖列表成功',
        data: {
          threads,
          pagination: {
            current_page: page,
            page_size: pageSize,
            total: total,
            total_pages: Math.ceil(total / pageSize)
          }
        }
      });
    }
  } catch (error) {
    console.error('获取主题帖列表或单个主题帖失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});



// 2. 通过路径参数获取单个主题帖信息：
//    - GET /api/threads/1/2 获取单个主题帖
router.get('/:bid/:tid', async (req, res) => {
  try {
    const { bid, tid } = req.params;
    
    // 验证bid和tid是否为有效的整数
    const bidInt = parseInt(bid);
    const tidInt = parseInt(tid);
    
    if (isNaN(bidInt) || isNaN(tidInt)) {
      return res.status(400).json({ message: 'bid或tid参数不是有效的整数' });
    }
    
    const thread = await Threads.findOne({
      where: { bid: bidInt, tid: tidInt }
    });
    
    if (!thread) {
      return res.status(404).json({ message: '主题帖不存在' });
    }
    
    res.json({
      message: '获取主题帖信息成功',
      data: thread
    });
  } catch (error) {
    console.error('获取主题帖信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});


module.exports = router;