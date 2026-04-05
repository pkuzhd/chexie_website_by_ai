const crypto = require('crypto');
const userInfoRepository = require('../repositories/UserInfoRepository');

const VALID_TIME = 3600;

class AuthLegacyService {
  getClientIp(req) {
    let ip = req.headers['x-forwarded-for'] ||
             req.headers['x-real-ip'] ||
             req.ip ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.connection.socket.remoteAddress ||
             '';

    if (ip === '::1') {
      ip = '127.0.0.1';
    } else if (ip.includes('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    return ip;
  }

  async login(username, password, md5, onlinetype, browser, system, clientIp) {
    let processedPassword = password;
    if (md5 === 'yes') {
      processedPassword = password;
    } else {
      processedPassword = crypto.createHash('md5').update(password).digest('hex');
    }

    const user = await userInfoRepository.findByUsername(username);
    if (!user) {
      return {
        code: 1,
        msg: '用户不存在。'
      };
    }

    if (user.password.toUpperCase() !== processedPassword.toUpperCase()) {
      return {
        code: 2,
        msg: '密码错误。'
      };
    }

    const nowtime = Math.floor(Date.now() / 1000);
    let token;

    const existingUser = await userInfoRepository.findByUsernameAndValidTokenTime(username, VALID_TIME);
    if (existingUser) {
      token = existingUser.token;
    } else {
      token = crypto.createHash('md5').update(username + nowtime).digest('hex');
    }

    const today = new Date().toISOString().split('T')[0];
    let logininfo = '';
    if (onlinetype === 'web') {
      logininfo = browser || '';
    } else if (onlinetype === 'android' || onlinetype === 'ios') {
      logininfo = system || '';
    }

    await userInfoRepository.updateLoginInfo(
      user.userid,
      token,
      nowtime,
      clientIp,
      today,
      onlinetype || null,
      logininfo
    );

    return {
      code: 0,
      username: user.username,
      token
    };
  }

  async logout(token, clientIp) {
    const user = await userInfoRepository.findByTokenAndValidTokenTime(token, VALID_TIME);
    if (!user) {
      return {
        code: 2,
        msg: '无效的token'
      };
    }

    const today = new Date().toISOString().split('T')[0];
    await userInfoRepository.updateLogoutInfo(user.userid, clientIp, today);

    return {
      code: 0,
      msg: '登出成功'
    };
  }

  async getCurrentUser(token) {
    if (!token) {
      return {
        username: '',
        rights: 0,
        icon: '',
        score: 0,
        star: 0,
        newmsg: 0
      };
    }

    const user = await userInfoRepository.findByTokenAndValidTokenTime(token, VALID_TIME);
    if (!user) {
      return {
        username: '',
        rights: 0,
        icon: '',
        score: 0,
        star: 0,
        newmsg: 0
      };
    }

    return {
      username: user.username,
      rights: user.rights || 0,
      icon: user.icon || '',
      score: user.score || 0,
      star: user.star || 0,
      newmsg: user.newmsg || 0
    };
  }
}

module.exports = new AuthLegacyService();
