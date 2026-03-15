const express = require('express');
const crypto = require('crypto');
const { Op } = require('sequelize');
const UserInfo = require('../models/UserInfo');

const router = express.Router();

// 配置常量
const VALID_TIME = 3600; // token有效期（秒）

// 1. 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password, md5, onlinetype, browser, system } = req.body;
    // 获取客户端IP地址，支持代理情况
    let ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             req.connection.socket.remoteAddress || 
             '';
    
    // 处理IPv6地址格式
    if (ip === '::1') {
      ip = '127.0.0.1';
    } else if (ip.includes('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    
    // 处理密码加密
    let processedPassword = password;
    if (md5 === 'yes') {
      processedPassword = password; // 已加密
    } else {
      processedPassword = crypto.createHash('md5').update(password).digest('hex');
    }
    
    // 查找用户
    const user = await UserInfo.findOne({
      where: { username }
    });
    
    if (!user) {
      return res.json({
        code: 1,
        msg: '用户不存在。'
      });
    }
    
    // 验证密码（忽略大小写）
    if (user.password.toUpperCase() !== processedPassword.toUpperCase()) {
      return res.json({
        code: 2,
        msg: '密码错误。'
      });
    }
    
    // 生成或使用现有token
    const nowtime = Math.floor(Date.now() / 1000);
    let token;
    
    // 检查是否有有效token
    const existingUser = await UserInfo.findOne({
      where: {
        username,
        tokentime: {
          [Op.gt]: nowtime - VALID_TIME
        }
      }
    });
    
    if (existingUser) {
      token = existingUser.token;
    } else {
      token = crypto.createHash('md5').update(username + nowtime).digest('hex');
    }
    
    // 准备登录信息
    const today = new Date().toISOString().split('T')[0];
    let logininfo = '';
    if (onlinetype === 'web') {
      logininfo = browser || '';
    } else if (onlinetype === 'android' || onlinetype === 'ios') {
      logininfo = system || '';
    }
    
    // 更新用户信息
    await user.update({
      tokentime: nowtime,
      token,
      nowboard: null,
      lastip: ip,
      lastdate: today,
      onlinetype: onlinetype || null,
      logininfo
    });
    
    // 检查是否需要签到
    const time = Math.floor(Date.now() / 1000);
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    
    // 这里需要实现签到逻辑，假设使用单独的sign表
    // 由于没有提供sign表模型，这里暂时跳过签到逻辑
    // 实际实现时需要创建sign表模型并执行相应的插入和更新操作
    
    // 计算cookie过期时间（24小时）
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 1);
    
    // 设置cookie
    res.cookie('token', token, {
      // domain: '.chexie.net',
      domain: 'localhost',
      expires: expiresDate,
      path: '/',
      httpOnly: true,
      secure: false // 在开发环境中设置为false，生产环境应设置为true
    });
    
    // 返回成功响应
    res.json({
      code: 0,
      username: user.username,
      token
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: -1,
      msg: '服务器错误'
    });
  }
});

// 2. 登出接口
router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    // 获取客户端IP地址，支持代理情况
    let ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             req.connection.socket.remoteAddress || 
             '';
    
    // 处理IPv6地址格式
    if (ip === '::1') {
      ip = '127.0.0.1';
    } else if (ip.includes('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    
    if (!token) {
      return res.status(400).json({
        code: 1,
        msg: '未提供token'
      });
    }
    
    // 查找用户
    const user = await UserInfo.findOne({
      where: { token }
    });
    
    if (!user) {
      return res.status(401).json({
        code: 2,
        msg: '无效的token'
      });
    }
    
    // 更新用户信息
    const today = new Date().toISOString().split('T')[0];
    await user.update({
      tokentime: null,
      token: null,
      nowboard: null,
      lastip: ip,
      lastdate: today
    });
    
    // 返回成功响应
    res.json({
      code: 0,
      msg: '登出成功'
    });
    
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({
      code: -1,
      msg: '服务器错误'
    });
  }
});

// 3. 获取用户信息接口
router.get('/current', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.json({
        username: '',
        rights: 0
      });
    }
    
    // 验证token
    const nowtime = Math.floor(Date.now() / 1000);
    const user = await UserInfo.findOne({
      where: {
        token,
        tokentime: {
          [Op.gt]: nowtime - VALID_TIME
        }
      },
      attributes: ['username', 'rights']
    });
    
    if (!user) {
      return res.json({
        username: '',
        rights: 0
      });
    }
    
    // 返回用户信息
    res.json({
      username: user.username,
      rights: user.rights || 0
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.json({
      username: '',
      rights: 0
    });
  }
});

module.exports = router;