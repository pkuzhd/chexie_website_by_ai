const express = require('express');
const { requireAuthForBid1 } = require('../middleware/auth');
const threadsService = require('../services/ThreadsService');

const router = express.Router();

router.get('/', requireAuthForBid1, async (req, res) => {
  try {
    const { bid, tid, p, p_size } = req.query;

    if (!bid) {
      return res.status(400).json({ message: '缺少必填参数bid' });
    }

    const bidInt = parseInt(bid);
    if (isNaN(bidInt)) {
      return res.status(400).json({ message: 'bid参数不是有效的整数' });
    }

    if (tid) {
      const tidInt = parseInt(tid);
      if (isNaN(tidInt)) {
        return res.status(400).json({ message: 'tid参数不是有效的整数' });
      }

      const thread = await threadsService.getThreadByBidAndTid(bidInt, tidInt);
      return res.json({
        message: '获取主题帖信息成功',
        data: thread
      });
    }

    const page = parseInt(p) || 1;
    const pageSize = parseInt(p_size) || 10;
    let extr = req.query.extr !== undefined ? parseInt(req.query.extr) : 0;
    if (isNaN(extr)) {
      extr = 0;
    }
    const sortBy = req.query.sort_by || 'default';

    const result = await threadsService.getThreadsList(bidInt, { page, pageSize, extr, sortBy });
    res.json({
      message: '获取主题帖列表成功',
      data: result
    });
  } catch (error) {
    if (error.message === '主题帖不存在') {
      return res.status(404).json({ message: error.message });
    }
    console.error('获取主题帖列表或单个主题帖失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const threads = await threadsService.getRecentThreadsByAuthor(username, limit);
    res.json({
      message: '获取用户最近发帖成功',
      data: threads
    });
  } catch (error) {
    console.error('获取用户最近发帖失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:bid/:tid', requireAuthForBid1, async (req, res) => {
  try {
    const { bid, tid } = req.params;
    const bidInt = parseInt(bid);
    const tidInt = parseInt(tid);

    if (isNaN(bidInt) || isNaN(tidInt)) {
      return res.status(400).json({ message: 'bid或tid参数不是有效的整数' });
    }

    const thread = await threadsService.getThreadByBidAndTid(bidInt, tidInt);
    res.json({
      message: '获取主题帖信息成功',
      data: thread
    });
  } catch (error) {
    if (error.message === '主题帖不存在') {
      return res.status(404).json({ message: error.message });
    }
    console.error('获取主题帖信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/hot/all', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const threads = await threadsService.getHotThreads(limit);
    res.json({
      message: '获取热门帖子成功',
      data: threads
    });
  } catch (error) {
    console.error('获取热门帖子失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.hotnum) || 10;
    const threads = await threadsService.getHotThreadsWithoutGlobalTop(limit);
    res.json({
      message: '获取热门帖子成功',
      data: threads
    });
  } catch (error) {
    console.error('获取热门帖子失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/global_top', async (req, res) => {
  try {
    const threads = await threadsService.getGlobalTopThreads();
    res.json({
      message: '获取全局置顶帖子成功',
      data: threads
    });
  } catch (error) {
    console.error('获取全局置顶帖子失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
