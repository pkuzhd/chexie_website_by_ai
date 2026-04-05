const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userInfoRepository = require('../repositories/UserInfoRepository');
const env = require('../config/env');

class AuthService {
  async login(username, password) {
    const user = await userInfoRepository.findByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const md5Password = crypto.createHash('md5').update(password).digest('hex');
    if (user.password !== md5Password) {
      throw new Error('用户名或密码错误');
    }

    const token = jwt.sign(
      { userid: user.userid, username: user.username },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const tokentime = Date.now();
    await userInfoRepository.updateTokenAndTime(user.userid, token, tokentime);

    return {
      token,
      user: {
        userid: user.userid,
        username: user.username,
        email: user.mail,
        sex: user.sex,
        icon: user.icon,
        intro: user.intro
      }
    };
  }

  async getCurrentUser(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('令牌已过期');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('无效令牌');
      }
      throw error;
    }

    const user = await userInfoRepository.findByUserid(decoded.userid, [
      'userid', 'username', 'mail', 'sex', 'icon', 'intro', 'regdate', 'post', 'reply', 'score', 'token'
    ]);

    if (!user) {
      throw new Error('用户不存在');
    }

    if (!user.token || user.token !== token) {
      throw new Error('认证失败或令牌过期');
    }

    const { token: _, ...userInfo } = user.toJSON();
    return userInfo;
  }

  async logout(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('令牌已过期');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('无效令牌');
      }
      throw error;
    }

    const user = await userInfoRepository.findByUserid(decoded.userid);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (!user.token || user.token !== token) {
      throw new Error('认证失败或令牌过期');
    }

    await userInfoRepository.clearTokenAndTime(decoded.userid);
  }
}

module.exports = new AuthService();
