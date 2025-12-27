const express = require('express');
const UserInfo = require('../models/UserInfo');

const router = express.Router();

// 2. 查看多个用户的信息（JSON格式查询，不需要登录）
router.post('/', async (req, res) => {
  try {
    const { usernames } = req.body;
    
    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ message: '请提供JSON格式的用户名列表，格式：{"usernames": ["user1", "user2", "user,name"]}' });
    }
    
    // 查询多个用户信息，只返回公开信息（不包含userid）
    const users = await UserInfo.findAll({
      where: { 
        username: usernames 
      },
      attributes: ['username', 'sex', 'icon', 'intro', 'regdate', 'post', 'reply', 'score']
    });
    
    // 以用户名为key组织返回结果
    const result = {};
    const foundUsernames = new Set();
    
    users.forEach(user => {
      result[user.username] = user;
      foundUsernames.add(user.username);
    });
    
    // 找出不存在的用户
    const notFoundUsers = usernames.filter(username => !foundUsernames.has(username));
    
    res.json({
      message: '获取用户列表成功',
      data: result,
      notFound: notFoundUsers
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 1. 查看单个用户的信息（不需要登录）
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await UserInfo.findOne({
      where: { username },
      attributes: ['username', 'sex', 'icon', 'intro', 'regdate', 'post', 'reply', 'score']
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 以用户名为key返回信息
    const result = {};
    result[username] = user;
    
    res.json({
      message: '获取用户信息成功',
      data: result
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;