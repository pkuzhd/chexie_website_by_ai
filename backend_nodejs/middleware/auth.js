// 权限控制中间件
// 当bid=1时，需要验证用户是否已登录

const jwt = require('jsonwebtoken');
const UserInfo = require('../models/UserInfo');

// 从请求中获取bid参数（支持查询参数和路径参数）
function getBid(req) {
  // 首先尝试从路径参数获取
  if (req.params && req.params.bid) {
    return req.params.bid;
  }
  // 然后尝试从查询参数获取
  if (req.query && req.query.bid) {
    return req.query.bid;
  }
  // 如果没有bid参数，返回null
  return null;
}

// 权限验证中间件：当bid=1时需要登录
async function requireAuthForBid1(req, res, next) {
  try {
    const bid = getBid(req);
    
    // 如果没有bid参数，直接通过（后续路由处理会验证）
    if (!bid) {
      return next();
    }
    
    // 验证bid是否为1
    const bidInt = parseInt(bid);
    if (bidInt === 1) {
      // 需要登录验证
      
      // 从请求头获取token
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        return res.status(401).json({ message: 'bid=1时需要登录，请提供认证令牌' });
      }

      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'bid=1时需要登录，请提供认证令牌' });
      }

      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 根据用户ID查询用户信息
      const user = await UserInfo.findOne({
        where: { userid: decoded.userid },
        attributes: ['userid', 'username', 'token']
      });

      if (!user) {
        return res.status(401).json({ message: 'bid=1时需要登录，用户不存在' });
      }

      // 检查token是否匹配或已被清除
      if (!user.token || user.token !== token) {
        return res.status(401).json({ message: 'bid=1时需要登录，认证失败或令牌过期' });
      }
      
      // 将用户信息添加到请求对象中，供后续使用
      req.user = {
        userid: user.userid,
        username: user.username
      };
    }
    
    // 继续处理请求
    next();
  } catch (error) {
    console.error('权限验证失败:', error);
    res.status(401).json({ message: 'bid=1时需要登录，认证失败或令牌过期' });
  }
}

module.exports = { requireAuthForBid1 };
