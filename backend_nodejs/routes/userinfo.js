const express = require('express');
const userInfoService = require('../services/UserInfoService');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { usernames } = req.body;

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ message: '请提供JSON格式的用户名列表，格式：{"usernames": ["user1", "user2", "user,name"]}' });
    }

    const result = await userInfoService.getUsersByUsernames(usernames);
    res.json({
      message: '获取用户列表成功',
      ...result
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await userInfoService.getUserByUsername(username);
    res.json({
      message: '获取用户信息成功',
      data: result
    });
  } catch (error) {
    if (error.message === '用户不存在') {
      return res.status(404).json({ message: error.message });
    }
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
