const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/AuthService');

const router = express.Router();

router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const result = await authService.login(username, password);

    res.json({
      message: '登录成功',
      ...result
    });
  } catch (error) {
    if (error.message === '用户名或密码错误') {
      return res.status(401).json({ message: error.message });
    }
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/current', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const userInfo = await authService.getCurrentUser(token);
    res.json(userInfo);
  } catch (error) {
    if (error.message === '用户不存在' || error.message === '认证失败或令牌过期') {
      return res.status(401).json({ message: error.message });
    }
    console.error('获取用户信息失败:', error);
    res.status(401).json({ message: '认证失败或令牌过期' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    await authService.logout(token);
    res.json({ message: '登出成功' });
  } catch (error) {
    if (error.message === '用户不存在' || error.message === '认证失败或令牌过期') {
      return res.status(401).json({ message: error.message });
    }
    console.error('登出失败:', error);
    res.status(401).json({ message: '认证失败或令牌过期' });
  }
});

module.exports = router;
