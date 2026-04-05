const express = require('express');
const authLegacyService = require('../services/AuthLegacyService');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password, md5, onlinetype, browser, system } = req.body;
    const clientIp = authLegacyService.getClientIp(req);

    const result = await authLegacyService.login(username, password, md5, onlinetype, browser, system, clientIp);

    if (result.code === 0) {
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + 1);

      res.cookie('token', result.token, {
        domain: 'localhost',
        expires: expiresDate,
        path: '/',
        httpOnly: true,
        secure: false
      });
    }

    res.json(result);
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: -1,
      msg: '服务器错误'
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    const clientIp = authLegacyService.getClientIp(req);

    if (!token) {
      return res.status(400).json({
        code: 1,
        msg: '未提供token'
      });
    }

    const result = await authLegacyService.logout(token, clientIp);

    if (result.code === 2) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({
      code: -1,
      msg: '服务器错误'
    });
  }
});

router.get('/current', async (req, res) => {
  try {
    const token = req.cookies.token;
    const result = await authLegacyService.getCurrentUser(token);
    res.json(result);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.json({
      username: '',
      rights: 0,
      icon: '',
      score: 0,
      star: 0,
      newmsg: 0
    });
  }
});

module.exports = router;
