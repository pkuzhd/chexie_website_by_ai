require('./config/env');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// 导入数据库连接
const sequelize = require('./config/db');

// 导入配置
const corsOptions = require('./config/cors');

// 导入路由
const authRoutes = require('./routes/auth');
const authLegacyRoutes = require('./routes/auth_legacy');
const boardinfoRoutes = require('./routes/boardinfo');
const userinfoRoutes = require('./routes/userinfo');
const threadsRoutes = require('./routes/threads');
const postsRoutes = require('./routes/posts');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(express.json());
app.use(compression());
app.use(cookieParser());
app.use(cors(corsOptions));

// 定义/test接口
app.get('/test', (req, res) => {
  res.json({ result: 'test' });
});

// 使用认证路由
app.use('/api/auth', authRoutes);

// 使用传统认证路由（兼容PHP风格）
app.use('/api/auth_legacy', authLegacyRoutes);

// 使用板块信息路由
app.use('/api/boardinfo', boardinfoRoutes);

// 使用用户信息路由
app.use('/api/userinfo', userinfoRoutes);

// 使用主题帖路由
app.use('/api/threads', threadsRoutes);

// 使用帖子路由
app.use('/api/posts', postsRoutes);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
