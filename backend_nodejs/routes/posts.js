const express = require('express');
const Posts = require('../models/Posts');

const router = express.Router();

// 1. 通过查询参数bid、tid、p、p_size获取分页帖子信息（p_size默认为12）；同时支持通过bid、tid和pid获取单个楼层信息（接口合并）
async function getPosts(req, res) {
  try {
    const { bid, tid, p, p_size, pid } = req.query;
    
    // 验证必填参数
    if (!bid || !tid) {
      return res.status(400).json({ message: '缺少必填参数bid或tid' });
    }
    
    // 验证参数是否为有效的整数
    const bidInt = parseInt(bid);
    const tidInt = parseInt(tid);
    
    if (isNaN(bidInt) || isNaN(tidInt)) {
      return res.status(400).json({ message: 'bid或tid参数不是有效的整数' });
    }
    
    // 如果提供了pid参数，则返回单个楼层信息
    if (pid !== undefined && pid !== null && pid !== '') {
      const pidInt = parseInt(pid);
      if (isNaN(pidInt)) {
        return res.status(400).json({ message: 'pid参数不是有效的整数' });
      }
      
      const post = await Posts.findOne({
        where: { bid: bidInt, tid: tidInt, pid: pidInt }
      });
      
      if (!post) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      
      res.json({
        message: '获取帖子信息成功',
        data: post
      });
    } else {
      // 处理分页参数，默认值
      const page = parseInt(p) || 1;
      const pageSize = parseInt(p_size) || 12; // p_size默认为12
      const offset = (page - 1) * pageSize;
      
      // 查询帖子信息
      const posts = await Posts.findAll({
        where: { bid: bidInt, tid: tidInt },
        limit: pageSize,
        offset: offset,
        order: [['fid', 'ASC']] // 按楼层ID升序排列，先发表的楼层在前
      });
      
      // 获取总记录数
      const total = await Posts.count({
        where: { bid: bidInt, tid: tidInt }
      });
      
      res.json({
        message: '获取帖子列表成功',
        data: {
          posts,
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
    console.error('获取帖子列表或单个帖子失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

// 3. 通过路径参数/:bid/:tid/:pid访问单个楼层的信息
async function getPostByPathParams(req, res) {
  try {
    const { bid, tid, pid } = req.params;
    
    // 验证参数是否为有效的整数
    const bidInt = parseInt(bid);
    const tidInt = parseInt(tid);
    const pidInt = parseInt(pid);
    
    if (isNaN(bidInt) || isNaN(tidInt) || isNaN(pidInt)) {
      return res.status(400).json({ message: 'bid、tid或pid参数不是有效的整数' });
    }
    
    const post = await Posts.findOne({
      where: { bid: bidInt, tid: tidInt, pid: pidInt }
    });
    
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    
    res.json({
      message: '获取帖子信息成功',
      data: post
    });
  } catch (error) {
    console.error('获取帖子信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

// 2. 通过fid访问单个楼层的信息
async function getPostByFid(req, res) {
  try {
    const { fid } = req.params;
    
    // 验证参数是否为有效的整数
    const fidInt = parseInt(fid);
    
    if (isNaN(fidInt)) {
      return res.status(400).json({ message: 'fid参数不是有效的整数' });
    }
    
    const post = await Posts.findOne({
      where: { fid: fidInt }
    });
    
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    
    res.json({
      message: '获取帖子信息成功',
      data: post
    });
  } catch (error) {
    console.error('获取帖子信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

// 路由定义集中放置
router.get('/', getPosts);
router.get('/:bid/:tid/:pid', getPostByPathParams);
router.get('/:fid', getPostByFid);

module.exports = router;