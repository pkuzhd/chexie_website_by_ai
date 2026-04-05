const express = require('express');
const { requireAuthForBid1 } = require('../middleware/auth');
const postsService = require('../services/PostsService');

const router = express.Router();

router.get('/', requireAuthForBid1, async (req, res) => {
  try {
    const { bid, tid, p, p_size, pid } = req.query;

    if (!bid || !tid) {
      return res.status(400).json({ message: '缺少必填参数bid或tid' });
    }

    const bidInt = parseInt(bid);
    const tidInt = parseInt(tid);

    if (isNaN(bidInt) || isNaN(tidInt)) {
      return res.status(400).json({ message: 'bid或tid参数不是有效的整数' });
    }

    if (pid !== undefined && pid !== null && pid !== '') {
      const pidInt = parseInt(pid);
      if (isNaN(pidInt)) {
        return res.status(400).json({ message: 'pid参数不是有效的整数' });
      }

      const post = await postsService.getPostByBidAndTidAndPid(bidInt, tidInt, pidInt);
      return res.json({
        message: '获取帖子信息成功',
        data: post
      });
    }

    const page = parseInt(p) || 1;
    const pageSize = parseInt(p_size) || 12;

    const result = await postsService.getPostsList(bidInt, tidInt, { page, pageSize });
    res.json({
      message: '获取帖子列表成功',
      data: result
    });
  } catch (error) {
    if (error.message === '帖子不存在') {
      return res.status(404).json({ message: error.message });
    }
    console.error('获取帖子列表或单个帖子失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:bid/:tid/:pid', requireAuthForBid1, async (req, res) => {
  try {
    const { bid, tid, pid } = req.params;
    const bidInt = parseInt(bid);
    const tidInt = parseInt(tid);
    const pidInt = parseInt(pid);

    if (isNaN(bidInt) || isNaN(tidInt) || isNaN(pidInt)) {
      return res.status(400).json({ message: 'bid、tid或pid参数不是有效的整数' });
    }

    const post = await postsService.getPostByBidAndTidAndPid(bidInt, tidInt, pidInt);
    res.json({
      message: '获取帖子信息成功',
      data: post
    });
  } catch (error) {
    if (error.message === '帖子不存在') {
      return res.status(404).json({ message: error.message });
    }
    console.error('获取帖子信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:fid', async (req, res) => {
  try {
    const { fid } = req.params;
    const fidInt = parseInt(fid);

    if (isNaN(fidInt)) {
      return res.status(400).json({ message: 'fid参数不是有效的整数' });
    }

    const post = await postsService.getPostByFid(fidInt);
    res.json({
      message: '获取帖子信息成功',
      data: post
    });
  } catch (error) {
    if (error.message === '帖子不存在') {
      return res.status(404).json({ message: error.message });
    }
    console.error('获取帖子信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
