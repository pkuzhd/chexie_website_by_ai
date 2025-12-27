const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const UserInfo = require('../models/UserInfo');

const router = express.Router();

// 1. 登录接口
router.post('/login', [
  // 表单验证
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    // 检查验证结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // 查找用户
    const user = await UserInfo.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码（数据库中存储的是MD5加密的密码）
    const md5Password = crypto.createHash('md5').update(password).digest('hex');
    if (user.password !== md5Password) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userid: user.userid, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 更新用户的token和tokentime
    const tokentime = Date.now();
    await user.update({
      token,
      tokentime
    });

    // 返回令牌和用户信息
    res.json({
      message: '登录成功',
      token,
      user: {
        userid: user.userid,
        username: user.username,
        email: user.mail,
        sex: user.sex,
        icon: user.icon,
        intro: user.intro
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 2. 获取当前用户信息接口（需要认证）
router.get('/current', async (req, res) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 根据用户ID查询用户信息，包括token字段
    const user = await UserInfo.findOne({
      where: { userid: decoded.userid },
      attributes: ['userid', 'username', 'mail', 'sex', 'icon', 'intro', 'regdate', 'post', 'reply', 'score', 'token']
    });

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    // 检查token是否匹配或已被清除
    if (!user.token || user.token !== token) {
      return res.status(401).json({ message: '认证失败或令牌过期' });
    }

    // 从响应中移除token字段
    const { token: _, ...userInfo } = user.toJSON();
    res.json(userInfo);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(401).json({ message: '认证失败或令牌过期' });
  }
});

// 3. 登出接口（需要认证）
router.post('/logout', async (req, res) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 根据用户ID查询用户
    const user = await UserInfo.findOne({
      where: { userid: decoded.userid }
    });

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    // 验证请求中的token是否与数据库中存储的token一致
    if (!user.token || user.token !== token) {
      return res.status(401).json({ message: '认证失败或令牌过期' });
    }

    // 将用户的token和tokentime更新为NULL
    await user.update({
      token: null,
      tokentime: null
    });

    res.json({ message: '登出成功' });
  } catch (error) {
    console.error('登出失败:', error);
    res.status(401).json({ message: '认证失败或令牌过期' });
  }
});

module.exports = router;