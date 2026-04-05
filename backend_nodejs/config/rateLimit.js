const rateLimit = require('express-rate-limit');
const env = require('./env');

const isProduction = env.NODE_ENV === 'production';

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

const generalLimiter = createRateLimiter({
  limit: env.RATE_LIMIT_GENERAL_MAX,
  message: {
    message: '请求过于频繁，请稍后再试',
    error: 'Too Many Requests',
    statusCode: 429
  },
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res, next, options) => {
    if (!isProduction) {
      console.log(`[Rate Limit] 触发限流: IP=${req.ip}, Window=${options.windowMs}ms`);
    }
    res.status(options.statusCode).json(options.message);
  },
  skip: () => !isProduction && env.DEBUG
});

const authLimiter = createRateLimiter({
  limit: env.RATE_LIMIT_AUTH_MAX,
  message: {
    message: '登录尝试过于频繁，请 15 分钟后再试',
    error: 'Too Many Login Attempts',
    statusCode: 429
  },
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res, next, options) => {
    if (!isProduction) {
      console.log(`[Rate Limit] 登录触发限流: IP=${req.ip}, Window=${options.windowMs}ms`);
    }
    res.status(options.statusCode).json(options.message);
  },
  skip: () => !isProduction && env.DEBUG
});

module.exports = {
  generalLimiter,
  authLimiter
};
